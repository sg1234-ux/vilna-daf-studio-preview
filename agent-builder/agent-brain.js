/* Local correction knowledge. Never substitutes a guessed scan map for evidence. */
window.VilnaAgentBrain = (() => {
  const rules = [
    'Preserve every source word and its order; never hide missing text to pass a check.',
    'Use verified page guidance when available. Line counts and start/end anchors are page constraints, not universal constants.',
    'Opening commentary defaults to four lines and continues directly beside the Gemara.',
    'Keep a gutter around the Gemara without cutting through a continuing commentary stream.',
    'A stream may enter neighboring space only after that neighbor’s actual final line.',
    'Retain continuous baseline spacing when the same source changes width.',
    'Check clipping, source coverage, line anchors, occupied regions, and page tiling after every adjustment.',
    'Teacher approval is separate from measured validity. Keep the agent out of approved teaching views.'
  ];
  function normalize(raw) {
    return String(raw || '').replace(/[“”]/g,'"').replace(/’/g,"'")
      .replace(/\b(gemorah|gemora|gamarah|gamara)\b/gi,'Gemara')
      .replace(/\b(tosfos|tosofos|tosfot|tosefos)\b/gi,'Tosafos')
      .replace(/\b(rashee|rashy)\b/gi,'Rashi')
      .replace(/\b(nit|noy)\b/gi,'not').replace(/\b(seperate|seperated)\b/gi,'separate')
      .replace(/\b(alighn|aling|allign)\b/gi,'align').replace(/\b(widden|widin)\b/gi,'widen')
      .replace(/\b(doesnt|isnt|dont|shouldnt|cant)\b/gi,word=>({doesnt:"doesn't",isnt:"isn't",dont:"don't",shouldnt:"shouldn't",cant:"can't"})[word.toLowerCase()]);
  }
  function region(note, fallback) {
    const named = [...note.matchAll(/\b(gemara|rashi|rashbam|tosafos|tosafot)\b|גמרא|רש[״"']?י|רשב[״"']?ם|תוספות/giu)].map(m=>/gemara|גמרא/i.test(m[0])?'gemara':/tosaf|תוספ/i.test(m[0])?'tosafos':'inner-commentary');
    const subject=note.match(/\b(gemara|rashi|rashbam|tosafos|tosafot)\s+(?:line\b|should\b|must\b|needs?\b|widens?\b|expands?\b|starts?\b)/iu);
    if(subject)return /gemara/i.test(subject[1])?'gemara':/tosaf/i.test(subject[1])?'tosafos':'inner-commentary';
    return new Set(named).size === 1 ? named[0] : fallback;
  }
  function merge(base, addition) {
    const out = {...base,...addition};
    for (const key of ['targetLineCounts','streamAlignments']) if (addition[key]) out[key] = {...base[key],...addition[key]};
    if (addition.lineAnchors) {
      const anchors = new Map((base.lineAnchors||[]).map(a=>[`${a.stream}:${a.line}`,a]));
      addition.lineAnchors.forEach(a=>anchors.set(`${a.stream}:${a.line}`,a));out.lineAnchors=[...anchors.values()];
    }
    return out;
  }
  function diagnose(diagnostics) {
    const failures=diagnostics?.failures||[],settings=diagnostics?.settings||{},changes={},notes=[];
    if (failures.some(f=>/source load:|anchor.*(?:missing|ambiguous|unique)|policy|heading/i.test(f)))
      return {changes,notes:['Source, line-anchor, or heading evidence needs review before automatic repair.']};
    if (failures.some(f=>/opening|baseline gap|separated|continuity/i.test(f))) {
      changes.enforceStreamContinuity=true;changes.enforceCommentaryContinuity=true;
      if (failures.some(f=>/opening/i.test(f))) changes.openingLines=4;
      notes.push('Reconnect source streams and restore the four-line opening.');
    }
    if (failures.some(f=>/removed before|takeover|released|occupied|transition delayed/i.test(f))) {
      changes.enforceReleasedSpaceTiming=true;notes.push('Remeasure takeover boundaries against completed neighboring text.');
    }
    const missing=Object.values(diagnostics?.unplacedCounts||{}).some(n=>n>0);
    if (missing||diagnostics?.textOverflow||failures.some(f=>/clipped|text overflow|page tiling/i.test(f))) {
      const height=Number(settings.pageHeight)||1030;
      if (height<1300) {changes.pageHeight=Math.min(1300,height+48);notes.push('Increase available page height for clipped or unplaced words.');}
      else if (missing||diagnostics?.textOverflow) {
        if ((diagnostics.unplacedCounts?.gemara||0)>0) changes.gemaraScale=Math.max(.78,(settings.gemaraScale||1)-.02);
        else changes.commentaryScale=Math.max(.72,(settings.commentaryScale||1)-.02);
        notes.push('Try a bounded type-size adjustment without dropping source words.');
      }
    }
    if (!notes.length) notes.push(failures.length?'No safe measured repair is known for these failures. Supply the exact boundary or reference.':'Measured rules pass. A teacher must still review the page against the intended layout.');
    return {changes,notes};
  }
  function review(body, legacy) {
    const raw=normalize(body.feedback?.note),clauses=raw.split(/\s*(?:[;\n]+|\band\s+(?=(?:keep|make|remove|add|set|align|widen|restore|surround)\b)|\.(?=\s+(?:[A-Z]|the\b|keep\b|make\b|remove\b|from\b|add\b|only\b)))\s*/u).filter(Boolean);
    if (!raw.trim()) {const measured=diagnose(body.diagnostics);return {summary:measured.notes.join(' '),reason:'Repair proposals use the current measured failures. Exact scan placement still requires evidence.',targetRegion:body.feedback?.targetRegion||'whole-page',changes:measured.changes,operations:measured.notes};}
    let changes={},operations=[],unresolved=[];
    for (const clause of clauses) {
      const target=region(clause,body.feedback?.targetRegion||'whole-page');
      const lowered=clause.toLowerCase();let handled=false;
      const opening=lowered.match(/(?:only|exactly|keep|make|need)\s*(?:the\s+)?(\d|four|five|six|three|two)\s+(?:opening\s+|top\s+)?commentary\s+lines?/u)||lowered.match(/(?:only|exactly|supposed to (?:be|have)|should (?:be|have)|keep|make|need)\s*(?:the\s+)?(\d|four|five|six|three|two)\s+(?:lines?\s+(?:of\s+)?(?:opening\s+)?commentary|(?:opening|top|commentary)\s+lines?)/u)||lowered.match(/(?:opening|top)\s+(?:commentary\s+)?(?:should|must|needs? to)?\s*(?:have|be)?\s*(\d|four|five|six|three|two)\s+lines?/u);
      if (opening) {const count=Number(opening[1])||({two:2,three:3,four:4,five:5,six:6})[opening[1]];if(count>=2&&count<=8){changes.openingLines=count;changes.enforceCommentaryContinuity=true;operations.push(`Use ${count} opening commentary lines with continuous commentary below.`);handled=true;}}
      if (/gutter|spacing|space|gap/u.test(lowered)&&/gemara/u.test(lowered)&&/all (?:four )?sides|surround|around (?:the )?gemara/u.test(lowered)) {changes.enforceGemaraGutterBox=true;changes.enforceStreamContinuity=true;operations.push('Surround the Gemara with the 25px gutter; keep commentary continuous.');handled=true;}
      if (/word (?:placement|order)|layout|amud|text/u.test(lowered)&&/perfect|approved|keep|unchanged|preserve/u.test(lowered)&&!/widen|align|line \d|gutter|opening/u.test(lowered)) {operations.push('Preserve the current source and layout except for requested corrections.');handled=true;}
      // The legacy language handlers remain useful, but receive the named region first.
      const result=legacy({...body,feedback:{...body.feedback,note:clause,targetRegion:target}});
      if(Object.keys(result.changes||{}).length){changes=merge(changes,result.changes);operations.push(result.summary);handled=true;}
      if(!handled) unresolved.push(`${clause}: ${result.reason}`);
    }
    return {summary:operations.join(' ')||'This instruction needs a more specific measured boundary.',reason:unresolved.length?`Unresolved: ${unresolved.join(' | ')}`:'Every proposed operation preserves source text and will be checked after composition.',targetRegion:body.feedback?.targetRegion||'whole-page',changes,operations,unresolved};
  }
  function score(d) {return [Object.values(d?.unplacedCounts||{}).reduce((n,v)=>n+Number(v||0),0),d?.textOverflow?1:0,(d?.failures||[]).length];}
  function worse(a,b) {for(let i=0;i<a.length;i++){if(a[i]!==b[i])return a[i]>b[i];}return false;}
  return {rules,normalize,review,diagnose,merge,score,worse};
})();
