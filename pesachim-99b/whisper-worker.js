// Vilna Daf Studio — Hebrew Whisper listener (TEST build, Pesachim 99b).
// Runs ivrit.ai's Hebrew Whisper (large-v3-turbo, ONNX) inside this Web Worker with transformers.js.
// Everything runs on the student's own device: no server, no key. The model files are downloaded once
// from Hugging Face and kept in the browser's cache ("transformers-cache").
import { env, AutoProcessor, AutoTokenizer, WhisperForConditionalGeneration } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1/dist/transformers.min.js";

const MODEL_ID = "ivrit-ai/whisper-large-v3-turbo-onnx";
// Quantized variants published in that repo (sizes as listed on Hugging Face, Oct 2026):
//   WebGPU with fp16 shaders: encoder q4f16 (370 MB) + decoder q4f16 (193 MB)  ≈ 563 MB
//   CPU (WASM) or WebGPU without fp16: encoder q4 (425 MB) + decoder q4 (334 MB) ≈ 759 MB
const MB = 1e6;
// bytes: model files as listed on Hugging Face + tokenizer/config files (~6 MB). The runtime's own WASM file (~27 MB) is extra.
const PLANS = {
  "webgpu-f16": { device: "webgpu", dtype: { encoder_model: "q4f16", decoder_model_merged: "q4f16" }, label: "GPU (WebGPU)", bytes: (369.9 + 193.4 + 6) * MB },
  "webgpu": { device: "webgpu", dtype: { encoder_model: "q4", decoder_model_merged: "q4" }, label: "GPU (WebGPU)", bytes: (424.9 + 334.0 + 6) * MB },
  "wasm": { device: "wasm", dtype: { encoder_model: "q4", decoder_model_merged: "q4" }, label: "CPU (WASM)", bytes: (424.9 + 334.0 + 6) * MB },
};

env.allowLocalModels = false;
env.useBrowserCache = true;

let model = null, processor = null, tokenizer = null, plan = null, ids = null;

async function choosePlan(preferred) {
  if (preferred === "wasm") return "wasm";
  try {
    if (self.navigator?.gpu) {
      const adapter = await navigator.gpu.requestAdapter();
      if (adapter) return adapter.features.has("shader-f16") ? "webgpu-f16" : "webgpu";
    }
  } catch {}
  return "wasm";
}

function fileUrl(name) { return `https://huggingface.co/${MODEL_ID}/resolve/main/${name}`; }
function suffix(dtype) { return dtype === "fp32" ? "" : dtype === "q8" ? "_quantized" : `_${dtype}`; }
async function isCached(p) {
  try {
    const cache = await caches.open(env.cacheKey || "transformers-cache");
    const enc = await cache.match(fileUrl(`onnx/encoder_model${suffix(p.dtype.encoder_model)}.onnx`));
    const dec = await cache.match(fileUrl(`onnx/decoder_model_merged${suffix(p.dtype.decoder_model_merged)}.onnx`));
    return Boolean(enc && dec);
  } catch { return false; }
}

async function load(preferred) {
  const t0 = performance.now();
  const key = await choosePlan(preferred);
  plan = { key, ...PLANS[key] };
  const threads = self.crossOriginIsolated ? Math.max(1, Math.min(8, navigator.hardwareConcurrency || 4)) : 1;
  if (plan.device === "wasm") env.backends.onnx.wasm.numThreads = threads;
  const cached = await isCached(plan);
  postMessage({ type: "plan", bytes: plan.bytes, device: plan.device, label: plan.label, dtype: plan.dtype, threads: plan.device === "wasm" ? threads : null, cached, crossOriginIsolated: self.crossOriginIsolated });
  // Our own byte count per file (the library's aggregate counted some files twice in testing).
  let lastSent = 0;
  const files = {};
  const progress_callback = (info) => {
    if (info.status !== "progress" || !info.file) return;
    files[info.file] = { loaded: info.loaded || 0, total: info.total || 0 };
    const loaded = Object.values(files).reduce((s, f) => s + f.loaded, 0);
    const total = Math.max(plan.bytes, Object.values(files).reduce((s, f) => s + f.total, 0));
    const now = performance.now();
    if (now - lastSent < 250 && loaded < total) return;
    lastSent = now;
    postMessage({ type: "progress", loaded, total, progress: Math.min(100, (loaded / total) * 100) });
  };
  tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID, { progress_callback });
  processor = await AutoProcessor.from_pretrained(MODEL_ID, { progress_callback });
  model = await WhisperForConditionalGeneration.from_pretrained(MODEL_ID, { device: plan.device, dtype: plan.dtype, progress_callback });
  const [sot, he, transcribe, notimestamps, prev] = tokenizer.convert_tokens_to_ids(["<|startoftranscript|>", "<|he|>", "<|transcribe|>", "<|notimestamps|>", "<|startofprev|>"]);
  ids = { sot, he, transcribe, notimestamps, prev };
  // GPU only: warm up on one second of silence so the first real chunk is not slowed by shader compilation.
  // (On CPU there is nothing to compile, and a warm-up would cost a full chunk's time, ~30 s, before listening.)
  const tw = performance.now();
  if (plan.device === "webgpu") await transcribe_(new Float32Array(16000), "");
  postMessage({ type: "ready", device: plan.device, label: plan.label, loadSeconds: (tw - t0) / 1000, warmupSeconds: (performance.now() - tw) / 1000 });
}

async function transcribe_(audio, prompt) {
  const { input_features } = await processor(audio);
  const task = [ids.sot, ids.he, ids.transcribe, ids.notimestamps];
  let prefix = task;
  if (prompt && prompt.trim()) {
    // Whisper "initial prompt": <|startofprev|> + prompt tokens, then the normal task tokens.
    // The expected words for this stretch bias the model toward the page's spelling and vocabulary.
    let promptIds = tokenizer.encode(" " + prompt.trim(), { add_special_tokens: false });
    if (promptIds.length > 190) promptIds = promptIds.slice(0, 190); // keep the words nearest the reader
    prefix = [ids.prev, ...promptIds, ...task];
  }
  // Whisper's decoder holds 448 tokens in total (hint + task tokens + answer).
  const max_new_tokens = Math.max(32, Math.min(240, 447 - prefix.length));
  const out = await model.generate({ inputs: input_features, decoder_input_ids: prefix, max_new_tokens });
  const seq = Array.from(out.tolist ? out.tolist()[0] : out[0]).map(Number);
  return tokenizer.decode(seq.slice(prefix.length), { skip_special_tokens: true }).trim();
}

let busy = Promise.resolve();
self.onmessage = (event) => {
  const msg = event.data;
  if (msg.type === "load") {
    busy = busy.then(() => load(msg.device)).catch((error) => postMessage({ type: "error", stage: "load", message: String(error?.message || error) }));
  } else if (msg.type === "transcribe") {
    busy = busy.then(async () => {
      const t0 = performance.now();
      const text = await transcribe_(msg.audio, msg.prompt || "");
      postMessage({ type: "result", id: msg.id, text, seconds: (performance.now() - t0) / 1000, audioSeconds: msg.audio.length / 16000 });
    }).catch((error) => postMessage({ type: "error", stage: "transcribe", id: msg.id, message: String(error?.message || error) }));
  }
};
