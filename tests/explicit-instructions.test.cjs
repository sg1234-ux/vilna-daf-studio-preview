const assert=require('node:assert/strict'),cap=require('../agent-builder/agent-capabilities.js');
const note='45 lines 36 narrow 9 wide. line one ends with second שנטל, line 2 begins נטל ends וירדן line begins דקא ends קא חזי line 4 begins ליה ends בלסטים';
const body={feedback:{targetRegion:'whole-page',note},diagnostics:{settings:{},geometry:{bands:[{streams:['tosafot','gemara','inner']},{streams:['tosafot','gemara']}]}},evidence:{streams:{gemara:{sourceText:'וכן ירדן שנטל מזה ונתן לזה מה שנטל – נטל'}}}};
const review={summary:'Model fixture',clarifications:[],changes:{targetLineCounts:{gemara:34},expansionLine:25,lineAnchors:[{stream:'gemara',line:2,startText:'נטל',endText:'ירדן'}]}};
const fixed=cap.preserveInstructions(review,body);
assert.equal(fixed.changes.targetLineCounts.gemara,45);assert.equal(fixed.changes.expansionLine,37);assert.equal(fixed.changes.expansionStream,'gemara');assert.equal(fixed.changes.expansionIntoStream,'inner');
assert.deepEqual(fixed.changes.lineAnchors.sort((a,b)=>a.line-b.line),[
{stream:'gemara',line:1,startText:'וכן',endText:'שנטל'},
{stream:'gemara',line:2,startText:'נטל',endText:'וירדן'},
{stream:'gemara',line:3,startText:'דקא',endText:'קא חזי'},
{stream:'gemara',line:4,startText:'ליה',endText:'בלסטים'}]);
assert.equal(review.changes.lineAnchors[0].endText,'ירדן','Do not mutate the original proposal');
const held={...review,clarifications:['Missing evidence']};assert.equal(cap.preserveInstructions(held,body),held,'Do not bypass a held proposal');
assert.deepEqual(cap.preserveInstructions(review,{...body,feedback:{targetRegion:'whole-page',note:'Rashi needs 45 lines'}}),review,'A named commentary line count is not a Gemara count');
assert.equal(cap.preserveInstructions(review,{...body,feedback:{targetRegion:'whole-page',note:'45 lines 35 narrow 9 wide'}}).changes.expansionLine,25,'Do not infer an expansion from inconsistent counts');
console.log('PASS exact Hebrew endpoints, implicit third line, explicit line totals, source-derived first opening, model mismatch, and held proposals.');
