/* Review every deck import before changing any saved phrase links. */
(()=>{
 'use strict';
 const el=id=>document.getElementById(id),api=window.VilnaLessonDeck;
 let pending=null,request=null;
 const baseURL=new URL('.',document.currentScript.src),pdfDocuments=new Map(),pdfURLs=new Map();
 const pdfRef=value=>String(value).match(/^vilna-pdf:([a-f0-9]{64}):([1-9][0-9]{0,3})$/);
 const message=text=>{el('lessonDeckStatus').textContent=text;};
 function openPDF(value){
  const match=pdfRef(value),doc=match&&pdfDocuments.get(match[1]),page=match&&Number(match[2]);
  if(!doc||page>doc.pageCount){message('The PDF for this link is missing. Open the saved project that contains it, or load the original PDF again.');return;}
  let url=pdfURLs.get(doc.id);
  if(!url){const binary=atob(doc.dataUrl.split(',')[1]),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));pdfURLs.set(doc.id,url);}
  window.open(url+'#page='+page,'_blank','noopener,noreferrer');
 }
 function referencedPDFs(){return new Set(Object.values(state.visualLinks||{}).flat().map(pdfRef).filter(Boolean).map(m=>m[1]));}
 function prunePDFs(){const keep=referencedPDFs();for(const id of pdfDocuments.keys())if(!keep.has(id)){if(pdfURLs.has(id))URL.revokeObjectURL(pdfURLs.get(id));pdfURLs.delete(id);pdfDocuments.delete(id);}}
 function restorePDFs(lesson){
  pdfURLs.forEach(url=>URL.revokeObjectURL(url));pdfURLs.clear();pdfDocuments.clear();let total=0;
  for(const [id,doc]of Object.entries(lesson?.pdfDocuments||{})){
   if(!/^[a-f0-9]{64}$/.test(id)||!doc||doc.id!==id||typeof doc.dataUrl!=='string'||!/^data:application\/pdf;base64,JVBERi0/.test(doc.dataUrl)||doc.dataUrl.length>90*1024*1024||!Number.isInteger(doc.pageCount)||doc.pageCount<1||doc.pageCount>150)continue;
   total+=doc.dataUrl.length;if(total>180*1024*1024)break;pdfDocuments.set(id,doc);
  }
 }
 // Keep the existing project format and add PDF bytes only for documents with attached pages.
 const originalPayload=projectPayload;projectPayload=function(){
  const payload=originalPayload(),ids=new Set(Object.values(state.visualLinks||{}).flat().map(pdfRef).filter(Boolean).map(m=>m[1]));
  const docs=[...pdfDocuments].filter(([id])=>ids.has(id));if(docs.length)payload.lesson.pdfDocuments=Object.fromEntries(docs);return payload;
 };
 const originalOpen=openProjectFile;openProjectFile=async function(file){const data=JSON.parse(await file.text());await originalOpen(file);restorePDFs(data.lesson);};
 const originalLoad=loadDaf;loadDaf=async function(...args){await originalLoad(...args);if(!Object.values(state.visualLinks||{}).flat().some(pdfRef))restorePDFs(null);};
 if(typeof restoreApprovedSnapshot==='function'){const originalRestore=restoreApprovedSnapshot;restoreApprovedSnapshot=async function(snapshot){await originalRestore(snapshot);restorePDFs(snapshot.project?.lesson);};}
 const originalOpenVisual=openPhraseVisual;openPhraseVisual=function(index=selectedPhraseIndex()){const links=visualLinksFor(index);if(links.length===1&&pdfRef(links[0]))return openPDF(links[0]);return originalOpenVisual(index);};
 function source(){return [...el('dafPage').querySelectorAll('.word-token[data-stream="gemara"]')].map(w=>{const clone=w.cloneNode(true);clone.querySelectorAll('.phrase-visual-icon').forEach(i=>i.remove());return {text:clone.textContent,wordId:w.dataset.wordId,phraseIndex:w.dataset.phraseIndex==null?null:Number(w.dataset.phraseIndex)};});}
 function signature(){return JSON.stringify([state.ref,activePhraseProfile,source()]);}
 function targetLabel(indices){return indices.map(i=>`Phrase ${i+1}: ${activePhraseProfile[i]||''}`).join(' / ');}
 function clear(){pending=null;el('lessonDeckReview').hidden=true;el('lessonDeckRows').replaceChildren();}
 function checkedTargets(row){return [...row.select.selectedOptions].filter(o=>o.value!=='').flatMap(o=>row.choices[Number(o.value)].phraseIndices);}
 function controls(row){const valid=checkedTargets(row).length>0;row.check.disabled=!valid;if(!valid)row.check.checked=false;row.quote.textContent=[...row.select.selectedOptions].filter(o=>o.value!=='').map(o=>row.choices[Number(o.value)].quote).join(' / ');}
 function show(deck,stamp){
  if(signature()!==stamp)throw Error('The daf changed while the deck was being read. Import it again on the intended daf.');
  clear();const rows=api.matchSlides(deck.slides,source());pending={stamp,rows:[]};
  el('lessonDeckTitle').textContent=`${deck.title} — ${rows.length} slides`;el('lessonDeckReview').hidden=false;
  for(const slide of rows){
   const box=document.createElement('section');box.className='lesson-slide-row';box.dataset.slideNumber=String(slide.number);
   const label=document.createElement('label');label.className='slide-include';const check=document.createElement('input');check.type='checkbox';check.setAttribute('aria-label',`Include slide ${slide.number}`);
   const link=document.createElement('a');link.href=pdfRef(slide.url)?'#':slide.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=`${pdfRef(slide.url)?'PDF page':'Slide'} ${slide.number}`;if(pdfRef(slide.url))link.addEventListener('click',e=>{e.preventDefault();openPDF(slide.url);});label.append(check,link);box.append(label);
   const text=document.createElement('p');text.className='status';text.dir='auto';text.textContent=slide.text.slice(0,400)||'No readable slide text';box.append(text);
   const reason=document.createElement('p');reason.className='status';reason.textContent=slide.reason;box.append(reason);
   const select=document.createElement('select');select.multiple=true;select.size=Math.min(3,Math.max(2,slide.choices.length));select.setAttribute('aria-label',`Phrases for slide ${slide.number}`);
   const choices=slide.choices.map(c=>({...c}));
   const row={slide,box,check,select,choices,quote:document.createElement('p')};row.quote.dir='auto';row.quote.className='slide-quote';
   function appendChoice(c,i){const o=document.createElement('option');o.value=String(i);o.textContent=targetLabel(c.phraseIndices);o.dir='auto';select.append(o);return o;}
   if(!choices.length){const o=document.createElement('option');o.value='';o.textContent='Choose a phrase on the daf';select.append(o);}
   choices.forEach((c,i)=>{const o=appendChoice(c,i);o.selected=i===slide.suggested;});check.checked=slide.suggested!=null;
   select.addEventListener('change',()=>{controls(row);if(!check.disabled)check.checked=true;});
   const use=document.createElement('button');use.type='button';use.className='button ghost';use.textContent='Use selected phrase';
   use.addEventListener('click',()=>{
    if(!pending||signature()!==pending.stamp){message('The daf changed. Import the deck again before assigning slides.');return;}
    const index=selectedPhraseIndex();if(index==null){message('Click a word in the Gemara, then choose Use selected phrase on its slide.');return;}
    let i=choices.findIndex(c=>c.phraseIndices.length===1&&c.phraseIndices[0]===index);
    if(i<0){i=choices.length;choices.push({phraseIndices:[index],quote:activePhraseProfile[index]});appendChoice(choices[i],i);}
    [...select.options].forEach(o=>o.selected=o.value===String(i));check.checked=true;controls(row);message(`Slide ${slide.number} is assigned to phrase ${index+1} for review.`);
   });
   box.append(select,row.quote,use);controls(row);el('lessonDeckRows').append(box);pending.rows.push(row);
  }
  const suggested=rows.filter(s=>s.suggested!=null).length;message(`${suggested} of ${rows.length} slides have proposed matches. Review the checked assignments, then choose Add reviewed slide links.`);
 }
 function ready(){if(!phraseNavigationAvailable)throw Error('Load a daf with Gemara text before importing slides.');return {deck:api.deckUrl(el('visualUrl').value.trim()),stamp:signature()};}
 el('importLessonDeck').addEventListener('click',async()=>{
  request?.abort();const current=new AbortController();request=current;el('importLessonDeck').disabled=true;clear();
  const timer=setTimeout(()=>current.abort(),22000);
  try{
   const {deck,stamp}=ready();message('Reading the deck’s slide text…');
   const response=await fetch('/api/lesson-slides/read',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:deck.url}),signal:current.signal});
   let data;try{data=await response.json();}catch{throw Error('Deck import is unavailable here. Use Load saved slide view instead.');}
   if(request!==current)return;if(!response.ok)throw Error(data.error||'Could not read the deck. Use Load saved slide view instead.');
   if(!Array.isArray(data.slides)||!data.slides.length||data.slides.length>150)throw Error('No readable slides were returned.');
   // Only canonical Google URLs derived from returned slide IDs become clickable.
   data.slides=data.slides.map((s,i)=>{if(!/^[-A-Za-z0-9_.]{1,200}$/.test(s.id)||typeof s.text!=='string'||s.text.length>30000)throw Error('The deck returned invalid slide data.');return {id:s.id,number:i+1,text:s.text,url:deck.url+'#slide=id.'+s.id};});
   show({...data,title:String(data.title||'Google Slides')},stamp);
  }catch(e){if(request===current)message(e.name==='AbortError'?'Deck reading stopped. Try again or load a saved slide view.':e.message);}finally{clearTimeout(timer);if(request===current){request=null;el('importLessonDeck').disabled=false;}}
 });
 el('lessonDeckFile').addEventListener('click',e=>{e.target.value='';});
 el('lessonDeckFile').addEventListener('change',async e=>{
  const file=e.target.files?.[0];if(!file)return;
  el('lessonDeckFileStatus').textContent=`Reading: ${file.name}`;
  request?.abort();request=null;el('importLessonDeck').disabled=false;clear();prunePDFs();
  try{
   if(!phraseNavigationAvailable)throw Error('Load a daf with Gemara text before importing slides.');const stamp=signature(),header=await file.slice(0,5).text();
   if(header==='%PDF-'){
    const {readPDF}=await import(new URL('lesson-pdf.mjs?build=62.64',baseURL).href);
    const pdf=await readPDF(file,(n,total)=>{el('lessonDeckFileStatus').textContent=`Reading ${file.name}: page ${n} of ${total}`;});
    if(signature()!==stamp)throw Error('The daf changed while the PDF was being read. Load it again on the intended daf.');
    const retained=[...pdfDocuments.values()].filter(d=>d.id!==pdf.document.id).reduce((n,d)=>n+d.dataUrl.length,0);
    if(retained+pdf.document.dataUrl.length>180*1024*1024)throw Error('This project already contains large PDFs. Save it and use a separate project for more PDF decks.');
    pdfDocuments.set(pdf.document.id,pdf.document);show(pdf,stamp);el('lessonDeckFileStatus').textContent=`Loaded: ${file.name} (${pdf.slides.length} PDF pages)`;
   }else{
    const {deck}=ready();if(file.size>api.MAX_HTML)throw Error('The saved slide view is too large (maximum 8 MB).');const text=await file.text();if(text.startsWith('PK'))throw Error('This is a PowerPoint or ZIP file. Download it as PDF, then choose that PDF here.');show(api.parseHtml(text,deck.url),stamp);el('lessonDeckFileStatus').textContent=`Loaded: ${file.name}`;
   }
  }catch(error){el('lessonDeckFileStatus').textContent=`Could not load ${file.name}: ${error.message}`;message(error.message);}
 });
 el('lessonDeckTextView').addEventListener('click',e=>{try{e.currentTarget.href=api.deckUrl(el('visualUrl').value.trim()).readUrl;}catch(error){e.preventDefault();message(error.message);}});
 el('applyLessonDeck').addEventListener('click',()=>{
  if(!pending)return;if(signature()!==pending.stamp){clear();message('The daf or phrase boundaries changed. Import the deck again before adding links.');return;}
  const planned=[];
  for(const row of pending.rows)if(row.check.checked)for(const index of new Set(checkedTargets(row))){if(!Number.isInteger(index)||!activePhraseProfile[index]){message('A phrase assignment is no longer valid. Import the deck again.');return;}planned.push({index,url:row.slide.url});}
  if(!planned.length){message('Choose at least one slide and its phrase before adding links.');return;}
  let added=0;for(const {index,url}of planned){const links=visualLinksFor(index);if(!links.includes(url)){state.visualLinks[index]=[...links,url];added++;}}
  renderPhraseVisualMarkers();updateVisualControls();clear();message(`${added} slide link${added===1?'':'s'} added. Use Save project to keep these assignments and any linked PDF.`);
 });
 el('cancelLessonDeck').addEventListener('click',()=>{clear();message('Import canceled. Existing links were kept.');});
 function openLinks(index){
  const list=el('lessonVisualLinks');list.replaceChildren();el('lessonVisualTitle').textContent=`Visuals for phrase ${index+1}`;
  visualLinksFor(index).forEach((value,i)=>{
   const match=pdfRef(value);if(match){const button=document.createElement('button');button.className='button secondary wide-button';button.textContent=`${pdfDocuments.get(match[1])?.name||'PDF'} — page ${match[2]}`;button.addEventListener('click',()=>openPDF(value));list.append(button);return;}
   let url;try{url=new URL(value);if(!/^https?:$/.test(url.protocol))return;}catch{return;}
   const a=document.createElement('a');a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';a.textContent=`Visual ${i+1} — ${url.href}`;list.append(a);
  });el('lessonVisualDialog').showModal();
 }
 el('closeLessonVisualDialog').addEventListener('click',()=>el('lessonVisualDialog').close());window.VilnaLessonDeckUI={openLinks};
})();
