/* Editable PowerPoint excerpt: each word stays native DrawingML text. */
(function(){
 'use strict';
 const BUILD='62.77',base=new URL('.',document.currentScript.src),button=document.createElement('button'),svgButton=document.getElementById('downloadExcerpt');let loading,busy=false;
 if(!svgButton||!window.VilnaExcerptExport)return;
 button.id='downloadEditablePptx';button.type='button';button.className='button secondary';button.textContent='Download editable PowerPoint';button.dataset.exportBuild=BUILD;
 button.title='One editable text box per word. Imports into Canva or PowerPoint. Selection edges include complete words.';
 svgButton.insertAdjacentElement('afterend',button);
 const label=document.createElement('label');label.htmlFor='editableExportMode';label.textContent='Editable export fonts';
 const mode=document.createElement('select');mode.id='editableExportMode';
 for(const [value,text]of [['original','Original daf fonts — destination must have these fonts'],['shared','Experimental: Slides / Canva — Frank Ruhl Libre']]){const option=document.createElement('option');option.value=value;option.textContent=text;mode.append(option);}
 button.insertAdjacentElement('beforebegin',label);label.insertAdjacentElement('afterend',mode);
 const help=document.createElement('p');help.className='status';help.textContent='Experimental shared-font mode keeps separate editable words in their saved positions and fits Frank Ruhl Libre into each word box; the lettering differs from the daf, and imported layout must be checked. Original-font mode needs matching fonts in the destination. SVG/PNG preserve appearance as graphics. For Google Docs, use a linked Google slide and edit its source.';button.insertAdjacentElement('afterend',help);
 const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Font files for editable exports';details.append(summary);
 for(const [label,file]of [['Gemara: Drugulin CLM','DrugulinCLM-Bold.otf'],['Commentary: Mekorot','Mekorot-Regular.ttf'],['Bold commentary: Mekorot Bold','Mekorot-Bold.ttf']]){const p=document.createElement('p'),a=document.createElement('a');a.href=new URL('assets/fonts/'+file,base).href;a.download=file;a.textContent=label;p.append(a);details.append(p);}help.insertAdjacentElement('afterend',details);
 const sync=()=>{button.disabled=busy||svgButton.disabled||!state.selection;};new MutationObserver(sync).observe(svgButton,{attributes:true,attributeFilter:['disabled']});sync();
 let sharedFont;
 function loadSharedFont(){if(!sharedFont)sharedFont=(async()=>{const f=new FontFace('Vilna Export Frank Ruhl Libre',`url("${new URL('assets/fonts/FrankRuhlLibre-Variable.ttf',base).href}")`,{weight:'300 900'});await f.load();document.fonts.add(f);return f;})();return sharedFont;}
 function placement(snapshot,word,exportMode='original'){
  const b=snapshot.bounds,margin=6,fontFace=exportMode==='shared'?'Frank Ruhl Libre':face(word),bold=face(word)==='Drugulin CLM'||word.fontWeight>=600;
  let fontSize=word.fontSize,ascent=word.fontAscent,descent=word.fontDescent;
  if(exportMode==='shared'){
   const ctx=document.createElement('canvas').getContext('2d');ctx.font=`${word.italic?'italic ':''}${bold?700:400} ${fontSize}px "Vilna Export Frank Ruhl Libre"`;ctx.direction=/[\u0590-\u05ff]/u.test(word.text)?'rtl':'ltr';const measure=ctx.measureText(word.text),height=(measure.fontBoundingBoxAscent||fontSize*.8)+(measure.fontBoundingBoxDescent||fontSize*.2),factor=Math.min(1,word.rect.width*.94/Math.max(1,measure.width),(word.fontAscent+word.fontDescent)/Math.max(1,height));fontSize*=factor;ascent=(measure.fontBoundingBoxAscent||word.fontSize*.8)*factor;descent=(measure.fontBoundingBoxDescent||word.fontSize*.2)*factor;
  }
  return {fontFace,bold,fontSize:fontSize*.75,x:(word.rect.left-b.x+margin)/96,y:(word.baseline-ascent-b.y+margin)/96,w:(word.rect.width+1.5)/96,h:(ascent+descent+2)/96,align:exportMode==='shared'&&/[\u0590-\u05ff]/u.test(word.text)?'right':'left'};
 }
 function library(){
  if(window.PptxGenJS)return Promise.resolve(window.PptxGenJS);
  if(!loading)loading=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL('assets/vendor/pptxgenjs/pptxgen.bundle.js?v=4.0.1',base).href;script.onload=()=>window.PptxGenJS?resolve(window.PptxGenJS):reject(Error('The PowerPoint exporter did not load.'));script.onerror=()=>{script.remove();loading=null;reject(Error('The PowerPoint exporter could not be loaded. Try again.'));};document.head.append(script);});return loading;
 }
 function face(word){
  const list=word.fontFamily.split(',').map(s=>s.trim().replace(/^['"]|['"]$/g,''));
  for(const name of list){
   const faces=[...document.fonts].filter(f=>f.family.replace(/^['"]|['"]$/g,'')===name);
   if(faces.length&&!faces.some(f=>f.status==='loaded'))continue;
   if(name==='OT Vilna Local')return 'OT Vilna';if(name==='Vilna MF Local')return 'Vilna MF Medium Pro';
   if(/^(?:ui-|system-ui|serif|sans-serif|monospace)/i.test(name))return 'Arial';
   return name;
  }return 'Arial';
 }
 async function complexFonts(blob){
  // Latin, East Asian, and complex-script faces must agree. Otherwise importers
  // can silently replace the font for Hebrew even when the Latin face is set.
  const zip=await window.JSZip.loadAsync(await blob.arrayBuffer()),name='ppt/slides/slide1.xml',file=zip.file(name);if(!file)throw Error('Missing editable slide.');
  const doc=new DOMParser().parseFromString(await file.async('string'),'application/xml'),ns='http://schemas.openxmlformats.org/drawingml/2006/main';
  if(doc.querySelector('parsererror'))throw Error('Invalid editable slide.');
  for(const props of doc.getElementsByTagNameNS(ns,'rPr')){
   const latin=props.getElementsByTagNameNS(ns,'latin')[0];if(!latin)continue;
   for(const type of ['ea','cs']){let node=props.getElementsByTagNameNS(ns,type)[0];if(!node){node=doc.createElementNS(ns,'a:'+type);props.append(node);}node.setAttribute('typeface',latin.getAttribute('typeface'));}
  }
  for(const paragraph of doc.getElementsByTagNameNS(ns,'p')){const text=[...paragraph.getElementsByTagNameNS(ns,'t')].map(n=>n.textContent).join('');let props=paragraph.getElementsByTagNameNS(ns,'pPr')[0];if(!props){props=doc.createElementNS(ns,'a:pPr');paragraph.insertBefore(props,paragraph.firstChild);}props.setAttribute('rtl',/[\u0590-\u05ff]/u.test(text)?'1':'0');}
  zip.file(name,new XMLSerializer().serializeToString(doc));return zip.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.presentationml.presentation',compression:'DEFLATE'});
 }
 async function create(snapshot,{mode:exportMode="original"}={}){
  if(!["shared","original"].includes(exportMode))throw Error("Unknown editable export mode.");if(exportMode==="shared")await loadSharedFont();
  const Pptx=await library(),pptx=new Pptx(),margin=6,b=snapshot.bounds,width=b.width+margin*2,height=b.height+margin*2;
  pptx.defineLayout({name:'DAF_EXCERPT',width:width/96,height:height/96});pptx.layout='DAF_EXCERPT';pptx.author='Vilna Daf Studio';pptx.subject='Editable Hebrew excerpt';pptx.title=snapshot.ref+' — editable excerpt';pptx.lang='he-IL';pptx.theme={headFontFace:'Drugulin CLM',bodyFontFace:'Mekorot',lang:'he-IL'};
  const slide=pptx.addSlide();slide.background={color:'FFFEF9'};const fonts=new Set();
  for(const word of snapshot.words){
   const fitted=placement(snapshot,word,exportMode),fontFace=fitted.fontFace,hebrew=/[\u0590-\u05ff]/u.test(word.text),size=fitted.fontSize;fonts.add(fontFace);
   const runs=word.parts.map(part=>({text:part.text,options:{color:part.visible?(word.whiteout?'D3CFC6':'080706'):'FFFEF9'}}));
   // The top of a native text line uses the font's ascent, not its visible ink.
   // Keeping words in independent, ungrouped boxes allows edits after import.
   const {x,y,w,h}=fitted;
   slide.addText(runs,{x,y,w,h,fontFace,fontSize:size,bold:fitted.bold,italic:word.italic,lang:hebrew?'he-IL':'en-US',rtlMode:hebrew,align:fitted.align,valign:'top',margin:0,breakLine:false,wrap:false,fit:'none',paraSpaceAfter:0,paraSpaceBefore:0,lineSpacingMultiple:1,charSpacing:exportMode==='shared'?0:word.letterSpacing*.75,objectName:'word '+word.sourceId});
  }
  if(snapshot.annotations.length){
   const ann=vectorAnnotationMarkup(snapshot.annotations,{x:b.x-margin,y:b.y-margin,width,height});
   if(ann.body){const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs>${ann.defs}</defs>${ann.body}</svg>`,png=await VilnaExcerptExport.png(svg),data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('Could not retain the excerpt annotations.'));r.readAsDataURL(png);});slide.addImage({data,x:0,y:0,w:width/96,h:height/96,objectName:'Lesson annotations'});}
  }
  slide.addNotes(`Each word is a separate editable text box. Export mode: ${exportMode}. Shared mode uses Frank Ruhl Libre fitted to the original word cells; original lettering is not preserved. Google Docs can display a linked slide, edited in its source. Original reference: ${snapshot.ref}. Font names: ${[...fonts].join(', ')}. An editor may substitute unavailable fonts; load these fonts or select a different Hebrew font. Source nekudos remain Unicode text.`);
  return complexFonts(await pptx.write({outputType:'blob'}));
 }
 button.addEventListener('click',async()=>{
  if(busy||!state.selection)return;busy=true;sync();status('Preparing one editable text box per word…');
  try{await library();const snapshot=await VilnaExcerptExport.captureEditable(),blob=await create(snapshot,{mode:mode.value});if(state.ref!==snapshot.ref||JSON.stringify(state.selection)!==JSON.stringify(snapshot.selection))throw Error('The selected excerpt changed. Select it again.');downloadBlob(blob,snapshot.ref.replace(/\s+/g,'-')+(mode.value==='shared'?'-Slides-Canva.pptx':'-Editable.pptx'));status(`Saved ${snapshot.words.length} editable words using ${mode.value==='shared'?'Frank Ruhl Libre, fitted to saved word positions':'the original daf fonts'}. Import into Slides or Canva. Check the imported font before editing.`);}
  catch(e){status('Could not export editable words: '+e.message,true);}finally{busy=false;sync();}
 });
 window.VilnaEditableExcerpt={build:BUILD,create,fontFace:face,placement,loadSharedFont};
})();
