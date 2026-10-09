const assert=require('node:assert/strict');
const {Readable}=require('node:stream');
const fs=require('node:fs'),vm=require('node:vm');
const cap=require('../agent-builder/agent-capabilities.js');
const service=require('../server/agent-service.cjs');
const op=(setting,value,more={})=>({setting,value,stream:null,line:null,startText:null,endText:null,...more});
const proposal=operations=>({summary:'Proposed correction.',reason:'Measured checks will run after Apply.',targetRegion:'whole-page',clarifications:[],operations});
const diagnostics={ref:'Bava Metzia 21b',settings:{lineAnchors:[{stream:'gemara',line:1,startText:'וכן',endText:'מה שנטל'}],targetLineCounts:{gemara:54}},failures:[],unplacedCounts:{gemara:0,inner:0,tosafot:0}};
const body={ref:diagnostics.ref,diagnostics,feedback:{note:'Tosafos is chopped off. Keep the Gemara line endings.'},evidence:{ref:diagnostics.ref,streams:{gemara:{sourceText:'וכן ... מה שנטל',lines:[]}}},history:[]};
const env={OPENAI_API_KEY:'test-only-key',AGENT_ACCESS_TOKEN:'test-access-token-at-least-24-characters',AGENT_ALLOWED_ORIGINS:'https://sg1234-ux.github.io'};
function mockModel(p){return async(url,options)=>{
  assert.equal(url,'https://api.openai.com/v1/responses');
  assert.equal(options.headers.Authorization,'Bearer test-only-key');
  const request=JSON.parse(options.body);assert.equal(request.store,false);assert.equal(request.parallel_tool_calls,false);assert.equal(request.tools[0].strict,true);
  assert(JSON.parse(request.input).page.evidence.streams.gemara.sourceText.includes('וכן'));
  assert(request.instructions.includes('AFTER'));assert(request.instructions.includes('unsupported'));
  return {ok:true,json:async()=>({status:'completed',output:[{type:'function_call',name:'propose_layout_correction',arguments:JSON.stringify(p)}]})};
};}
async function invoke(handler,{method='POST',origin='https://sg1234-ux.github.io',token=env.AGENT_ACCESS_TOKEN,payload=body,contentType='application/json'}={}){
  const req=Readable.from([JSON.stringify(payload)]);req.method=method;req.headers={authorization:`Bearer ${token}`,'content-type':contentType,...(origin?{origin}:{})};
  const result={status:200,headers:{}};
  const res={setHeader(k,v){result.headers[k]=v;},writeHead(code,headers){result.status=code;Object.assign(result.headers,headers);},end(text){result.body=text?JSON.parse(text):null;}};
  await handler(req,res);return result;
}
(async()=>{
  let c=cap.compile(proposal([op('openingLines',4),op('stripGemaraDashes',true),op('targetLineCounts',70,{stream:'tosafot'})]),diagnostics.settings);
  assert.equal(c.changes.openingLines,4);assert.equal(c.changes.stripGemaraDashes,true);assert.equal(c.changes.targetLineCounts.gemara,54);
  c=cap.compile(proposal([op('lineAnchors',null,{stream:'gemara',line:2,startText:'אמר רב',endText:'תיקו'})]),diagnostics.settings);
  assert.equal(c.changes.lineAnchors.length,2);assert.equal(c.changes.lineAnchors[0].startText,'וכן');
  for(const operations of [[op('pageHeight',99999)],[op('deleteSource',true)],[op('enforceStreamContinuity',false)],[op('openingLines',4),op('openingLines',5)],[op('lineAnchors',null,{stream:'gemara',line:2,startText:'אמר',endText:null})],[op('expansionStream','gemara'),op('expansionIntoStream','gemara')]])assert.throws(()=>cap.compile(proposal(operations),{}));
  assert.deepEqual(cap.compile({...proposal([op('pageHeight',1100)]),clarifications:['Which line should widen?']},{}).changes,{});
  const review=await service.review(body,env,mockModel(proposal([op('enforceStreamContinuity',true)])));
  assert.equal(review.review.changes.enforceStreamContinuity,true);
  await assert.rejects(service.review({...body,evidence:{ref:'Pesachim 100a'}},env,mockModel(proposal([]))),/another amud/);
  await assert.rejects(service.review(body,{},mockModel(proposal([]))),/API key/);
  await assert.rejects(service.review(body,env,mockModel(proposal([op('pageHeight',1400)]))),/invalid or conflicting/);
  await assert.rejects(service.review(body,env,async()=>({ok:false,status:401})),/connection failed/);
  await assert.rejects(service.review(body,env,async()=>({ok:true,json:async()=>({status:'incomplete',output:[]})})),/did not finish/);
  let paidCalls=0;const handler=service.createHandler('review',{env,fetchImpl:async(...args)=>{paidCalls++;return mockModel(proposal([op('enforceStreamContinuity',true)]))(...args);}});
  assert.equal((await invoke(handler,{token:'wrong'})).status,401);
  assert.equal((await invoke(handler,{origin:'https://evil.example'})).status,403);
  assert.equal((await invoke(handler,{method:'GET'})).status,405);
  assert.equal((await invoke(handler,{contentType:'text/plain'})).status,415);
  assert.equal((await invoke(handler,{payload:{...body,evidence:{ref:'wrong'}}})).status,400);
  assert.equal((await invoke(handler,{payload:{...body,huge:'x'.repeat(service.MAX_BODY)}})).status,413);
  assert.equal(paidCalls,0,'Invalid or unauthorised requests never call the model.');
  assert.equal((await invoke(handler,{method:'OPTIONS',token:''})).status,204);
  for(let i=0;i<10;i++){const response=await invoke(handler);assert.equal(response.status,200);assert.equal(response.body.review.changes.enforceStreamContinuity,true);assert.equal(response.headers['Access-Control-Allow-Origin'],'https://sg1234-ux.github.io');assert(!JSON.stringify(response).includes('test-only-key'));}
  assert.equal((await invoke(handler)).status,429);assert.equal(paidCalls,10);
  const status=await invoke(service.createHandler('status',{env}),{method:'GET'});assert.equal(status.body.aiReady,true);assert(!JSON.stringify(status).includes(env.AGENT_ACCESS_TOKEN));
  assert.equal((await invoke(service.createHandler('status',{env:{...env,OPENAI_API_KEY:''}}),{method:'GET'})).body.aiReady,false);
  const context={window:{},URL,AbortSignal,sessionStorage:{data:new Map(),getItem(k){return this.data.get(k);},setItem(k,v){this.data.set(k,v);},removeItem(k){this.data.delete(k);}},VilnaAgentCapabilities:cap,fetch:async(url,options)=>{assert(!url.includes(env.AGENT_ACCESS_TOKEN));assert.equal(options.credentials,'omit');return {ok:true,json:async()=>review};}};
  vm.createContext(context);vm.runInContext(fs.readFileSync('agent-builder/agent-connection.js','utf8'),context);
  const client=context.window.VilnaAgentConnection;
  assert.throws(()=>client.configure('http://unsafe.example',env.AGENT_ACCESS_TOKEN),/HTTPS/);
  assert.throws(()=>client.configure('https://safe.example/?token=secret',env.AGENT_ACCESS_TOKEN),/HTTPS/);
  client.configure('https://agent.example',env.AGENT_ACCESS_TOKEN);
  assert.equal((await client.review(body)).changes.enforceStreamContinuity,true);
  client.disconnect();assert.deepEqual(JSON.parse(JSON.stringify(client.configuration())),{});
  await assert.rejects(client.review(body),/Connect/);
  // Exercise the actual browser review button: stale/error proposals must never remain applicable.
  const source=fs.readFileSync('agent-builder/app.js','utf8'),nodes={};let click;
  const ui={diagnostics:structuredClone(diagnostics),pendingAdjustment:null,reviewing:false,proposedReview:{changes:{pageHeight:1100}},proposedReviewState:null,aiReady:true,
    $:id=>nodes[id]||(nodes[id]={value:'',disabled:false,textContent:'',classList:{add(){},remove(){}},addEventListener(type,fn){if(id==='askAgent')click=fn;}}),
    frame:{contentWindow:{captureAgentEvidence:()=>body.evidence}},VilnaAgentBrain:{rules:[]},VilnaAgentConnection:{review:async()=>{throw new Error('Provider unavailable.');}},renderDiagnostics(){}};
  vm.createContext(ui);
  vm.runInContext(source.slice(source.indexOf('function reviewStateKey'),source.indexOf('function requestApprovedSnapshot')),ui);
  vm.runInContext(source.slice(source.indexOf('$("askAgent").addEventListener'),source.indexOf('function teacherCommandStream')),ui);
  await click();assert.equal(ui.proposedReview,null);assert.equal(nodes.applyAgent.disabled,true);assert.equal(nodes.agentResult.textContent,'Provider unavailable.');assert.equal(ui.reviewing,false);
  ui.VilnaAgentConnection.review=async()=>{ui.diagnostics={...diagnostics,settings:{pageHeight:1200}};return review.review;};
  await click();assert.equal(ui.proposedReview,null);assert.match(nodes.agentResult.textContent,/changed during review/);assert.equal(nodes.applyAgent.disabled,true);
  ui.VilnaAgentConnection.review=async()=>review.review;
  await click();assert.equal(nodes.applyAgent.disabled,false);assert.equal(ui.proposedReviewState,ui.reviewStateKey());
  // Actual evidence extraction preserves source order and groups physical lines.
  const engine=fs.readFileSync('draft-engine/app.js','utf8');
  const token=(text,left,top)=>({textContent:text,getBoundingClientRect:()=>({left,right:left+10,top,bottom:top+10,height:10})});
  const evidenceContext={state:{ref:diagnostics.ref,mode:'navigate',gemaraHtml:'וכן מה שנטל',tosafotHtml:'תוספות'},innerHtml:()=> 'רשי',STREAMS:['gemara','inner','tosafot'],
    $:()=>({getBoundingClientRect:()=>({left:0,top:0})}),referenceProfile:()=>null,getComputedStyle:()=>({lineHeight:'16'}),document:{createElement:()=>({set innerHTML(value){this.textContent=value;}})},
    streamRegions:stream=>[{querySelectorAll:()=>stream==='gemara'?[token('וכן',90,20),token('מה',70,20),token('שנטל',90,36)]:[token(stream,20,20)]}]};
  vm.createContext(evidenceContext);vm.runInContext(engine.slice(engine.indexOf('function captureAgentEvidence'),engine.indexOf('function postAgentDiagnostics')),evidenceContext);
  const evidence=evidenceContext.captureAgentEvidence();assert.equal(evidence.streams.gemara.lines[0].text,'וכן מה');assert.equal(evidence.streams.gemara.lines[1].text,'שנטל');assert.equal(evidence.streams.gemara.sourceTruncated,false);
  console.log('PASS: model tool contract, combined operations, anchor preservation, ambiguity blocking, server authentication/CORS/body limits/throttle, provider failures, and browser session connection.');
  console.log('PASS: real review-button error/stale-result handling and rendered Hebrew line evidence.');
})().catch(error=>{console.error(error);process.exitCode=1;});
