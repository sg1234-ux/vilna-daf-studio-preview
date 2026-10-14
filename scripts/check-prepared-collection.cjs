const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const norm=s=>String(s).normalize('NFD').replace(/[\u0591-\u05c7]/g,'').replace(/[^\u05d0-\u05ea]/g,'');
const lex=t=>String(t).replace(/<[^>]+>/g,' ').split(/\s+/).filter(norm);
const leaves=(x,p=[])=>Array.isArray(x)?x.flatMap((v,i)=>leaves(v,[...p,i])):[[p,x]];
function validate(slug,expectedCounts){
 const root=path.resolve(__dirname,'../preparation'),spec=JSON.parse(fs.readFileSync(path.join(root,'pages',slug+'.json'))),raw=fs.readFileSync(path.join(root,'sources',slug+'.json')),source=JSON.parse(raw),model=spec.renderInstructions;
 assert.equal(spec.preparationComplete,true);assert.deepEqual(spec.remainingPreparation,[]);assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),spec.verification.sourceSnapshotSha256);assert.equal(spec.engineReady,false);
 for(const [name,s]of Object.entries(model.streams)){
  const expected=leaves(source.streams[name].he).flatMap(([p,t])=>lex(t).map((text,i)=>({id:`${name}:${p.join('.')}:${i}`,text}))),base=s.tokens.filter(t=>!t.nextAmud),byId=new Map(expected.map(w=>[w.id,w.text]));
  assert.equal(base.length,s.sourceWordCount);assert.deepEqual(base.map(t=>t.sourceWordId).sort(),expected.map(t=>t.id).sort());for(const t of base)assert.equal(t.sourceText,byId.get(t.sourceWordId));
  assert.equal(s.lines.length,expectedCounts[name]);let cursor=0;
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
  assert.equal(cursor,s.tokens.length);assert.equal(new Set(s.lines.flatMap(l=>l.sourceWordIds)).size,s.tokens.length);
 }
 for(const block of model.blocks)assert.equal(model.streams[block.stream].lines.filter(l=>l.block===block.id).length,block.lineCount);
 assert.equal(model.openingLines,4);assert.equal(model.blocks.find(b=>b.id==='rashi-opening').lineCount,4);assert.equal(model.blocks.find(b=>b.id==='tosafot-opening').lineCount,4);
 if(slug==='bava-metzia-22b'){assert.equal(model.blocks.find(b=>b.id==='rashi-side-overhang').lineCount,1);assert.equal(model.blocks.find(b=>b.id==='tosafot-narrow').lineCount,60);}
 else {assert.equal(model.streams.gemara.lines[38].role,'heading');assert.equal(model.blocks.find(b=>b.id==='rashi-hadran').lineCount,1);assert.equal(model.streams.tosafot.lines.at(-1).firstWord,'טעה');assert.equal(model.streams.rashi.lines.at(-1).firstWord,'מבדיל');}
 console.log('PASS',spec.ref,JSON.stringify(expectedCounts),'complete source identities, print variants, and four-line opening with side overhang.');
}
validate('bava-metzia-22b',{gemara:52,rashi:70,tosafot:70});

validate('berakhot-26a',{gemara:57,rashi:57,tosafot:53});
