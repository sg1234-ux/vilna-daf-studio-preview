'use strict';
const assert=require('node:assert/strict'),d=require('../draft-engine/lesson-deck.js'),service=require('../server/lesson-slides.cjs');
const url='https://docs.google.com/presentation/d/fixture_deck_12345/edit#slide=id.old';
function html(slides,id='fixture_deck_12345'){return '<html><title>Test &amp; lesson</title>'+slides.map((text,i)=>`<section class="slide-content" style="background-image:url(https://docs.google.com/presentation/d/${id}/viewpage?pageid=g${i}&amp;rev=1)"><p>${text}</p></section>`).join('')+'</html>';}
const text=html(['אֵלּוּ מְצִיאוֹת שֶׁלּוֹ','English only','<script>alert(1)</script>&#1488;&#x5D1; &lt;test&gt;']),deck=d.parseHtml(text,url);
assert.equal(deck.slides.length,3);assert.equal(deck.slides[0].url,'https://docs.google.com/presentation/d/fixture_deck_12345/edit#slide=id.g0');assert.equal(deck.title,'Test & lesson');assert.equal(deck.slides[2].text,'אב <test>');
assert.throws(()=>d.parseHtml(html(['quote'],'different_deck_1'),url),/different deck/);assert.throws(()=>d.parseHtml('<html>Sign in</html>',url),/requires? sign-in|require sign-in/);
for(const bad of ['http://127.0.0.1','https://docs.google.com.evil.com/presentation/d/fixture_deck_12345/edit','https://www.canva.com/design/foo/view','https://user@docs.google.com/presentation/d/fixture_deck_12345/edit'])assert.throws(()=>d.deckUrl(bad));
const source='אלו מציאות שלו ואלו חייב להכריז מצא פירות מפוזרין'.split(' ').map((text,i)=>({text,wordId:'gemara:'+i,phraseIndex:i<3?0:i<7?1:2}));
let result=d.matchSlides([{text:'אֵלּוּ מְצִיאוֹת שֶׁלּוֹ'},{text:'וְאֵלּוּ חַיָּב לְהַכְרִיז מצא פירות'},{text:'Introduction and explanation'},{text:'אלו מציאות'}],source);
assert.equal(result[0].suggested,0);assert.deepEqual(result[0].choices[0].phraseIndices,[0]);assert.deepEqual(result[1].choices[0].phraseIndices,[1,2]);assert.equal(result[2].suggested,null);assert.equal(result[3].suggested,null,'Short generic quotes must not be guessed');
const repeated=[...source,...source.map(t=>({...t,phraseIndex:t.phraseIndex+3}))];result=d.matchSlides([{text:'אלו מציאות שלו'}],repeated);assert.equal(result[0].suggested,null);assert.equal(result[0].choices.length,2);assert(result[0].choices.every(c=>c.ambiguous));
(async()=>{
 let calls=0;const fetchImpl=async target=>{calls++;assert.equal(target,'https://docs.google.com/presentation/d/fixture_deck_12345/htmlpresent');return new Response(text,{headers:{'content-type':'text/html'}});};
 assert.equal((await service.readDeck(url,{fetchImpl})).slides.length,3);assert.equal(calls,1);
 await assert.rejects(service.readDeck('http://127.0.0.1',{fetchImpl}),/Google Slides/);assert.equal(calls,1,'Invalid URLs never trigger a fetch');
 await assert.rejects(service.readDeck(url,{fetchImpl:async()=>new Response(null,{status:302,headers:{location:'http://127.0.0.1/secrets'}})}),/requires sign-in/);
 await assert.rejects(service.readDeck(url,{fetchImpl:async()=>new Response('Sign in',{status:403})}),/not readable/);
 await assert.rejects(service.readDeck(url,{fetchImpl:async()=>new Response('x',{headers:{'content-length':String(d.MAX_HTML+1)}})}),/too large/);
 const handler=service.createHandler({fetchImpl});function response(){return {headers:{},setHeader(k,v){this.headers[k]=v;},end(body){this.body=JSON.parse(body);}};}
 let res=response();await handler({method:'POST',headers:{origin:'https://program.test',host:'program.test'},body:{url}},res);assert.equal(res.statusCode,200);assert.equal(res.body.slides.length,3);
 res=response();await handler({method:'POST',headers:{origin:'https://other.test',host:'program.test'},body:{url}},res);assert.equal(res.statusCode,403);
 res=response();await handler({method:'GET',headers:{}},res);assert.equal(res.statusCode,405);
 console.log('PASS deck parsing, Hebrew normalization, multi-phrase quotes, repeated-text ambiguity, no-match cases, exact slide IDs, access errors, fetch limits and endpoint validation. No AI services.');
})().catch(e=>{console.error(e);process.exitCode=1});
