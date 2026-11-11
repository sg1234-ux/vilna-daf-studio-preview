const assert=require('node:assert/strict');
const {compile}=require('../agent-builder/scan-contract.js');
const service=require('../server/scan-service.cjs');
const evidence={ref:'Bava Metzia 22b',streams:Object.fromEntries(['gemara','inner','tosafot'].map(s=>[s,{tokens:['אחד','שנים','שלשה','ארבעה']}]))};
const reading={ref:evidence.ref,uncertainties:[],openingLines:1,maps:{gemara:[{endToken:1,firstWord:'אחד',lastWord:'שנים'},{endToken:3,firstWord:'שלשה',lastWord:'ארבעה'}],inner:[{endToken:1,firstWord:'אחד',lastWord:'שנים'},{endToken:3,firstWord:'שלשה',lastWord:'ארבעה'}],tosafot:[{endToken:1,firstWord:'אחד',lastWord:'שנים'},{endToken:3,firstWord:'שלשה',lastWord:'ארבעה'}]},stages:[{streams:['tosafot','gemara','inner'],widths:[1.625,2.5,1.625],counts:{gemara:2,inner:1,tosafot:1}}],typography:{gemaraSize:14.1,commentarySize:9.4,gemaraLeading:16.35,commentaryLeading:14.96,innerLeading:14.35,pageHeight:1160}};
const clone=()=>structuredClone(reading);
assert.equal(compile(reading,evidence,'scan').maps.gemara.tokenCount,4);
for(const [change,message] of [
 [r=>r.maps.gemara.pop(),/omits/],
 [r=>r.maps.gemara[1].endToken=1,/overlapping/],
 [r=>r.maps.inner[0].lastWord='חמש',/endpoints/],
 [r=>r.stages[0].counts.tosafot=0,/counts/],
 [r=>r.ref='Bava Metzia 23a',/different/],
 [r=>r.uncertainties=['Carry word missing from source.'],/Carry word/],
 [r=>r.typography.pageHeight=999999,/typography/]
]){const r=clone();change(r);assert.throws(()=>compile(r,evidence,'scan'),message);}
assert.equal(service.parseRef('Bava Metzia 22a').id,3068);
assert.equal(service.parseRef('Bava Metzia 22b').id,3069);
assert.equal(service.parseRef('Pesachim 100a').id,841);
assert.throws(()=>service.parseRef('Bava Metzia 119b'),/outside/);
assert.throws(()=>service.validate({...evidence,evidence:{...evidence,ref:'bad'}}),/evidence/);
const bytes=Buffer.alloc(12000);bytes[0]=0xff;bytes[1]=0xd8;
const html='<title>E-DAF.com Bava Metzia 22B</title><meta property="og:image" content="http://images.e-daf.com/dafimg.asp?ID=3069&size=1" />';
(async()=>{
 let requests=[],sent;
 const fetchMock=async(url,options)=>{
  requests.push(url);
  if(url.includes('www.e-daf.com'))return new Response(html);
  if(url.includes('images.e-daf.com'))return new Response(bytes,{headers:{'content-type':'image/jpeg'}});
  sent=JSON.parse(options.body);
  return new Response(JSON.stringify({status:'completed',output:[{type:'function_call',name:'propose_scan_map',arguments:JSON.stringify(reading)}]}));
 };
 const result=await service.readScan({ref:evidence.ref,evidence},{OPENAI_API_KEY:'test'},fetchMock);
 assert.equal(result.profile.teacherVerified,false);assert.equal(result.profile.scanRead,true);
 assert.equal(sent.input[0].content[1].type,'input_image');assert.match(sent.input[0].content[1].image_url,/^data:image\/jpeg;base64,/);
 assert.equal(requests.filter(u=>u.includes('api.openai.com')).length,1);
 assert.match(sent.input[0].content[0].text,/indexedSource/);
 let modelRequests=0;
 await assert.rejects(()=>service.readScan({ref:evidence.ref,evidence},{OPENAI_API_KEY:'test'},async url=>{if(url.includes('api.openai.com'))modelRequests++;return new Response(html.replaceAll('3069','3068').replace('22B','22A'));}),/different daf/);
 assert.equal(modelRequests,0);
 await assert.rejects(()=>service.readScan({ref:evidence.ref,evidence},{OPENAI_API_KEY:'test'},async(url,options)=>url.includes('api.openai.com')?new Response('denied',{status:401}):fetchMock(url,options),{planUsage:true}),/No paid API fallback/);
 console.log('PASS scan reader: actual image input, indexed full source, exact coverage/endpoints, geometry allocation, uncertainty rejection, scan identity, one model request and no API fallback. Model responses were mocked.');
})().catch(e=>{console.error(e);process.exitCode=1;});
