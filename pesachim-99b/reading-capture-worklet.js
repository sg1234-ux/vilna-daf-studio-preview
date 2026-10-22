// Captures raw microphone samples for the Hebrew Whisper listener (TEST build, Pesachim 99b).
class ReadingCaptureProcessor extends AudioWorkletProcessor {
  constructor() { super(); this.buffer = new Float32Array(4096); this.filled = 0; }
  process(inputs) {
    const channel = inputs[0]?.[0];
    if (channel) {
      let offset = 0;
      while (offset < channel.length) {
        const n = Math.min(channel.length - offset, this.buffer.length - this.filled);
        this.buffer.set(channel.subarray(offset, offset + n), this.filled);
        this.filled += n; offset += n;
        if (this.filled === this.buffer.length) { this.port.postMessage(this.buffer.slice(0)); this.filled = 0; }
      }
    }
    return true;
  }
}
registerProcessor("reading-capture", ReadingCaptureProcessor);
