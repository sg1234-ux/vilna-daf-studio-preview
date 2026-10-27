/* Shared, self-contained excerpt exports. HarfBuzz preserves RTL/mark shaping. */
(function(){
 'use strict';
 const BUILD='62.67',base=new URL('.',document.currentScript.src),fontCache=new Map();let hbPromise;
 const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
 const hb=()=>hbPromise||(hbPromise=import(new URL('assets/vendor/harfbuzz/index.mjs',base).href));
 async function fontFor(cs){
  const families=cs.fontFamily.split(',').map(s=>s.trim().replace(/^['"]|['"]$/g,''));
  for(const family of families){
   const faces=[...document.fonts].filter(f=>f.family.replace(/^['"]|['"]$/g,'')===family);
   if(!faces.some(f=>f.status==='loaded')){if(!faces.length)return null;continue;}
   const file=family==='Drugulin CLM'?'DrugulinCLM-Bold.otf':family==='Mekorot'?(Number(cs.fontWeight)>=600?'Mekorot-Bold.ttf':'Mekorot-Regular.ttf'):null;
   if(!file)return null;
   if(!fontCache.has(file))fontCache.set(file,(async()=>{const h=await hb(),response=await fetch(new URL('assets/fonts/'+file,base));if(!response.ok)throw Error('The export font could not be loaded.');const blob=new h.Blob(await response.arrayBuffer()),face=new h.Face(blob),font=new h.Font(face);font.setScale(face.upem,face.upem);return {font,face,blob,upem:face.upem,paths:new Map(),family};})().catch(e=>{fontCache.delete(file);throw e;}));
   return fontCache.get(file);
  }
  return null;
 }
 function readText(element){
  let text='',visible=[];const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest('.phrase-visual-icon')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
  while(walker.nextNode()){const node=walker.currentNode,shown=getComputedStyle(node.parentElement).visibility!=='hidden';text+=node.data;visible.push(...Array(node.data.length).fill(shown));}
  return {text,visible};
 }
 function baseline(element){
  const probe=document.createElement('span');Object.assign(probe.style,{display:'inline-block',width:'0',height:'0',padding:'0',margin:'0',border:'0',lineHeight:'0',verticalAlign:'baseline'});element.append(probe);const y=probe.getBoundingClientRect().top;probe.remove();return y;
 }
 function rectFor(element){if(element.classList.contains('word-token'))return element.getBoundingClientRect();const range=document.createRange();range.selectNodeContents(element);const rects=[...range.getClientRects()].filter(r=>r.width>.1&&r.height>.1);return rects.length===1?rects[0]:element.getBoundingClientRect();}
 function paintStyle(element,cs,factor=1){
  if(element.classList.contains('word-whited-out'))return `fill="none" stroke="#d3cfc6" stroke-width="${.35/factor}"`;
  // Navigation/reading selection colors do not become permanent lesson highlights.
  return `fill="${xml(element.classList.contains('word-token')?'#080706':cs.color)}"`;
 }
 async function outline(element,cs,content,rect,y,selection,zoom){
  const loaded=await fontFor(cs);if(!loaded)return null;
  const h=await hb(),buffer=new h.Buffer();buffer.addText(content.text);buffer.guessSegmentProperties();h.shape(loaded.font,buffer);
  const glyphs=buffer.getGlyphInfosAndPositions(),size=parseFloat(cs.fontSize),factor=size/loaded.upem,spacing=parseFloat(cs.letterSpacing)||0,clusters=new Set(glyphs.map(g=>g.cluster)),advance=glyphs.reduce((n,g)=>n+(g.xAdvance||0),0)*factor+spacing*clusters.size;
  if(!(advance>0))return '';
  const stretch=rect.width/advance;if(stretch<.8||stretch>1.2)return null;
  let cursor=0,previousCluster=null,extra=0;const paths=[];
  for(const glyph of glyphs){
   if(previousCluster!==null&&previousCluster!==glyph.cluster)extra+=spacing;
   previousCluster=glyph.cluster;
   if(content.visible[glyph.cluster]!==false){
    if(!loaded.paths.has(glyph.codepoint))loaded.paths.set(glyph.codepoint,loaded.font.glyphToPath(glyph.codepoint));
    const d=loaded.paths.get(glyph.codepoint);if(d)paths.push(`<path transform="translate(${cursor+(glyph.xOffset||0)+extra/factor} ${glyph.yOffset||0})" d="${xml(d)}"/>`);
   }
   cursor+=glyph.xAdvance||0;
  }
  const x=rect.left-selection.x,top=y-selection.y;
  return `<g data-export-font="${xml(loaded.family)}" transform="translate(${x} ${top}) scale(${factor*stretch} ${-factor})" ${paintStyle(element,cs,factor)}>${paths.join('')}</g>`;
 }
 function rasterWord(element,cs,content,rect,y,selection){
  // System/local fonts cannot be extracted from the browser. Keep their actual
  // browser appearance in an embedded high-resolution image instead of replacing them.
  const scale=4,pad=4,size=parseFloat(cs.fontSize),canvas=document.createElement('canvas');canvas.width=Math.ceil((rect.width+pad*2)*scale);canvas.height=Math.ceil((size*2+pad*2)*scale);const ctx=canvas.getContext('2d');ctx.scale(scale,scale);
  ctx.font=`${cs.fontStyle} ${cs.fontWeight} ${size}px ${cs.fontFamily}`;ctx.direction=/[\u0590-\u05ff]/u.test(content.text)?'rtl':'ltr';ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fontKerning=cs.fontKerning;ctx.letterSpacing=cs.letterSpacing;
  const metrics=ctx.measureText(content.text),natural=metrics.width||rect.width;ctx.translate(pad,pad+size);ctx.scale(rect.width/natural,1);
  if(element.classList.contains('word-whited-out')){ctx.strokeStyle='#d3cfc6';ctx.lineWidth=.35;ctx.strokeText(content.text,0,0);}else{ctx.fillStyle=element.classList.contains('word-token')?'#080706':cs.color;ctx.fillText(content.text,0,0);}
  // Hidden punctuation occupies its original slot but must not be painted.
  for(const hidden of element.querySelectorAll('.display-punctuation,.display-dash'))if(getComputedStyle(hidden).visibility==='hidden'){
   const hr=hidden.getBoundingClientRect(),er=element.getBoundingClientRect(),sx=er.width/rect.width;ctx.clearRect((hr.left-er.left)/sx,-size*1.3,hr.width/sx,size*2);
  }
  return `<image x="${rect.left-selection.x-pad}" y="${y-selection.y-size-pad}" width="${canvas.width/scale}" height="${canvas.height/scale}" href="${canvas.toDataURL('image/png')}"/>`;
 }
 async function svg(){
  if(!state.selection)return null;
  const selection={...state.selection},ref=state.ref,page=document.getElementById('dafPage');await document.fonts.ready;
  // Initialize before measuring: exporting must never depend on a font fetch race.
  await hb();if(state.ref!==ref||JSON.stringify(state.selection)!==JSON.stringify(selection))throw Error('The selected excerpt changed. Select it again.');
  const pageRect=page.getBoundingClientRect(),zoom=normalizedPageZoom(state.pageZoom),targets=[document.getElementById('dafNumber'),document.getElementById('chapterTitle'),...page.querySelectorAll('.word-token,.tosafot-notice,.gemara-line-number')],items=[];
  for(const element of targets){
   if(!element||getComputedStyle(element).visibility==='hidden')continue;
   const r=rectFor(element),rect={left:(r.left-pageRect.left)/zoom,right:(r.right-pageRect.left)/zoom,top:(r.top-pageRect.top)/zoom,bottom:(r.bottom-pageRect.top)/zoom,width:r.width/zoom};
   if(rect.right<=selection.x||rect.left>=selection.x+selection.width||rect.bottom<=selection.y||rect.top>=selection.y+selection.height)continue;
   const content=readText(element);if(!content.text.trim())continue;
   const cs=getComputedStyle(element),y=(baseline(element)-pageRect.top)/zoom;
   items.push(await outline(element,cs,content,rect,y,selection,zoom)??rasterWord(element,cs,content,rect,y,selection));
  }
  if(state.ref!==ref||JSON.stringify(state.selection)!==JSON.stringify(selection))throw Error('The selected excerpt changed. Select it again.');
  const annotations=vectorAnnotationMarkup(state.annotations||[],selection),margin=6,w=selection.width+margin*2,height=selection.height+margin*2;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${height}" viewBox="0 0 ${w} ${height}" data-excerpt-export="${BUILD}"><defs><clipPath id="excerpt-clip"><rect x="${margin}" y="${margin}" width="${selection.width}" height="${selection.height}"/></clipPath>${annotations.defs}</defs><rect width="100%" height="100%" fill="#fffef9"/><g clip-path="url(#excerpt-clip)"><g transform="translate(${margin} ${margin})">${items.join('')}${annotations.body}</g></g></svg>`;
 }
 function png(markup){return new Promise((resolve,reject)=>{const image=new Image(),url=URL.createObjectURL(new Blob([markup],{type:'image/svg+xml'}));image.onload=()=>{try{const canvas=document.createElement('canvas');const root=new DOMParser().parseFromString(markup,'image/svg+xml').documentElement,w=Number(root.getAttribute('width')),h=Number(root.getAttribute('height'));canvas.width=Math.ceil(w*4);canvas.height=Math.ceil(h*4);const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0,w*4,h*4);canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Could not create the excerpt PNG.')),'image/png');}catch(e){reject(e);}finally{URL.revokeObjectURL(url);}};image.onerror=()=>{URL.revokeObjectURL(url);reject(Error('Could not render the exported excerpt.'));};image.src=url;});}
 async function run(kind){
  if(!state.selection)return;
  const ids=['downloadExcerpt','downloadExactPng','copyExcerpt'];ids.forEach(id=>{if(document.getElementById(id))document.getElementById(id).disabled=true;});status('Preparing the excerpt with its displayed Hebrew font and nekudos…');
  try{const markup=await svg();if(!markup)return;const name=state.ref.replace(/\s+/g,'-');
   if(kind==='svg'){downloadBlob(new Blob([markup],{type:'image/svg+xml'}),name+'-Canva.svg');status('SVG excerpt saved with Hebrew shaping and nekudos preserved.');}
   else{const blob=await png(markup);if(kind==='copy'){try{await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);status('Excerpt copied at 4× resolution with its font and nekudos preserved.');}catch{downloadBlob(blob,name+'-Exact-Slide.png');status('Clipboard access is unavailable. The matching excerpt PNG was downloaded.');}}else{downloadBlob(blob,name+'-Exact-Slide.png');status('Excerpt PNG saved at 4× resolution with its font and nekudos preserved.');}}
  }catch(e){status('Could not export this excerpt: '+e.message,true);}finally{ids.forEach(id=>{if(document.getElementById(id))document.getElementById(id).disabled=!state.selection;});}
 }
 const replacements={downloadExcerpt:()=>run('svg'),downloadExactPng:()=>run('png'),copyExcerpt:()=>run('copy')};
 for(const [id,handler]of Object.entries(replacements)){const button=document.getElementById(id);if(!button)continue;button.removeEventListener('click',window[id]);window[id]=handler;button.addEventListener('click',handler);button.dataset.exportBuild=BUILD;}
 async function captureEditable(){
  if(!state.selection)throw Error('Select an excerpt first.');await document.fonts.ready;
  const selection={...state.selection},ref=state.ref,page=document.getElementById('dafPage'),pageRect=page.getBoundingClientRect(),zoom=normalizedPageZoom(state.pageZoom),words=[];
  const targets=[document.getElementById('dafNumber'),document.getElementById('chapterTitle'),...page.querySelectorAll('.word-token,.tosafot-notice,.gemara-line-number')];
  for(const element of targets){
   if(!element||getComputedStyle(element).visibility==='hidden')continue;
   const entries=[];
   if(element.classList.contains('word-token'))entries.push({content:readText(element),rect:rectFor(element),owner:element,id:element.dataset.wordId});
   else{const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);let index=0;while(walker.nextNode()){const node=walker.currentNode;if(node.parentElement.closest('.phrase-visual-icon'))continue;for(const match of node.data.matchAll(/\S+/gu)){const range=document.createRange();range.setStart(node,match.index);range.setEnd(node,match.index+match[0].length);entries.push({content:{text:match[0],visible:Array(match[0].length).fill(getComputedStyle(node.parentElement).visibility!=='hidden')},rect:range.getBoundingClientRect(),owner:node.parentElement,id:(element.id||'label')+':'+index++});}}}
   for(const entry of entries){
    const r=entry.rect,rect={left:(r.left-pageRect.left)/zoom,right:(r.right-pageRect.left)/zoom,top:(r.top-pageRect.top)/zoom,bottom:(r.bottom-pageRect.top)/zoom,width:r.width/zoom,height:r.height/zoom};
    if(rect.right<=selection.x||rect.left>=selection.x+selection.width||rect.bottom<=selection.y||rect.top>=selection.y+selection.height)continue;
    const content=entry.content;if(!content.text.trim())continue;
    const cs=getComputedStyle(entry.owner),probe=document.createElement('canvas').getContext('2d');probe.font=`${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;const metrics=probe.measureText(content.text),ascent=metrics.fontBoundingBoxAscent||parseFloat(cs.fontSize)*.8,descent=metrics.fontBoundingBoxDescent||parseFloat(cs.fontSize)*.2;
    const parts=[];for(let i=0;i<content.text.length;i++){const visible=content.visible[i],last=parts.at(-1);if(last&&last.visible===visible)last.text+=content.text[i];else parts.push({text:content.text[i],visible});}
    words.push({text:content.text,parts,rect,baseline:element.classList.contains('word-token')?(baseline(element)-pageRect.top)/zoom:rect.top+(rect.height-ascent-descent)/2+ascent,fontAscent:ascent,fontDescent:descent,fontSize:parseFloat(cs.fontSize),fontFamily:cs.fontFamily,fontWeight:Number(cs.fontWeight)||400,italic:cs.fontStyle==='italic',letterSpacing:parseFloat(cs.letterSpacing)||0,whiteout:element.classList.contains('word-whited-out'),sourceId:entry.id||'label',stream:element.dataset.stream||'label'});
   }
  }
  if(!words.length)throw Error('Select an excerpt containing text.');
  // Editable text cannot contain half a word. Extend only to the edges of words
  // already intersecting the selection; do not pull in neighboring words.
  const bounds={x:Math.min(selection.x,...words.map(w=>w.rect.left)),y:Math.min(selection.y,...words.map(w=>Math.min(w.rect.top,w.baseline-w.fontAscent)))};
  bounds.width=Math.max(selection.x+selection.width,...words.map(w=>w.rect.right))-bounds.x;
  bounds.height=Math.max(selection.y+selection.height,...words.map(w=>Math.max(w.rect.bottom,w.baseline+w.fontDescent)))-bounds.y;
  return {ref,selection,bounds,words,annotations:structuredClone(state.annotations||[])};
 }
 window.canvaExcerptSvg=svg;window.VilnaExcerptExport={build:BUILD,svg,png,captureEditable};
})();
