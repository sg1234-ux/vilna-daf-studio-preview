window.VilnaAgentConnection = (() => {
  const key='vilna-agent-connection-v1';
  const isLocal=typeof location!=='undefined'&&location.hostname==='127.0.0.1';
  let model='';
  let history=[];
  function configuration(){if(isLocal)return {base:location.origin,local:true};try{return JSON.parse(sessionStorage.getItem(key)||'{}');}catch{return {};}}
  function configure(url,password){
    if(isLocal)throw new Error('Use Continue with ChatGPT in this local builder.');
    const parsed=new URL(url);
    if(parsed.protocol!=='https:'||parsed.username||parsed.password||parsed.search||parsed.hash)throw new Error('Use the HTTPS address of your agent host.');
    if(password.length<24)throw new Error('Use the agent access password configured on your host (at least 24 characters).');
    const config={base:parsed.origin,token:password};sessionStorage.setItem(key,JSON.stringify(config));return config;
  }
  async function request(route,body){
    const config=configuration();
    if(!config.base||(!isLocal&&!config.token))throw new Error('Connect your agent host first.');
    const response=await fetch(`${config.base}/api/${isLocal?'local':'agent'}/${route}`,{method:body?'POST':'GET',headers:{...(!isLocal?{Authorization:`Bearer ${config.token}`} : {}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(route==='scan'?59000:55000),credentials:isLocal?'same-origin':'omit',redirect:'error'});
    const result=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(result.error||`Agent connection failed (${response.status}).`);
    return result;
  }
  function remember(item){history.push(item);history=history.slice(-8);}
  function renderedHistory(evidence){
    if(!evidence)return null;
    const streams={};
    for(const [name,stream] of Object.entries(evidence.streams||{})){
      const all=stream.lines||[];
      // Keep all Gemara boundaries; opening and final commentary lines explain
      // the end-of-commentary transition without duplicating source text.
      const lines=name==='gemara'?all:all.filter((line,index)=>index<4||index>=all.length-12);
      streams[name]={lines:lines.map(line=>({...line})),renderedLineCount:all.length,linesTruncated:Boolean(stream.linesTruncated)||lines.length<all.length};
    }
    return {ref:evidence.ref,mode:evidence.mode,profile:evidence.profile,streams};
  }
  function requestHistory(body){
    const selected=[];
    // Bound UTF-8 bytes, including Hebrew, before the server's 180 KB limit.
    // Prefer recent evidence to older conversation when the page is large.
    for(const item of [...history].reverse()){
      const candidate=[item,...selected];
      if(new TextEncoder().encode(JSON.stringify({...body,history:candidate,...(isLocal?{model}: {})})).length>175000)break;
      selected.unshift(item);
    }
    return selected;
  }
  async function review(body){
    const result=await request('review',{...body,history:requestHistory(body),...(isLocal?{model}: {})});
    // Recheck the exact contract in the browser before allowing Apply.
    const review=VilnaAgentCapabilities.compile(result.review,body.diagnostics.settings||{});
    remember({instruction:body.feedback.note,proposal:review.summary,clarifications:review.clarifications,applied:false});
    return review;
  }
  function outcome(diagnostics,restored,comparison={}){
    const measured=d=>d?{settings:d.settings,failures:d.failures,unplacedCounts:d.unplacedCounts,wordCounts:d.wordCounts,textOverflow:d.textOverflow,geometry:d.geometry}:null;
    const rendered=renderedHistory(comparison.attemptedEvidence);
    remember({result:restored?'Prior settings restored after worse checks.':'Adjustment composed and measured.',...measured(diagnostics),...(restored?{before:measured(comparison.before),attempted:{...measured(comparison.attempted),rendered}}:rendered?{rendered}:{})});
  }
  return {isLocal,configuration,configure,request,review,scan:body=>request('scan',{...body,...(isLocal?{model}: {})}),outcome,setModel:value=>{model=value;},signOut:async()=>{const result=await request('signout',{});history=[];model='';return result;},reset:()=>{history=[];},disconnect:()=>{sessionStorage.removeItem(key);history=[];}};
})();

