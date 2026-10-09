const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync('phrase-parser.js', 'utf8'), context);
const parser = context.window.GemaraPhraseParser;
const normalize = value => String(value).normalize('NFKD').replace(/[\u0591-\u05c7]/gu, '').replace(/[ךםןףץ]/gu, c => ({ך:'כ',ם:'מ',ן:'נ',ף:'פ',ץ:'צ'})[c]).replace(/[^\u05d0-\u05ea]/gu, '');
const ignored = value => !value || ['מתני','משנה','גמ','גמרא'].includes(value);
const plain = value => JSON.parse(JSON.stringify(value));
function parse(text) { return parser.parse(text.split(/\s+/u), normalize, ignored); }
const text = 'דִּילְמָא מְשַׁבַּשְׁתָּא הִיא. אֲמַר לֵיהּ מָרִימָר, וְאִיתֵּימָא רַב יֵימַר: אֲנָא אִיקְּלַעִי לְפִירְקֵיהּ דְרַב פִּנְחָס.';
const result = parse(text);
assert.equal(result.phrases.length, 4);
assert.deepEqual(plain(result.assignments), [0,0,0,1,1,1,2,2,2,3,3,3,3,3]);
assert.equal(result.phrases.join(' '), text);
// Text clauses do not depend on page line/band breaks or visible punctuation settings.
assert.deepEqual(plain(parse(text.replace(/ /g,'\n')).assignments), plain(result.assignments));
assert.deepEqual(plain(parse(text.normalize('NFD')).assignments), plain(result.assignments));
const unpunctuated = parse('קב בארבע אמות טעמא מאי משום דלא חשיבי או דלמא משום דנפישא טרחייהו');
assert(unpunctuated.phrases.length > 1);
assert(unpunctuated.assignments.every(index => index != null));
const labels = parse('מתני׳ אלו מציאות שלו. גמ׳ מאי טעמא משום דלא חשיבי.');
assert.equal(labels.assignments[0], null);
assert.equal(labels.assignments[4], null);
assert.deepEqual(plain(parser.resolve(['אלו','מציאות','שלו'],['אלו מציאות','שלו'],[0,0,1],normalize,ignored).assignments),[0,0,1]);
const extended = parser.resolve(['אלו','מציאות','שלו.','אמר','רב','הונא:','לא','צריכא.'],['אלו מציאות שלו'],[0,0,0,null,null,null,null,null],normalize,ignored);
assert.equal(extended.source,'mixed');
assert.deepEqual(plain(extended.assignments),[0,0,0,1,1,1,2,2]);
const stale = parser.resolve(['אמר','רב','הונא.'],['different profile'],null,normalize,ignored);
assert.equal(stale.source,'automatic'); assert(stale.assignments.every(index=>index===0));
assert.equal(parse('').phrases.length,0);
assert.equal(parse('תיקו').phrases.length,1);
// Exercise integration in every page engine with synthetic rendered tokens.
for (const root of ['draft-engine','pesachim-99b','bava-metzia-21a']) {
 const source = fs.readFileSync(`${root}/app.js`,'utf8');
 const start = source.indexOf('function assignPhraseNavigation(){');
 const end = source.indexOf('\nfunction phraseElements',start);
 const words = text.split(' ').map(textContent=>({textContent,dataset:{phraseIndex:'old'}}));
 const pageContext = {GemaraPhraseParser:parser,phraseProfile:()=>null,phraseAssignments:()=>{throw Error('no profile needed')},normalizeReadWord:normalize,isPhraseIgnoredValue:ignored,$:()=>({querySelectorAll:()=>words}),activePhraseProfile:[],phraseNavigationSource:''};
 vm.createContext(pageContext); vm.runInContext(source.slice(start,end),pageContext);
 assert.equal(pageContext.assignPhraseNavigation(),true);
 assert.deepEqual(words.map(word=>Number(word.dataset.phraseIndex)),plain(result.assignments));
 assert.equal(pageContext.activePhraseProfile.length,4);
 assert(source.includes('profile=activePhraseProfile,available=phraseNavigationAvailable'));
 assert(!source.includes('A verified Milim ID phrase profile is required.'));
}
console.log('Phrase parser: complete token coverage, Hebrew normalization, clause boundaries, line-break independence, saved/mixed/stale profiles, and all three engine integrations passed.');
