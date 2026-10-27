const COMBINED_BUILD = 60;
const APPROVED_KEY = "vilna-daf-agent-approved-v57";
const PAGES = {
  "bava-metzia-22a": {path:"draft-engine/index.html?ref=Bava%20Metzia%2022a&ui=60.19&build=62.58",title:"Bava Metzia 22a"},
  "pesachim-100a": { path: "draft-engine/index.html?ref=Pesachim%20100a&ui=60.11&build=62.53", title: "Pesachim 100a" },
  "agent-builder": {
    path: "agent-builder/index.html?ui=60.11",
    title: "Build a New Amud — Agent"
  },
  "pesachim-99b": {
    path: "pesachim-99b/index.html?ui=60.21&build=44.1",
    title: "Pesachim 99b — Build 44.1"
  },
  "bava-metzia-21a": {
    path: "bava-metzia-21a/index.html?ui=60.21&build=51.1",
    title: "Bava Metzia 21a — Build 51.1"
  }
};

function approvedPages() {
  try { return JSON.parse(localStorage.getItem(APPROVED_KEY) || "[]"); }
  catch { return []; }
}

const pickers = [
  {id:"berachosSelect",tractate:"Berakhot",label:"Berachos",slug:"berakhot",start:26,end:30},
  {id:"pesachimSelect",tractate:"Pesachim",label:"Pesachim",slug:"pesachim",start:99,end:121},
  {id:"bavaMetziaSelect",tractate:"Bava Metzia",label:"Bava Metzia",slug:"bava-metzia",start:21,end:33}
];
let currentKey = "agent-builder";
for (const picker of pickers) {
  picker.select = document.getElementById(picker.id);
  for(let n=picker.start;n<=picker.end;n++)for(const side of ["a","b"]){
    if(picker.slug==="pesachim"&&n===99&&side==="a")continue;
    const amud=`${n}${side}`,key=`${picker.slug}-${amud}`,ref=`${picker.tractate} ${amud}`;
    if(!PAGES[key])PAGES[key]={path:`agent-builder/index.html?ref=${encodeURIComponent(ref)}&ui=62.69`,title:ref};
    PAGES[key].picker=picker.id;
    const option=document.createElement("option");option.value=key;option.textContent=amud;picker.select.append(option);
  }
  picker.select.addEventListener("change",()=>{if(picker.select.value)loadAmud(picker.select.value);});
}
// The prepared 100b pack opens in the viewer; unconnected pages open the builder.
PAGES["pesachim-100b"].path="draft-engine/index.html?ref=Pesachim%20100b&build=62.68";
function refreshApprovedOptions() {
  for(const picker of pickers)picker.select.querySelectorAll("optgroup").forEach(group=>group.remove());
  for(const key of Object.keys(PAGES))if(key.startsWith("approved-"))delete PAGES[key];
  const counts=new Map();
  for(const page of approvedPages()){
    if(!page?.id||typeof page.ref!=="string")continue;
    const match=page.ref.match(/^(Berakhot|Berachos|Berachot|Pesachim|Bava Metzia|Bava Metziah)\s+(\d+[ab])$/i);
    if(!match)continue;
    const picker=pickers.find(p=>p.label===(/^Ber/i.test(match[1])?"Berachos":/^Bava/i.test(match[1])?"Bava Metzia":"Pesachim"));
    const key=`approved-${page.id}`;
    PAGES[key]={path:`agent-builder/index.html?approved=${encodeURIComponent(page.id)}&ui=62.69`,title:`${page.ref} — Approved Draft`,picker:picker.id};
    let group=picker.select.querySelector("optgroup");if(!group){group=document.createElement("optgroup");group.label="Saved approved drafts";picker.select.append(group);}
    const countKey=picker.id+match[2],count=(counts.get(countKey)||0)+1;counts.set(countKey,count);
    const option=document.createElement("option");option.value=key;option.textContent=`${match[2]} — saved draft ${count}`;group.append(option);
  }
  syncPickers();
}
function syncPickers(){for(const picker of pickers)picker.select.value=PAGES[currentKey]?.picker===picker.id?currentKey:"";}

const frame = document.getElementById("studioFrame");
const openDirect = document.getElementById("openDirect");

function selectedFromUrl() {
  const requested = new URLSearchParams(location.search).get("amud");
  return PAGES[requested] ? requested : null;
}

function loadAmud(key, { updateHistory = true } = {}) {
  const safeKey = PAGES[key] ? key : "agent-builder";
  const page = PAGES[safeKey];
  currentKey = safeKey;
  syncPickers();
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

document.getElementById("newAmud").addEventListener("click",()=>loadAmud("agent-builder"));
openDirect.addEventListener("click", () => {
  window.open(PAGES[currentKey].path, "_blank", "noopener");
});
window.addEventListener("popstate", () => loadAmud(selectedFromUrl() || "agent-builder", { updateHistory: false }));
window.addEventListener("focus", refreshApprovedOptions);
window.addEventListener("storage",event=>{if(event.key===APPROVED_KEY)refreshApprovedOptions();});

refreshApprovedOptions();
const remembered = localStorage.getItem("vilna-daf-combined-selected-amud");
const initial = selectedFromUrl() || (PAGES[remembered] ? remembered : "agent-builder");
loadAmud(initial, { updateHistory: false });

const canonicalUrl = new URL(location.href);
canonicalUrl.searchParams.set("amud", initial);
history.replaceState({ amud: initial }, "", canonicalUrl);
