'use strict';
// Personal, loopback-only integration of OpenAI's documented public-client flow.
// Credentials live in the user's app-data directory, never in the web root.
const fs=require('node:fs/promises');
const path=require('node:path');
const os=require('node:os');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const ISSUER='https://auth.openai.com',RESOURCE='https://api.openai.com/v1';
const SCOPES='openid profile email offline_access resource.invoke chatgpt.tokens.use.direct';
const random=()=>crypto.randomBytes(32).toString('base64url');
const problem=(status,message)=>Object.assign(new Error(message),{status});
const defaultDirectory=()=>process.platform==='win32'?path.join(process.env.LOCALAPPDATA||path.join(os.homedir(),'AppData','Local'),'VilnaDafStudio'):path.join(os.homedir(),'.config','vilna-daf-studio');
async function verifyIdentity(token,{clientId,nonce,subject,fetchImpl=fetch}){
  try{
    const parts=String(token).split('.');if(parts.length!==3)throw new Error();
    const header=JSON.parse(Buffer.from(parts[0],'base64url')),claims=JSON.parse(Buffer.from(parts[1],'base64url'));
    if(!['RS256','PS256','ES256'].includes(header.alg)||typeof header.kid!=='string'||header.crit)throw new Error();
    const response=await fetchImpl(`${ISSUER}/.well-known/jwks.json`,{signal:AbortSignal.timeout(15000),redirect:'error'});
    if(!response.ok)throw new Error();
    const jwk=(await response.json()).keys?.find(k=>k.kid===header.kid&&(!k.alg||k.alg===header.alg)&&(!k.use||k.use==='sig'));
    if(!jwk||(header.alg==='ES256'?jwk.kty!=='EC'||jwk.crv!=='P-256':jwk.kty!=='RSA'))throw new Error();
    const key=crypto.createPublicKey({key:jwk,format:'jwk'});
    const options=header.alg==='PS256'?{key,padding:crypto.constants.RSA_PKCS1_PSS_PADDING,saltLength:32}:header.alg==='ES256'?{key,dsaEncoding:'ieee-p1363'}:key;
    if(!crypto.verify('sha256',Buffer.from(`${parts[0]}.${parts[1]}`),options,Buffer.from(parts[2],'base64url')))throw new Error();
    const now=Math.floor(Date.now()/1000),aud=Array.isArray(claims.aud)?claims.aud:[claims.aud];
    if(claims.iss!==ISSUER||!aud.includes(clientId)||(aud.length>1&&claims.azp!==clientId)||typeof claims.exp!=='number'||claims.exp<=now||claims.nbf>now+30||typeof claims.sub!=='string'||!claims.sub)throw new Error();
    if(nonce!==undefined&&claims.nonce!==nonce)throw new Error();
    if(subject!==undefined&&claims.sub!==subject)throw new Error();
    return claims;
  }catch{throw problem(401,'ChatGPT sign-in could not be verified. Please try signing in again.');}
}
class ChatGPTAuth{
  constructor({directory=defaultDirectory(),fetchImpl=fetch}={}){this.directory=directory;this.fetch=fetchImpl;this.pending=new Map();this.refreshing=null;this.state=null;this.catalog=null;}
  async init(){
    await fs.mkdir(this.directory,{recursive:true,mode:0o700});
    if((await fs.lstat(this.directory)).isSymbolicLink())throw new Error('The sign-in storage directory must not be a symbolic link.');
    if(process.platform==='win32'){
      const owner=process.env.USERDOMAIN?`${process.env.USERDOMAIN}\\${process.env.USERNAME}`:process.env.USERNAME;
      if(!owner)throw new Error('Windows user could not be identified for sign-in storage.');
      execFileSync('icacls.exe',[this.directory,'/inheritance:r','/grant:r',`${owner}:(OI)(CI)F`],{stdio:'ignore',windowsHide:true});
    }else await fs.chmod(this.directory,0o700);
    try{this.state=JSON.parse(await fs.readFile(path.join(this.directory,'chatgpt.json'),'utf8'));}
    catch(e){if(e.code!=='ENOENT')throw new Error('The saved ChatGPT sign-in could not be read.');}
    if(!this.state){this.state={hostId:`urn:uuid:${crypto.randomUUID()}`,accounts:[],active:null};await this.save();}
    if(!/^urn:uuid:[0-9a-f-]{36}$/i.test(this.state.hostId)||!Array.isArray(this.state.accounts))throw new Error('The saved ChatGPT sign-in is invalid.');
  }
  async save(){
    const target=path.join(this.directory,'chatgpt.json'),temporary=path.join(this.directory,`chatgpt-${random()}.tmp`);
    await fs.writeFile(temporary,JSON.stringify(this.state),{mode:0o600,flag:'wx'});
    await fs.rename(temporary,target);
    if(process.platform!=='win32')await fs.chmod(target,0o600);
  }
  account(){return this.state.accounts.find(a=>a.clientId===this.state.active);}
  accounts(){return this.state.accounts.map((a,i)=>({id:a.clientId,label:`${a.email||'ChatGPT account'} · ${i+1}`,active:a.clientId===this.state.active}));}
  begin(redirectUri,accountId=null){
    const selected=accountId?this.state.accounts.find(a=>a.clientId===accountId):null;
    if(accountId&&!selected)throw problem(400,'Choose a saved ChatGPT account.');
    const state=random(),verifier=random(),nonce=random(),browserId=random();
    const attempt={state,verifier,nonce,browserId,redirectUri,selected: selected?{clientId:selected.clientId,subject:selected.subject}:null,expiresAt:Date.now()+600000};
    for(const [id,item] of this.pending)if(item.expiresAt<Date.now())this.pending.delete(id);
    this.pending.set(state,attempt);
    const url=new URL(`${ISSUER}/api/accounts/authorize`);
    url.search=new URLSearchParams({client_id:selected?.clientId||'dynamic_agent_client',ext_agent_host_id:this.state.hostId,response_type:'code',redirect_uri:redirectUri,scope:SCOPES,resource:RESOURCE,state,nonce,code_challenge_method:'S256',code_challenge:crypto.createHash('sha256').update(verifier).digest('base64url'),...(!selected?{agent_name_hint:'Vilna Daf Studio'}:{}),...(selected?.idToken?{id_token_hint:selected.idToken}:{}),...(selected?.email?{login_hint:selected.email}:{})}).toString();
    return {url:url.href,browserId};
  }
  async exchange(form){
    const response=await this.fetch(`${ISSUER}/api/accounts/oauth/token`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(form).toString(),signal:AbortSignal.timeout(20000),redirect:'error'});
    if(!response.ok)throw problem(401,'ChatGPT sign-in expired or was not accepted. Please sign in again.');
    return response.json();
  }
  credentials(tokens,previous={}){
    const scopes=typeof tokens.scope==='string'?tokens.scope.split(/\s+/):previous.scopes||[];
    if(!scopes.includes('chatgpt.tokens.use.direct')||!scopes.includes('resource.invoke'))throw problem(403,'ChatGPT plan use was not enabled. Sign in again and allow this app to use your ChatGPT plan, if your account offers it.');
    if(typeof tokens.access_token!=='string'||!tokens.access_token||tokens.token_type?.toLowerCase()!=='bearer'||!(Number(tokens.expires_in)>0))throw problem(401,'ChatGPT returned an incomplete sign-in. Please try again.');
    return {accessToken:tokens.access_token,refreshToken:tokens.refresh_token||previous.refreshToken,idToken:tokens.id_token||previous.idToken,scopes,expiresAt:Date.now()+Number(tokens.expires_in)*1000};
  }
  async complete(url,browserId){
    const state=url.searchParams.get('state'),attempt=this.pending.get(state);
    if(!attempt||attempt.expiresAt<Date.now()||browserId!==attempt.browserId)throw problem(401,'This sign-in attempt expired or could not be verified. Please start again.');
    this.pending.delete(state);
    if(url.searchParams.has('error'))throw problem(403,'ChatGPT sign-in was cancelled or plan use was not allowed. You can try again.');
    const clientId=url.searchParams.get('client_id')||attempt.selected?.clientId;
    if(!clientId||clientId==='dynamic_agent_client'||(attempt.selected&&clientId!==attempt.selected.clientId))throw problem(401,'ChatGPT registration was incomplete or changed unexpectedly. Please try again.');
    const code=url.searchParams.get('code');if(!code)throw problem(401,'ChatGPT did not return a sign-in code.');
    const tokens=await this.exchange({grant_type:'authorization_code',client_id:clientId,code,code_verifier:attempt.verifier,redirect_uri:attempt.redirectUri,resource:RESOURCE});
    const claims=await verifyIdentity(tokens.id_token,{clientId,nonce:attempt.nonce,subject:attempt.selected?.subject,fetchImpl:this.fetch});
    const credentials=this.credentials(tokens);
    const existing=this.state.accounts.find(a=>a.clientId===clientId);
    if(existing&&existing.subject!==claims.sub)throw problem(401,'The selected ChatGPT account changed. Start a new account connection.');
    const record={clientId,subject:claims.sub,email:claims.email||'',...credentials};
    this.state.accounts=this.state.accounts.filter(a=>a.clientId!==clientId);this.state.accounts.push(record);this.state.active=clientId;this.catalog=null;await this.save();
  }
  async accessToken(){
    const account=this.account();if(!account?.accessToken)throw problem(401,'Continue with ChatGPT before asking the AI.');
    if(account.expiresAt>Date.now()+60000)return account.accessToken;
    if(!account.refreshToken)throw problem(401,'Your ChatGPT sign-in expired. Continue with ChatGPT again.');
    if(!this.refreshing){
      this.refreshing=(async()=>{
        const tokens=await this.exchange({grant_type:'refresh_token',client_id:account.clientId,refresh_token:account.refreshToken,resource:RESOURCE});
        if(!tokens.refresh_token)throw problem(401,'ChatGPT did not renew the sign-in completely. Please reconnect.');
        if(tokens.id_token)await verifyIdentity(tokens.id_token,{clientId:account.clientId,subject:account.subject,fetchImpl:this.fetch});
        const credentials=this.credentials(tokens,account);
        // A sign-out while refreshing must not restore the signed-out session.
        if(this.account()!==account||!account.accessToken)throw problem(401,'ChatGPT was signed out.');
        Object.assign(account,credentials);await this.save();return account.accessToken;
      })().finally(()=>{this.refreshing=null;});
    }
    return this.refreshing;
  }
  async models(){
    const token=await this.accessToken(),account=this.account();
    if(this.catalog?.clientId===account.clientId&&this.catalog.expiresAt>Date.now())return this.catalog.models;
    const response=await this.fetch(`${RESOURCE}/models`,{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(15000),redirect:'error'});
    if(!response.ok)throw problem(response.status===429?429:502,'Your ChatGPT models are unavailable. Check your account allowance or reconnect.');
    const data=await response.json();
    const models=(data.models||[]).filter(m=>m.visibility==='list'&&typeof m.slug==='string'&&typeof m.display_name==='string').map(m=>({id:m.slug,name:m.display_name}));
    if(!models.length)throw problem(403,'This ChatGPT account has no available models for the builder. No paid API fallback was used.');
    this.catalog={clientId:account.clientId,expiresAt:Date.now()+300000,models};return models;
  }
  async signOut(){
    const account=this.account();let revoked=true;
    if(account?.refreshToken){
      try{
        const discovery=await this.fetch(`${ISSUER}/.well-known/openid-configuration`,{signal:AbortSignal.timeout(10000),redirect:'error'});
        if(!discovery.ok)throw new Error();
        const endpoint=new URL((await discovery.json()).revocation_endpoint);
        if(endpoint.origin!==ISSUER)throw new Error();
        const response=await this.fetch(endpoint.href,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({token:account.refreshToken,token_type_hint:'refresh_token',client_id:account.clientId}).toString(),signal:AbortSignal.timeout(10000),redirect:'error'});
        revoked=response.status===200;
      }catch{revoked=false;}
    }
    if(account){delete account.accessToken;delete account.refreshToken;delete account.idToken;delete account.expiresAt;delete account.scopes;}
    this.state.active=null;this.catalog=null;await this.save();
    return {revoked,message:revoked?'Signed out on this computer.':'Signed out on this computer. Remote disconnection could not be confirmed; you can disconnect Vilna Daf Studio in ChatGPT Settings.'};
  }
}
module.exports={ChatGPTAuth,verifyIdentity,defaultDirectory};
