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
      await compose();await nextPaint();await nextPaint();return {baselineFailures,first,repeated:summarize()};
    });
    assert.deepEqual(errors,[]);assert.deepEqual(result.baselineFailures,[]);
    for(const [name,layout] of Object.entries({first:result.first,repeated:result.repeated})){
      assert.deepEqual(layout.failures,[],name);assert.deepEqual(layout.anchors,[],name);assert.deepEqual(layout.sourceFailures,[],name);
      assert.equal(layout.overflow,0,name);assert.equal(layout.counts.gemara,45,name);assert.equal(layout.narrow,36,name);assert.equal(layout.wide,9,name);assert.equal(layout.wider,true,name);assert.deepEqual(layout.opening,[4,4],name);assert(layout.gap<=1.15,name);
    }
    if(process.env.VILNA_TEST_SCREENSHOT){
      await page.evaluate(()=>{setPageZoom(1);document.body.style.height='auto';document.body.style.overflow='visible';document.querySelector('.stage').style.overflow='visible';});
      await page.locator('#dafPage').screenshot({path:process.env.VILNA_TEST_SCREENSHOT});
    }
    console.log('PASS BM 22a: baseline, immediate correction, repeat composition, 36 narrow + 9 wide lines, opening anchors, source preservation, and measured layout checks.');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
