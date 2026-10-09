/* The model and browser share this executable contract. No generated code is run. */
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.VilnaAgentCapabilities = factory();
})(typeof window === 'object' ? window : globalThis, function() {
  const streams = ['gemara', 'inner', 'tosafot'];
  const ranges = {pageHeight:[900,1300],openingLines:[2,8],gemaraScale:[.78,1.18],commentaryScale:[.72,1.18],continuationLines:[1,12],expansionLine:[1,200],gemaraAlignmentLine:[1,200],finalGemaraGutterLines:[0,4]};
  const integers = ['pageHeight','openingLines','continuationLines','expansionLine','gemaraAlignmentLine'];
  const booleans = ['enforceGemaraGutterBox','forceCascade','stripGemaraDashes','enforceCommentaryContinuity','enforceStreamContinuity','enforceReleasedSpaceTiming'];
  const streamSettings = ['preferredSurvivor','completedStream','expansionStream','expansionIntoStream'];
  const alignments = ['right','left','center','justify','natural'];
  const settings = [...Object.keys(ranges),...booleans,...streamSettings,'gemaraAlignment','innerSide','targetLineCounts','lineAnchors','streamAlignments'];
  const descriptions = {
    pageHeight:'Available page height; bounded response to measured overflow.',
    openingLines:'Opening commentary lines. Default four; use another count only when explicitly requested.',
    gemaraScale:'Gemara type scale.',commentaryScale:'Shared Rashi/Rashbam AND Tosafos type scale; cannot resize just one commentary.',
    continuationLines:'Narrow continuation lines before a completed-space takeover.',
    expansionLine:'First visual line of expansionStream that may enter expansionIntoStream space.',
    expansionStream:'Stream that widens.',expansionIntoStream:'Completed neighboring stream whose space is reclaimed.',
    enforceReleasedSpaceTiming:'Require neighbors to actually finish before widening.',
    enforceStreamContinuity:'Reconnect continuing text at normal baseline spacing, even across width changes.',
    enforceCommentaryContinuity:'Connect opening commentary directly to body commentary.',
    enforceGemaraGutterBox:'Keep the standard Gemara gutter on all sides without a page-wide commentary gap.',
    finalGemaraGutterLines:'Bounded gutter beneath the final Gemara line.',
    forceCascade:'Use completion-driven layout.',preferredSurvivor:'Stream continuing after a commentary pair.',completedStream:'Stream finishing before the survivor.',
    stripGemaraDashes:'Remove display dashes from Gemara only; does not alter stored source.',
    targetLineCounts:'Exact visual line count for stream. Value integer 1–200.',
    lineAnchors:'Preserve a specific line using stream, line number, startText and endText; matching source required.',
    gemaraAlignment:'Partial Gemara line alignment.',gemaraAlignmentLine:'Gemara line to align.',
    streamAlignments:'Partial commentary line alignment; stream inner or tosafot, optional line, value right/left/center/justify.',
    innerSide:'Physical side for Rashi/Rashbam.'
  };
  const operationProperties = {
    setting:{type:'string',enum:settings},stream:{type:['string','null'],enum:[...streams,null]},
    line:{type:['integer','null']},value:{type:['string','number','boolean','null']},
    startText:{type:['string','null']},endText:{type:['string','null']}
  };
  const schema = {type:'object',additionalProperties:false,properties:{
    summary:{type:'string'},reason:{type:'string'},targetRegion:{type:'string',enum:['whole-page','opening','gemara','inner-commentary','tosafos','transition','rashbam-heading']},
    clarifications:{type:'array',items:{type:'string'}},
    operations:{type:'array',items:{type:'object',additionalProperties:false,properties:operationProperties,required:Object.keys(operationProperties)}}
  },required:['summary','reason','targetRegion','clarifications','operations']};
  function assert(ok,message){if(!ok)throw new Error(message);}
  function compile(proposal, baseline = {}) {
    assert(proposal && typeof proposal.summary==='string' && proposal.summary.length<=4000,'Invalid model summary.');
    assert(typeof proposal.reason==='string' && proposal.reason.length<=6000,'Invalid model explanation.');
    assert(schema.properties.targetRegion.enum.includes(proposal.targetRegion),'Invalid target region.');
    assert(Array.isArray(proposal.clarifications)&&proposal.clarifications.length<=12&&proposal.clarifications.every(x=>typeof x==='string'&&x.length<=1000),'Invalid clarification list.');
    assert(Array.isArray(proposal.operations)&&proposal.operations.length<=30,'Too many or invalid model operations.');
    const changes={},seen=new Map();
    for(const op of proposal.operations){
      assert(op&&settings.includes(op.setting),'Unsupported model control.');
      assert(op.stream===null||streams.includes(op.stream),'Invalid stream.');
      assert(op.line===null||(Number.isInteger(op.line)&&op.line>=1&&op.line<=200),'Invalid line.');
      const key=op.setting+(['targetLineCounts','streamAlignments','lineAnchors'].includes(op.setting)?`:${op.stream}:${op.setting==='lineAnchors'?op.line:''}`:'');
      const signature=JSON.stringify(op);
      assert(!seen.has(key)||seen.get(key)===signature,'Conflicting changes need clarification.');seen.set(key,signature);
      if(ranges[op.setting]){
        const [min,max]=ranges[op.setting];assert(typeof op.value==='number'&&Number.isFinite(op.value)&&op.value>=min&&op.value<=max&&(!integers.includes(op.setting)||Number.isInteger(op.value)),'Model value exceeds permitted layout limits.');changes[op.setting]=op.value;
      }else if(booleans.includes(op.setting)){
        assert(op.value===true,'The model cannot disable source/continuity guards.');changes[op.setting]=true;
      }else if(streamSettings.includes(op.setting)){
        assert(streams.includes(op.value),'Invalid stream setting.');changes[op.setting]=op.value;
      }else if(op.setting==='gemaraAlignment'){
        assert(alignments.includes(op.value),'Invalid Gemara alignment.');changes.gemaraAlignment=op.value;
      }else if(op.setting==='innerSide'){
        assert(['right','left'].includes(op.value),'Invalid commentary side.');changes.innerSide=op.value;
      }else if(op.setting==='targetLineCounts'){
        assert(streams.includes(op.stream)&&Number.isInteger(op.value)&&op.value>=1&&op.value<=200,'Invalid line count.');
        changes.targetLineCounts={...baseline.targetLineCounts,...changes.targetLineCounts,[op.stream]:op.value};
      }else if(op.setting==='lineAnchors'){
        assert(streams.includes(op.stream)&&op.line!==null&&typeof op.startText==='string'&&op.startText.trim()&&op.startText.length<=180&&typeof op.endText==='string'&&op.endText.trim()&&op.endText.length<=180,'Line anchors need a stream, line and both source endpoints.');
        changes.lineAnchors=(changes.lineAnchors||baseline.lineAnchors||[]).filter(a=>!(a.stream===op.stream&&a.line===op.line));
        changes.lineAnchors.push({stream:op.stream,line:op.line,startText:op.startText.trim(),endText:op.endText.trim()});
      }else if(op.setting==='streamAlignments'){
        assert(['inner','tosafot'].includes(op.stream)&&alignments.slice(0,4).includes(op.value),'Invalid commentary alignment.');
        changes.streamAlignments={...baseline.streamAlignments,...changes.streamAlignments,[op.stream]:{alignment:op.value,...(op.line!==null?{line:op.line}:{})}};
      }
    }
    const effective={...baseline,...changes};
    assert(!effective.expansionStream||!effective.expansionIntoStream||effective.expansionStream!==effective.expansionIntoStream,'A stream cannot expand into itself.');
    assert(!effective.completedStream||!effective.preferredSurvivor||effective.completedStream!==effective.preferredSurvivor,'A stream cannot both finish and survive.');
    return {summary:proposal.summary,reason:proposal.reason,targetRegion:proposal.targetRegion,clarifications:proposal.clarifications,operations:proposal.operations,changes:proposal.clarifications.length?{}:changes};
  }
  return {schema,settings,descriptions,ranges,compile};
});
