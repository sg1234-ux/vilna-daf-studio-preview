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

for(const key of ["bava-metzia-21a","pesachim-99b","pesachim-100a"])PAGES[key].builtinApproved=true;
PAGES["pesachim-100b"]={path:"draft-engine/index.html?ref=Pesachim%20100b&build=62.68",title:"Pesachim 100b"};
// Bavli daf boundaries from https://www.sefaria.org/api/shape/Talmud (2026-10-27).
const TRACTATES=[{"title":"Berakhot","label":"Berachos","heTitle":"ברכות","start":2,"end":126,"seder":"Seder Zeraim"},{"title":"Shabbat","label":"Shabbos","heTitle":"שבת","start":2,"end":313,"seder":"Seder Moed"},{"title":"Eruvin","label":"Eruvin","heTitle":"עירובין","start":2,"end":208,"seder":"Seder Moed"},{"title":"Pesachim","label":"Pesachim","heTitle":"פסחים","start":2,"end":241,"seder":"Seder Moed"},{"title":"Rosh Hashanah","label":"Rosh Hashanah","heTitle":"ראש השנה","start":2,"end":68,"seder":"Seder Moed"},{"title":"Yoma","label":"Yoma","heTitle":"יומא","start":2,"end":174,"seder":"Seder Moed"},{"title":"Sukkah","label":"Sukkah","heTitle":"סוכה","start":2,"end":111,"seder":"Seder Moed"},{"title":"Beitzah","label":"Beitzah","heTitle":"ביצה","start":2,"end":79,"seder":"Seder Moed"},{"title":"Taanit","label":"Taanit","heTitle":"תענית","start":2,"end":60,"seder":"Seder Moed"},{"title":"Megillah","label":"Megillah","heTitle":"מגילה","start":2,"end":62,"seder":"Seder Moed"},{"title":"Moed Katan","label":"Moed Katan","heTitle":"מועד קטן","start":2,"end":56,"seder":"Seder Moed"},{"title":"Chagigah","label":"Chagigah","heTitle":"חגיגה","start":2,"end":52,"seder":"Seder Moed"},{"title":"Yevamot","label":"Yevamot","heTitle":"יבמות","start":2,"end":243,"seder":"Seder Nashim"},{"title":"Ketubot","label":"Ketubot","heTitle":"כתובות","start":2,"end":223,"seder":"Seder Nashim"},{"title":"Nedarim","label":"Nedarim","heTitle":"נדרים","start":2,"end":181,"seder":"Seder Nashim"},{"title":"Nazir","label":"Nazir","heTitle":"נזיר","start":2,"end":131,"seder":"Seder Nashim"},{"title":"Sotah","label":"Sotah","heTitle":"סוטה","start":2,"end":97,"seder":"Seder Nashim"},{"title":"Gittin","label":"Gittin","heTitle":"גיטין","start":2,"end":179,"seder":"Seder Nashim"},{"title":"Kiddushin","label":"Kiddushin","heTitle":"קידושין","start":2,"end":163,"seder":"Seder Nashim"},{"title":"Bava Kamma","label":"Bava Kamma","heTitle":"בבא קמא","start":2,"end":237,"seder":"Seder Nezikin"},{"title":"Bava Metzia","label":"Bava Metzia","heTitle":"בבא מציעא","start":2,"end":236,"seder":"Seder Nezikin"},{"title":"Bava Batra","label":"Bava Batra","heTitle":"בבא בתרא","start":2,"end":351,"seder":"Seder Nezikin"},{"title":"Sanhedrin","label":"Sanhedrin","heTitle":"סנהדרין","start":2,"end":225,"seder":"Seder Nezikin"},{"title":"Makkot","label":"Makkot","heTitle":"מכות","start":2,"end":47,"seder":"Seder Nezikin"},{"title":"Shevuot","label":"Shevuot","heTitle":"שבועות","start":2,"end":97,"seder":"Seder Nezikin"},{"title":"Avodah Zarah","label":"Avodah Zarah","heTitle":"עבודה זרה","start":2,"end":151,"seder":"Seder Nezikin"},{"title":"Horayot","label":"Horayot","heTitle":"הוריות","start":2,"end":26,"seder":"Seder Nezikin"},{"title":"Zevachim","label":"Zevachim","heTitle":"זבחים","start":2,"end":239,"seder":"Seder Kodashim"},{"title":"Menachot","label":"Menachot","heTitle":"מנחות","start":2,"end":218,"seder":"Seder Kodashim"},{"title":"Chullin","label":"Chullin","heTitle":"חולין","start":2,"end":282,"seder":"Seder Kodashim"},{"title":"Bekhorot","label":"Bekhorot","heTitle":"בכורות","start":2,"end":120,"seder":"Seder Kodashim"},{"title":"Arakhin","label":"Arakhin","heTitle":"ערכין","start":2,"end":66,"seder":"Seder Kodashim"},{"title":"Temurah","label":"Temurah","heTitle":"תמורה","start":2,"end":66,"seder":"Seder Kodashim"},{"title":"Keritot","label":"Keritot","heTitle":"כריתות","start":2,"end":55,"seder":"Seder Kodashim"},{"title":"Meilah","label":"Meilah","heTitle":"מעילה","start":2,"end":42,"seder":"Seder Kodashim"},{"title":"Tamid","label":"Tamid","heTitle":"תמיד","start":49,"end":65,"seder":"Seder Kodashim"},{"title":"Niddah","label":"Niddah","heTitle":"נדה","start":2,"end":144,"seder":"Seder Tahorot"}];

const tractateSelect=document.getElementById("tractateSelect"),select=document.getElementById("amudSelect"),frame=document.getElementById("studioFrame"),menuToggle=document.getElementById("pageMenuToggle"),pageMenu=document.getElementById("pageMenu");
let currentKey="agent-builder";
const slug=title=>title.toLowerCase().replaceAll(" ","-");
function approvedPages(){try{const pages=JSON.parse(localStorage.getItem(APPROVED_KEY)||"[]");return Array.isArray(pages)?pages:[];}catch{return [];}}
for(const book of TRACTATES){
 book.slug=slug(book.title);
 let group=[...tractateSelect.children].find(g=>g.label===book.seder);
 if(!group){group=document.createElement("optgroup");group.label=book.seder;tractateSelect.append(group);}
 const option=document.createElement("option");option.value=book.slug;option.textContent=book.label;group.append(option);
 for(let i=book.start;i<=book.end;i++){
  const amud=`${Math.floor(i/2)+1}${i%2?"b":"a"}`,key=book.slug+"-"+amud,ref=book.title+" "+amud;
  if(!PAGES[key])PAGES[key]={path:`agent-builder/index.html?ref=${encodeURIComponent(ref)}&ui=62.72`,title:ref};
  Object.assign(PAGES[key],{tractate:book.slug,amud});
 }
}
function refreshApprovedOptions(){
 for(const page of Object.values(PAGES))delete page.preferredApprovedKey;
 for(const key of Object.keys(PAGES))if(key.startsWith("approved-"))delete PAGES[key];
 for(const page of [...approvedPages()].sort((a,b)=>String(a.approvedAt||a.id||" ").localeCompare(String(b.approvedAt||b.id||" ")))){
  if(!page?.id||typeof page.ref!=="string")continue;
  const match=page.ref.match(/^(.+?)\s+(\d+[ab])$/i);if(!match)continue;
  const title=match[1].replace(/^(Berachos|Berachot)$/i,"Berakhot").replace(/^Bava Metziah$/i,"Bava Metzia");
  const book=TRACTATES.find(b=>b.title.toLowerCase()===title.toLowerCase());if(!book)continue;
  PAGES[`approved-${page.id}`]={path:`agent-builder/index.html?approved=${encodeURIComponent(page.id)}&ui=62.75`,title:`${page.ref} — Approved Draft`,tractate:book.slug,amud:match[2].toLowerCase(),approved:true};
  const canonical=PAGES[book.slug+"-"+match[2].toLowerCase()];if(canonical)canonical.preferredApprovedKey=`approved-${page.id}`;
 }
 renderPages();
 syncApprovalBadge();
}
function renderPages(){
 const book=TRACTATES.find(b=>b.slug===tractateSelect.value)||TRACTATES[0];tractateSelect.value=book.slug;
 select.replaceChildren();
 const placeholder=document.createElement("option");placeholder.value="";placeholder.textContent="Choose daf / amud";select.append(placeholder);
 const counts=new Map();let savedGroup;
 for(const [key,page]of Object.entries(PAGES).filter(([,p])=>p.tractate===book.slug).sort(([,a],[,b])=>a.amud.localeCompare(b.amud,undefined,{numeric:true}))){
  const option=document.createElement("option");option.value=key;
  if(page.approved){if(!savedGroup){savedGroup=document.createElement("optgroup");savedGroup.label="Saved approved drafts";}const count=(counts.get(page.amud)||0)+1;counts.set(page.amud,count);option.textContent=`${page.amud} ✓ — approved version ${count}`;savedGroup.append(option);}
  else{option.textContent=page.amud+(page.preferredApprovedKey||page.builtinApproved?" ✓":"");if(page.preferredApprovedKey)option.title="Opens the latest saved approved layout";select.append(option);}
 }
 if(savedGroup)select.append(savedGroup);
 select.value=PAGES[currentKey]?.tractate===book.slug?currentKey:"";
}
function resolvedPage(key){const page=PAGES[key]||PAGES["agent-builder"];return PAGES[page.preferredApprovedKey]||page;}
function syncApprovalBadge(){const page=resolvedPage(currentKey),approved=page.approved===true||page.builtinApproved===true,badge=document.getElementById("currentApproval");badge.hidden=!approved;badge.textContent="✓ Approved";}
function selectedFromUrl(){const requested=new URLSearchParams(location.search).get("amud");return PAGES[requested]?requested:null;}
function closePageMenu(){pageMenu.hidden=true;menuToggle.setAttribute("aria-expanded","false");}
function loadAmud(key,{updateHistory=true}={}){
 currentKey=PAGES[key]?key:"agent-builder";const page=resolvedPage(currentKey);
 syncApprovalBadge();
 if(page.tractate)tractateSelect.value=page.tractate;renderPages();closePageMenu();
 frame.dataset.page=page.path;frame.contentWindow.location.replace(new URL(page.path,location.href).href);frame.title=page.title+" in Vilna Daf Studio";document.title=page.title+" | Vilna Daf Studio";
 localStorage.setItem("vilna-daf-combined-selected-amud",currentKey);
 if(updateHistory){const url=new URL(location.href);url.searchParams.set("amud",currentKey);history.pushState({amud:currentKey},"",url);}
}
tractateSelect.addEventListener("change",renderPages);
select.addEventListener("change",()=>{if(select.value)loadAmud(select.value);});
document.getElementById("newAmud").addEventListener("click",()=>loadAmud("agent-builder"));
document.getElementById("openDirect").addEventListener("click",()=>window.open(resolvedPage(currentKey).path,"_blank","noopener"));
menuToggle.addEventListener("click",()=>{const open=pageMenu.hidden;pageMenu.hidden=!open;menuToggle.setAttribute("aria-expanded",String(open));if(open)tractateSelect.focus();});
document.addEventListener("click",e=>{if(!e.target.closest(".page-navigation"))closePageMenu();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!pageMenu.hidden){closePageMenu();menuToggle.focus();}});
frame.addEventListener("load",()=>{try{frame.contentDocument.addEventListener("pointerdown",closePageMenu);}catch{}});
window.addEventListener("popstate",()=>loadAmud(selectedFromUrl()||"agent-builder",{updateHistory:false}));
window.addEventListener("focus",refreshApprovedOptions);
window.addEventListener("storage",e=>{if(e.key===APPROVED_KEY)refreshApprovedOptions();});
refreshApprovedOptions();const remembered=localStorage.getItem("vilna-daf-combined-selected-amud"),initial=selectedFromUrl()||(PAGES[remembered]?remembered:"agent-builder");loadAmud(initial,{updateHistory:false});
const canonicalUrl=new URL(location.href);canonicalUrl.searchParams.set("amud",initial);history.replaceState({amud:initial},"",canonicalUrl);
