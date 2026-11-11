const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const word=value=>String(value).normalize('NFD').replace(/[\u0591-\u05c7]/g,'').replace(/[^\u05d0-\u05ea]/g,'');
const lexical=text=>String(text).replace(/<[^>]+>/g,' ').split(/\s+/).filter(word);
function leaves(value,indices=[]){return Array.isArray(value)?value.flatMap((v,i)=>leaves(v,[...indices,i])):[[indices,value]];}
function validate(file){
 const spec=JSON.parse(fs.readFileSync(file)),root=path.resolve(path.dirname(file),'..'),slug=path.basename(file),sourceFile=path.join(root,'sources',slug),source=JSON.parse(fs.readFileSync(sourceFile)),next=JSON.parse(fs.readFileSync(path.join(root,'sources/pesachim-101a.json'))),model=spec.renderInstructions;
 assert.equal(spec.preparationComplete,true);assert.deepEqual(spec.remainingPreparation,[]);assert.equal(model.format,'vilna-prepared-physical-page');assert.equal(spec.ref,source.ref);
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(sourceFile)).digest('hex'),spec.verification.sourceSnapshotSha256);
 const expectedCounts={gemara:15,rashi:13,rashbam:56,tosafot:72};
 for(const [name,stream] of Object.entries(model.streams)){
  const expected=leaves(source.streams[name].he).flatMap(([indices,text])=>lexical(text).map((sourceText,i)=>({sourceWordId:`${name}:${indices.join('.')}:${i}`,sourceText}))),base=stream.tokens.filter(t=>!t.nextAmud),borrowed=stream.tokens.filter(t=>t.nextAmud);
  assert.equal(base.length,stream.sourceWordCount);assert.equal(borrowed.length,stream.borrowedWordCount);assert.deepEqual([...base.map(t=>t.sourceWordId)].sort(),expected.map(t=>t.sourceWordId).sort());
  const byId=new Map(expected.map(t=>[t.sourceWordId,t.sourceText]));for(const token of base)assert.equal(token.sourceText,byId.get(token.sourceWordId));
  const nextWords=leaves(next.streams[name].he).flatMap(([,t])=>lexical(t));assert.deepEqual(borrowed.map(t=>t.sourceText),nextWords.slice(0,borrowed.length));
  assert.equal(stream.lines.length,expectedCounts[name]);let cursor=0;
  for(const [index,line] of stream.lines.entries()){
   assert.equal(line.line,index+1);const [start,end]=line.sourceSpan;assert.equal(start,cursor);assert(end>start&&end<=stream.tokens.length);cursor=end;
   assert.deepEqual(line.sourceWordIds,stream.tokens.slice(start,end).map(t=>t.sourceWordId));assert.equal(line.sourceText,stream.tokens.slice(start,end).map(t=>t.sourceText).join(' '));
   const visible=lexical(line.displayText);assert.equal(word(visible[0]),word(line.firstWord));assert.equal(word(visible.at(-1)),word(line.lastWord));
   assert(['justify','center','left'].includes(line.alignment));assert(line.lineBox[0]<line.lineBox[2]&&line.lineBox[1]<line.lineBox[3]);
   if(line.editionVariant){assert.equal(line.editionVariant.source,'ודעתו');assert.equal(line.editionVariant.printed,'ורוצה');assert.equal(name,'tosafot');assert.equal(line.line,71);assert.deepEqual(visible.map(word),lexical(line.sourceText.replace('ודעתו','ורוצה')).map(word));}
   else assert.deepEqual(visible.map(word),lexical(line.sourceText).map(word));
  }
  assert.equal(cursor,stream.tokens.length);assert.equal(new Set(stream.lines.flatMap(l=>l.sourceWordIds)).size,stream.tokens.length);
 }
 for(const b of model.blocks){assert.equal(model.streams[b.stream].lines.filter(l=>l.block===b.id).length,b.lineCount);}
 const footer=model.blocks.find(b=>b.id==='tosafot-footer');assert.equal(footer.box[0],model.coreBox[0]);assert.equal(footer.box[2],model.coreBox[2]);assert.equal(model.titles[0].sourceWordCount,0);
 if(spec.engineReady){assert.equal(spec.rendererAdapter,'physical-page-v1');assert.deepEqual(spec.pendingIntegration,[]);assert.deepEqual(require('../draft-engine/physical-page.js').audit(model),[]);}else assert(spec.pendingIntegration.length>0,'An unconnected page must retain its integration gate.');
 return {ref:spec.ref,lines:expectedCounts,sourceWords:Object.fromEntries(Object.entries(model.streams).map(([k,v])=>[k,v.sourceWordCount]))};
}
module.exports={validate};if(require.main===module){const file=process.argv[2]||path.resolve(__dirname,'../preparation/pages/pesachim-100b.json');console.log('PASS complete prepared page:',JSON.stringify(validate(file)));}
