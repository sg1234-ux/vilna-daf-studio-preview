const BUILD_VERSION="62.51";window.VILNA_DAF_BUILD=BUILD_VERSION;
const SOLVER_REGRESSION_MODE=new URLSearchParams(location.search).get("solver-regression")==="1";
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
  {tractate:"Pesachim",tractateLabel:"פסחים",ref:"Pesachim 100a",pageLabel:"ק ע״א — draft",verified:false},
  {tractate:"Bava Metzia",tractateLabel:"בבא מציעא",ref:"Bava Metzia 21a",pageLabel:"כא ע״א",verified:true}
];
const savedTypography=localStorage.getItem("vilna-daf-typography");
const state={...sample,selection:null,selecting:false,composition:null,agentSettings:{},rashbamHeadingMode:"full",rashbamAllowed:true,typography:TYPOGRAPHY_PRESETS[savedTypography]?savedTypography:"archival-open",mode:"navigate",navigationUnit:"word",selectedWordId:null,editSelectedWordIds:[],wordFontScales:{},whitedWordIds:{},focusEnabled:false,focusWindow:1,visualLinks:{},notesEnabled:false,nekudosEnabled:true,punctuationEnabled:true,lineNumbersEnabled:false,pageZoom:1.5,notes:{},noteWindowPosition:null,annotating:false,annotationTool:"pen",annotationColor:"#b32424",strokeWidth:3,annotations:[],annotationUndo:[],annotationRedo:[]};
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
  "pesachim 100a":{
  "source": "DafYomi.org Vilna Pesachim 100a reference; editable text from the recovered Sefaria responses",
  "typography": {
    "gemaraSize": 15.1,
    "commentarySize": 9.4,
    "gemaraOpeningScale": 1,
    "innerDibburScale": 1.02,
    "tosafotDibburScale": 1.04,
    "gemaraLeading": 16.35,
    "commentaryLeading": 13.185483870967744,
    "pageHeight": 1016,
    "pageBottomPadding": 32
  },
  "layout": {
    "openingLines": 4,
    "boxWalls": false,
    "allowHorizontalCompression": true,
    "stages": [
      {
        "streams": [
          "tosafot",
          "gemara",
          "inner"
        ],
        "widths": [
          1.625,
          2.5,
          1.625
        ],
        "counts": {
          "gemara": 25,
          "inner": 31,
          "tosafot": 31
        }
      },
      {
        "streams": [
          "tosafot",
          "inner"
        ],
        "widths": [
          50,
          50
        ],
        "counts": {
          "inner": 32,
          "tosafot": 33
        }
      },
      {
        "streams": [
          "tosafot"
        ],
        "widths": [
          100
        ],
        "counts": {
          "tosafot": 1
        }
      }
    ]
  },
  "maps": {
    "gemara": {
      "tokenCount": 190,
      "lineEndTokens": [
        6,
        13,
        21,
        28,
        35,
        44,
        53,
        61,
        68,
        74,
        80,
        90,
        97,
        108,
        114,
        122,
        129,
        136,
        146,
        152,
        160,
        169,
        177,
        184,
        189
      ]
    },
    "inner": {
      "tokenCount": 566,
      "blankAfterTokens": [
        112
      ],
      "lineEndTokens": [
        9,
        21,
        30,
        40,
        46,
        52,
        58,
        64,
        70,
        75,
        82,
        86,
        92,
        97,
        103,
        109,
        112,
        113,
        119,
        125,
        130,
        135,
        140,
        146,
        151,
        156,
        162,
        168,
        174,
        180,
        185,
        191,
        197,
        202,
        213,
        224,
        235,
        246,
        256,
        267,
        276,
        288,
        300,
        313,
        325,
        337,
        349,
        359,
        371,
        384,
        395,
        407,
        419,
        430,
        440,
        452,
        463,
        473,
        485,
        496,
        509,
        520,
        531,
        542,
        554,
        565
      ]
    },
    "tosafot": {
      "tokenCount": 602,
      "lineEndTokens": [
        8,
        16,
        29,
        42,
        46,
        50,
        55,
        61,
        67,
        72,
        78,
        84,
        89,
        96,
        104,
        110,
        116,
        122,
        126,
        129,
        134,
        140,
        146,
        151,
        157,
        163,
        168,
        174,
        180,
        186,
        191,
        197,
        203,
        208,
        213,
        223,
        233,
        246,
        261,
        269,
        279,
        290,
        302,
        316,
        325,
        336,
        344,
        354,
        364,
        375,
        385,
        398,
        408,
        417,
        428,
        441,
        452,
        462,
        478,
        485,
        497,
        508,
        517,
        528,
        540,
        550,
        563,
        576,
        601
      ]
    }
  },
  "reviewStatus": "draft"
},
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
function knownReferenceProfile(ref=state.ref){return REFERENCE_PROFILES[ref.trim().toLowerCase()]||null;}
function referenceProfile(ref=state.ref){return state.isSample||SOLVER_REGRESSION_MODE?null:knownReferenceProfile(ref);}
function typographyProfile(ref=state.ref){return referenceProfile(ref)||(SOLVER_REGRESSION_MODE?knownReferenceProfile(ref):null);}
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
function tokensHtml(tokens,layoutWords=false){let html="",mode="";const close=m=>`${m.includes("i")?"</em>":""}${m.includes("b")?"</strong>":""}${m.includes("h")?"</span>":""}${m.includes("t")?"</span>":""}`,open=m=>`${m.includes("t")?'<span class="rashbam-transition">':""}${m.includes("h")?'<span class="commentary-heading">':""}${m.includes("b")?"<strong>":""}${m.includes("i")?"<em>":""}`;for(const [index,token] of tokens.entries()){const next=`${token.transition?"t":""}${token.heading?"h":""}${token.bold?"b":""}${token.italic?"i":""}`,attachedPunctuation=!token.break&&/^[.׃,:;!?]+$/u.test(token.text);if(attachedPunctuation)html=html.replace(/\s+$/u,"");if(next!==mode){html+=close(mode)+open(next);mode=next;}if(token.break){if(!(token.agentAnchor&&index===tokens.length-1))html+="<br>";}else{const text=escapeHtml(token.text);html+=layoutWords?`<span class="layout-token">${text}</span> `:`${text} `;}}html+=close(mode);return html.trim();}
function splitMappedLines(tokens){const lines=[],line=[];for(const token of tokens){if(token.blankLine){if(line.length)lines.push(line.splice(0));lines.push(null);continue;}if(token.break){if(line.length)lines.push(line.splice(0));continue;}line.push(token);}if(line.length)lines.push(line);return lines;}
function mappedCommentEndsHere(lines,index){const current=lines[index];if(!current?.length)return false;const next=lines.slice(index+1).find(line=>line?.length),last=current.at(-1);return!next||Boolean(next[0]?.bold&&!last?.bold);}
function normalizedMappedLine(line){return(line||[]).map(token=>token.text||"").join("").replace(/[^\u05d0-\u05ea]/g,"");}
function markMappedCommentEnds(lines,stream=""){lines.forEach((line,index)=>{if(line)line.commentEnd=mappedCommentEndsHere(lines,index)||(stream==="tosafot"&&normalizedMappedLine(line).includes("וכןהיהנוהגרת"));});return lines;}
function isHadranLine(lineTokens){return normalizedMappedLine(lineTokens)==="הדרןעלךשניםאוחזין";}
function mappedLinesHtml(lines){return lines.map((lineTokens,index)=>`<span class="mapped-line mapped-line-${index+1}${lineTokens===null?" mapped-blank-line":""}${lineTokens?.commentEnd?" mapped-comment-end-line":""}${isHadranLine(lineTokens)?" mapped-hadran-line":""}">${lineTokens===null?"":tokensHtml(lineTokens)}</span>`).join("");}
function mappedTokensHtml(tokens,stream=""){return mappedLinesHtml(markMappedCommentEnds(splitMappedLines(tokens),stream));}
function renderedTokens(tokens,region){if(region?.classList.contains("anchor-mapped"))return splitMappedLines(tokens).map(line=>`<span class="mapped-line">${tokensHtml(line||[],true)}</span>`).join("");return region?.classList.contains("reference-mapped")?mappedTokensHtml(tokens,region.dataset.stream):tokensHtml(tokens,true);}
function fitMappedLineWidths(region){if(!region?.classList.contains("reference-mapped"))return;const allowCompression=referenceProfile()?.layout?.allowHorizontalCompression!==false;for(const line of region.querySelectorAll(":scope > .mapped-line")){line.style.transform="";line.dataset.widthScale="1";line.dataset.requiredScale="1";const available=line.clientWidth,natural=line.scrollWidth;if(available>0&&natural>available+.5){const required=available/natural;line.dataset.requiredScale=String(required);if(allowCompression){const scale=Math.max(.86,required);line.style.transformOrigin="right center";line.style.transform=`scaleX(${scale})`;line.dataset.widthScale=String(scale);}}}}
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
function physicalOrder(){const side=state.agentSettings.innerSide;if(side==="right")return["tosafot","gemara","inner"];if(side==="left")return["inner","gemara","tosafot"];return isAleph(state.ref)?["tosafot","gemara","inner"]:["inner","gemara","tosafot"];}
function toHebrewNumber(number){const vals=[[400,"ת"],[300,"ש"],[200,"ר"],[100,"ק"],[90,"צ"],[80,"פ"],[70,"ע"],[60,"ס"],[50,"נ"],[40,"מ"],[30,"ל"],[20,"כ"],[10,"י"],[9,"ט"],[8,"ח"],[7,"ז"],[6,"ו"],[5,"ה"],[4,"ד"],[3,"ג"],[2,"ב"],[1,"א"]];let n=+number,out="";for(const[v,l]of vals)while(n>=v){out+=l;n-=v;}return out;}
function updateHeader(){const m=state.ref.match(/(\d+)([ab])\s*$/i),a=m?.[2].toLowerCase()==="a",profile=referenceProfile(),type=typographyProfile()?.typography||{},settings=state.agentSettings||{};$("dafPage").classList.toggle("amud-a",a);$("dafPage").classList.toggle("amud-b",!a);$("dafNumber").textContent=m?`${toHebrewNumber(m[1])}${a?".":":"}`:state.ref;$("chapterTitle").textContent=state.header;$("amudReport").textContent=a?"Aleph — ע״א":"Beis — ע״ב";$("dafPage").style.setProperty("--gemara-opening-scale",type.gemaraOpeningScale||1.22);$("dafPage").style.setProperty("--inner-dibbur-scale",type.innerDibburScale||1.04);$("dafPage").style.setProperty("--tosafot-dibbur-scale",type.tosafotDibburScale||1.08);$("dafPage").style.setProperty("--dibbur-size-increase","1px");$("dafPage").style.setProperty("--page-height",`${settings.pageHeight||type.pageHeight||1030}px`);$("dafPage").style.setProperty("--page-bottom-padding",`${type.pageBottomPadding||32}px`);$("dafPage").style.setProperty("--opening-lines",settings.openingLines||profile?.layout?.openingLines||4);}
function scaleParts(scale){if(typeof scale==="number")return{gemara:scale,gemaraSize:scale,commentary:scale,gemaraTracking:0,innerFontFactor:1,tosafotFontFactor:1};const gemara=Number(scale.gemara)||1;return{gemara,gemaraSize:Number(scale.gemaraSize)||gemara,commentary:Number(scale.commentary)||1,gemaraTracking:Number(scale.gemaraTracking)||0,innerFontFactor:Number(scale.innerFontFactor)||1,tosafotFontFactor:Number(scale.tosafotFontFactor)||1};}
function setScale(scale){const p=$("dafPage"),s=scaleParts(scale),type=typographyProfile()?.typography||{},settings=state.agentSettings||{},gemaraSize=(type.gemaraSize||15.1)*(settings.gemaraScale||1),commentarySize=(type.commentarySize||11.05)*(settings.commentaryScale||1),gemaraLeading=(type.gemaraLeading||16.35)*(settings.gemaraScale||1),commentaryLeading=(type.commentaryLeading||12.05)*(settings.commentaryScale||1);p.style.setProperty("--gemara-size",`${gemaraSize*s.gemaraSize}px`);p.style.setProperty("--gemara-leading",`${gemaraLeading*s.gemara}px`);p.style.setProperty("--gemara-tracking",`${s.gemaraTracking}px`);p.style.setProperty("--commentary-size",`${commentarySize*s.commentary}px`);p.style.setProperty("--commentary-leading",`${commentaryLeading*s.commentary}px`);p.style.setProperty("--inner-font-factor",s.innerFontFactor);p.style.setProperty("--tosafot-font-factor",s.tosafotFontFactor);}
function makeProbe(region){const cs=getComputedStyle(region),pageStyle=getComputedStyle($("dafPage")),p=document.createElement("div");p.className=region.className;p.dataset.stream=region.dataset.stream||"";p.dataset.band=region.dataset.band||"";Object.assign(p.style,{position:"fixed",visibility:"hidden",left:"-10000px",top:"-10000px",width:`${region.clientWidth}px`,height:"auto",overflow:"visible",boxSizing:"border-box",paddingTop:cs.paddingTop,paddingRight:cs.paddingRight,paddingBottom:cs.paddingBottom,paddingLeft:cs.paddingLeft,fontFamily:cs.fontFamily,fontSize:cs.fontSize,fontWeight:cs.fontWeight,lineHeight:cs.lineHeight,direction:"rtl",textAlign:"justify",whiteSpace:"normal",wordSpacing:cs.wordSpacing,letterSpacing:cs.letterSpacing});for(const property of["--gemara-size","--gemara-leading","--commentary-size","--commentary-leading","--gemara-opening-scale","--inner-dibbur-scale","--tosafot-dibbur-scale","--dibbur-size-increase","--inner-body-leading"])p.style.setProperty(property,pageStyle.getPropertyValue(property));document.body.appendChild(p);return p;}
function visualLineCount(element){
  const line=parseFloat(getComputedStyle(element).lineHeight)||1,rects=[...element.querySelectorAll(".layout-token,.word-token")].filter(token=>token.textContent.trim()).map(token=>token.getBoundingClientRect()).sort((a,b)=>a.top-b.top),rows=[];
  for(const rect of rects){const center=rect.top+rect.height/2;if(!rows.length||center-rows[rows.length-1]>line*.55)rows.push(center);}
  return rows.length;
}
function fitTokens(tokens,region){if(!tokens.length||region.clientWidth<5||region.clientHeight<5)return{chunk:[],rest:tokens,usedHeight:0};const p=makeProbe(region),mapped=region.classList.contains("reference-mapped"),capacity=mapped?region.getBoundingClientRect().height/($("dafPage").getBoundingClientRect().width/$("dafPage").offsetWidth):region.clientHeight;let lo=0,hi=tokens.length;while(lo<hi){const mid=Math.ceil((lo+hi)/2);p.innerHTML=renderedTokens(tokens.slice(0,mid),region);if(p.getBoundingClientRect().height<=capacity+.35&&(mapped||p.scrollWidth<=p.clientWidth+1))lo=mid;else hi=mid-1;}if(mapped&&lo<tokens.length){let boundary=0;for(let i=0;i<lo;i++)if(tokens[i].break||tokens[i].blankLine)boundary=i+1;lo=boundary;}if(lo>0&&lo<tokens.length&&tokens[lo-1].transition&&tokens[lo].transition)while(lo>0&&tokens[lo-1].transition)lo--;const chunk=tokens.slice(0,lo);p.innerHTML=renderedTokens(chunk,region);const usedHeight=p.getBoundingClientRect().height;p.remove();return{chunk,rest:tokens.slice(lo),usedHeight};}
function fitOpeningTokens(tokens,region,targetLines){
  if(!tokens.length||region.clientWidth<5)return{chunk:[],rest:tokens,usedHeight:0};
  const p=makeProbe(region);let lo=0,hi=tokens.length;
  while(lo<hi){const mid=Math.ceil((lo+hi)/2);p.innerHTML=renderedTokens(tokens.slice(0,mid),region);if(visualLineCount(p)<=targetLines&&p.scrollWidth<=p.clientWidth+1)lo=mid;else hi=mid-1;}
  const chunk=tokens.slice(0,lo);p.innerHTML=renderedTokens(chunk,region);const usedHeight=p.getBoundingClientRect().height;p.remove();return{chunk,rest:tokens.slice(lo),usedHeight};
}
function naturalLastLineFill(region){region.classList.remove("line-end-justify","line-end-center");const range=document.createRange();range.selectNodeContents(region);const rects=[...range.getClientRects()].filter(r=>r.width>.2&&r.height>.2);if(!rects.length)return 0;const bottom=Math.max(...rects.map(r=>r.bottom)),tolerance=Math.max(1,(parseFloat(getComputedStyle(region).lineHeight)||12)*.35),last=rects.filter(r=>Math.abs(r.bottom-bottom)<=tolerance),width=last.reduce((sum,r)=>sum+r.width,0);return Math.min(1,width/Math.max(1,region.clientWidth));}
function finishRegionLine(region,continues){if(!region.textContent.trim())return;const fill=naturalLastLineFill(region);region.classList.add(continues||fill>=.55?"line-end-justify":"line-end-center");}
function visiblyFitTokens(tokens,region,initial){
  if(region.classList.contains("reference-mapped")||!initial.chunk.length)return initial;
  region.innerHTML=renderedTokens(initial.chunk,region);if(region.scrollHeight<=region.clientHeight+1)return initial;
  let lo=0,hi=initial.chunk.length-1;
  while(lo<hi){const mid=Math.ceil((lo+hi)/2);region.innerHTML=renderedTokens(tokens.slice(0,mid),region);if(region.scrollHeight<=region.clientHeight+1)lo=mid;else hi=mid-1;}
  const chunk=tokens.slice(0,lo),probe=makeProbe(region);probe.innerHTML=renderedTokens(chunk,region);const usedHeight=probe.getBoundingClientRect().height;probe.remove();
  return{chunk,rest:tokens.slice(lo),usedHeight};
}
function fillStream(tokens,regions,shapeLines=false){if(regions[0]&&state.agentLockedStreams?.[regions[0].dataset.stream]&&state.agentSettings.continuousCommentaryStreams?.includes(regions[0].dataset.stream))return fillContinuousAnchoredCommentary(tokens,regions,shapeLines);let rest=tokens,blankArea=0,totalArea=0;const occupancy=[],filled=[],regionStates=[];for(const region of regions){const beforeCount=rest.length,r=visiblyFitTokens(rest,region,fitTokens(rest,region));region.innerHTML=renderedTokens(r.chunk,region);fitMappedLineWidths(region);rest=r.rest;filled.push({region,continues:rest.length>0});const ratio=region.clientHeight?Math.min(1,r.usedHeight/region.clientHeight):0,area=region.clientWidth*region.clientHeight;occupancy.push(ratio);totalArea+=area;blankArea+=area*(1-ratio);regionStates.push({bandIndex:Number(region.dataset.band),beforeCount,placedCount:r.chunk.length,afterCount:rest.length,usedHeight:r.usedHeight,regionHeight:region.clientHeight,lineHeight:parseFloat(getComputedStyle(region).lineHeight)||1});}if(shapeLines)filled.forEach(({region,continues})=>finishRegionLine(region,continues));return{rest,blankArea,totalArea,occupancy,regionStates};}

function fillContinuousAnchoredCommentary(tokens,regions,shapeLines){
  let rest=tokens,blankArea=0,totalArea=0;const occupancy=[],regionStates=[];
  for(let index=0;index<regions.length;){
    const first=regions[index],group=[first];let end=index+1;
    while(end<regions.length&&!streamFootprintChanges(first,regions[end]))group.push(regions[end++]);
    const height=group.reduce((sum,region)=>sum+region.getBoundingClientRect().height,0),pageScale=$('dafPage').getBoundingClientRect().width/$('dafPage').offsetWidth;
    first.style.height=`${height/pageScale}px`;first.dataset.anchorContinuousGroup='true';if(group.length>1){first.parentElement.style.overflow='visible';first.parentElement.style.gridTemplateRows='minmax(0, 1fr)';first.style.zIndex='2';}
    const beforeCount=rest.length,r=fitTokens(rest,first);first.innerHTML=renderedTokens(r.chunk,first);fitMappedLineWidths(first);rest=r.rest;
    if(shapeLines)finishRegionLine(first,rest.length>0);
    const line=parseFloat(getComputedStyle(first).lineHeight)||1,lines=splitMappedLines(r.chunk);let consumed=0,placedSoFar=0;
    group.forEach((region,offset)=>{
      const ownHeight=region.parentElement.getBoundingClientRect().height/pageScale,through=offset===group.length-1?lines.length:Math.min(lines.length,Math.floor((group.slice(0,offset+1).reduce((sum,item)=>sum+item.parentElement.getBoundingClientRect().height/pageScale,0)+.35)/line));
      const throughTokens=through===lines.length?r.chunk.length:lines.slice(0,through).reduce((sum,row)=>sum+(row?.length||0)+1,0),count=throughTokens-placedSoFar,remaining=beforeCount-throughTokens;
      regionStates.push({bandIndex:Number(region.dataset.band),beforeCount:beforeCount-placedSoFar,placedCount:count,afterCount:remaining,usedHeight:(through-consumed)*line,regionHeight:ownHeight,lineHeight:line});
      const ratio=Math.min(1,(through-consumed)*line/Math.max(1,ownHeight)),area=region.clientWidth*ownHeight;occupancy.push(ratio);totalArea+=area;blankArea+=area*(1-ratio);consumed=through;placedSoFar=throughTokens;
      if(offset){region.replaceChildren();region.dataset.continuityMergedInto=String(first.dataset.band);}else if(group.length>1)region.dataset.continuityMerged='true';
    });
    index=end;
  }
  return{rest,blankArea,totalArea,occupancy,regionStates};
}

function withoutBreaks(html){return html.replace(/<br\s*\/?\s*>/gi," ").replace(/\s+/g," ").trim();}
function rashbamHeadingHtml(){if(state.rashbamHeadingMode==="full")return'<span class="commentary-heading"><strong>פירוש רבינו שמואל<br>תלמיד רש״י ז״ל</strong></span>';if(state.rashbamHeadingMode==="short")return'<span class="commentary-heading"><strong>רשב״ם</strong></span>';return"";}
function innerHtml(){const r=withoutBreaks(state.rashiHtml.trim()),b=withoutBreaks(state.rashbamHtml.trim());if(!b)return r;const heading=rashbamHeadingHtml(),transition=heading?`<span class="rashbam-transition"><br><br>${heading}<br></span>`:"";if(!r)return`${heading}${heading?"<br>":""}${b}`;return`${r}${transition}${b}`;}
function normalizeMappedSourceTokens(tokens,stream){
  // Sefaria dibbur formatting emits the separator as a standalone text node.
  // Attach punctuation to its preceding word before applying the 100a word map.
  if(/^Pesachim\s+100a$/i.test(state.ref)&&stream!=="gemara"){
    const normalized=[];
    for(const token of tokens){
      if(!token.break&&/^[.׃,:;!?]+$/u.test(token.text||"")&&normalized.at(-1)?.text)normalized.at(-1).text+=token.text;
      else normalized.push({...token});
    }
    return normalized;
  }
if(/^Bava\s+Metzia\s+21a$/i.test(state.ref)&&stream==="gemara")return tokens.filter(token=>token.break||!/^[–—-]+$/u.test(token.text||""));return tokens;}
function normalizedAnchorWord(value){return String(value||"").normalize("NFKD").replace(/[\u0591-\u05c7]/g,"").replace(/[^\u05d0-\u05eaA-Za-z0-9]/g,"").toLowerCase();}
function anchorPhraseWords(value){return String(value||"").trim().split(/\s+/u).map(normalizedAnchorWord).filter(Boolean);}
function phraseEndAt(words,phrase,index){if(!phrase.length)return-1;let cursor=index;for(const part of phrase){while(cursor<words.length&&!normalizedAnchorWord(words[cursor]?.text))cursor++;if(cursor>=words.length||normalizedAnchorWord(words[cursor]?.text)!==part)return-1;cursor++;}return cursor-1;}
function phraseMatchesAt(words,phrase,index){return phraseEndAt(words,phrase,index)>=index;}
function phrasePositions(words,phrase,from=0){const hits=[];for(let index=from;index<words.length;index++)if(phraseMatchesAt(words,phrase,index))hits.push(index);return hits;}
function applyStreamLineAnchors(tokens,stream){
  const anchors=(state.agentSettings.lineAnchors||[]).filter(item=>item.stream===stream).sort((a,b)=>a.line-b.line);
  if(!anchors.length||referenceProfile())return tokens;
  const words=tokens.filter(token=>!token.break&&!token.blankLine),boundaries=new Set;let searchFrom=0,complete=true;
  for(const anchor of anchors){
    const startPhrase=anchorPhraseWords(anchor.startText),endPhrase=anchorPhraseWords(anchor.endText),start=phrasePositions(words,startPhrase,searchFrom)[0];
    if(!Number.isInteger(start)){state.agentAnchorFailures.push(`${stream} line ${anchor.line} opening anchor was not found in sequence`);continue;}
    const endStart=phrasePositions(words,endPhrase,start).find(index=>index>=start);
    if(!Number.isInteger(endStart)){state.agentAnchorFailures.push(`${stream} line ${anchor.line} closing anchor was not found after its opening`);continue;}
    let end=phraseEndAt(words,endPhrase,endStart);while(end+1<words.length&&!normalizedAnchorWord(words[end+1].text))end++;complete=complete&&start===searchFrom;if(end<start){state.agentAnchorFailures.push(`${stream} line ${anchor.line} anchor order is invalid`);continue;}searchFrom=end+1;
    if(start>0)boundaries.add(start);if(end<words.length-1)boundaries.add(end+1);
  }
  const target=Number(state.agentSettings.targetLineCounts?.[stream]);
  state.agentLockedStreams[stream]=complete&&searchFrom===words.length&&anchors.length===target&&anchors.every((anchor,index)=>anchor.line===index+1)&&!state.agentAnchorFailures.length;
  const out=[];words.forEach((token,index)=>{if(boundaries.has(index))out.push({break:true,agentAnchor:true});out.push(token);});return out;
}
function anchorLineTokens(tokens,anchor){const lines=splitMappedLines(tokens);return lines[Math.max(0,Number(anchor.line)-1)]||[];}
function measureAnchorLine(tokens,stream,anchor){
  const line=anchorLineTokens(tokens,anchor);if(!line.length)return null;
  const probe=document.createElement("div");probe.className=`flow-region ${stream==="gemara"?"gemara":"commentary"}`;probe.dataset.stream=stream;Object.assign(probe.style,{position:"fixed",visibility:"hidden",left:"-10000px",top:"-10000px",display:"inline-block",width:"max-content",height:"auto",overflow:"visible",whiteSpace:"nowrap",textAlign:"right"});
  probe.innerHTML=tokensHtml(line);document.body.appendChild(probe);const current=probe.getBoundingClientRect().width,nextIndex=tokens.indexOf(line.at(-1))+1,next=tokens.slice(nextIndex).find(token=>token.text);
  let withNext=current;if(next){probe.innerHTML=tokensHtml([...line,next]);withNext=probe.getBoundingClientRect().width;}probe.remove();return Math.max(current,(current+withNext)/2);
}
function calibratePrimaryWidths(tokens){
  const body=$("bodyGeometry"),pageStyle=getComputedStyle($("dafPage")),gutter=parseFloat(pageStyle.getPropertyValue("--daf-side-gutter"))||20,baselineGutter=parseFloat(pageStyle.getPropertyValue("--daf-gutter"))||25,available=Math.max(1,body.clientWidth-2*gutter),baselineAvailable=Math.max(1,body.clientWidth-2*baselineGutter),base={gemara:2.5,inner:1.625,tosafot:1.625},baseTotal=5.75,widths=Object.fromEntries(STREAMS.map(stream=>[stream,baselineAvailable*base[stream]/baseTotal])),anchors=state.agentSettings.lineAnchors||[];
  for(const stream of STREAMS){if(stream!=="gemara"&&state.agentLockedStreams?.[stream])continue;const anchor=anchors.find(item=>item.stream===stream&&item.line===1);if(!anchor)continue;const measured=measureAnchorLine(tokens[stream],stream,anchor);if(measured)widths[stream]=measured;}
  const minimum={gemara:baselineAvailable*2.5/baseTotal,inner:baselineAvailable*1.625/baseTotal,tosafot:baselineAvailable*1.625/baseTotal};
  for(const stream of STREAMS)widths[stream]=Math.max(minimum[stream],widths[stream]);
  const total=STREAMS.reduce((sum,stream)=>sum+widths[stream],0);if(total>available){const scale=available/total;for(const stream of STREAMS)widths[stream]*=scale;}
  else{const unanchored=STREAMS.filter(stream=>(stream!=="gemara"&&state.agentLockedStreams?.[stream])||!anchors.some(item=>item.stream===stream&&item.line===1)),targets=unanchored.length?unanchored:STREAMS;for(const stream of targets)widths[stream]+=(available-total)/targets.length;}
  return widths;
}
function removeGemaraDashes(tokens){return tokens.flatMap(token=>{if(token.break)return[token];const text=String(token.text||"").replace(/[\u2010-\u2015\u2212-]+/gu,"");return text?[{...token,text}]:[];});}
function streamTokens(){const streams={gemara:tokenize(displayHtml(withoutBreaks(state.gemaraHtml))),inner:tokenize(displayHtml(innerHtml())),tosafot:tokenize(displayHtml(withoutBreaks(state.tosafotHtml)))},profile=referenceProfile();state.agentAnchorFailures=[];state.agentLockedStreams={};if(state.agentSettings.stripGemaraDashes)streams.gemara=removeGemaraDashes(streams.gemara);if(profile)for(const stream of STREAMS)streams[stream]=applyExactLineMap(normalizeMappedSourceTokens(streams[stream],stream),profile.maps?.[stream],stream);else for(const stream of STREAMS)streams[stream]=applyStreamLineAnchors(streams[stream],stream);if(state.agentSettings.stripGemaraDashes)streams.gemara=removeGemaraDashes(streams.gemara);return streams;}
function weightsFor(t){return{gemara:t.gemara.length*1.52,inner:t.inner.length,tosafot:t.tosafot.length};}
function ordered(streams){const order=physicalOrder();return[...streams].sort((a,b)=>order.indexOf(a)-order.indexOf(b));}
function widths(streams,w,floor=18){const total=streams.reduce((s,x)=>s+w[x],0)||1;let a=streams.map(x=>Math.max(floor,w[x]/total*100)),sum=a.reduce((x,y)=>x+y,0);return a.map(x=>x/sum*100);}
function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
function primaryWidths(){const order=ordered(STREAMS),map=state.agentPrimaryWidths||{gemara:2.5,inner:1.625,tosafot:1.625};return order.map(stream=>map[stream]);}
function stepped(start,end,step){const values=[];for(let value=start;value<=end;value+=step)values.push(value);return values;}
function releasedPairWidths(previousStreams,previousWidths,nextStreams){
  const bodyWidth=Math.max(1,$("bodyGeometry").clientWidth),gutter=parseFloat(getComputedStyle($("dafPage")).getPropertyValue("--daf-side-gutter"))||20,pairGutter=parseFloat(getComputedStyle($("dafPage")).getPropertyValue("--daf-gutter"))||25,streamGutter=streams=>streams.includes("gemara")?gutter:pairGutter,oldAvailable=Math.max(1,bodyWidth-streamGutter(previousStreams)*Math.max(0,previousStreams.length-1)),nextAvailable=Math.max(1,bodyWidth-streamGutter(nextStreams)*Math.max(0,nextStreams.length-1)),oldTotal=previousWidths.reduce((sum,value)=>sum+value,0)||1,oldPixels=Object.fromEntries(previousStreams.map((stream,index)=>[stream,previousWidths[index]/oldTotal*oldAvailable])),removed=previousStreams.filter(stream=>!nextStreams.includes(stream));
  if(nextStreams.length!==2||removed.length!==1)return nextStreams.map(()=>100/Math.max(1,nextStreams.length));
  const removedIndex=previousStreams.indexOf(removed[0]),pixels={};
  if(removedIndex===0){pixels[nextStreams[1]]=oldPixels[nextStreams[1]];pixels[nextStreams[0]]=nextAvailable-pixels[nextStreams[1]];}
  else if(removedIndex===previousStreams.length-1){pixels[nextStreams[0]]=oldPixels[nextStreams[0]];pixels[nextStreams[1]]=nextAvailable-pixels[nextStreams[0]];}
  else{const released=Math.max(0,nextAvailable-oldPixels[nextStreams[0]]-oldPixels[nextStreams[1]]);pixels[nextStreams[0]]=oldPixels[nextStreams[0]]+released/2;pixels[nextStreams[1]]=oldPixels[nextStreams[1]]+released/2;}
  return nextStreams.map(stream=>Math.max(1,pixels[stream]/nextAvailable*100));
}
function recoveryWidthPatterns(seed){
  if(!seed||seed.pattern?.mapped||!seed.bands?.length)return[];
  const firstBand=seed.bands[0],nextBand=seed.bands[1],firstToFinish=firstBand&&nextBand?firstBand.streams.find(stream=>!nextBand.streams.includes(stream)):null;
  const topMaps=firstToFinish==="inner"?[{gemara:42,inner:35,tosafot:23},{gemara:43,inner:34,tosafot:23},{gemara:45,inner:32,tosafot:23}]:firstToFinish==="tosafot"?[{gemara:42,inner:23,tosafot:35},{gemara:43,inner:23,tosafot:34},{gemara:45,inner:23,tosafot:32}]:[{gemara:49,inner:25.5,tosafot:25.5},{gemara:47,inner:26.5,tosafot:26.5},{gemara:45,inner:27.5,tosafot:27.5}],out=[];
  for(const map of topMaps){
    const bands=[];
    for(const [index,band] of seed.bands.entries()){
      let bandWidths=band.widths;
      if(index===0&&band.streams.length===3)bandWidths=band.streams.map(stream=>map[stream]);
      else if(band.streams.length===2){const previous=bands[index-1];bandWidths=releasedPairWidths(previous.streams,previous.widths,band.streams);}
      else if(band.streams.length===1)bandWidths=[100];
      bands.push({...band,widths:bandWidths});
    }
    out.push({...seed,name:`${seed.name}; protected width recovery ${map.inner}/${map.gemara}/${map.tosafot}`,bands});
  }
  return out;
}
function mappedCascadePattern(profile){
  const gutter=parseFloat(getComputedStyle($("dafPage")).getPropertyValue("--daf-gutter"))||25,gemaraLeading=parseFloat(getComputedStyle($("dafPage")).getPropertyValue("--gemara-leading"))||16.35,commentaryLeading=parseFloat(getComputedStyle($("dafPage")).getPropertyValue("--commentary-leading"))||12.05;
  const boxWalls=profile.layout.boxWalls!==false,stages=profileStages(profile),bands=stages.map((stage,index)=>{const lineHeight=stream=>stream==="gemara"?gemaraLeading:commentaryLeading,extra=stream=>index===0?(profile.layout.extraLineHeights?.[stream]||0):0,wallHeight=index===0&&boxWalls&&stage.streams.includes("gemara")?gutter*2:0,contentHeight=Math.max(...stage.streams.map(stream=>((stage.counts[stream]||0)+extra(stream))*lineHeight(stream)+(stream==="gemara"?wallHeight:0)));return{height:0,...(index<stages.length-1?{pixelHeight:contentHeight}:{}),streams:stage.streams,widths:stage.widths,counts:stage.counts};});
  return{name:"PDF-mapped verified stage layout",cascade:true,mapped:true,boxWalls,bands};
}
function hasExplicitLayoutGuidance(){
  return Boolean(state.agentSettings.forceCascade)||Number.isInteger(Number(state.agentSettings.expansionLine||state.agentSettings.gemaraExpansionLine));
}
function completionEventPatterns(w){
  const three=ordered(STREAMS),top=primaryWidths(w),out=[
    {name:"completion solver: all streams continue",eventDriven:true,completionOrder:[],bands:[{height:100,streams:three,widths:top}]}
  ];
  for(const firstToFinish of STREAMS){
    const pair=ordered(STREAMS.filter(stream=>stream!==firstToFinish)),pairWidth=releasedPairWidths(three,top,pair);
    out.push({name:`completion solver: ${firstToFinish} completes; pair finishes together`,cascade:true,eventDriven:true,completionOrder:[firstToFinish],bands:[
      {height:50,streams:three,widths:top},
      {height:50,streams:pair,widths:pairWidth}
    ]});
    for(const survivor of pair){
      const secondToFinish=pair.find(stream=>stream!==survivor);
      out.push({name:`completion solver: ${firstToFinish}, then ${secondToFinish}; ${survivor} survives`,cascade:true,eventDriven:true,completionOrder:[firstToFinish,secondToFinish,survivor],bands:[
        {height:40,streams:three,widths:top},
        {height:30,streams:pair,widths:pairWidth},
        {height:30,streams:[survivor],widths:[100]}
      ]});
    }
  }
  return out;
}
function auditCompletionEventPatterns(patterns){
  const failures=[],orders=new Set;
  for(const pattern of patterns){
    if(!pattern.eventDriven)continue;
    for(let index=1;index<pattern.bands.length;index++){
      const previous=new Set(pattern.bands[index-1].streams),next=new Set(pattern.bands[index].streams);
      if(next.size>=previous.size||[...next].some(stream=>!previous.has(stream)))failures.push(`${pattern.name}: invalid completion transition`);
    }
    if(pattern.completionOrder?.length===3)orders.add(pattern.completionOrder.join(">"));
  }
  for(const first of STREAMS)for(const second of STREAMS)if(second!==first){
    const third=STREAMS.find(stream=>stream!==first&&stream!==second),key=[first,second,third].join(">");
    if(!orders.has(key))failures.push(`missing completion order ${key}`);
  }
  return failures;
}
function candidates(w,scale=1){
  const three=ordered(STREAMS),top=primaryWidths(w),guided=state.agentSettings.forceCascade&&STREAMS.includes(state.agentSettings.preferredSurvivor);
  if(guided){const completed=STREAMS.includes(state.agentSettings.completedStream)?state.agentSettings.completedStream:"gemara",pair=ordered(STREAMS.filter(stream=>stream!==completed)),survivor=state.agentSettings.preferredSurvivor,lines=state.agentSettings.continuationLines||2,leading=parseFloat(getComputedStyle($("dafPage")).getPropertyValue("--commentary-leading"))||12.05,pairWidth=releasedPairWidths(three,top,pair);if(!pair.includes(survivor))return[];return stepped(28,82,3).map(upper=>({name:`teacher-guided ${completed} completes; ${survivor} takeover (${lines} narrow lines)`,cascade:true,guided:true,bands:[{height:upper,streams:three,widths:top},{height:0,pixelHeight:lines*leading,streams:pair,widths:pairWidth},{height:100-upper,streams:[survivor],widths:[100]}]}));}
  const expansionLine=Number(state.agentSettings.expansionLine||state.agentSettings.gemaraExpansionLine),expansionStream=STREAMS.includes(state.agentSettings.expansionStream)?state.agentSettings.expansionStream:"gemara",expansionInto=STREAMS.includes(state.agentSettings.expansionIntoStream)&&state.agentSettings.expansionIntoStream!==expansionStream?state.agentSettings.expansionIntoStream:null;
  if(Number.isInteger(expansionLine)){
    const pageStyle=getComputedStyle($("dafPage")),type=typographyProfile()?.typography||{},settings=state.agentSettings||{},parts=scaleParts(scale),leading=expansionStream==="gemara"?(type.gemaraLeading||16.35)*(settings.gemaraScale||1)*parts.gemara:(type.commentaryLeading||12.05)*(settings.commentaryScale||1)*parts.commentary,gutter=expansionStream==="gemara"?(parseFloat(pageStyle.getPropertyValue("--daf-gutter"))||25):0,opening=expansionStream==="gemara"?0:Math.round(settings.openingLines||parseFloat(pageStyle.getPropertyValue("--opening-lines"))||4),narrowLines=Math.max(0,expansionLine-1-opening),boundaryHeight=gutter+narrowLines*leading,guidedPatterns=[];
    for(const omitted of expansionInto?[expansionInto]:STREAMS.filter(value=>value!==expansionStream)){
      const pair=ordered(STREAMS.filter(stream=>stream!==omitted)),pairWidth=releasedPairWidths(three,top,pair);
      if(!pair.includes(expansionStream))continue;
      const bands=[{height:0,pixelHeight:boundaryHeight,streams:three,widths:top},{height:100,streams:pair,widths:pairWidth}];
      // A final wide Gemara line releases its column after that line, allowing
      // the surviving commentary to continue across the remaining page width.
      if(expansionStream==="gemara"&&state.agentLockedStreams?.gemara&&Number(settings.targetLineCounts?.gemara)===expansionLine){
        const gutterLines=Number(settings.finalGemaraGutterLines)||0,finalGutter=gutterLines*parseFloat(pageStyle.getPropertyValue("--commentary-leading"));
        bands[0]={...bands[0],commentaryBottomGutter:finalGutter,commentaryGutterStream:omitted};
        bands[1]={...bands[1],height:0,pixelHeight:leading+finalGutter,gemaraGutter:finalGutter};
        const survivor=pair.find(stream=>stream!=="gemara");bands.push({height:100,streams:[survivor],widths:[100]});
      }
      guidedPatterns.push({name:`teacher-guided ${expansionStream} expansion from line ${expansionLine} after ${omitted}`,cascade:true,guided:true,teacherExactExpansion:true,expansionStream,expansionLine,bands});
    }
    return guidedPatterns;
  }
  const patterns=completionEventPatterns(w),topologyFailures=auditCompletionEventPatterns(patterns);
  if(topologyFailures.length)throw new Error(`Completion-event solver topology failed: ${topologyFailures.join(", ")}`);
  return patterns;
}
function buildGeometry(pattern){
  const body=$("bodyGeometry"),regions={gemara:[],inner:[],tosafot:[]},totalHeight=body.clientHeight,leading=parseFloat(getComputedStyle($("topRight")).lineHeight)||12,heights=[];
  let used=0;pattern.bands.forEach((band,i)=>{if(i===pattern.bands.length-1)heights.push(Math.max(0,totalHeight-used));else{const desired=Number.isFinite(band.pixelHeight)?band.pixelHeight:totalHeight*band.height/100,snapped=Number.isFinite(band.pixelHeight)?desired:Math.max(leading,Math.round(desired/leading)*leading);heights.push(snapped);used+=snapped;}});
  if(!pattern.mapped&&state.agentLockedStreams?.inner&&pattern.bands[0].streams.includes('inner')&&!pattern.bands[1]?.streams.includes('inner')){
    const bodyLines=Number(state.agentSettings.targetLineCounts?.inner)-(state.agentSettings.openingLines||4);
    if(bodyLines>0)$('dafPage').style.setProperty('--inner-body-leading',`${(heights[0]-(pattern.bands[0].commentaryBottomGutter||0))/bodyLines}px`);
  }
  const gemaraBox=!pattern.mapped&&pattern.bands.length>1&&pattern.bands[0].streams.includes("gemara")&&!pattern.bands[1].streams.includes("gemara")&&pattern.bands[1].streams.includes("inner")&&pattern.bands[1].streams.includes("tosafot");
  body.innerHTML="";body.classList.toggle("mapped-geometry",Boolean(pattern.mapped));body.classList.toggle("mapped-no-box-walls",Boolean(pattern.mapped&&pattern.boxWalls===false));body.classList.toggle("general-gemara-box",gemaraBox);body.classList.toggle("strict-stream-continuity",Boolean(state.agentSettings.enforceStreamContinuity||state.agentSettings.enforceCommentaryContinuity));
  const addRegion=(row,stream,bandIndex)=>{const r=document.createElement("div"),profile=referenceProfile(),mapped=Boolean(profile?.maps?.[stream]?.lineEndTokens?.length||state.agentLockedStreams?.[stream]);r.className=`flow-region ${stream==="gemara"?"gemara":"commentary"}${mapped?" reference-mapped":""}${state.agentLockedStreams?.[stream]?" anchor-mapped":""}`;r.dataset.stream=stream;r.dataset.band=bandIndex;r.contentEditable=state.mode==="edit"?"true":"false";r.spellcheck=false;r.setAttribute("aria-label",`${stream} editable region`);if(stream==="gemara"&&pattern.bands[bandIndex].gemaraGutter){const gutter=pattern.bands[bandIndex].gemaraGutter;r.style.paddingBottom=`${gutter}px`;r.dataset.finalGemaraGutter=String(gutter);}
    if(stream===pattern.bands[bandIndex].commentaryGutterStream&&pattern.bands[bandIndex].commentaryBottomGutter){r.style.paddingBottom=`${pattern.bands[bandIndex].commentaryBottomGutter}px`;r.dataset.commentaryBottomGutter=String(pattern.bands[bandIndex].commentaryBottomGutter);}
    row.appendChild(r);regions[stream].push(r);};
  pattern.bands.forEach((band,i)=>{const row=document.createElement("div"),isPair=band.streams.length===2&&band.streams.includes("inner")&&band.streams.includes("tosafot");row.className=`geometry-band${isPair?" commentary-pair":""}`;row.style.flex=`0 0 ${heights[i]}px`;row.style.height=`${heights[i]}px`;row.style.gridTemplateColumns=band.widths.map(x=>`${x}fr`).join(" ");band.streams.forEach(stream=>addRegion(row,stream,i));body.appendChild(row);});return regions;
}
function setMappedLines(region,lines){region.innerHTML=mappedLinesHtml(lines);fitMappedLineWidths(region);}
function composeMappedExact(tokens,profile){
  setScale(1);
  const pattern=mappedCascadePattern(profile),regions=buildGeometry(pattern),lines=Object.fromEntries(STREAMS.map(stream=>[stream,markMappedCommentEnds(splitMappedLines(tokens[stream]),stream)]));
  const {openingLines}=profile.layout,noticeLines=profile.notice?.lines||0,stages=profileStages(profile);
  const right=physicalOrder()[2],left=physicalOrder()[0];
  const cursors={gemara:0,inner:0,tosafot:0},regionIndex={gemara:0,inner:0,tosafot:0};
  for(const [element,stream] of [[$("topRight"),right],[$("topLeft"),left]]){element.dataset.stream=stream;element.classList.add("reference-mapped");const sourceCount=profileOpeningSourceLines(profile,stream),opening=lines[stream].slice(0,sourceCount);setMappedLines(element,opening);cursors[stream]=sourceCount;if(stream===profile.notice?.stream&&noticeLines){const notice=document.createElement("span");notice.className="mapped-line tosafot-notice";notice.contentEditable="false";notice.setAttribute("aria-label","Fixed decorative Tosafos notice");notice.textContent=profile.notice.text;element.prepend(notice);fitMappedLineWidths(element);}element.contentEditable=state.mode==="edit"?"true":"false";element.spellcheck=false;}
  for(const stage of stages)for(const stream of stage.streams){const count=stage.counts[stream]||0,region=regions[stream][regionIndex[stream]++];setMappedLines(region,lines[stream].slice(cursors[stream],cursors[stream]+count));cursors[stream]+=count;}
  for(const stream of STREAMS)if(cursors[stream]!==lines[stream].length)throw new Error(`Mapped line allocation mismatch for ${stream}: placed ${cursors[stream]}, received ${lines[stream].length}`);
  return{score:0,overflow:0,sourceOverflow:0,blankRatio:0,minOccupancy:1,transitionGap:0,scale:1,pattern};
}
function flowOpening(tokens,shapeLines=false){const right=physicalOrder()[2],left=physicalOrder()[0],rightEl=$("topRight"),leftEl=$("topLeft"),profile=referenceProfile(),openingLines=Math.round(parseFloat(getComputedStyle($("dafPage")).getPropertyValue("--opening-lines"))||4);for(const[el,stream]of[[rightEl,right],[leftEl,left]]){el.dataset.stream=stream;el.classList.toggle("reference-mapped",Boolean(profile?.maps?.[stream]?.lineEndTokens?.length||state.agentLockedStreams?.[stream]));el.classList.toggle("anchor-mapped",Boolean(state.agentLockedStreams?.[stream]));}const rr=fitOpeningTokens(tokens[right],rightEl,openingLines),lr=fitOpeningTokens(tokens[left],leftEl,openingLines);rightEl.innerHTML=renderedTokens(rr.chunk,rightEl);leftEl.innerHTML=renderedTokens(lr.chunk,leftEl);fitMappedLineWidths(rightEl);fitMappedLineWidths(leftEl);if(shapeLines){finishRegionLine(rightEl,rr.rest.length>0);finishRegionLine(leftEl,lr.rest.length>0);}rightEl.contentEditable=state.mode==="edit"?"true":"false";leftEl.contentEditable=state.mode==="edit"?"true":"false";rightEl.spellcheck=false;leftEl.spellcheck=false;return{...tokens,[right]:rr.rest,[left]:lr.rest};}
function lastStateForBand(result,bandIndex){return[...(result?.regionStates||[])].reverse().find(item=>item.bandIndex===bandIndex)||null;}
function completionAudit(pattern,results){const failures=[];let maxCompletionSlack=0;for(let index=0;index<pattern.bands.length-1;index++){const current=new Set(pattern.bands[index].streams),next=new Set(pattern.bands[index+1].streams);for(const stream of next)if(!current.has(stream))failures.push(`${stream} reappears after completion`);for(const stream of current){const stateAtBoundary=lastStateForBand(results[stream],index);if(!stateAtBoundary){failures.push(`${stream} missing completion measurement`);continue;}const removed=!next.has(stream),hasRemaining=stateAtBoundary.afterCount>0;if(removed&&hasRemaining)failures.push(`${stream} removed before source completion`);if(!removed&&!hasRemaining)failures.push(`${stream} continues after source completion`);if(removed&&!hasRemaining){const slack=Math.max(0,stateAtBoundary.regionHeight-stateAtBoundary.usedHeight),limit=Math.max(2,stateAtBoundary.lineHeight*1.15);maxCompletionSlack=Math.max(maxCompletionSlack,slack);if(slack>limit)failures.push(`${stream} transition delayed by more than one line`);}}}const finalBand=pattern.bands.length-1,finalStates=pattern.bands[finalBand].streams.map(stream=>({stream,state:lastStateForBand(results[stream],finalBand)})).filter(item=>item.state);if(finalStates.length>1){const latest=Math.max(...finalStates.map(item=>item.state.usedHeight));for(const{stream,state}of finalStates){const slack=Math.max(0,latest-state.usedHeight),limit=Math.max(2,state.lineHeight*1.15);maxCompletionSlack=Math.max(maxCompletionSlack,slack);if(slack>limit)failures.push(`${stream} ends early without space reclamation`);}}for(const stream of STREAMS)if(results[stream].rest.length)failures.push(`${stream} source not fully placed`);return{failures:[...new Set(failures)],maxCompletionSlack};}
function compositionRegions(stream){return[...$("bodyGeometry").querySelectorAll(`.geometry-band > .flow-region[data-stream="${stream}"]:not(.transition-continuity-bridge)`)];}
function streamFootprintChanges(previous,next){const a=previous.getBoundingClientRect(),b=next.getBoundingClientRect();return Math.abs(a.width-b.width)>1||Math.abs(a.left-b.left)>1;}
function stitchStreamContinuity(final,original){
  if(final.pattern.mapped)return;
  for(const stream of STREAMS){
    if(state.agentLockedStreams?.[stream]&&state.agentSettings.continuousCommentaryStreams?.includes(stream))continue;
    const regions=compositionRegions(stream),states=final.results?.[stream]?.regionStates||[];
    for(let index=0;index<Math.min(regions.length-1,states.length-1);index++){
      if(final.pattern.teacherExactExpansion&&final.pattern.expansionStream===stream&&index===0)continue;
      const stateAtBoundary=states[index];
      if(!stateAtBoundary||stateAtBoundary.afterCount<=0)continue;
      const slack=Math.max(0,stateAtBoundary.regionHeight-stateAtBoundary.usedHeight),line=Math.max(1,stateAtBoundary.lineHeight);
      if(slack<=line*.12)continue;
      const previous=regions[index],next=regions[index+1],row=next.parentElement,footprintChanges=streamFootprintChanges(previous,next);
      if(footprintChanges){
        const requestedLines=Math.max(1,Math.ceil(slack/line)),start=(original[stream]?.length||0)-states[0].beforeCount+states.slice(0,index+1).reduce((sum,item)=>sum+item.placedCount,0),nextCount=states[index+1].placedCount,nextChunk=(original[stream]||[]).slice(start,start+nextCount),bridgeFit=fitOpeningTokens(nextChunk,previous,requestedLines),bridgeChunk=bridgeFit.chunk;
        if(!bridgeChunk.length)continue;
        const bridge=document.createElement("div"),previousRow=previous.parentElement,rowRect=previousRow.getBoundingClientRect(),previousRect=previous.getBoundingClientRect(),rowScale=rowRect.width/Math.max(1,previousRow.offsetWidth),bridgeLeft=(previousRect.left-rowRect.left)/Math.max(.01,rowScale);
        bridge.className=`flow-region ${stream==="gemara"?"gemara":"commentary"} transition-continuity-bridge`;
        bridge.dataset.stream=stream;bridge.dataset.continuityStream=stream;bridge.dataset.continuityBridge=stream;bridge.dataset.band=previous.dataset.band;
        bridge.innerHTML=renderedTokens(bridgeChunk,previous);
        Object.assign(bridge.style,{gridColumn:"1 / -1",gridRow:"1",left:`${bridgeLeft}px`,top:`${stateAtBoundary.usedHeight}px`,width:`${previous.offsetWidth}px`,height:`${requestedLines*line}px`,padding:"0"});
        previousRow.style.position="relative";previousRow.style.overflow="visible";previousRow.appendChild(bridge);
        const actualLines=Math.max(1,visualLineCount(bridge)),bridgeHeight=actualLines*line,delta=Math.max(0,bridgeHeight-slack);bridge.style.height=`${bridgeHeight}px`;finishRegionLine(bridge,bridgeChunk.length<nextChunk.length||states[index+1].afterCount>0);
        next.innerHTML=renderedTokens(nextChunk.slice(bridgeChunk.length),next);finishRegionLine(next,states[index+1].afterCount>0);
        next.style.position="relative";next.style.top=`${delta}px`;next.style.height=`calc(100% - ${delta}px)`;next.dataset.delayedWidening=String(delta);next.dataset.continuityBridgeTokens=String(bridgeChunk.length);
        if(row)row.style.overflow="visible";
      }else{
        const previousRow=previous.parentElement,nextHeight=next.offsetHeight,nextContinues=states[index+1].afterCount>0;
        previous.append(document.createTextNode(" "),...[...next.childNodes]);
        previous.classList.remove("line-end-justify","line-end-center");
        previous.style.position="relative";previous.style.height=`calc(100% + ${nextHeight}px)`;previous.style.zIndex="2";
        previous.dataset.continuityMerged="true";next.replaceChildren();next.dataset.continuityMergedInto=String(previous.dataset.band);
        finishRegionLine(previous,nextContinues);
        if(previousRow)previousRow.style.overflow="visible";if(row)row.style.overflow="visible";
      }
    }
  }
  validateStreamContinuity(final,final.completionFailures);
  validateNoActiveRegionTakeover(final,final.completionFailures);
  const exactFailure=exactExpansionFailure(final.pattern);if(exactFailure)final.completionFailures.push(exactFailure);
}
function validateNoActiveRegionTakeover(final,failures){
  if(final.pattern.mapped)return;
  for(let index=0;index<final.pattern.bands.length-1;index++){
    const current=final.pattern.bands[index],next=final.pattern.bands[index+1],survivors=current.streams.filter(stream=>next.streams.includes(stream));
    for(const stream of survivors){
      const nextRegion=$("bodyGeometry").querySelector(`.geometry-band:nth-child(${index+2}) > .flow-region[data-stream="${stream}"]:not(.transition-continuity-bridge)`),nextRect=nextRegion?.getBoundingClientRect();
      if(!nextRect)continue;
      for(const other of survivors.filter(value=>value!==stream)){
        const oldOther=$("bodyGeometry").querySelector(`.geometry-band:nth-child(${index+1}) > .flow-region[data-stream="${other}"]:not(.transition-continuity-bridge)`),oldRect=oldOther?.getBoundingClientRect();
        if(oldRect&&Math.min(nextRect.right,oldRect.right)-Math.max(nextRect.left,oldRect.left)>1.5)failures.push(`${stream} enters active ${other} region`);
      }
    }
  }
}
function validateStreamContinuity(final,failures){
  if(final.pattern.mapped)return;
  for(const stream of STREAMS){
    if(state.agentLockedStreams?.[stream]&&state.agentSettings.continuousCommentaryStreams?.includes(stream))continue;
    const regions=compositionRegions(stream),states=final.results?.[stream]?.regionStates||[];
    for(let index=0;index<Math.min(regions.length-1,states.length-1);index++){
      const stateAtBoundary=states[index];
      if(!stateAtBoundary||stateAtBoundary.afterCount<=0)continue;
      const slack=Math.max(0,stateAtBoundary.regionHeight-stateAtBoundary.usedHeight),line=Math.max(1,stateAtBoundary.lineHeight);
      if(slack<=line*.12)continue;
      const previous=regions[index],next=regions[index+1],footprintChanges=streamFootprintChanges(previous,next);
      if(footprintChanges){
        const bridge=previous.parentElement.querySelector(`[data-continuity-bridge="${stream}"]`),previousRect=previous.getBoundingClientRect(),bridgeRect=bridge?.getBoundingClientRect(),nextRect=next.getBoundingClientRect();
        if(!bridge||next.dataset.continuityLift||!bridgeRect||Math.abs(bridgeRect.left-previousRect.left)>1||Math.abs(bridgeRect.width-previousRect.width)>1||nextRect.top<bridgeRect.bottom-1)failures.push(`${stream} widens before neighboring stream completes`);
      }else if(previous.dataset.continuityMerged!=="true"||next.dataset.continuityMergedInto!==String(previous.dataset.band)||next.textContent.trim())failures.push(`${stream} stream continuity gap`);
    }
  }
  validateRenderedStreamLeading(final,failures);
  validateRenderedGemaraLines(failures);
}
function renderedRows(region){
  const line=parseFloat(getComputedStyle(region).lineHeight)||1,rects=[...region.querySelectorAll(".layout-token,.word-token")].filter(token=>token.textContent.trim()).map(token=>token.getBoundingClientRect()).sort((a,b)=>a.top-b.top),rows=[];
  for(const rect of rects){const center=rect.top+rect.height/2,last=rows.at(-1);if(!last||center-last.center>line*.55)rows.push({top:rect.top,bottom:rect.bottom,center});else{last.top=Math.min(last.top,rect.top);last.bottom=Math.max(last.bottom,rect.bottom);}}
  return rows;
}
function renderedCommentaryLineMap(){
  const maps={};
  for(const stream of STREAMS.filter(stream=>stream!=="gemara")){
    const lines=[];
    for(const region of streamRegions(stream)){
      const leading=parseFloat(getComputedStyle(region).lineHeight)||1,rows=[];
      for(const token of region.querySelectorAll(".layout-token")){
        if(!token.textContent.trim())continue;
        const box=token.getBoundingClientRect(),center=box.top+box.height/2,last=rows.at(-1);
        if(!last||Math.abs(center-last.center)>leading*.55)rows.push({center,words:[token.textContent]});
        else last.words.push(token.textContent);
      }
      lines.push(...rows.map(row=>row.words.join(" ").replace(/\s+/g," ").trim()));
    }
    maps[stream]=lines;
  }
  return maps;
}
function renderedClippedStreams(){
  const clipped=new Set();
  for(const stream of STREAMS)for(const region of streamRegions(stream)){
    if(!region.textContent.trim()||region.classList?.contains("top-commentary"))continue;
    const box=region.getBoundingClientRect(),rows=renderedRows(region);
    if(region.scrollHeight>region.clientHeight+1||rows.some(row=>row.bottom>box.bottom+2))clipped.add(stream);
  }
  return [...clipped];
}
function validateRenderedGemaraLines(failures){
  const regions=compositionRegions("gemara"),rows=[];
  for(const region of regions){const box=region.getBoundingClientRect(),line=parseFloat(getComputedStyle(region).lineHeight)||1;for(const row of renderedRows(region)){if(row.top<box.top-2||row.bottom>box.bottom+2)failures.push("gemara rendered line is clipped");rows.push({...row,line});}}
  rows.sort((a,b)=>a.top-b.top);
  if(rows.some((row,index)=>index&&row.top-rows[index-1].top<Math.min(row.line,rows[index-1].line)*.55))failures.push("gemara rendered lines overlap at transition");
}
function renderedStreamTextRows(stream){
  const rows=[];
  for(const region of streamRegions(stream)){
    const mapped=[...region.querySelectorAll(":scope > .mapped-line:not(.mapped-blank-line)")];
    if(mapped.length){for(const line of mapped){const rect=line.getBoundingClientRect();rows.push({top:rect.top,baseline:rect.bottom,words:String(line.textContent||"").trim().split(/\s+/u).filter(Boolean)});}continue;}
    const local=[];
    for(const token of region.querySelectorAll(".layout-token,.word-token")){
      if(!token.textContent.trim())continue;
      const rect=token.getBoundingClientRect(),baseline=rect.bottom;
      let row=local.find(item=>Math.abs(item.baseline-baseline)<=2.5);
      if(!row){row={top:rect.top,baseline,words:[]};local.push(row);}
      row.top=Math.min(row.top,rect.top);row.words.push(token.textContent.trim());
    }
    rows.push(...local);
  }
  return rows.sort((a,b)=>a.top-b.top);
}
function currentRenderedLineCounts(){return Object.fromEntries(STREAMS.map(stream=>[stream,renderedStreamTextRows(stream).length]));}
function targetLineCountFailures(result){
  const targets=state.agentSettings.targetLineCounts||{},counts=result?.renderedLineCounts||currentRenderedLineCounts(),failures=[];
  for(const stream of STREAMS){const target=Number(targets[stream]);if(Number.isInteger(target)&&counts[stream]!==target)failures.push(`${stream} has ${counts[stream]} rendered lines, not ${target}`);}
  return failures;
}
function validateAgentLineAnchors(){
  const failures=[];
  for(const anchor of state.agentSettings.lineAnchors||[]){
    const row=renderedStreamTextRows(anchor.stream)[Number(anchor.line)-1],words=row?.words.map(normalizedAnchorWord).filter(Boolean)||[],start=anchorPhraseWords(anchor.startText),end=anchorPhraseWords(anchor.endText);
    if(!row)failures.push(`${anchor.stream} line ${anchor.line} is not rendered`);
    else if(!start.every((word,index)=>words[index]===word))failures.push(`${anchor.stream} line ${anchor.line} does not begin with the requested words`);
    else if(!end.every((word,index)=>words[words.length-end.length+index]===word))failures.push(`${anchor.stream} line ${anchor.line} does not end with the requested words`);
  }
  return failures;
}
function validateRenderedStreamLeading(final,failures){
  if(final.pattern.mapped)return;
  const page=$("dafPage"),pageRect=page.getBoundingClientRect(),pageScale=pageRect.width/Math.max(1,page.offsetWidth);
  for(const stream of state.agentSettings.continuousCommentaryStreams||[]){
    if(!state.agentLockedStreams?.[stream])continue;
    const lines=streamRegions(stream).flatMap(region=>[...region.querySelectorAll(':scope > .mapped-line')]),leading=parseFloat(getComputedStyle(lines[0]?.parentElement||page).lineHeight)*pageScale;
    for(let index=1;index<lines.length;index++){
      const previous=lines[index-1].getBoundingClientRect(),next=lines[index].getBoundingClientRect();
      if(Math.abs(next.top-previous.top-leading)>1)failures.push(`${stream} printed line interval changed`);
      if(next.width>previous.width+1){
        for(const other of STREAMS.filter(value=>value!==stream))for(const region of streamRegions(other))for(const row of renderedRows(region))if(row.bottom>next.top+2&&region.getBoundingClientRect().top<next.top&&Math.min(next.right,region.getBoundingClientRect().right)-Math.max(next.left,region.getBoundingClientRect().left)>1)failures.push(`${stream} widens before ${other} printed text ends`);
      }
    }
  }

  for(const stream of STREAMS){
    const regions=streamRegions(stream).filter(region=>region.querySelector(".layout-token"));
    for(let index=0;index<regions.length-1;index++){
      const previous=regions[index],next=regions[index+1],previousTokens=previous.querySelectorAll(".layout-token"),nextToken=next.querySelector(".layout-token");
      if(!previousTokens.length||!nextToken)continue;
      const lastToken=previousTokens[previousTokens.length-1],gap=nextToken.getBoundingClientRect().top-lastToken.getBoundingClientRect().top,line=(Number.parseFloat(getComputedStyle(previous).lineHeight)||1)*pageScale;
      const requestedGutter=Number.parseFloat(getComputedStyle(next).paddingTop||0)*pageScale;
      if(gap>line*1.55+requestedGutter+1)failures.push(`${stream} rendered text is separated from the rest of its stream`);
    }
  }
}
function evaluate(pattern,scale,original,commit=false){setScale(scale);const remaining=flowOpening(original,true),regions=buildGeometry(pattern),results={};for(const s of STREAMS)results[s]=fillStream(remaining[s],regions[s],true);const sourceOverflow=STREAMS.reduce((n,s)=>n+results[s].rest.length,0),count=STREAMS.reduce((n,s)=>n+original[s].length,0)||1,blank=STREAMS.reduce((n,s)=>n+results[s].blankArea,0),area=STREAMS.reduce((n,s)=>n+results[s].totalArea,0)||1,blankRatio=blank/area,occupancies=STREAMS.flatMap(s=>results[s].occupancy),minOccupancy=Math.min(...occupancies),transitionOccupancies=[];for(const stream of STREAMS){const streamRegions=regions[stream],streamOccupancy=results[stream].occupancy;streamOccupancy.forEach((ratio,index)=>{const bandIndex=Number(streamRegions[index].dataset.band),continues=index<streamOccupancy.length-1,releasesEarly=index===streamOccupancy.length-1&&bandIndex<pattern.bands.length-1;if(continues||releasesEarly)transitionOccupancies.push(ratio);});}const transitionGap=transitionOccupancies.length?Math.max(...transitionOccupancies.map(r=>1-r)):0,transitionStates=STREAMS.flatMap(stream=>results[stream].regionStates.filter((item,index)=>index<results[stream].regionStates.length-1||item.bandIndex<pattern.bands.length-1)),transitionGapLines=transitionStates.length?Math.max(...transitionStates.map(item=>Math.max(0,item.regionHeight-item.usedHeight)/Math.max(1,item.lineHeight))):0,completion=completionAudit(pattern,results),gapPenalty=transitionStates.reduce((n,item)=>n+Math.pow(Math.max(0,Math.max(0,item.regionHeight-item.usedHeight)/Math.max(1,item.lineHeight)-1),2),0),terminalDeadSpace=Math.pow(Math.max(0,.9-minOccupancy),2),s=scaleParts(scale),scalePenalty=Math.abs(s.gemara-1)+Math.abs(s.gemaraSize-1)+Math.abs(s.commentary-1)+Math.abs(s.gemaraTracking)*.12,completionPenalty=completion.failures.length*1000+completion.maxCompletionSlack*.5,score=sourceOverflow/count*32+blankRatio*10+terminalDeadSpace*110+gapPenalty*120+(pattern.bands.length-1)*.004+scalePenalty*.035+completionPenalty;const result={score,overflow:sourceOverflow,sourceOverflow,blankRatio,minOccupancy,transitionGap,transitionGapLines,completionFailures:completion.failures,maxCompletionSlack:completion.maxCompletionSlack,results,scale,pattern};stitchStreamContinuity(result,original);result.commentaryLineMap=renderedCommentaryLineMap();result.clippedStreams=renderedClippedStreams();result.completionFailures.push(...result.clippedStreams.map(stream=>`${stream} rendered text is clipped`));return result;}
function refinePatterns(pattern){if(pattern.bands.length<2)return[pattern];const refined=[];for(let firstDelta=-5;firstDelta<=5;firstDelta+=pattern.bands.length===2?1:2){if(pattern.bands.length===2){const first=pattern.bands[0].height+firstDelta;if(first>10&&first<90)refined.push({...pattern,bands:[{...pattern.bands[0],height:first},{...pattern.bands[1],height:100-first}]});continue;}for(let secondDelta=-5;secondDelta<=5;secondDelta+=2){const first=pattern.bands[0].height+firstDelta,second=pattern.bands[1].height+secondDelta,third=100-first-second;if(first>10&&second>8&&third>5)refined.push({...pattern,bands:[{...pattern.bands[0],height:first},{...pattern.bands[1],height:second},{...pattern.bands[2],height:third}]});}}return refined;}
function fullStreamHeight(tokens,region){const probe=makeProbe(region);probe.innerHTML=renderedTokens(tokens,region);const height=probe.getBoundingClientRect().height;probe.remove();return height;}
function alignedCompletionPattern(pattern,scale,original){
  if(pattern.bands.length===1)return pattern;
  if(pattern.bands.length<2||pattern.bands.length>3)return null;
  setScale(scale);
  const remaining=flowOpening(original),regions=buildGeometry(pattern),first=pattern.bands[0].streams.find(stream=>!pattern.bands[1].streams.includes(stream));
  if(!first)return null;
  const leading=parseFloat(getComputedStyle($("topRight")).lineHeight)||12,bodyHeight=$("bodyGeometry").clientHeight,snap=height=>Math.ceil((height+.5)/leading)*leading;
  const firstHeight=snap(fullStreamHeight(remaining[first],regions[first][0])),firstBoundary=firstHeight;
  if(firstBoundary>bodyHeight-leading)return null;
  const firstAligned={...pattern,bands:[{...pattern.bands[0],pixelHeight:firstBoundary},...pattern.bands.slice(1)]};
  if(pattern.bands.length===2)return firstAligned;
  const second=pattern.bands[1].streams.find(stream=>!pattern.bands[2].streams.includes(stream));
  if(!second)return null;
  const measured=evaluate(firstAligned,scale,original),firstPlaced=measured.results[second].regionStates.find(item=>item.bandIndex===0)?.placedCount||0;
  const secondRegion=$("bodyGeometry").querySelector(`[data-stream="${second}"][data-band="1"]`);
  if(!secondRegion)return null;
  const secondHeight=snap(fullStreamHeight(remaining[second].slice(firstPlaced),secondRegion));
  if(firstBoundary+secondHeight>bodyHeight-leading)return null;
  return{...pattern,bands:[{...pattern.bands[0],pixelHeight:firstBoundary},{...pattern.bands[1],pixelHeight:secondHeight},pattern.bands[2]]};
}
function fillPasses(result){
  if(result.minOccupancy>.78)return result.blankRatio<.075;
  const finalBand=result.pattern.bands.length-1,low=[];
  for(const stream of STREAMS)(result.results?.[stream]?.occupancy||[]).forEach((ratio,index)=>{if(ratio<=.78)low.push({ratio,state:result.results[stream].regionStates[index]});});
  return result.blankRatio<.10&&low.length>0&&low.every(item=>item.state?.bandIndex===finalBand)&&Math.max(...low.map(item=>item.state.regionHeight))/Math.max(1,$("bodyGeometry").clientHeight)<=.16&&result.minOccupancy>.42;
}
function exactExpansionFailure(pattern){if(!pattern.teacherExactExpansion||!STREAMS.includes(pattern.expansionStream))return null;const opening=pattern.expansionStream==="gemara"?0:Math.round(parseFloat(getComputedStyle($("dafPage")).getPropertyValue("--opening-lines"))||4),regions=compositionRegions(pattern.expansionStream),first=regions[0],actual=opening+(first?visualLineCount(first):0),expected=Math.max(0,Number(pattern.expansionLine)-1);if(actual!==expected)return`${pattern.expansionStream} width transition is after line ${actual}, not line ${pattern.expansionLine}`;const next=regions[1],lastNarrow=first?renderedRows(first).at(-1):null,firstWide=next?renderedRows(next)[0]:null,line=first?parseFloat(getComputedStyle(first).lineHeight)||1:1;if(!firstWide)return`${pattern.expansionStream} line ${pattern.expansionLine} is not visibly rendered`;if(lastNarrow&&firstWide.top-lastNarrow.top<line*.55)return`${pattern.expansionStream} line ${pattern.expansionLine} overlaps the preceding line`;return null;}
function candidatePasses(result){result.renderedLineCounts=currentRenderedLineCounts();result.lineCountFailures=targetLineCountFailures(result);result.anchorFailures=validateAgentLineAnchors();return !result.anchorFailures.length&&!validateAnchoredLineGeometry().length&&result.overflow===0&&!result.completionFailures.length&&!result.lineCountFailures.length&&!exactExpansionFailure(result.pattern)&&result.transitionGapLines<=1.15&&fillPasses(result)&&geometryTilesPage();}
function geometryTilesPage(){const body=$("bodyGeometry"),bands=[...body.querySelectorAll(":scope > .geometry-band")];return Math.abs(bands.reduce((sum,band)=>sum+band.clientHeight,0)-body.clientHeight)<=1;}
async function calibratedAnchorScale(tokens){
  const settings=state.agentSettings,count=Number(settings.targetLineCounts?.gemara);
  if(!state.agentLockedStreams?.gemara||Number(settings.expansionLine)!==count||settings.expansionStream!=="gemara")return null;
  const scale={gemara:1,gemaraSize:1,commentary:1,gemaraTracking:0,innerFontFactor:1,tosafotFontFactor:1};
  setScale(scale);
  const pageStyle=getComputedStyle($("dafPage")),leading=parseFloat(pageStyle.getPropertyValue("--gemara-leading")),commentaryLeading=parseFloat(pageStyle.getPropertyValue("--commentary-leading")),gutter=parseFloat(pageStyle.getPropertyValue("--daf-gutter"))||25;
  const continuous=(settings.continuousCommentaryStreams||[]).find(stream=>state.agentLockedStreams?.[stream]),printedCount=Number(settings.targetLineCounts?.[continuous]);
  if(continuous&&printedCount){scale.commentary=($("bodyGeometry").clientHeight+(settings.openingLines||4)*commentaryLeading)/(printedCount*commentaryLeading);setScale(scale);}
  const actualCommentaryLeading=parseFloat(getComputedStyle($("dafPage")).getPropertyValue("--commentary-leading"));
  scale.gemara=($("bodyGeometry").clientHeight-gutter-(2+(Number(settings.finalGemaraGutterLines)||0))*actualCommentaryLeading-(continuous?0:1))/(count*leading);
  if(scale.gemara<.78||scale.gemara>1.18)return null;
  const omitted=settings.expansionIntoStream,survivor=STREAMS.find(stream=>stream!=="gemara"&&stream!==omitted);
  if(!STREAMS.includes(omitted)||!survivor)return null;
  for(let pass=0;pass<5;pass++){
    for(const stream of [omitted,survivor]){
      let lo=.7,hi=1.6;
      for(let attempt=0;attempt<12;attempt++){
        const value=(lo+hi)/2;scale[stream==="inner"?"innerFontFactor":"tosafotFontFactor"]=value;
        const pattern=candidates(weightsFor(tokens),scale)[0],result=evaluate(pattern,scale,tokens);
        if(result.results[stream].rest.length===0&&!result.clippedStreams.includes(stream)&&!validateAnchoredLineGeometry().some(failure=>failure.startsWith(stream+" ")))lo=value;else hi=value;
        if(attempt%2===1){status(`Calibrating ${stream==="inner"?"Rashi":"Tosafos"} against the anchored Gemara boundary…`);await nextPaint();}
      }
      scale[stream==="inner"?"innerFontFactor":"tosafotFontFactor"]=lo;
    }
    const result=evaluate(candidates(weightsFor(tokens),scale)[0],scale,tokens),boundary=lastStateForBand(result.results[omitted],0);
    const slack=boundary.regionHeight-boundary.usedHeight;
    if(slack<=boundary.lineHeight*1.15||continuous)break;
    // Discrete word wraps can leave a gap even at the largest font that fits.
    // Move the anchored boundary toward measured completion, then refit both
    // commentaries; never waive the one-line transition rule.
    const next=scale.gemara-(slack-boundary.lineHeight*.5)/((count-1)*leading);
    if(next<.78)break;
    scale.gemara=next;
  }
  return scale;
}
function validateAnchoredLineGeometry(){
  const failures=[];
  for(const region of $("dafPage").querySelectorAll(".anchor-mapped"))for(const line of region.querySelectorAll(":scope > .mapped-line")){
    const required=Number(line.dataset.requiredScale||1),scale=Number(line.dataset.widthScale||1);
    if(required<.86||line.scrollWidth*scale>line.clientWidth+1)failures.push(`${region.dataset.stream} anchored line is too wide`);
  }
  return [...new Set(failures)];
}
function sourceRank(result){return [result.results.gemara.rest.length,result.sourceOverflow,result.score];}
function betterSourceCandidate(candidate,current){if(!current)return true;const next=sourceRank(candidate),old=sourceRank(current);for(let i=0;i<next.length;i++){if(next[i]<old[i])return true;if(next[i]>old[i])return false;}return false;}
function nextPaint(){return new Promise(resolve=>requestAnimationFrame(resolve));}
function setComposing(active){$("dafPage").classList.toggle("composing",active);$("dafPage").setAttribute("aria-busy",String(active));$("loadDaf").disabled=active;if($("loadSelectedPage"))$("loadSelectedPage").disabled=active;$("reflowEdits").disabled=active;$("typographyPreset").disabled=active;$("nekudosToggle").disabled=active;$("punctuationToggle").disabled=active;}
function contentLines(element){const mapped=[...element.children].filter(child=>child.classList.contains("mapped-line"));if(mapped.length)return mapped.length;return visualLineCount(element);}
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
  for(const line of $("dafPage").querySelectorAll(".mapped-line")){const scale=Number(line.dataset.widthScale||1),required=Number(line.dataset.requiredScale||1);if(line.scrollWidth*scale>line.clientWidth+1)failures.push("mapped line clipping");if(required<.86)failures.push("excessive mapped-line compression");}
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
function validateComposition(final){const failures=[...renderedClippedStreams().map(stream=>`${stream} rendered text is clipped`),...(final.completionFailures||[]),...(state.agentAnchorFailures||[])],profile=referenceProfile(),openingLines=state.agentSettings.openingLines||profile?.layout?.openingLines||4,expectedRight=physicalOrder()[2],expectedLeft=physicalOrder()[0];if($("topRight").dataset.stream!==expectedRight||$("topLeft").dataset.stream!==expectedLeft)failures.push("amud sides");if(contentLines($("topRight"))!==openingLines||contentLines($("topLeft"))!==openingLines)failures.push(`${openingLines}-line opening`);const openingBottom=document.querySelector(".opening-band").getBoundingClientRect().bottom,bodyTop=$("bodyGeometry").getBoundingClientRect().top;if(Math.abs(openingBottom-bodyTop)>.5)failures.push("opening commentary continuity");if(!final.pattern.mapped){const firstCommentaries=[...$("bodyGeometry").querySelectorAll('.geometry-band:first-child > [data-stream="inner"],.geometry-band:first-child > [data-stream="tosafot"]')];if(firstCommentaries.some(region=>Math.abs(region.getBoundingClientRect().top-bodyTop)>.5||parseFloat(getComputedStyle(region).paddingTop)>.5||parseFloat(getComputedStyle(region).marginTop)>.5))failures.push("opening commentary baseline gap");}const first=final.pattern.bands[0],raw=Object.fromEntries(first.streams.map((stream,i)=>[stream,first.widths[i]])),widthTotal=Object.values(raw).reduce((sum,value)=>sum+value,0)||1,allocation=Object.fromEntries(Object.entries(raw).map(([stream,value])=>[stream,value/widthTotal*100]));if(allocation.gemara<42||allocation.gemara>49||allocation.inner<23||allocation.tosafot<23)failures.push("primary widths");validateRashbamHeading(failures);const commentaryPairs=final.pattern.bands.filter(b=>b.streams.length===2&&b.streams.includes("inner")&&b.streams.includes("tosafot"));if(commentaryPairs.some(b=>Math.abs(b.widths[0]-b.widths[1])>.01))failures.push("centered commentary gutter");const contentCenter=$("bodyGeometry").getBoundingClientRect().left+$("bodyGeometry").clientWidth/2,pairRows=[$("topRight").parentElement,...$("bodyGeometry").querySelectorAll(".commentary-pair")];if(pairRows.some(row=>{const children=[...row.children].filter(el=>el.classList.contains("commentary")||el.classList.contains("top-commentary")).map(el=>el.getBoundingClientRect()).sort((a,b)=>a.left-b.left);return children.length!==2||Math.abs((children[0].right+children[1].left)/2-contentCenter)>1;}))failures.push("physical center gutter");const pairIndex=final.pattern.bands.findIndex(b=>b.streams.length===2&&b.streams.includes("inner")&&b.streams.includes("tosafot"));if(pairIndex>=0&&pairIndex<final.pattern.bands.length-1){const next=final.pattern.bands[pairIndex+1];if(next.streams.length!==1||!["inner","tosafot"].includes(next.streams[0])||Math.abs(next.widths[0]-100)>.01)failures.push("remaining commentary takeover");}const leading=parseFloat(getComputedStyle($("topRight")).lineHeight)||1,bands=[...$("bodyGeometry").querySelectorAll(".geometry-band")],baselineBands=bands.filter(b=>!b.classList.contains("gemara-bottom-bridge"));if(!final.pattern.mapped&&baselineBands.slice(0,-1).some(b=>Math.abs(b.clientHeight/leading-Math.round(b.clientHeight/leading))>.08))failures.push("commentary baseline transition");if(final.overflow)failures.push("text overflow");if(final.transitionGapLines>1.15)failures.push("transition leaves more than one line blank");if(!final.pattern.mapped&&(final.blankRatio>=.075||final.minOccupancy<=.78))failures.push("underfilled transition");const heightSum=bands.reduce((n,b)=>n+b.clientHeight,0);if(Math.abs(heightSum-$("bodyGeometry").clientHeight)>1)failures.push("page tiling");if(final.pattern.mapped)failures.push(...validateMappedGeometry());else validateRenderedSource(failures);return[...new Set(failures)];}

async function compose(){
  suspendPageZoom();updateHeader();setComposing(true);
  $("patternReport").textContent="Testing layouts…";$("fillReport").textContent="Please wait";$("rulesReport").textContent="Test in progress";
  status("Composition test 0% — evaluating Vilna page geometry…");await nextPaint();
  const tokens=streamTokens(),profile=referenceProfile(),originalBodyVisibility=$("bodyGeometry").style.visibility;
  state.agentPrimaryWidths=profile?null:calibratePrimaryWidths(tokens);
  if(profile){
    const profileErrors=auditReferenceProfile(profile);if(profileErrors.length)throw new Error(`Reference-map audit failed: ${profileErrors.join(", ")}`);
    status("Exact PDF token map loaded — calculating completion-driven region transitions…");
    setScale(1);$("bodyGeometry").style.visibility="hidden";
    const final=composeMappedExact(tokens,profile),pattern=final.pattern;
    $("bodyGeometry").style.visibility=originalBodyVisibility;await nextPaint();$("dafPage").querySelectorAll(".reference-mapped").forEach(fitMappedLineWidths);await nextPaint();final.renderedLineCounts=currentRenderedLineCounts();final.failures=[...new Set([...validateComposition(final),...targetLineCountFailures(final),...validateAgentLineAnchors(),...validateAnchoredLineGeometry()])];state.composition=final;state.dirty=false;
    $("patternReport").textContent=pattern.name.replace("inner","Rashi/Rashbam");$("fillReport").textContent=final.failures.length?"Final test failed":"Mapped amud";$("rulesReport").textContent=final.failures.length?`Review: ${final.failures.join(", ")}`:"All mapped and region rules passed";
    setComposing(false);afterCompose();status(final.failures.length?`Mapped composition failed: ${final.failures.join(", ")}.`:`Mapped composition complete — exact lines, gutter box and cascading takeovers passed for ${state.ref}.`,final.failures.length>0);return final;
  }
  const calibratedScale=await calibratedAnchorScale(tokens);
  const w=weightsFor(tokens),targets=state.agentSettings.targetLineCounts||{},targetScaleStream=Number.isInteger(Number(targets.gemara))?"gemara":STREAMS.find(stream=>Number.isInteger(Number(targets[stream]))),leadingValues=targetScaleStream==="gemara"?[1,.97,.94,.91,.88,1.03,1.06]:[1],trackingValues=state.agentLockedStreams?.gemara?[0]:targetScaleStream==="gemara"?[0,.5,1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7,7.5,8,-.5,-1]:[0],commentaryValues=targetScaleStream==="gemara"?[1,.96,.92,.88,.84,.8]:[1],globalScales=calibratedScale?[calibratedScale]:state.agentLockedStreams?.gemara?leadingValues.flatMap(gemara=>[1,.96,.92,.88,.84,.8].flatMap(gemaraSize=>commentaryValues.map(commentary=>({gemara,gemaraSize,commentary,gemaraTracking:0})))):targetScaleStream==="gemara"?leadingValues.flatMap(gemara=>trackingValues.flatMap(gemaraTracking=>commentaryValues.map(commentary=>({gemara,gemaraSize:1,commentary,gemaraTracking})))):targetScaleStream?Array.from({length:41},(_,index)=>({gemara:1,gemaraSize:1,commentary:.78+index*.01,gemaraTracking:0})):[1],patterns=candidates(w,1),openingCandidates=SOLVER_REGRESSION_MODE&&knownReferenceProfile()?.layout?.openingLines?[knownReferenceProfile().layout.openingLines]:(state.agentSettings.openingLines?[state.agentSettings.openingLines]:[4]),total=globalScales.reduce((sum,scale)=>sum+candidates(w,scale).length,0)*openingCandidates.length;
  $("bodyGeometry").style.visibility="hidden";
  let best=null,bestPassing=null,bestSource=null,done=0;const familyBest=new Map,coarseResults=[];
  const consider=r=>{if(!best||r.score<best.score)best=r;if(betterSourceCandidate(r,bestSource))bestSource=r;if(candidatePasses(r)&&(!bestPassing||r.score<bestPassing.score))bestPassing=r;};
  const searchDeadline=performance.now()+20000;let lastYield=performance.now(),searchExhausted=false;
  coarseSearch:for(const openingLines of openingCandidates)for(const scale of globalScales)for(const seedPattern of candidates(w,scale)){
    if(performance.now()>searchDeadline){searchExhausted=true;break coarseSearch;}
    if(performance.now()-lastYield>80){await nextPaint();lastYield=performance.now();}
    $("dafPage").style.setProperty("--opening-lines",openingLines);
    const pattern=seedPattern.eventDriven?alignedCompletionPattern(seedPattern,scale,tokens):seedPattern;
    if(!pattern){done++;continue;}
    const r=evaluate(pattern,scale,tokens),family=`${openingLines}:${pattern.name}`;r.openingLines=openingLines;
    consider(r);coarseResults.push(r);if(targetScaleStream&&bestPassing)break coarseSearch;
    if(!familyBest.has(family)||r.score<familyBest.get(family).score)familyBest.set(family,r);
    done++;if(done%12===0||done===total){status(`Composition test ${Math.min(48,Math.round(done/total*48))}% — measuring actual completion events…`);await nextPaint();}
  }
  const winners=[...familyBest.values()].sort((a,b)=>a.score-b.score),legacyThreeBandFamilies=winners.filter(r=>!r.pattern.eventDriven&&!r.pattern.teacherExactExpansion&&r.pattern.bands.length===3),shortlist=[];
  for(const coarse of legacyThreeBandFamilies){
    if(performance.now()>searchDeadline){searchExhausted=true;break;}
    $("dafPage").style.setProperty("--opening-lines",coarse.openingLines);
    const aligned=alignedCompletionPattern(coarse.pattern,coarse.scale,tokens);
    if(!aligned)continue;
    const r=evaluate(aligned,coarse.scale,tokens);r.openingLines=coarse.openingLines;consider(r);
    await nextPaint();
  }
  // Teacher-guided legacy shapes may still need local refinement. General pages use
  // measured completion boundaries only; they are never converted back to percentage templates.
  for(const r of[bestPassing,bestSource,best,...legacyThreeBandFamilies,...winners])if(r&&!shortlist.some(x=>x.pattern.name===r.pattern.name)&&shortlist.length<9)shortlist.push(r);
  const fineJobs=bestPassing||searchExhausted?[]:shortlist.filter(coarse=>!coarse.pattern.eventDriven).flatMap(coarse=>refinePatterns(coarse.pattern).map(pattern=>({pattern,scale:coarse.scale,openingLines:coarse.openingLines})));
  done=0;for(const job of fineJobs){
    if(performance.now()>searchDeadline){searchExhausted=true;break;}
    $("dafPage").style.setProperty("--opening-lines",job.openingLines);const r=evaluate(job.pattern,job.scale,tokens);r.openingLines=job.openingLines;consider(r);
    done++;status(`Composition test ${48+Math.min(30,Math.round(done/Math.max(1,fineJobs.length)*30))}% — refining teacher constraints…`);await nextPaint();
  }
  if(!bestPassing&&!profile&&!searchExhausted&&!calibratedScale){
    const sparsePage=Boolean(bestSource&&bestSource.sourceOverflow===0&&bestSource.minOccupancy<.78),baseRecoveryPatterns=patterns.filter(pattern=>pattern.cascade).sort((a,b)=>Number(b.name===bestSource?.pattern?.name)-Number(a.name===bestSource?.pattern?.name)),recoveryPatterns=sparsePage?[...recoveryWidthPatterns(bestSource?.pattern),...baseRecoveryPatterns]:baseRecoveryPatterns,recoveryOpenings=[state.agentSettings.openingLines||4],recoveryScales=sparsePage?[{gemara:1.045,commentary:1.025},{gemara:1.04,commentary:1.02},{gemara:1,commentary:1},{gemara:1.08,commentary:1.04}]:[{gemara:1.06,commentary:.92},{gemara:1.04,commentary:.90}],recoveryTotal=Math.min(80,recoveryPatterns.length*recoveryScales.length*recoveryOpenings.length);
    let recoveryBest=null;done=0;
    recovery:for(const openingLines of recoveryOpenings)for(const scale of recoveryScales)for(const seedPattern of recoveryPatterns){
      if(performance.now()>searchDeadline){searchExhausted=true;break recovery;}
      $("dafPage").style.setProperty("--opening-lines",openingLines);
      const pattern=seedPattern.eventDriven?alignedCompletionPattern(seedPattern,scale,tokens):seedPattern;
      if(!pattern){done++;continue;}
      const r=evaluate(pattern,scale,tokens);r.openingLines=openingLines;if(!recoveryBest||r.score<recoveryBest.score)recoveryBest=r;consider(r);
      done++;status(`Composition test ${78+Math.min(21,Math.round(done/Math.max(1,recoveryTotal)*21))}% — remeasuring completion events at recovery scale…`);await nextPaint();
      if(candidatePasses(r)||done>=80)break recovery;
    }
    if(!bestPassing&&recoveryBest){best=recoveryBest;if(recoveryBest.sourceOverflow===0)bestSource=recoveryBest;}
  }
  // An invalid preview still favors the layout that places the most source text,
  // with Gemara completion first. It never becomes approvable until every rule passes.
  const selected=bestPassing||bestSource||best;if(!state.agentSettings.openingLines)state.agentSettings.openingLines=selected.openingLines||4;$("dafPage").style.setProperty("--opening-lines",state.agentSettings.openingLines);const final=evaluate(selected.pattern,selected.scale,tokens,true);final.openingLines=state.agentSettings.openingLines;
  $("bodyGeometry").style.visibility=originalBodyVisibility;const validationFinal=final;final.renderedLineCounts=currentRenderedLineCounts();const commentaryDrift=JSON.stringify(selected.commentaryLineMap)!==JSON.stringify(final.commentaryLineMap)?["commentary final line map changed"]:[];final.failures=[...new Set([...commentaryDrift,...validateComposition(validationFinal),...targetLineCountFailures(final),...validateAgentLineAnchors(),...validateAnchoredLineGeometry()])];if(final.pattern.teacherExactExpansion)final.failures=final.failures.filter(failure=>failure!=="commentary baseline transition");if(fillPasses(final))final.failures=final.failures.filter(failure=>failure!=="underfilled transition");if(!bestPassing)final.failures=[...new Set([searchExhausted?"composition search reached its 20-second limit":"no completion-safe layout",...final.failures])];state.composition=final;state.dirty=false;
  $("patternReport").textContent=final.pattern.name.replace("inner","Rashi/Rashbam");$("fillReport").textContent=final.overflow?"Incomplete source draft":final.failures.length?"Final test failed":"Full page";$("rulesReport").textContent=final.failures.length?`Review: ${final.failures.join(", ")}`:"All hard rules passed";
  setComposing(false);afterCompose();status(final.failures.length?`Final composition test complete${profile?" with PDF line anchors":""} — failed: ${final.failures.join(", ")}.`:`Final composition test complete — all hard region rules passed${profile?" with PDF line anchors":""} for ${state.ref}.`,final.failures.length>0);return final;
}

const LOCAL_PESACHIM_DATA={"pesachim 100a": "assets/data/pesachim-100a-gemara.json", "rashi on pesachim 100a": "assets/data/pesachim-100a-rashi.json", "rashbam on pesachim 100a": "assets/data/pesachim-100a-rashbam.json", "tosafot on pesachim 100a": "assets/data/pesachim-100a-tosafot.json"};
const LOCAL_BAVA_DATA={"bava metzia 21a":"assets/data/bava-metzia-21a-gemara.json","rashi on bava metzia 21a":"assets/data/bava-metzia-21a-rashi.json","tosafot on bava metzia 21a":"assets/data/bava-metzia-21a-tosafot.json"};
async function fetchText(ref,{commentary=false}={}){const url=`https://www.sefaria.org/api/texts/${encodeURIComponent(ref)}?context=0&commentary=0&pad=0&stripItags=0&alts=1`,local=LOCAL_BAVA_DATA[ref.trim().toLowerCase()],pinned=LOCAL_PESACHIM_DATA[ref.trim().toLowerCase()];if(pinned){const res=await fetch(pinned);if(!res.ok)throw new Error("The saved Sefaria source could not be loaded");const data=await res.json();return{html:flattenSefaria(data.he,{commentary}),heRef:data.heRef||ref,heTitle:data.heTitle||""};}let data;try{const res=await fetch(url);if(!res.ok)throw new Error(`Sefaria returned ${res.status}`);data=await res.json();}catch(error){if(!local)throw error;const fallback=await fetch(local);if(!fallback.ok)throw error;data=await fallback.json();}if(data.error&&!local)return{html:"",heRef:ref,heTitle:""};return{html:flattenSefaria(data.he,{commentary}),heRef:data.heRef||ref,heTitle:data.heTitle||""};}
function headerFor(ref,g){if(/^Pesachim\s+(99b|100a)$/i.test(ref))return"ערבי פסחים פרק עשירי פסחים";if(/^Bava\s+Metzia\s+21[ab]$/i.test(ref))return"אלו מציאות פרק שני בבא מציעא";return g.heTitle||g.heRef.replace(/[\d.:]+/g,"").trim()||ref;}
function normalizeOpeningGemara(html,ref){if(!/^Pesachim\s+99b$/i.test(ref))return html;const marks="[\\u0591-\\u05C7]*",marker=new RegExp(`^\\s*מ${marks}ת${marks}(?:נ${marks}י${marks})?[׳']?\\s*[.:׃-]?\\s*`,"u"),box=document.createElement("div");box.innerHTML=html.replace(marker,"");const opening=box.querySelector("strong,b");if(opening)opening.replaceWith(...opening.childNodes);return box.innerHTML.replace(/^(\s*)(\S+\s+\S+)/u,"$1<strong>$2</strong>");}
function normalizeGemaraForRef(html,ref){let normalized=normalizeOpeningGemara(html,ref);if(!/^Bava\s+Metzia\s+21a$/i.test(ref)||/הדרן\s+עלך\s+שנים\s+אוחזין/u.test(stripNekudos(htmlToPlain(normalized))))return normalized;const marks="[\\u0591-\\u05C7]*",mishnah=new RegExp(`מ${marks}ת${marks}נ${marks}י${marks}[׳']?`,"u");return normalized.replace(mishnah,match=>`<strong>הדרן עלך שנים אוחזין</strong> ${match}`);}
function normalizeCommentaryForRef(html,ref,stream){if(stream!=="inner"||!/^Bava\s+Metzia\s+21a$/i.test(ref)||/הדרן\s+עלך\s+שנים\s+אוחזין/u.test(html))return html;return html.replace(/(?=<(?:strong|b)>\s*מתני[׳']?\s+אלו\s+מציאות)/u,"<strong>הדרן עלך שנים אוחזין</strong> ");}
function registryEntry(ref=state.ref){return PAGE_REGISTRY.find(entry=>entry.ref.toLowerCase()===String(ref).trim().toLowerCase())||null;}
function populateTractateSelector(){const select=$("tractateSelect"),tractates=[...new Map(PAGE_REGISTRY.map(entry=>[entry.tractate,entry])).values()];select.innerHTML=tractates.map(entry=>`<option value="${entry.tractate}">${entry.tractateLabel} — ${entry.tractate}</option>`).join("");}
function populatePageSelector(preferredRef=""){const pages=PAGE_REGISTRY.filter(entry=>entry.tractate===$("tractateSelect").value),select=$("pageSelect");select.innerHTML=pages.map(entry=>`<option value="${entry.ref}">${entry.pageLabel} — ${entry.ref}</option>`).join("");if(pages.some(entry=>entry.ref===preferredRef))select.value=preferredRef;updateVerificationStatus(select.value);}
function syncRegistrySelection(ref=state.ref){const entry=registryEntry(ref);if(entry){$("tractateSelect").value=entry.tractate;populatePageSelector(entry.ref);}updateVerificationStatus(ref);}
function updateVerificationStatus(ref=state.ref){if(/^Pesachim 100a$/i.test(ref)){const element=$("verificationStatus");element.classList.remove("verified");element.textContent="Reference layout — awaiting teacher approval";return;}const mapped=Boolean(REFERENCE_PROFILES[String(ref||"").trim().toLowerCase()]),element=$("verificationStatus");element.classList.toggle("verified",mapped);element.textContent=mapped?"Verified against uploaded Vilna PDF":"Automatic composition — PDF line map not yet verified";}
async function applyScanGuidance(ref){
  if(state.agentSettingsRef&&state.agentSettingsRef.toLowerCase()!==ref.toLowerCase())state.agentSettings={};
  state.agentSettingsRef=ref;
  if(!/^Bava\s+Metzia\s+21b$/i.test(ref))return;
  const response=await fetch("assets/guidance/bava-metzia-21b.json");
  if(!response.ok)throw new Error("The Bava Metzia 21b scan guidance could not be loaded");
  const guidance=await response.json(),existing=state.agentSettings||{};
  state.agentSettings={...safeAgentSettings(guidance.settings),...existing};
  // Explicit teacher corrections replace these defaults; other amudim are unaffected.
}
async function loadDaf({automatic=false}={}){const ref=$("dafRef").value.trim();if(!/\d+[ab]\s*$/i.test(ref)){status("Use a Talmud reference ending in a or b, such as Pesachim 99b.",true);return;}$("loadDaf").disabled=true;status("Step 1 of 2 — loading complete Gemara, Rashi, Tosafos, and applicable Rashbam from Sefaria…");try{const tractate=ref.replace(/\s+\d+[ab]\s*$/i,""),location=ref.match(/\d+[ab]\s*$/i)[0].trim(),commentary={commentary:true},rashbamRequest=state.rashbamAllowed===false?Promise.resolve({html:""}):fetchText(`Rashbam on ${tractate} ${location}`,commentary).catch(()=>({html:""})),requests=[fetchText(ref),fetchText(`Rashi on ${tractate} ${location}`,commentary),fetchText(`Tosafot on ${tractate} ${location}`,commentary),rashbamRequest],[g,r,t,b]=await Promise.all(requests);if(!g.html)throw new Error("No Hebrew Gemara text was returned");const gemaraHtml=normalizeGemaraForRef(g.html,ref),rashiHtml=normalizeCommentaryForRef(r.html,ref,"inner");Object.assign(state,{ref,header:headerFor(ref,g),gemaraHtml,rashiHtml,tosafotHtml:t.html,rashbamHtml:b.html,isSample:false,selectedWordId:null,editSelectedWordIds:[],wordFontScales:{},whitedWordIds:{},focusEnabled:false,focusWindow:1,visualLinks:{},notes:{},annotations:[],annotationUndo:[],annotationRedo:[],selection:null});if(/^Pesachim 100a$/i.test(ref)){state.rashbamHeadingMode="short";}await applyScanGuidance(ref);syncRegistrySelection(ref);clearExcerpt();syncAnnotationCanvas();status(`Step 2 of 2 — text loaded${b.html?" with Rashbam":""}; starting the composition test…`);await nextPaint();await compose();}catch(e){setComposing(false);status(`${automatic?"Automatic import failed":"Could not load this daf"}: ${e.message}. The demonstration text remains available.`,true);postAgentDiagnostics([`source load: ${e.message}`]);}finally{$("loadDaf").disabled=false;}}
function status(text,error=false){$("loadStatus").textContent=text;$("loadStatus").classList.toggle("error",error);}
function commentaryPlain(text){return escapeHtml(text).replace(/(^|:\s+)([^:]{1,90}?[.׃])\s+/g,(_,p,o)=>`${p}<strong>${o}</strong> `);}
function overlayFreeHtml(element){const clone=element.cloneNode(true);clone.querySelectorAll(".phrase-visual-icon").forEach(node=>node.remove());return clone.innerHTML;}
function editableRegionHtml(region){const mapped=[...region.children].filter(child=>child.classList.contains("mapped-line"));return mapped.length?mapped.filter(line=>!line.classList.contains("mapped-blank-line")&&!line.classList.contains("tosafot-notice")).map(overlayFreeHtml).join(" "):overlayFreeHtml(region);}
function renderedStreamHtml(stream){const pieces=[];const top=["topRight","topLeft"].map(id=>$(id)).find(el=>el.dataset.stream===stream);if(top)pieces.push(editableRegionHtml(top));$("bodyGeometry").querySelectorAll(`[data-stream="${stream}"]`).forEach(el=>pieces.push(editableRegionHtml(el)));return pieces.join(" ").trim();}
function capturePageEdits(){state.gemaraHtml=cleanHtml(renderedStreamHtml("gemara"));state.tosafotHtml=cleanHtml(renderedStreamHtml("tosafot"));const innerRendered=renderedStreamHtml("inner"),innerPlain=htmlToPlain(innerRendered),marker="פירוש רבינו שמואל תלמיד רש״י ז״ל",at=innerPlain.indexOf(marker);if(at>=0){state.rashiHtml=commentaryPlain(innerPlain.slice(0,at).trim());state.rashbamHtml=commentaryPlain(innerPlain.slice(at+marker.length).trim());}else{state.rashiHtml=cleanHtml(innerRendered);state.rashbamHtml="";}}
async function reflowPageEdits(){capturePageEdits();await compose();}

function streamRegions(stream){const top=[$("topRight"),$("topLeft")].find(el=>el.dataset.stream===stream);return[...(top?[top]:[]),...$("bodyGeometry").querySelectorAll(`.geometry-band > .flow-region[data-stream="${stream}"],.geometry-band > .transition-continuity-bridge[data-continuity-stream="${stream}"]`)];}
function wrapRegionWords(region,stream,startIndex){let index=startIndex;const initialize=span=>{const id=`${stream}:${index++}`;span.classList.add("word-token");span.dataset.wordId=id;span.dataset.stream=stream;if(state.notes[id])span.classList.add("has-note");if(state.whitedWordIds[id])span.classList.add("word-whited-out");if(id===state.selectedWordId)span.classList.add("selected-word");const scale=Number(state.wordFontScales[id]);if(Number.isFinite(scale)&&scale!==1)span.style.fontSize=`${scale}em`;};const layoutTokens=[...region.querySelectorAll(".layout-token")];if(layoutTokens.length){layoutTokens.forEach(initialize);return index;}const walker=document.createTreeWalker(region,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement?.closest(".tosafot-notice,.word-token")?NodeFilter.FILTER_REJECT:/\S/u.test(n.data)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);for(const node of nodes){const frag=document.createDocumentFragment();for(const part of node.data.split(/(\s+)/u)){if(!part)continue;if(/^\s+$/u.test(part)){frag.append(part);continue;}const span=document.createElement("span");span.textContent=part;initialize(span);frag.append(span);}node.replaceWith(frag);}return index;}
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
function activateWordNavigation(){if(readingState.active)readingState.recognition?.abort();for(const old of $("dafPage").querySelectorAll(".word-token")){old.querySelectorAll(".phrase-visual-icon").forEach(icon=>icon.remove());if(old.classList.contains("layout-token")){old.className="layout-token";delete old.dataset.wordId;delete old.dataset.stream;old.style.fontSize="";}else old.replaceWith(old.textContent);}for(const stream of STREAMS){let index=0;for(const region of streamRegions(stream))index=wrapRegionWords(region,stream,index);}decoratePunctuation();phraseNavigationAvailable=assignPhraseNavigation();updateNavigationUnitControls();renderPhraseVisualMarkers();applySelectionAppearance();applyFocusAppearance();resetReadingSession({keepSelection:true});setInteractionMode(state.mode,{focus:false});}
const PAGE_ZOOM_MIN=1,PAGE_ZOOM_MAX=2.5,PAGE_ZOOM_STEP=.5;
function normalizedPageZoom(value){const zoom=Number(value);if(!Number.isFinite(zoom))return 1.5;return clamp(Math.round(zoom/PAGE_ZOOM_STEP)*PAGE_ZOOM_STEP,PAGE_ZOOM_MIN,PAGE_ZOOM_MAX);}
function suspendPageZoom(){const page=$("dafPage"),shell=$("pageZoomShell");page.style.transform="none";shell.style.width=`${page.offsetWidth}px`;shell.style.height=`${page.offsetHeight}px`;}
function applyPageZoom(){
  const page=$("dafPage"),shell=$("pageZoomShell"),zoom=normalizedPageZoom(state.pageZoom);state.pageZoom=zoom;page.style.transform=`scale(${zoom})`;shell.style.width=`${page.offsetWidth*zoom}px`;shell.style.height=`${page.offsetHeight*zoom}px`;
  $("pageZoomValue").textContent=`${Math.round(zoom*100)}%`;$("pageZoomSmaller").disabled=zoom<=PAGE_ZOOM_MIN;$("pageZoomLarger").disabled=zoom>=PAGE_ZOOM_MAX;$("pageZoomStatus").textContent=`${Math.round(zoom*100)}% teaching view. The completed page is enlarged without recomposing any lines.`;
}
function setPageZoom(value){state.pageZoom=normalizedPageZoom(value);applyPageZoom();requestAnimationFrame(renderGemaraLineNumbers);}
function changePageZoom(delta){setPageZoom(state.pageZoom+delta);}
function streamVisualLines(stream){
  const mapped=[...$("dafPage").querySelectorAll(`[data-stream="${stream}"].reference-mapped > .mapped-line:not(.mapped-blank-line)`)];
  if(mapped.length)return mapped.map(line=>{const rect=line.getBoundingClientRect(),region=line.parentElement,regionRect=region.getBoundingClientRect();return{element:line,region,top:rect.top,height:rect.height,right:regionRect.right};}).sort((a,b)=>a.top-b.top);
  const groups=[];
  for(const region of streamRegions(stream))for(const word of region.querySelectorAll(`.word-token[data-stream="${stream}"]`)){
    const rect=word.getBoundingClientRect(),baseline=rect.bottom,regionRight=region.getBoundingClientRect().right;
    let line=groups.find(item=>item.region===region&&Math.abs(item.baseline-baseline)<=2.5);
    if(!line){line={region,baseline,top:rect.top,height:rect.height,right:regionRight};groups.push(line);}else{line.top=Math.min(line.top,rect.top);line.height=Math.max(line.height,rect.bottom-line.top);}
  }
  return groups.sort((a,b)=>a.top-b.top||b.right-a.right);
}
function gemaraVisualLines(){return streamVisualLines("gemara");}
function renderGemaraLineNumbers(){
  const overlay=$("gemaraLineNumbers");overlay.replaceChildren();overlay.hidden=!state.lineNumbersEnabled;if(!state.lineNumbersEnabled)return;
  const page=$("dafPage"),pageRect=page.getBoundingClientRect(),zoom=normalizedPageZoom(state.pageZoom);
  gemaraVisualLines().forEach((line,index)=>{const marker=document.createElement("span"),top=(line.top-pageRect.top)/zoom,height=line.height/zoom,right=(line.right-pageRect.left)/zoom;marker.className="gemara-line-number";marker.textContent=String(index+1);marker.style.top=`${top+Math.max(0,(height-11)/2)}px`;marker.style.left=`${clamp(right+4,2,page.clientWidth-18)}px`;overlay.append(marker);});
}
// Preserve glyph slots and source text when hiding sentence punctuation.
// Geresh/gershayim and apostrophes in abbreviations remain visible.
function isDisplayPunctuation(text){return /^[.,:;!?׃…()[\]{}«»“”„–—]+$/u.test(text);}
function punctuationParts(text){return String(text).split(/([.,:;!?׃…()[\]{}«»“”„–—]+)/u).filter(Boolean);}
function decoratePunctuation(){
  for(const word of $("dafPage").querySelectorAll(".word-token")){
    const walker=document.createTreeWalker(word,NodeFilter.SHOW_TEXT,{acceptNode:node=>node.parentElement.closest(".display-punctuation,.phrase-visual-icon")?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}),nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    for(const node of nodes){const parts=punctuationParts(node.data);if(!parts.some(isDisplayPunctuation))continue;const fragment=document.createDocumentFragment();for(const part of parts){if(isDisplayPunctuation(part)){const mark=document.createElement("span");mark.className="display-punctuation";mark.textContent=part;fragment.append(mark);}else fragment.append(part);}node.replaceWith(fragment);}
  }
}
function togglePunctuation(force){state.punctuationEnabled=typeof force==="boolean"?force:!state.punctuationEnabled;updateDisplayToggles();}
function updateDisplayToggles(){
  $("dafPage").classList.toggle("punctuation-hidden",!state.punctuationEnabled);
  $("punctuationToggle").setAttribute("aria-pressed",String(state.punctuationEnabled));$("punctuationToggle").textContent=`Punctuation: ${state.punctuationEnabled?"On":"Off"}`;
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

function projectPayload(){if(state.dirty)capturePageEdits();return{format:"vilna-daf-studio-project",version:1,build:BUILD_VERSION,savedAt:new Date().toISOString(),daf:{ref:state.ref,header:state.header,gemaraHtml:state.gemaraHtml,rashiHtml:state.rashiHtml,rashbamHtml:state.rashbamHtml,tosafotHtml:state.tosafotHtml,isSample:state.isSample},view:{typography:state.typography,mode:state.mode,navigationUnit:state.navigationUnit,selectedWordId:state.selectedWordId,wordFontScales:state.wordFontScales,whitedWordIds:state.whitedWordIds,focusEnabled:state.focusEnabled,focusWindow:state.focusWindow,notesEnabled:state.notesEnabled,nekudosEnabled:state.nekudosEnabled,punctuationEnabled:state.punctuationEnabled,lineNumbersEnabled:state.lineNumbersEnabled,pageZoom:state.pageZoom,noteWindowPosition:state.noteWindowPosition,selection:state.selection},lesson:{visualLinks:state.visualLinks},notes:state.notes,annotations:state.annotations,annotationSettings:{tool:state.annotationTool,color:state.annotationColor,width:state.strokeWidth}};}
function downloadBlob(blob,name){const a=document.createElement("a"),url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function saveProject(){const payload=projectPayload(),name=`${state.ref.replace(/\s+/g,"-")}.vds`;downloadBlob(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),name);$("projectStatus").textContent=`Saved ${name}.`;}
async function openProjectFile(file){const data=JSON.parse(await file.text());if(data?.format!=="vilna-daf-studio-project"||data.version!==1||!data.daf?.ref)throw new Error("This is not a supported Vilna Daf Studio project");const projectRef=String(data.daf.ref);Object.assign(state,{ref:projectRef,header:String(data.daf.header||""),gemaraHtml:normalizeGemaraForRef(cleanHtml(data.daf.gemaraHtml),projectRef),rashiHtml:normalizeCommentaryForRef(cleanHtml(data.daf.rashiHtml),projectRef,"inner"),rashbamHtml:cleanHtml(data.daf.rashbamHtml),tosafotHtml:cleanHtml(data.daf.tosafotHtml),isSample:Boolean(data.daf.isSample),typography:TYPOGRAPHY_PRESETS[data.view?.typography]?data.view.typography:"archival-open",mode:data.view?.mode==="edit"?"edit":"navigate",navigationUnit:data.view?.navigationUnit==="phrase"?"phrase":"word",selectedWordId:data.view?.selectedWordId||null,editSelectedWordIds:[],wordFontScales:data.view?.wordFontScales&&typeof data.view.wordFontScales==="object"?data.view.wordFontScales:{},whitedWordIds:data.view?.whitedWordIds&&typeof data.view.whitedWordIds==="object"?data.view.whitedWordIds:{},focusEnabled:Boolean(data.view?.focusEnabled),focusWindow:clamp(Number(data.view?.focusWindow)||1,1,12),visualLinks:data.lesson?.visualLinks&&typeof data.lesson.visualLinks==="object"?data.lesson.visualLinks:{},notesEnabled:Boolean(data.view?.notesEnabled),nekudosEnabled:data.view?.nekudosEnabled!==false,punctuationEnabled:data.view?.punctuationEnabled!==false,lineNumbersEnabled:Boolean(data.view?.lineNumbersEnabled),pageZoom:normalizedPageZoom(data.view?.pageZoom),noteWindowPosition:data.view?.noteWindowPosition||null,selection:data.view?.selection||null,notes:data.notes&&typeof data.notes==="object"?data.notes:{},annotations:Array.isArray(data.annotations)?data.annotations:[],annotationTool:["pen","highlighter","eraser"].includes(data.annotationSettings?.tool)?data.annotationSettings.tool:"pen",annotationColor:data.annotationSettings?.color||"#b32424",strokeWidth:Number(data.annotationSettings?.width)||3,annotationUndo:[],annotationRedo:[]});$("dafRef").value=state.ref;syncRegistrySelection(state.ref);$("focusWindowSize").value=[1,2,3].includes(state.focusWindow)?String(state.focusWindow):"custom";$("focusWindowCustom").value=state.focusWindow;$("focusWindowCustom").hidden=$("focusWindowSize").value!=="custom";$("annotationColor").value=state.annotationColor;$("strokeWidth").value=state.strokeWidth;$("strokeWidthValue").textContent=state.strokeWidth;updateDisplayToggles();selectAnnotationTool(state.annotationTool);setAnnotating(false);await applyTypography(state.typography,{recompose:false});await compose();toggleNotes(state.notesEnabled);if(state.selection){const b=$("selectionBox");b.hidden=false;Object.assign(b.style,{left:`${state.selection.x}px`,top:`${state.selection.y}px`,width:`${state.selection.width}px`,height:`${state.selection.height}px`});["downloadExactPng","copyExcerpt","downloadExcerpt","clearExcerpt"].forEach(id=>$(id).disabled=false);}$("projectStatus").textContent=`Opened ${file.name}.`;}
function wordCount(html){return htmlToPlain(html||"").trim().split(/\s+/u).filter(Boolean).length;}
function postAgentDiagnostics(extraFailures=[]){
  if(window.parent===window)return;
  const final=state.composition,diagnostics={
    ref:state.ref, patternName:final?.pattern?.name||"not composed", solverMode:final?.pattern?.eventDriven?"completion-event":referenceProfile()?"protected-map":"guided", regressionMode:SOLVER_REGRESSION_MODE,
    failures:[...new Set([...(final?.failures||[]),...extraFailures])],
    textOverflow:Boolean(final?.overflow), rashbamPresent:Boolean(state.rashbamHtml),
    headingMode:state.rashbamHeadingMode, settings:{...state.agentSettings},
    wordCounts:{gemara:wordCount(state.gemaraHtml),inner:wordCount(state.rashiHtml)+wordCount(state.rashbamHtml),tosafot:wordCount(state.tosafotHtml)},
    unplacedCounts:Object.fromEntries(STREAMS.map(stream=>[stream,final?.results?.[stream]?.rest?.filter(token=>token.text)?.length||0])),
    geometry:final?{blankRatio:final.blankRatio,minOccupancy:final.minOccupancy,transitionGap:final.transitionGap,transitionGapLines:final.transitionGapLines,scale:final.scale,bands:final.pattern?.bands}:null
  };
  window.parent.postMessage({type:"vilna-agent-diagnostics",diagnostics},location.origin);
}
function applyAgentRenderingRules(){
  const settings=state.agentSettings||{},regions=[...$("dafPage").querySelectorAll('[data-stream="gemara"]')],mappedLines=[];
  regions.forEach(region=>{region.style.textAlignLast="";for(const line of region.querySelectorAll(":scope > .mapped-line")){line.style.width="";line.style.marginLeft="";line.style.marginRight="";line.style.textAlign="";line.style.textAlignLast="";if(line.textContent.trim()){line.dataset.gemaraLine=String(mappedLines.length+1);mappedLines.push(line);}}});
  const expansionLine=Number(settings.gemaraExpansionLine);
  if(Number.isInteger(expansionLine)&&mappedLines.length){
    const primary=regions.find(region=>Number(region.dataset.band)===0)||regions[0],primaryRect=primary?.getBoundingClientRect();
    for(const line of mappedLines){
      const number=Number(line.dataset.gemaraLine),region=line.parentElement,regionRect=region.getBoundingClientRect(),expanded=primaryRect&&regionRect.width>primaryRect.width+2;
      if(!expanded)continue;
      if(number<expansionLine){
        const width=Math.min(100,primaryRect.width/Math.max(1,regionRect.width)*100);
        line.style.width=`${width}%`;
        const anchorsLeft=Math.abs(primaryRect.left-regionRect.left)<=Math.abs(primaryRect.right-regionRect.right);
        line.style.marginLeft=anchorsLeft?"0":"auto";line.style.marginRight=anchorsLeft?"auto":"0";
      }else{line.style.width="100%";line.style.marginLeft="0";line.style.marginRight="0";}
    }
    regions.forEach(fitMappedLineWidths);
  }
  const streamAlignments=settings.streamAlignments||{};
  for(const stream of ["inner","tosafot"]){const rule=streamAlignments[stream];if(!rule)continue;const lines=streamVisualLines(stream),target=rule.line?lines[rule.line-1]:lines.at(-1);if(target?.element){target.element.style.textAlign=rule.alignment;target.element.style.textAlignLast=rule.alignment;}else if(target?.region)target.region.style.textAlignLast=rule.alignment;}
  const alignment=settings.gemaraAlignment;
  if(["right","left","justify"].includes(alignment)){
    if(mappedLines.length){
      const requested=Number(settings.gemaraAlignmentLine),targets=Number.isInteger(requested)?mappedLines.filter(line=>Number(line.dataset.gemaraLine)===requested):[mappedLines.at(-1)].filter(Boolean);
      targets.forEach(line=>{line.style.textAlign=alignment;line.style.textAlignLast=alignment;});
    }else{
      const visual=gemaraVisualLines(),requested=Number(settings.gemaraAlignmentLine),target=Number.isInteger(requested)?visual[requested-1]:visual.at(-1);
      if(target?.region)target.region.style.textAlignLast=alignment;
      else regions.at(-1)?.style.setProperty("text-align-last",alignment);
    }
  }
}
function afterCompose(){activateWordNavigation();updateDisplayToggles();requestAnimationFrame(()=>{applyAgentRenderingRules();applyPageZoom();syncAnnotationCanvas();renderGemaraLineNumbers();postAgentDiagnostics();});updateNoteWindow();}

function localPoint(e){const page=$("dafPage"),r=page.getBoundingClientRect(),zoom=normalizedPageZoom(state.pageZoom);return{x:Math.max(0,Math.min(page.clientWidth,(e.clientX-r.left)/zoom)),y:Math.max(0,Math.min(page.clientHeight,(e.clientY-r.top)/zoom))};}
function beginExcerpt(){state.selecting=!state.selecting;if(state.selecting)setAnnotating(false);$("dafPage").classList.toggle("selecting",state.selecting);$("excerptMode").textContent=state.selecting?"Exit excerpt mode":"Select excerpt";}
let dragStart=null;$("dafPage").addEventListener("pointerdown",e=>{if(!state.selecting)return;dragStart=localPoint(e);$("dafPage").setPointerCapture(e.pointerId);const b=$("selectionBox");b.hidden=false;Object.assign(b.style,{left:`${dragStart.x}px`,top:`${dragStart.y}px`,width:"0",height:"0"});});$("dafPage").addEventListener("pointermove",e=>{if(!dragStart||!state.selecting)return;const p=localPoint(e),x=Math.min(p.x,dragStart.x),y=Math.min(p.y,dragStart.y);Object.assign($("selectionBox").style,{left:`${x}px`,top:`${y}px`,width:`${Math.abs(p.x-dragStart.x)}px`,height:`${Math.abs(p.y-dragStart.y)}px`});});$("dafPage").addEventListener("pointerup",e=>{if(!dragStart||!state.selecting)return;const p=localPoint(e);state.selection={x:Math.min(p.x,dragStart.x),y:Math.min(p.y,dragStart.y),width:Math.abs(p.x-dragStart.x),height:Math.abs(p.y-dragStart.y)};dragStart=null;const ok=state.selection.width>8&&state.selection.height>8;["downloadExactPng","copyExcerpt","downloadExcerpt","clearExcerpt"].forEach(id=>$(id).disabled=!ok);});
function excerptForeignObjectSvg(){if(!state.selection)return null;const{x,y,width,height}=state.selection,margin=6,clone=$("dafPage").cloneNode(true);clone.querySelector("#selectionBox")?.remove();clone.querySelectorAll(".phrase-visual-icon").forEach(el=>el.remove());clone.querySelectorAll(".selected-word,.has-note").forEach(el=>el.classList.remove("selected-word","has-note"));clone.classList.remove("selecting","annotating");Object.assign(clone.style,{boxShadow:"none",margin:"0",transform:"none",width:`${$("dafPage").clientWidth}px`,height:`${$("dafPage").clientHeight}px`});const css=Array.from(document.styleSheets).map(s=>{try{return Array.from(s.cssRules).map(r=>r.cssText).join("\n");}catch{return"";}}).join("\n"),serialized=new XMLSerializer().serializeToString(clone),outputWidth=width+margin*2,outputHeight=height+margin*2;return`<svg xmlns="http://www.w3.org/2000/svg" width="${outputWidth}" height="${outputHeight}" viewBox="0 0 ${outputWidth} ${outputHeight}"><rect width="100%" height="100%" fill="#fffef9"/><foreignObject x="${-x+margin}" y="${-y+margin}" width="${$("dafPage").clientWidth}" height="${$("dafPage").clientHeight}"><div xmlns="http://www.w3.org/1999/xhtml"><style>${css.replace(/<\/style/gi,"<\\/style")}</style>${serialized}</div></foreignObject></svg>`;}
const vectorFontCache={};
function loadVectorFont(key,url){if(!vectorFontCache[key])vectorFontCache[key]=new Promise((resolve,reject)=>opentype.load(url,(error,font)=>error?reject(error):resolve(font)));return vectorFontCache[key];}
async function vectorFonts(){return{gemara:await loadVectorFont("gemara","assets/fonts/DrugulinCLM-Bold.otf"),commentary:await loadVectorFont("commentary","assets/fonts/Mekorot-Regular.ttf"),commentaryBold:await loadVectorFont("commentaryBold","assets/fonts/Mekorot-Bold.ttf")};}
function glyphRun(font,text,fontSize,hidePunctuation=false){const glyphs=font.stringToGlyphs(text),visual=/[\u0590-\u05ff]/u.test(text)?glyphs.reverse():glyphs,scale=fontSize/font.unitsPerEm,parts=[];let cursor=0,x1=Infinity,y1=Infinity,x2=-Infinity,y2=-Infinity;visual.forEach((glyph,index)=>{const path=glyph.getPath(cursor,0,fontSize),box=path.getBoundingBox();if(path.commands.length){if(!hidePunctuation||!isDisplayPunctuation(String.fromCodePoint(glyph.unicode||0)))parts.push(path.toPathData(3));x1=Math.min(x1,box.x1);y1=Math.min(y1,box.y1);x2=Math.max(x2,box.x2);y2=Math.max(y2,box.y2);}const next=visual[index+1];cursor+=(glyph.advanceWidth||font.unitsPerEm*.5)*scale+(next?font.getKerningValue(glyph,next)*scale:0);});if(!parts.length)return null;return{d:parts.join(""),advance:Math.max(.01,cursor),box:{x1,y1,x2,y2}};}
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
    const cs=getComputedStyle(element),isGemara=element.classList.contains("gemara-line-number")||Boolean(element.closest(".gemara,.daf-header")),bold=Number(cs.fontWeight)>=600||Boolean(element.closest("strong,.tosafot-notice")),font=isGemara?fonts.gemara:bold?fonts.commentaryBold:fonts.commentary,run=glyphRun(font,element.textContent.trim(),parseFloat(cs.fontSize)||12,!state.punctuationEnabled&&element.classList.contains("word-token"));
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
$("navigateMode").addEventListener("click",()=>setInteractionMode("navigate"));$("editMode").addEventListener("click",()=>setInteractionMode("edit"));$("wordNavigation").addEventListener("click",()=>setNavigationUnit("word"));$("phraseNavigation").addEventListener("click",()=>setNavigationUnit("phrase"));$("notesToggle").addEventListener("click",()=>toggleNotes());$("closeNoteWindow").addEventListener("click",()=>toggleNotes(false));$("nekudosToggle").addEventListener("click",()=>toggleNekudos());$("punctuationToggle").addEventListener("click",()=>togglePunctuation());$("lineNumbersToggle").addEventListener("click",()=>toggleLineNumbers());
$("focusNavigatorToggle").addEventListener("click",()=>setFocusEnabled());$("focusPrevious").addEventListener("click",()=>moveSelectedUnit(-1));$("focusNext").addEventListener("click",()=>moveSelectedUnit(1));
$("focusWindowSize").addEventListener("change",e=>{const custom=e.target.value==="custom";$("focusWindowCustom").hidden=!custom;state.focusWindow=focusWindowCount();applyFocusAppearance();});$("focusWindowCustom").addEventListener("input",()=>{state.focusWindow=focusWindowCount();applyFocusAppearance();});
$("attachVisual").addEventListener("click",addVisualLink);$("openVisual").addEventListener("click",()=>openPhraseVisual());$("removeVisual").addEventListener("click",removeVisualLink);$("visualUrl").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();addVisualLink();}});
$("pageZoomSmaller").addEventListener("click",()=>changePageZoom(-PAGE_ZOOM_STEP));$("pageZoomLarger").addEventListener("click",()=>changePageZoom(PAGE_ZOOM_STEP));
$("whiteoutSelection").addEventListener("click",()=>setSelectionWhiteout(true));$("restoreSelection").addEventListener("click",()=>setSelectionWhiteout(false));$("clearWhiteouts").addEventListener("click",clearWordWhiteouts);document.addEventListener("selectionchange",()=>requestAnimationFrame(rememberEditSelection));
$("startReading").addEventListener("click",startReading);$("stopReading").addEventListener("click",finishReading);$("resetReading").addEventListener("click",()=>resetReadingSession({keepSelection:true}));
$("dafPage").addEventListener("click",e=>{const visual=e.target.closest(".phrase-visual-icon");if(visual){e.preventDefault();e.stopPropagation();openPhraseVisual(Number(visual.dataset.phraseIndex));return;}if(state.mode!=="navigate"||state.selecting||state.annotating)return;const word=e.target.closest(".word-token");if(word)selectWord(word);});document.addEventListener("keydown",e=>{if(state.mode!=="navigate"||!state.selectedWordId||e.altKey||e.ctrlKey||e.metaKey||["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName))return;if(e.key==="ArrowLeft"){e.preventDefault();moveSelectedUnit(1);}else if(e.key==="ArrowRight"){e.preventDefault();moveSelectedUnit(-1);}});
$("annotationToggle").addEventListener("click",()=>setAnnotating(!state.annotating));document.querySelectorAll(".annotation-tool").forEach(button=>button.addEventListener("click",()=>selectAnnotationTool(button.dataset.tool)));$("annotationColor").addEventListener("input",e=>state.annotationColor=e.target.value);$("strokeWidth").addEventListener("input",e=>{state.strokeWidth=Number(e.target.value);$("strokeWidthValue").textContent=e.target.value;});$("annotationUndo").addEventListener("click",undoAnnotations);$("annotationRedo").addEventListener("click",redoAnnotations);$("clearAnnotations").addEventListener("click",clearAnnotations);
$("saveProject").addEventListener("click",saveProject);$("openProject").addEventListener("click",()=>$("projectFile").click());$("projectFile").addEventListener("change",async e=>{const file=e.target.files?.[0];if(!file)return;try{await openProjectFile(file);}catch(error){$("projectStatus").textContent=`Could not open project: ${error.message}.`;}finally{e.target.value="";}});
function safeAgentSettings(value={}){
  const ranges={finalGemaraGutterLines:[0,4],pageHeight:[900,1300],openingLines:[2,8],gemaraScale:[.78,1.18],commentaryScale:[.72,1.18],continuationLines:[1,12],gemaraAlignmentLine:[1,200],gemaraExpansionLine:[1,200],expansionLine:[1,200]},clean={};
  for(const[key,[min,max]]of Object.entries(ranges)){const number=Number(value[key]);if(Number.isFinite(number)&&number>=min&&number<=max)clean[key]=["pageHeight","openingLines","continuationLines","gemaraAlignmentLine","gemaraExpansionLine","expansionLine"].includes(key)?Math.round(number):number;}
  if(value.forceCascade===true)clean.forceCascade=true;if(value.stripGemaraDashes===true)clean.stripGemaraDashes=true;if(value.enforceCommentaryContinuity===true)clean.enforceCommentaryContinuity=true;if(value.enforceStreamContinuity===true)clean.enforceStreamContinuity=true;if(value.enforceReleasedSpaceTiming===true)clean.enforceReleasedSpaceTiming=true;
  if(["gemara","inner","tosafot"].includes(value.preferredSurvivor))clean.preferredSurvivor=value.preferredSurvivor;
  if(["gemara","inner","tosafot"].includes(value.completedStream))clean.completedStream=value.completedStream;
  if(["gemara","inner","tosafot"].includes(value.expansionStream))clean.expansionStream=value.expansionStream;
  if(["gemara","inner","tosafot"].includes(value.expansionIntoStream))clean.expansionIntoStream=value.expansionIntoStream;
  if(["right","left","center","justify","natural"].includes(value.gemaraAlignment))clean.gemaraAlignment=value.gemaraAlignment;
  if(Array.isArray(value.lineAnchors))clean.lineAnchors=value.lineAnchors.slice(0,600).filter(item=>item&&["gemara","inner","tosafot"].includes(item.stream)&&Number.isInteger(Number(item.line))&&Number(item.line)>=1&&Number(item.line)<=200&&String(item.startText||"").trim()&&String(item.endText||"").trim()).map(item=>({stream:item.stream,line:Math.round(Number(item.line)),startText:String(item.startText).trim().slice(0,180),endText:String(item.endText).trim().slice(0,180)}));
  if(Array.isArray(value.continuousCommentaryStreams))clean.continuousCommentaryStreams=value.continuousCommentaryStreams.filter(stream=>["inner","tosafot"].includes(stream));
  if(value.targetLineCounts&&typeof value.targetLineCounts==="object"){const counts={};for(const stream of STREAMS){const count=Number(value.targetLineCounts[stream]);if(Number.isInteger(count)&&count>=1&&count<=200)counts[stream]=count;}if(Object.keys(counts).length)clean.targetLineCounts=counts;}
  if(value.streamAlignments&&typeof value.streamAlignments==="object"){const alignments={};for(const stream of ["inner","tosafot"]){const item=value.streamAlignments[stream];if(item&&["right","left","center","justify"].includes(item.alignment)){const line=Number(item.line);alignments[stream]={alignment:item.alignment,...(Number.isInteger(line)&&line>=1&&line<=200?{line}:{})};}}if(Object.keys(alignments).length)clean.streamAlignments=alignments;}
  if(value.innerSide==="left"||value.innerSide==="right")clean.innerSide=value.innerSide;
  return clean;
}
window.addEventListener("message",async event=>{
  if(event.origin!==location.origin||event.source!==window.parent)return;
  const data=event.data||{};
  if(data.type==="vilna-agent-load"){
    state.agentSettings=safeAgentSettings(data.settings);state.agentSettingsRef=String(data.ref||"").trim();state.rashbamHeadingMode=data.rashbamHeadingMode||"unresolved";state.rashbamAllowed=data.rashbamAllowed!==false;$("dafRef").value=String(data.ref||"").trim();await loadDaf();
  }else if(data.type==="vilna-agent-adjust"){
    state.agentSettings={...state.agentSettings,...safeAgentSettings(data.settings)};await compose();
  }else if(data.type==="vilna-agent-set-rashbam-policy"){
    const next=["full","short","none","unresolved"].includes(data.headingMode)?data.headingMode:"unresolved";
    if(next!==state.rashbamHeadingMode){state.rashbamHeadingMode=next;await compose();}
  }
});
$("dafPage").addEventListener("input",e=>{if(!e.target.closest(".flow-region,.top-commentary"))return;state.dirty=true;status("Page edited directly. Choose Reflow page edits when ready.");requestAnimationFrame(renderGemaraLineNumbers);});window.addEventListener("resize",()=>{syncAnnotationCanvas();renderGemaraLineNumbers();if(!state.dirty&&!$("dafPage").classList.contains("composing"))requestAnimationFrame(()=>compose());});document.fonts.ready.then(async()=>{updateDisplayToggles();await applyTypography(state.typography,{recompose:false});if(new URLSearchParams(location.search).has("builder"))window.parent.postMessage({type:"vilna-agent-ready"},location.origin);else{const requested=new URLSearchParams(location.search).get("ref");if(requested&&registryEntry(requested))$("dafRef").value=requested;await loadDaf({automatic:true});}});
