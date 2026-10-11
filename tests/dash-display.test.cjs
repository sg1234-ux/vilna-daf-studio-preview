const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('draft-engine/app.js','utf8');
const context={state:{ref:'Test 2a',agentSettings:{targetLineCounts:{gemara:54}},composition:{},gemaraHtml:'אב — גד',tosafotHtml:'תוספות'},STREAMS:['gemara','inner','tosafot'],
  tokenize:text=>text.split(' ').map(text=>({text})),displayHtml:x=>x,withoutBreaks:x=>x,innerHtml:()=> 'רשי',referenceProfile:()=>null,
  applyStreamLineAnchors:x=>x,composeCalls:0,async compose(){context.composeCalls++;},decorateGemaraDashes(){},updateDisplayToggles(){},postAgentDiagnostics(){}};
vm.createContext(context);
vm.runInContext(source.slice(source.indexOf('function streamTokens('),source.indexOf('function weightsFor(')),context);
vm.runInContext(source.slice(source.indexOf('function safeAgentSettings('),source.indexOf('window.addEventListener("message",async event=>')),context);
vm.runInContext(source.slice(source.indexOf('function isDisplayPunctuation('),source.indexOf('function decoratePunctuation(')),context);
vm.runInContext(source.slice(source.indexOf('function isDisplayDash('),source.indexOf('function decorateGemaraDashes(')),context);
vm.runInContext(source.slice(source.indexOf('function glyphRun('),source.indexOf('function intersects(')),context);
(async()=>{
  const before=JSON.stringify(context.streamTokens());
  await context.updateAgentSettings({stripGemaraDashes:true});
  assert.equal(context.composeCalls,0,'A display-only request must not recompose a correct page');
  assert.equal(JSON.stringify(context.streamTokens()),before,'Dash removal preserves source tokens, including standalone dashes');
  context.referenceProfile=()=>({maps:{}});context.normalizeMappedSourceTokens=x=>x;
  context.applyExactLineMap=(tokens,map,stream)=>{if(stream==='gemara')assert.equal(tokens.length,3,'Exact line maps receive the original token indices');return tokens;};
  context.streamTokens();
  await context.updateAgentSettings({targetLineCounts:{gemara:54}},true);
  assert.equal(context.composeCalls,0,'Undo restores dash visibility without recomposition');
  assert.equal(context.state.agentSettings.stripGemaraDashes,undefined);
  await context.updateAgentSettings({stripGemaraDashes:true,pageHeight:1100});
  assert.equal(context.composeCalls,1,'Actual layout changes still recompose and validate');
  const font={unitsPerEm:1000,getKerningValue:()=>0,stringToGlyphs:text=>Array.from(text,char=>({unicode:char.codePointAt(0),advanceWidth:500,getPath:x=>({commands:[{}],getBoundingBox:()=>({x1:x,y1:-8,x2:x+4,y2:1}),toPathData:()=>char})}))};
  for(const dash of ['-','‐','‑','‒','–','—','―','−']){
    const visible=context.glyphRun(font,`אב${dash}גד`,12),hidden=context.glyphRun(font,`אב${dash}גד`,12,false,true);
    assert.equal(hidden.advance,visible.advance);assert.deepEqual(hidden.box,visible.box);
    assert(!hidden.d.includes(dash));assert.equal(hidden.d.replace(/[^א-ת]/g,''),visible.d.replace(/[^א-ת]/g,''));
  }
  assert(context.glyphRun(font,'אב־גד',12,false,true).d.includes('־'),'Preserve Hebrew maqaf');
  console.log('PASS: dash-only changes and Undo preserve layout; source/map indices and Hebrew letters survive; SVG advance and baseline stay fixed; layout changes still compose.');
})().catch(e=>{console.error(e);process.exitCode=1;});
