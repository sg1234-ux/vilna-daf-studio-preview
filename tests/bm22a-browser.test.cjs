// Offline regression: public-domain Hebrew source from Sefaria, with bundled fonts.
// Install Playwright, then: node tests/bm22a-browser.test.cjs
// PLAYWRIGHT_CHROMIUM_EXECUTABLE optionally selects an existing Chromium binary.
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..'),fixtures=path.join(__dirname,'fixtures/bm22a');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf'};
(async()=>{
  let browser;
  const server=http.createServer((request,response)=>{
    const file=path.resolve(root,'.'+decodeURIComponent(new URL(request.url,'http://localhost').pathname));
    if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){response.writeHead(404);response.end();return;}
    response.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(response);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{
    browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox']});
    const page=await browser.newPage({viewport:{width:1400,height:1100}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.route('**/*',async route=>{
      const url=new URL(route.request().url());
      if(url.hostname==='127.0.0.1')return route.continue();
      if(url.hostname==='www.sefaria.org'&&url.pathname.startsWith('/api/texts/')){
        const ref=decodeURIComponent(url.pathname.split('/texts/')[1]).replaceAll(' ','-'),file=path.join(fixtures,ref+'.json');
        return route.fulfill({contentType:'application/json',body:fs.existsSync(file)?fs.readFileSync(file,'utf8'):JSON.stringify({he:[]})});
      }
      return route.abort();
    });
    await page.goto(`http://127.0.0.1:${server.address().port}/draft-engine/index.html?builder=1`,{waitUntil:'networkidle'});
    const result=await page.evaluate(async()=>{
      await document.fonts.ready;document.getElementById('dafRef').value='Bava Metzia 22a';state.rashbamAllowed=false;await loadDaf();
      const baselineFailures=state.composition.failures;
      const settings={stripGemaraDashes:true,openingLines:4,targetLineCounts:{gemara:45},expansionStream:'gemara',expansionLine:37,expansionIntoStream:'inner',lineAnchors:[
        {stream:'gemara',line:1,startText:'וכן',endText:'שנטל'},
        {stream:'gemara',line:2,startText:'נטל',endText:'וירדן'},
        {stream:'gemara',line:3,startText:'דקא חזי',endText:'קא חזי'},
        {stream:'gemara',line:4,startText:'ליה',endText:'בלסטים'}
      ]};
      const summarize=()=>{
        const regions=compositionRegions('gemara'),sourceFailures=[];validateRenderedSource(sourceFailures);
        return {failures:state.composition.failures,counts:currentRenderedLineCounts(),anchors:validateAgentLineAnchors(),sourceFailures,overflow:state.composition.sourceOverflow,narrow:visualLineCount(regions[0]),wide:visualLineCount(regions[1]),wider:regions[1].clientWidth>regions[0].clientWidth,opening:[contentLines(document.getElementById('topLeft')),contentLines(document.getElementById('topRight'))],gap:state.composition.transitionGapLines};
      };
      // Apply immediately, while the previous composition's animation frame is pending.
      await updateAgentSettings(settings);await nextPaint();await nextPaint();const first=summarize();
      // Recompose from the fitted font sizes; calibration must still use the base type.
      await compose();await nextPaint();await nextPaint();const repeated=summarize();
      await updateAgentSettings({enforceGemaraGutterBox:true,enforceStreamContinuity:true,enforceCommentaryContinuity:true,enforceReleasedSpaceTiming:true});await nextPaint();await nextPaint();return {baselineFailures,first,repeated,gutter:summarize(),gutterFailure:state.composition.failures.includes("Gemara top/bottom gutter")};
    });
    assert.deepEqual(errors,[]);assert.deepEqual(result.baselineFailures,[]);assert.equal(result.gutterFailure,false);
    for(const [name,layout] of Object.entries({first:result.first,repeated:result.repeated,gutter:result.gutter})){
      assert.deepEqual(layout.failures,[],name);assert.deepEqual(layout.anchors,[],name);assert.deepEqual(layout.sourceFailures,[],name);
      assert.equal(layout.overflow,0,name);assert.equal(layout.counts.gemara,45,name);assert.equal(layout.narrow,36,name);assert.equal(layout.wide,9,name);assert.equal(layout.wider,true,name);assert.deepEqual(layout.opening,[4,4],name);assert(layout.gap<=1.15,name);
    }
    // Exercise the actual builder's Apply button and rollback guard, with a
    // deterministic proposal; no model request or account is involved.
    await page.goto(`http://127.0.0.1:${server.address().port}/agent-builder/index.html`,{waitUntil:'networkidle'});
    await page.waitForFunction(()=>frameReady);
    await page.evaluate(()=>build('Bava Metzia 22a'));
    await page.waitForFunction(()=>diagnostics?.ref==='Bava Metzia 22a'&&diagnostics.patternName!=='not composed',null,{timeout:60000});
    await page.evaluate(()=>{
      document.getElementById('feedback').value='45 lines 36 narrow 9 wide. line one ends with second שנטל, line 2 begins נטל ends וירדן line begins דקא ends קא חזי line 4 begins ליה ends בלסטים';
      aiReady=true;window.testReviewCalls=0;
      VilnaAgentConnection.review=async()=>{window.testReviewCalls++;return ({summary:'Offline model fixture',reason:'Exercise the real Ask and Apply path without an API request.',clarifications:[],changes:{targetLineCounts:{gemara:34},expansionStream:'gemara',expansionLine:25,expansionIntoStream:'inner',forceCascade:true,preferredSurvivor:'tosafot',completedStream:'inner',continuationLines:2,enforceGemaraGutterBox:true,enforceStreamContinuity:true,enforceCommentaryContinuity:true,enforceReleasedSpaceTiming:true,lineAnchors:[{stream:'gemara',line:2,startText:'נטל',endText:'ירדן'}]}});};renderDiagnostics();
    });
    await page.locator('#askAgent').click();
    await page.waitForFunction(()=>proposedReview&&!reviewing);
    await page.locator('#applyAgent').click();
    await page.waitForFunction(()=>!pendingAdjustment&&document.getElementById('agentResult').textContent.includes('passed measured checks'),null,{timeout:60000});
    const applied=await page.evaluate(()=>({failures:diagnostics.failures,settings:diagnostics.settings,counts:frame.contentWindow.currentRenderedLineCounts()}));
    assert.deepEqual(applied.failures,[]);assert.equal(applied.settings.targetLineCounts.gemara,45);assert.equal(applied.counts.gemara,45);assert.equal(applied.settings.enforceGemaraGutterBox,true);assert.equal(applied.settings.expansionLine,37);assert.equal(applied.settings.lineAnchors.find(a=>a.line===2).endText,"וירדן");assert.equal(applied.settings.lineAnchors.length,4);
    await page.locator('#undoAgent').click();
    await page.waitForFunction(()=>!pendingAdjustment&&!diagnostics.settings.targetLineCounts?.gemara,null,{timeout:60000});
    await page.locator('#applyExactLines').click();
    await page.waitForFunction(()=>!pendingAdjustment&&diagnostics.settings.targetLineCounts?.gemara===45&&document.getElementById('agentResult').textContent.includes('passed measured checks'),null,{timeout:60000});
    const local=await page.evaluate(()=>({calls:window.testReviewCalls,counts:frame.contentWindow.currentRenderedLineCounts(),failures:diagnostics.failures}));
    assert.equal(local.calls,1,'Exact instructions never make a second model request');assert.equal(local.counts.gemara,45);assert.deepEqual(local.failures,[]);
    if(process.env.VILNA_TEST_SCREENSHOT){
      await page.frames().find(frame=>frame.url().includes('/draft-engine/')).evaluate(()=>{setPageZoom(1);document.body.style.height='auto';document.body.style.overflow='visible';document.querySelector('.stage').style.overflow='visible';});
      await page.frameLocator('#draftFrame').locator('#dafPage').screenshot({path:process.env.VILNA_TEST_SCREENSHOT});
    }
    console.log('PASS BM 22a: baseline, immediate correction, repeat composition, 36 narrow + 9 wide lines, opening anchors, source preservation, full Gemara gutter, and measured layout checks.');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
