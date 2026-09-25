const STORAGE_KEY = "vilna-daf-agent-approved-v57";
const $ = id => document.getElementById(id);
const frame = $("draftFrame");
let diagnostics = null;
let policy = null;
let proposedReview = null;
let aiReady = false;
let frameReady = false;

function setBuildStep(step) {
  const order = ["source", "compose", "validate", "approve"];
  const current = order.indexOf(step);
  document.querySelectorAll("[data-step]").forEach(element => {
    const index = order.indexOf(element.dataset.step);
    element.classList.toggle("active", index === current);
    element.classList.toggle("complete", index < current);
  });
}

function message(text, error = false) {
  $("buildStatus").textContent = text;
  $("buildStatus").classList.toggle("error", error);
}

async function jsonFetch(url, options) {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body;
}

function approved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function renderApproved() {
  const pages = approved();
  $("approvedPages").innerHTML = pages.length
    ? `<p class="status">Approved local amudim:</p>${pages.map(page => `<a href="?approved=${encodeURIComponent(page.id)}">${page.ref}</a>`).join("")}`
    : "";
}

function approvalFailures() {
  const failures = [...(diagnostics?.failures || [])];
  if (diagnostics?.rashbamPresent && !policy?.resolved) failures.push("Rashbam perek/heading policy unresolved");
  return [...new Set(failures)];
}

function renderDiagnostics() {
  $("patternValue").textContent = diagnostics?.patternName || "—";
  $("textValue").textContent = diagnostics ? `${diagnostics.wordCounts?.gemara || 0} Gemara · ${diagnostics.wordCounts?.inner || 0} inner · ${diagnostics.wordCounts?.tosafot || 0} Tosafos` : "—";
  $("rashbamValue").textContent = diagnostics ? (diagnostics.rashbamPresent ? `${policy?.headingMode || "unresolved"} heading` : "Not present") : "—";
  const geometry = diagnostics?.geometry;
  $("fitValue").textContent = diagnostics ? (diagnostics.textOverflow ? "Overflow detected" : "No measured overflow") : "—";
  $("occupancyValue").textContent = geometry ? `${Math.round((geometry.minOccupancy || 0) * 100)}% minimum · ${Math.round((1 - (geometry.blankRatio || 0)) * 100)}% filled` : "—";
  $("transitionValue").textContent = geometry ? `${Math.round((geometry.transitionGap || 0) * 100)}% gap` : "—";
  $("bandsValue").textContent = geometry?.bands?.length ? geometry.bands.map(band => band.streams.join(" + ")).join(" → ") : "—";
  const failures = approvalFailures();
  $("failureList").classList.toggle("pass", diagnostics && failures.length === 0);
  $("failureList").innerHTML = diagnostics ? (failures.length ? failures.map(item => `<li>${item}</li>`).join("") : "<li>All current hard rules passed.</li>") : "<li>Build a draft to see its exact rule checks.</li>";
  $("approvalValue").textContent = diagnostics ? (failures.length ? "Blocked" : "Eligible for teacher approval") : "Not tested";
  $("approveDraft").disabled = !diagnostics || failures.length > 0;
  $("askAgent").disabled = !diagnostics;
  $("applyMeasuredCorrection").disabled = !diagnostics || !$("completedStream").value;
  setBuildStep(!diagnostics ? "compose" : failures.length ? "validate" : "approve");
}

async function resolvePolicy(ref, rashbamPresent) {
  const query = new URLSearchParams({ ref });
  if (typeof rashbamPresent === "boolean") query.set("rashbamPresent", String(rashbamPresent));
  query.set("perekRashbamStatus", $("perekRashbamStatus").value);
  if ($("perekHint").value.trim()) query.set("perekHint", $("perekHint").value.trim());
  try { policy = await jsonFetch(`../api/commentary-policy?${query}`); }
  catch { policy = localCommentaryPolicy(ref, rashbamPresent); }
  return policy;
}

function localCommentaryPolicy(ref, rashbamPresent) {
  const normalized = String(ref).trim().replace(/\s+/g, " ").toLowerCase();
  if (normalized === "pesachim 99b") return { ref, resolved: true, rashbam: "present", headingMode: "full", confidence: "protected-page", reason: "Protected Build 44 first Rashbam amud." };
  if (normalized === "bava metzia 21a" || rashbamPresent === false) return { ref, resolved: true, rashbam: "absent", headingMode: "none", confidence: rashbamPresent === false ? "source-probe" : "protected-page", reason: "No Rashbam source text is used on this amud." };
  const status = $("perekRashbamStatus").value;
  if (rashbamPresent === true && status === "first") return { ref, resolved: true, rashbam: "present", headingMode: "full", confidence: "teacher-perek-evidence", reason: "Teacher confirmed the first Rashbam amud in this perek." };
  if (rashbamPresent === true && status === "continued") return { ref, resolved: true, rashbam: "present", headingMode: "short", confidence: "teacher-perek-evidence", reason: "Teacher confirmed Rashbam appeared earlier in this perek." };
  return { ref, resolved: false, rashbam: rashbamPresent === true ? "present" : "unknown", headingMode: "unresolved", confidence: "unresolved-perek", reason: "Verify whether Rashbam appeared earlier in this perek before approval." };
}

async function build(ref, saved = null) {
  diagnostics = null; proposedReview = null; renderDiagnostics();
  $("applyAgent").disabled = true;
  setBuildStep("source");
  message(`Loading ${ref} and composing its text streams…`);
  policy = await resolvePolicy(ref);
  frame.contentWindow.postMessage({ type: "vilna-agent-load", ref, settings: saved?.settings || {}, rashbamHeadingMode: saved?.headingMode || policy.headingMode, rashbamAllowed: policy.rashbam !== "absent" }, location.origin);
}

$("completedStream").addEventListener("change", event => {
  const completed = event.target.value;
  if (completed) $("survivingStream").value = completed === "inner" ? "tosafot" : "inner";
  $("applyMeasuredCorrection").disabled = !diagnostics || !completed;
});

$("applyMeasuredCorrection").addEventListener("click", () => {
  if (!diagnostics || !$("completedStream").value) return;
  const continuationLines = Math.max(1, Math.min(12, Math.round(Number($("continuationLines").value) || 2)));
  const preferredSurvivor = $("survivingStream").value;
  frame.contentWindow.postMessage({ type: "vilna-agent-adjust", settings: { forceCascade: true, preferredSurvivor, continuationLines } }, location.origin);
  $("agentResult").textContent = `Rebuilding only the measured transition: ${continuationLines} narrow continuation line${continuationLines === 1 ? "" : "s"}, then full-width ${preferredSurvivor === "tosafot" ? "Tosafos" : "inner commentary"}.`;
  message("Applying the bounded transition and rerunning every hard rule…");
  setBuildStep("compose");
});

$("buildDraft").addEventListener("click", async () => {
  const ref = $("dafRef").value.trim();
  if (!/\d+[ab]$/i.test(ref)) return message("Use a reference ending in a or b, such as Bava Metzia 21b.", true);
  try { await build(ref); } catch (error) { message(error.message, true); }
});

$("askAgent").addEventListener("click", async () => {
  $("askAgent").disabled = true;
  $("agentResult").classList.remove("error");
  $("agentResult").textContent = "The agent is reading the specification and reviewing this region…";
  try {
    const body = { ref: diagnostics.ref, diagnostics, feedback: { targetRegion: $("targetRegion").value, note: $("feedback").value.trim(), perekHint: $("perekHint").value.trim(), perekRashbamStatus: $("perekRashbamStatus").value } };
    if (aiReady) {
      const result = await jsonFetch("../api/agent/review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      proposedReview = result.review;
    } else {
      proposedReview = localAgentReview(body);
    }
    $("agentResult").textContent = `${proposedReview.summary}${proposedReview.reason ? ` — ${proposedReview.reason}` : ""}`;
    $("applyAgent").disabled = !Object.keys(proposedReview.changes || {}).length;
  } catch (error) {
    $("agentResult").textContent = error.message;
    $("agentResult").classList.add("error");
  } finally { $("askAgent").disabled = !diagnostics; }
});

function localAgentReview(body) {
  const note = String(body.feedback?.note || "").toLowerCase();
  const targetRegion = body.feedback?.targetRegion || "whole-page";
  const changes = {};
  let summary = `Offline agent reviewed the ${targetRegion} region.`;
  let reason = approvalFailures().length ? `Current hard failures: ${approvalFailures().join(", ")}.` : "The current hard rules pass; this applies the teacher's requested transition.";
  const tosafosNamed = /tosaf|תוספ/u.test(note);
  const innerNamed = /rashi|rashbam|inner|רש[״"']?י|רשב/u.test(note);
  const completionNamed = /complete|finish|end|done|מסתיי/u.test(note);
  const twoLines = /\b(two|2)\s+lines?\b/u.test(note);
  const removeGemaraDashes = targetRegion === "gemara" && /(?:remove|delete|strip|without|take out|eliminate)\b.{0,45}\b(?:dash(?:es)?|hyphen(?:s)?)\b|(?:dash(?:es)?|hyphen(?:s)?)\b.{0,45}\b(?:remove|delete|strip)|(?:הסר|להסיר|מחק|למחוק).{0,30}(?:מקפים|מקף|קווים)/u.test(note);

  if (removeGemaraDashes && /^(?:Pesachim 99b|Bava Metzia 21a)$/i.test(String(body.ref||"").trim())) {
    summary = "This approved reference page is protected.";
    reason = "The agent cannot alter its Gemara text. Create a separate draft to propose a display change.";
  } else if (removeGemaraDashes) {
    changes.stripGemaraDashes = true;
    summary = "Remove dashes from the displayed Gemara text.";
    reason = "Hebrew letters and words remain intact. The daf will be recomposed and source-preservation checks rerun before approval.";
  } else if (completionNamed && (tosafosNamed || innerNamed)) {
    changes.forceCascade = true;
    changes.preferredSurvivor = tosafosNamed ? "tosafot" : "inner";
    changes.continuationLines = twoLines ? 2 : 3;
    summary = `Use a completion-driven ${tosafosNamed ? "Tosafos" : "inner-commentary"} takeover.`;
    reason = `${changes.continuationLines} narrow continuation lines will remain after Gemara completes, followed by a full-width ${tosafosNamed ? "Tosafos" : "inner-commentary"} region beneath the Gemara gutter.`;
  } else if (note) {
    summary = "I cannot apply that comment automatically.";
    reason = "No page change was proposed. Please give a more specific layout instruction or make the text edit in Edit mode.";
  } else if (targetRegion === "gemara") {
    changes.gemaraScale = Math.max(.78, Math.min(1.18, Number(diagnostics.settings?.gemaraScale || 1) * .98));
    summary = "Rebalance the Gemara region and rerun every hard check.";
  } else if (["inner-commentary", "tosafos"].includes(targetRegion)) {
    changes.commentaryScale = Math.max(.72, Math.min(1.18, Number(diagnostics.settings?.commentaryScale || 1) * .98));
    summary = "Rebalance the selected commentary region and rerun every hard check.";
  } else if (approvalFailures().includes("text overflow")) {
    changes.pageHeight = Math.min(1300, Number(diagnostics.settings?.pageHeight || 1030) + 24);
    summary = "Increase the page length slightly to resolve measured overflow.";
  } else {
    summary = "The offline agent needs a more specific completion or transition instruction.";
    reason = "Name the stream that finishes, the stream that continues, and the number of narrow lines before it becomes full width.";
  }
  return { summary, reason, targetRegion, changes, hardFailures: approvalFailures() };
}

$("applyAgent").addEventListener("click", () => {
  if (!proposedReview) return;
  frame.contentWindow.postMessage({ type: "vilna-agent-adjust", settings: proposedReview.changes }, location.origin);
  $("applyAgent").disabled = true;
  message(`Applying the agent's ${proposedReview.targetRegion} adjustment and rerunning hard checks…`);
});

$("approveDraft").addEventListener("click", () => {
  const failures = approvalFailures();
  if (!diagnostics || failures.length) return;
  const pages = approved();
  const id = `${diagnostics.ref.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
  pages.push({ id, ref: diagnostics.ref, settings: diagnostics.settings || {}, headingMode: policy?.headingMode || "none", approvedAt: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
  localStorage.setItem("vilna-daf-agent-approved-updated", String(Date.now()));
  renderApproved();
  message(`${diagnostics.ref} was approved locally and added to the Build 59 launcher.`);
});

window.addEventListener("message", async event => {
  if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
  if (event.data?.type === "vilna-agent-ready") {
    frameReady = true;
    const approvedId = new URLSearchParams(location.search).get("approved");
    const saved = approved().find(page => page.id === approvedId);
    if (saved) { $("dafRef").value = saved.ref; await build(saved.ref, saved); }
    return;
  }
  if (event.data?.type !== "vilna-agent-diagnostics") return;
  diagnostics = event.data.diagnostics;
  try { policy = await resolvePolicy(diagnostics.ref, diagnostics.rashbamPresent); }
  catch (error) { policy = { resolved: false, headingMode: "unresolved", reason: error.message }; }
  renderDiagnostics();
  frame.contentWindow.postMessage({ type: "vilna-agent-set-rashbam-policy", headingMode: policy.headingMode }, location.origin);
  message(approvalFailures().length ? `Draft composed. Review the exact failures listed below.` : `Draft composed and all current hard rules pass. Inspect it before approval.`);
});

async function start() {
  renderApproved(); renderDiagnostics();
  try {
    const status = await jsonFetch("../api/agent/status");
    aiReady = status.aiReady;
    $("agentStatus").textContent = aiReady ? `AI agent ready · ${status.model}` : "Deterministic builder ready · AI key not configured";
    $("agentStatus").classList.toggle("ready", aiReady);
  } catch {
    aiReady = false;
    $("agentStatus").textContent = "No-download builder ready · optional AI review unavailable";
  }
  renderDiagnostics();
}

$("perekRashbamStatus").addEventListener("change", async () => {
  if (!diagnostics) return;
  policy = await resolvePolicy(diagnostics.ref, diagnostics.rashbamPresent);
  frame.contentWindow.postMessage({ type: "vilna-agent-set-rashbam-policy", headingMode: policy.headingMode }, location.origin);
  renderDiagnostics();
});
start();
