(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.VilnaPreparedLibrary=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const key=ref=>String(ref||'').trim().replace(/\s+/g,' ').toLowerCase();
  function readyEntry(manifest,ref){
    if(manifest?.format!=='vilna-daf-preparation-library'||manifest.version!==1||!Array.isArray(manifest.chapters))throw Error('Invalid preparation library.');
    const matches=manifest.chapters.flatMap(chapter=>chapter.pages||[]).filter(page=>key(page.ref)===key(ref));
    if(matches.length>1)throw Error('Duplicate page in preparation library.');
    const entry=matches[0];
    if(!entry||entry.engineReady!==true)return null;
    if(typeof entry.specification!=='string'||! /^(existing|pages)\/[a-z0-9-]+\.json$/.test(entry.specification))throw Error('Invalid prepared-page path.');
    return entry;
  }
  async function load(ref,fetcher=fetch){
    const response=await fetcher('../preparation/manifest.json');
    if(response.status===404)return null;
    if(!response.ok)throw Error('The preparation library could not be loaded.');
    const manifest=await response.json(),entry=readyEntry(manifest,ref);if(!entry)return null;
    const specification=await fetcher('../preparation/'+entry.specification);
    if(!specification.ok)throw Error('The prepared page could not be loaded.');
    const pack=await specification.json();
    if(pack.renderInstructions){
      if(key(pack.ref)!==key(ref)||pack.preparationComplete!==true||(entry.rendererAdapter||pack.rendererAdapter)!=='physical-page-v1')throw Error('This prepared page is not enabled for this renderer.');
      const adapter=typeof module==='object'&&module.exports?require('./physical-page.js'):globalThis.VilnaPhysicalPage;
      if(!/^sources\/[a-z0-9-]+\.json$/.test(entry.sourceSnapshot))throw Error('Invalid prepared source path.');
      const original=await fetcher('../preparation/'+entry.sourceSnapshot);if(!original.ok)throw Error('The saved commentary source could not be loaded.');
      const snapshot=await original.json();if(key(snapshot.ref)!==key(ref))throw Error('The saved commentary source belongs to another page.');
      const borrowed={};for(const name of ['rashi','rashbam','tosafot'])for(const token of (pack.renderInstructions.streams[name]?.tokens||[])){
        if((!token.nextAmud&&!token.incomingFromPreviousAmud)||!token.ref||borrowed[token.ref])continue;
        const sourceEntry=manifest.chapters.flatMap(c=>c.pages||[]).find(p=>key(p.ref)===key(token.ref));
        if(!sourceEntry||!/^sources\/[a-z0-9-]+\.json$/.test(sourceEntry.sourceSnapshot))throw Error('The borrowed commentary source is unavailable.');
        const next=await fetcher('../preparation/'+sourceEntry.sourceSnapshot);if(!next.ok)throw Error('The borrowed commentary source could not be loaded.');borrowed[token.ref]=await next.json();if(key(borrowed[token.ref].ref)!==key(token.ref))throw Error('The borrowed commentary source belongs to another page.');
      }
      adapter.markDibbur(pack.renderInstructions,snapshot,borrowed);
      return adapter.pack(pack);
    }
    if(key(pack.ref)!==key(ref)||!pack.profile?.maps||!pack.profile?.layout||!pack.source||['gemaraHtml','rashiHtml','tosafotHtml'].some(name=>typeof pack.source[name]!=='string'))throw Error('This prepared page does not contain a complete rendering pack.');
    if(pack.engineReady===false)throw Error('This page is still being prepared.');
    return {...pack,profile:{...pack.profile,prepared:true}};
  }
  return {readyEntry,load};
});
