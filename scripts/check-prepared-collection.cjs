const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const norm=s=>String(s).normalize('NFD').replace(/[\u0591-\u05c7]/g,'').replace(/[^\u05d0-\u05ea]/g,'');
const lex=t=>String(t).replace(/<[^>]+>/g,' ').split(/\s+/).filter(norm);
const leaves=(x,p=[])=>Array.isArray(x)?x.flatMap((v,i)=>leaves(v,[...p,i])):[[p,x]];
function validate(slug,expectedCounts,{connected=true}={}){
 const root=path.resolve(__dirname,'../preparation'),spec=JSON.parse(fs.readFileSync(path.join(root,'pages',slug+'.json'))),raw=fs.readFileSync(path.join(root,'sources',slug+'.json')),source=JSON.parse(raw),model=spec.renderInstructions;
 assert.equal(spec.preparationComplete,true);assert.deepEqual(spec.remainingPreparation,[]);assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),spec.verification.sourceSnapshotSha256);const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'))),entry=manifest.chapters.flatMap(c=>c.pages).find(p=>p.ref===spec.ref);assert.equal(entry.engineReady,connected);if(connected)assert.equal(entry.rendererAdapter,'physical-page-v1');else assert.equal(entry.preparationComplete,true);assert.deepEqual(require('../draft-engine/physical-page.js').audit(model),[]);
 for(const [name,s]of Object.entries(model.streams)){
  const expected=leaves(source.streams[name].he).flatMap(([p,t])=>lex(t).map((text,i)=>({id:`${name}:${p.join('.')}:${i}`,text}))),base=s.tokens.filter(t=>!t.nextAmud&&!t.incomingFromPreviousAmud),byId=new Map(expected.map(w=>[w.id,w.text]));
  assert.equal(base.length,s.sourceWordCount);
  const incoming=s.tokens.filter(t=>t.incomingFromPreviousAmud);assert.equal(incoming.length,s.incomingFromPreviousWordCount||0);
  if(incoming.length){const c=model.incomingSourceContinuations.find(c=>c.stream===name),prior=JSON.parse(fs.readFileSync(path.join(root,c.priorSpecification))).renderInstructions.streams[name].tokens.slice(...c.sourceSpan),snapshot=fs.readFileSync(path.join(root,c.sourceSnapshot));assert.equal(crypto.createHash('sha256').update(snapshot).digest('hex'),c.sourceSnapshotSha256);assert.deepEqual(incoming.map(t=>t.originalSourceWordId),prior.map(t=>t.sourceWordId));assert.deepEqual(incoming.map(t=>t.sourceText),prior.map(t=>t.sourceText));assert(incoming.every(t=>t.ref===c.sourceRef));}
  assert.deepEqual(base.map(t=>t.sourceWordId).sort(),expected.map(t=>t.id).sort());for(const t of base)assert.equal(t.sourceText,byId.get(t.sourceWordId));
  assert.equal(s.lines.length,expectedCounts[name]);let cursor=s.previousSourceSpan?.[1]||0;const startCursor=cursor;if(s.previousSourceSpan){assert.equal(s.previousSourceSpan[0],0);assert(['Bava Metzia 23b','Berakhot 27b','Pesachim 103b'].includes(s.printedOnPreviousAmud));const previousSlug=s.printedOnPreviousAmud.toLowerCase().replace(/ /g,'-');const prior=JSON.parse(fs.readFileSync(path.join(root,'pages',previousSlug+'.json'))).renderInstructions.streams[name].tokens.filter(t=>t.nextAmud).slice(0,cursor);assert.deepEqual(s.tokens.slice(0,cursor).map(t=>norm(t.sourceText)),prior.map(t=>norm(t.sourceText)));}
  for(const [i,l]of s.lines.entries()){
   assert.equal(l.line,i+1);const [a,b]=l.sourceSpan;assert.equal(a,cursor);assert(b>a&&b<=s.tokens.length);cursor=b;
   assert.equal(l.sourceText,s.tokens.slice(a,b).map(t=>t.sourceText).join(' '));assert.deepEqual(l.sourceWordIds,s.tokens.slice(a,b).map(t=>t.sourceWordId));
   const printed=lex(l.displayText);assert.equal(norm(printed[0]),norm(l.firstWord));assert.equal(norm(printed.at(-1)),norm(l.lastWord));
   if(l.printVariants?.length){
    let words=lex(l.sourceText).map(norm),offset=0;
    for(const v of l.printVariants){const [x,y]=v.sourceWordSpan;assert(x>=a&&y<=b);assert.deepEqual(s.tokens.slice(x,y).map(t=>norm(t.sourceText)),v.sourceWords);words.splice(x-a+offset,y-x,...v.printedWords);offset+=v.printedWords.length-(y-x);}
    assert.deepEqual(words,printed.map(norm));
   }else assert.deepEqual(lex(l.sourceText).map(norm),printed.map(norm));
  }
  let accountedEnd=cursor;
  if(s.deferredSourceSpan){
   const [a,b]=s.deferredSourceSpan;assert.equal(a,accountedEnd);assert(b>a&&b<=s.tokens.length);accountedEnd=b;
   const ref=spec.ref.match(/^(.*) (\d+)([ab])$/);assert(ref);assert.equal(s.deferredTo,ref[1]+' '+(ref[3]==='a'?ref[2]+'b':(Number(ref[2])+1)+'a'));
   const c=model.sourceContinuations.find(c=>c.stream===name);assert.deepEqual(c.sourceSpan,[a,b]);assert.deepEqual(c.sourceWordIds,s.tokens.slice(a,b).map(t=>t.sourceWordId));assert.equal(c.sourceText,s.tokens.slice(a,b).map(t=>t.sourceText).join(' '));
  }
  if(s.unprintedDuplicateSourceSpan){
   const [a,b]=s.unprintedDuplicateSourceSpan;assert.equal(a,accountedEnd);assert.equal(b,s.tokens.length);accountedEnd=b;assert(b>a);assert.equal(s.duplicateOfSourceWordIds.length,b-a);
   const printedIds=new Set(s.lines.flatMap(l=>l.sourceWordIds));assert(s.duplicateOfSourceWordIds.every(id=>printedIds.has(id)));
   assert.deepEqual(s.tokens.slice(a,b).map(t=>t.sourceText),s.duplicateOfSourceWordIds.map(id=>byId.get(id)));
   assert(s.tokens.slice(a,b).every(t=>!printedIds.has(t.sourceWordId)));assert(s.unprintedDuplicateReason);
  }
  assert.equal(accountedEnd,s.tokens.length);
  assert.equal(new Set(s.lines.flatMap(l=>l.sourceWordIds)).size,cursor-startCursor);
 }
 if(model.nextPagePreviewPolicy==='omit-isolated-preview-words'){
  for(const stream of Object.values(model.streams))assert(stream.lines.every(l=>l.role!=='next-amud-preview'),'isolated previews must be omitted');
 }
 for(const block of model.blocks)assert.equal(model.streams[block.stream].lines.filter(l=>l.block===block.id).length,block.lineCount);
 for(const d of model.diagrams||[]){if(d.anchorAfterSourceWordId){const stream=model.streams[d.stream];assert(stream.lines[d.line-1].sourceWordIds.includes(d.anchorAfterSourceWordId));assert.equal(d.textExclusionBox.length,4);assert(d.box[2]>d.box[0]&&d.box[3]>d.box[1]);}}

 assert.equal(model.openingLines,4);assert.equal(model.blocks.find(b=>b.id==='rashi-opening').lineCount,4);if(slug==='berakhot-28b'){
  assert.equal(model.openingLayout.tosafotBroadRows,0);assert.equal(model.openingLayout.rashiSideOverhangRows,1);assert(!model.blocks.some(b=>b.id==='tosafot-opening'));
  const ro=model.blocks.find(b=>b.id==='rashi-opening'),ts=model.blocks.find(b=>b.id==='tosafot-side'),g=model.blocks.find(b=>b.id==='gemara-narrow');
  assert.equal(ro.box[0],model.coreBox[0]);assert.equal(ro.box[2],model.coreBox[2]);assert.equal(ts.lineCount,4);assert.equal(ts.box[1],g.box[1]);assert(ts.box[0]>g.box[2]);
 }else assert.equal(model.blocks.find(b=>b.id==='tosafot-opening').lineCount,4);
 if(slug==='bava-metzia-22b'){assert.equal(model.blocks.find(b=>b.id==='rashi-side-overhang').lineCount,1);assert.equal(model.blocks.find(b=>b.id==='tosafot-narrow').lineCount,60);}
 else if(slug==='berakhot-26a'){assert.equal(model.streams.gemara.lines[38].role,'heading');assert.equal(model.blocks.find(b=>b.id==='rashi-hadran').lineCount,1);assert.equal(model.streams.tosafot.lines.at(-1).firstWord,'טעה');assert.equal(model.streams.rashi.lines.at(-1).firstWord,'מבדיל');}
 const previews=Object.values(model.streams).flatMap(s=>s.tokens.filter(t=>t.nextAmud));
 for(const name of Object.keys(model.streams)){
  const tokens=model.streams[name].tokens.filter(t=>t.nextAmud);if(!tokens.length)continue;
  const nextSlug=tokens[0].ref.toLowerCase().replace(/ /g,'-'),nextSource=JSON.parse(fs.readFileSync(path.join(root,'sources',nextSlug+'.json'))),prefix=leaves(nextSource.streams[name].he).flatMap(([,t])=>lex(t)).slice(0,tokens.length);
  assert.deepEqual(tokens.map(t=>norm(t.sourceText)),prefix.map(norm),'next-amud prefix provenance');
  if(tokens.some(t=>t.originalSourceWordId)){const originalIds=leaves(nextSource.streams[name].he).flatMap(([p,t])=>lex(t).map((w,i)=>`${name}:${p.join('.')}:${i}`)).slice(0,tokens.length);assert.deepEqual(tokens.map(t=>t.originalSourceWordId),originalIds,'next-amud original source identities');}

 }
 if(slug==='pesachim-104a'){
  const rb=model.streams.rashbam;
  assert.deepEqual(rb.previousSourceSpan,[0,4]);assert.equal(rb.printedOnPreviousAmud,'Pesachim 103b');assert.equal(rb.lines[0].sourceSpan[0],4);
  const prior=JSON.parse(fs.readFileSync(path.join(root,'pages/pesachim-103b.json'))).renderInstructions.streams.rashbam.tokens.filter(t=>t.nextAmud&&t.ref==='Pesachim 104a');
  assert.deepEqual(rb.tokens.slice(0,4).map(t=>t.sourceWordId),prior.map(t=>t.originalSourceWordId));
  assert.equal(rb.lines[5].displayText,'ולא ממנינא הוא: חתימה. סוף');assert.equal(rb.lines[6].displayText,'הברכה חותם בברוך: פתיחתן');
  assert(rb.lines[5].printVariants.some(v=>v.operation==='insert'));assert(rb.lines[6].printVariants.some(v=>v.operation==='insert'));
  assert.equal(model.blocks.find(b=>b.id==='gemara-widen-left').lineCount,2);
 }
 if(slug==='bava-metzia-23b'){
  assert.equal(model.streams.rashi.lines.length,62);assert.equal(model.blocks.find(b=>b.id==='gemara-wide').lineCount,5);assert(model.streams.tosafot.borrowedWordCount>1);assert(model.diagrams.some(d=>d.id==='triangle-example'));assert.equal(model.streams.tosafot.lines.at(-1).displayText,'ומודה');
 }else if(slug==='berakhot-27a'){
  assert.equal(model.blocks.find(b=>b.id==='rashi-full-footer').lineCount,8);assert.equal(model.blocks.find(b=>b.id==='gemara-widen-left').lineCount,23);
 }else if(slug==='pesachim-101b'){
  assert.equal(model.streams.rashbam.lines.some(l=>l.role==='next-amud-preview'),false);assert.deepEqual(model.streams.tosafot.deferredSourceSpan,[484,724]);assert.equal(model.streams.tosafot.lines.at(-1).displayText,'לברך');assert.equal(model.blocks.find(b=>b.id==='tosafot-narrow').lineCount,38);
 }
 if(slug==='bava-metzia-23a'){
  assert.deepEqual(['gemara-narrow','gemara-widen-right','gemara-full-width'].map(id=>model.blocks.find(b=>b.id===id).lineCount),[41,5,6]);
 }else if(slug==='berakhot-26b'){
  assert.equal(model.blocks.find(b=>b.id==='gemara-widen-left').lineCount,17);assert.equal(model.blocks.find(b=>b.id==='tosafot-footer').lineCount,10);
 }else if(slug==='pesachim-101a'){
  assert.equal(model.blocks.find(b=>b.id==='rashbam-wide').lineCount,21);assert.equal(model.blocks.find(b=>b.id==='tosafot-full-footer').lineCount,6);assert.equal(model.streams.rashi.lines.at(-1).displayText,'אין');assert.equal(model.titles[0].stream,'rashbam');
 }
 console.log('PASS' ,spec.ref,JSON.stringify(expectedCounts),'complete source identities, print variants, and four broad opening rows and measured physical blocks.');
}
validate('bava-metzia-22b',{gemara:52,rashi:70,tosafot:70});

validate('berakhot-26a',{gemara:57,rashi:57,tosafot:53});

validate('bava-metzia-23a',{gemara:53,rashi:51,tosafot:57});

validate('berakhot-26b',{gemara:50,rashi:41,tosafot:73});

validate('pesachim-101a',{gemara:32,rashi:12,rashbam:51,tosafot:71});

validate('bava-metzia-23b',{gemara:57,rashi:62,tosafot:71});

validate('berakhot-27a',{gemara:51,rashi:73,tosafot:34});

validate('pesachim-101b',{gemara:34,rashi:26,rashbam:44,tosafot:61});

validate('berakhot-27b',{gemara:50,rashi:48,tosafot:29});

validate('bava-metzia-24a',{gemara:48,rashi:42,tosafot:69});

validate('pesachim-102a',{gemara:32,rashi:23,rashbam:41,tosafot:49});

validate('berakhot-28a',{gemara:56,rashi:49,tosafot:28});

validate('bava-metzia-24b',{gemara:51,rashi:40,tosafot:66});

validate('pesachim-102b',{gemara:20,rashi:11,rashbam:51,tosafot:68});

validate('berakhot-28b',{gemara:54,rashi:48,tosafot:4});

validate('bava-metzia-25a',{gemara:46,rashi:65,tosafot:39});

validate('pesachim-103a',{gemara:35,rashi:13,rashbam:54,tosafot:59});

validate('berakhot-29a',{gemara:56,rashi:50,tosafot:38});
validate('bava-metzia-25b',{gemara:45,rashi:51,tosafot:71});
validate('pesachim-103b',{gemara:29,rashi:17,rashbam:49,tosafot:64});

validate('berakhot-29b',{gemara:52,rashi:42,tosafot:72});
validate('bava-metzia-26a',{gemara:32,rashi:56,tosafot:67});

validate('pesachim-104a',{gemara:49,rashi:21,rashbam:47,tosafot:58});

validate('berakhot-30a',{gemara:61,rashi:76,tosafot:50},{connected:false});

validate('berakhot-30b',{gemara:51,rashi:37,tosafot:70},{connected:false});

validate('bava-metzia-26b',{gemara:51,rashi:67,tosafot:66},{connected:false});

validate('pesachim-104b',{gemara:17,rashi:16,rashbam:31,tosafot:69},{connected:false});
