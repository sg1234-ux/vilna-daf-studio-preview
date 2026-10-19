// Offline end-to-end deck import on the real BM 21a page and server reader.
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const service=require('../server/lesson-slides.cjs'),root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.ttf':'font/ttf','.otf':'font/otf'};
const deckUrl='https://docs.google.com/presentation/d/fixture_deck_12345/edit';
function escape(s){return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');}
function html(slides){return '<html><title>BM 21a lesson</title>'+slides.map((text,i)=>`<section class="slide-content" style="background-image:url(https://docs.google.com/presentation/d/fixture_deck_12345/viewpage?pageid=gfixture${i}&amp;rev=1)"><p>${escape(text)}</p></section>`).join('')+'</html>';}
(async()=>{
 let browser,fixture='',fetchCalls=0,denied=false,gate=null,release=null;
 const handler=service.createHandler({fetchImpl:async()=>{fetchCalls++;if(gate)await gate;return new Response(denied?'Sign in':fixture,{status:denied?403:200,headers:{'Content-Type':'text/html'}});}});
 const server=http.createServer((req,res)=>{
  if(req.url==='/api/lesson-slides/read')return handler(req,res);
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
  const context=await browser.newContext({viewport:{width:1400,height:1100}}),page=await context.newPage(),errors=[],modelRequests=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',route=>{
   const u=new URL(route.request().url());if(/openai|\/api\/(?:agent|local)\/(?:review|scan)/.test(u.href))modelRequests.push(u.href);
   if(u.hostname==='127.0.0.1')return route.continue();
   if(u.hostname==='docs.google.com')return route.fulfill({contentType:'text/html',body:'Offline slide destination'});
   return route.abort();
  });
  await page.goto(`http://127.0.0.1:${server.address().port}${process.env.LESSON_VIEWER_ENTRY||'/draft-engine/index.html?ref=Bava%20Metzia%2021a'}`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>state.ref==='Bava Metzia 21a'&&phraseNavigationAvailable&&!document.getElementById('dafPage').classList.contains('composing'),null,{timeout:60000});
  const phrases=await page.evaluate(()=>activePhraseProfile.map((text,index)=>({text,index})).filter(p=>p.text.split(/\s+/).length>=4).slice(0,2));assert.equal(phrases.length,2);
  const [first,second]=phrases;fixture=html([first.text,'Explain this illustration','',first.text,second.text,'זברה פיל ארנבת שועל']);
  const layout=await page.evaluate(()=>({html:state.gemaraHtml,counts:typeof currentRenderedLineCounts==='function'?currentRenderedLineCounts():document.querySelectorAll('.mapped-line').length,boxes:[...document.querySelectorAll('.mapped-line')].map(l=>[l.offsetLeft,l.offsetTop,l.offsetWidth,l.offsetHeight])}));
  const row=n=>page.locator(`.lesson-slide-row[data-slide-number="${n}"]`);
  const importDeck=async()=>{await page.locator('#visualUrl').fill(deckUrl);await page.locator('#importLessonDeck').click();await page.locator('#lessonDeckReview').waitFor({state:'visible'});};
  await importDeck();assert.equal(await page.locator('.lesson-slide-row').count(),6);assert.deepEqual(await page.evaluate(()=>state.visualLinks),{},'Import is review-only until applied');
  assert.equal(await row(1).locator('input').isChecked(),true);assert.equal(await row(2).locator('input').isEnabled(),false);assert.equal(await row(3).locator('input').isEnabled(),false);assert.equal(await row(6).locator('input').isEnabled(),false);
  assert.equal(await row(1).locator('a').getAttribute('href'),deckUrl+'#slide=id.gfixture0');
  await page.locator(`.word-token[data-stream="gemara"][data-phrase-index="${second.index}"]`).first().click();await row(2).getByRole('button',{name:'Use selected phrase'}).click();assert.equal(await row(2).locator('input').isChecked(),true);
  await row(5).locator('input').uncheck();await page.locator('#applyLessonDeck').click();
  const savedLinks=await page.evaluate(()=>structuredClone(state.visualLinks));assert.deepEqual(savedLinks[first.index],[deckUrl+'#slide=id.gfixture0',deckUrl+'#slide=id.gfixture3']);assert.deepEqual(savedLinks[second.index],[deckUrl+'#slide=id.gfixture1']);
  assert.match(await page.locator('#lessonDeckStatus').textContent(),/3 slide links added/);
  assert.deepEqual(await page.evaluate(()=>({html:state.gemaraHtml,counts:typeof currentRenderedLineCounts==='function'?currentRenderedLineCounts():document.querySelectorAll('.mapped-line').length,boxes:[...document.querySelectorAll('.mapped-line')].map(l=>[l.offsetLeft,l.offsetTop,l.offsetWidth,l.offsetHeight])})),layout,'Import must not recompose or change the daf');
  // All linked slides remain accessible when two slides share a phrase.
  await page.locator(`.word-token[data-stream="gemara"][data-phrase-index="${first.index}"]`).first().click();await page.locator('#openVisual').click();await page.locator('#lessonVisualDialog').waitFor({state:'visible'});
  assert.deepEqual(await page.locator('#lessonVisualLinks a').evaluateAll(a=>a.map(x=>x.href)),savedLinks[first.index]);
  const popupPromise=context.waitForEvent('page');await page.locator('#lessonVisualLinks a').nth(1).click();const popup=await popupPromise;await popup.waitForURL(deckUrl+'#slide=id.gfixture3');await popup.close();await page.locator('#closeLessonVisualDialog').click();
  const downloadPromise=page.waitForEvent('download');await page.locator('#saveProject').click();const download=await downloadPromise,project=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.deepEqual(project.lesson.visualLinks,savedLinks);
  await page.evaluate(()=>{state.visualLinks={};renderPhraseVisualMarkers();});await page.locator('#projectFile').setInputFiles({name:'Deck-matches.vds',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(project))});
  await page.waitForFunction(()=>document.getElementById('projectStatus').textContent==='Opened Deck-matches.vds.');assert.deepEqual(await page.evaluate(()=>state.visualLinks),savedLinks);
  // Re-import preserves existing links, deduplicates selected slides and supports cancellation.
  await importDeck();for(const n of [4,5])await row(n).locator('input').uncheck();await page.locator('#applyLessonDeck').click();assert.match(await page.locator('#lessonDeckStatus').textContent(),/0 slide links added/);assert.deepEqual(await page.evaluate(()=>state.visualLinks),savedLinks);
  await importDeck();await page.locator('#cancelLessonDeck').click();assert.deepEqual(await page.evaluate(()=>state.visualLinks),savedLinks);
  // Ref changes invalidate both pending review and delayed reads.
  await importDeck();await page.evaluate(()=>state.ref='Bava Metzia 21b');await page.locator('#applyLessonDeck').click();assert.match(await page.locator('#lessonDeckStatus').textContent(),/changed/);assert.deepEqual(await page.evaluate(()=>state.visualLinks),savedLinks);await page.evaluate(()=>state.ref='Bava Metzia 21a');
  gate=new Promise(r=>release=r);const requestPromise=page.waitForRequest(r=>r.url().endsWith('/api/lesson-slides/read'));await page.locator('#importLessonDeck').click();await requestPromise;await page.evaluate(()=>state.ref='Bava Metzia 21b');release();gate=null;await page.waitForFunction(()=>document.getElementById('lessonDeckStatus').textContent.includes('changed while'));await page.evaluate(()=>state.ref='Bava Metzia 21a');
  // Access-denied decks can be read from locally saved HTML without changing sharing.
  denied=true;await page.locator('#importLessonDeck').click();await page.waitForFunction(()=>document.getElementById('lessonDeckStatus').textContent.includes('not readable'));
  const callsBefore=fetchCalls;await page.locator('#lessonDeckFile').setInputFiles({name:'Deck.html',mimeType:'text/html',buffer:Buffer.from(fixture)});await page.locator('#lessonDeckReview').waitFor({state:'visible'});assert.equal(fetchCalls,callsBefore,'Local HTML never leaves the device');await page.locator('#cancelLessonDeck').click();
  await page.locator('#visualUrl').fill('https://www.canva.com/design/fixture/view');await page.locator('#importLessonDeck').click();await page.waitForFunction(()=>document.getElementById('lessonDeckStatus').textContent.includes('currently supports Google Slides'));assert.equal(fetchCalls,callsBefore);
  assert.deepEqual(errors,[]);assert.deepEqual(modelRequests,[]);console.log('PASS BM 21a deck review: quoted Hebrew matching, manual image/English targets, exact slide links, multiple slides per phrase, Save/Open, deduplication, cancellation, stale-page rejection, private HTML fallback and unchanged layout. Zero AI requests.');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1});
