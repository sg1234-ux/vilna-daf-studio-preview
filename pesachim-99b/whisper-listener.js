// Vilna Daf Studio — Hebrew Whisper listener (TEST build, Pesachim 99b).
// Keeps the microphone recording continuously, cuts the audio at the student's pauses into chunks of
// about two lines (~6–8 s), and transcribes each chunk in a Web Worker while the student keeps reading.
// Grades therefore appear about one chunk behind the reader. If transcription is slower than reading,
// chunks wait in a queue and are all graded before the session finishes.
(function () {
  const TARGET_RATE = 16000;
  const FRAME = 480;                // 30 ms analysis frames at 16 kHz
  const CHUNK = { minSeconds: 5, pauseSeconds: 0.3, longPauseAfter: 9, longPauseSeconds: 0.15, maxSeconds: 12, keepLeadSilence: 0.4, mergeSeconds: 28 };

  class WhisperListener {
    constructor(callbacks = {}) {
      this.cb = callbacks;
      this.worker = null; this.ready = null; this.info = {};
      this.queue = []; this.inFlight = null; this.nextId = 1; this.pending = new Map();
      this.capturing = false;
    }
    static isSupported() {
      return Boolean(window.Worker && window.AudioWorkletNode && navigator.mediaDevices?.getUserMedia && window.caches);
    }
    ensureModel({ device } = {}) {
      if (this.ready) return this.ready;
      const url = new URL("whisper-worker.js?build=whisper-test-1", document.baseURI);
      this.worker = new Worker(url, { type: "module" });
      this.ready = new Promise((resolve, reject) => {
        this.worker.onerror = (e) => { reject(new Error(e.message || "The listener could not start.")); };
        this.worker.onmessage = (event) => {
          const msg = event.data;
          if (msg.type === "plan") { Object.assign(this.info, msg); this.cb.onPlan?.(msg); }
          else if (msg.type === "progress") this.cb.onProgress?.(msg);
          else if (msg.type === "ready") { Object.assign(this.info, msg); this.cb.onReady?.(msg); resolve(msg); }
          else if (msg.type === "error" && msg.stage === "load") { this.ready = null; reject(new Error(msg.message)); }
          else this._onWorkerMessage(msg);
        };
      });
      this.worker.postMessage({ type: "load", device });
      return this.ready;
    }

    // source: {stream} for the microphone, or {file} to grade a recording (played in real time).
    async start({ getPrompt, file } = {}) {
      this.getPrompt = getPrompt || (() => "");
      this.session = (this.session || 0) + 1; this.aborted = false; this.queue = [];
      this.samples = []; this.sampleCount = 0;             // 16 kHz audio since the last cut
      this.frameRms = [];                                    // RMS per 30 ms frame since the last cut
      this.carry = new Float32Array(0); this.resamplePos = 0;
      this.noiseFloor = 0.004; this.speechFramesInChunk = 0;
      this.totalChunks = 0; this.doneChunks = 0; this.timings = [];
      this.context = new AudioContext();
      await this.context.audioWorklet.addModule(new URL("reading-capture-worklet.js?build=whisper-test-1", document.baseURI));
      this.node = new AudioWorkletNode(this.context, "reading-capture");
      this.node.port.onmessage = (e) => this._onSamples(e.data);
      if (file) {
        this.audioEl = new Audio(URL.createObjectURL(file));
        this.source = this.context.createMediaElementSource(this.audioEl);
        this.source.connect(this.context.destination);
        this.fileEnded = new Promise((resolve) => this.audioEl.addEventListener("ended", resolve, { once: true }));
      } else {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: false, noiseSuppression: true, autoGainControl: true } });
        this.source = this.context.createMediaStreamSource(this.stream);
      }
      this.source.connect(this.node);
      const mute = this.context.createGain(); mute.gain.value = 0; this.node.connect(mute).connect(this.context.destination);
      if (this.context.state === "suspended") await this.context.resume();
      this.capturing = true;
      if (this.audioEl) await this.audioEl.play();
    }

    // Stop recording, send the last piece, and resolve once every queued chunk has been graded.
    async stop() {
      if (this.capturing) {
        this.capturing = false;
        try { this.audioEl?.pause(); } catch {}
        this.stream?.getTracks().forEach((t) => t.stop());
        try { this.source?.disconnect(); this.node?.disconnect(); } catch {}
        this._cut(this.sampleCount, true);
        try { await this.context?.close(); } catch {}
      }
      while (this.queue.length || this.inFlight) await new Promise((r) => setTimeout(r, 100));
    }
    abort() {
      this.capturing = false; this.queue = []; this.aborted = true;
      try { this.audioEl?.pause(); } catch {}
      this.stream?.getTracks().forEach((t) => t.stop());
      try { this.context?.close(); } catch {}
    }

    _onSamples(input) {
      if (!this.capturing) return;
      const rate = this.context.sampleRate, step = rate / TARGET_RATE;
      // Downsample to 16 kHz by averaging the input samples that fall into each output sample.
      const src = this.carry.length ? (() => { const a = new Float32Array(this.carry.length + input.length); a.set(this.carry); a.set(input, this.carry.length); return a; })() : input;
      const outLength = Math.floor((src.length - this.resamplePos) / step);
      const out = new Float32Array(Math.max(0, outLength));
      let pos = this.resamplePos;
      for (let i = 0; i < out.length; i++) {
        const a = Math.floor(pos), b = Math.min(src.length, Math.floor(pos + step)); let sum = 0;
        for (let k = a; k < b; k++) sum += src[k];
        out[i] = b > a ? sum / (b - a) : src[a] || 0; pos += step;
      }
      const used = Math.floor(pos);
      this.carry = src.slice(used); this.resamplePos = pos - used;
      this._append(out);
    }

    _append(out) {
      this.samples.push(out); this.sampleCount += out.length;
      // Analyse complete 30 ms frames.
      const flat = this._flat();
      const firstNew = this.frameRms.length * FRAME;
      for (let start = firstNew; start + FRAME <= flat.length; start += FRAME) {
        let s = 0; for (let i = start; i < start + FRAME; i++) s += flat[i] * flat[i];
        const rms = Math.sqrt(s / FRAME); this.frameRms.push(rms);
        // Slowly track the background level; speech is anything clearly above it.
        this.noiseFloor = rms < this.noiseFloor ? this.noiseFloor * 0.9 + rms * 0.1 : this.noiseFloor * 0.999 + rms * 0.001;
      }
      this._maybeCut();
    }
    _flat() {
      if (this.samples.length === 1) return this.samples[0];
      const a = new Float32Array(this.sampleCount); let o = 0;
      for (const s of this.samples) { a.set(s, o); o += s.length; }
      this.samples = [a]; return a;
    }
    _threshold() { return Math.max(0.012, this.noiseFloor * 3); }
    _maybeCut() {
      const thr = this._threshold(), frames = this.frameRms, fps = TARGET_RATE / FRAME;
      const seconds = this.sampleCount / TARGET_RATE;
      let speech = 0; for (const r of frames) if (r > thr) speech++;
      // Before the student starts, drop old silence so it is not sent to the model.
      if (speech < 3 && seconds > 2) { this._dropStart(Math.floor((seconds - CHUNK.keepLeadSilence) * TARGET_RATE / FRAME) * FRAME); return; }
      if (seconds < CHUNK.minSeconds) return;
      // Length of the pause the student is in right now.
      let quiet = 0; for (let i = frames.length - 1; i >= 0 && frames[i] <= thr; i--) quiet++;
      const pause = quiet / fps;
      const wanted = seconds >= CHUNK.longPauseAfter ? CHUNK.longPauseSeconds : CHUNK.pauseSeconds;
      if (pause >= wanted) { this._cut((frames.length - Math.floor(quiet / 2)) * FRAME); return; }
      if (seconds >= CHUNK.maxSeconds) {
        // No pause: cut at the quietest frame of the last 3 seconds.
        const from = Math.max(0, frames.length - Math.round(3 * fps)); let best = from;
        for (let i = from; i < frames.length; i++) if (frames[i] < frames[best]) best = i;
        this._cut(best * FRAME + FRAME / 2);
      }
    }
    _dropStart(n) {
      if (n <= 0) return; const flat = this._flat();
      this.samples = [flat.slice(n)]; this.sampleCount = flat.length - n; this.frameRms = this.frameRms.slice(n / FRAME);
    }
    _cut(at, final = false) {
      const flat = this._flat(); at = Math.min(at, flat.length);
      const audio = flat.slice(0, at), thr = this._threshold();
      const usedFrames = Math.floor(at / FRAME), speechFrames = this.frameRms.slice(0, Math.max(usedFrames, final ? this.frameRms.length : 0)).filter((r) => r > thr).length;
      this.samples = [flat.slice(at)]; this.sampleCount = flat.length - at;
      this.frameRms = this.frameRms.slice(usedFrames);
      if (speechFrames < 8 || audio.length < TARGET_RATE * 0.5) return; // nothing said in this piece
      const id = this.nextId++; this.totalChunks++;
      this.queue.push({ id, audio, session: this.session });
      this.cb.onQueue?.(this._status());
      this._pump();
    }
    _status() { return { waiting: this.queue.length + (this.inFlight ? 1 : 0), done: this.doneChunks, total: this.totalChunks, timings: this.timings }; }
    _pump() {
      if (this.inFlight || !this.queue.length || this.aborted) return;
      let chunk = this.queue.shift();
      // Catching up: when more chunks are already waiting, send them together (up to ~28 s, Whisper's window).
      // The model costs about the same for 6 s or 28 s of audio, so this clears a backlog several times faster.
      if (this.queue.length && this.queue[0].session === chunk.session) {
        const parts = [chunk]; let length = chunk.audio.length;
        while (this.queue.length && this.queue[0].session === chunk.session && length + this.queue[0].audio.length <= TARGET_RATE * CHUNK.mergeSeconds) { const next = this.queue.shift(); parts.push(next); length += next.audio.length; }
        if (parts.length > 1) {
          const audio = new Float32Array(length); let o = 0; for (const p of parts) { audio.set(p.audio, o); o += p.audio.length; }
          chunk = { id: parts.map((p) => p.id).join("+"), audio, session: chunk.session, merged: parts.length };
        }
      }
      this.inFlight = chunk;
      // The hint is computed now, after every earlier chunk has been graded, so it starts where the reader is.
      const prompt = this.getPrompt({ audioSeconds: chunk.audio.length / TARGET_RATE, queuedAhead: 0 }) || "";
      chunk.prompt = prompt;
      this.worker.postMessage({ type: "transcribe", id: chunk.id, audio: chunk.audio, prompt }, [chunk.audio.buffer]);
    }
    _onWorkerMessage(msg) {
      if (msg.type === "result" || (msg.type === "error" && msg.stage === "transcribe")) {
        const chunk = this.inFlight; this.inFlight = null;
        if (chunk && chunk.session !== this.session) { this._pump(); return; } // from a session that was reset
        if (msg.type === "result") {
          this.doneChunks += chunk?.merged || 1; this.timings.push({ audioSeconds: msg.audioSeconds, seconds: msg.seconds, merged: chunk?.merged || 1 });
          if (!this.aborted) this.cb.onText?.({ id: msg.id, text: msg.text, prompt: chunk?.prompt, audioSeconds: msg.audioSeconds, seconds: msg.seconds, merged: chunk?.merged || 1 });
        } else this.cb.onError?.(new Error(msg.message));
        this.cb.onQueue?.(this._status());
        this._pump();
      }
    }
  }
  window.WhisperListener = WhisperListener;
})();
