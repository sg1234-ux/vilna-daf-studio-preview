// Offline regression: public-domain Hebrew source from Sefaria, with bundled fonts.
// Install Playwright, then: node tests/pes100b-prepared-browser.test.cjs
// PLAYWRIGHT_CHROMIUM_EXECUTABLE optionally selects an existing Chromium binary.
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..');
const spec=JSON.parse(fs.readFileSync(path.join(root,'preparation/pages/pesachim-100b.json'),'utf8'));
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
    page.on('pageerror',error=>{errors.push(error.message);console.log('PAGE ERROR',error.message);});
    await page.route('**/*',async route=>{
      const url=new URL(route.request().url());
      if(url.hostname==='127.0.0.1')return route.continue();

      return route.abort();
    });
    let modelRequests=0;page.on('request',request=>{if(request.url().includes('/api/agent/')||request.url().includes('/api/local/scan'))modelRequests++;});
    await page.goto(`http://127.0.0.1:${server.address().port}/agent-builder/index.html`,{waitUntil:'networkidle'});
    await page.waitForFunction(()=>frameReady);
    await page.locator('#dafRef').fill('Pesachim 100b');await page.locator('#buildDraft').click();
    await page.waitForFunction(()=>diagnostics?.ref==='Pesachim 100b'&&diagnostics.patternName!=='not composed');
    assert.deepEqual(await page.evaluate(()=>diagnostics.failures),[],'Initial build passes without needing a correction');
    const measured=await page.evaluate(()=>{
      const w=document.getElementById('draftFrame').contentWindow,body=w.document.getElementById('bodyGeometry'),r=body.getBoundingClientRect(),zoom=w.eval('state.pageZoom');
      return {errors:w.VilnaPhysicalPage.validate(w.eval('referenceProfile().physical'),w.document.getElementById('dafPage')),width:body.clientWidth,rows:[...body.querySelectorAll('.mapped-line')].map(l=>({stream:l.dataset.commentator,line:Number(l.dataset.preparedLine),text:l.textContent,align:getComputedStyle(l).textAlignLast})),boxes:[...body.querySelectorAll('.physical-band')].map(b=>({stream:b.firstElementChild.dataset.commentator,x:(b.getBoundingClientRect().left-r.left)/zoom,y:(b.getBoundingClientRect().top-r.top)/zoom,width:b.offsetWidth,height:b.offsetHeight}))};
    });
    assert.deepEqual(measured.errors,[],'Final interactive rendering has no clipping or changed source');
    const normalize=t=>t.normalize('NFD').replace(/[\u0591-\u05c7]/g,'').replace(/[^\u05d0-\u05ea]/g,'');
    for(const [stream,data]of Object.entries(spec.renderInstructions.streams)){
      const rows=measured.rows.filter(r=>r.stream===stream);
      assert.equal(rows.length,data.lines.length,stream);
      for(const [i,line]of data.lines.entries()){assert.equal(rows[i].line,line.line);assert.equal(normalize(rows[i].text),normalize(line.displayText));assert.equal(rows[i].align,line.alignment);}
    }
    const model=spec.renderInstructions,scale=measured.width/(model.coreBox[2]-model.coreBox[0]);
    for(const [i,b]of model.blocks.entries()){
      const actual=measured.boxes[i];assert.equal(actual.stream,b.stream);
      for(const [key,expected]of Object.entries({x:(b.box[0]-model.coreBox[0])*scale,y:(b.box[1]-model.coreBox[1])*scale,width:(b.box[2]-b.box[0])*scale,height:(b.box[3]-b.box[1])*scale}))assert(Math.abs(actual[key]-expected)<1,`${b.id} ${key}`);
    }
    const result=await page.evaluate(async()=>{
      const w=document.getElementById('draftFrame').contentWindow;
      await w.nextPaint();await w.nextPaint();
      const before=w.captureAgentEvidence(),counts=w.currentRenderedLineCounts();
      await w.updateAgentSettings({gemaraAlignment:'right'});await w.nextPaint();await w.nextPaint();
      const last=w.document.querySelector('[data-stream="gemara"] > .mapped-line:last-child');
      const project=w.projectPayload();
      const r={failures:w.eval('state.composition.failures'),counts,alignment:getComputedStyle(last).textAlignLast,prepared:!!project.daf.scanProfile.physical,settings:project.view.agentSettings,footer:w.document.querySelector('[data-commentator="tosafot"][data-band]')?.textContent,sourceSame:before.streams.gemara.sourceText===w.captureAgentEvidence().streams.gemara.sourceText};
      await w.openProjectFile({name:'saved.vds',text:async()=>JSON.stringify(project)});await w.nextPaint();await w.nextPaint();
      r.restored=w.currentRenderedLineCounts();r.restoredAlignment=getComputedStyle(w.document.querySelector('[data-stream="gemara"] > .mapped-line:last-child')).textAlignLast;
      return r;
    });

    const draftFrame=page.frames().find(f=>f.url().includes('/draft-engine/'));
    const geometry=()=>draftFrame.evaluate(()=>{
      const line=(s,n)=>document.querySelector(`[data-commentator="${s}"] > .mapped-line[data-prepared-line="${n}"]`),gem1=line('gemara',1),rashi6=line('rashi',6),gem14=line('gemara',14),gem15=line('gemara',15),tos70=line('tosafot',70),tos71=line('tosafot',71),zoom=state.pageZoom;
      return {baselineDelta:Math.abs(VilnaPhysicalPage.baseline(gem1)-VilnaPhysicalPage.baseline(rashi6))/zoom,previewGap:(gem15.getBoundingClientRect().top-gem14.getBoundingClientRect().bottom)/zoom,footerPitch:(VilnaPhysicalPage.baseline(tos71)-VilnaPhysicalPage.baseline(tos70))/zoom,normalPitch:tos70.getBoundingClientRect().height/zoom,pointed:/[\u05b0-\u05bc]/.test(document.querySelector('[data-stream="gemara"][data-band]').textContent),counts:currentRenderedLineCounts(),failures:state.composition.failures};
    });
    const initialGeometry=await geometry();assert(initialGeometry.baselineDelta<.5);assert(initialGeometry.previewGap>=-.5);assert(Math.abs(initialGeometry.footerPitch-initialGeometry.normalPitch)<.5);assert(initialGeometry.pointed);
    // These exact teacher requests must work locally even with a model connected.
    await page.evaluate(()=>{aiReady=true;window.testModelReviews=0;VilnaAgentConnection.review=async()=>{testModelReviews++;throw Error('A local scan correction must not call the model');};renderDiagnostics();});
    for(const [note,target,setting]of [
      ['line 1 of gemara should be parralel to line 6 of rashi','whole-page','physicalEdits'],
      ['line 15 is overlapping line 14','gemara','physicalEdits'],
      ['The last line of tosafos needs to flow continuosly from the second last line no large linebreaks','tosafos','physicalEdits']
    ]){
      await page.locator('#targetRegion').selectOption(target);await page.locator('#feedback').fill(note);await page.locator('#askAgent').click();
      await page.waitForFunction(()=>proposedReview&&!reviewing);assert.equal(await page.evaluate(k=>Boolean(proposedReview.changes[k]),setting),true,note);
      assert.match(await page.locator('#agentResult').textContent(),/Local scan proposal/);
      await page.locator('#applyAgent').click();await page.waitForFunction(()=>!pendingAdjustment&&document.getElementById('agentResult').textContent.includes('passed measured checks'));
      const g=await geometry();assert.deepEqual(g.failures,[]);assert(g.baselineDelta<.5);assert(g.previewGap>=-.5);assert(Math.abs(g.footerPitch-g.normalPitch)<.5);
    }
    await draftFrame.locator('#nekudosToggle').click();await draftFrame.waitForFunction(()=>!state.nekudosEnabled&&!document.getElementById('dafPage').classList.contains('composing'));
    assert.equal((await geometry()).pointed,false);
    await page.locator('#feedback').fill('add nekudos');await page.locator('#askAgent').click();await page.waitForFunction(()=>proposedReview&&!reviewing);assert.equal(await page.evaluate(()=>proposedReview.changes.showNekudos),true);
    await page.locator('#applyAgent').click();await page.waitForFunction(()=>!pendingAdjustment&&document.getElementById('agentResult').textContent.includes('passed measured checks'));assert.equal((await geometry()).pointed,true);
    assert.equal(await page.evaluate(()=>testModelReviews),0);
    const restoredEdits=await draftFrame.evaluate(async()=>{const project=projectPayload();await openProjectFile({name:'corrections.vds',text:async()=>JSON.stringify(project)});await nextPaint();await nextPaint();return {edits:state.agentSettings.physicalEdits,nekudos:state.nekudosEnabled};});
    assert.equal(restoredEdits.edits.baselineAnchors[0].referenceLine,6);assert.equal(restoredEdits.nekudos,true);
    assert((await geometry()).baselineDelta<.5);assert((await geometry()).previewGap>=-.5);
    await page.evaluate(()=>{aiReady=false;renderDiagnostics();});
    await page.evaluate(()=>{aiReady=true;renderDiagnostics();});
    const formattingRequests=[['make the dibbur hamschilim not bold',false],['make the dibbur hamschilim bold',true],['make the dibbur hamaschilim a little bigger',true]];
    for(const [note,bold]of formattingRequests){
      await page.locator('#targetRegion').selectOption('whole-page');await page.locator('#feedback').fill(note);await page.locator('#askAgent').click();await page.waitForFunction(()=>proposedReview&&!reviewing);assert.equal(await page.evaluate(()=>Boolean(proposedReview.changes.textFormatting?.length)),true,note);await page.locator('#applyAgent').click();await page.waitForFunction(()=>!pendingAdjustment);console.log(note,await page.locator('#agentResult').textContent());assert.match(await page.locator('#agentResult').textContent(),/passed measured checks/);
      const marked=await draftFrame.evaluate(()=>[...document.querySelectorAll('.word-token[data-dibbur="true"]')].map(e=>({weight:getComputedStyle(e).fontWeight,size:getComputedStyle(e).fontSize,stream:e.closest('[data-commentator]').dataset.commentator})));assert(marked.length>15);assert(marked.every(e=>Number(e.weight)===(bold?700:400)));assert.deepEqual(new Set(marked.map(e=>e.stream)),new Set(['rashi','rashbam','tosafot']));
    }
    await page.locator('#feedback').fill('make the Tosafos dibbur hamaschilim 14px');await page.locator('#askAgent').click();await page.waitForFunction(()=>proposedReview&&!reviewing);assert.equal(await page.evaluate(()=>proposedReview.changes.textFormatting.at(-1).fontSize),14);await page.locator('#applyAgent').click();await page.waitForFunction(()=>!pendingAdjustment&&document.getElementById('agentResult').textContent.includes('passed measured checks'));
    await draftFrame.locator('.word-token[data-stream="inner"]:not([data-dibbur="true"])').first().click();
    await page.locator('#feedback').fill('make the selected word bold');await page.locator('#askAgent').click();await page.waitForFunction(()=>proposedReview&&!reviewing);assert.equal(await page.evaluate(()=>proposedReview.changes.textFormatting.at(-1).scope),'words');assert.equal(await page.evaluate(()=>proposedReview.changes.textFormatting.at(-1).ids.length),1);await page.locator('#applyAgent').click();await page.waitForFunction(()=>!pendingAdjustment&&document.getElementById('agentResult').textContent.includes('passed measured checks'));
    assert.equal(await draftFrame.evaluate(()=>getComputedStyle(selectedWordElement()).fontWeight),'700');
    const formattedProject=await draftFrame.evaluate(async()=>{const project=projectPayload();for(const name of ['rashi','rashbam','tosafot'])for(const token of project.daf.scanProfile.physical.streams[name].tokens)delete token.dibbur;await openProjectFile({name:'formatted.vds',text:async()=>JSON.stringify(project)});await nextPaint();await nextPaint();return {settings:state.agentSettings,failures:state.composition.failures,marked:document.querySelectorAll('.word-token[data-dibbur="true"]').length};});assert(formattedProject.settings.textFormatting.length>=2);assert.deepEqual(formattedProject.failures,[]);assert(formattedProject.marked>15);
    assert.equal(await page.evaluate(()=>testModelReviews),0,'Text formatting is local even with a model connected');
    await page.evaluate(()=>{aiReady=false;renderDiagnostics();});
    const blocked=await page.evaluate(async()=>{
      const w=document.getElementById('draftFrame').contentWindow,before=w.projectPayload();
      await w.updateAgentSettings({targetLineCounts:{gemara:10}});
      return {before:before.view.agentSettings,after:w.projectPayload().view.agentSettings,status:w.document.getElementById('loadStatus').textContent};
    });
    assert.deepEqual(blocked.after,blocked.before);assert.match(blocked.status,/revised page map/);
    // Clear the reported rejected correction before exercising the real local UI.
    await page.evaluate(async()=>{const w=document.getElementById('draftFrame').contentWindow;await w.compose();await w.nextPaint();await w.nextPaint();});
    const draft=page.frames().find(frame=>frame.url().includes('/draft-engine/'));
    await draft.evaluate(()=>{setPageZoom(1);document.body.style.height='auto';document.body.style.overflow='visible';document.querySelector('.stage').style.overflow='visible';});

    await page.locator('#feedback').fill('Align Gemara line 14 to the left');
    await page.locator('#targetRegion').selectOption('gemara');
    await page.locator('#askAgent').click();await page.waitForFunction(()=>proposedReview&&!reviewing);
    await page.locator('#applyAgent').click();
    await page.waitForFunction(()=>!pendingAdjustment&&diagnostics.settings.gemaraAlignment==='left');
    const applied=await draft.evaluate(()=>({alignment:getComputedStyle(document.querySelector('[data-prepared-line="14"][data-commentator="gemara"]')).textAlignLast,preview:getComputedStyle(document.querySelector('[data-prepared-line="15"][data-commentator="gemara"]')).textAlignLast,failures:state.composition.failures}));
    assert.equal(applied.alignment,'left');assert.equal(applied.preview,'left');assert.deepEqual(applied.failures,[]);
    assert.match(await page.locator('#readScan').textContent(),/saved 100b scan \(free\)/);
    await page.locator('#readScan').click();await page.waitForFunction(()=>!reviewing);
    assert.deepEqual(await page.evaluate(()=>diagnostics.failures),[]);

    assert.equal(modelRequests,0);assert.deepEqual(result.failures,[]);assert.deepEqual(result.counts,{gemara:15,inner:69,tosafot:72});assert.equal(result.alignment,'right');assert.equal(result.prepared,true);assert.equal(result.sourceSame,true);assert.deepEqual(result.restored,result.counts);assert.equal(result.restoredAlignment,'right');assert.deepEqual(errors,[]);
    await page.goto(`http://127.0.0.1:${server.address().port}/agent-builder/index.html?ref=Pesachim%20100b`,{waitUntil:'networkidle'});
    await page.waitForFunction(()=>diagnostics?.patternName==='Saved scan instructions — Pesachim 100b');
    assert.deepEqual(await page.evaluate(()=>diagnostics.failures),[]);
    assert.equal(modelRequests,0,'Direct builder link is free too');
    await page.goto(`http://127.0.0.1:${server.address().port}/draft-engine/index.html?ref=Pesachim%20100b`,{waitUntil:'networkidle'});
    await page.waitForFunction(()=>state.ref==='Pesachim 100b'&&state.composition&&!document.getElementById('dafPage').classList.contains('composing'));
    await page.evaluate(async()=>{await nextPaint();await nextPaint();setPageZoom(1);document.body.style.height='auto';document.body.style.overflow='visible';document.querySelector('.stage').style.overflow='visible';});
    await page.locator('#dafPage').screenshot({path:'/tmp/pesachim-100b-connected.png'});
    assert.deepEqual(await page.evaluate(()=>state.composition.failures),[]);
    console.log('PASS 100b builder: automatic saved instructions, four streams, no inference, all line checks, alignment edit, project restore, local Ask/Apply, and free saved-scan rebuild.');

  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
