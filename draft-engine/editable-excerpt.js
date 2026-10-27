/* Editable PowerPoint excerpt: each word stays native DrawingML text. */
(function(){
 'use strict';
 const BUILD='62.68',base=new URL('.',document.currentScript.src),button=document.createElement('button'),svgButton=document.getElementById('downloadExcerpt');let loading,busy=false;
 if(!svgButton||!window.VilnaExcerptExport)return;
 button.id='downloadEditablePptx';button.type='button';button.className='button secondary';button.textContent='Download editable PowerPoint';button.dataset.exportBuild=BUILD;
 button.title='One editable text box per word. Imports into Canva or PowerPoint. Selection edges include complete words.';
 svgButton.insertAdjacentElement('afterend',button);
 const help=document.createElement('p');help.className='status';help.textContent='Editable words for Canva/PowerPoint. Includes whole words at selection edges. If the font changes on import, use the font files below or choose another Hebrew font.';button.insertAdjacentElement('afterend',help);
 const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Font files for editable exports';details.append(summary);
 for(const [label,file]of [['Gemara: Drugulin CLM','DrugulinCLM-Bold.otf'],['Commentary: Mekorot','Mekorot-Regular.ttf'],['Bold commentary: Mekorot Bold','Mekorot-Bold.ttf']]){const p=document.createElement('p'),a=document.createElement('a');a.href=new URL('assets/fonts/'+file,base).href;a.download=file;a.textContent=label;p.append(a);details.append(p);}help.insertAdjacentElement('afterend',details);
 const sync=()=>{button.disabled=busy||svgButton.disabled||!state.selection;};new MutationObserver(sync).observe(svgButton,{attributes:true,attributeFilter:['disabled']});sync();
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
 async function create(snapshot){
  const Pptx=await library(),pptx=new Pptx(),margin=6,b=snapshot.bounds,width=b.width+margin*2,height=b.height+margin*2;
  pptx.defineLayout({name:'DAF_EXCERPT',width:width/96,height:height/96});pptx.layout='DAF_EXCERPT';pptx.author='Vilna Daf Studio';pptx.subject='Editable Hebrew excerpt';pptx.title=snapshot.ref+' — editable excerpt';pptx.lang='he-IL';pptx.theme={headFontFace:'Drugulin CLM',bodyFontFace:'Mekorot',lang:'he-IL'};
  const slide=pptx.addSlide();slide.background={color:'FFFEF9'};const fonts=new Set();
  for(const word of snapshot.words){
   const fontFace=face(word),hebrew=/[\u0590-\u05ff]/u.test(word.text),size=word.fontSize*.75;fonts.add(fontFace);
   const runs=word.parts.map(part=>({text:part.text,options:{color:part.visible?(word.whiteout?'D3CFC6':'080706'):'FFFEF9'}}));
   // The top of a native text line uses the font's ascent, not its visible ink.
   // Keeping words in independent, ungrouped boxes allows edits after import.
   const x=(word.rect.left-b.x+margin)/96,y=(word.baseline-word.fontAscent-b.y+margin)/96,w=(word.rect.width+1.5)/96,h=(word.fontAscent+word.fontDescent+2)/96;
   slide.addText(runs,{x,y,w,h,fontFace,fontSize:size,bold:fontFace==='Drugulin CLM'||word.fontWeight>=600,italic:word.italic,lang:hebrew?'he-IL':'en-US',rtlMode:hebrew,align:'left',valign:'top',margin:0,breakLine:false,wrap:false,fit:'none',paraSpaceAfter:0,paraSpaceBefore:0,lineSpacingMultiple:1,charSpacing:word.letterSpacing*.75,objectName:'word '+word.sourceId});
  }
  if(snapshot.annotations.length){
   const ann=vectorAnnotationMarkup(snapshot.annotations,{x:b.x-margin,y:b.y-margin,width,height});
   if(ann.body){const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs>${ann.defs}</defs>${ann.body}</svg>`,png=await VilnaExcerptExport.png(svg),data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('Could not retain the excerpt annotations.'));r.readAsDataURL(png);});slide.addImage({data,x:0,y:0,w:width/96,h:height/96,objectName:'Lesson annotations'});}
  }
  slide.addNotes(`Each word is a separate editable text box. Original reference: ${snapshot.ref}. Font names: ${[...fonts].join(', ')}. An editor may substitute unavailable fonts; load these fonts or select a different Hebrew font. Source nekudos remain Unicode text.`);
  return complexFonts(await pptx.write({outputType:'blob'}));
 }
 button.addEventListener('click',async()=>{
  if(busy||!state.selection)return;busy=true;sync();status('Preparing one editable text box per word…');
  try{await library();const snapshot=await VilnaExcerptExport.captureEditable(),blob=await create(snapshot);if(state.ref!==snapshot.ref||JSON.stringify(state.selection)!==JSON.stringify(snapshot.selection))throw Error('The selected excerpt changed. Select it again.');downloadBlob(blob,snapshot.ref.replace(/\s+/g,'-')+'-Editable.pptx');status(`Saved ${snapshot.words.length} editable words. Import the PowerPoint into Canva, or open it in PowerPoint. If a font changes, use the font files beside the export button.`);}
  catch(e){status('Could not export editable words: '+e.message,true);}finally{busy=false;sync();}
 });
 window.VilnaEditableExcerpt={build:BUILD,create,fontFace:face};
})();
