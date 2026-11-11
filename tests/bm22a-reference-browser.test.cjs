// Offline regression: public-domain Hebrew source from Sefaria, with bundled fonts.
// Install Playwright, then: node tests/bm22a-browser.test.cjs
// PLAYWRIGHT_CHROMIUM_EXECUTABLE optionally selects an existing Chromium binary.
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..'),fixtures=path.join(__dirname,'fixtures/bm22a');
const pack=JSON.parse(fs.readFileSync(path.join(root,'draft-engine/assets/guidance/bava-metzia-22a.json'),'utf8'));
const flatten=value=>Array.isArray(value)?value.flat(Infinity).filter(Boolean).join(' '):value;
const hebrewWords=value=>String(value).replace(/<[^>]*>/g,' ').normalize('NFD').replace(/[\u0591-\u05c7]/g,'').split(/[^\u05d0-\u05ea]+/).filter(Boolean);
for(const [key,name] of [['gemaraHtml','Bava-Metzia'],['rashiHtml','Rashi-on-Bava-Metzia'],['tosafotHtml','Tosafot-on-Bava-Metzia']]){
  const original=JSON.parse(fs.readFileSync(path.join(fixtures,name+'-22a.json'),'utf8'));
  assert.deepEqual(hebrewWords(pack.source[key]).sort(),hebrewWords(flatten(original.he)+(key==='gemaraHtml'?' אינן':'')).sort(),name+' complete source words');
}
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
    await page.goto(`http://127.0.0.1:${server.address().port}/draft-engine/index.html?ref=Bava%20Metzia%2022a`,{waitUntil:'networkidle'});
    await page.waitForFunction(()=>state.ref==='Bava Metzia 22a'&&state.composition&&!document.getElementById('dafPage').classList.contains('composing'));
    const result=await page.evaluate(async()=>{
      const summarize=()=>{const pack=referenceProfile(),sourceFailures=[];validateRenderedSource(sourceFailures);
        const regions=compositionRegions('gemara'),inner=compositionRegions('inner')[0],rows=renderedStreamTextRows('gemara');
        return {failures:state.composition.failures,sourceFailures,visibleDashes:[...document.querySelectorAll(".display-dash")].filter(el=>getComputedStyle(el).visibility!=="hidden").length,counts:currentRenderedLineCounts(),narrow:contentLines(regions[0]),wide:contentLines(regions[1]),opening:[contentLines(document.getElementById('topLeft')),contentLines(document.getElementById('topRight'))],ends:rows.map(row=>row.words.map(normalizedAnchorWord).filter(Boolean).at(-1)),topGutter:parseFloat(getComputedStyle(regions[0]).paddingTop),bottomGutter:parseFloat(getComputedStyle(regions[1]).paddingBottom),rashiGutter:parseFloat(getComputedStyle(inner).paddingBottom),widening:regions[1].clientWidth>regions[0].clientWidth,firstWideWidth:regions[1].querySelector('.mapped-line').clientWidth,wideWidth:regions[1].clientWidth-parseFloat(getComputedStyle(regions[1]).paddingLeft)-parseFloat(getComputedStyle(regions[1]).paddingRight),audit:auditReferenceProfile(pack)};};
      await nextPaint();await nextPaint();const initial=summarize();await compose();await nextPaint();await nextPaint();const repeated=summarize();state.nekudosEnabled=false;updateDisplayToggles();await compose();await nextPaint();await nextPaint();return {initial,repeated,unpointed:summarize()};
    });
    assert.deepEqual(errors,[]);
    for(const [name,r] of Object.entries(result)){
      assert.equal(r.visibleDashes,0,name);assert.deepEqual(r.failures,[],name);assert.deepEqual(r.sourceFailures,[],name);assert.deepEqual(r.audit,[],name);
      assert.deepEqual(r.counts,{inner:45,gemara:46,tosafot:70},name);assert.equal(r.narrow,36,name);assert.equal(r.wide,10,name);assert.deepEqual(r.opening,[4,4],name);
      assert.equal(r.ends[0],'שנטל');assert.equal(r.ends[1],'וירדן');assert.equal(r.ends[2],'חזי');assert.equal(r.ends[3],'בלסטים');assert.equal(r.ends[31],'זיל');assert.equal(r.ends[44],'ששמח');assert.equal(r.ends[45],'אינן');
      assert.equal(r.topGutter,25);assert.equal(r.bottomGutter,25);assert.equal(r.rashiGutter,25);assert(r.widening);assert(Math.abs(r.firstWideWidth-r.wideWidth)<=1,'First widened line uses the released Rashi width');
    }
    if(process.env.VILNA_TEST_SCREENSHOT){await page.evaluate(()=>{setPageZoom(1);document.body.style.height='auto';document.body.style.overflow='visible';document.querySelector('.stage').style.overflow='visible';});await page.locator('#dafPage').screenshot({path:process.env.VILNA_TEST_SCREENSHOT});}
    console.log('PASS BM 22a scan reference: all line maps and source, 36 narrow + 9 wide main Gemara lines and final אינן, 45 Rashi / 70 Tosafos lines, four-line opening, immediate widening and gutters, recomposition and nekudos toggle.');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
