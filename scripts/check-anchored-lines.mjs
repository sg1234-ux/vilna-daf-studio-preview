import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../draft-engine/app.js',import.meta.url),'utf8');
const guidance=JSON.parse(fs.readFileSync(new URL('../draft-engine/assets/guidance/bava-metzia-21b.json',import.meta.url),'utf8'));
const fixture=JSON.parse(fs.readFileSync(new URL('./bm21b-source-fixture.json',import.meta.url),'utf8'));
const context=vm.createContext({state:{agentSettings:guidance.settings,agentAnchorFailures:[],agentLockedStreams:{}},STREAMS:['inner','gemara','tosafot'],referenceProfile:()=>null});
vm.runInContext(source.slice(source.indexOf('function normalizedAnchorWord('),source.indexOf('function anchorLineTokens(')),context);
vm.runInContext(source.slice(source.indexOf('function safeAgentSettings('),source.indexOf('window.addEventListener("message"')),context);
vm.runInContext(source.slice(source.indexOf('function isAleph('),source.indexOf('function toHebrewNumber(')),context);
vm.runInContext(source.slice(source.indexOf('function splitMappedLines('),source.indexOf('function mappedCommentEndsHere(')),context);
const tokens=fixture.he.join(' ').replace(/<[^>]+>/g,' ').split(/\s+/u).filter(word=>context.normalizedAnchorWord(word)).map(text=>({text}));
const anchored=context.applyStreamLineAnchors(tokens,'gemara'),lines=context.splitMappedLines(anchored);
assert.equal(lines.length,54);assert.equal(anchored.filter(token=>token.break).length,53);
assert.deepEqual(Array.from(anchored.filter(token=>!token.break),t=>t.text),tokens.map(t=>t.text));
assert.equal(context.state.agentLockedStreams.gemara,true);
assert.equal(context.state.agentAnchorFailures.length,0);
for(let i=0;i<54;i++){
 const normalized=lines[i].map(t=>context.normalizedAnchorWord(t.text));
 const anchor=guidance.settings.lineAnchors[i];
 const start=Array.from(context.anchorPhraseWords(anchor.startText)),end=Array.from(context.anchorPhraseWords(anchor.endText));
 assert.deepEqual(Array.from(normalized.slice(0,start.length)),start);
 assert.deepEqual(Array.from(normalized.slice(-end.length)),end);
}
assert.match(lines[39].map(t=>context.normalizedAnchorWord(t.text)).join(' '),/^דאיכא עניים הכא הנך מעיקרא איאושי$/);
assert.equal(context.normalizedAnchorWord(lines[52].at(-1).text),'תא');
assert.equal(context.normalizedAnchorWord(lines[53][0].text),'שמע');
assert.deepEqual(Array.from(context.physicalOrder()),['inner','gemara','tosafot']);
assert.equal(context.safeAgentSettings({innerSide:'left'}).innerSide,'left');
assert.equal(guidance.settings.expansionIntoStream,'inner');
assert.equal(context.safeAgentSettings({innerSide:'invalid'}).innerSide,undefined);
context.state.agentSettings={targetLineCounts:{gemara:55},lineAnchors:guidance.settings.lineAnchors};
context.state.agentLockedStreams={};context.applyStreamLineAnchors(tokens,'gemara');
assert.equal(context.state.agentLockedStreams.gemara,false,'Changed counts must not be hardcoded to 54');
context.state.agentSettings={};context.state.ref='Pesachim 99b';
assert.deepEqual(Array.from(context.physicalOrder()),['inner','gemara','tosafot']);
context.state.ref='Bava Metzia 21a';
assert.deepEqual(Array.from(context.physicalOrder()),['tosafot','gemara','inner']);
context.state.agentSettings={lineAnchors:[{stream:'gemara',line:1,startText:'א',endText:'ב'},{stream:'gemara',line:2,startText:'ג',endText:'ד'}],targetLineCounts:{gemara:2}};
context.state.agentAnchorFailures=[];context.state.agentLockedStreams={};
assert.equal(context.applyStreamLineAnchors(['א','ב','ג','ד'].map(text=>({text})),'gemara').filter(t=>t.break).length,1);
context.state.agentSettings.lineAnchors[1].endText='missing';context.state.agentAnchorFailures=[];
context.applyStreamLineAnchors(['א','ב','ג','ד'].map(text=>({text})),'gemara');
assert.ok(context.state.agentAnchorFailures.length);assert.equal(context.state.agentLockedStreams.gemara,false);
const candidateContext=vm.createContext({currentRenderedLineCounts:()=>({gemara:54}),targetLineCountFailures:()=>[],validateAgentLineAnchors:()=>['bad anchor'],validateAnchoredLineGeometry:()=>[],exactExpansionFailure:()=>null,fillPasses:()=>true,geometryTilesPage:()=>true});
vm.runInContext(source.slice(source.indexOf('function candidatePasses('),source.indexOf('function geometryTilesPage(')),candidateContext);
assert.equal(candidateContext.candidatePasses({overflow:0,completionFailures:[],pattern:{teacherExactExpansion:true},transitionGapLines:0}),false);
candidateContext.validateAgentLineAnchors=()=>[];
candidateContext.geometryTilesPage=()=>false;
assert.equal(candidateContext.candidatePasses({overflow:0,completionFailures:[],pattern:{teacherExactExpansion:true},transitionGapLines:0}),false,'A correct line count must not hide page-height overflow');
candidateContext.geometryTilesPage=()=>true;candidateContext.fillPasses=()=>false;
assert.equal(candidateContext.candidatePasses({overflow:0,completionFailures:[],pattern:{teacherExactExpansion:true},transitionGapLines:0}),false,'Exact transitions still require adequate fill');
// Explicit anchors must not waive completion or space-reclamation rules.
const completionContext=vm.createContext({STREAMS:['inner','gemara','tosafot']});
vm.runInContext(source.slice(source.indexOf('function lastStateForBand('),source.indexOf('function compositionRegions(')),completionContext);
const pattern={teacherExactExpansion:true,bands:[{streams:['tosafot','gemara','inner']},{streams:['gemara','inner']},{streams:['inner']}]};
const band=(bandIndex,afterCount,usedHeight,regionHeight)=>({bandIndex,afterCount,usedHeight,regionHeight,lineHeight:10});
const results={
 tosafot:{rest:[],regionStates:[band(0,0,100,100)]},
 gemara:{rest:[],regionStates:[band(0,1,100,100),band(1,0,10,10)]},
 inner:{rest:[],regionStates:[band(0,2,100,100),band(1,1,10,10),band(2,0,20,20)]}
};
assert.equal(completionContext.completionAudit(pattern,results).failures.length,0);
results.tosafot.regionStates[0].usedHeight=50;
assert.ok(completionContext.completionAudit(pattern,results).failures.includes('tosafot transition delayed by more than one line'),'Anchors cannot leave a finished commentary column empty');
results.tosafot.regionStates[0].usedHeight=100;results.tosafot.regionStates[0].afterCount=1;
assert.ok(completionContext.completionAudit(pattern,results).failures.includes('tosafot removed before source completion'),'Gemara cannot enter unfinished Tosafos space');
results.tosafot.regionStates[0].afterCount=0;results.inner.regionStates[0].afterCount=0;
assert.ok(completionContext.completionAudit(pattern,results).failures.includes('inner continues after source completion'),'An ended stream cannot reserve a continuing column');
// A positioned bridge changes offset parents without changing the physical column.
const footprintContext=vm.createContext({});
vm.runInContext(source.slice(source.indexOf('function streamFootprintChanges('),source.indexOf('function stitchStreamContinuity(')),footprintContext);
const region=(left,width,offsetLeft)=>({offsetLeft,getBoundingClientRect:()=>({left,width})});
assert.equal(footprintContext.streamFootprintChanges(region(400,160,400),region(400,160,0)),false);
assert.equal(footprintContext.streamFootprintChanges(region(400,160,0),region(0,560,0)),true);
console.log('PASS: scan anchors, source preservation, editable counts, sides, candidate rejection, completion-driven space reclamation.');
