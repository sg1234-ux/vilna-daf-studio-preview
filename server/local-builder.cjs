'use strict';
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const {spawn}=require('node:child_process');
const {ChatGPTAuth}=require('./chatgpt-auth.cjs');
const service=require('./agent-service.cjs');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.ttf':'font/ttf','.otf':'font/otf','.txt':'text/plain; charset=utf-8'};
const PUBLIC=new Set(['agent-builder','draft-engine','bava-metzia-21a','bava-metzia-21b','pesachim-99b','pesachim-100a','assets']);
const PUBLIC_FILES=new Set(['approved-store.js','phrase-parser.js','launcher.css','launcher.js']);
function problem(status,message){return Object.assign(new Error(message),{status});}
function send(res,status,body){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(body));}
async function readJSON(req){
  if(!String(req.headers['content-type']||'').startsWith('application/json'))throw problem(415,'Expected a JSON request.');
  let bytes=0;const chunks=[];
  for await(const chunk of req){bytes+=chunk.length;if(bytes>service.MAX_BODY)throw problem(413,'Page context is too large.');chunks.push(chunk);}
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw problem(400,'Expected a JSON request.');}
}
function openBrowser(url){
  const child=process.platform==='win32'?spawn('rundll32.exe',['url.dll,FileProtocolHandler',url],{detached:true,stdio:'ignore'}):process.platform==='darwin'?spawn('open',[url],{detached:true,stdio:'ignore'}):spawn('xdg-open',[url],{detached:true,stdio:'ignore'});
  child.on('error',()=>{});child.unref();
}
async function createLocalServer({root=path.resolve(__dirname,'..'),directory,fetchImpl=fetch,port=1455}={}){
  const auth=new ChatGPTAuth({directory,fetchImpl});await auth.init();
  let origin='',busy=false;
  const server=http.createServer(async(req,res)=>{
    res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('Cross-Origin-Resource-Policy','same-origin');
    try{
      if(req.headers.host!==new URL(origin).host)throw problem(403,'Use the local builder address shown in the launcher.');
      const url=new URL(req.url,origin);
      const callback=url.pathname==='/auth/callback';
      if(!callback&&(req.headers.origin&&req.headers.origin!==origin||req.headers['sec-fetch-site']==='cross-site'))throw problem(403,'This request did not come from your local builder.');
      if(req.method==='POST'&&req.headers.origin!==origin)throw problem(403,'Open the builder on this computer before using its controls.');
      if(url.pathname==='/auth/chatgpt'){
        if(req.method!=='GET')throw problem(405,'Use Continue with ChatGPT.');
        const attempt=auth.begin(`${origin}/auth/callback`,url.searchParams.get('account'));
        res.setHeader('Set-Cookie',`vilna_signin=${attempt.browserId}; HttpOnly; SameSite=Lax; Path=/auth; Max-Age=600`);
        res.writeHead(302,{Location:attempt.url});res.end();return;
      }
      if(callback){
        if(req.method!=='GET')throw problem(405,'Expected a ChatGPT sign-in callback.');
        const cookie=String(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('vilna_signin='))?.slice('vilna_signin='.length);
        try{await auth.complete(url,cookie);}catch(error){
          res.setHeader('Set-Cookie','vilna_signin=; HttpOnly; SameSite=Lax; Path=/auth; Max-Age=0');
          res.writeHead(302,{Location:`/agent-builder/?signinError=${encodeURIComponent(error.status?error.message:'ChatGPT sign-in could not complete. Please try again.')}`});res.end();return;
        }
        res.setHeader('Set-Cookie','vilna_signin=; HttpOnly; SameSite=Lax; Path=/auth; Max-Age=0');res.writeHead(302,{Location:'/agent-builder/'});res.end();return;
      }
      if(url.pathname.startsWith('/api/local/')){
        const route=url.pathname.slice('/api/local/'.length);
        if(route==='status'){
          if(req.method!=='GET')throw problem(405,'Expected GET.');
          const account=auth.account();let models=[],error='';
          if(account?.accessToken){try{models=await auth.models();}catch(e){error=e.status?e.message:'Could not reach ChatGPT. Check your internet connection.';}}
          send(res,200,{local:true,aiReady:models.length>0,accounts:auth.accounts(),email:account?.email||'',models,model:models.find(m=>m.id==='gpt-6-astra')?.id||models[0]?.id||'',error,billing:'chatgpt-plan'});return;
        }
        if(route==='signout'){
          if(req.method!=='POST')throw problem(405,'Expected POST.');
          if(busy||auth.refreshing)throw problem(409,'Wait for the current request before signing out.');
          await readJSON(req);send(res,200,await auth.signOut());return;
        }
        if(route==='review'||route==='scan'){
          if(req.method!=='POST')throw problem(405,'Expected POST.');
          if(busy)throw problem(409,'Wait for the current AI review to finish.');
          busy=true;
          try{
            const body=await readJSON(req);if(route==='scan')require('./scan-service.cjs').validate(body);else service.validateBody(body);
            const models=await auth.models();
            if(!models.some(m=>m.id===body.model))throw problem(400,'Choose a model available to your ChatGPT account.');
            const token=await auth.accessToken();
            // Only the selected OAuth token is passed. Never read process.env's API key.
            send(res,200,await (route==='scan'?require('./scan-service.cjs').readScan(body,{OPENAI_API_KEY:token,OPENAI_MODEL:body.model},fetchImpl,{stream:true,planUsage:true,readCompletedStream:service.readCompletedStream}):service.review(body,{OPENAI_API_KEY:token,OPENAI_MODEL:body.model},fetchImpl,{stream:true,planUsage:true})));
          }finally{busy=false;}
          return;
        }
        throw problem(404,'Local agent route not found.');
      }
      if(req.method!=='GET'&&req.method!=='HEAD')throw problem(405,'Expected GET.');
      if(url.pathname==='/'){res.writeHead(302,{Location:'/agent-builder/'});res.end();return;}
      let relative;try{relative=decodeURIComponent(url.pathname).replace(/^\/+/, '');}catch{throw problem(400,'Invalid path.');}
      if((!PUBLIC.has(relative.split('/')[0])&&!PUBLIC_FILES.has(relative))||relative.split('/').some(part=>part.startsWith('.')||part==='..')||relative.includes('\\')||relative.includes('\0'))throw problem(404,'File not found.');
      if(relative.endsWith('/'))relative+='index.html';
      const candidate=path.resolve(root,relative),rootReal=await fs.realpath(root),real=await fs.realpath(candidate).catch(()=>{throw problem(404,'File not found.');});
      if(!real.startsWith(rootReal+path.sep))throw problem(404,'File not found.');
      const data=await fs.readFile(real);res.writeHead(200,{'Content-Type':MIME[path.extname(real)]||'application/octet-stream'});res.end(req.method==='HEAD'?undefined:data);
    }catch(error){send(res,error.status||500,{error:error.status?error.message:'The local builder could not complete this request. No paid API fallback was used.'});}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',()=>{origin=`http://127.0.0.1:${server.address().port}`;resolve();});});
  return {server,auth,origin};
}
if(require.main===module){
  if(Number(process.versions.node.split('.')[0])<22){console.error('Install Node.js 22 or newer from https://nodejs.org, then open Start-Vilna-Builder.cmd again.');process.exitCode=1;}
  else createLocalServer().then(({origin})=>{
    console.log(`Vilna Daf Studio is running on this computer.\nOpen ${origin}/agent-builder/\nKeep this window open while using the builder. Close it to stop.\nSign in with ChatGPT in the builder. This local version never uses your paid API key.`);
    if(!process.argv.includes('--no-open'))openBrowser(`${origin}/agent-builder/`);
  }).catch(error=>{console.error(error.code==='EADDRINUSE'?'The builder may already be running. Open http://127.0.0.1:1455/agent-builder/ or close the other local builder window and try again.':error.message);process.exitCode=1;});
}
module.exports={createLocalServer};

