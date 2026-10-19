// Offline BM 21a regression: actual word selection, attachment controls and project round trip.
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..'),mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.ttf':'font/ttf','.otf':'font/otf'};
(async()=>{
 let browser;
 const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
  const context=await browser.newContext({viewport:{width:1400,height:1100}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',route=>{
   const u=new URL(route.request().url());
   if(u.hostname==='127.0.0.1')return route.continue();
   if(['docs.google.com','www.canva.com'].includes(u.hostname))return route.fulfill({contentType:'text/html',body:'Offline slide-link destination'});
   return route.abort(); // BM 21a must use its bundled source; no model or external service calls.
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/draft-engine/index.html?ref=Bava%20Metzia%2021a`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>state.ref==='Bava Metzia 21a'&&phraseNavigationAvailable&&!document.getElementById('dafPage').classList.contains('composing'),null,{timeout:60000});
  assert.equal(await page.evaluate(()=>state.navigationUnit),'word');
  const link='https://docs.google.com/presentation/d/lesson-fixture/edit#slide=id.g12345';
  await page.locator('#visualUrl').fill(link);
  // Pasting before selecting a target must explain the next step and retain the link.
  await page.locator('#attachVisual').click({timeout:2000});
  assert.match(await page.locator('#visualStatus').textContent(),/Click a word in the Gemara/);
  assert.equal(await page.locator('#visualUrl').inputValue(),link);
  assert.deepEqual(await page.evaluate(()=>state.visualLinks),{});
  const word=page.locator('.word-token[data-stream="gemara"]').nth(3);
  await word.click();
  const before=await page.evaluate(()=>({index:selectedPhraseIndex(),html:state.gemaraHtml,counts:currentRenderedLineCounts(),boxes:[...document.querySelectorAll('.mapped-line')].map(l=>[l.offsetLeft,l.offsetTop,l.offsetWidth,l.offsetHeight])}));
  assert.notEqual(before.index,null);
  assert.equal(await page.locator('#attachVisual').isEnabled(),true);
  await page.locator('#attachVisual').click();
  assert.equal(await page.evaluate(()=>state.navigationUnit),'phrase');
  assert.equal(await page.locator('#visualUrl').inputValue(),'');
  assert.deepEqual(await page.evaluate(i=>visualLinksFor(i),before.index),[link]);
  assert.match(await page.locator('#visualStatus').textContent(),/has 1 linked visual/);
  assert.equal(await page.locator('.phrase-visual-icon').count(),1);
  assert.deepEqual(await page.evaluate(()=>({html:state.gemaraHtml,counts:currentRenderedLineCounts(),boxes:[...document.querySelectorAll('.mapped-line')].map(l=>[l.offsetLeft,l.offsetTop,l.offsetWidth,l.offsetHeight])})),{html:before.html,counts:before.counts,boxes:before.boxes},'Attaching must preserve source and layout');
  // Duplicate URLs do not create duplicate icons; Enter uses the same attachment path.
  await page.locator('#visualUrl').fill(link);await page.locator('#visualUrl').press('Enter');
  assert.deepEqual(await page.evaluate(i=>visualLinksFor(i),before.index),[link]);
  await page.locator('#visualUrl').fill('javascript:alert(1)');await page.locator('#attachVisual').click();
  assert.match(await page.locator('#visualStatus').textContent(),/complete.*https link/);
  assert.deepEqual(await page.evaluate(i=>visualLinksFor(i),before.index),[link]);
  const popupPromise=context.waitForEvent('page');await page.locator('#openVisual').click();const popup=await popupPromise;await popup.waitForURL(link);await popup.close();
  // Save/Open uses the real project controls and preserves the attachment and target.
  const downloadPromise=page.waitForEvent('download');await page.locator('#saveProject').click();const download=await downloadPromise;
  const saved=await download.path(),project=JSON.parse(fs.readFileSync(saved,'utf8'));assert.deepEqual(project.lesson.visualLinks[before.index],[link]);
  await page.locator('#removeVisual').click();assert.equal(await page.locator('.phrase-visual-icon').count(),0);
  await page.locator('#projectFile').setInputFiles({name:'BM-21a-slides.vds',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(project))});
  await page.waitForFunction(()=>document.getElementById('projectStatus').textContent==='Opened BM-21a-slides.vds.');
  assert.deepEqual(await page.evaluate(i=>visualLinksFor(i),before.index),[link]);assert.equal(await page.locator('.phrase-visual-icon').count(),1);
  // Word navigation remains a valid target after reopening, too.
  await page.locator('#wordNavigation').click();await word.click();
  const canva='https://www.canva.com/design/lesson-fixture/view';await page.locator('#visualUrl').fill(canva);await page.locator('#attachVisual').click();
  assert.deepEqual(await page.evaluate(i=>visualLinksFor(i),before.index),[link,canva]);
  await page.locator('#removeVisual').click();await page.locator('#removeVisual').click();assert.equal(await page.locator('#openVisual').isEnabled(),false);assert.equal(await page.locator('.phrase-visual-icon').count(),0);
  assert.deepEqual(errors,[]);console.log('PASS BM 21a: word-mode attachment, retained paste without selection, URL validation, Enter, duplicate prevention, slide opening, Save/Open, removal and unchanged layout. No paid API calls.');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1});
