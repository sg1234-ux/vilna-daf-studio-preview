// PDF text extraction stays on the device. The original file is kept for exact-page viewing.
import {getDocument,GlobalWorkerOptions} from './assets/vendor/pdfjs/pdf.min.mjs';
GlobalWorkerOptions.workerSrc=new URL('./assets/vendor/pdfjs/pdf.worker.min.mjs?v=5.6.205',import.meta.url).href;
export const MAX_PDF_BYTES=64*1024*1024;
export async function readPDF(file,onProgress=()=>{}){
 if(file.size>MAX_PDF_BYTES)throw Error('Choose a PDF smaller than 64 MB.');
 const buffer=await file.arrayBuffer();
 if(new TextDecoder().decode(buffer.slice(0,5))!=='%PDF-')throw Error('This file is not a PDF. Choose the PDF downloaded from your slides.');
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer)),n=>n.toString(16).padStart(2,'0')).join('');
 const task=getDocument({data:new Uint8Array(buffer.slice(0)),isEvalSupported:false,useSystemFonts:false,disableFontFace:true,useWorkerFetch:false,enableXfa:false});
 let doc;
 try{
  doc=await task.promise;if(doc.numPages>150)throw Error('Import a PDF with up to 150 pages.');const slides=[];
  for(let page=1;page<=doc.numPages;page++){
   onProgress(page,doc.numPages);const p=await doc.getPage(page),content=await p.getTextContent();
   const hebrew=[];
   for(const item of content.items){
    const str=(item.str||'').normalize('NFKD').replace(/[\u0591-\u05c7]/g,'');if(!/[א-ת]/.test(str))continue;
    const x=item.transform[4],y=item.transform[5],height=item.height||Math.abs(item.transform[3])||12;
    let line=hebrew.find(l=>Math.abs(l.y-y)<Math.min(l.height,height)*0.35);if(!line){line={y,height,items:[]};hebrew.push(line);}
    line.items.push({str,x,width:item.width||0,height});
   }
   const hebrewText=hebrew.sort((a,b)=>b.y-a.y).map(line=>{
    const items=line.items.sort((a,b)=>b.x-a.x);let result='',previous=null;
    for(const item of items){if(previous&&previous.x-(item.x+item.width)>Math.min(previous.height,item.height)*0.16)result+=' ';result+=item.str;previous=item;}
    return result;
   }).join('\n');
   const english=content.items.filter(i=>!/[\u0590-\u05ff\ufb1d-\ufb4f]/.test(i.str||'')).map(i=>i.str||'').join(' ');
   const text=(hebrewText+'\n'+english).trim().slice(0,30000);p.cleanup();
   slides.push({id:`pdf-page-${page}`,number:page,text,url:`vilna-pdf:${hash}:${page}`});
  }
  const dataUrl=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('The PDF could not be read. Try selecting it again.'));r.readAsDataURL(new Blob([buffer],{type:'application/pdf'}));});
  return {title:file.name,url:'',slides,document:{id:hash,name:file.name,pageCount:doc.numPages,size:file.size,dataUrl}};
 }catch(e){if(e.name==='PasswordException')throw Error('This PDF needs a password. Choose an unencrypted PDF export.');throw e;}finally{await task.destroy();}
}
