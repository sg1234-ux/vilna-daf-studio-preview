// Exercise actual viewer export buttons; compare shaped Hebrew against the rendered page.
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const modules=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {chromium}=require(path.join(modules,'playwright')),sharp=require(path.join(modules,'sharp')),root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'application/javascript','.mjs':'application/javascript','.wasm':'application/wasm','.json':'application/json','.css':'text/css','.ttf':'font/ttf','.otf':'font/otf','.woff2':'font/woff2'};
async function pixels(buffer){const r=await sharp(buffer).removeAlpha().raw().toBuffer({resolveWithObject:true});return r;}
async function agreement(a,b){const crop=async value=>{const meta=await sharp(value).metadata();return sharp(value).extract({left:24,top:24,width:meta.width-48,height:meta.height-48}).png().toBuffer();};const aa=await pixels(await crop(a)),bb=await pixels(await crop(b));assert.equal(aa.info.width,bb.info.width);assert.equal(aa.info.height,bb.info.height);const w=aa.info.width,h=aa.info.height;
 const ink=(p,x,y)=>{const n=(y*w+x)*p.info.channels;return p.data[n]<160&&p.data[n+1]<160&&p.data[n+2]<160;};
 let left=0,right=0,matchL=0,matchR=0;
 for(let y=2;y<h-2;y++)for(let x=2;x<w-2;x++){
  const aInk=ink(aa,x,y),bInk=ink(bb,x,y);if(!aInk&&!bInk)continue;let nearA=false,nearB=false;
  for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){nearA||=ink(aa,x+dx,y+dy);nearB||=ink(bb,x+dx,y+dy);}
  if(aInk){left++;if(nearB)matchL++;}if(bInk){right++;if(nearA)matchR++;}
 }
 return {sourceCoverage:matchL/left,exportCoverage:matchR/right,inkRatio:right/left};
}
(async()=>{let browser;const server=http.createServer((q,r)=>{const f=path.resolve(root,'.'+decodeURIComponent(new URL(q.url,'http://localhost').pathname));if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){r.writeHead(404);return r.end();}r.setHeader('Content-Type',mime[path.extname(f)]||'application/octet-stream');r.end(fs.readFileSync(f));});await new Promise(r=>server.listen(0,'127.0.0.1',r));
try{browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'/tmp/lesson-link-browser/chrome-headless-shell-linux64/chrome-headless-shell',args:['--no-sandbox']});const context=await browser.newContext({viewport:{width:1450,height:1300},deviceScaleFactor:4});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));let inference=0;
 await page.route('**/*',route=>{const u=new URL(route.request().url());if(/\/api\/(?:agent\/(?:review|scan)|local\/scan)/.test(u.pathname))inference++;
 if(u.hostname==='127.0.0.1')return route.continue();if(u.hostname==='www.sefaria.org'&&u.pathname.startsWith('/api/texts/')){const ref=decodeURIComponent(u.pathname.split('/texts/')[1]),slug=ref.replace(/^(Rashi|Rashbam|Tosafot) on /,'').toLowerCase().replaceAll(' ','-'),stream=ref.startsWith('Rashi on ')?'rashi':ref.startsWith('Rashbam on ')?'rashbam':ref.startsWith('Tosafot on ')?'tosafot':'gemara',f=path.join(root,'preparation/sources',slug+'.json'),data=fs.existsSync(f)?JSON.parse(fs.readFileSync(f)):null;return route.fulfill({contentType:'application/json',body:JSON.stringify({he:data?.streams?.[stream]?.he||[]})});}return route.abort();});
 for(const [entry,ref]of [['pesachim-99b/index.html','Pesachim 99b'],['bava-metzia-21a/index.html','Bava Metzia 21a'],['draft-engine/index.html?ref=Pesachim%20100b','Pesachim 100b']]){
  await page.goto(`http://127.0.0.1:${server.address().port}/${entry}`,{waitUntil:'networkidle'});await page.waitForFunction(ref=>typeof state!=='undefined'&&state.ref===ref&&phraseNavigationAvailable&&!document.getElementById('dafPage').classList.contains('composing'),ref,{timeout:60000});
  const clip=await page.evaluate(async()=>{await document.fonts.ready;setPageZoom(1);await new Promise(r=>requestAnimationFrame(r));const page=document.getElementById('dafPage'),box=page.getBoundingClientRect(),g=page.querySelector('.gemara .word-token').closest('.flow-region'),r=g.getBoundingClientRect();state.selection={x:Math.floor(r.left-box.left),y:Math.floor(r.top-box.top),width:Math.floor(Math.min(r.width,300)),height:Math.floor(Math.min(r.height,155))};document.getElementById('selectionBox').hidden=true;for(const id of ['copyExcerpt','downloadExactPng','downloadExcerpt'])document.getElementById(id).disabled=false;return {x:box.left+state.selection.x-6+scrollX,y:box.top+state.selection.y-6+scrollY,width:state.selection.width+12,height:state.selection.height+12};});
  const before=await page.evaluate(()=>[...document.querySelectorAll('.word-token')].map(e=>[e.textContent,e.getBoundingClientRect().x,e.getBoundingClientRect().y,e.getBoundingClientRect().width,e.getBoundingClientRect().height]));
  const source=await page.screenshot({clip,animations:'disabled'});
  let promise=page.waitForEvent('download');await page.locator('#downloadExcerpt').click();const download=await promise,svg=fs.readFileSync(await download.path(),'utf8');assert.match(svg,/data-excerpt-export="62.67"/);assert(!/<text\b|foreignObject|url\(https?:/.test(svg));assert.match(svg,/data-export-font="Drugulin CLM"/);
  const encoded=await page.evaluate(async svg=>{const blob=await VilnaExcerptExport.png(svg),bytes=new Uint8Array(await blob.arrayBuffer());let result='';for(const b of bytes)result+=String.fromCharCode(b);return btoa(result);},svg),png=Buffer.from(encoded,'base64');
  fs.writeFileSync('/tmp/'+ref.replaceAll(' ','-')+'-export.svg',svg);fs.writeFileSync('/tmp/'+ref.replaceAll(' ','-')+'-export.png',png);fs.writeFileSync('/tmp/'+ref.replaceAll(' ','-')+'-source.png',source);
  const score=await agreement(source,png);console.log(ref,score);assert(score.sourceCoverage>.9,'Source ink and nekudos retained');assert(score.exportCoverage>.9,'Export glyphs agree with browser positions');assert(score.inkRatio>.8&&score.inkRatio<1.2,'No stretched or extra glyphs');
  const after=await page.evaluate(()=>[...document.querySelectorAll('.word-token')].map(e=>[e.textContent,e.getBoundingClientRect().x,e.getBoundingClientRect().y,e.getBoundingClientRect().width,e.getBoundingClientRect().height]));assert.deepEqual(after,before,'Export must not move or modify source words');
  await page.evaluate(()=>{window.exportClipboard=null;Object.defineProperty(navigator,'clipboard',{configurable:true,value:{write:async items=>{const blob=await items[0].getType('image/png');exportClipboard={size:blob.size,type:blob.type};}}});});
  await page.locator('#copyExcerpt').click();await page.waitForFunction(()=>exportClipboard);assert.equal(await page.evaluate(()=>exportClipboard.type),'image/png');assert.equal(await page.evaluate(()=>exportClipboard.size),png.length,'Copy and SVG share the same shaped export');
  promise=page.waitForEvent('download');await page.locator('#downloadExactPng').click();const image=await promise;assert.deepEqual(fs.readFileSync(await image.path()),png,'Downloaded PNG equals copied output');
  if(ref==='Pesachim 99b'){
   const summary=await page.evaluate(async()=>{
    togglePunctuation(false);const first=document.querySelector('.gemara .word-token');first.classList.add('word-whited-out');
    const muted=await canvaExcerptSvg();first.classList.remove('word-whited-out');
    setPageZoom(2);const zoomed=await canvaExcerptSvg();setPageZoom(1);
    const rashi=document.querySelector('.commentary .word-token').closest('.flow-region,.top-commentary'),r=rashi.getBoundingClientRect(),p=document.getElementById('dafPage').getBoundingClientRect();state.selection={x:Math.floor(r.left-p.left),y:Math.floor(r.top-p.top),width:Math.floor(r.width),height:100};const commentary=await canvaExcerptSvg();
    first.style.fontFamily='serif';const g=first.closest('.flow-region').getBoundingClientRect();state.selection={x:Math.floor(g.left-p.left),y:Math.floor(g.top-p.top),width:Math.floor(g.width),height:100};const system=await canvaExcerptSvg();first.style.fontFamily='';
    return {muted,zoomed,commentary,system};
   });
   assert.match(summary.muted,/stroke="#d3cfc6"/);assert(!/<foreignObject/.test(summary.muted));assert.match(summary.zoomed,/data-export-font="Drugulin CLM"/);assert.match(summary.commentary,/data-export-font="Mekorot"/);assert.match(summary.system,/<image[^>]+href="data:image\/png;base64,/);
   // Raster-backed system fonts and self-contained SVGs must still render without font requests.
   await page.evaluate(async markup=>{const b=await VilnaExcerptExport.png(markup);if(!b.size)throw Error('Empty fallback');},summary.system);
  }
  assert.equal(inference,0);assert.deepEqual(errors,[]);console.log('PASS',ref,'actual SVG, PNG and Copy controls; unchanged source/layout; zero AI requests.');
 }
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
