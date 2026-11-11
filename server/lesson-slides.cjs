'use strict';
const deck=require('../draft-engine/lesson-deck.js');
const fail=(message,status=422)=>Object.assign(new Error(message),{status});
async function readDeck(url,{fetchImpl=fetch}={}){
 let target;try{target=deck.deckUrl(url).readUrl;}catch(e){throw fail(e.message,400);}
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{
  let response;
  for(let i=0;i<4;i++){
   response=await fetchImpl(target,{redirect:'manual',signal:controller.signal,headers:{Accept:'text/html'}});
   if(response.status>=300&&response.status<400){
    const next=new URL(response.headers.get('location'),target);
    if(next.protocol!=='https:'||next.hostname!=='docs.google.com'||next.username||next.password||next.port)throw fail('This deck requires sign-in. Open its text view and use Load saved slide view; you can keep its current sharing settings.');
    target=next.href;continue;
   }
   break;
  }
  if(!response.ok)throw fail('The deck is not readable from this app. Open its text view and use Load saved slide view; you can keep its current sharing settings.');
  if(Number(response.headers.get('content-length'))>deck.MAX_HTML)throw fail('The slide view is too large (maximum 8 MB).',413);
  let size=0;const chunks=[];
  for await(const chunk of response.body){size+=chunk.length;if(size>deck.MAX_HTML)throw fail('The slide view is too large (maximum 8 MB).',413);chunks.push(Buffer.from(chunk));}
  return deck.parseHtml(Buffer.concat(chunks).toString('utf8'),url);
 }catch(e){if(e.status)throw e;if(e.name==='AbortError')throw fail('Reading the deck timed out. Try again or load a saved slide view.',504);throw fail(e.message?.startsWith('The deck')||e.message?.includes('slide view')?e.message:'Could not read the deck. Try again or load a saved slide view.');}finally{clearTimeout(timer);}
}
function createHandler({fetchImpl=fetch}={}){return async(req,res)=>{
 res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('X-Content-Type-Options','nosniff');
 try{
  if(req.method!=='POST')throw fail('Use Import deck.',405);
  const origin=req.headers.origin,host=req.headers['x-forwarded-host']||req.headers.host;
  if(req.headers['sec-fetch-site']==='cross-site'||origin&&new URL(origin).host!==host)throw fail('Open the program before importing slides.',403);
  let body=req.body;
  if(!body){let bytes=0,chunks=[];for await(const c of req){bytes+=c.length;if(bytes>4096)throw fail('The deck link is too long.',413);chunks.push(c);}try{body=JSON.parse(Buffer.concat(chunks));}catch{throw fail('Paste a Google Slides deck link.',400);}}
  if(typeof body==='string'){try{body=JSON.parse(body);}catch{throw fail('Paste a Google Slides deck link.',400);}}
  if(typeof body?.url!=='string'||body.url.length>2048)throw fail('Paste a Google Slides deck link.',400);
  res.statusCode=200;res.end(JSON.stringify(await readDeck(body.url,{fetchImpl})));
 }catch(e){res.statusCode=e.status||422;res.end(JSON.stringify({error:e.status?e.message:'Could not read this deck. Load a saved slide view instead.'}));}
};}
module.exports={readDeck,createHandler};
