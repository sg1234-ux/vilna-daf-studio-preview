'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),vm=require('node:vm');
const {Readable}=require('node:stream');
const {ChatGPTAuth,verifyIdentity}=require('../server/chatgpt-auth.cjs');
const {createLocalServer}=require('../server/local-builder.cjs');
const {readCompletedStream}=require('../server/agent-service.cjs');
const issuer='https://auth.openai.com';
const {privateKey,publicKey}=crypto.generateKeyPairSync('rsa',{modulusLength:2048});
const jwk={...publicKey.export({format:'jwk'}),kid:'test-key',alg:'RS256',use:'sig'};
const json=value=>({ok:true,status:200,json:async()=>value});
const scopes='openid profile email offline_access resource.invoke chatgpt.tokens.use.direct';
function jwt(claims){
  const data=[{alg:'RS256',kid:'test-key'},claims].map(x=>Buffer.from(JSON.stringify(x)).toString('base64url')).join('.');
  return `${data}.${crypto.sign('sha256',Buffer.from(data),privateKey).toString('base64url')}`;
}
const claims=(nonce,more={})=>({iss:issuer,aud:'oaiapp_test',sub:'test-person',email:'teacher@example.test',exp:Math.floor(Date.now()/1000)+3600,nonce,...more});
const proposal={summary:'Hide Gemara dashes.',reason:'Preserve the word placement.',targetRegion:'gemara',clarifications:[],operations:[{setting:'stripGemaraDashes',value:true,stream:null,line:null,startText:null,endText:null}]};
const body={ref:'Bava Metzia 21b',diagnostics:{ref:'Bava Metzia 21b',settings:{}},feedback:{note:'remove dashes'},evidence:{ref:'Bava Metzia 21b'},model:'account-model'};
function completed(){return {type:'response.completed',response:{status:'completed',output:[{type:'function_call',name:'propose_layout_correction',arguments:JSON.stringify(proposal)}]}};}
const streamed=(event=completed())=>({ok:true,status:200,body:Readable.from([Buffer.from(`data: ${JSON.stringify(event)}\n\n`)])});
(async()=>{
  const temporary=await fs.mkdtemp(path.join(os.tmpdir(),'vilna-plan-tests-'));
  let nonce,planCalls=0,refreshCalls=0,modelError=false,scopeOverride=null;
  const fetchImpl=async(url,options={})=>{
    if(url.endsWith('/jwks.json'))return json({keys:[jwk]});
    if(url.endsWith('/openid-configuration'))return json({revocation_endpoint:`${issuer}/revoke`});
    if(url.endsWith('/revoke'))return {ok:true,status:200};
    if(url.endsWith('/oauth/token')){
      const form=new URLSearchParams(options.body);assert.equal(form.get('resource'),'https://api.openai.com/v1');assert(!form.has('client_secret'));assert.equal(form.get('client_id'),'oaiapp_test');
      if(form.get('grant_type')==='refresh_token'){
        refreshCalls++;assert.equal(form.get('refresh_token'),'refresh-only-oauth');assert(!form.has('scope'));
        await new Promise(resolve=>setTimeout(resolve,10));
        return json({access_token:'renewed-oauth',refresh_token:'rotated-refresh',token_type:'Bearer',expires_in:3600,scope:scopes});
      }
      assert(form.get('code_verifier'));assert(form.get('redirect_uri').startsWith('http://127.0.0.1:'));
      return json({access_token:'only-oauth',refresh_token:'refresh-only-oauth',id_token:jwt(claims(nonce)),token_type:'Bearer',expires_in:3600,scope:scopeOverride||scopes});
    }
    if(url==='https://api.openai.com/v1/models'){
      assert(['Bearer only-oauth','Bearer renewed-oauth'].includes(options.headers.Authorization));
      return json({models:[{slug:'hidden-model',display_name:'Hidden',visibility:'hide'},{slug:'account-model',display_name:'Account model',visibility:'list'}]});
    }
    if(url==='https://api.openai.com/v1/responses'){
      planCalls++;assert(['Bearer only-oauth','Bearer renewed-oauth'].includes(options.headers.Authorization));
      const input=JSON.parse(options.body);assert.equal(input.model,'account-model');assert.equal(input.stream,true);assert.equal(input.store,false);assert.equal(input.tools[0].strict,true);
      if(modelError)return {ok:false,status:429};
      return streamed();
    }
    throw new Error(`Unexpected endpoint ${url}`);
  };
  let running;
  try{
    // Verify signature, issuer, audience, expiry, nonce, and returning identity.
    const checked=await verifyIdentity(jwt(claims('right')),{clientId:'oaiapp_test',nonce:'right',fetchImpl});assert.equal(checked.sub,'test-person');
    for(const bad of [{iss:'https://evil.test'},{aud:'other-client'},{exp:0},{nonce:'wrong'},{sub:'other-user'}]){
      await assert.rejects(verifyIdentity(jwt(claims('right',bad)),{clientId:'oaiapp_test',nonce:'right',subject:'test-person',fetchImpl}),/could not be verified/);
    }
    await assert.rejects(verifyIdentity(`${jwt(claims('right')).slice(0,-8)}invalid`,{clientId:'oaiapp_test',nonce:'right',fetchImpl}),/could not be verified/);
    running=await createLocalServer({directory:path.join(temporary,'signed-in'),fetchImpl,port:0});
    const {origin,auth}=running;
    const builderPage=await fetch(`${origin}/agent-builder/`);assert.equal(builderPage.status,200);assert.match(await builderPage.text(),/Continue with ChatGPT/);
    for(const asset of ['/agent-builder/app.js','/agent-builder/styles.css','/agent-builder/agent-connection.js','/draft-engine/index.html','/draft-engine/app.js','/approved-store.js','/phrase-parser.js'])assert.equal((await fetch(origin+asset)).status,200,`${asset} is served by the personal builder`);
    const before=await fetch(`${origin}/api/local/status`).then(r=>r.json());assert.equal(before.aiReady,false);assert.equal(planCalls,0);
    assert.equal((await fetch(`${origin}/api/local/review`,{method:'POST',headers:{Origin:'https://evil.test','Content-Type':'application/json'},body:JSON.stringify(body)})).status,403);
    assert.equal((await fetch(`${origin}/api/local/review`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})).status,403);
    assert.equal((await fetch(`${origin}/server/chatgpt-auth.cjs`)).status,404);
    assert.equal((await fetch(`${origin}/api/agent/review`,{method:'POST',headers:{Origin:origin}})).status,405,'Local server has no paid-agent proxy.');
    const first=await fetch(`${origin}/auth/chatgpt`,{redirect:'manual'});assert.equal(first.status,302);
    const authorize=new URL(first.headers.get('location'));nonce=authorize.searchParams.get('nonce');
    assert.equal(authorize.origin,issuer);assert.equal(authorize.searchParams.get('client_id'),'dynamic_agent_client');assert.equal(authorize.searchParams.get('agent_name_hint'),'Vilna Daf Studio');
    assert(authorize.searchParams.get('scope').includes('chatgpt.tokens.use.direct'));
    const attempt=auth.pending.get(authorize.searchParams.get('state'));
    assert.equal(authorize.searchParams.get('code_challenge'),crypto.createHash('sha256').update(attempt.verifier).digest('base64url'));
    const callback=new URL(authorize.searchParams.get('redirect_uri'));callback.search=new URLSearchParams({code:'one-use-code',state:attempt.state,client_id:'oaiapp_test'}).toString();
    await assert.rejects(auth.complete(callback,'wrong-browser'),/could not be verified/);
    const cookie=first.headers.get('set-cookie').split(';')[0];
    const completedCallback=await fetch(callback,{headers:{Cookie:cookie},redirect:'manual'});assert.equal(completedCallback.status,302);assert.equal(completedCallback.headers.get('location'),'/agent-builder/');
    await assert.rejects(auth.complete(callback,attempt.browserId),/could not be verified/,'Callback cannot be replayed.');
    const status=await fetch(`${origin}/api/local/status`).then(r=>r.json());assert.equal(status.aiReady,true);assert.equal(status.models.length,1);assert.equal(status.model,'account-model');
    assert(!JSON.stringify(status).includes('only-oauth'));assert(!JSON.stringify(status).includes('refresh-only-oauth'));
    const hostId=auth.state.hostId;
    const resumed=new ChatGPTAuth({directory:auth.directory,fetchImpl});await resumed.init();assert.equal(resumed.state.hostId,hostId);assert.equal(resumed.account().subject,'test-person');
    if(process.platform!=='win32')assert.equal((await fs.stat(path.join(auth.directory,'chatgpt.json'))).mode&0o777,0o600);
    auth.account().expiresAt=0;
    const renewed=await Promise.all([auth.accessToken(),auth.accessToken(),auth.accessToken()]);assert.deepEqual(renewed,['renewed-oauth','renewed-oauth','renewed-oauth']);assert.equal(refreshCalls,1);assert.equal(auth.account().refreshToken,'rotated-refresh');
    const oldKey=process.env.OPENAI_API_KEY;process.env.OPENAI_API_KEY='paid-key-must-never-be-used';
    const post=payload=>fetch(`${origin}/api/local/review`,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(payload)});
    try{
      assert.equal((await post({...body,model:'unlisted-model'})).status,400);assert.equal(planCalls,0);
      assert.equal((await post({...body,evidence:{ref:'other-daf'}})).status,400);assert.equal(planCalls,0);
      const response=await post(body);assert.equal(response.status,200);assert.equal((await response.json()).review.changes.stripGemaraDashes,true);assert.equal(planCalls,1);
      modelError=true;const limited=await post(body);assert.equal(limited.status,429);assert.match((await limited.json()).error,/No paid API fallback/);assert.equal(planCalls,2);modelError=false;
    }finally{if(oldKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=oldKey;}
    const signedOut=await fetch(`${origin}/api/local/signout`,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'{}'});assert.equal(signedOut.status,200);assert.equal((await signedOut.json()).revoked,true);
    assert.equal(auth.account(),undefined);assert(!JSON.stringify(auth.state).includes('only-oauth'));assert.equal(auth.state.accounts[0].clientId,'oaiapp_test');assert.equal(auth.state.hostId,hostId);
    const reauth=auth.begin(`${origin}/auth/callback`,'oaiapp_test');assert.equal(new URL(reauth.url).searchParams.get('client_id'),'oaiapp_test');assert(!new URL(reauth.url).searchParams.has('agent_name_hint'));
    nonce=new URL(reauth.url).searchParams.get('nonce');scopeOverride='openid email profile';
    const denied=new URL(`${origin}/auth/callback`);denied.search=new URLSearchParams({state:new URL(reauth.url).searchParams.get('state'),code:'new-code'}).toString();
    await assert.rejects(auth.complete(denied,reauth.browserId),/plan use was not enabled/);assert.equal(auth.account(),undefined);scopeOverride=null;
    // Stream decoding must handle UTF-8 and CRLF split across chunks and refuse partial responses.
    const wire=Buffer.from(`event: response.completed\r\ndata: ${JSON.stringify(completed())}\r\n\r\n`);
    const chunks=[];for(let i=0;i<wire.length;i++)chunks.push(wire.subarray(i,i+1));
    assert.equal((await readCompletedStream({body:Readable.from(chunks)})).status,'completed');
    await assert.rejects(readCompletedStream(streamed({type:'response.output_text.delta',delta:'unfinished'})),/did not finish/);
    await assert.rejects(readCompletedStream(streamed({type:'response.incomplete'})),/did not finish/);
    // Browser local mode cannot reuse a remote saved API connection or expose OAuth credentials.
    const context={window:{},location:{hostname:'127.0.0.1',origin},URL,AbortSignal,TextEncoder,sessionStorage:{getItem:()=>JSON.stringify({base:'https://paid.example',token:'paid-password'}),removeItem(){}},VilnaAgentCapabilities:require('../agent-builder/agent-capabilities.js'),fetch:async(url,options)=>{
      assert.equal(url,`${origin}/api/local/review`);assert.equal(options.credentials,'same-origin');assert(!options.headers.Authorization);assert.equal(JSON.parse(options.body).model,'account-model');return json({review:proposal});
    }};
    vm.createContext(context);vm.runInContext(await fs.readFile('agent-builder/agent-connection.js','utf8'),context);const client=context.window.VilnaAgentConnection;
    assert.equal(client.isLocal,true);assert.equal(client.configuration().base,origin);assert.throws(()=>client.configure('https://paid.example','paid-password'),/Continue with ChatGPT/);client.setModel('account-model');assert.equal((await client.review(body)).changes.stripGemaraDashes,true);
    console.log('PASS: real loopback HTTP sign-in/callback/status/review/sign-out, PKCE, browser-bound state, signature/issuer/audience/nonce/expiry validation, scope rejection, protected persistence, stable account/host mapping, and serial refresh rotation.');
    console.log('PASS: model catalog selection, streamed corrections, partial-response rejection, CSRF blocking, local-only browser transport, and no paid API fallback when plan usage fails.');
  }finally{if(running){running.server.closeAllConnections();await new Promise(resolve=>running.server.close(resolve));}await fs.rm(temporary,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
