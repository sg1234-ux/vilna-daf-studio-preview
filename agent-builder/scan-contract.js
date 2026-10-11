(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.VilnaScanContract=api;})(typeof window==='object'?window:globalThis,()=>{
  const streams=['gemara','inner','tosafot'];
  const word=s=>String(s||'').normalize('NFKD').replace(/[\u0591-\u05c7]/g,'').replace(/[^\u05d0-\u05eaA-Za-z0-9]/g,'').toLowerCase();
  const object=properties=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
  const integer={type:'integer'},number={type:'number'},string={type:'string'},names={type:'string',enum:streams};
  const line=object({endToken:integer,firstWord:string,lastWord:string});
  const schema=object({ref:string,uncertainties:{type:'array',items:string},openingLines:integer,
    maps:object(Object.fromEntries(streams.map(s=>[s,{type:'array',items:line}]))),
    stages:{type:'array',items:object({streams:{type:'array',items:names},widths:{type:'array',items:number},counts:object(Object.fromEntries(streams.map(s=>[s,integer])))})},
    typography:object({gemaraSize:number,commentarySize:number,gemaraLeading:number,commentaryLeading:number,innerLeading:number,pageHeight:number})});
  function compile(result,evidence,scanUrl){
    if(result.ref!==evidence.ref)throw Error('The scan map belongs to a different amud.');
    if(!Array.isArray(result.uncertainties))throw Error('The scan reader did not report its uncertainties.');
    if(result.uncertainties.length)throw Error('Scan reading needs review: '+result.uncertainties.slice(0,8).join(' '));
    if(!Number.isInteger(result.openingLines)||result.openingLines<0||result.openingLines>12)throw Error('Invalid opening commentary count.');
    const maps={};
    for(const s of streams){
      const tokens=evidence.streams?.[s]?.tokens,lines=result.maps?.[s];
      if(!Array.isArray(tokens)||!tokens.length||tokens.length>8000||!Array.isArray(lines)||!lines.length||lines.length>200)throw Error('A complete '+s+' source and line map are required.');
      let start=0;
      for(const line of lines){
        if(!Number.isInteger(line.endToken)||line.endToken<start||line.endToken>=tokens.length)throw Error('Invalid or overlapping '+s+' line boundary.');
        const words=tokens.slice(start,line.endToken+1).map(word).filter(Boolean);
        if(!words.length||word(line.firstWord)!==words[0]||word(line.lastWord)!==words.at(-1))throw Error('The '+s+' line endpoints do not match the preserved source.');
        start=line.endToken+1;
      }
      if(start!==tokens.length)throw Error('The '+s+' scan map omits source words.');
      maps[s]={tokenCount:tokens.length,lineEndTokens:lines.map(l=>l.endToken)};
    }
    if(!Array.isArray(result.stages)||!result.stages.length||result.stages.length>8)throw Error('Invalid scan regions.');
    const totals={gemara:0,inner:result.openingLines,tosafot:result.openingLines};let previous=new Set(streams);
    for(const stage of result.stages){
      if(!Array.isArray(stage.streams)||!stage.streams.length||new Set(stage.streams).size!==stage.streams.length||stage.streams.some(s=>!previous.has(s)))throw Error('A completed stream cannot restart in a later region.');
      if(!Array.isArray(stage.widths)||stage.widths.length!==stage.streams.length||stage.widths.some(w=>!Number.isFinite(w)||w<=0||w>100))throw Error('Invalid scan region widths.');
      for(const s of streams){const count=stage.counts?.[s];if(!Number.isInteger(count)||count<0||count>200||(!stage.streams.includes(s)&&count!==0))throw Error('Invalid scan region line allocation.');totals[s]+=count;}
      previous=new Set(stage.streams);
    }
    if(result.stages[0].streams.length!==3)throw Error('This scan has an unsupported opening region.');
    for(const s of streams)if(totals[s]!==maps[s].lineEndTokens.length)throw Error('The '+s+' region counts do not cover its lines.');
    const bounds={gemaraSize:[10,22],commentarySize:[7,14],gemaraLeading:[12,26],commentaryLeading:[10,20],innerLeading:[10,20],pageHeight:[850,1800]},typography={};
    for(const [key,[min,max]] of Object.entries(bounds)){const n=result.typography?.[key];if(!Number.isFinite(n)||n<min||n>max)throw Error('Unsupported scan typography: '+key);typography[key]=n;}
    return {source:'AI-read Vilna scan: '+scanUrl,scanRead:true,teacherVerified:false,typography:{...typography,gemaraOpeningScale:1,innerDibburScale:1.02,tosafotDibburScale:1.04,pageBottomPadding:32},layout:{openingLines:result.openingLines,boxWalls:false,gemaraTopGutter:25,gemaraBottomGutter:25,allowHorizontalCompression:true,uniformGemaraLineWidths:true,stages:result.stages.map((stage,index)=>{
      const next=result.stages[index+1],completed=stage.streams.find(s=>s!=='gemara'&&next?.streams.includes('gemara')&&!next.streams.includes(s));
      return {...stage,...(completed?{commentaryGutterStream:completed,commentaryBottomGutter:25}:{})};
    })},maps};
  }
  return {schema,compile,word};
});
