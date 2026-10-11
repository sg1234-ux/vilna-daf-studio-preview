window.VilnaAgentConnection = (() => {
  const key='vilna-agent-connection-v1';
  let history=[];
  function configuration(){try{return JSON.parse(sessionStorage.getItem(key)||'{}');}catch{return {};}}
  function configure(url,password){
    const parsed=new URL(url);
    if(parsed.protocol!=='https:'||parsed.username||parsed.password||parsed.search||parsed.hash)throw new Error('Use the HTTPS address of your agent host.');
    if(password.length<24)throw new Error('Use the agent access password configured on your host (at least 24 characters).');
    const config={base:parsed.origin,token:password};sessionStorage.setItem(key,JSON.stringify(config));return config;
  }
  async function request(route,body){
    const config=configuration();
    if(!config.base||!config.token)throw new Error('Connect your agent host first.');
    const response=await fetch(`${config.base}/api/agent/${route}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${config.token}`,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(55000),credentials:'omit',redirect:'error'});
    const result=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(result.error||`Agent connection failed (${response.status}).`);
    return result;
  }
  function remember(item){history.push(item);history=history.slice(-8);}
  async function review(body){
    const result=await request('review',{...body,history});
    // Recheck the exact contract in the browser before allowing Apply.
    const review=VilnaAgentCapabilities.compile(result.review,body.diagnostics.settings||{});
    remember({instruction:body.feedback.note,proposal:review.summary,clarifications:review.clarifications,applied:false});
    return review;
  }
  function outcome(diagnostics,restored,comparison={}){
    const measured=d=>d?{settings:d.settings,failures:d.failures,unplacedCounts:d.unplacedCounts,wordCounts:d.wordCounts,textOverflow:d.textOverflow}:null;
    remember({result:restored?'Prior settings restored after worse checks.':'Adjustment composed and measured.',...measured(diagnostics),...(restored?{before:measured(comparison.before),attempted:measured(comparison.attempted)}:{})});
  }
  return {configuration,configure,request,review,outcome,reset:()=>{history=[];},disconnect:()=>{sessionStorage.removeItem(key);history=[];}};
})();

