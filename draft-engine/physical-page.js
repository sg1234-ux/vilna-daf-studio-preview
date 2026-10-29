(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.VilnaPhysicalPage=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const names=['gemara','rashi','rashbam','tosafot'],logical=n=>n==='rashi'||n==='rashbam'?'inner':n;
 const norm=s=>String(s).normalize('NFD').replace(/[\u0591-\u05c7]/g,'').replace(/[^\u05d0-\u05ea]/g,'');
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function pointed(line,stream){
  const source=displayTokens(line,stream).map(group=>group.map(t=>t.sourceText).join(' ')),words=line.displayText.split(/(\s+)/);let i=0;
  return words.map(word=>{if(!word.trim())return word;const original=source[i++];if(!original||norm(original)!==norm(word))return word;
   const letters=[...original.normalize('NFD').matchAll(/[\u05d0-\u05ea][\u0591-\u05bd\u05bf-\u05c2\u05c4\u05c5\u05c7]*/gu)].map(m=>m[0]);let j=0;
   return word.replace(/[\u05d0-\u05ea][\u0591-\u05bd\u05bf-\u05c2\u05c4\u05c5\u05c7]*/gu,()=>letters[j++]);
  }).join('');
 }
 function activeNames(model){return names.filter(n=>model.streams?.[n]);}
 function displayTokens(line,stream){
  const [start,end]=line.sourceSpan,groups=stream.tokens.slice(start,end).map(t=>[t]);let offset=0;
  for(const v of line.printVariants||[]){const [a,b]=v.sourceWordSpan,tokens=stream.tokens.slice(a,b);groups.splice(a-start+offset,b-a,...v.printedWords.map(()=>tokens));offset+=v.printedWords.length-(b-a);}
  return groups;
 }
 function audit(model){
  const errors=[];if(model?.format!=='vilna-prepared-physical-page'||model.version!==1)return ['Invalid physical-page instructions'];
  if(!model.streams?.gemara||!model.streams?.tosafot||!model.streams?.rashi&&!model.streams?.rashbam)return ['Missing prepared text streams'];
  for(const name of activeNames(model)){const s=model.streams[name];if(!s.tokens?.length||!s.lines?.length){errors.push(name+' missing source');continue;}
   let cursor=s.previousSourceSpan?.[1]||0;const ids=new Set;
   if(s.previousSourceSpan&&(s.previousSourceSpan[0]!==0||!s.printedOnPreviousAmud))errors.push(name+' undocumented preceding source');
   for(const l of s.lines){const [a,b]=l.sourceSpan||[];if(a!==cursor||!Number.isInteger(b)||b<=a||b>s.tokens.length)errors.push(name+' incomplete spans');cursor=b;
    if(!Array.isArray(l.lineBox)||l.lineBox.length!==4||l.lineBox.some(v=>!Number.isFinite(v))||l.lineBox[0]>=l.lineBox[2]||l.lineBox[1]>=l.lineBox[3])errors.push(name+' invalid line box');
    const printed=l.displayText.split(/\s+/).filter(Boolean);if(norm(printed[0])!==norm(l.firstWord)||norm(printed.at(-1))!==norm(l.lastWord))errors.push(name+' endpoint mismatch');
    let words=s.tokens.slice(a,b).map(t=>norm(t.sourceText)),offset=0;
    for(const v of l.printVariants||[]){const [x,y]=v.sourceWordSpan||[];if(x<a||y>b||y<x||JSON.stringify(s.tokens.slice(x,y).map(t=>norm(t.sourceText)))!==JSON.stringify(v.sourceWords))errors.push(name+' invalid print variant');words.splice(x-a+offset,y-x,...v.printedWords);offset+=v.printedWords.length-(y-x);}
    if(l.editionVariant)words=(s.tokens.slice(a,b).map(t=>t.sourceText).join(' ').replace(l.editionVariant.source,l.editionVariant.printed)).split(/\s+/).map(norm);
    if(words.join('')!==norm(l.displayText))errors.push(name+' display/source mismatch');
   }
   for(const t of s.tokens){if(ids.has(t.sourceWordId))errors.push(name+' duplicate source');ids.add(t.sourceWordId);}
   for(const field of ['deferredSourceSpan','unprintedDuplicateSourceSpan'])if(s[field]){const [a,b]=s[field];if(a!==cursor||b<=a||b>s.tokens.length)errors.push(name+' invalid '+field);cursor=b;if(field==='deferredSourceSpan'&&!s.deferredTo)errors.push(name+' undocumented continuation');if(field==='unprintedDuplicateSourceSpan'&&!s.unprintedDuplicateReason)errors.push(name+' undocumented duplicate');}
   if(cursor!==s.tokens.length)errors.push(name+' incomplete source');
  }
  for(const b of model.blocks||[])if(model.streams[b.stream]?.lines.filter(l=>l.block===b.id).length!==b.lineCount)errors.push(b.id+' line allocation');
  return [...new Set(errors)];
 }
 function source(model,name){return (model.streams[name]?.lines||[]).map(l=>l.displayText).join(' ');}
 function markDibbur(model,snapshot,borrowed={}){
  for(const name of ['rashi','rashbam','tosafot']){if(!model.streams[name])continue;
   const flagsFor=source=>{const ids=new Map(),flat=[];const visit=(v,path=[])=>{if(Array.isArray(v)){v.forEach((x,i)=>visit(x,[...path,i]));return;}const plain=String(v||'').replace(/<[^>]*>/g,' '),dash=plain.match(/[–—-]/u),count=dash?plain.slice(0,dash.index).split(/\s+/).filter(norm).length:0;plain.split(/\s+/).filter(norm).forEach((w,i)=>{ids.set(`${name}:${path.join('.')}:${i}`,i<count);flat.push(i<count);});};visit(source.streams?.[name]?.he);return {ids,flat};};
   const own=flagsFor(snapshot),others=new Map();
   for(const token of model.streams[name].tokens){const foreign=(token.nextAmud||token.incomingFromPreviousAmud)&&borrowed[token.ref];let flags=own;if(foreign){if(!others.has(token.ref))others.set(token.ref,flagsFor(foreign));flags=others.get(token.ref);}const id=token.originalSourceWordId||token.sourceWordId;token.dibbur=flags.ids.get(id)===true;if(foreign&&!flags.ids.has(id))token.dibbur=flags.flat[token.wordInNextAmud??Number(token.sourceWordId.split(':').at(-1))]===true;}
  }return model;
 }
 function pack(spec){const model=spec.renderInstructions,errors=audit(model);if(spec.preparationComplete!==true||errors.length)throw Error('Prepared page rejected: '+errors.join(', '));
  return {ref:spec.ref,profile:{source:'Saved scan instructions for '+spec.ref,prepared:true,physical:model,layout:{openingLines:4},typography:{pageHeight:1264}},source:{gemaraHtml:esc(source(model,'gemara')),rashiHtml:esc(source(model,'rashi')),rashbamHtml:esc(source(model,'rashbam')),tosafotHtml:esc(source(model,'tosafot'))}};
 }
 function render(model,{page,body,topLeft,topRight,settings,mode,nekudos=false}){
  const errors=audit(model);if(errors.length)throw Error(errors.join(', '));
  page.classList.add('prepared-physical');topLeft.replaceChildren();topRight.replaceChildren();body.replaceChildren();
  const scale=body.clientWidth/(model.coreBox[2]-model.coreBox[0]),height=(model.coreBox[3]-model.coreBox[1])*scale;
  body.style.height=height+'px';page.style.setProperty('--page-height',(height+105)+'px');
  const wordCounters={gemara:0,inner:0,tosafot:0};
  for(const [index,b] of model.blocks.entries()){
   const band=document.createElement('div'),region=document.createElement('div');band.className='geometry-band physical-band';region.className='flow-region reference-mapped '+(b.stream==='gemara'?'gemara':'commentary');region.dataset.stream=logical(b.stream);region.dataset.commentator=b.stream;region.dataset.band=String(index);region.contentEditable=mode==='edit';region.spellcheck=false;
   region.style.padding='0';region.style.margin='0';
   const [x,y,x2,y2]=b.box;Object.assign(band.style,{left:(x-model.coreBox[0])*scale+'px',top:(y-model.coreBox[1])*scale+'px',width:(x2-x)*scale+'px',height:(y2-y)*scale+'px'});band.append(region);body.append(band);
   for(const l of model.streams[b.stream].lines.filter(l=>l.block===b.id)){
    const el=document.createElement('span');el.className='mapped-line';el.dataset.preparedLine=String(l.line);el.dataset.preparedRole=l.role||'text';el.dataset.commentator=b.stream;el.dataset.defaultAlign=l.alignment;el.dataset.sourceSpan=l.sourceSpan.join(':');el.dataset.preparedText=l.displayText;
    const pitch=(l.lineBox[3]-l.lineBox[1])*scale;Object.assign(el.style,{height:pitch+'px',lineHeight:pitch+'px',fontSize:(b.stream==='gemara'?19:15)*scale+'px',textAlign:l.alignment,textAlignLast:l.alignment});
    if(l.leftInsetPixels&&l.leftInsetPixels<x2-x){el.style.paddingLeft=l.leftInsetPixels*scale+'px';el.dataset.preparedInset=el.style.paddingLeft;}
    el.dataset.physicalFont=String((b.stream==='gemara'?19:15)*scale*(b.stream==='gemara'?(settings.gemaraScale||1):(settings.commentaryScale||1)));
    const display=nekudos?pointed(l,model.streams[b.stream]):l.displayText,parts=display.split(/(\s+)/),groups=displayTokens(l,model.streams[b.stream]);let sourceIndex=0;
    if(l.lineBox[0]!==x||l.lineBox[2]!==x2){el.style.width=(l.lineBox[2]-l.lineBox[0])*scale+'px';el.style.marginLeft=(l.lineBox[0]-x)*scale+'px';}
    for(const part of parts){if(!part)continue;if(/^\s+$/.test(part)){el.append(part);continue;}const group=groups[sourceIndex++]||[],token=group[0],span=document.createElement('span');span.className='layout-token';span.dataset.wordId=logical(b.stream)+':'+wordCounters[logical(b.stream)]++;span.dataset.stream=logical(b.stream);span.dataset.sourceWordId=token?.sourceWordId||'';span.dataset.sourceWordIds=JSON.stringify(group.map(t=>t.sourceWordId));if(token?.dibbur){span.dataset.dibbur='true';span.style.fontWeight='700';}span.textContent=part;el.append(span);}
    for(const diagram of model.diagrams||[])if(diagram.stream===b.stream&&diagram.line===l.line&&diagram.anchorAfterSourceWordId){const anchor=[...el.children].find(word=>word.dataset.sourceWordIds&&JSON.parse(word.dataset.sourceWordIds).includes(diagram.anchorAfterSourceWordId));if(anchor){const gap=document.createElement('span');gap.className='physical-diagram-gap';gap.style.display='inline-block';gap.style.width=(diagram.textExclusionBox[2]-diagram.textExclusionBox[0])*scale+'px';anchor.after(gap);}}
    region.append(el);
   }
  }
  for(const diagram of model.diagrams||[]){const d=document.createElement('div');d.className='physical-diagram';d.dataset.diagramId=diagram.id;d.setAttribute('aria-label','Commentary triangle diagram');const [x,y,x2,y2]=diagram.box,w=(x2-x)*scale,h=(y2-y)*scale;Object.assign(d.style,{position:'absolute',left:(x-model.coreBox[0])*scale+'px',top:(y-model.coreBox[1])*scale+'px',width:w+'px',height:h+'px',pointerEvents:'none'});const points=diagram.shape==='inverted-triangle'?[[1,1],[w-1,1],[w/2,h-1]]:[[w/2,1],[w-1,h-1],[1,h-1]];points.forEach(([x,y],i)=>{const [tx,ty]=points[(i+1)%3],edge=document.createElement('div');Object.assign(edge.style,{position:'absolute',left:x+'px',top:y+'px',width:Math.hypot(tx-x,ty-y)+'px',borderTop:'1px solid currentColor',transformOrigin:'left center',transform:'rotate('+Math.atan2(ty-y,tx-x)+'rad)'});d.append(edge);});body.append(d);}
  for(const t of model.titles||[]){const el=document.createElement('div');el.className='physical-title';el.textContent=t.text;const [x,y,x2,y2]=t.box;Object.assign(el.style,{left:(x-model.coreBox[0])*scale+'px',top:(y-model.coreBox[1])*scale+'px',width:(x2-x)*scale+'px',height:(y2-y)*scale+'px',fontSize:18*scale+'px'});body.append(el);}
  apply(settings,page);if(globalThis.VilnaTextFormatting)VilnaTextFormatting.apply(page,settings);fit(page);return {scale,height};
 }
 function fit(page){for(const line of page.querySelectorAll('.physical-band .mapped-line')){
  line.style.fontSize=line.dataset.physicalFont+'px';
  line.style.letterSpacing='0';line.style.fontStretch='normal';line.style.transform='';line.style.width='';
  // Word boundaries are fixed. Fit the font size to the measured cell if necessary.
  const span=document.createElement('span');span.style.whiteSpace='nowrap';span.innerHTML=line.innerHTML;span.style.display='inline-block';line.append(span);const width=span.getBoundingClientRect().width,available=line.clientWidth-parseFloat(line.style.paddingLeft||0);span.remove();
  const rowScale=line.getBoundingClientRect().width/Math.max(1,line.clientWidth),tallest=Math.max(1,...[...line.querySelectorAll(':scope > .layout-token,:scope > .word-token')].map(word=>word.getBoundingClientRect().height/rowScale));const factor=Math.max(.1,Math.min(1,available/Math.max(1,width),(line.clientHeight-.5)/tallest));if(factor<1)line.style.fontSize=(parseFloat(line.style.fontSize)*factor)+'px';for(let attempt=0;attempt<5&&line.scrollWidth>line.clientWidth+.5;attempt++)line.style.fontSize=(parseFloat(line.style.fontSize)*line.clientWidth/line.scrollWidth*.995)+'px';line.dataset.physicalFit=String(parseFloat(line.style.fontSize)/Number(line.dataset.physicalFont));
 }}
 function apply(settings,page){
  const gem=[...page.querySelectorAll('[data-stream="gemara"] > .mapped-line:not([data-prepared-role="next-amud-preview"])')];
  for(const line of page.querySelectorAll('.physical-band .mapped-line')){line.style.textAlign=line.dataset.defaultAlign;line.style.textAlignLast=line.dataset.defaultAlign;line.style.paddingLeft=line.dataset.preparedInset||'';}
  if(settings.gemaraAlignment){const target=settings.gemaraAlignmentLine?gem[settings.gemaraAlignmentLine-1]:gem.at(-1);if(target){target.style.paddingLeft='0';target.style.textAlign=target.style.textAlignLast=settings.gemaraAlignment==='natural'?'start':settings.gemaraAlignment;}}
  for(const n of ['inner','tosafot']){const rule=settings.streamAlignments?.[n];if(rule){const lines=[...page.querySelectorAll(`[data-stream="${n}"] > .mapped-line:not([data-prepared-role="next-amud-preview"])`)];const target=rule.line?lines[rule.line-1]:lines.at(-1);if(target){target.style.paddingLeft='0';target.style.textAlign=target.style.textAlignLast=rule.alignment;}}}
 }
 const validStream=s=>['gemara','rashi','rashbam','tosafot','inner'].includes(s),validLine=n=>Number.isInteger(n)&&n>0&&n<=200;
 function sanitizeEdits(raw){
  const out={};if(!raw||typeof raw!=='object')return out;
  if(Array.isArray(raw.baselineAnchors))out.baselineAnchors=raw.baselineAnchors.slice(0,12).filter(a=>a&&validStream(a.stream)&&validLine(a.line)&&validStream(a.referenceStream)&&validLine(a.referenceLine)&&a.stream!==a.referenceStream).map(a=>({stream:a.stream,line:a.line,referenceStream:a.referenceStream,referenceLine:a.referenceLine}));
  if(Array.isArray(raw.separateLines))out.separateLines=raw.separateLines.slice(0,12).filter(a=>a&&validStream(a.stream)&&validLine(a.line)&&validLine(a.previousLine)&&a.line===a.previousLine+1).map(a=>({stream:a.stream,line:a.line,previousLine:a.previousLine}));
  if(Array.isArray(raw.continuousStreams))out.continuousStreams=[...new Set(raw.continuousStreams.filter(validStream))];
  return out;
 }
 function lines(page,stream){return [...page.querySelectorAll(stream==='inner'?'[data-stream="inner"] > .mapped-line':`[data-commentator="${stream}"] > .mapped-line`)];}
 function baseline(el){const probe=document.createElement('span');Object.assign(probe.style,{display:'inline-block',width:'0',height:'0',padding:'0',margin:'0',verticalAlign:'baseline'});el.append(probe);const y=probe.getBoundingClientRect().top;probe.remove();return y;}
 function settle(model,page,settings={}){
  const body=page.querySelector('.body-geometry'),zoom=body.getBoundingClientRect().width/body.clientWidth||1;
  const defaults=sanitizeEdits(model.displayCorrections),edits=sanitizeEdits(settings.physicalEdits),errors=[];
  const move=(els,delta)=>{for(const el of els)el.style.position='relative',el.style.top=(parseFloat(el.style.top||0)+delta)+'px';};
  const anchors=new Map((defaults.baselineAnchors||[]).map(a=>[a.stream,a]));for(const a of edits.baselineAnchors||[])anchors.set(a.stream,a);
  for(const a of anchors.values()){
   const own=lines(page,a.stream),ref=lines(page,a.referenceStream)[a.referenceLine-1],target=own[a.line-1];
   if(!target||!ref){errors.push('Requested baseline line is unavailable');continue;}
   move(own,(baseline(ref)-baseline(target))/zoom);
  }
  for(const stream of new Set([...(defaults.continuousStreams||[]),...(edits.continuousStreams||[])])){
   const own=lines(page,stream).filter(l=>l.dataset.preparedRole!=='next-amud-preview'),last=own.at(-1),previous=own.at(-2);
   if(!last||!previous){errors.push('Requested continuation has no preceding line');continue;}
   if(last.parentElement!==previous.parentElement){const delta=(baseline(previous)+previous.getBoundingClientRect().height-baseline(last))/zoom;
    const all=lines(page,stream),index=all.indexOf(last);move(all.slice(index),delta);
   }
  }
  for(const a of edits.separateLines||[]){const own=lines(page,a.stream),el=own[a.line-1],previous=own[a.previousLine-1];
   if(!el||!previous){errors.push('Requested spacing line is unavailable');continue;}
   const delta=(baseline(previous)+previous.getBoundingClientRect().height-baseline(el))/zoom;if(delta>0)move(own.slice(a.line-1),delta);
  }
  return errors;
 }
 function review(note,target,settings={}){
  const text=String(note).toLowerCase(),stream=s=>/gemar|gemor/.test(s)?'gemara':/rashbam/.test(s)?'rashbam':/rashi/.test(s)?'rashi':'tosafot';
  const changes={},old=sanitizeEdits(settings.physicalEdits),edits={...old};let summary='';
  const refs=[...text.matchAll(/line\s+(\d{1,3})\s+(?:of\s+)?(gemara|gemora|gemorah|rashi|rashbam|tosafos|tosafot|tosfos)|(gemara|gemora|gemorah|rashi|rashbam|tosafos|tosafot|tosfos)\s+line\s+(\d{1,3})/g)].map(m=>({stream:stream(m[2]||m[3]),line:Number(m[1]||m[4])}));
  if(/par+al+el|same (?:height|level|baseline)|align.+(?:with|to)|level with/.test(text)&&refs.length===2&&refs[0].stream!==refs[1].stream){
   const [a,b]=refs;edits.baselineAnchors=[...(old.baselineAnchors||[]).filter(x=>x.stream!==a.stream),{...a,referenceStream:b.stream,referenceLine:b.line}];summary=`Place ${a.stream} line ${a.line} on the same baseline as ${b.stream} line ${b.line}.`;
  }else if(/overlap|collid|touch|separat/.test(text)){
   const numbers=[...text.matchAll(/\blines?\s+(\d{1,3})/g)].map(m=>Number(m[1]));
   if(numbers.length===2&&Math.abs(numbers[0]-numbers[1])===1){const named=text.match(/gemara|gemora|rashi|rashbam|tosafos|tosafot|tosfos/)?.[0],s=named?stream(named):target==='tosafos'?'tosafot':target==='inner-commentary'?'inner':'gemara',line=Math.max(...numbers);edits.separateLines=[...(old.separateLines||[]).filter(a=>a.stream!==s||a.line!==line),{stream:s,line,previousLine:line-1}];summary=`Separate ${s} lines ${line-1} and ${line} using normal line spacing.`;}
  }else if(/flow|continu|connect|linebreak|line break|gap/.test(text)&&/last|final|footer/.test(text)){
   const named=text.match(/gemara|gemora|rashi|rashbam|tosafos|tosafot|tosfos/)?.[0],s=named?stream(named):target==='tosafos'?'tosafot':target==='inner-commentary'?'inner':null;
   if(s){edits.continuousStreams=[...new Set([...(old.continuousStreams||[]),s])];summary=`Continue the final ${s} line from the preceding line with normal baseline spacing.`;}
  }else if(/nekud|nikud|vowels?|ניקוד|נקודות/.test(text)){
   changes.showNekudos=!/remove|hide|without|off|no\s+nekud/.test(text);summary=changes.showNekudos?'Show the nekudos available in the saved source.':'Hide nekudos while preserving the saved source.';
  }
  if(!summary)return null;
  if(!Object.keys(changes).length)changes.physicalEdits=sanitizeEdits(edits);
  return {summary,reason:'Apply locally, preserving every word and line boundary; verify spacing after rendering.',changes,clarifications:[]};
 }
 function validate(model,page){const failures=[];
  for(const name of activeNames(model)){const els=[...page.querySelectorAll(`[data-commentator="${name}"] > .mapped-line`)];if(els.length!==model.streams[name].lines.length)failures.push(name+' missing lines');
   els.forEach((el,i)=>{const words=el.textContent.trim().split(/\s+/),expected=model.streams[name].lines[i];if(norm(words[0])!==norm(expected.firstWord)||norm(words.at(-1))!==norm(expected.lastWord))failures.push(name+' line '+(i+1)+' endpoints changed');if(norm(el.textContent)!==norm(expected.displayText))failures.push(name+' source changed');if(el.scrollHeight>el.clientHeight+2||el.scrollWidth>el.clientWidth+2)failures.push(name+' line clipping');
    if(i&&el.getBoundingClientRect().top<els[i-1].getBoundingClientRect().bottom-.8)failures.push(name+' overlapping lines '+i+' and '+(i+1));
   });
  }return [...new Set(failures)];
 }
 return {activeNames,displayTokens,audit,pack,render,apply,fit,validate,pointed,sanitizeEdits,settle,review,baseline,markDibbur};
});
