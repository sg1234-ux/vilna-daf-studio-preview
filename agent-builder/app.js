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
  const missing = diagnostics?.unplacedCounts || {};
  $("textValue").textContent = diagnostics ? `${diagnostics.wordCounts?.gemara || 0} Gemara${missing.gemara ? ` (${missing.gemara} unplaced)` : ""} · ${diagnostics.wordCounts?.inner || 0} inner${missing.inner ? ` (${missing.inner} unplaced)` : ""} · ${diagnostics.wordCounts?.tosafot || 0} Tosafos${missing.tosafot ? ` (${missing.tosafot} unplaced)` : ""}` : "—";
  $("rashbamValue").textContent = diagnostics ? (diagnostics.rashbamPresent ? `${policy?.headingMode || "unresolved"} heading` : "Not present") : "—";
  const geometry = diagnostics?.geometry;
  $("fitValue").textContent = diagnostics ? (missing.gemara ? `${missing.gemara} Gemara tokens unplaced` : diagnostics.textOverflow ? "Overflow detected" : "No measured overflow") : "—";
  $("occupancyValue").textContent = geometry ? `${Math.round((geometry.minOccupancy || 0) * 100)}% minimum · ${Math.round((1 - (geometry.blankRatio || 0)) * 100)}% filled` : "—";
  $("transitionValue").textContent = geometry ? (Number.isFinite(geometry.transitionGapLines) ? `${geometry.transitionGapLines.toFixed(1)} line maximum` : `${Math.round((geometry.transitionGap || 0) * 100)}% gap`) : "—";
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

function teacherCommandStream(note, targetRegion) {
  if (targetRegion === "gemara") return "gemara";
  if (targetRegion === "inner-commentary") return "inner";
  if (targetRegion === "tosafos") return "tosafot";
  if (/\b(?:gemara|gemorah)\b|גמרא/u.test(note)) return "gemara";
  if (/\b(?:rashi|rashbam|inner commentary)\b|רש[״"']?י|רשב/u.test(note)) return "inner";
  if (/\b(?:tosafos|tosafot)\b|תוספ/u.test(note)) return "tosafot";
  return null;
}

function teacherCommandLine(note) {
  const ordinal = note.match(/\b(\d{1,3})(?:st|nd|rd|th)\s+line\b/u);
  if (ordinal) return Number(ordinal[1]);
  const match = note.match(/(?:\bline\s*(?:number\s*)?|שורה\s*)(\d{1,3})\b/u);
  return match ? Number(match[1]) : null;
}

function teacherExpansionNeighbor(note, expandingStream) {
  const match = note.match(/\b(?:into|across|over)\s+(?:the\s+)?(gemara|gemorah|rashi|rashbam|inner\s+commentary|tosafos|tosafot)(?:\s+(?:column|region|space))?\b/u);
  if (!match) return null;
  const value = match[1];
  const stream = /gemara|gemorah/u.test(value) ? "gemara" : /rashi|rashbam|inner/u.test(value) ? "inner" : "tosafot";
  return stream === expandingStream ? null : stream;
}

function teacherLineAnchor(rawNote, note, lineNumber) {
  const requested = /\b(?:begins?|starts?)\s+with\b.{1,180}\bends?\s+with\b|(?:מתחיל|מתחילה).{1,180}(?:מסתיים|מסתיימת)/iu.test(note);
  if (!requested) return { requested: false };
  const quoted = [...rawNote.matchAll(/[“"]([^"”]+)[”"]/gu)].map(match => match[1].trim()).filter(Boolean);
  let startText = quoted[0] || "", endText = quoted[1] || "";
  if (!startText || !endText) {
    const plain = rawNote.match(/(?:begins?|starts?)\s+with\s+(.+?)\s+(?:and\s+)?ends?\s+with\s+(.+?)(?:[.!]|$)/iu);
    if (plain) { startText = plain[1].replace(/^[“"]|[”"]$/g, "").trim(); endText = plain[2].replace(/^[“"]|[”"]$/g, "").trim(); }
  }
  const firstLine = /\bfirst\s+(?:gemara\s+|rashi\s+|rashbam\s+|tosafos\s+|tosafot\s+)?line\b/u.test(note);
  return { requested: true, line: lineNumber || (firstLine ? 1 : null), startText, endText };
}

function teacherStreamLabel(stream) {
  return stream === "gemara" ? "Gemara" : stream === "inner" ? "Rashi/Rashbam" : stream === "tosafot" ? "Tosafos" : "text";
}

function namedStreamNear(note, names, verbs) {
  const clauses=note.split(/\s*(?:[;,.!?]+|\band\b|\bthen\b)\s*/iu).filter(Boolean),verbPattern=new RegExp(`(?:${verbs})`,"iu");
  for(const clause of clauses){
    if(!verbPattern.test(clause))continue;
    for(const [stream,pattern] of names)if(new RegExp(`(?:${pattern})`,"iu").test(clause))return stream;
  }
  return null;
}

function teacherCompletedStream(note) {
  return namedStreamNear(note, [["gemara","gemara|gemorah|גמרא"],["inner","rashi|rashbam|inner commentary|רש[״\"']?י|רשב״?ם"],["tosafot","tosafos|tosafot|תוספ(?:ות)?"]], "ends?|ended|finishes?|finished|completes?|completed|is done|מסתיי(?:ם|מת)");
}

function teacherContinuingStream(note) {
  return namedStreamNear(note, [["gemara","gemara|gemorah|גמרא"],["inner","rashi|rashbam|inner commentary|רש[״\"']?י|רשב״?ם"],["tosafot","tosafos|tosafot|תוספ(?:ות)?"]], "continues?|continued|remains?|survives?|widens?|expands?|takes? over|full width|ממשיך");
}

function teacherContinuationLines(note) {
  const numeric = note.match(/\b(\d{1,2})\s+(?:narrow\s+)?lines?\b/u);
  if (numeric) return Math.max(1, Math.min(12, Number(numeric[1])));
  const words = { one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10, eleven:11, twelve:12 };
  const named = note.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+(?:narrow\s+)?lines?\b/u);
  return named ? words[named[1]] : null;
}

function teacherTargetLineCount(note) {
  const patterns = [
    /\b(?:should|must|needs?\s+to)\s+(?:be|have)\s+(\d{1,3})\s+(?:visual\s+)?lines?(?:\s+long)?\b/u,
    /\b(?:should|must|needs?\s+to)\s+(?:contain|include)\s+(?:exactly\s+)?(\d{1,3})\s+(?:visual\s+)?lines?\b/u,
    /\b(?:has|have|having|contains?)\s+(\d{1,3})\s+(?:visual\s+)?lines?\b/u,
    /\bmake\b.{0,45}\b(\d{1,3})\s+(?:visual\s+)?lines?(?:\s+long)?\b/u,
    /\b(?:change|switch|adjust)\b.{0,60}\bto\s+(\d{1,3})\s+(?:visual\s+)?lines?\b/u,
    /\b(\d{1,3})\s+(?:visual\s+)?lines?\s+(?:long|total|altogether)\b/u
  ];
  for (const pattern of patterns) {
    const match = note.match(pattern), count = Number(match?.[1]);
    if (Number.isInteger(count) && count >= 1 && count <= 200) return count;
  }
  return null;
}

function localAgentReview(body) {
  const rawNote = String(body.feedback?.note || "").trim();
  const note = rawNote.toLowerCase().replace(/[“”]/g, '"').replace(/[’]/g, "'");
  const targetRegion = body.feedback?.targetRegion || "whole-page";
  const stream = teacherCommandStream(note, targetRegion);
  const lineNumber = teacherCommandLine(note);
  const expansionNeighbor = teacherExpansionNeighbor(note, stream);
  const lineAnchor = teacherLineAnchor(rawNote, note, lineNumber);
  const changes = {};
  let summary = `Offline agent reviewed the ${targetRegion} region.`;
  let reason = approvalFailures().length ? `Current hard failures: ${approvalFailures().join(", ")}.` : "The current hard rules pass.";
  const tosafosNamed = stream === "tosafot";
  const innerNamed = stream === "inner";
  const completionNamed = /\b(?:complete|finishes?|finished|ends?|ended|done)\b|מסתיי/u.test(note);
  const completedStream = teacherCompletedStream(note);
  const continuingStream = teacherContinuingStream(note);
  const continuationLineCount = teacherContinuationLines(note);
  const targetLineCount = teacherTargetLineCount(note);
  const removeGemaraDashes = (stream === "gemara" || targetRegion === "whole-page") && /(?:remove|delete|strip|without|take out|eliminate)\b.{0,45}\b(?:dash(?:es)?|hyphen(?:s)?)\b|(?:dash(?:es)?|hyphen(?:s)?)\b.{0,45}\b(?:remove|delete|strip)|(?:הסר|להסיר|מחק|למחוק).{0,30}(?:מקפים|מקף|קווים)/u.test(note);
  const completeGemara = (stream === "gemara" || targetRegion === "whole-page") && /(?:entire|complete|full|all(?: of)? the)\s+(?:gemara|gemorah)|(?:gemara|gemorah).{0,35}(?:entire|complete|full|all|missing|unplaced)/u.test(note);
  const expansionRequested = Boolean(stream) && /(?:and\s+on|onward|onwards|from\s+(?:this|that|there)|following\s+lines?).{0,70}(?:fill|expand|widen|take\s*over|neighbor(?:ing)?\s+(?:commentary|region))|(?:fill|expand|widen|widens|widened|take\s*over).{0,70}(?:region|column|commentary|gemara|gemorah|rashi|rashbam|tosafos|tosafot)|(?:do\s+not|don't|needn't)\s+(?:need\s+to\s+)?be\s+aligned.{0,70}(?:commentary|region)/u.test(note);
  const alignmentRequested = /\b(?:align|aligned|alignment|flush)\b|יישר|מיושר/u.test(note);
  const rightNamed = /\bright(?:-aligned|\s+side|\s+edge)?\b|לימין|ימינה/u.test(note);
  const leftNamed = /\bleft(?:-aligned|\s+side|\s+edge)?\b|לשמאל|שמאלה/u.test(note);
  const justifyNamed = /\b(?:justify|justified|full\s+width)\b/u.test(note);
  const horizontalGutterRequested = /\b(?:horizontal\s+(?:gutter|gap|break|strip|seam)|page-wide\s+(?:gutter|gap|break)|white\s+strip)\b|\bbifurcat(?:e|es|ed|ing)\b|\b(?:gutter|gap|break)\b.{0,70}\b(?:cuts?\s+through|splits?|separates?)\b/u.test(note);
  const disconnectedSegment = /\b(?:cut\s*off|disconnect(?:ed)?|detach(?:ed)?|separat(?:e|ed)|broken\s+(?:off|away))\b/u.test(note);
  const terminalLinesNamed = /\b(?:last|final|bottom|lower)\b.{0,55}\b(?:line|lines)\b|\b(?:line|lines)\b.{0,35}\b(?:at|on|near)\s+the\s+(?:bottom|end)\b/u.test(note);
  const terminalStreamDisconnected = Boolean(stream && disconnectedSegment && terminalLinesNamed);
  const delayedTakeoverRequested = /\b(?:keep|confine|leave)\b.{0,70}\b(?:tosafos|tosafot|rashi|rashbam|gemara|gemorah)\b.{0,70}\b(?:current|existing|own|original)\s+(?:column|region|width)\b.{0,100}\b(?:while|until)\b|\b(?:widen|expand|take\s*over|enter|abut(?:s|ting)?)\b.{0,100}\b(?:only\s+)?(?:after|once|when)\b.{0,80}\b(?:finishes?|finished|ends?|ended|final\s+word|completes?|completed)\b|\b(?:must\s+not|do\s+not|don't|cannot|can't)\b.{0,80}\b(?:widen|expand|enter|abut(?:s|ting)?)\b.{0,100}\b(?:existing|occupied|active|continuing)(?:\s+(?:gemara|gemorah|tosafos|tosafot|rashi|rashbam|commentary))?\s+(?:column|region|text)\b|\b(?:widen|expand|enter|abut(?:s|ting)?)\b.{0,100}\b(?:while|before|until)\b.{0,100}\b(?:still\s+(?:exists?|continues?)|has\s+not\s+(?:finished|ended|completed))\b/u.test(note);
  const releasedSpaceSubject = targetRegion === "gemara" ? "gemara" : targetRegion === "inner-commentary" ? "inner" : targetRegion === "tosafos" ? "tosafot" : /\b(?:keep|confine|leave|widen|expand)\s+(?:the\s+)?(?:tosafos|tosafot)\b/u.test(note) ? "tosafot" : /\b(?:keep|confine|leave|widen|expand)\s+(?:the\s+)?(?:rashi|rashbam|inner commentary)\b/u.test(note) ? "inner" : /\b(?:keep|confine|leave|widen|expand)\s+(?:the\s+)?(?:gemara|gemorah)\b/u.test(note) ? "gemara" : continuingStream;
  const openingCommentaryDisconnected = /\b(?:top|first|opening)\s+(?:(?:\d{1,2}|one|two|three|four|five|six|seven|eight)\s+)?(?:lines?\s+(?:of\s+)?)?commentar(?:y|ies)\b.{0,90}\b(?:disconnect(?:ed)?|separat(?:e|ed)|reconnect|join|connect)\b|\b(?:reconnect|join|connect)\b.{0,90}\b(?:top|first|opening)\s+(?:(?:\d{1,2}|one|two|three|four|five|six|seven|eight)\s+)?(?:lines?\s+(?:of\s+)?)?commentar(?:y|ies)\b|\bcommentar(?:y|ies)\b.{0,70}\b(?:disconnect(?:ed)?\s+from|reconnect(?:ed)?\s+(?:to|with))\b/u.test(note);
  const gutterStreams = [
    ...(/\b(?:gemara|gemorah)\b|גמרא/u.test(note) ? ["gemara"] : []),
    ...(/\b(?:rashi|rashbam|inner commentary)\b|רש[״"']?י|רשב/u.test(note) ? ["inner"] : []),
    ...(/\b(?:tosafos|tosafot)\b|תוספ/u.test(note) ? ["tosafot"] : [])
  ];

  if (terminalStreamDisconnected) {
    changes.enforceStreamContinuity = true;
    const count = continuationLineCount;
    summary = `Reconnect the ${count ? `last ${count} lines` : "final lines"} of ${teacherStreamLabel(stream)} to the preceding ${teacherStreamLabel(stream)} text.`;
    reason = "Those lines are the next words of the same source stream, not a new region. The compositor will remove any artificial vertical separation, preserve their source order and current width, and reject the page unless the rendered lines continue at normal leading.";
  } else if (delayedTakeoverRequested) {
    changes.enforceReleasedSpaceTiming = true;
    const widening = releasedSpaceSubject ? teacherStreamLabel(releasedSpaceSubject) : "The continuing stream";
    summary = `${widening} stays within its existing column until the neighboring text stream finishes.`;
    reason = "The compositor may widen a stream only below the neighboring stream’s measured final line. A narrow continuity line is preserved when needed, so removing a gutter can never cause early takeover of occupied space.";
  } else if (horizontalGutterRequested || openingCommentaryDisconnected) {
    changes.enforceStreamContinuity = true;
    const named = gutterStreams.length ? gutterStreams.map(teacherStreamLabel).join(" and ") : "Gemara, Rashi/Rashbam, and Tosafos";
    summary = openingCommentaryDisconnected ? `Reconnect the opening commentary lines to the main ${named} streams.` : `Remove the horizontal gutter through ${named}.`;
    reason = openingCommentaryDisconnected
      ? "The compositor will enforce the fixed opening boundary: exactly four rendered commentary lines, then the next source word continues on line five beside the Gemara. Only the Gemara receives the top gutter, and validation rejects any blank commentary line at that junction."
      : gutterStreams.includes("gemara")
        ? "The Gemara may change width when a neighboring commentary finishes, but its next source line will follow at normal leading with no blank horizontal band. Validation rejects an unstitched continuing Gemara boundary."
        : "The Gemara top or bottom wall will remain inside the Gemara column only. Commentary text will continue through the same vertical space without a page-wide bridge row or an artificial break inside Tosafos.";
  } else if (targetLineCount) {
    if (!stream) {
      summary = `I understand that a text stream should contain exactly ${targetLineCount} visual lines.`;
      reason = "Name the stream: Gemara, Rashi/Rashbam, or Tosafos.";
    } else {
      const current = diagnostics.settings?.targetLineCounts && typeof diagnostics.settings.targetLineCounts === "object" ? diagnostics.settings.targetLineCounts : {};
      changes.targetLineCounts = { ...current, [stream]: targetLineCount };
      summary = `Set ${teacherStreamLabel(stream)} to exactly ${targetLineCount} visual lines.`;
      reason = "The compositor will search the permitted type scale, preserve every source word and saved region boundary, and reject the draft unless the rendered stream has exactly the requested number of visible lines.";
    }
  } else if (lineAnchor.requested) {
    if (!stream) {
      summary = "I understand that you are defining a line by its opening and closing text.";
      reason = "Name the stream: Gemara, Rashi/Rashbam, or Tosafos.";
    } else if (!lineAnchor.line) {
      summary = `I understand the ${teacherStreamLabel(stream)} line anchor.`;
      reason = "Include the visual line number, or say “first line.”";
    } else if (!lineAnchor.startText || !lineAnchor.endText) {
      summary = `I understand that you are defining ${teacherStreamLabel(stream)} line ${lineAnchor.line}.`;
      reason = "Put the opening and closing phrase in quotation marks so repeated words can be matched safely.";
    } else {
      const current = Array.isArray(diagnostics.settings?.lineAnchors) ? diagnostics.settings.lineAnchors : [];
      const next = current.filter(item => !(item.stream === stream && Number(item.line) === lineAnchor.line));
      next.push({ stream, line: lineAnchor.line, startText: lineAnchor.startText, endText: lineAnchor.endText });
      changes.lineAnchors = next.sort((x, y) => x.stream.localeCompare(y.stream) || x.line - y.line);
      summary = `Anchor ${teacherStreamLabel(stream)} line ${lineAnchor.line} from “${lineAnchor.startText}” through “${lineAnchor.endText}.”`;
      reason = "The compositor will verify a unique ordered source match, preserve every word, and use the anchored line as a measured page constraint.";
    }
  } else if (expansionRequested) {
    if (!lineNumber) {
      summary = `I understand that ${teacherStreamLabel(stream)} should widen into a completed neighboring region.`;
      reason = `Specify the first ${teacherStreamLabel(stream)} line that may use the released space, for example: “From ${teacherStreamLabel(stream)} line 34 onward, widen into the Rashi region.”`;
    } else {
      changes.expansionStream = stream;
      changes.expansionLine = lineNumber;
      if (expansionNeighbor) changes.expansionIntoStream = expansionNeighbor;
      if (stream === "gemara") changes.gemaraExpansionLine = lineNumber;
      const destination = expansionNeighbor ? `the released ${teacherStreamLabel(expansionNeighbor)} region` : "the released neighboring region";
      summary = `Keep ${teacherStreamLabel(stream)} lines 1–${Math.max(1,lineNumber-1)} at their original width; widen line ${lineNumber} and the following lines into ${destination}.`;
      reason = `The width transition is anchored to the start of visual line ${lineNumber}. It will be accepted only if the neighboring stream has finished there; source order and every occupied-region rule remain protected.`;
    }
  } else if (alignmentRequested) {
    if (!stream) {
      summary = "I understand this as a text-alignment correction.";
      reason = "Name the stream to align—Gemara, Rashi/Rashbam, or Tosafos—so the agent changes only the intended region.";
    } else if (!rightNamed && !leftNamed && !justifyNamed && !/\bcent(?:er|re|ered|red)\b/u.test(note)) {
      summary = `I understand that the ${teacherStreamLabel(stream)} alignment is wrong.`;
      reason = "Specify right, left, centered, or justified alignment.";
    } else {
      const centered = /\bcent(?:er|re|ered|red)\b/u.test(note), alignment = rightNamed ? "right" : leftNamed ? "left" : centered ? "center" : "justify";
      if (stream === "gemara") {
        changes.gemaraAlignment = alignment;
        if (lineNumber) changes.gemaraAlignmentLine = lineNumber;
      } else {
        const current = diagnostics.settings?.streamAlignments && typeof diagnostics.settings.streamAlignments === "object" ? diagnostics.settings.streamAlignments : {};
        changes.streamAlignments = { ...current, [stream]: { alignment, line: lineNumber || null } };
      }
      summary = lineNumber ? `Align ${teacherStreamLabel(stream)} line ${lineNumber} to the ${alignment}.` : `Align the incomplete ${teacherStreamLabel(stream)} line to the ${alignment}.`;
      reason = "Full lines keep their Vilna justification. This changes only the requested partial-line alignment and preserves the source.";
    }
  } else if (removeGemaraDashes) {
    changes.stripGemaraDashes = true;
    summary = "Remove dashes from the displayed Gemara text.";
    reason = "This is a reversible display transformation, including on protected reference pages. The stored Hebrew source remains unchanged, and the daf will be recomposed and revalidated before approval.";
  } else if (completeGemara && !diagnostics.unplacedCounts?.gemara) {
    summary = "The entire fetched Gemara is already on this draft page.";
    reason = approvalFailures().length ? `Approval is still blocked by: ${approvalFailures().join(", ")}.` : "The remaining hard rules pass; review the page before teacher approval.";
  } else if (completeGemara && diagnostics.unplacedCounts?.gemara) {
    const currentHeight = Number(diagnostics.settings?.pageHeight || 1030);
    const missing = Number(diagnostics.unplacedCounts.gemara || 0);
    if (currentHeight < 1300) {
      changes.pageHeight = Math.min(1300, currentHeight + Math.max(48, Math.ceil(missing / 18) * 24));
      summary = `Run a bounded completion search for the ${missing} unplaced Gemara tokens.`;
      reason = "The page will recompose at a larger measured height. Approval remains blocked until every Gemara token is placed and all layout rules pass.";
    } else {
      summary = "The Gemara is still incomplete at the allowed page height.";
      reason = "The draft remains blocked. The next correction must change a measured layout boundary or type scale without deleting source text.";
    }
  } else if (completedStream || continuingStream || completionNamed) {
    if (!completedStream) {
      summary = "I understand that a text stream continues or takes over.";
      reason = "Name the stream that finishes at this boundary.";
    } else if (!continuingStream) {
      summary = `${teacherStreamLabel(completedStream)} finishes at this boundary.`;
      reason = "Name the stream that ultimately continues into the released space.";
    } else if (completedStream === continuingStream) {
      summary = "The same stream cannot both finish and continue.";
      reason = "Name the completed stream and the different surviving stream.";
    } else {
      changes.forceCascade = true;
      changes.completedStream = completedStream;
      changes.preferredSurvivor = continuingStream;
      changes.continuationLines = continuationLineCount || 2;
      summary = `${teacherStreamLabel(completedStream)} finishes; ${teacherStreamLabel(continuingStream)} ultimately takes over.`;
      reason = `The remaining streams keep ${changes.continuationLines} narrow continuation line${changes.continuationLines===1?"":"s"} before ${teacherStreamLabel(continuingStream)} becomes full width. Every source and geometry rule will be rechecked.`;
    }
  } else if (/\b(?:increase|enlarge|larger|bigger)\b.{0,35}\b(?:gemara|gemorah)\b|\b(?:gemara|gemorah)\b.{0,35}\b(?:increase|enlarge|larger|bigger)\b/u.test(note)) {
    changes.gemaraScale = Math.min(1.18, Number(diagnostics.settings?.gemaraScale || 1) + .02);
    summary = "Increase the Gemara type slightly and recompose.";
    reason = "The compositor will remeasure all streams and keep approval blocked if any text overflows.";
  } else if (/\b(?:decrease|reduce|smaller|shrink)\b.{0,35}\b(?:gemara|gemorah)\b|\b(?:gemara|gemorah)\b.{0,35}\b(?:decrease|reduce|smaller|shrink)\b/u.test(note)) {
    changes.gemaraScale = Math.max(.78, Number(diagnostics.settings?.gemaraScale || 1) - .02);
    summary = "Reduce the Gemara type slightly and recompose.";
    reason = "The compositor will remeasure all streams and preserve every source token.";
  } else if (note) {
    summary = "I understood the selected region, but not the requested operation.";
    if (/\bline\b|שורה/u.test(note) && !lineNumber) reason = "Include the Gemara line number and say whether that line begins a takeover, or should align right or left.";
    else reason = "Describe one bounded change: reconnect the final lines of a stream, remove a horizontal gutter, align a partial line, widen from a numbered line, complete a named text stream, remove display punctuation, or identify which commentary finishes and which stream continues.";
  } else if (targetRegion === "gemara") {
    summary = "The Gemara region is selected, but no correction was supplied.";
    reason = "State the visible problem—for example, “Align the incomplete Gemara line right” or “From Gemara line 34 onward, widen into the neighboring commentary region.”";
  } else if (["inner-commentary", "tosafos"].includes(targetRegion)) {
    summary = "The commentary region is selected, but no correction was supplied.";
    reason = "State whether its text ends here, continues, is missing, or should release space to a neighboring stream.";
  } else if (approvalFailures().includes("text overflow")) {
    changes.pageHeight = Math.min(1300, Number(diagnostics.settings?.pageHeight || 1030) + 24);
    summary = "Increase the page length slightly to resolve measured overflow.";
    reason = "All source and geometry checks will run again.";
  } else {
    summary = "Describe the exact region, boundary, or line that is wrong.";
    reason = "The agent will preserve source text and change only that bounded layout decision.";
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
  message(`${diagnostics.ref} was approved locally and added to the Build 60 launcher.`);
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
  if (diagnostics.rashbamPresent) frame.contentWindow.postMessage({ type: "vilna-agent-set-rashbam-policy", headingMode: policy.headingMode }, location.origin);
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
  if (diagnostics.rashbamPresent) frame.contentWindow.postMessage({ type: "vilna-agent-set-rashbam-policy", headingMode: policy.headingMode }, location.origin);
  renderDiagnostics();
});
start();
