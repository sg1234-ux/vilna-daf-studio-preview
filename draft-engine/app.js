const BUILD_VERSION=59;window.VILNA_DAF_BUILD=BUILD_VERSION;
const sample={ref:"Pesachim 99b",header:"ערבי פסחים פרק עשירי פסחים",isSample:true,
gemaraHtml:`<strong>ערב פסחים סמוך למנחה לא יאכל אדם עד שתחשך ואפילו עני שבישראל לא יאכל עד שיסב ולא יפחתו לו מארבע כוסות של יין ואפילו מן התמחוי.</strong> מאי איריא ערבי פסחים אפילו ערבי שבתות וימים טובים נמי דתניא לא יאכל אדם בערבי שבתות וימים טובים מן המנחה ולמעלה כדי שיכנס לשבת כשהוא תאוה דברי רבי יהודה רבי יוסי אומר אוכל והולך עד שתחשך. אמר רב הונא לא צריכא אלא לרבי יוסי דאמר אוכל והולך עד שתחשך הני מילי בערבי שבתות וימים טובים אבל בערב הפסח משום חיובא דמצה מודה. רב פפא אמר אפילו תימא רבי יהודה התם בערבי שבתות וימים טובים מן המנחה ולמעלה הוא דאסיר סמוך למנחה שרי אבל בערב הפסח אפילו סמוך למנחה נמי אסור. ובערב שבת סמוך למנחה שרי והתניא לא יאכל אדם בערב שבת וימים טובים מתשע שעות ולמעלה כדי שיכנס לשבת כשהוא תאוה דברי רבי יהודה רבי יוסי אומר אוכל והולך עד שתחשך. אמר מר זוטרא מאן לימא לן דמתרצתא היא.`,
rashiHtml:`<strong>סמוך למנחה.</strong> מעט קודם למנחה: <strong>לא יאכל.</strong> כדי שיאכל מצה של מצוה לתיאבון משום הידור מצוה: <strong>ואפילו עני שבישראל.</strong> לא יאכל עד שיסב כדרך בני חורין זכר לחירות במטה ועל השלחן: <strong>ארבע כוסות.</strong> כנגד ארבעה לשוני גאולה האמורים בגלות מצרים והוצאתי והצלתי וגאלתי ולקחתי:`,
rashbamHtml:`<strong>ערבי פסחים.</strong> נקט ערבי משום דמיירי סמוך למנחה: <strong>עד שתחשך.</strong> שלא יאכל מצה עד הלילה: <strong>מאי איריא.</strong> מאי שנא ערב פסח משאר ערבי ימים טובים: <strong>לא צריכא.</strong> דקתני ערב פסח סמוך למנחה: <strong>אפילו תימא.</strong> רבי יהודה היא ובדין הוא דליתני ערב פסח לא יאכל סמוך למנחה: <strong>מתשע שעות.</strong> היינו סמוך למנחה קטנה:`,
tosafotHtml:`<strong>ערב פסחים סמוך למנחה לא יאכל.</strong> פירוש אפילו התפלל דמשום מצה זכר לחירות נקט ערב פסחים: <strong>ואפילו מן התמחוי.</strong> מדקדק בירושלמי שאם יש לו מזון שתי סעודות לא יטול מן התמחוי: <strong>לא צריכא.</strong> ואם תאמר והא אמר בכל שעה בצקות של נכרים אדם ממלא כריסו מהם ובלבד שיאכל כזית מצה באחרונה. ויש לומר דהתם מיירי קודם זמן איסורו אבל הכא סמוך למנחה משום הידור מצוה: <strong>עד שתחשך.</strong> מקשי אמאי איצטריך למיתני פשיטא דמצה בלילה כדכתיב בערב תאכלו מצות. ויש לומר דאתא לאשמועינן דלא יאכל עד שתחשך אפילו התחיל בהיתר: <strong>רבי יוסי אומר אוכל והולך.</strong> והלכה כרבי יוסי בערבי שבתות וימים טובים אבל בערב הפסח מודה משום מצה:`};

const $=id=>document.getElementById(id),STREAMS=["inner","gemara","tosafot"];
const TYPOGRAPHY_PRESETS={
  "archival-open":{className:"type-archival-open",label:"Drugulin CLM Gemara with Mekorot Rashi-style commentary.",localFonts:[]},
  "otzar-vilna":{className:"type-otzar-vilna",label:"OT Vilna Gemara with Mekorot commentary.",localFonts:["OT Vilna","OT Vilna VF","Vilna"]},
  "vilna-mf":{className:"type-vilna-mf",label:"Vilna MF Gemara with Mekorot commentary.",localFonts:["Vilna MF Medium Pro","Vilna MF Medium","Vilna MF"]},
  "build31":{className:"type-build31",label:"Build 31 comparison: Frank Ruhl Libre with Noto Rashi Hebrew.",localFonts:[]}
};
const PAGE_REGISTRY=[
  {tractate:"Bava Metzia",tractateLabel:"בבא מציעא",ref:"Bava Metzia 21a",pageLabel:"כא ע״א",verified:true}
];
const savedTypography=localStorage.getItem("vilna-daf-typography");
const state={...sample,selection:null,selecting:false,composition:null,agentSettings:{},rashbamHeadingMode:"full",rashbamAllowed:true,typography:TYPOGRAPHY_PRESETS[savedTypography]?savedTypography:"archival-open",mode:"navigate",navigationUnit:"word",selectedWordId:null,editSelectedWordIds:[],wordFontScales:{},whitedWordIds:{},focusEnabled:false,focusWindow:1,visualLinks:{},notesEnabled:false,nekudosEnabled:true,lineNumbersEnabled:false,pageZoom:1.5,notes:{},noteWindowPosition:null,annotating:false,annotationTool:"pen",annotationColor:"#b32424",strokeWidth:3,annotations:[],annotationUndo:[],annotationRedo:[]};
const readingState={recognition:null,active:false,stopping:false,startId:null,targetIds:[],finalTranscript:"",interimTranscript:"",lastAlignment:null,error:null};
$("buildBadge").textContent=`Build ${BUILD_VERSION} Draft`;document.title=`Vilna Daf Studio Agent Draft - Build ${BUILD_VERSION}`;

async function localFontAvailable(names){
  for(const name of names){try{await new FontFace("VilnaLocalProbe",`local("${name}")`).load();return true;}catch{}}
  return false;
}
async function applyTypography(key,{recompose=true}={}){
  const preset=TYPOGRAPHY_PRESETS[key]||TYPOGRAPHY_PRESETS["archival-open"],page=$("dafPage");
  for(const item of Object.values(TYPOGRAPHY_PRESETS))page.classList.remove(item.className);
  page.classList.add(preset.className);state.typography=key;$("typographyPreset").value=key;localStorage.setItem("vilna-daf-typography",key);
  await document.fonts.ready;
  const available=!preset.localFonts.length||await localFontAvailable(preset.localFonts);
  $("typographyStatus").textContent=available?preset.label:`${preset.label} Licensed font not detected; the bundled archival fallback is shown.`;
  if(recompose){if(state.dirty)await reflowPageEdits();else await compose();}
}

// A verified scan can override the generic compositor without becoming the text
// source.  The anchors below are the last words of the 23 substantive Gemara lines
// on the uploaded Vilna Pesachim 99b PDF.  Sefaria remains the editable source.
// The isolated catchword at the bottom of a printed region previews the next
// amud and is intentionally excluded; Sefaria's page boundary governs content.
const REFERENCE_PROFILES={
  "pesachim 99b":{
    source:"Uploaded Vilna PDF / Shas.org page 840",
    typography:{gemaraOpeningScale:1.34,innerDibburScale:1.055,tosafotDibburScale:1.11,gemaraLeading:16.35,commentaryLeading:15.2161,pageHeight:1112,pageBottomPadding:16.7839},
    layout:{openingLines:4,narrowLines:28,pairLines:19,fullLines:16,survivor:"tosafot"},
    notice:{stream:"tosafot",lines:1,text:"(תוספות אחרים מערבי פסחים נמצאים בספר רב מרדכי)"},
    // Exact zero-based Sefaria word indexes. Repeated Hebrew words are never
    // used as anchors. The inserted two-line Rashbam title is part of `inner`.
    maps:{
      // These indexes are applied after the first-perek `מתני׳` label is removed.
      gemara:{tokenCount:157,lineEndTokens:[5,9,16,24,31,38,45,51,59,67,75,83,90,97,103,110,116,122,129,135,141,148,156]},
      inner:{tokenCount:399,blankAfterTokens:[132],lineEndTokens:[12,21,33,44,49,54,60,65,70,78,84,91,97,103,109,115,121,126,132,135,138,143,147,153,159,164,170,177,182,190,196,208,220,231,243,255,265,278,288,298,310,324,336,347,358,368,379,389,398]},
      tosafot:{tokenCount:748,lineEndTokens:[11,18,29,34,40,47,54,59,65,71,78,83,88,94,100,104,110,115,123,129,135,140,147,153,160,166,172,179,185,192,197,203,213,223,233,242,252,263,274,286,297,309,320,331,342,350,362,373,383,393,404,429,453,473,497,520,545,569,591,612,633,653,676,701,726,747]}
    }
  },
  "bava metzia 21a":{
    source:"Uploaded Vilna PDF: Bava Metzia 21a",
    typography:{gemaraSize:15.1,commentarySize:9.2,dibburSizeIncrease:"0.8px",gemaraOpeningScale:1.12,innerDibburScale:1.02,tosafotDibburScale:1.04,gemaraLeading:14.8,commentaryLeading:12.685714,pageHeight:1030,pageBottomPadding:32},
    layout:{
      openingLines:5,
      boxWalls:false,
      allowHorizontalCompression:false,
      extraLineHeights:{inner:1},
      stages:[
        {streams:["tosafot","gemara","inner"],widths:[1.625,2.5,1.625],counts:{gemara:42,inner:48,tosafot:49}},
        {streams:["tosafot","gemara"],widths:[1.625,4.375],counts:{gemara:9,tosafot:11}},
        {streams:["tosafot"],widths:[100],counts:{tosafot:2}}
      ]
    },
    maps:{
      gemara:{tokenCount:387,lineEndTokens:[7,15,22,30,36,43,50,58,64,71,78,84,88,96,101,106,112,119,124,132,140,146,153,160,169,176,183,192,198,205,212,220,228,235,242,250,257,264,270,277,283,291,297,303,314,326,338,350,362,374,386]},
      inner:{tokenCount:337,lineEndTokens:[11,22,33,45,51,58,65,70,77,82,87,93,99,101,105,111,116,121,128,134,140,144,149,156,162,168,175,181,187,192,198,205,210,217,223,230,237,243,250,256,263,269,275,281,287,292,300,305,312,317,324,329,336]},
      tosafot:{tokenCount:444,lineEndTokens:[10,21,34,43,48,53,60,66,72,77,82,88,94,100,106,111,116,122,128,134,139,144,149,156,161,168,175,183,190,196,201,207,214,220,226,231,238,245,251,257,262,268,273,275,280,285,291,298,304,311,317,323,330,335,341,347,353,361,367,373,379,386,393,399,406,429,443]}
    }
  }
};
// Exact phrase rows from the Pesachim 99b–100a Milim ID chart.  Phrase
// navigation uses these semantic units rather than guessing from punctuation
// or from the printed line breaks of the Vilna page.
const PHRASE_PROFILES={
  "pesachim 99b":[
    "ערב פסחים סמוך למנחה",
    "לא יאכל אדם עד שתחשך",
    "אפילו עני שבישראל",
    "לא יאכל עד שיסב",
    "ולא יפחתו לו מארבע כוסות של יין",
    "ואפילו מן התמחוי",
    "מאי איריא ערבי פסחים",
    "אפילו ערבי שבתות וימים טובים נמי",
    "דתניא לא יאכל אדם בערבי שבתות וימים טובים מן המנחה ולמעלה",
    "כדי שיכנס לשבת כשהוא תאוה",
    "דברי רבי יהודה",
    "רבי יוסי אומר אוכל והולך עד שתחשך",
    "אמר רב הונא לא צריכא אלא לרבי יוסי",
    "דאמר אוכל והולך עד שתחשך",
    "הני מילי בערבי שבתות וימים טובים",
    "אבל בערב הפסח משום חיובא דמצה מודה",
    "רב פפא אמר אפילו תימא רבי יהודה",
    "התם בערבי שבתות וימים טובים מן המנחה ולמעלה הוא דאסיר",
    "סמוך למנחה שרי",
    "אבל בערב הפסח אפילו סמוך למנחה נמי אסור",
    "ובערב שבת סמוך למנחה שרי והתניא",
    "לא יאכל אדם בערב שבת וימים טובים מתשע שעות ולמעלה",
    "כדי שיכנס לשבת כשהוא תאוה",
    "דברי רבי יהודה",
    "רבי יוסי אומר אוכל והולך עד שתחשך",
    "אמר מר זוטרא מאן לימא לן דמתרצתא היא"
  ],
  "bava metzia 21a":[
    "מצא פירות מפוזרין",
    "וכמה",
    "אמר רבי יצחק",
    "קב בארבע אמות",
    "היכי דמי",
    "אי דרך נפילה",
    "אפילו טובא נמי",
    "ואי דרך הינוח",
    "אפילו בציר מהכי נמי לא",
    "אמר רב עוקבא בר חמא",
    "במכנשתא דבי דרי עסקינן",
    "קב בארבע אמות",
    "דנפיש טרחייהו",
    "לא טרח איניש",
    "ולא הדר אתי ושקיל להו",
    "אפקורי מפקר להו",
    "בציר מהכי",
    "טרח והדר אתי ושקיל להו",
    "ולא מפקר להו",
    "בעי רבי ירמיה",
    "חצי קב בשתי אמות",
    "מהו",
    "קב בארבע אמות",
    "טעמא מאי",
    "משום דנפיש טרחייהו",
    "חצי קב בשתי אמות",
    "כיון דלא נפיש טרחייהו",
    "לא מפקר להו",
    "או דלמא משום דלא חשיבי",
    "וחצי קב בשתי אמות",
    "כיון דלא חשיבי",
    "מפקר להו",
    "קביים בשמונה אמות",
    "מהו",
    "קב בארבע אמות",
    "טעמא מאי",
    "משום דנפיש טרחייהו",
    "וכל שכן קביים בשמונה אמות",
    "כיון דנפישא טרחייהו",
    "טפי מפקר להו",
    "או דלמא משום דלא חשיבי",
    "וקביים בשמונה אמות",
    "כיון דחשיבי",
    "לא מפקר להו",
    "קב שומשמין בארבע אמות",
    "מהו",
    "קב בארבע אמות",
    "טעמא מאי",
    "משום דלא חשיבי",
    "ושומשמין",
    "כיון דחשיבי",
    "לא מפקר להו",
    "או דלמא משום דנפיש טרחייהו",
    "וכל שכן שומשמין",
    "כיון דנפיש טרחייהו טפי",
    "מפקר להו",
    "קב תמרי בארבע אמות",
    "קב רמוני בארבע אמות",
    "מהו",
    "קב בארבע אמות",
    "טעמא מאי",
    "משום דלא חשיבי",
    "קב תמרי בארבע אמות",
    "קב רמוני בארבע אמות נמי",
    "כיון דלא חשיבי",
    "מפקר להו",
    "או דלמא משום דנפישא טרחייהו",
    "וקב תמרי בארבע אמות",
    "וקב רמוני בארבע אמות",
    "כיון דלא נפיש טרחייהו",
    "לא מפקר להו",
    "מאי",
    "תיקו"
  ]
};
function referenceProfile(ref=state.ref){return state.isSample?null:REFERENCE_PROFILES[ref.trim().toLowerCase()]||null;}
function phraseProfile(ref=state.ref){return PHRASE_PROFILES[ref.trim().toLowerCase()]||null;}
function profileOpeningSourceLines(profile,stream){if(stream==="gemara")return 0;return profile.layout.openingLines-(profile.notice?.stream===stream?(profile.notice.lines||0):0);}
function profileStages(profile){
  if(Array.isArray(profile.layout.stages))return profile.layout.stages.map(stage=>{const order=ordered(stage.streams),widthMap=Object.fromEntries(stage.streams.map((stream,index)=>[stream,stage.widths[index]]));return{...stage,streams:order,widths:order.map(stream=>widthMap[stream])};});
  return[
    {streams:ordered(STREAMS),widths:primaryWidths(),counts:{gemara:profile.maps.gemara.lineEndTokens.length,inner:profile.layout.narrowLines,tosafot:profile.layout.narrowLines}},
    {streams:ordered(["inner","tosafot"]),widths:[50,50],counts:{inner:profile.layout.pairLines-1,tosafot:profile.layout.pairLines}},
    {streams:[profile.layout.survivor],widths:[100],counts:{[profile.layout.survivor]:profile.layout.fullLines}}
  ];
}
function auditReferenceProfile(profile){
  const errors=[],layout=profile?.layout,maps=profile?.maps;
  if(!layout||!maps)return["missing mapped layout"];
  const stages=profileStages(profile);
  for(const stream of STREAMS){
    const map=maps[stream],ends=map?.lineEndTokens||[];
    if(!map||ends.at(-1)!==map.tokenCount-1||ends.some((end,i)=>!Number.isInteger(end)||end<0||(i&&end<=ends[i-1])))errors.push(`${stream} token coverage`);
    const physical=(map?.lineEndTokens?.length||0)+(map?.blankAfterTokens?.length||0),allocated=profileOpeningSourceLines(profile,stream)+stages.reduce((sum,stage)=>sum+(stage.counts?.[stream]||0),0);
    if(physical!==allocated)errors.push(`${stream} stage allocation (${physical} lines / ${allocated} slots)`);
  }
  stages.forEach((stage,index)=>{if(!stage.streams?.length||stage.widths?.length!==stage.streams.length||stage.streams.some(stream=>!STREAMS.includes(stream))||stage.streams.some(stream=>!Number.isInteger(stage.counts?.[stream])||stage.counts[stream]<0))errors.push(`stage ${index+1} definition`);});
  return errors;
}

function cleanHtml(html){const box=document.createElement("div"),allowedClasses=new Set(["commentary-heading","rashbam-transition"]);box.innerHTML=String(html||"");box.querySelectorAll("script,style,iframe,img,a").forEach(n=>n.replaceWith(...n.childNodes));box.querySelectorAll("*").forEach(n=>{if(n.tagName==="SPAN"&&allowedClasses.has(n.className)){[...n.attributes].forEach(a=>{if(a.name!=="class")n.removeAttribute(a.name);});return;}if(!["B","STRONG","I","EM","BR"].includes(n.tagName))n.replaceWith(...n.childNodes);else[...n.attributes].forEach(a=>n.removeAttribute(a.name));});return box.innerHTML.replace(/\s+/g," ").trim();}
function htmlToPlain(html){const b=document.createElement("div");b.innerHTML=html;return(b.textContent||"").replace(/\s+/g," ").trim();}
function escapeHtml(t){return t.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function stripNekudos(value){return String(value||"").normalize("NFD").replace(/[\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7]/gu,"").normalize("NFC");}
function displayHtml(html){return state.nekudosEnabled?html:stripNekudos(html);}
// Sefaria returns commentary as separate array leaves.  Preserve that boundary:
// the first dash in each leaf separates its dibbur hamatchil from the comment.
// Process the leaf before flattening so a missing dash can never bold a later
// comment, which was the failure mode in Build 37.
function formatCommentaryLeaf(html){
  const cleaned=cleanHtml(html),box=document.createElement("div");box.innerHTML=cleaned;
  const walker=document.createTreeWalker(box,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  let separator=null;
  for(const node of nodes){const match=node.data.match(/[–—-]/u);if(match){separator={node,index:match.index};break;}}
  if(!separator)return cleaned;
  box.querySelectorAll("b,strong").forEach(node=>node.replaceWith(...node.childNodes));
  const {node,index}=separator,prefix=node.data.slice(0,index).replace(/\s+$/u,""),suffix=node.data.slice(index+1).replace(/^\s+/u,"");
  node.data=`${prefix}. ${suffix}`.trimEnd();
  const range=document.createRange();range.setStart(box,0);range.setEnd(node,prefix.length);
  const opening=range.extractContents(),strong=document.createElement("strong");strong.append(opening);box.insertBefore(strong,box.firstChild);
  return cleanHtml(box.innerHTML);
}
function flattenSefaria(value,{commentary=false}={}){return Array.isArray(value)?value.flat(Infinity).filter(Boolean).map(item=>flattenSefaria(item,{commentary})).join(" "):commentary?formatCommentaryLeaf(value):cleanHtml(value);}
function tokenize(html){const box=document.createElement("div"),tokens=[];box.innerHTML=cleanHtml(html);function visit(n,bold=false,italic=false,heading=false,transition=false){if(n.nodeType===Node.TEXT_NODE){(n.textContent.match(/\S+/g)||[]).forEach(text=>tokens.push({text,bold,italic,heading,transition}));return;}if(n.nodeType!==Node.ELEMENT_NODE)return;if(n.tagName==="BR"){tokens.push({break:true,heading,transition});return;}const b=bold||n.tagName==="B"||n.tagName==="STRONG",i=italic||n.tagName==="I"||n.tagName==="EM",h=heading||n.classList.contains("commentary-heading"),t=transition||n.classList.contains("rashbam-transition");[...n.childNodes].forEach(c=>visit(c,b,i,h,t));}[...box.childNodes].forEach(n=>visit(n));return tokens;}
function tokensHtml(tokens){let html="",mode="";const close=m=>`${m.includes("i")?"</em>":""}${m.includes("b")?"</strong>":""}${m.includes("h")?"</span>":""}${m.includes("t")?"</span>":""}`,open=m=>`${m.includes("t")?'<span class="rashbam-transition">':""}${m.includes("h")?'<span class="commentary-heading">':""}${m.includes("b")?"<strong>":""}${m.includes("i")?"<em>":""}`;for(const token of tokens){const next=`${token.transition?"t":""}${token.heading?"h":""}${token.bold?"b":""}${token.italic?"i":""}`,attachedPunctuation=!token.break&&/^[.׃,:;!?]+$/u.test(token.text);if(attachedPunctuation)html=html.replace(/\s+$/u,"");if(next!==mode){html+=close(mode)+open(next);mode=next;}html+=token.break?"<br>":`${escapeHtml(token.text)} `;}html+=close(mode);return html.trim();}
function splitMappedLines(tokens){const lines=[],line=[];for(const token of tokens){if(token.blankLine){if(line.length)lines.push(line.splice(0));lines.push(null);continue;}if(token.break){if(line.length)lines.push(line.splice(0));continue;}line.push(token);}if(line.length)lines.push(line);return lines;}
function mappedCommentEndsHere(lines,index){const current=lines[index];if(!current?.length)return false;const next=lines.slice(index+1).find(line=>line?.length),last=current.at(-1);return!next||Boolean(next[0]?.bold&&!last?.bold);}
function normalizedMappedLine(line){return(line||[]).map(token=>token.text||"").join("").replace(/[^\u05d0-\u05ea]/g,"");}
function markMappedCommentEnds(lines,stream=""){lines.forEach((line,index)=>{if(line)line.commentEnd=mappedCommentEndsHere(lines,index)||(stream==="tosafot"&&normalizedMappedLine(line).includes("וכןהיהנוהגרת"));});return lines;}
function isHadranLine(lineTokens){return normalizedMappedLine(lineTokens)==="הדרןעלךשניםאוחזין";}
function mappedLinesHtml(lines){return lines.map((lineTokens,index)=>`<span class="mapped-line mapped-line-${index+1}${lineTokens===null?" mapped-blank-line":""}${lineTokens?.commentEnd?" mapped-comment-end-line":""}${isHadranLine(lineTokens)?" mapped-hadran-line":""}">${lineTokens===null?"":tokensHtml(lineTokens)}</span>`).join("");}
function mappedTokensHtml(tokens,stream=""){return mappedLinesHtml(markMappedCommentEnds(splitMappedLines(tokens),stream));}
function renderedTokens(tokens,region){return region?.classList.contains("reference-mapped")?mappedTokensHtml(tokens,region.dataset.stream):tokensHtml(tokens);}
function fitMappedLineWidths(region){if(!region?.classList.contains("reference-mapped"))return;const allowCompression=referenceProfile()?.layout?.allowHorizontalCompression!==false;for(const line of region.querySelectorAll(":scope > .mapped-line")){line.style.transform="";line.dataset.widthScale="1";line.dataset.requiredScale="1";const available=line.clientWidth,natural=line.scrollWidth;if(available>0&&natural>available+.5){const required=available/natural;line.dataset.requiredScale=String(required);if(allowCompression){const scale=Math.max(.88,required);line.style.transformOrigin="right center";line.style.transform=`scaleX(${scale})`;line.dataset.widthScale=String(scale);}}}}
function applyExactLineMap(tokens,map,stream){
  if(!map)throw new Error(`Missing exact PDF map for ${stream}`);
  const words=tokens.filter(token=>!token.break),ends=map.lineEndTokens||[];
  const valid=Number.isInteger(map.tokenCount)&&map.tokenCount===words.length&&ends.length>0&&ends.at(-1)===words.length-1&&ends.every((end,i)=>Number.isInteger(end)&&end>=0&&end<words.length&&(i===0||end>ends[i-1]));
  if(!valid)throw new Error(`PDF map mismatch for ${stream}: expected ${map.tokenCount} tokens, received ${words.length}`);
  const endSet=new Set(ends),blankSet=new Set(map.blankAfterTokens||[]),out=[];let wordIndex=0;
  for(const token of tokens){
    if(token.break)continue;
    out.push({...token,mapWordIndex:wordIndex});
    if(endSet.has(wordIndex)&&wordIndex<words.length-1){out.push({break:true,reference:true});if(blankSet.has(wordIndex))out.push({blankLine:true,reference:true});}
    wordIndex++;
  }
  return out;
}
function isAleph(ref){return/\d+a\s*$/i.test(ref.trim());}
function physicalOrder(){return isAleph(state.ref)?["tosafot","gemara","inner"]:["inner","gemara","tosafot"];}
function toHebrewNumber(number){const vals=[[400,"ת"],[300,"ש"],[200,"ר"],[100,"ק"],[90,"צ"],[80,"פ"],[70,"ע"],[60,"ס"],[50,"נ"],[40,"מ"],[30,"ל"],[20,"כ"],[10,"י"],[9,"ט"],[8,"ח"],[7,"ז"],[6,"ו"],[5,"ה"],[4,"ד"],[3,"ג"],[2,"ב"],[1,"א"]];let n=+number,out="";for(const[v,l]of vals)while(n>=v){out+=l;n-=v;}return out;}
function updateHeader(){const m=state.ref.match(/(\d+)([ab])\s*$/i),a=m?.[2].toLowerCase()==="a",profile=referenceProfile(),type=profile?.typography||{},settings=state.agentSettings||{};$("dafPage").classList.toggle("amud-a",a);$("dafPage").classList.toggle("amud-b",!a);$("dafNumber").textContent=m?`${toHebrewNumber(m[1])}${a?".":":"}`:state.ref;$("chapterTitle").textContent=state.header;$("amudReport").textContent=a?"Aleph — ע״א":"Beis — ע״ב";$("dafPage").style.setProperty("--gemara-opening-scale",type.gemaraOpeningScale||1.22);$("dafPage").style.setProperty("--inner-dibbur-scale",type.innerDibburScale||1.04);$("dafPage").style.setProperty("--tosafot-dibbur-scale",type.tosafotDibburScale||1.08);$("dafPage").style.setProperty("--dibbur-size-increase",type.dibburSizeIncrease||"2.5pt");$("dafPage").style.setProperty("--page-height",`${settings.pageHeight||type.pageHeight||1030}px`);$("dafPage").style.setProperty("--page-bottom-padding",`${type.pageBottomPadding||32}px`);$("dafPage").style.setProperty("--opening-lines",settings.openingLines||profile?.layout?.openingLines||4);}
function scaleParts(scale){return typeof scale==="number"?{gemara:scale,commentary:scale}:{gemara:scale.gemara,commentary:scale.commentary};}
function setScale(scale){const p=$("dafPage"),s=scaleParts(scale),type=referenceProfile()?.typography||{},settings=state.agentSettings||{},gemaraSize=(type.gemaraSize||15.1)*(settings.gemaraScale||1),commentarySize=(type.commentarySize||11.05)*(settings.commentaryScale||1),gemaraLeading=(type.gemaraLeading||16.35)*(settings.gemaraScale||1),commentaryLeading=(type.commentaryLeading||12.05)*(settings.commentaryScale||1);p.style.setProperty("--gemara-size",`${gemaraSize*s.gemara}px`);p.style.setProperty("--gemara-leading",`${gemaraLeading*s.gemara}px`);p.style.setProperty("--commentary-size",`${commentarySize*s.commentary}px`);p.style.setProperty("--commentary-leading",`${commentaryLeading*s.commentary}px`);}
function makeProbe(region){const cs=getComputedStyle(region),p=document.createElement("div");p.className=region.className;Object.assign(p.style,{position:"fixed",visibility:"hidden",left:"-10000px",top:"-10000px",width:`${region.clientWidth}px`,height:"auto",overflow:"visible",boxSizing:"border-box",paddingTop:cs.paddingTop,paddingRight:cs.paddingRight,paddingBottom:cs.paddingBottom,paddingLeft:cs.paddingLeft,fontFamily:cs.fontFamily,fontSize:cs.fontSize,fontWeight:cs.fontWeight,lineHeight:cs.lineHeight,direction:"rtl",textAlign:"justify",whiteSpace:"normal",wordSpacing:cs.wordSpacing,letterSpacing:cs.letterSpacing});document.body.appendChild(p);return p;}
function fitTokens(tokens,region){if(!tokens.length||region.clientWidth<5||region.clientHeight<5)return{chunk:[],rest:tokens,usedHeight:0};const p=makeProbe(region),mapped=region.classList.contains("reference-mapped");let lo=0,hi=tokens.length;while(lo<hi){const mid=Math.ceil((lo+hi)/2);p.innerHTML=renderedTokens(tokens.slice(0,mid),region);if(p.getBoundingClientRect().height<=region.clientHeight+.35&&(mapped||p.scrollWidth<=p.clientWidth+1))lo=mid;else hi=mid-1;}if(mapped&&lo<tokens.length){let boundary=0;for(let i=0;i<lo;i++)if(tokens[i].break||tokens[i].blankLine)boundary=i+1;lo=boundary;}if(lo>0&&lo<tokens.length&&tokens[lo-1].transition&&tokens[lo].transition)while(lo>0&&tokens[lo-1].transition)lo--;const chunk=tokens.slice(0,lo);p.innerHTML=renderedTokens(chunk,region);const usedHeight=p.getBoundingClientRect().height;p.remove();return{chunk,rest:tokens.slice(lo),usedHeight};}
function naturalLastLineFill(region){region.classList.remove("line-end-justify","line-end-center");const range=document.createRange();range.selectNodeContents(region);const rects=[...range.getClientRects()].filter(r=>r.width>.2&&r.height>.2);if(!rects.length)return 0;const bottom=Math.max(...rects.map(r=>r.bottom)),tolerance=Math.max(1,(parseFloat(getComputedStyle(region).lineHeight)||12)*.35),last=rects.filter(r=>Math.abs(r.bottom-bottom)<=tolerance),width=last.reduce((sum,r)=>sum+r.width,0);return Math.min(1,width/Math.max(1,region.clientWidth));}
function finishRegionLine(region,continues){if(!region.textContent.trim())return;const fill=naturalLastLineFill(region);region.classList.add(continues||fill>=.55?"line-end-justify":"line-end-center");}
function fillStream(tokens,regions,shapeLines=false){let rest=tokens,blankArea=0,totalArea=0;const occupancy=[],filled=[],regionStates=[];for(const region of regions){const beforeCount=rest.length,r=fitTokens(rest,region);region.innerHTML=renderedTokens(r.chunk,region);fitMappedLineWidths(region);rest=r.rest;filled.push({region,continues:rest.length>0});const ratio=region.clientHeight?Math.min(1,r.usedHeight/region.clientHeight):0,area=region.clientWidth*region.clientHeight;occupancy.push(ratio);totalArea+=area;blankArea+=area*(1-ratio);regionStates.push({bandIndex:Number(region.dataset.band),beforeCount,placedCount:r.chunk.length,afterCount:rest.length,usedHeight:r.usedHeight,regionHeight:region.clientHeight,lineHeight:parseFloat(getComputedStyle(region).lineHeight)||1});}if(shapeLines)filled.forEach(({region,continues})=>finishRegionLine(region,continues));return{rest,blankArea,totalArea,occupancy,regionStates};}

function withoutBreaks(html){return html.replace(/<br\s*\/?\s*>/gi," ").replace(/\s+/g," ").trim();}
function rashbamHeadingHtml(){if(state.rashbamHeadingMode==="full")return'<span class="commentary-heading"><strong>פירוש רבינו שמואל<br>תלמיד רש״י ז״ל</strong></span>';if(state.rashbamHeadingMode==="short")return'<span class="commentary-heading"><strong>רשב״ם</strong></span>';return"";}
function innerHtml(){const r=withoutBreaks(state.rashiHtml.trim()),b=withoutBreaks(state.rashbamHtml.trim());if(!b)return r;const heading=rashbamHeadingHtml(),transition=heading?`<span class="rashbam-transition"><br><br>${heading}<br></span>`:"";if(!r)return`${heading}${heading?"<br>":""}${b}`;return`${r}${transition}${b}`;}
function normalizeMappedSourceTokens(tokens,stream){if(/^Bava\s+Metzia\s+21a$/i.test(state.ref)&&stream==="gemara")return tokens.filter(token=>token.break||!/^[–—-]+$/u.test(token.text||""));return tokens;}
function streamTokens(){const streams={gemara:tokenize(displayHtml(withoutBreaks(state.gemaraHtml))),inner:tokenize(displayHtml(innerHtml())),tosafot:tokenize(displayHtml(withoutBreaks(state.tosafotHtml)))},profile=referenceProfile();if(profile)for(const stream of STREAMS)streams[stream]=applyExactLineMap(normalizeMappedSourceTokens(streams[stream],stream),profile.maps?.[stream],stream);return streams;}
function weightsFor(t){return{gemara:t.gemara.length*1.52,inner:t.inner.length,tosafot:t.tosafot.length};}
function ordered(streams){const order=physicalOrder();return[...streams].sort((a,b)=>order.indexOf(a)-order.indexOf(b));}
function widths(streams,w,floor=18){const total=streams.reduce((s,x)=>s+w[x],0)||1;let a=streams.map(x=>Math.max(floor,w[x]/total*100)),sum=a.reduce((x,y)=>x+y,0);return a.map(x=>x/sum*100);}
function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
function primaryWidths(){const order=ordered(STREAMS),commentary=1.625,gemara=2.5,map={gemara,inner:commentary,tosafot:commentary};return order.map(stream=>map[stream]);}
function stepped(start,end,step){const values=[];for(let value=start;value<=end;value+=step)values.push(value);return values;}
function pairWidths(streams,w){return streams.length===2&&streams.includes("inner")&&streams.includes("tosafot")?[50,50]:widths(streams,w,28);}
function mappedCascadePattern(profile){
  const gutter=parseFloat(getComputedStyle($("dafPage")).getPropertyValue("--daf-gutter"))||25,gemaraLeading=parseFloat(getComputedStyle($("dafPage")).getPropertyValue("--gemara-leading"))||16.35,commentaryLeading=parseFloat(getComputedStyle($("dafPage")).getPropertyValue("--commentary-leading"))||12.05;
  const boxWalls=profile.layout.boxWalls!==false,stages=profileStages(profile),bands=stages.map((stage,index)=>{const lineHeight=stream=>stream==="gemara"?gemaraLeading:commentaryLeading,extra=stream=>index===0?(profile.layout.extraLineHeights?.[stream]||0):0,contentHeight=Math.max(...stage.streams.map(stream=>((stage.counts[stream]||0)+extra(stream))*lineHeight(stream))),wallHeight=index===0&&boxWalls&&stage.streams.includes("gemara")?gutter*2:0;return{height:0,...(index<stages.length-1?{pixelHeight:contentHeight+wallHeight}:{}),streams:stage.streams,widths:stage.widths,counts:stage.counts};});
  return{name:"PDF-mapped verified stage layout",cascade:true,mapped:true,boxWalls,bands};
}
function candidates(w){const three=ordered(STREAMS),top=primaryWidths(w),commentaryPair=ordered(["inner","tosafot"]),guided=state.agentSettings.forceCascade&&["inner","tosafot"].includes(state.agentSettings.preferredSurvivor);if(guided){const survivor=state.agentSettings.preferredSurvivor,lines=state.agentSettings.continuationLines||2,leading=parseFloat(getComputedStyle($("dafPage")).getPropertyValue("--commentary-leading"))||12.05;return stepped(28,82,3).map(upper=>({name:`teacher-guided ${survivor} takeover (${lines} narrow lines)`,cascade:true,guided:true,bands:[{height:upper,streams:three,widths:top},{height:0,pixelHeight:lines*leading,streams:commentaryPair,widths:[50,50]},{height:100-upper,streams:[survivor],widths:[100]}]}));}const out=[{name:"continuous three-column",bands:[{height:100,streams:three,widths:top}]}];for(const cut of stepped(32,86,12))for(const owner of STREAMS)out.push({name:`${owner} lower continuation`,bands:[{height:cut,streams:three,widths:top},{height:100-cut,streams:[owner],widths:[100]}]});for(const cut of stepped(28,82,12))for(const omitted of STREAMS){const lower=ordered(STREAMS.filter(s=>s!==omitted));out.push({name:`${lower.join(" + ")} lower band`,bands:[{height:cut,streams:three,widths:top},{height:100-cut,streams:lower,widths:pairWidths(lower,w)}]});}for(const upper of stepped(28,60,16))for(const middle of stepped(12,44,16))if(upper+middle<94)for(const survivor of["inner","tosafot"])out.push({name:`cascading ${survivor} takeover`,cascade:true,bands:[{height:upper,streams:three,widths:top},{height:middle,streams:commentaryPair,widths:[50,50]},{height:100-upper-middle,streams:[survivor],widths:[100]}]});return out;}
function buildGeometry(pattern){
  const body=$("bodyGeometry"),regions={gemara:[],inner:[],tosafot:[]},totalHeight=body.clientHeight,leading=parseFloat(getComputedStyle($("topRight")).lineHeight)||12,heights=[];
  let used=0;pattern.bands.forEach((band,i)=>{if(i===pattern.bands.length-1)heights.push(Math.max(0,totalHeight-used));else{const desired=Number.isFinite(band.pixelHeight)?band.pixelHeight:totalHeight*band.height/100,snapped=Number.isFinite(band.pixelHeight)?desired:Math.max(leading,Math.round(desired/leading)*leading);heights.push(snapped);used+=snapped;}});
  const bridgeNeeded=!pattern.mapped&&pattern.bands.length>1&&pattern.bands[0].streams.includes("gemara")&&!pattern.bands[1].streams.includes("gemara")&&pattern.bands[1].streams.includes("inner")&&pattern.bands[1].streams.includes("tosafot"),bridgeHeight=bridgeNeeded?(parseFloat(getComputedStyle($("dafPage")).getPropertyValue("--daf-gutter"))||25):0;
  if(bridgeNeeded&&heights[0]>bridgeHeight+leading)heights[0]-=bridgeHeight;
  body.innerHTML="";body.classList.toggle("mapped-geometry",Boolean(pattern.mapped));body.classList.toggle("mapped-no-box-walls",Boolean(pattern.mapped&&pattern.boxWalls===false));
  const addRegion=(row,stream,bandIndex)=>{const r=document.createElement("div"),profile=referenceProfile(),mapped=Boolean(profile?.maps?.[stream]?.lineEndTokens?.length);r.className=`flow-region ${stream==="gemara"?"gemara":"commentary"}${mapped?" reference-mapped":""}`;r.dataset.stream=stream;r.dataset.band=bandIndex;r.contentEditable=state.mode==="edit"?"true":"false";r.spellcheck=false;r.setAttribute("aria-label",`${stream} editable region`);row.appendChild(r);regions[stream].push(r);};
  pattern.bands.forEach((band,i)=>{const row=document.createElement("div"),isPair=band.streams.length===2&&band.streams.includes("inner")&&band.streams.includes("tosafot");row.className=`geometry-band${isPair?" commentary-pair":""}`;row.style.flex=`0 0 ${heights[i]}px`;row.style.height=`${heights[i]}px`;row.style.gridTemplateColumns=band.widths.map(x=>`${x}fr`).join(" ");band.streams.forEach(stream=>addRegion(row,stream,i));body.appendChild(row);if(i===0&&bridgeNeeded){const bridge=document.createElement("div");bridge.className="geometry-band gemara-bottom-bridge";bridge.style.flex=`0 0 ${bridgeHeight}px`;bridge.style.height=`${bridgeHeight}px`;bridge.style.gridTemplateColumns=pattern.bands[0].widths.map(x=>`${x}fr`).join(" ");pattern.bands[0].streams.forEach(stream=>{if(stream==="gemara"){const blank=document.createElement("div");blank.className="gemara-clearance";bridge.appendChild(blank);}else addRegion(bridge,stream,0);});body.appendChild(bridge);}});return regions;
}
function setMappedLines(region,lines){region.innerHTML=mappedLinesHtml(lines);fitMappedLineWidths(region);}
function composeMappedExact(tokens,profile){
  setScale(1);
  const pattern=mappedCascadePattern(profile),regions=buildGeometry(pattern),lines=Object.fromEntries(STREAMS.map(stream=>[stream,markMappedCommentEnds(splitMappedLines(tokens[stream]),stream)]));
  const {openingLines}=profile.layout,noticeLines=profile.notice?.lines||0,stages=profileStages(profile);
  const right=isAleph(state.ref)?"inner":"tosafot",left=isAleph(state.ref)?"tosafot":"inner";
  const cursors={gemara:0,inner:0,tosafot:0},regionIndex={gemara:0,inner:0,tosafot:0};
  for(const [element,stream] of [[$("topRight"),right],[$("topLeft"),left]]){element.dataset.stream=stream;element.classList.add("reference-mapped");const sourceCount=profileOpeningSourceLines(profile,stream),opening=lines[stream].slice(0,sourceCount);setMappedLines(element,opening);cursors[stream]=sourceCount;if(stream===profile.notice?.stream&&noticeLines){const notice=document.createElement("span");notice.className="mapped-line tosafot-notice";notice.contentEditable="false";notice.setAttribute("aria-label","Fixed decorative Tosafos notice");notice.textContent=profile.notice.text;element.prepend(notice);fitMappedLineWidths(element);}element.contentEditable=state.mode==="edit"?"true":"false";element.spellcheck=false;}
  for(const stage of stages)for(const stream of stage.streams){const count=stage.counts[stream]||0,region=regions[stream][regionIndex[stream]++];setMappedLines(region,lines[stream].slice(cursors[stream],cursors[stream]+count));cursors[stream]+=count;}
  for(const stream of STREAMS)if(cursors[stream]!==lines[stream].length)throw new Error(`Mapped line allocation mismatch for ${stream}: placed ${cursors[stream]}, received ${lines[stream].length}`);
  return{score:0,overflow:0,sourceOverflow:0,blankRatio:0,minOccupancy:1,transitionGap:0,scale:1,pattern};
}
function flowOpening(tokens,shapeLines=false){const right=isAleph(state.ref)?"inner":"tosafot",left=isAleph(state.ref)?"tosafot":"inner",rightEl=$("topRight"),leftEl=$("topLeft"),profile=referenceProfile();for(const[el,stream]of[[rightEl,right],[leftEl,left]]){el.dataset.stream=stream;el.classList.toggle("reference-mapped",Boolean(profile?.maps?.[stream]?.lineEndTokens?.length));}const rr=fitTokens(tokens[right],rightEl),lr=fitTokens(tokens[left],leftEl);rightEl.innerHTML=renderedTokens(rr.chunk,rightEl);leftEl.innerHTML=renderedTokens(lr.chunk,leftEl);fitMappedLineWidths(rightEl);fitMappedLineWidths(leftEl);if(shapeLines){finishRegionLine(rightEl,rr.rest.length>0);finishRegionLine(leftEl,lr.rest.length>0);}rightEl.contentEditable=state.mode==="edit"?"true":"false";leftEl.contentEditable=state.mode==="edit"?"true":"false";rightEl.spellcheck=false;leftEl.spellcheck=false;return{...tokens,[right]:rr.rest,[left]:lr.rest};}
function lastStateForBand(result,bandIndex){return[...(result?.regionStates||[])].reverse().find(item=>item.bandIndex===bandIndex)||null;}
function completionAudit(pattern,results){const failures=[];let maxCompletionSlack=0;for(let index=0;index<pattern.bands.length-1;index++){const current=new Set(pattern.bands[index].streams),next=new Set(pattern.bands[index+1].streams);for(const stream of next)if(!current.has(stream))failures.push(`${stream} reappears after completion`);for(const stream of current){const stateAtBoundary=lastStateForBand(results[stream],index);if(!stateAtBoundary){failures.push(`${stream} missing completion measurement`);continue;}const removed=!next.has(stream),hasRemaining=stateAtBoundary.afterCount>0;if(removed&&hasRemaining)failures.push(`${stream} removed before source completion`);if(!removed&&!hasRemaining)failures.push(`${stream} continues after source completion`);if(removed&&!hasRemaining){const slack=Math.max(0,stateAtBoundary.regionHeight-stateAtBoundary.usedHeight),limit=Math.max(2,stateAtBoundary.lineHeight*1.15);maxCompletionSlack=Math.max(maxCompletionSlack,slack);if(slack>limit)failures.push(`${stream} transition delayed by more than one line`);}}}const finalBand=pattern.bands.length-1,finalStates=pattern.bands[finalBand].streams.map(stream=>({stream,state:lastStateForBand(results[stream],finalBand)})).filter(item=>item.state);if(finalStates.length>1){const latest=Math.max(...finalStates.map(item=>item.state.usedHeight));for(const{stream,state}of finalStates){const slack=Math.max(0,latest-state.usedHeight),limit=Math.max(2,state.lineHeight*1.15);maxCompletionSlack=Math.max(maxCompletionSlack,slack);if(slack>limit)failures.push(`${stream} ends early without space reclamation`);}}for(const stream of STREAMS)if(results[stream].rest.length)failures.push(`${stream} source not fully placed`);return{failures:[...new Set(failures)],maxCompletionSlack};}
function evaluate(pattern,scale,original,commit=false){setScale(scale);const remaining=flowOpening(original,commit),regions=buildGeometry(pattern),results={};for(const s of STREAMS)results[s]=fillStream(remaining[s],regions[s],commit);const sourceOverflow=STREAMS.reduce((n,s)=>n+results[s].rest.length,0),count=STREAMS.reduce((n,s)=>n+original[s].length,0)||1,blank=STREAMS.reduce((n,s)=>n+results[s].blankArea,0),area=STREAMS.reduce((n,s)=>n+results[s].totalArea,0)||1,blankRatio=blank/area,occupancies=STREAMS.flatMap(s=>results[s].occupancy),minOccupancy=Math.min(...occupancies),transitionOccupancies=[];for(const stream of STREAMS){const streamRegions=regions[stream],streamOccupancy=results[stream].occupancy;streamOccupancy.forEach((ratio,index)=>{const bandIndex=Number(streamRegions[index].dataset.band),continues=index<streamOccupancy.length-1,releasesEarly=index===streamOccupancy.length-1&&bandIndex<pattern.bands.length-1;if(continues||releasesEarly)transitionOccupancies.push(ratio);});}const transitionGap=transitionOccupancies.length?Math.max(...transitionOccupancies.map(r=>1-r)):0,completion=completionAudit(pattern,results),gapPenalty=transitionOccupancies.reduce((n,r)=>n+Math.pow(Math.max(0,.985-r),2),0),terminalDeadSpace=Math.pow(Math.max(0,.9-minOccupancy),2),s=scaleParts(scale),scalePenalty=Math.abs(s.gemara-1)+Math.abs(s.commentary-1),completionPenalty=completion.failures.length*1000+completion.maxCompletionSlack*.5,score=sourceOverflow/count*32+blankRatio*10+terminalDeadSpace*110+gapPenalty*120+Math.pow(transitionGap,2)*180+(pattern.bands.length-1)*.004+scalePenalty*.035+completionPenalty;return{score,overflow:sourceOverflow,sourceOverflow,blankRatio,minOccupancy,transitionGap,completionFailures:completion.failures,maxCompletionSlack:completion.maxCompletionSlack,results,scale,pattern};}
function refinePatterns(pattern){if(pattern.bands.length<2)return[pattern];const refined=[];for(let firstDelta=-5;firstDelta<=5;firstDelta+=pattern.bands.length===2?1:2){if(pattern.bands.length===2){const first=pattern.bands[0].height+firstDelta;if(first>10&&first<90)refined.push({...pattern,bands:[{...pattern.bands[0],height:first},{...pattern.bands[1],height:100-first}]});continue;}for(let secondDelta=-5;secondDelta<=5;secondDelta+=2){const first=pattern.bands[0].height+firstDelta,second=pattern.bands[1].height+secondDelta,third=100-first-second;if(first>10&&second>8&&third>5)refined.push({...pattern,bands:[{...pattern.bands[0],height:first},{...pattern.bands[1],height:second},{...pattern.bands[2],height:third}]});}}return refined;}
function candidatePasses(result){return result.overflow===0&&!result.completionFailures.length&&result.transitionGap<=.035&&result.blankRatio<.075&&result.minOccupancy>.78;}
function nextPaint(){return new Promise(resolve=>requestAnimationFrame(resolve));}
function setComposing(active){$("dafPage").classList.toggle("composing",active);$("dafPage").setAttribute("aria-busy",String(active));$("loadDaf").disabled=active;if($("loadSelectedPage"))$("loadSelectedPage").disabled=active;$("reflowEdits").disabled=active;$("typographyPreset").disabled=active;$("nekudosToggle").disabled=active;}
function contentLines(element){const mapped=[...element.children].filter(child=>child.classList.contains("mapped-line"));if(mapped.length)return mapped.length;const probe=makeProbe(element);probe.innerHTML=element.innerHTML;const height=probe.getBoundingClientRect().height,line=parseFloat(getComputedStyle(element).lineHeight)||1;probe.remove();return height/line;}
function validateMappedGeometry(){
  const failures=[],profile=referenceProfile(),gutter=parseFloat(getComputedStyle($("dafPage")).getPropertyValue("--daf-gutter"))||25,firstRow=$("bodyGeometry").querySelector(".geometry-band:first-child"),bridge=$("bodyGeometry").querySelector(".gemara-bottom-bridge"),gemara=firstRow?.querySelector('[data-stream="gemara"]'),cells=firstRow?[...firstRow.children].map(el=>el.getBoundingClientRect()).sort((a,b)=>a.left-b.left):[];
  if(cells.length!==3||Math.abs(cells[1].left-cells[0].right-gutter)>.6||Math.abs(cells[2].left-cells[1].right-gutter)>.6)failures.push("25px side walls");
  const boxWalls=profile.layout.boxWalls!==false,topPadding=gemara?parseFloat(getComputedStyle(gemara).paddingTop):NaN,bottomPadding=gemara?parseFloat(getComputedStyle(gemara).paddingBottom):NaN;
  if(bridge)failures.push("unexpected Gemara bridge");
  if(boxWalls&&(Math.abs(topPadding-gutter)>.6||Math.abs(bottomPadding-gutter)>.6))failures.push("25px top/bottom walls");
  if(!boxWalls&&(Math.abs(topPadding)>.6||Math.abs(bottomPadding)>.6))failures.push("wall-free Gemara transition");
  const count=(stream,band)=>[...$("bodyGeometry").querySelectorAll(`[data-stream="${stream}"][data-band="${band}"] .mapped-line`)].length;
  profileStages(profile).forEach((stage,band)=>stage.streams.forEach(stream=>{if(count(stream,band)!==stage.counts[stream])failures.push(`${stream} stage ${band+1} placement`);}));
  const canonicalLineText=value=>String(value||"").replace(/\s+([.׃,:;!?])/gu,"$1").replace(/\s+/g," ").trim(),mappedSource=streamTokens(),lineText=line=>line===null?"":canonicalLineText(line.map(token=>token.text).join(" "));
  for(const stream of STREAMS){const expected=splitMappedLines(mappedSource[stream]).map(lineText),top=[...document.querySelectorAll(".top-commentary")].find(el=>el.dataset.stream===stream),containers=[...(top?[top]:[]),...$("bodyGeometry").querySelectorAll(`[data-stream="${stream}"]`)],actual=containers.flatMap(region=>[...region.querySelectorAll(":scope > .mapped-line:not(.tosafot-notice)")].map(line=>canonicalLineText(line.textContent)));if(expected.length!==actual.length||expected.some((text,index)=>text!==actual[index]))failures.push(`${stream} mapped token preservation`);}
  if(/^Pesachim 99b$/i.test(state.ref)){const openingStrong=[...gemara?.querySelectorAll(":scope > .mapped-line:first-child strong")||[]],unpointed=text=>text.replace(/[\u0591-\u05C7]/g,"").replace(/\s+/g," ").trim();if(openingStrong.length!==1||!/^ערבי? פסחים$/u.test(unpointed(openingStrong[0].textContent)))failures.push("Gemara opening emphasis");}
  for(const line of $("dafPage").querySelectorAll(".mapped-line")){const scale=Number(line.dataset.widthScale||1),required=Number(line.dataset.requiredScale||1);if(line.scrollWidth*scale>line.clientWidth+1)failures.push("mapped line clipping");if(required<.88)failures.push("excessive mapped-line compression");}
  for(const region of $("dafPage").querySelectorAll(".reference-mapped"))if(region.scrollHeight>region.clientHeight+1)failures.push("mapped region clipping");
  return[...new Set(failures)];
}
function validateRashbamHeading(failures){
  if(!state.rashbamHtml)return;
  const html=innerHtml(),box=document.createElement("div");box.innerHTML=html;
  const heading=box.querySelector(".commentary-heading"),transition=box.querySelector(".rashbam-transition");
  if(state.rashiHtml&&html.indexOf(withoutBreaks(state.rashiHtml))>html.indexOf(withoutBreaks(state.rashbamHtml)))failures.push("Rashi/Rashbam order");
  if(state.rashbamHeadingMode==="unresolved"||state.rashbamHeadingMode==="none")return failures.push("Rashbam perek/heading policy unresolved");
  const expected=state.rashbamHeadingMode==="full"?"פירושרבינושמואלתלמידרש״יז״ל":"רשב״ם";
  const expectedBreaks=state.rashbamHeadingMode==="full"?1:0;
  if(!heading||heading.textContent.replace(/\s+/g,"").trim()!==expected||heading.querySelectorAll("br").length!==expectedBreaks)failures.push("Rashbam title block");
  if(state.rashiHtml){const parts=transition?[...transition.children].map(n=>n.tagName):[];if(parts.join(",")!=="BR,BR,SPAN,BR")failures.push("Rashbam title spacing");}
}
function semanticSignature(value){return stripNekudos(String(value||"")).replace(/[^\u05d0-\u05ea0-9]/gu,"");}
function validateRenderedSource(failures){const expected=streamTokens();for(const stream of STREAMS){const expectedSignature=semanticSignature(expected[stream].filter(token=>!token.break&&!token.blankLine).map(token=>token.text||"").join(" ")),actualSignature=semanticSignature(streamRegions(stream).map(region=>region.textContent||"").join(" "));if(expectedSignature!==actualSignature)failures.push(`${stream} source preservation`);}}
function validateComposition(final){const failures=[...(final.completionFailures||[])],profile=referenceProfile(),openingLines=state.agentSettings.openingLines||profile?.layout?.openingLines||4,expectedRight=isAleph(state.ref)?"inner":"tosafot",expectedLeft=isAleph(state.ref)?"tosafot":"inner";if($("topRight").dataset.stream!==expectedRight||$("topLeft").dataset.stream!==expectedLeft)failures.push("amud sides");if(Math.abs(contentLines($("topRight"))-openingLines)>.15||Math.abs(contentLines($("topLeft"))-openingLines)>.15)failures.push(`${openingLines}-line opening`);const openingBottom=document.querySelector(".opening-band").getBoundingClientRect().bottom,bodyTop=$("bodyGeometry").getBoundingClientRect().top;if(Math.abs(openingBottom-bodyTop)>.5)failures.push("opening commentary continuity");const first=final.pattern.bands[0],raw=Object.fromEntries(first.streams.map((stream,i)=>[stream,first.widths[i]])),widthTotal=Object.values(raw).reduce((sum,value)=>sum+value,0)||1,allocation=Object.fromEntries(Object.entries(raw).map(([stream,value])=>[stream,value/widthTotal*100]));if(allocation.gemara<42||allocation.gemara>49||allocation.inner<23||allocation.tosafot<23)failures.push("primary widths");validateRashbamHeading(failures);const commentaryPairs=final.pattern.bands.filter(b=>b.streams.length===2&&b.streams.includes("inner")&&b.streams.includes("tosafot"));if(commentaryPairs.some(b=>Math.abs(b.widths[0]-b.widths[1])>.01))failures.push("centered commentary gutter");const contentCenter=$("bodyGeometry").getBoundingClientRect().left+$("bodyGeometry").clientWidth/2,pairRows=[$("topRight").parentElement,...$("bodyGeometry").querySelectorAll(".commentary-pair")];if(pairRows.some(row=>{const children=[...row.children].filter(el=>el.classList.contains("commentary")||el.classList.contains("top-commentary")).map(el=>el.getBoundingClientRect()).sort((a,b)=>a.left-b.left);return children.length!==2||Math.abs((children[0].right+children[1].left)/2-contentCenter)>1;}))failures.push("physical center gutter");const pairIndex=final.pattern.bands.findIndex(b=>b.streams.length===2&&b.streams.includes("inner")&&b.streams.includes("tosafot"));if(pairIndex>=0&&pairIndex<final.pattern.bands.length-1){const next=final.pattern.bands[pairIndex+1];if(next.streams.length!==1||!["inner","tosafot"].includes(next.streams[0])||Math.abs(next.widths[0]-100)>.01)failures.push("remaining commentary takeover");}const leading=parseFloat(getComputedStyle($("topRight")).lineHeight)||1,bands=[...$("bodyGeometry").querySelectorAll(".geometry-band")],baselineBands=bands.filter(b=>!b.classList.contains("gemara-bottom-bridge"));if(!final.pattern.mapped&&baselineBands.slice(0,-1).some(b=>Math.abs(b.clientHeight/leading-Math.round(b.clientHeight/leading))>.08))failures.push("commentary baseline transition");if(final.overflow)failures.push("text overflow");if(final.transitionGap>.035)failures.push("horizontal region break");if(!final.pattern.mapped&&(final.blankRatio>=.075||final.minOccupancy<=.78))failures.push("underfilled transition");const heightSum=bands.reduce((n,b)=>n+b.clientHeight,0);if(Math.abs(heightSum-$("bodyGeometry").clientHeight)>1)failures.push("page tiling");if(final.pattern.mapped)failures.push(...validateMappedGeometry());validateRenderedSource(failures);return[...new Set(failures)];}

async function compose(){
  suspendPageZoom();updateHeader();setComposing(true);
  $("patternReport").textContent="Testing layouts…";$("fillReport").textContent="Please wait";$("rulesReport").textContent="Test in progress";
  status("Composition test 0% — evaluating Vilna page geometry…");await nextPaint();
  const tokens=streamTokens(),profile=referenceProfile(),originalBodyVisibility=$("bodyGeometry").style.visibility;
  if(profile){
    const profileErrors=auditReferenceProfile(profile);if(profileErrors.length)throw new Error(`Reference-map audit failed: ${profileErrors.join(", ")}`);
    status("Exact PDF token map loaded — calculating completion-driven region transitions…");
    setScale(1);$("bodyGeometry").style.visibility="hidden";
    const final=composeMappedExact(tokens,profile),pattern=final.pattern;
    $("bodyGeometry").style.visibility=originalBodyVisibility;final.failures=validateComposition(final);state.composition=final;state.dirty=false;
    $("patternReport").textContent=pattern.name.replace("inner","Rashi/Rashbam");$("fillReport").textContent=final.failures.length?"Final test failed":"Mapped amud";$("rulesReport").textContent=final.failures.length?`Review: ${final.failures.join(", ")}`:"All mapped and region rules passed";
    setComposing(false);afterCompose();status(final.failures.length?`Mapped composition failed: ${final.failures.join(", ")}.`:`Mapped composition complete — exact lines, gutter box and cascading takeovers passed for ${state.ref}.`,final.failures.length>0);return final;
  }
  const w=weightsFor(tokens),patterns=candidates(w),globalScales=[1,.94],openingCandidates=state.agentSettings.openingLines?[state.agentSettings.openingLines]:[4,5,3],total=patterns.length*globalScales.length*openingCandidates.length;
  $("bodyGeometry").style.visibility="hidden";
  let best=null,bestPassing=null,done=0;const familyBest=new Map;
  for(const openingLines of openingCandidates)for(const scale of globalScales)for(const pattern of patterns){
    $("dafPage").style.setProperty("--opening-lines",openingLines);const r=evaluate(pattern,scale,tokens),family=`${openingLines}:${pattern.name}`;r.openingLines=openingLines;
    if(!best||r.score<best.score)best=r;
    if(candidatePasses(r)&&(!bestPassing||r.score<bestPassing.score))bestPassing=r;
    if(!familyBest.has(family)||r.score<familyBest.get(family).score)familyBest.set(family,r);
    done++;if(done%3===0){status(`Composition test ${Math.min(48,Math.round(done/total*48))}% — comparing takeover families…`);await nextPaint();}
  }
  const winners=[...familyBest.values()].sort((a,b)=>a.score-b.score),mandatory=winners.filter(r=>/^cascading /.test(r.pattern.name)),shortlist=[];
  for(const r of[bestPassing||best,...mandatory,...winners])if(r&&!shortlist.some(x=>x.pattern.name===r.pattern.name)&&shortlist.length<2)shortlist.push(r);
  const fineJobs=shortlist.flatMap(coarse=>refinePatterns(coarse.pattern).map(pattern=>({pattern,scale:coarse.scale,openingLines:coarse.openingLines})));
  done=0;for(const job of fineJobs){
    $("dafPage").style.setProperty("--opening-lines",job.openingLines);const r=evaluate(job.pattern,job.scale,tokens);r.openingLines=job.openingLines;if(r.score<best.score)best=r;if(candidatePasses(r)&&(!bestPassing||r.score<bestPassing.score))bestPassing=r;
    done++;if(done%3===0){status(`Composition test ${48+Math.min(30,Math.round(done/Math.max(1,fineJobs.length)*30))}% — refining takeover boundaries…`);await nextPaint();}
  }
  if(!bestPassing&&!profile){
    const recoveryPatterns=patterns.filter(p=>p.cascade),recoveryScales=[
      {gemara:1.06,commentary:.92},{gemara:1.04,commentary:.90}
    ],recoveryTotal=recoveryPatterns.length*recoveryScales.length*openingCandidates.length;
    let recoveryBest=null;done=0;
    for(const openingLines of openingCandidates)for(const scale of recoveryScales)for(const pattern of recoveryPatterns){
      $("dafPage").style.setProperty("--opening-lines",openingLines);const r=evaluate(pattern,scale,tokens);r.openingLines=openingLines;if(!recoveryBest||r.score<recoveryBest.score)recoveryBest=r;if(candidatePasses(r)&&(!bestPassing||r.score<bestPassing.score))bestPassing=r;
      done++;if(done%3===0){status(`Composition test ${78+Math.min(21,Math.round(done/Math.max(1,recoveryTotal)*21))}% — balancing Gemara against commentary…`);await nextPaint();}
    }
    if(!bestPassing&&recoveryBest)best=recoveryBest;
  }
  const selected=bestPassing||best;if(!state.agentSettings.openingLines)state.agentSettings.openingLines=selected.openingLines||4;$("dafPage").style.setProperty("--opening-lines",state.agentSettings.openingLines);const final=evaluate(selected.pattern,selected.scale,tokens,true);final.openingLines=state.agentSettings.openingLines;
  $("bodyGeometry").style.visibility=originalBodyVisibility;final.failures=validateComposition(final);if(!bestPassing)final.failures=[...new Set(["no completion-safe layout",...final.failures])];state.composition=final;state.dirty=false;
  $("patternReport").textContent=final.pattern.name.replace("inner","Rashi/Rashbam");$("fillReport").textContent=final.failures.length?"Final test failed":"Full page";$("rulesReport").textContent=final.failures.length?`Review: ${final.failures.join(", ")}`:"All hard rules passed";
  setComposing(false);afterCompose();status(final.failures.length?`Final composition test complete${profile?" with PDF line anchors":""} — failed: ${final.failures.join(", ")}.`:`Final composition test complete — all hard region rules passed${profile?" with PDF line anchors":""} for ${state.ref}.`,final.failures.length>0);return final;
}

const LOCAL_BAVA_DATA={"bava metzia 21a":"assets/data/bava-metzia-21a-gemara.json","rashi on bava metzia 21a":"assets/data/bava-metzia-21a-rashi.json","tosafot on bava metzia 21a":"assets/data/bava-metzia-21a-tosafot.json"};
async function fetchText(ref,{commentary=false}={}){const url=`https://www.sefaria.org/api/texts/${encodeURIComponent(ref)}?context=0&commentary=0&pad=0&stripItags=0&alts=1`,local=LOCAL_BAVA_DATA[ref.trim().toLowerCase()];let data;try{const res=await fetch(url);if(!res.ok)throw new Error(`Sefaria returned ${res.status}`);data=await res.json();}catch(error){if(!local)throw error;const fallback=await fetch(local);if(!fallback.ok)throw error;data=await fallback.json();}if(data.error&&!local)return{html:"",heRef:ref,heTitle:""};return{html:flattenSefaria(data.he,{commentary}),heRef:data.heRef||ref,heTitle:data.heTitle||""};}
function headerFor(ref,g){if(/^Pesachim\s+99b$/i.test(ref))return"ערבי פסחים פרק עשירי פסחים";if(/^Bava\s+Metzia\s+21a$/i.test(ref))return"אלו מציאות פרק שני בבא מציעא";return g.heTitle||g.heRef.replace(/[\d.:]+/g,"").trim()||ref;}
function normalizeOpeningGemara(html,ref){if(!/^Pesachim\s+99b$/i.test(ref))return html;const marks="[\\u0591-\\u05C7]*",marker=new RegExp(`^\\s*מ${marks}ת${marks}(?:נ${marks}י${marks})?[׳']?\\s*[.:׃-]?\\s*`,"u"),box=document.createElement("div");box.innerHTML=html.replace(marker,"");const opening=box.querySelector("strong,b");if(opening)opening.replaceWith(...opening.childNodes);return box.innerHTML.replace(/^(\s*)(\S+\s+\S+)/u,"$1<strong>$2</strong>");}
function normalizeGemaraForRef(html,ref){let normalized=normalizeOpeningGemara(html,ref);if(!/^Bava\s+Metzia\s+21a$/i.test(ref)||/הדרן\s+עלך\s+שנים\s+אוחזין/u.test(stripNekudos(htmlToPlain(normalized))))return normalized;const marks="[\\u0591-\\u05C7]*",mishnah=new RegExp(`מ${marks}ת${marks}נ${marks}י${marks}[׳']?`,"u");return normalized.replace(mishnah,match=>`<strong>הדרן עלך שנים אוחזין</strong> ${match}`);}
function normalizeCommentaryForRef(html,ref,stream){if(stream!=="inner"||!/^Bava\s+Metzia\s+21a$/i.test(ref)||/הדרן\s+עלך\s+שנים\s+אוחזין/u.test(html))return html;return html.replace(/(?=<(?:strong|b)>\s*מתני[׳']?\s+אלו\s+מציאות)/u,"<strong>הדרן עלך שנים אוחזין</strong> ");}
function registryEntry(ref=state.ref){return PAGE_REGISTRY.find(entry=>entry.ref.toLowerCase()===String(ref).trim().toLowerCase())||null;}
function populateTractateSelector(){const select=$("tractateSelect"),tractates=[...new Map(PAGE_REGISTRY.map(entry=>[entry.tractate,entry])).values()];select.innerHTML=tractates.map(entry=>`<option value="${entry.tractate}">${entry.tractateLabel} — ${entry.tractate}</option>`).join("");}
function populatePageSelector(preferredRef=""){const pages=PAGE_REGISTRY.filter(entry=>entry.tractate===$("tractateSelect").value),select=$("pageSelect");select.innerHTML=pages.map(entry=>`<option value="${entry.ref}">${entry.pageLabel} — ${entry.ref}</option>`).join("");if(pages.some(entry=>entry.ref===preferredRef))select.value=preferredRef;updateVerificationStatus(select.value);}
function syncRegistrySelection(ref=state.ref){const entry=registryEntry(ref);if(entry){$("tractateSelect").value=entry.tractate;populatePageSelector(entry.ref);}updateVerificationStatus(ref);}
function updateVerificationStatus(ref=state.ref){const mapped=Boolean(REFERENCE_PROFILES[String(ref||"").trim().toLowerCase()]),element=$("verificationStatus");element.classList.toggle("verified",mapped);element.textContent=mapped?"Verified against uploaded Vilna PDF":"Automatic composition — PDF line map not yet verified";}
async function loadDaf({automatic=false}={}){const ref=$("dafRef").value.trim();if(!/\d+[ab]\s*$/i.test(ref)){status("Use a Talmud reference ending in a or b, such as Pesachim 99b.",true);return;}$("loadDaf").disabled=true;status("Step 1 of 2 — loading complete Gemara, Rashi, Tosafos, and applicable Rashbam from Sefaria…");try{const tractate=ref.replace(/\s+\d+[ab]\s*$/i,""),location=ref.match(/\d+[ab]\s*$/i)[0].trim(),commentary={commentary:true},rashbamRequest=state.rashbamAllowed===false?Promise.resolve({html:""}):fetchText(`Rashbam on ${tractate} ${location}`,commentary).catch(()=>({html:""})),requests=[fetchText(ref),fetchText(`Rashi on ${tractate} ${location}`,commentary),fetchText(`Tosafot on ${tractate} ${location}`,commentary),rashbamRequest],[g,r,t,b]=await Promise.all(requests);if(!g.html)throw new Error("No Hebrew Gemara text was returned");const gemaraHtml=normalizeGemaraForRef(g.html,ref),rashiHtml=normalizeCommentaryForRef(r.html,ref,"inner");Object.assign(state,{ref,header:headerFor(ref,g),gemaraHtml,rashiHtml,tosafotHtml:t.html,rashbamHtml:b.html,isSample:false,selectedWordId:null,editSelectedWordIds:[],wordFontScales:{},whitedWordIds:{},focusEnabled:false,focusWindow:1,visualLinks:{},notes:{},annotations:[],annotationUndo:[],annotationRedo:[],selection:null});syncRegistrySelection(ref);clearExcerpt();syncAnnotationCanvas();status(`Step 2 of 2 — text loaded${b.html?" with Rashbam":""}; starting the composition test…`);await nextPaint();await compose();}catch(e){setComposing(false);status(`${automatic?"Automatic import failed":"Could not load this daf"}: ${e.message}. The demonstration text remains available.`,true);postAgentDiagnostics([`source load: ${e.message}`]);}finally{$("loadDaf").disabled=false;}}
function status(text,error=false){$("loadStatus").textContent=text;$("loadStatus").classList.toggle("error",error);}
function commentaryPlain(text){return escapeHtml(text).replace(/(^|:\s+)([^:]{1,90}?[.׃])\s+/g,(_,p,o)=>`${p}<strong>${o}</strong> `);}
function overlayFreeHtml(element){const clone=element.cloneNode(true);clone.querySelectorAll(".phrase-visual-icon").forEach(node=>node.remove());return clone.innerHTML;}
function editableRegionHtml(region){const mapped=[...region.children].filter(child=>child.classList.contains("mapped-line"));return mapped.length?mapped.filter(line=>!line.classList.contains("mapped-blank-line")&&!line.classList.contains("tosafot-notice")).map(overlayFreeHtml).join(" "):overlayFreeHtml(region);}
function renderedStreamHtml(stream){const pieces=[];const top=["topRight","topLeft"].map(id=>$(id)).find(el=>el.dataset.stream===stream);if(top)pieces.push(editableRegionHtml(top));$("bodyGeometry").querySelectorAll(`[data-stream="${stream}"]`).forEach(el=>pieces.push(editableRegionHtml(el)));return pieces.join(" ").trim();}
function capturePageEdits(){state.gemaraHtml=cleanHtml(renderedStreamHtml("gemara"));state.tosafotHtml=cleanHtml(renderedStreamHtml("tosafot"));const innerRendered=renderedStreamHtml("inner"),innerPlain=htmlToPlain(innerRendered),marker="פירוש רבינו שמואל תלמיד רש״י ז״ל",at=innerPlain.indexOf(marker);if(at>=0){state.rashiHtml=commentaryPlain(innerPlain.slice(0,at).trim());state.rashbamHtml=commentaryPlain(innerPlain.slice(at+marker.length).trim());}else{state.rashiHtml=cleanHtml(innerRendered);state.rashbamHtml="";}}
async function reflowPageEdits(){capturePageEdits();await compose();}

function streamRegions(stream){const top=[$("topRight"),$("topLeft")].find(el=>el.dataset.stream===stream);return[...(top?[top]:[]),...$("bodyGeometry").querySelectorAll(`[data-stream="${stream}"]`)];}
function wrapRegionWords(region,stream,startIndex){let index=startIndex;const walker=document.createTreeWalker(region,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement?.closest(".tosafot-notice,.word-token")?NodeFilter.FILTER_REJECT:/\S/u.test(n.data)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);for(const node of nodes){const frag=document.createDocumentFragment();for(const part of node.data.split(/(\s+)/u)){if(!part)continue;if(/^\s+$/u.test(part)){frag.append(part);continue;}const span=document.createElement("span"),id=`${stream}:${index++}`;span.className="word-token";span.dataset.wordId=id;span.dataset.stream=stream;span.textContent=part;if(state.notes[id])span.classList.add("has-note");if(state.whitedWordIds[id])span.classList.add("word-whited-out");if(id===state.selectedWordId)span.classList.add("selected-word");const scale=Number(state.wordFontScales[id]);if(Number.isFinite(scale)&&scale!==1)span.style.fontSize=`${scale}em`;frag.append(span);}node.replaceWith(frag);}return index;}
let phraseNavigationAvailable=false;
function isGemaraLabelValue(normalized){return["מתני","משנה","גמ","גמרא"].includes(normalized);}
function isGemaraLabel(word){return isGemaraLabelValue(normalizeReadWord(word?.textContent));}
function isPhraseIgnoredValue(normalized){return !normalized||isGemaraLabelValue(normalized);}
function phraseWordMatches(source,target){if(source===target||source===`ו${target}`||target===`ו${source}`)return true;return Math.min(source.length,target.length)>=3&&editDistance(source,target)===1;}
function phraseAssignments(sourceWords,profile){
  const firstTarget=normalizeReadWord(profile[0]?.split(/\s+/u).find(Boolean)||"");
  for(let start=0;start<sourceWords.length;start++){
    if(!phraseWordMatches(sourceWords[start],firstTarget))continue;
    const assignments=Array(sourceWords.length).fill(null);let cursor=start,valid=true;
    for(let phraseIndex=0;phraseIndex<profile.length&&valid;phraseIndex++)for(const target of profile[phraseIndex].split(/\s+/u).filter(Boolean)){
      while(cursor<sourceWords.length&&isPhraseIgnoredValue(sourceWords[cursor]))cursor++;
      const normalizedTarget=normalizeReadWord(target);
      if(cursor>=sourceWords.length||!phraseWordMatches(sourceWords[cursor],normalizedTarget)){valid=false;break;}
      assignments[cursor]=phraseIndex;cursor++;
    }
    if(valid)return assignments;
  }
  return null;
}
function assignPhraseNavigation(){
  const profile=phraseProfile(),words=[...$("dafPage").querySelectorAll('.word-token[data-stream="gemara"]')];
  words.forEach(word=>delete word.dataset.phraseIndex);if(!profile)return false;const assignments=phraseAssignments(words.map(word=>normalizeReadWord(word.textContent)),profile);if(!assignments)return false;
  assignments.forEach((phraseIndex,index)=>{if(phraseIndex!=null)words[index].dataset.phraseIndex=String(phraseIndex);});return true;
}
function phraseElements(index){return index==null?[]:[...$("dafPage").querySelectorAll(`.word-token[data-stream="gemara"][data-phrase-index="${index}"]`)];}
function selectedPhraseIndex(){const selected=selectedWordElement(),value=selected?.dataset.phraseIndex;return value==null?null:Number(value);}
function focusWindowCount(){const select=$("focusWindowSize"),custom=$("focusWindowCustom"),value=select.value==="custom"?Number(custom.value):Number(select.value);return clamp(Number.isFinite(value)?Math.round(value):1,1,12);}
function visualLinksFor(index){return Array.isArray(state.visualLinks?.[index])?state.visualLinks[index]:[];}
function renderPhraseVisualMarkers(){
  $("dafPage").querySelectorAll(".phrase-visual-icon").forEach(icon=>icon.remove());
  for(const [key,links] of Object.entries(state.visualLinks||{})){
    if(!Array.isArray(links)||!links.length)continue;
    const first=phraseElements(Number(key))[0];if(!first)continue;
    const icon=document.createElement("button");icon.type="button";icon.className="phrase-visual-icon";icon.textContent="◆";icon.title=`Open ${links.length} linked visual${links.length===1?"":"s"}`;icon.setAttribute("aria-label",icon.title);icon.dataset.phraseIndex=key;first.append(icon);
  }
}
function applyFocusAppearance(){
  const words=[...$("dafPage").querySelectorAll(".word-token")];words.forEach(word=>word.classList.remove("focus-muted","focus-window","focus-current"));
  $("dafPage").classList.toggle("phrase-focus-active",Boolean(state.focusEnabled));
  const current=selectedPhraseIndex();
  if(!state.focusEnabled||!phraseNavigationAvailable||current==null){updateFocusNavigatorControls();return;}
  words.forEach(word=>word.classList.add("focus-muted"));
  const count=focusWindowCount();
  for(let index=current;index<current+count;index++)for(const word of phraseElements(index)){word.classList.remove("focus-muted");word.classList.add("focus-window");if(index===current)word.classList.add("focus-current");}
  updateFocusNavigatorControls();
}
function updateFocusNavigatorControls(){
  const current=selectedPhraseIndex(),profile=phraseProfile(),available=Boolean(phraseNavigationAvailable&&profile);
  $("focusNavigatorToggle").disabled=!available;$("focusNavigatorToggle").setAttribute("aria-pressed",String(state.focusEnabled));$("focusNavigatorToggle").textContent=`Focus: ${state.focusEnabled?"On":"Off"}`;
  $("focusWindowSize").disabled=!available||!state.focusEnabled;$("focusWindowCustom").disabled=!available||!state.focusEnabled;
  $("focusPrevious").disabled=!available||!state.focusEnabled||current==null||current<=0;$("focusNext").disabled=!available||!state.focusEnabled||current==null||current>=(profile?.length||0)-1;
  $("focusNavigatorStatus").textContent=!available?"A verified Milim ID phrase profile is required.":!state.focusEnabled?"Turn Focus on to fade the full page outside the active phrase window.":current==null?"Select a Gemara phrase to begin.":`Phrase ${current+1} of ${profile.length}; ${focusWindowCount()} phrase${focusWindowCount()===1?"":"s"} remain visible.`;
}
function updateVisualControls(){
  const index=selectedPhraseIndex(),links=index==null?[]:visualLinksFor(index),valid=index!=null&&state.navigationUnit==="phrase";
  $("attachVisual").disabled=!valid;$("openVisual").disabled=!links.length;$("removeVisual").disabled=!links.length;
  $("visualStatus").textContent=!valid?"Select a verified phrase to attach a visual.":links.length?`Phrase ${index+1} has ${links.length} linked visual${links.length===1?"":"s"}.`:`Phrase ${index+1} has no linked visual.`;
}
function setFocusEnabled(force){
  state.focusEnabled=typeof force==="boolean"?force:!state.focusEnabled;
  if(state.focusEnabled){setInteractionMode("navigate",{focus:false});setNavigationUnit("phrase");if(selectedPhraseIndex()==null){const first=phraseElements(0)[0];if(first)state.selectedWordId=first.dataset.wordId;}}
  applySelectionAppearance();applyFocusAppearance();updateVisualControls();
}
function addVisualLink(){
  const index=selectedPhraseIndex(),raw=$("visualUrl").value.trim();if(index==null)return;
  let url;try{url=new URL(raw);if(!/^https?:$/.test(url.protocol))throw new Error();}catch{$("visualStatus").textContent="Enter a complete Google Slides, Canva, or other https link.";return;}
  const links=visualLinksFor(index),value=url.toString();if(!links.includes(value))state.visualLinks[index]=[...links,value];$("visualUrl").value="";renderPhraseVisualMarkers();updateVisualControls();
}
function openPhraseVisual(index=selectedPhraseIndex()){const links=visualLinksFor(index);if(links.length)window.open(links.at(-1),"_blank","noopener,noreferrer");}
function removeVisualLink(){const index=selectedPhraseIndex(),links=visualLinksFor(index);if(index==null||!links.length)return;const next=links.slice(0,-1);if(next.length)state.visualLinks[index]=next;else delete state.visualLinks[index];renderPhraseVisualMarkers();updateVisualControls();}
function clearSelectionAppearance(){$("dafPage").querySelectorAll(".selected-word,.selected-phrase").forEach(word=>word.classList.remove("selected-word","selected-phrase"));}
function applySelectionAppearance(){clearSelectionAppearance();const selected=selectedWordElement();if(!selected)return;if(state.navigationUnit==="phrase"&&selected.dataset.stream==="gemara"&&selected.dataset.phraseIndex!=null)phraseElements(selected.dataset.phraseIndex).forEach(word=>word.classList.add("selected-phrase"));else selected.classList.add("selected-word");}
function updateNavigationUnitControls(){
  if(state.navigationUnit==="phrase"&&!phraseNavigationAvailable)state.navigationUnit="word";
  $("wordNavigation").setAttribute("aria-pressed",String(state.navigationUnit==="word"));$("phraseNavigation").setAttribute("aria-pressed",String(state.navigationUnit==="phrase"));$("phraseNavigation").disabled=!phraseNavigationAvailable;
  $("navigationUnitStatus").textContent=!phraseNavigationAvailable?"Word-by-word navigation is active. No Milim ID phrase map is loaded for this daf.":state.navigationUnit==="phrase"?`Phrase-by-phrase navigation is active — ${phraseProfile().length} chart phrases.`:"Word-by-word navigation is active. Phrase navigation is available.";
  updateFocusNavigatorControls();updateVisualControls();
}
function setNavigationUnit(unit){
  state.navigationUnit=unit==="phrase"&&phraseNavigationAvailable?"phrase":"word";
  if(state.navigationUnit!=="phrase")state.focusEnabled=false;
  const current=selectedWordElement();if(state.navigationUnit==="phrase"&&current?.dataset.stream==="gemara"&&current.dataset.phraseIndex!=null)state.selectedWordId=phraseElements(current.dataset.phraseIndex)[0]?.dataset.wordId||state.selectedWordId;
  updateNavigationUnitControls();applySelectionAppearance();applyFocusAppearance();updateNoteWindow();updateReadingControls();
}
function activateWordNavigation(){if(readingState.active)readingState.recognition?.abort();for(const old of $("dafPage").querySelectorAll(".word-token")){old.querySelectorAll(".phrase-visual-icon").forEach(icon=>icon.remove());old.replaceWith(old.textContent);}for(const stream of STREAMS){let index=0;for(const region of streamRegions(stream))index=wrapRegionWords(region,stream,index);}phraseNavigationAvailable=assignPhraseNavigation();updateNavigationUnitControls();renderPhraseVisualMarkers();applySelectionAppearance();applyFocusAppearance();resetReadingSession({keepSelection:true});setInteractionMode(state.mode,{focus:false});}
const PAGE_ZOOM_MIN=1,PAGE_ZOOM_MAX=2.5,PAGE_ZOOM_STEP=.5;
function normalizedPageZoom(value){const zoom=Number(value);if(!Number.isFinite(zoom))return 1.5;return clamp(Math.round(zoom/PAGE_ZOOM_STEP)*PAGE_ZOOM_STEP,PAGE_ZOOM_MIN,PAGE_ZOOM_MAX);}
function suspendPageZoom(){const page=$("dafPage"),shell=$("pageZoomShell");page.style.transform="none";shell.style.width=`${page.offsetWidth}px`;shell.style.height=`${page.offsetHeight}px`;}
function applyPageZoom(){
  const page=$("dafPage"),shell=$("pageZoomShell"),zoom=normalizedPageZoom(state.pageZoom);state.pageZoom=zoom;page.style.transform=`scale(${zoom})`;shell.style.width=`${page.offsetWidth*zoom}px`;shell.style.height=`${page.offsetHeight*zoom}px`;
  $("pageZoomValue").textContent=`${Math.round(zoom*100)}%`;$("pageZoomSmaller").disabled=zoom<=PAGE_ZOOM_MIN;$("pageZoomLarger").disabled=zoom>=PAGE_ZOOM_MAX;$("pageZoomStatus").textContent=`${Math.round(zoom*100)}% teaching view. The completed page is enlarged without recomposing any lines.`;
}
function setPageZoom(value){state.pageZoom=normalizedPageZoom(value);applyPageZoom();requestAnimationFrame(renderGemaraLineNumbers);}
function changePageZoom(delta){setPageZoom(state.pageZoom+delta);}
function gemaraVisualLines(){
  const mapped=[...$("dafPage").querySelectorAll('.gemara.reference-mapped > .mapped-line:not(.mapped-blank-line)')];
  if(mapped.length)return mapped.map(line=>{const rect=line.getBoundingClientRect(),region=line.parentElement.getBoundingClientRect();return{top:rect.top,height:rect.height,right:region.right};}).sort((a,b)=>a.top-b.top);
  const groups=[];
  for(const region of streamRegions("gemara"))for(const word of region.querySelectorAll('.word-token[data-stream="gemara"]')){
    const rect=word.getBoundingClientRect(),baseline=rect.bottom,regionRight=region.getBoundingClientRect().right;
    let line=groups.find(item=>item.region===region&&Math.abs(item.baseline-baseline)<=2.5);
    if(!line){line={region,baseline,top:rect.top,height:rect.height,right:regionRight};groups.push(line);}else{line.top=Math.min(line.top,rect.top);line.height=Math.max(line.height,rect.bottom-line.top);}
  }
  return groups.sort((a,b)=>a.top-b.top||b.right-a.right);
}
function renderGemaraLineNumbers(){
  const overlay=$("gemaraLineNumbers");overlay.replaceChildren();overlay.hidden=!state.lineNumbersEnabled;if(!state.lineNumbersEnabled)return;
  const page=$("dafPage"),pageRect=page.getBoundingClientRect(),zoom=normalizedPageZoom(state.pageZoom);
  gemaraVisualLines().forEach((line,index)=>{const marker=document.createElement("span"),top=(line.top-pageRect.top)/zoom,height=line.height/zoom,right=(line.right-pageRect.left)/zoom;marker.className="gemara-line-number";marker.textContent=String(index+1);marker.style.top=`${top+Math.max(0,(height-11)/2)}px`;marker.style.left=`${clamp(right+4,2,page.clientWidth-18)}px`;overlay.append(marker);});
}
function updateDisplayToggles(){
  $("nekudosToggle").setAttribute("aria-pressed",String(state.nekudosEnabled));$("nekudosToggle").textContent=`Nekudos: ${state.nekudosEnabled?"On":"Off"}`;
  $("lineNumbersToggle").setAttribute("aria-pressed",String(state.lineNumbersEnabled));$("lineNumbersToggle").textContent=`Gemara line numbers: ${state.lineNumbersEnabled?"On":"Off"}`;
}
async function toggleNekudos(force){if(state.dirty)capturePageEdits();state.nekudosEnabled=typeof force==="boolean"?force:!state.nekudosEnabled;updateDisplayToggles();await compose();}
function toggleLineNumbers(force){state.lineNumbersEnabled=typeof force==="boolean"?force:!state.lineNumbersEnabled;updateDisplayToggles();requestAnimationFrame(renderGemaraLineNumbers);}
function setInteractionMode(mode,{focus=true}={}){state.mode=mode==="edit"?"edit":"navigate";if(state.mode!=="edit")state.editSelectedWordIds=[];$("dafPage").classList.toggle("edit-mode",state.mode==="edit");for(const region of $("dafPage").querySelectorAll(".flow-region,.top-commentary"))region.contentEditable=state.mode==="edit"?"true":"false";for(const id of["navigateMode","editMode"]){const active=id==="navigateMode"?state.mode==="navigate":state.mode==="edit";$(id).setAttribute("aria-pressed",String(active));}updateEditTools();if(focus&&state.mode==="navigate"&&state.selectedWordId)document.querySelector(`[data-word-id="${CSS.escape(state.selectedWordId)}"]`)?.focus();}
function selectedWordElement(){return state.selectedWordId?document.querySelector(`[data-word-id="${CSS.escape(state.selectedWordId)}"]`):null;}
function selectWord(element){if(!element||element.classList.contains("tosafot-notice"))return;if(state.navigationUnit==="phrase"&&element.dataset.stream==="gemara"&&element.dataset.phraseIndex!=null)element=phraseElements(element.dataset.phraseIndex)[0]||element;state.selectedWordId=element.dataset.wordId;applySelectionAppearance();applyFocusAppearance();element.tabIndex=-1;element.focus({preventScroll:true});updateNoteWindow();updateReadingControls();updateVisualControls();}
function moveSelectedWord(delta){const current=selectedWordElement();if(!current)return;const words=[...$("dafPage").querySelectorAll(`.word-token[data-stream="${current.dataset.stream}"]`)],at=words.indexOf(current),next=words[at+delta];if(next){selectWord(next);next.scrollIntoView({block:"nearest",inline:"nearest"});}}
function moveSelectedUnit(delta){const current=selectedWordElement();if(state.navigationUnit!=="phrase"||current?.dataset.stream!=="gemara"||current.dataset.phraseIndex==null){moveSelectedWord(delta);return;}const next=phraseElements(Number(current.dataset.phraseIndex)+delta)[0];if(next){selectWord(next);next.scrollIntoView({block:"nearest",inline:"nearest"});}}
function selectedEditWordElements(){
  const selection=getSelection();if(state.mode!=="edit"||!selection?.rangeCount||selection.isCollapsed)return[];const range=selection.getRangeAt(0),page=$("dafPage");if(!page.contains(range.commonAncestorContainer.nodeType===Node.ELEMENT_NODE?range.commonAncestorContainer:range.commonAncestorContainer.parentElement))return[];
  return[...page.querySelectorAll(".word-token")].filter(word=>{try{return range.intersectsNode(word);}catch{return false;}});
}
function rememberEditSelection(){const words=selectedEditWordElements();if(words.length)state.editSelectedWordIds=words.map(word=>word.dataset.wordId);updateEditTools();}
function editSelectionWords({gemaraOnly=false}={}){return state.editSelectedWordIds.map(id=>document.querySelector(`[data-word-id="${CSS.escape(id)}"]`)).filter(word=>word&&(!gemaraOnly||word.dataset.stream==="gemara"));}
function updateEditTools(){
  const editing=state.mode==="edit",gemaraSelected=editSelectionWords({gemaraOnly:true}),whiteoutCount=Object.keys(state.whitedWordIds).length;
  $("whiteoutSelection").disabled=!editing||!gemaraSelected.length;$("restoreSelection").disabled=!editing||!gemaraSelected.length;$("clearWhiteouts").disabled=!editing||!whiteoutCount;
  $("whiteoutStatus").textContent=!editing?"Enter Edit mode to create a temporary teaching focus.":gemaraSelected.length?`${gemaraSelected.length} selected Gemara word${gemaraSelected.length===1?"":"s"}; fade or restore exactly this selection.`:whiteoutCount?`${whiteoutCount} Gemara word${whiteoutCount===1?" is":"s are"} currently faded to a pale outline. Select any portion to change it.`:"Select any words or part of a line; faded text remains faintly visible and fully intact.";
}
function setSelectionWhiteout(hidden){const words=editSelectionWords({gemaraOnly:true});if(!words.length)return;for(const word of words){const id=word.dataset.wordId;if(hidden)state.whitedWordIds[id]=true;else delete state.whitedWordIds[id];word.classList.toggle("word-whited-out",hidden);}updateEditTools();}
function clearWordWhiteouts(){state.whitedWordIds={};$("dafPage").querySelectorAll(".word-whited-out").forEach(word=>word.classList.remove("word-whited-out"));updateEditTools();}
function updateNoteWindow(){const win=$("noteWindow"),word=selectedWordElement();win.hidden=!state.notesEnabled;if(win.hidden)return;if(state.noteWindowPosition)Object.assign(win.style,{left:`${state.noteWindowPosition.x}px`,top:`${state.noteWindowPosition.y}px`});$("selectedWordLabel").textContent=word?.textContent||"Select a word";$("wordNote").disabled=!word;$("wordNote").value=word?state.notes[state.selectedWordId]||"":"";}
function toggleNotes(force){state.notesEnabled=typeof force==="boolean"?force:!state.notesEnabled;$("notesToggle").setAttribute("aria-pressed",String(state.notesEnabled));$("notesToggle").textContent=`Notes: ${state.notesEnabled?"On":"Off"}`;updateNoteWindow();}
let noteDrag=null;$("noteWindowHandle").addEventListener("pointerdown",e=>{if(e.target.closest("button"))return;const rect=$("noteWindow").getBoundingClientRect();noteDrag={x:e.clientX-rect.left,y:e.clientY-rect.top};$("noteWindowHandle").setPointerCapture(e.pointerId);});$("noteWindowHandle").addEventListener("pointermove",e=>{if(!noteDrag)return;const x=clamp(e.clientX-noteDrag.x,0,innerWidth-$("noteWindow").offsetWidth),y=clamp(e.clientY-noteDrag.y,0,innerHeight-$("noteWindow").offsetHeight);state.noteWindowPosition={x,y};Object.assign($("noteWindow").style,{left:`${x}px`,top:`${y}px`});});$("noteWindowHandle").addEventListener("pointerup",()=>noteDrag=null);
$("wordNote").addEventListener("input",e=>{if(!state.selectedWordId)return;const value=e.target.value;if(value)state.notes[state.selectedWordId]=value;else delete state.notes[state.selectedWordId];selectedWordElement()?.classList.toggle("has-note",Boolean(value));});

function normalizeReadWord(value){return String(value||"").normalize("NFKD").replace(/[\u0591-\u05c7]/gu,"").replace(/[ךםןףץ]/gu,char=>({ך:"כ",ם:"מ",ן:"נ",ף:"פ",ץ:"צ"})[char]).replace(/[^\u05d0-\u05ea]/gu,"");}
function readingWords(value){return String(value||"").split(/\s+/u).map(normalizeReadWord).filter(Boolean);}
function editDistance(a,b){const previous=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let diagonal=previous[0];previous[0]=i;for(let j=1;j<=b.length;j++){const above=previous[j],cost=a[i-1]===b[j-1]?0:1;previous[j]=Math.min(previous[j]+1,previous[j-1]+1,diagonal+cost);diagonal=above;}}return previous[b.length];}
function readingMatch(target,spoken){if(target===spoken)return{kind:"correct",cost:0};const distance=editDistance(target,spoken),longest=Math.max(target.length,spoken.length);if(longest>=4&&distance===1)return{kind:"review",cost:.45};return{kind:"review",cost:1};}
function alignReadingWords(targetWords,spokenWords){
  if(!spokenWords.length)return{operations:[],correct:0,review:0,missed:0,extra:0,evaluated:0,accuracy:0};
  const target=targetWords.slice(0,Math.min(targetWords.length,spokenWords.length+12)),n=target.length,m=spokenWords.length,dp=Array.from({length:n+1},()=>Array(m+1).fill(0)),back=Array.from({length:n+1},()=>Array(m+1).fill(null));
  for(let i=1;i<=n;i++){dp[i][0]=i*.9;back[i][0]="missed";}for(let j=1;j<=m;j++){dp[0][j]=j*.9;back[0][j]="extra";}
  for(let i=1;i<=n;i++)for(let j=1;j<=m;j++){const match=readingMatch(target[i-1],spokenWords[j-1]),choices=[{cost:dp[i-1][j-1]+match.cost,op:match.kind},{cost:dp[i-1][j]+.9,op:"missed"},{cost:dp[i][j-1]+.9,op:"extra"}].sort((a,b)=>a.cost-b.cost);dp[i][j]=choices[0].cost;back[i][j]=choices[0].op;}
  let bestEnd=0;for(let end=1;end<=n;end++)if(dp[end][m]<=dp[bestEnd][m]+.0001)bestEnd=end;
  const operations=[];let i=bestEnd,j=m;while(i||j){const op=back[i][j];if(op==="correct"||op==="review"){operations.push({op,targetIndex:i-1,spokenIndex:j-1,target:target[i-1],spoken:spokenWords[j-1]});i--;j--;}else if(op==="missed"){operations.push({op,targetIndex:i-1,target:target[i-1]});i--;}else{operations.push({op:"extra",spokenIndex:j-1,spoken:spokenWords[j-1]});j--;}}operations.reverse();
  const result={operations,correct:0,review:0,missed:0,extra:0,evaluated:0,accuracy:0};for(const item of operations){if(item.op==="correct")result.correct++;else if(item.op==="review")result.review++;else if(item.op==="missed")result.missed++;else result.extra++;}result.evaluated=result.correct+result.review+result.missed;result.accuracy=result.evaluated?Math.round(result.correct/result.evaluated*100):0;return result;
}
function speechRecognitionClass(){return window.SpeechRecognition||window.webkitSpeechRecognition||null;}
function clearReadingMarks(){$("dafPage").querySelectorAll(".read-correct,.read-review,.read-missed,.reading-current").forEach(word=>word.classList.remove("read-correct","read-review","read-missed","reading-current"));}
function selectedGemaraWord(){const word=selectedWordElement();return word?.dataset.stream==="gemara"?word:null;}
function setReadingStatus(text,error=false){$("readingStatus").textContent=text;$("readingStatus").classList.toggle("error",error);}
function updateReadingControls(){
  const selected=selectedGemaraWord(),supported=Boolean(speechRecognitionClass());
  const phrase=selected&&state.navigationUnit==="phrase"&&selected.dataset.phraseIndex!=null?phraseElements(selected.dataset.phraseIndex).map(word=>word.textContent).join(" "):null;
  $("readingStartLabel").textContent=selected?(phrase?`Starting phrase: ${phrase}`:`Starting word: ${selected.textContent}`):"Starting word: not selected";
  $("startReading").disabled=readingState.active||!selected||!supported;$("stopReading").disabled=!readingState.active;$("resetReading").disabled=!readingState.startId&&!readingState.finalTranscript&&!readingState.interimTranscript;
  if(!supported)setReadingStatus("Hebrew microphone recognition is unavailable in this browser. Open the project in current Chrome or Edge.",true);else if(!selected&&!readingState.active&&!readingState.startId)setReadingStatus("Select a Gemara word to begin.");
}
function showReadingResult(transcript,{final=false}={}){
  const spoken=readingWords(transcript),targets=readingState.targetIds.map(id=>normalizeReadWord(document.querySelector(`[data-word-id="${CSS.escape(id)}"]`)?.textContent)),alignment=alignReadingWords(targets,spoken);readingState.lastAlignment=alignment;clearReadingMarks();
  for(const item of alignment.operations){if(item.targetIndex==null)continue;const element=document.querySelector(`[data-word-id="${CSS.escape(readingState.targetIds[item.targetIndex])}"]`);element?.classList.add(item.op==="correct"?"read-correct":item.op==="missed"?"read-missed":"read-review");}
  const consumed=alignment.operations.reduce((max,item)=>item.targetIndex==null?max:Math.max(max,item.targetIndex+1),0),nextId=readingState.targetIds[consumed],next=nextId?document.querySelector(`[data-word-id="${CSS.escape(nextId)}"]`):null;next?.classList.add("reading-current");
  $("readingAccuracy").textContent=alignment.evaluated?`${alignment.accuracy}%`:"—";$("readingCorrect").textContent=alignment.correct;$("readingReview").textContent=alignment.review+alignment.extra;$("readingMissed").textContent=alignment.missed;$("readingTranscript").textContent=transcript.trim()||"Listening…";
  if(next&&spoken.length)next.scrollIntoView({block:"nearest",inline:"nearest"});if(final&&alignment.evaluated)setReadingStatus(`Session complete: ${alignment.correct} of ${alignment.evaluated} evaluated Gemara words matched exactly. Review the marked words with the student.`);
}
function resetReadingSession({keepSelection=false}={}){
  if(readingState.recognition){readingState.stopping=true;try{readingState.recognition.abort();}catch{}}
  Object.assign(readingState,{recognition:null,active:false,stopping:false,startId:null,targetIds:[],finalTranscript:"",interimTranscript:"",lastAlignment:null,error:null});clearReadingMarks();$("readingAccuracy").textContent="—";$("readingCorrect").textContent="0";$("readingReview").textContent="0";$("readingMissed").textContent="0";$("readingTranscript").textContent="Recognized words will appear here.";if(!keepSelection&&selectedGemaraWord())state.selectedWordId=null;updateReadingControls();
}
function finishReading(){if(!readingState.active)return;readingState.stopping=true;setReadingStatus("Finishing the reading sample…");try{readingState.recognition?.stop();}catch{readingState.active=false;updateReadingControls();}}
function startReading(){
  const start=selectedGemaraWord(),Recognition=speechRecognitionClass();if(!start||!Recognition){updateReadingControls();return;}resetReadingSession({keepSelection:true});const gemaraWords=[...$("dafPage").querySelectorAll('.word-token[data-stream="gemara"]')],at=gemaraWords.indexOf(start);readingState.startId=start.dataset.wordId;readingState.targetIds=gemaraWords.slice(at).map(word=>word.dataset.wordId);const recognition=new Recognition();readingState.recognition=recognition;recognition.lang="he-IL";recognition.continuous=true;recognition.interimResults=true;recognition.maxAlternatives=1;
  recognition.onstart=()=>{readingState.active=true;readingState.stopping=false;setInteractionMode("navigate",{focus:false});setAnnotating(false);if(state.selecting)beginExcerpt();setReadingStatus("Listening in Hebrew… Read from the highlighted Gemara word.");clearReadingMarks();start.classList.add("reading-current");updateReadingControls();};
  recognition.onresult=event=>{const finalParts=[],interimParts=[];for(let i=0;i<event.results.length;i++){const text=event.results[i][0]?.transcript||"";(event.results[i].isFinal?finalParts:interimParts).push(text);}readingState.finalTranscript=finalParts.join(" ");readingState.interimTranscript=interimParts.join(" ");showReadingResult(`${readingState.finalTranscript} ${readingState.interimTranscript}`);};
  recognition.onerror=event=>{readingState.error=event.error;const messages={"not-allowed":"Microphone permission was denied. Allow microphone access and try again.","audio-capture":"No microphone was found.","no-speech":"No speech was detected. Try again and begin reading after Listening appears.",network:"The browser speech service could not connect."};setReadingStatus(messages[event.error]||`Speech recognition stopped: ${event.error}.`,true);};
  recognition.onend=()=>{readingState.active=false;showReadingResult(readingState.finalTranscript||readingState.interimTranscript,{final:!readingState.error});readingState.recognition=null;updateReadingControls();};
  try{readingState.active=true;updateReadingControls();recognition.start();setReadingStatus("Requesting microphone access…");}catch(error){readingState.active=false;readingState.recognition=null;setReadingStatus(`Could not start the microphone: ${error.message}.`,true);updateReadingControls();}
}

function cloneAnnotations(value=state.annotations){return JSON.parse(JSON.stringify(value));}
function syncAnnotationCanvas(){const canvas=$("annotationCanvas"),page=$("dafPage"),dpr=devicePixelRatio||1,w=page.clientWidth,h=page.clientHeight;if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=`${w}px`;canvas.style.height=`${h}px`;}const ctx=canvas.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);for(const stroke of state.annotations)drawStroke(ctx,stroke);updateAnnotationButtons();}
function drawStroke(ctx,stroke){if(stroke.points.length<1)return;ctx.save();ctx.lineCap="round";ctx.lineJoin="round";ctx.lineWidth=stroke.tool==="highlighter"?stroke.width*3:stroke.width;ctx.strokeStyle=stroke.color;ctx.globalAlpha=stroke.tool==="highlighter"?.28:1;ctx.globalCompositeOperation=stroke.tool==="eraser"?"destination-out":"source-over";ctx.beginPath();ctx.moveTo(stroke.points[0].x,stroke.points[0].y);for(const p of stroke.points.slice(1))ctx.lineTo(p.x,p.y);if(stroke.points.length===1)ctx.lineTo(stroke.points[0].x+.01,stroke.points[0].y+.01);ctx.stroke();ctx.restore();}
function updateAnnotationButtons(){$("annotationUndo").disabled=!state.annotationUndo.length;$("annotationRedo").disabled=!state.annotationRedo.length;$("clearAnnotations").disabled=!state.annotations.length;}
function setAnnotating(active){state.annotating=Boolean(active);$("dafPage").classList.toggle("annotating",state.annotating);$("annotationToggle").setAttribute("aria-pressed",String(state.annotating));$("annotationToggle").textContent=state.annotating?"Exit annotation mode":"Annotate page";if(active&&state.selecting)beginExcerpt();}
function selectAnnotationTool(tool){state.annotationTool=tool;for(const button of document.querySelectorAll(".annotation-tool"))button.setAttribute("aria-pressed",String(button.dataset.tool===tool));setAnnotating(true);}
let drawing=null,annotationBefore=null;$("annotationCanvas").addEventListener("pointerdown",e=>{if(!state.annotating)return;e.preventDefault();annotationBefore=cloneAnnotations();drawing={tool:state.annotationTool,color:state.annotationColor,width:state.strokeWidth,points:[localPoint(e)]};state.annotations.push(drawing);state.annotationRedo=[];$("annotationCanvas").setPointerCapture(e.pointerId);syncAnnotationCanvas();});$("annotationCanvas").addEventListener("pointermove",e=>{if(!drawing)return;drawing.points.push(localPoint(e));syncAnnotationCanvas();});$("annotationCanvas").addEventListener("pointerup",()=>{if(!drawing)return;state.annotationUndo.push(annotationBefore);drawing=null;annotationBefore=null;syncAnnotationCanvas();});
function undoAnnotations(){if(!state.annotationUndo.length)return;state.annotationRedo.push(cloneAnnotations());state.annotations=state.annotationUndo.pop();syncAnnotationCanvas();}
function redoAnnotations(){if(!state.annotationRedo.length)return;state.annotationUndo.push(cloneAnnotations());state.annotations=state.annotationRedo.pop();syncAnnotationCanvas();}
function clearAnnotations(){if(!state.annotations.length)return;state.annotationUndo.push(cloneAnnotations());state.annotations=[];state.annotationRedo=[];syncAnnotationCanvas();}

function projectPayload(){if(state.dirty)capturePageEdits();return{format:"vilna-daf-studio-project",version:1,build:BUILD_VERSION,savedAt:new Date().toISOString(),daf:{ref:state.ref,header:state.header,gemaraHtml:state.gemaraHtml,rashiHtml:state.rashiHtml,rashbamHtml:state.rashbamHtml,tosafotHtml:state.tosafotHtml,isSample:state.isSample},view:{typography:state.typography,mode:state.mode,navigationUnit:state.navigationUnit,selectedWordId:state.selectedWordId,wordFontScales:state.wordFontScales,whitedWordIds:state.whitedWordIds,focusEnabled:state.focusEnabled,focusWindow:state.focusWindow,notesEnabled:state.notesEnabled,nekudosEnabled:state.nekudosEnabled,lineNumbersEnabled:state.lineNumbersEnabled,pageZoom:state.pageZoom,noteWindowPosition:state.noteWindowPosition,selection:state.selection},lesson:{visualLinks:state.visualLinks},notes:state.notes,annotations:state.annotations,annotationSettings:{tool:state.annotationTool,color:state.annotationColor,width:state.strokeWidth}};}
function downloadBlob(blob,name){const a=document.createElement("a"),url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function saveProject(){const payload=projectPayload(),name=`${state.ref.replace(/\s+/g,"-")}.vds`;downloadBlob(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),name);$("projectStatus").textContent=`Saved ${name}.`;}
async function openProjectFile(file){const data=JSON.parse(await file.text());if(data?.format!=="vilna-daf-studio-project"||data.version!==1||!data.daf?.ref)throw new Error("This is not a supported Vilna Daf Studio project");const projectRef=String(data.daf.ref);Object.assign(state,{ref:projectRef,header:String(data.daf.header||""),gemaraHtml:normalizeGemaraForRef(cleanHtml(data.daf.gemaraHtml),projectRef),rashiHtml:normalizeCommentaryForRef(cleanHtml(data.daf.rashiHtml),projectRef,"inner"),rashbamHtml:cleanHtml(data.daf.rashbamHtml),tosafotHtml:cleanHtml(data.daf.tosafotHtml),isSample:Boolean(data.daf.isSample),typography:TYPOGRAPHY_PRESETS[data.view?.typography]?data.view.typography:"archival-open",mode:data.view?.mode==="edit"?"edit":"navigate",navigationUnit:data.view?.navigationUnit==="phrase"?"phrase":"word",selectedWordId:data.view?.selectedWordId||null,editSelectedWordIds:[],wordFontScales:data.view?.wordFontScales&&typeof data.view.wordFontScales==="object"?data.view.wordFontScales:{},whitedWordIds:data.view?.whitedWordIds&&typeof data.view.whitedWordIds==="object"?data.view.whitedWordIds:{},focusEnabled:Boolean(data.view?.focusEnabled),focusWindow:clamp(Number(data.view?.focusWindow)||1,1,12),visualLinks:data.lesson?.visualLinks&&typeof data.lesson.visualLinks==="object"?data.lesson.visualLinks:{},notesEnabled:Boolean(data.view?.notesEnabled),nekudosEnabled:data.view?.nekudosEnabled!==false,lineNumbersEnabled:Boolean(data.view?.lineNumbersEnabled),pageZoom:normalizedPageZoom(data.view?.pageZoom),noteWindowPosition:data.view?.noteWindowPosition||null,selection:data.view?.selection||null,notes:data.notes&&typeof data.notes==="object"?data.notes:{},annotations:Array.isArray(data.annotations)?data.annotations:[],annotationTool:["pen","highlighter","eraser"].includes(data.annotationSettings?.tool)?data.annotationSettings.tool:"pen",annotationColor:data.annotationSettings?.color||"#b32424",strokeWidth:Number(data.annotationSettings?.width)||3,annotationUndo:[],annotationRedo:[]});$("dafRef").value=state.ref;syncRegistrySelection(state.ref);$("focusWindowSize").value=[1,2,3].includes(state.focusWindow)?String(state.focusWindow):"custom";$("focusWindowCustom").value=state.focusWindow;$("focusWindowCustom").hidden=$("focusWindowSize").value!=="custom";$("annotationColor").value=state.annotationColor;$("strokeWidth").value=state.strokeWidth;$("strokeWidthValue").textContent=state.strokeWidth;updateDisplayToggles();selectAnnotationTool(state.annotationTool);setAnnotating(false);await applyTypography(state.typography,{recompose:false});await compose();toggleNotes(state.notesEnabled);if(state.selection){const b=$("selectionBox");b.hidden=false;Object.assign(b.style,{left:`${state.selection.x}px`,top:`${state.selection.y}px`,width:`${state.selection.width}px`,height:`${state.selection.height}px`});["downloadExactPng","copyExcerpt","downloadExcerpt","clearExcerpt"].forEach(id=>$(id).disabled=false);}$("projectStatus").textContent=`Opened ${file.name}.`;}
function wordCount(html){return htmlToPlain(html||"").trim().split(/\s+/u).filter(Boolean).length;}
function postAgentDiagnostics(extraFailures=[]){
  if(window.parent===window)return;
  const final=state.composition,diagnostics={
    ref:state.ref, patternName:final?.pattern?.name||"not composed",
    failures:[...new Set([...(final?.failures||[]),...extraFailures])],
    textOverflow:Boolean(final?.overflow), rashbamPresent:Boolean(state.rashbamHtml),
    headingMode:state.rashbamHeadingMode, settings:{...state.agentSettings},
    wordCounts:{gemara:wordCount(state.gemaraHtml),inner:wordCount(state.rashiHtml)+wordCount(state.rashbamHtml),tosafot:wordCount(state.tosafotHtml)},
    geometry:final?{blankRatio:final.blankRatio,minOccupancy:final.minOccupancy,transitionGap:final.transitionGap,scale:final.scale,bands:final.pattern?.bands}:null
  };
  window.parent.postMessage({type:"vilna-agent-diagnostics",diagnostics},location.origin);
}
function afterCompose(){activateWordNavigation();updateDisplayToggles();requestAnimationFrame(()=>{applyPageZoom();syncAnnotationCanvas();renderGemaraLineNumbers();postAgentDiagnostics();});updateNoteWindow();}

function localPoint(e){const page=$("dafPage"),r=page.getBoundingClientRect(),zoom=normalizedPageZoom(state.pageZoom);return{x:Math.max(0,Math.min(page.clientWidth,(e.clientX-r.left)/zoom)),y:Math.max(0,Math.min(page.clientHeight,(e.clientY-r.top)/zoom))};}
function beginExcerpt(){state.selecting=!state.selecting;if(state.selecting)setAnnotating(false);$("dafPage").classList.toggle("selecting",state.selecting);$("excerptMode").textContent=state.selecting?"Exit excerpt mode":"Select excerpt";}
let dragStart=null;$("dafPage").addEventListener("pointerdown",e=>{if(!state.selecting)return;dragStart=localPoint(e);$("dafPage").setPointerCapture(e.pointerId);const b=$("selectionBox");b.hidden=false;Object.assign(b.style,{left:`${dragStart.x}px`,top:`${dragStart.y}px`,width:"0",height:"0"});});$("dafPage").addEventListener("pointermove",e=>{if(!dragStart||!state.selecting)return;const p=localPoint(e),x=Math.min(p.x,dragStart.x),y=Math.min(p.y,dragStart.y);Object.assign($("selectionBox").style,{left:`${x}px`,top:`${y}px`,width:`${Math.abs(p.x-dragStart.x)}px`,height:`${Math.abs(p.y-dragStart.y)}px`});});$("dafPage").addEventListener("pointerup",e=>{if(!dragStart||!state.selecting)return;const p=localPoint(e);state.selection={x:Math.min(p.x,dragStart.x),y:Math.min(p.y,dragStart.y),width:Math.abs(p.x-dragStart.x),height:Math.abs(p.y-dragStart.y)};dragStart=null;const ok=state.selection.width>8&&state.selection.height>8;["downloadExactPng","copyExcerpt","downloadExcerpt","clearExcerpt"].forEach(id=>$(id).disabled=!ok);});
function excerptForeignObjectSvg(){if(!state.selection)return null;const{x,y,width,height}=state.selection,margin=6,clone=$("dafPage").cloneNode(true);clone.querySelector("#selectionBox")?.remove();clone.querySelectorAll(".phrase-visual-icon").forEach(el=>el.remove());clone.querySelectorAll(".selected-word,.has-note").forEach(el=>el.classList.remove("selected-word","has-note"));clone.classList.remove("selecting","annotating");Object.assign(clone.style,{boxShadow:"none",margin:"0",transform:"none",width:`${$("dafPage").clientWidth}px`,height:`${$("dafPage").clientHeight}px`});const css=Array.from(document.styleSheets).map(s=>{try{return Array.from(s.cssRules).map(r=>r.cssText).join("\n");}catch{return"";}}).join("\n"),serialized=new XMLSerializer().serializeToString(clone),outputWidth=width+margin*2,outputHeight=height+margin*2;return`<svg xmlns="http://www.w3.org/2000/svg" width="${outputWidth}" height="${outputHeight}" viewBox="0 0 ${outputWidth} ${outputHeight}"><rect width="100%" height="100%" fill="#fffef9"/><foreignObject x="${-x+margin}" y="${-y+margin}" width="${$("dafPage").clientWidth}" height="${$("dafPage").clientHeight}"><div xmlns="http://www.w3.org/1999/xhtml"><style>${css.replace(/<\/style/gi,"<\\/style")}</style>${serialized}</div></foreignObject></svg>`;}
const vectorFontCache={};
function loadVectorFont(key,url){if(!vectorFontCache[key])vectorFontCache[key]=new Promise((resolve,reject)=>opentype.load(url,(error,font)=>error?reject(error):resolve(font)));return vectorFontCache[key];}
async function vectorFonts(){return{gemara:await loadVectorFont("gemara","assets/fonts/DrugulinCLM-Bold.otf"),commentary:await loadVectorFont("commentary","assets/fonts/Mekorot-Regular.ttf"),commentaryBold:await loadVectorFont("commentaryBold","assets/fonts/Mekorot-Bold.ttf")};}
function glyphRun(font,text,fontSize){const glyphs=font.stringToGlyphs(text),visual=/[\u0590-\u05ff]/u.test(text)?glyphs.reverse():glyphs,scale=fontSize/font.unitsPerEm,parts=[];let cursor=0,x1=Infinity,y1=Infinity,x2=-Infinity,y2=-Infinity;visual.forEach((glyph,index)=>{const path=glyph.getPath(cursor,0,fontSize),box=path.getBoundingBox();if(path.commands.length){parts.push(path.toPathData(3));x1=Math.min(x1,box.x1);y1=Math.min(y1,box.y1);x2=Math.max(x2,box.x2);y2=Math.max(y2,box.y2);}const next=visual[index+1];cursor+=(glyph.advanceWidth||font.unitsPerEm*.5)*scale+(next?font.getKerningValue(glyph,next)*scale:0);});if(!parts.length)return null;return{d:parts.join(""),advance:Math.max(.01,cursor),box:{x1,y1,x2,y2}};}
function intersects(a,b){return a.right>b.x&&a.left<b.x+b.width&&a.bottom>b.y&&a.top<b.y+b.height;}
function exportTextRect(element){if(element.classList.contains("word-token"))return element.getBoundingClientRect();const range=document.createRange();range.selectNodeContents(element);const rects=[...range.getClientRects()].filter(rect=>rect.width>.1&&rect.height>.1);return rects.length===1?rects[0]:element.getBoundingClientRect();}
function strokePath(points,offsetX,offsetY){if(!points.length)return"";return points.map((p,i)=>`${i?"L":"M"}${(p.x-offsetX).toFixed(2)} ${(p.y-offsetY).toFixed(2)}`).join(" ");}
function vectorAnnotationMarkup(strokes,selection){let body="";const masks=[];for(const [index,stroke] of strokes.entries()){const d=strokePath(stroke.points,selection.x,selection.y);if(!d)continue;if(stroke.tool==="eraser"){const id=`annotation-eraser-${index}`;masks.push(`<mask id="${id}"><rect width="100%" height="100%" fill="white"/><path d="${d}" fill="none" stroke="black" stroke-width="${stroke.width}" stroke-linecap="round" stroke-linejoin="round"/></mask>`);body=`<g mask="url(#${id})">${body}</g>`;}else body+=`<path d="${d}" fill="none" stroke="${stroke.color}" stroke-opacity="${stroke.tool==="highlighter"?.28:1}" stroke-width="${stroke.tool==="highlighter"?stroke.width*3:stroke.width}" stroke-linecap="round" stroke-linejoin="round"/>`;}return{defs:masks.join(""),body};}
async function canvaExcerptSvg(){
  if(!state.selection)return null;
  const selection=state.selection,fonts=await vectorFonts(),pageRect=$("dafPage").getBoundingClientRect(),zoom=normalizedPageZoom(state.pageZoom),targets=[$("dafNumber"),$("chapterTitle"),...$("dafPage").querySelectorAll(".word-token,.tosafot-notice,.gemara-line-number")],textPaths=[];
  for(const element of targets){
    const visualRect=exportTextRect(element),rect={left:(visualRect.left-pageRect.left)/zoom,right:(visualRect.right-pageRect.left)/zoom,top:(visualRect.top-pageRect.top)/zoom,bottom:(visualRect.bottom-pageRect.top)/zoom,width:visualRect.width/zoom,height:visualRect.height/zoom},local={left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom};
    if(!intersects(local,selection)||!element.textContent.trim())continue;
    const cs=getComputedStyle(element),isGemara=element.classList.contains("gemara-line-number")||Boolean(element.closest(".gemara,.daf-header")),bold=Number(cs.fontWeight)>=600||Boolean(element.closest("strong,.tosafot-notice")),font=isGemara?fonts.gemara:bold?fonts.commentaryBold:fonts.commentary,run=glyphRun(font,element.textContent.trim(),parseFloat(cs.fontSize)||12);
    if(!run)continue;
    const inkHeight=Math.max(.01,run.box.y2-run.box.y1),scaleX=rect.width/run.advance,baseline=local.top+(rect.height-inkHeight)/2-run.box.y1,x=local.left-selection.x,y=baseline-selection.y;
    const faded=element.classList.contains("word-whited-out"),pathStyle=faded?'fill="none" stroke="#d3cfc6" stroke-width=".35"':'fill="#080706"';textPaths.push(`<g transform="translate(${x.toFixed(3)} ${y.toFixed(3)})"><g transform="scale(${scaleX.toFixed(5)} 1)"><path d="${run.d}" ${pathStyle}/></g></g>`);
  }
  const visible=state.annotations.filter(stroke=>stroke.points.some(p=>p.x>=selection.x-40&&p.x<=selection.x+selection.width+40&&p.y>=selection.y-40&&p.y<=selection.y+selection.height+40)),annotation=vectorAnnotationMarkup(visible,selection);
  return`<svg xmlns="http://www.w3.org/2000/svg" width="${selection.width}" height="${selection.height}" viewBox="0 0 ${selection.width} ${selection.height}"><defs><clipPath id="excerpt-clip"><rect width="${selection.width}" height="${selection.height}"/></clipPath>${annotation.defs}</defs><rect width="100%" height="100%" fill="#fffef9"/><g clip-path="url(#excerpt-clip)">${textPaths.join("")}${annotation.body}</g></svg>`;
}
function svgToPng(svg){return new Promise((resolve,reject)=>{const img=new Image(),url=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml"}));img.onload=()=>{const scale=4,c=document.createElement("canvas");c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));const ctx=c.getContext("2d");ctx.fillStyle="#fffef9";ctx.fillRect(0,0,c.width,c.height);ctx.scale(scale,scale);ctx.drawImage(img,0,0);URL.revokeObjectURL(url);c.toBlob(b=>b?resolve(b):reject(new Error("PNG conversion failed")),"image/png");};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("SVG rendering failed"));};img.src=url;});}
async function downloadExactPng(){const svg=excerptForeignObjectSvg();if(!svg)return;try{$("downloadExactPng").disabled=true;status("Capturing the finished browser rendering at 4× resolution…");const png=await svgToPng(svg);downloadBlob(png,`${state.ref.replace(/\s+/g,"-")}-Exact-Slide.png`);status("Exact Slide PNG downloaded with a safety margin and no recomposition.");}catch(error){status(`Could not create the Exact Slide PNG: ${error.message}`,true);}finally{$("downloadExactPng").disabled=false;}}
async function copyExcerpt(){const svg=excerptForeignObjectSvg();if(!svg)return;try{const png=await svgToPng(svg);await navigator.clipboard.write([new ClipboardItem({"image/png":png})]);status("Caption-free daf excerpt copied at 4× resolution.");}catch{await downloadExactPng();status("Clipboard image paste is unavailable, so the Exact Slide PNG was downloaded.");}}
async function downloadExcerpt(){if(!state.selection)return;try{$("downloadExcerpt").disabled=true;status("Converting the selected text to Canva-compatible vector paths…");const svg=await canvaExcerptSvg();downloadBlob(new Blob([svg],{type:"image/svg+xml"}),`${state.ref.replace(/\s+/g,"-")}-Canva.svg`);status("Canva-compatible path SVG downloaded. It can be enlarged without losing text or clipping an image edge.");}catch(error){status(`Could not create the vector excerpt: ${error.message}`,true);}finally{$("downloadExcerpt").disabled=false;}}
function clearExcerpt(){state.selection=null;$("selectionBox").hidden=true;["downloadExactPng","copyExcerpt","downloadExcerpt","clearExcerpt"].forEach(id=>$(id).disabled=true);}

populateTractateSelector();syncRegistrySelection($("dafRef").value);
$("tractateSelect").addEventListener("change",()=>populatePageSelector());$("pageSelect").addEventListener("change",e=>updateVerificationStatus(e.target.value));$("loadSelectedPage").addEventListener("click",()=>{$("dafRef").value=$("pageSelect").value;loadDaf();});
$("loadDaf").addEventListener("click",()=>loadDaf());$("dafRef").addEventListener("input",e=>updateVerificationStatus(e.target.value));$("dafRef").addEventListener("keydown",e=>{if(e.key==="Enter")loadDaf();});$("reflowEdits").addEventListener("click",reflowPageEdits);$("excerptMode").addEventListener("click",beginExcerpt);$("downloadExactPng").addEventListener("click",downloadExactPng);$("copyExcerpt").addEventListener("click",copyExcerpt);$("downloadExcerpt").addEventListener("click",downloadExcerpt);$("clearExcerpt").addEventListener("click",clearExcerpt);$("typographyPreset").addEventListener("change",e=>applyTypography(e.target.value));
$("navigateMode").addEventListener("click",()=>setInteractionMode("navigate"));$("editMode").addEventListener("click",()=>setInteractionMode("edit"));$("wordNavigation").addEventListener("click",()=>setNavigationUnit("word"));$("phraseNavigation").addEventListener("click",()=>setNavigationUnit("phrase"));$("notesToggle").addEventListener("click",()=>toggleNotes());$("closeNoteWindow").addEventListener("click",()=>toggleNotes(false));$("nekudosToggle").addEventListener("click",()=>toggleNekudos());$("lineNumbersToggle").addEventListener("click",()=>toggleLineNumbers());
$("focusNavigatorToggle").addEventListener("click",()=>setFocusEnabled());$("focusPrevious").addEventListener("click",()=>moveSelectedUnit(-1));$("focusNext").addEventListener("click",()=>moveSelectedUnit(1));
$("focusWindowSize").addEventListener("change",e=>{const custom=e.target.value==="custom";$("focusWindowCustom").hidden=!custom;state.focusWindow=focusWindowCount();applyFocusAppearance();});$("focusWindowCustom").addEventListener("input",()=>{state.focusWindow=focusWindowCount();applyFocusAppearance();});
$("attachVisual").addEventListener("click",addVisualLink);$("openVisual").addEventListener("click",()=>openPhraseVisual());$("removeVisual").addEventListener("click",removeVisualLink);$("visualUrl").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();addVisualLink();}});
$("pageZoomSmaller").addEventListener("click",()=>changePageZoom(-PAGE_ZOOM_STEP));$("pageZoomLarger").addEventListener("click",()=>changePageZoom(PAGE_ZOOM_STEP));
$("whiteoutSelection").addEventListener("click",()=>setSelectionWhiteout(true));$("restoreSelection").addEventListener("click",()=>setSelectionWhiteout(false));$("clearWhiteouts").addEventListener("click",clearWordWhiteouts);document.addEventListener("selectionchange",()=>requestAnimationFrame(rememberEditSelection));
$("startReading").addEventListener("click",startReading);$("stopReading").addEventListener("click",finishReading);$("resetReading").addEventListener("click",()=>resetReadingSession({keepSelection:true}));
$("dafPage").addEventListener("click",e=>{const visual=e.target.closest(".phrase-visual-icon");if(visual){e.preventDefault();e.stopPropagation();openPhraseVisual(Number(visual.dataset.phraseIndex));return;}if(state.mode!=="navigate"||state.selecting||state.annotating)return;const word=e.target.closest(".word-token");if(word)selectWord(word);});document.addEventListener("keydown",e=>{if(state.mode!=="navigate"||!state.selectedWordId||e.altKey||e.ctrlKey||e.metaKey||["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName))return;if(e.key==="ArrowLeft"){e.preventDefault();moveSelectedUnit(1);}else if(e.key==="ArrowRight"){e.preventDefault();moveSelectedUnit(-1);}});
$("annotationToggle").addEventListener("click",()=>setAnnotating(!state.annotating));document.querySelectorAll(".annotation-tool").forEach(button=>button.addEventListener("click",()=>selectAnnotationTool(button.dataset.tool)));$("annotationColor").addEventListener("input",e=>state.annotationColor=e.target.value);$("strokeWidth").addEventListener("input",e=>{state.strokeWidth=Number(e.target.value);$("strokeWidthValue").textContent=e.target.value;});$("annotationUndo").addEventListener("click",undoAnnotations);$("annotationRedo").addEventListener("click",redoAnnotations);$("clearAnnotations").addEventListener("click",clearAnnotations);
$("saveProject").addEventListener("click",saveProject);$("openProject").addEventListener("click",()=>$("projectFile").click());$("projectFile").addEventListener("change",async e=>{const file=e.target.files?.[0];if(!file)return;try{await openProjectFile(file);}catch(error){$("projectStatus").textContent=`Could not open project: ${error.message}.`;}finally{e.target.value="";}});
function safeAgentSettings(value={}){const ranges={pageHeight:[900,1300],openingLines:[2,8],gemaraScale:[.78,1.18],commentaryScale:[.72,1.18],continuationLines:[1,12]},clean={};for(const[key,[min,max]]of Object.entries(ranges)){const number=Number(value[key]);if(Number.isFinite(number)&&number>=min&&number<=max)clean[key]=["pageHeight","openingLines","continuationLines"].includes(key)?Math.round(number):number;}if(value.forceCascade===true)clean.forceCascade=true;if(["inner","tosafot"].includes(value.preferredSurvivor))clean.preferredSurvivor=value.preferredSurvivor;return clean;}
window.addEventListener("message",async event=>{
  if(event.origin!==location.origin||event.source!==window.parent)return;
  const data=event.data||{};
  if(data.type==="vilna-agent-load"){
    state.agentSettings=safeAgentSettings(data.settings);state.rashbamHeadingMode=data.rashbamHeadingMode||"unresolved";state.rashbamAllowed=data.rashbamAllowed!==false;$("dafRef").value=String(data.ref||"").trim();await loadDaf();
  }else if(data.type==="vilna-agent-adjust"){
    state.agentSettings={...state.agentSettings,...safeAgentSettings(data.settings)};await compose();
  }else if(data.type==="vilna-agent-set-rashbam-policy"){
    const next=["full","short","none","unresolved"].includes(data.headingMode)?data.headingMode:"unresolved";
    if(next!==state.rashbamHeadingMode){state.rashbamHeadingMode=next;await compose();}
  }
});
$("dafPage").addEventListener("input",e=>{if(!e.target.closest(".flow-region,.top-commentary"))return;state.dirty=true;status("Page edited directly. Choose Reflow page edits when ready.");requestAnimationFrame(renderGemaraLineNumbers);});window.addEventListener("resize",()=>{syncAnnotationCanvas();renderGemaraLineNumbers();if(!state.dirty&&!$("dafPage").classList.contains("composing"))requestAnimationFrame(()=>compose());});document.fonts.ready.then(async()=>{updateDisplayToggles();await applyTypography(state.typography,{recompose:false});if(new URLSearchParams(location.search).has("builder"))window.parent.postMessage({type:"vilna-agent-ready"},location.origin);else await loadDaf({automatic:true});});
