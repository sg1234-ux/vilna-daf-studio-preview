const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),library=require('../draft-engine/prepared-library.js'),physical=require('../draft-engine/physical-page.js');
(async()=>{
 const requested=[],pack=await library.load('Bava Metzia 21b',async url=>{requested.push(url);assert(url.startsWith('../preparation/'));const file=path.resolve(root,'draft-engine',url);return {ok:true,status:200,json:async()=>JSON.parse(fs.readFileSync(file,'utf8'))};});
 assert.equal(pack.profile.prepared,true);assert.equal(pack.ref,'Bava Metzia 21b');assert.deepEqual(physical.audit(pack.profile.physical),[]);
 const m=pack.profile.physical;assert.deepEqual(Object.fromEntries(Object.entries(m.streams).map(([n,s])=>[n,s.lines.length])),{gemara:54,rashi:63,tosafot:70});
 assert.deepEqual(requested,['../preparation/manifest.json','../preparation/pages/bava-metzia-21b.json','../preparation/sources/bava-metzia-21b.json']);
 for(const name of ['rashi','tosafot']){const opening=m.blocks.find(b=>b.id===name+'-opening'),side=m.blocks.find(b=>b.id===name+'-side'),s=m.streams[name];assert.equal(opening.lineCount,4);assert.equal(s.lines[4].block,side.id);assert(side.box[2]-side.box[0]<opening.box[2]-opening.box[0]);}
 assert.equal(m.streams.gemara.lines[16].displayText,'רב עוקבא בר חמא הכא במכנשתא דביזרי');assert.equal(m.streams.gemara.lines[16].lastWord,'דביזרי');
 assert.equal(m.blocks.find(b=>b.id==='gemara-wide-ending').lineCount,1);assert.equal(m.blocks.find(b=>b.id==='tosafot-footer').lineCount,2);
 assert.equal(m.nextPagePreviewPolicy,'omit-isolated-preview-words');assert(Object.values(m.streams).every(s=>s.lines.every(l=>l.role!=='next-amud-preview')));
 const sourceCounts=Object.fromEntries(Object.entries(m.streams).map(([n,s])=>[n,s.tokens.length]));assert.deepEqual(sourceCounts,{gemara:389,rashi:364,tosafot:417});
 console.log('PASS BM 21b: complete local prepared loader, 187 rows, canonical source identities, four-row openings, side overhangs and footer widths; no external source or model fetch.');
})().catch(e=>{console.error(e);process.exitCode=1});
