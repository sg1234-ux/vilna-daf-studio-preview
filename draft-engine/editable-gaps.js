/* Turn justified whitespace into real, individually editable spaces.
   Measurements are taken before any DOM changes; approved storage is never written. */
(function(root){
  'use strict';
  function spacePlan(width,natural){
    if(!(width>0)||!(natural>0))return null;
    const count=Math.max(1,Math.min(200,Math.round(width/natural)));
    return {count,spacing:width/count-natural};
  }
  function prepare(page){
    const doc=page.ownerDocument,win=doc.defaultView;
    for(const region of page.querySelectorAll('.flow-region,.top-commentary')){
      if(region.dataset.editableGaps==='1')continue;
      const words=[...region.querySelectorAll('.word-token')].filter(w=>w.textContent.trim()&&!w.closest('.tosafot-notice'));
      if(!words.length)continue;
      const original=region.innerHTML,style=region.style.cssText;
      const zoom=page.getBoundingClientRect().width/page.offsetWidth||1;
      const rows=[];
      for(const word of words){
        const rect=word.getBoundingClientRect(),cs=win.getComputedStyle(word);
        const mapped=word.closest('.mapped-line');
        let row=rows.at(-1);
        if(!row||row.mapped!==mapped||(!mapped&&Math.abs(rect.bottom-row.bottom)>Math.max(2,rect.height*.35))){
          row={mapped,bottom:rect.bottom,words:[]};rows.push(row);
        }
        row.words.push({word,rect,font:cs.font,fontFamily:cs.fontFamily,fontSize:cs.fontSize,fontWeight:cs.fontWeight,fontStyle:cs.fontStyle,letterSpacing:cs.letterSpacing});
      }
      // Non-text decorations need their existing layout, so leave those regions alone.
      if(!rows.every(r=>r.words.length))continue;
      const plans=[];
      for(const row of rows){
        const line=row.mapped||doc.createElement('span'),cs=win.getComputedStyle(row.mapped||region);
        const right=Math.max(...row.words.map(w=>w.rect.right));
        const anchor=(row.mapped||region).getBoundingClientRect();
        const probe=doc.createElement('span');probe.textContent='\u00a0';
        Object.assign(probe.style,{font:cs.font,whiteSpace:'pre',position:'absolute',visibility:'hidden',wordSpacing:'0',letterSpacing:'0'});
        region.append(probe);const natural=probe.getBoundingClientRect().width/zoom;probe.remove();
        const fragment=doc.createDocumentFragment();
        row.words.forEach((item,i)=>{
          const token=item.word.cloneNode(true);
          // A bold opener can inherit from an ancestor outside the word span.
          Object.assign(token.style,{fontFamily:item.fontFamily,fontSize:item.fontSize,fontWeight:item.fontWeight,fontStyle:item.fontStyle,letterSpacing:item.letterSpacing});
          fragment.append(token);
          if(i<row.words.length-1){
            const next=row.words[i+1],width=Math.max(0,(item.rect.left-next.rect.right)/zoom),plan=spacePlan(width,natural);
            if(plan){const gap=doc.createElement('span');gap.className='editable-word-gap';gap.textContent='\u00a0'.repeat(plan.count);
              Object.assign(gap.style,{display:'inline-block',whiteSpace:'pre',font:cs.font,letterSpacing:'0',wordSpacing:plan.spacing+'px',direction:'rtl'});fragment.append(gap);}
          }
        });
        plans.push({line,fragment,inset:Math.max(0,(anchor.right-right)/zoom),height:parseFloat(cs.lineHeight)||parseFloat(cs.fontSize)*1.2,mapped:row.mapped});
      }
      for(const plan of plans){
        if(!plan.mapped){plan.line.className='editable-fixed-line';Object.assign(plan.line.style,{display:'block',height:plan.height+'px'});}
        plan.line.replaceChildren(plan.fragment);
        Object.assign(plan.line.style,{whiteSpace:'nowrap',textAlign:'right',textAlignLast:'right',boxSizing:'border-box',paddingRight:plan.inset+'px'});
      }
      if(!rows[0].mapped)region.replaceChildren(...plans.map(p=>p.line));
      region.dataset.editableGaps='1';
      // Revert rather than move any words if a page uses an unsupported layout.
      const after=[...region.querySelectorAll('.word-token')];
      const before=rows.flatMap(r=>r.words);
      // Removing ancestor formatting can shift an inline baseline or rounding by
      // a few pixels. Keep that visual offset on the word, not in the blank gap.
      if(after.length===before.length)after.forEach((word,i)=>{
        const r=word.getBoundingClientRect(),b=before[i].rect;
        const dx=(b.left-r.left)/zoom,dy=(b.top-r.top)/zoom;
        if(Math.abs(dx)<32&&Math.abs(dy)<32&&(Math.abs(dx)>.01||Math.abs(dy)>.01)){
          word.style.position='relative';word.style.left=dx+'px';word.style.top=dy+'px';
        }
      });
      const changed=after.length!==before.length||after.some((w,i)=>{const r=w.getBoundingClientRect(),b=before[i].rect;return Math.abs(r.left-b.left)>zoom*.1||Math.abs(r.top-b.top)>zoom*.1||Math.abs(r.width-b.width)>zoom*.5;});
      if(changed){const i=after.findIndex((w,i)=>{const r=w.getBoundingClientRect(),b=before[i]?.rect;return !b||Math.abs(r.left-b.left)>zoom*.1||Math.abs(r.top-b.top)>zoom*.1||Math.abs(r.width-b.width)>zoom*.5;});const r=after[i]?.getBoundingClientRect(),b=before[i]?.rect;region.innerHTML=original;region.style.cssText=style;delete region.dataset.editableGaps;region.dataset.editableGapFallback=JSON.stringify({before:before.length,after:after.length,index:i,dx:r&&b?(r.left-b.left)/zoom:null,dy:r&&b?(r.top-b.top)/zoom:null,dw:r&&b?(r.width-b.width)/zoom:null});}
    }
    const hint=doc.getElementById('editGapStatus');
    if(hint){const regions=[...page.querySelectorAll('.flow-region,.top-commentary')].filter(r=>r.querySelector('.word-token'));
      const skipped=regions.some(r=>r.dataset.editableGaps!=='1');
      hint.hidden=false;hint.textContent=skipped?'Editable spaces are ready where word positions could be preserved. Some regions retain their original spacing.':'Wide gaps now contain several editable spaces. Delete one space at a time, or type in the gap. Save project to keep your edits.';}
  }
  function has(page){return Boolean(page.querySelector('[data-editable-gaps="1"]'));}
  function capture(page){
    if(!has(page))return undefined;
    const regions={};for(const id of ['bodyGeometry','topRight','topLeft']){const el=page.querySelector('#'+id);if(!el)return undefined;const clone=el.cloneNode(true);clone.querySelectorAll('.phrase-visual-icon').forEach(x=>x.remove());regions[id]={html:clone.innerHTML,style:el.style.cssText,className:el.className,stream:el.dataset.stream||''};}
    return {version:1,regions};
  }
  function restore(page,saved){
    if(!saved)return false;
    if(saved.version!==1)throw Error('Unsupported saved editing layout.');
    const doc=page.ownerDocument,plans=[];
    for(const id of ['bodyGeometry','topRight','topLeft']){
      const data=saved.regions?.[id],target=page.querySelector('#'+id);if(!data||!target||typeof data.html!=='string')throw Error('Incomplete saved editing layout.');
      const template=doc.createElement('template');template.innerHTML=data.html;
      for(const el of template.content.querySelectorAll('*')){
        if(!['DIV','SPAN','STRONG','B','EM','I','BR'].includes(el.tagName))throw Error('Unsupported saved editing markup.');
        for(const a of [...el.attributes]){
          if(a.name==='style'){if(/url\s*\(|expression\s*\(/i.test(a.value))throw Error('Unsupported saved editing style.');}
          else if(!/^(?:class|dir|contenteditable|spellcheck|tabindex|data-[a-z0-9-]+|aria-[a-z0-9-]+)$/.test(a.name))el.removeAttribute(a.name);
        }
      }
      if(/url\s*\(|expression\s*\(/i.test(data.style||''))throw Error('Unsupported saved editing style.');
      plans.push({target,data,html:template.innerHTML});
    }
    for(const {target,data,html}of plans){target.innerHTML=html;target.style.cssText=data.style||'';target.className=data.className||'';if(data.stream)target.dataset.stream=data.stream;}
    return true;
  }
  const api={prepare,has,capture,restore,spacePlan};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.VilnaEditableGaps=api;
})(typeof window==='object'?window:globalThis);
