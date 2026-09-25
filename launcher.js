const COMBINED_BUILD = 58;
const APPROVED_KEY = "vilna-daf-agent-approved-v57";
const PAGES = {
  "agent-builder": {
    path: "agent-builder/index.html",
    title: "Build a New Amud — Agent"
  },
  "pesachim-99b": {
    path: "pesachim-99b/index.html",
    title: "Pesachim 99b — Build 44"
  },
  "bava-metzia-21a": {
    path: "bava-metzia-21a/index.html",
    title: "Bava Metzia 21a — Build 51"
  }
};

function approvedPages() {
  try { return JSON.parse(localStorage.getItem(APPROVED_KEY) || "[]"); }
  catch { return []; }
}

function refreshApprovedOptions() {
  select.querySelectorAll("option[data-approved]").forEach(option => option.remove());
  for (const page of approvedPages()) {
    const key = `approved-${page.id}`;
    PAGES[key] = { path: `agent-builder/index.html?approved=${encodeURIComponent(page.id)}`, title: `${page.ref} — Approved Draft` };
    const option = document.createElement("option");
    option.value = key;
    option.dataset.approved = "true";
    option.textContent = `${page.ref} — approved draft`;
    select.appendChild(option);
  }
}

const select = document.getElementById("amudSelect");
const frame = document.getElementById("studioFrame");
const openDirect = document.getElementById("openDirect");

function selectedFromUrl() {
  const requested = new URLSearchParams(location.search).get("amud");
  return PAGES[requested] ? requested : null;
}

function loadAmud(key, { updateHistory = true } = {}) {
  const safeKey = PAGES[key] ? key : "agent-builder";
  const page = PAGES[safeKey];
  select.value = safeKey;
  frame.src = page.path;
  frame.title = `${page.title} in Vilna Daf Studio`;
  document.title = `${page.title} | Combined Build ${COMBINED_BUILD}`;
  localStorage.setItem("vilna-daf-combined-selected-amud", safeKey);

  if (updateHistory) {
    const url = new URL(location.href);
    url.searchParams.set("amud", safeKey);
    history.pushState({ amud: safeKey }, "", url);
  }
}

select.addEventListener("change", () => loadAmud(select.value));
openDirect.addEventListener("click", () => {
  window.open(PAGES[select.value].path, "_blank", "noopener");
});
window.addEventListener("popstate", () => loadAmud(selectedFromUrl() || "agent-builder", { updateHistory: false }));
window.addEventListener("focus", refreshApprovedOptions);

refreshApprovedOptions();
const remembered = localStorage.getItem("vilna-daf-combined-selected-amud");
const initial = selectedFromUrl() || (PAGES[remembered] ? remembered : "agent-builder");
loadAmud(initial, { updateHistory: false });

const canonicalUrl = new URL(location.href);
canonicalUrl.searchParams.set("amud", initial);
history.replaceState({ amud: initial }, "", canonicalUrl);
