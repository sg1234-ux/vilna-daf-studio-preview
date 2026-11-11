const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('draft-engine/app.js','utf8');
const state={agentSettings:{targetLineCounts:{gemara:3},lineAnchors:[{stream:'gemara',line:1,startText:'וכן',endText:'שנטל'},{stream:'gemara',line:2,startText:'נטל',endText:'וירדן'},{stream:'gemara',line:3,startText:'דקא חזי',endText:'בלסטים'}]},agentAnchorFailures:[],agentLockedStreams:{}};
const context={state,referenceProfile:()=>null};vm.createContext(context);vm.runInContext(source.slice(source.indexOf('function normalizedAnchorWord'),source.indexOf('function anchorLineTokens')),context);
const words='וכן ירדן שנטל מזה ונתן לזה מה שנטל – נטל ומה שנתן – נתן בשלמא גזלן וירדן דקא חזי להו ומיאש אלא גנב מי קא חזי ליה דמיאש תרגמה רב פפא בלסטים'.split(' ').map(text=>({text}));
const out=context.applyStreamLineAnchors(words,'gemara');const rows=[[]];for(const token of out){if(token.break)rows.push([]);else rows.at(-1).push(token.text)}
assert.equal(rows[0].join(' '),'וכן ירדן שנטל מזה ונתן לזה מה שנטל –');assert.equal(rows[1][0],'נטל');assert.equal(rows[2][0],'דקא');assert.equal(state.agentLockedStreams.gemara,true);assert.equal(JSON.stringify(out.filter(t=>!t.break).map(t=>t.text)),JSON.stringify(words.map(t=>t.text)));// A pointed source and punctuation-only tokens must select the same boundary.
state.agentAnchorFailures=[];state.agentLockedStreams={};
const pointed=words.map(token=>({text:token.text==='שנטל'?'שֶׁנָּטַל,':token.text}));
const pointedResult=context.applyStreamLineAnchors(pointed,'gemara');
assert.equal(pointedResult.filter(token=>token.break).length,2);
assert.equal(state.agentLockedStreams.gemara,true);
assert.equal(state.agentAnchorFailures.length,0);
// Conflicting consecutive anchors fail explicitly without dropping intervening text.
state.agentAnchorFailures=[];state.agentLockedStreams={};state.agentSettings.lineAnchors[1].startText='חסר';
const conflicting=context.applyStreamLineAnchors(words,'gemara');
assert(state.agentAnchorFailures.some(failure=>failure.includes('directly before the next requested opening')));
assert.equal(state.agentLockedStreams.gemara,false);
assert.equal(JSON.stringify(conflicting.filter(token=>!token.break).map(token=>token.text)),JSON.stringify(words.map(token=>token.text)));
console.log('PASS repeated closing words, pointed source, conflicting anchors, and complete source preservation.');
