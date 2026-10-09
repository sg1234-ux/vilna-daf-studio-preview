/* Restore finished approved geometry without fetching text or running a solver. */
function approvedRegionSnapshot(element) {
  return { html: overlayFreeHtml(element), style: element.style.cssText, className: element.className, stream: element.dataset.stream || "" };
}
function captureApprovedSnapshot() {
  if ($("dafPage").classList.contains("composing")) throw new Error("Wait for the page to finish composing.");
  const page = $("dafPage");
  return {
    version: 1, ref: state.ref, project: projectPayload(),
    settings: { ...state.agentSettings }, lockedStreams: state.agentLockedStreams || {},
    headingMode: state.rashbamHeadingMode, rashbamAllowed: state.rashbamAllowed,
    layout: {
      pageStyle: page.style.cssText, pageClass: page.className,
      body: approvedRegionSnapshot($("bodyGeometry")),
      right: approvedRegionSnapshot($("topRight")), left: approvedRegionSnapshot($("topLeft")),
      number: $("dafNumber").textContent, chapter: $("chapterTitle").textContent
    }
  };
}
function safeApprovedStyle(value) {
  const text = String(value || "");
  if (/url\s*\(|expression\s*\(/i.test(text)) throw new Error("Unsupported saved page styling.");
  return text;
}
function safeApprovedHtml(html) {
  const template = document.createElement("template");
  template.innerHTML = String(html || "");
  for (const element of template.content.querySelectorAll("*")) {
    if (!["DIV", "SPAN", "STRONG", "B", "I", "EM", "BR"].includes(element.tagName)) throw new Error("Unsupported saved page markup.");
    for (const attribute of [...element.attributes]) {
      if (attribute.name === "style") element.setAttribute("style", safeApprovedStyle(attribute.value));
      else if (!/^(?:class|dir|contenteditable|spellcheck|tabindex|data-[a-z0-9-]+|aria-[a-z0-9-]+)$/.test(attribute.name)) element.removeAttribute(attribute.name);
    }
  }
  return template.innerHTML;
}
function restoreApprovedRegion(element, saved) {
  element.innerHTML = safeApprovedHtml(saved.html);
  element.style.cssText = safeApprovedStyle(saved.style);
  element.className = saved.className;
  if (saved.stream) element.dataset.stream = saved.stream;
}
async function restoreApprovedSnapshot(snapshot) {
  if (snapshot?.version !== 1 || !snapshot.ref || snapshot.project?.daf?.ref !== snapshot.ref || !snapshot.layout?.body?.html) throw new Error("The saved approved page is incomplete.");
  const project = snapshot.project, view = project.view || {}, layout = snapshot.layout;
  // Validate all rendered markup before replacing any visible page region.
  for (const region of [layout.body, layout.right, layout.left]) {
    safeApprovedHtml(region.html);
    safeApprovedStyle(region.style);
  }
  safeApprovedStyle(layout.pageStyle);
  Object.assign(state, project.daf, view, {
    teacherApproved: true, approvedSnapshotLoaded: true, dirty: false, composition: null,
    agentSettings: safeAgentSettings(snapshot.settings), agentSettingsRef: snapshot.ref,
    agentLockedStreams: snapshot.lockedStreams || {}, rashbamHeadingMode: snapshot.headingMode || "none",
    rashbamAllowed: snapshot.rashbamAllowed !== false,
    typography: "archival-open", mode: "navigate", selecting: false, selection: null,
    notes: project.notes || {}, visualLinks: project.lesson?.visualLinks || {},
    annotations: Array.isArray(project.annotations) ? project.annotations : [], annotationUndo: [], annotationRedo: [],
    annotationTool: project.annotationSettings?.tool || "pen", annotationColor: project.annotationSettings?.color || "#b32424",
    strokeWidth: Number(project.annotationSettings?.width) || 3,
    focusEnabled: Boolean(view.focusEnabled), focusWindow: clamp(Number(view.focusWindow) || 1, 1, 12),
    punctuationEnabled: view.punctuationEnabled !== false, nekudosEnabled: view.nekudosEnabled !== false
  });
  const page = $("dafPage");
  page.style.cssText = layout.pageStyle;
  page.className = layout.pageClass;
  page.classList.remove("composing", "selecting", "annotating", "edit-mode");
  restoreApprovedRegion($("bodyGeometry"), layout.body);
  restoreApprovedRegion($("topRight"), layout.right);
  restoreApprovedRegion($("topLeft"), layout.left);
  $("dafNumber").textContent = layout.number;
  $("chapterTitle").textContent = layout.chapter;
  $("dafRef").value = snapshot.ref;
  syncRegistrySelection(snapshot.ref);
  $("focusWindowSize").value = [1, 2, 3].includes(state.focusWindow) ? String(state.focusWindow) : "custom";
  $("focusWindowCustom").value = state.focusWindow;
  $("focusWindowCustom").hidden = $("focusWindowSize").value !== "custom";
  $("annotationColor").value = state.annotationColor;
  $("strokeWidth").value = state.strokeWidth;
  $("strokeWidthValue").textContent = state.strokeWidth;
  $("selectionBox").hidden = true;
  ["downloadExactPng", "copyExcerpt", "downloadExcerpt", "clearExcerpt"].forEach(id => $(id).disabled = true);
  await applyTypography("archival-open", { recompose: false });
  activateWordNavigation();
  updateDisplayToggles();
  applyPageZoom();
  setAnnotating(false);
  syncAnnotationCanvas();
  renderGemaraLineNumbers();
  toggleNotes(Boolean(view.notesEnabled));
  status("Approved page ready.");
}
window.addEventListener("message", async event => {
  if (event.origin !== location.origin || event.source !== window.parent) return;
  const data = event.data || {};
  if (data.type === "vilna-approved-capture") {
    try {
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      window.parent.postMessage({ type: "vilna-approved-captured", requestId: data.requestId, snapshot: captureApprovedSnapshot() }, location.origin);
    } catch (error) {
      window.parent.postMessage({ type: "vilna-approved-captured", requestId: data.requestId, error: error.message }, location.origin);
    }
  } else if (data.type === "vilna-approved-restore") {
    try { await restoreApprovedSnapshot(data.snapshot); }
    catch (error) {
      status(`Could not open the saved approved page: ${error.message}`, true);
      window.parent.postMessage({ type: "vilna-approved-restore-failed" }, location.origin);
    }
  } else if (data.type === "vilna-approved-cache-error") {
    status(data.message, true);
  }
});
