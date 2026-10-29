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
    let modelRequests=0;page.on('request',request=>{if(request.url().includes('/api/agent/')||request.url().includes('/api/local/scan'))modelRequests++;});
    await page.goto(`http://127.0.0.1:${server.address().port}/agent-builder/index.html`,{waitUntil:'networkidle'});
    await page.waitForFunction(()=>frameReady);
    await page.locator('#dafRef').fill('Bava Metzia 22a');await page.locator('#buildDraft').click();
    await page.waitForFunction(()=>diagnostics?.ref==='Bava Metzia 22a');
    await page.locator('#readScan').click();
    await page.waitForFunction(()=>document.getElementById('scanResult').textContent.includes('All source and layout checks passed'));
    assert.equal(modelRequests,0,'Saved 22a does not call AI');
    const result=await page.evaluate(async()=>{
      const win=document.getElementById('draftFrame').contentWindow,evidence=win.captureScanEvidence();
      const pack=await (await fetch('../draft-engine/assets/guidance/bava-metzia-22a.json')).json();
      const word=VilnaScanContract.word,maps={};
      for(const name of ['gemara','inner','tosafot']){let start=0;maps[name]=pack.profile.maps[name].lineEndTokens.map(endToken=>{const words=evidence.streams[name].tokens.slice(start,endToken+1).filter(t=>word(t));start=endToken+1;return {endToken,firstWord:words[0],lastWord:words.at(-1)};});}
      const reading={ref:evidence.ref,uncertainties:[],openingLines:4,maps,stages:pack.profile.layout.stages.map(stage=>({...stage,counts:{gemara:0,inner:0,tosafot:0,...stage.counts}})),typography:pack.profile.typography};
      // Keep the cached page's Rashi overhang for this known unusual first line.
      // A deliberately impossible source boundary must reject before mutation.
      const before=win.captureAgentEvidence();let rejection='';
      const bad=structuredClone(reading);bad.maps.gemara[0].endToken=999999;
      try{await win.applyScanReading({reading:bad,scanUrl:'test'});}catch(error){rejection=error.message;}
      const after=win.captureAgentEvidence();
      const impossible=structuredClone(reading);impossible.typography.gemaraSize=22;
      let rollback='';try{await win.applyScanReading({reading:impossible,scanUrl:'test'});}catch(error){rollback=error.message;}
      await win.nextPaint();await win.nextPaint();
      return {rollback,restored:JSON.stringify(before)===JSON.stringify(win.captureAgentEvidence()),rejection,same:JSON.stringify(before)===JSON.stringify(after),status:document.getElementById('scanResult').textContent,failures:diagnostics.failures,counts:win.currentRenderedLineCounts(),saved:win.projectPayload().daf.scanProfile.maps.gemara.tokenCount};
    });
    assert.match(result.rollback,/Previous page restored/);assert.equal(result.restored,true);assert.match(result.rejection,/boundary/);assert.equal(result.same,true);assert.deepEqual(result.failures,[]);assert.deepEqual(result.counts,{gemara:46,inner:45,tosafot:70});assert.equal(result.saved,386);assert.deepEqual(errors,[]);
    console.log('PASS builder: scan button loads the complete 22a map for free, preserves source, passes all measured rules, saves its profile, rejects malformed AI boundaries and restores the page after failed measured geometry.');

  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
