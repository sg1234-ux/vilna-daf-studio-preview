/* Free, text-based slide matching. Never sends Gemara or slides to an AI service. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.VilnaLessonDeck=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 'use strict';
 const MAX_HTML=8*1024*1024,MAX_SLIDES=150;
 function deckUrl(raw){
  let u;try{u=new URL(raw);}catch{throw Error('Paste a complete Google Slides deck link.');}
  const m=u.pathname.match(/^\/presentation\/(?:u\/\d+\/)?d\/([A-Za-z0-9_-]{10,200})(?:\/|$)/);
  if(u.protocol!=='https:'||u.hostname!=='docs.google.com'||u.username||u.password||u.port||!m)throw Error('Deck matching currently supports Google Slides links. Canva links can still be attached individually.');
  return {id:m[1],url:`https://docs.google.com/presentation/d/${m[1]}/edit`,readUrl:`https://docs.google.com/presentation/d/${m[1]}/htmlpresent`};
 }
 function decode(s){return String(s).replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,(_,v)=>{if(v[0]==='#'){const n=v[1].toLowerCase()==='x'?parseInt(v.slice(2),16):Number(v.slice(1));return n>0&&n<=0x10ffff?String.fromCodePoint(n):' ';}return {amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '}[v.toLowerCase()];});}
 function plain(s){return decode(s.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim();}
 function parseHtml(html,rawUrl){
  const deck=deckUrl(rawUrl);if(typeof html!=='string'||html.length>MAX_HTML)throw Error('The saved slide view is too large (maximum 8 MB).');
  const slides=[],ids=new Set();
  for(const m of html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section\s*>/gi)){
   const attrs=m[1],cls=attrs.match(/\bclass\s*=\s*["']([^"']*)["']/i)?.[1]||'';if(!cls.split(/\s+/).includes('slide-content'))continue;
   const url=decode(attrs).match(/https:\/\/docs\.google\.com\/presentation\/d\/([A-Za-z0-9_-]+)\/viewpage\?[^"'<>\s)]*/)?.[0];
   if(!url)throw Error('The slide view does not contain reliable slide links. Open the deck’s text view and save that page again.');
   const source=new URL(url);if(!source.pathname.startsWith(`/presentation/d/${deck.id}/`))throw Error('This saved slide view belongs to a different deck. Paste its matching deck link.');
   const id=source.searchParams.get('pageid');if(!id||!/^[-A-Za-z0-9_.]{1,200}$/.test(id)||ids.has(id))throw Error('The slide view contains missing or repeated slide IDs.');
   ids.add(id);const text=plain(m[2]);if(text.length>30000)throw Error('A slide contains too much text to match safely.');
   slides.push({number:slides.length+1,id,url:deck.url+'#slide=id.'+id,text});if(slides.length>MAX_SLIDES)throw Error('Import up to 150 slides at a time.');
  }
  if(!slides.length)throw Error('The deck could not be read. It may require sign-in. Open its text view, save that page as HTML, and use Load saved slide view. You can keep the deck’s current sharing settings.');
  return {title:plain(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'Google Slides'),url:deck.url,slides};
 }
 function norm(s){return String(s).normalize('NFD').replace(/[\u0591-\u05c7]/g,'').replace(/[^א-ת]/g,'');}
 function words(s){return String(s).replace(/[־–—]/g,' ').split(/\s+/).map(norm).filter(Boolean);}
 function matchSlides(slides,source){
  const tokens=source.map(t=>({...t,value:norm(t.text)})).filter(t=>t.value&&Number.isInteger(t.phraseIndex)),grams=new Map();
  for(let i=0;i<tokens.length-2;i++){const k=tokens.slice(i,i+3).map(t=>t.value).join(' ');if(!grams.has(k))grams.set(k,[]);grams.get(k).push(i);}
  return slides.map(slide=>{
   const sw=words(slide.text).slice(0,1500),hits=[];
   for(let j=0;j<sw.length-2&&hits.length<2000;j++)for(const start of (grams.get(sw.slice(j,j+3).join(' '))||[]).slice(0,80)){
    let n=3;while(n<60&&j+n<sw.length&&start+n<tokens.length&&tokens[start+n].value===sw[j+n])n++;
    hits.push({start,end:start+n,length:n,quote:tokens.slice(start,start+n).map(t=>t.text).join(' ')});
   }
   hits.sort((a,b)=>b.length-a.length||a.start-b.start);
   const maximal=[];for(const h of hits)if(!maximal.some(p=>p.start<=h.start&&p.end>=h.end))maximal.push(h);
   const choices=[],seen=new Set();
   for(const h of maximal){
    const indices=[...new Set(tokens.slice(h.start,h.end).map(t=>t.phraseIndex))],key=indices.join(',');if(seen.has(key))continue;seen.add(key);
    const ambiguous=maximal.some(p=>p.start!==h.start&&p.quote.split(/\s+/).map(norm).join(' ')===h.quote.split(/\s+/).map(norm).join(' '));
    choices.push({phraseIndices:indices,quote:h.quote,wordCount:h.length,ambiguous});if(choices.length===8)break;
   }
   const best=choices[0],suggested=best&&!best.ambiguous?0:null;
   return {...slide,choices,suggested,reason:!sw.length?'No readable Hebrew text. Choose a phrase manually.':!best?'No matching Hebrew quote found. Choose a phrase manually.':best.ambiguous?'This quote occurs more than once. Choose the intended phrase.':'Hebrew quote matched. Review the proposed phrase before adding.'};
  });
 }
 return {deckUrl,parseHtml,matchSlides,norm,MAX_HTML};
});
