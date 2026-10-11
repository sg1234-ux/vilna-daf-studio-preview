const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'../preparation'),manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'))),rows=manifest.chapters.flatMap(c=>c.pages);
assert.equal(rows.length,81);assert.equal(new Set(rows.map(r=>r.ref)).size,81);assert.deepEqual(manifest.chapters.map(c=>c.pageCount),[26,45,10]);
for(const row of rows){const source=JSON.parse(fs.readFileSync(path.join(root,row.sourceSnapshot)));assert.equal(source.ref,row.ref);assert.equal(source.streams.gemara.language,'Hebrew');assert(source.streams.gemara.he.length>0);assert(!source.streams.english);assert.equal(row.engineReady,row.ref==='Bava Metzia 22a');if(row.specification)assert(fs.existsSync(path.join(root,row.specification)));}
const strip=s=>String(s).normalize('NFD').replace(/[\u0591-\u05c7]/g,'').replace(/[^\u05d0-\u05ea]/g,'');
for(const [slug,count,last,next]of [['bava-metzia-22b',52,'דמדרסא','bava-metzia-23a'],['pesachim-100b',15,'אף','pesachim-101a'],['berakhot-26a',57,'תנו','berakhot-26b']]){
 const spec=JSON.parse(fs.readFileSync(path.join(root,'pages',slug+'.json'))),lines=spec.streams.gemara.lines;
 assert.equal(spec.engineReady,false);assert.equal(lines.length,count);assert.equal(spec.blocks.reduce((n,b)=>n+b.rows,0),count);assert.equal(lines.at(-1).lastWord,last);assert.equal(lines.at(-1).role,'next-amud-preview');assert(/^[a-f0-9]{64}$/.test(spec.scan.sha256));
 const source=JSON.parse(fs.readFileSync(path.join(root,'sources',next+'.json')));assert(strip(source.streams.gemara.he.flat(Infinity)[0]).startsWith(strip(last)));
 for(const line of lines){assert(line.firstWord&&line.lastWord);assert.equal(line.printedText.split(/\s+/)[0],line.firstWord);assert.equal(line.printedText.split(/\s+/).at(-1),line.lastWord);if(line.inkBox)assert(line.inkBox[0]<line.inkBox[2]&&line.inkBox[1]<line.inkBox[3]);}
}
const ber=JSON.parse(fs.readFileSync(path.join(root,'pages/berakhot-26a.json')));assert.equal(ber.streams.gemara.lines[38].role,'heading');assert.equal(ber.streams.gemara.lines[39].firstWord,'תפלת');
console.log('PASS preparation library: 81 unique pages and full Hebrew snapshots, preserved existing maps, correct shared-page boundaries, three observed Gemara maps, explicit next-page previews, geometry and unfinished-status gates. No inference or build was run.');
