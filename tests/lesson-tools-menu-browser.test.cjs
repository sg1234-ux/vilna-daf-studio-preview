// Exercise the actual launcher routes, including both preserved older compositors.
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const reader=require('../server/lesson-slides.cjs'),root=path.resolve(__dirname,'..'),mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.otf':'font/otf','.ttf':'font/ttf','.woff2':'font/woff2'};
const deck='https://docs.google.com/presentation/d/fixture_deck_12345/edit';
let quote='אלו מציאות שלו';const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const handler=reader.createHandler({fetchImpl:async()=>new Response(`<section class="slide-content" style="background-image:url(https://docs.google.com/presentation/d/fixture_deck_12345/viewpage?pageid=gmenu01)"><p>${escape(quote)}</p></section>`)});
(async()=>{
 let browser;
 const server=http.createServer((req,res)=>{
  if(req.url==='/api/lesson-slides/read')return handler(req,res);
  const u=new URL(req.url,'http://localhost'),file=path.resolve(root,'.'+decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{
  browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
  const page=await browser.newPage({viewport:{width:1450,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>{
   const u=new URL(route.request().url());if(u.hostname==='127.0.0.1')return route.continue();
   if(u.hostname==='www.sefaria.org'&&u.pathname.startsWith('/api/texts/')){
    const ref=decodeURIComponent(u.pathname.split('/texts/')[1]),slug=ref.replace(/^(Rashi|Rashbam|Tosafot) on /,'').toLowerCase().replaceAll(' ','-'),stream=ref.startsWith('Rashi on ')?'rashi':ref.startsWith('Rashbam on ')?'rashbam':ref.startsWith('Tosafot on ')?'tosafot':'gemara',file=path.join(root,'preparation/sources',slug+'.json');
    const data=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):null;return route.fulfill({contentType:'application/json',body:JSON.stringify({he:data?.streams?.[stream]?.he||[]})});
   }return route.abort();
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/?amud=bava-metzia-21a`,{waitUntil:'networkidle'});
  for(const [key,ref,build]of [['bava-metzia-21a','Bava Metzia 21a','51.1'],['pesachim-99b','Pesachim 99b','44.1'],['pesachim-100a','Pesachim 100a','62.76'],['bava-metzia-22a','Bava Metzia 22a','62.76']]){
   await page.locator('#pageMenuToggle').click();await page.locator('#tractateSelect').selectOption(key.startsWith('pesachim')?'pesachim':'bava-metzia');await page.locator('#amudSelect').selectOption(key);const frame=await(await page.locator('#studioFrame').elementHandle()).contentFrame();
   await frame.waitForFunction(ref=>typeof state!=='undefined'&&state.ref===ref&&phraseNavigationAvailable&&!document.getElementById('dafPage').classList.contains('composing'),ref,{timeout:60000});
   assert.equal(await frame.locator('#importLessonDeck').count(),1,key);assert.equal(await frame.locator('#importLessonDeck').isVisible(),true,key);assert.equal(await frame.evaluate(()=>String(window.VILNA_DAF_BUILD)),build,key);
   const selected=await frame.evaluate(()=>activePhraseProfile.map((text,index)=>({text,index})).find(p=>p.text.split(/\s+/).length>=3));assert(selected,key);quote=selected.text;
   const before=await frame.evaluate(()=>({html:state.gemaraHtml,boxes:[...document.querySelectorAll('.geometry-band,.mapped-line')].map(e=>[e.offsetLeft,e.offsetTop,e.offsetWidth,e.offsetHeight])}));
   await frame.locator(`.word-token[data-stream="gemara"][data-phrase-index="${selected.index}"]`).first().click();await frame.locator('#visualUrl').fill(deck);await frame.locator('#importLessonDeck').click();await frame.locator('#lessonDeckReview').waitFor({state:'visible'});
   await frame.getByRole('button',{name:'Use selected phrase'}).click();await frame.locator('#applyLessonDeck').click();assert.deepEqual(await frame.evaluate(i=>visualLinksFor(i),selected.index),[deck+'#slide=id.gmenu01'],key);
   assert.deepEqual(await frame.evaluate(()=>({html:state.gemaraHtml,boxes:[...document.querySelectorAll('.geometry-band,.mapped-line')].map(e=>[e.offsetLeft,e.offsetTop,e.offsetWidth,e.offsetHeight])})),before,key+' source/layout preserved');
   const downloadPromise=page.waitForEvent('download');await frame.locator('#saveProject').click();const download=await downloadPromise,project=JSON.parse(fs.readFileSync(await download.path()));assert.deepEqual(project.lesson.visualLinks[selected.index],[deck+'#slide=id.gmenu01']);
   console.log('PASS main-menu route:',ref,'shared deck controls, reviewed attachment, saved project, source/layout unchanged.');
  }
  assert.deepEqual(errors,[]);
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
