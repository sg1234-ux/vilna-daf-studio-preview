# Pesachim 99b — Hebrew Whisper listener (TEST branch)

This branch swaps only the listener of the 99b reading-accuracy checker. The browser's built-in
speech recognition is replaced by ivrit.ai's Hebrew Whisper (large-v3-turbo), which runs on the
student's own computer through transformers.js. There is no server and no key.
The scoring (`normalizeReadWord`, `alignReadingWords`, `readingMatch`) and the correct/review/missed
display are unchanged, apart from the looser letter matching listed below.

## Files
- `whisper-worker.js` (new): loads `ivrit-ai/whisper-large-v3-turbo-onnx` in a Web Worker and transcribes chunks.
  - GPU (WebGPU with fp16): q4f16 files, about 563 MB.
  - CPU (WASM) or WebGPU without fp16: q4 files, about 759 MB.
  - Downloaded once, then kept in the browser cache.
- `whisper-listener.js` (new): the microphone keeps recording.
  - Audio is cut at pauses into chunks of 5–12 s (about two lines) and queued for the worker.
  - When chunks pile up, they are sent together, up to 28 s per pass.
- `reading-capture-worklet.js` (new): AudioWorklet that captures raw microphone samples.
- `app.js`
  - Adds the Whisper reading flow, a listener picker (the old browser listener is still there), and a "grade a recording" file input.
  - Adds the teacher-transcript hook.
  - Loosens matching:
    - ת = ס (Ashkenazi sav).
    - A final ה = a final א.
    - A first-letter ו = ב.
    - A ו or י inside a word is ignored (modern full spelling).
  - Skips tokens with no Hebrew letters (for example "—") when scoring.
- `index.html`, `styles.css`: the listener picker, the model download progress bar, and timing and status lines.

## Hint to Whisper
Each chunk is sent with a prompt. By default this is the ~24 page words just before the reader's position (`?hint=prev`).
- `?hint=next` sends the words expected in the chunk instead. In testing this sometimes made Whisper skip words it had been shown.
- `?hint=off` sends no hint.

## Answer key: the teacher's recording
Students are graded against the teacher's own reading, not the printed text (shimshon, Oct 22, 2026: "Use my recording as the basis and the students will be judged against mine").
- The teacher reads the daf once (or uploads a recording). It goes through exactly the student pipeline (same model, chunking and hint mode), and its transcript becomes the key.
- Because the same listener hears teacher and student, its consistent mishearings of Ashkenazi Aramaic (פפא → "פבא", ערבי → "ארבע") line up instead of counting as errors.
- Each key word is aligned once to a page word, so the right word on the page turns green or red. Where the teacher's reading differs from the print (he reads בערבי שבתות where the page has בערב שבת), his reading wins. Page words he did not read are left unmarked. Page words outside the stretch he recorded are graded against the print.
- The page text stays on screen; only the scoring target changes. An "Answer key" picker switches back to the printed text.
- Teacher section on the page: "Record teacher reading" / "upload a recording" → saved in this browser (localStorage) → "Download key (.json)" to commit it. "Load key file" and "Use built-in key" are next to it.
- Built in: `teacher-key-99b.json`, made from shimshon's 75 s voice note (Oct 22, 2026) by the CPU (WASM) path, uploaded as a file.
- Hooks: `window.VDSReading.applyTeacherKey(json)`, `buildTeacherKey(text)`, `loadTeacherTranscript(text)`; URL `?key=page` (grade against print), `?key=builtin` (ignore a key saved in this browser), `?transcript=<url of a .txt>`.
- Limit: this compares WORDS as the listener hears them, not sound. A wrong vowel or dikduk error that spells the same is not caught.

## Measured (Oct 22, 2026, headless Chrome, 4-core CPU, WASM, 4 threads, no GPU)
- Download: 786 MB on the CPU path (two model files plus the runtime file).
- One 5–9 s chunk took 32–38 s to transcribe. One 22–28 s merged pass took 45–56 s.
- So on CPU alone, grading falls behind the reader and catches up after Stop.
- shimshon's own 75 s reading of 99b (Ashkenazi), live run on the published test link:
  - 114 of 149 words green, 33 review, 2 missed. He read correctly, so these are listener errors.
  - The same audio with no hint (`?hint=off`) scored 107 green.
- WebGPU (laptop GPU) and Chromebooks are untested.

## Cross-origin isolation
Several CPU threads need COOP/COEP headers. GitHub Pages cannot set these, so a Pages copy would run on one thread (slower).
The published test copy sets them.
