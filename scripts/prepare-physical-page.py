"""Compile manually inspected scan observations into source-linked physical-page instructions.
Never infers scan rows: first/last words and boxes must be supplied from visual inspection.
"""
import json,re,unicodedata,difflib,hashlib,sys
from pathlib import Path
from functools import lru_cache
ROOT=Path(__file__).resolve().parents[1]/'preparation'
def norm(s):return re.sub('[^א-ת]','',unicodedata.normalize('NFD',s))
def lex(s):return [w for w in re.sub('<[^>]+>',' ',s).split()if norm(w)]
def leaves(x,p=()):return [z for i,t in enumerate(x)for z in leaves(t,p+(i,))]if isinstance(x,list)else[(p,x)]
def compile_page(o):
 slug=o['slug'];rawfile=ROOT/'sources'/f'{slug}.json';src=json.loads(rawfile.read_text());streams={}
 for name,obs in o['streams'].items():
  raw=[(p,t)for p,t in leaves(src['streams'][name]['he'])if t]
  if obs.get('commentOrder'):raw=[raw[i]for i in obs['commentOrder']]
  tokens=[dict(sourceWordId=f'{name}:{".".join(map(str,p))}:{i}',sourceText=t)for p,text in raw for i,t in enumerate(lex(text))];words=[norm(t['sourceText'])for t in tokens]
  lines=[dict(line=i+1,firstWord=(ws:=r.split())[0],lastWord=ws[-1],role='text')for i,r in enumerate(obs['rows'])]
  aliases={**o.get('aliases',{}),**obs.get('aliases',{})}
  def endpoint(i,key):
   value=lines[i][key];return list(map(norm,obs.get('endpointSource',{}).get(str(i+1)+':'+key,aliases.get(value,[value]))))
  @lru_cache(None)
  def solve(i,start):
   if i==len(lines):return (0,((),),i,start)if start==len(words)else(10**6,(),i,start)
   a=endpoint(i,'firstWord');b=endpoint(i,'lastWord')
   if words[start:start+len(a)]!=a:return(10**6,(),i,start)
   best=10**6;paths=[];depth=i;failed=start
   for end in range(start+1,min(len(words),start+95)+1):
    if words[end-len(b):end]!=b:continue
    score,tails,d,z=solve(i+1,end)
    if d>depth:depth,failed=d,z
    if not tails:continue
    penalty=0
    if str(i+1)in obs.get('printedText',{}):
     aa=words[start:end];bb=list(map(norm,lex(obs['printedText'][str(i+1)])));penalty=sum(max(y-x,v-u)for tag,x,y,u,v in difflib.SequenceMatcher(None,aa,bb,autojunk=False).get_opcodes()if tag!='equal')
    score+=penalty
    if score<best:best=score;paths=[]
    if score==best:
     for tail in tails:
      if len(paths)<2:paths.append((end,)+tail)
   return(best,tuple(paths),depth,failed)
  score,paths,d,z=solve(0,0)
  print(name,'rows',len(lines),'source words',len(words),'solutions',len(paths),'score',score,'reached',d,'next source',[t['sourceText']for t in tokens[z:z+8]],'next row',lines[d]if d<len(lines)else None)
  if len(paths)>1:
   print('ambiguous rows',[i+1 for i,(a,b)in enumerate(zip(paths[0],paths[1]))if a!=b])
  if len(paths)!=1:raise ValueError('Needs scan/source review: '+name)
  cursor=0
  for i,(l,end)in enumerate(zip(lines,paths[0])):
   l['sourceSpan']=[cursor,end];l['sourceWordIds']=[t['sourceWordId']for t in tokens[cursor:end]];l['sourceText']=' '.join(t['sourceText']for t in tokens[cursor:end]);plain=re.sub('[\u0591-\u05c7]','',unicodedata.normalize('NFD',l['sourceText']));display=obs.get('printedText',{}).get(str(i+1))
   if display is None:
    ws=lex(plain);a=endpoint(i,'firstWord');b=endpoint(i,'lastWord');display=' '.join([l['firstWord']]+ws[len(a):len(ws)-len(b)]+[l['lastWord']])if len(ws)>len(a)+len(b)else plain
   l['displayText']=display;l['alignment']=obs.get('alignments',{}).get(str(i+1),'justify')
   aa=list(map(norm,lex(plain)));bb=list(map(norm,lex(display)));v=[dict(operation=tag,sourceWordSpan=[cursor+x,cursor+y],sourceWords=aa[x:y],printedWords=bb[u:v])for tag,x,y,u,v in difflib.SequenceMatcher(None,aa,bb,autojunk=False).get_opcodes()if tag!='equal']
   if v:l['printVariants']=v
   cursor=end
  streams[name]=dict(tokens=tokens,lines=lines,sourceWordCount=len(tokens),borrowedWordCount=0)
 for name,s in streams.items():
  cursor=0
  for b in [b for b in o['blocks']if b['stream']==name]:
   x,y,x2,y2=b['box'];pitch=(y2-y)/b['lineCount']
   for i,l in enumerate(s['lines'][cursor:cursor+b['lineCount']]):l['block']=b['id'];l['lineBox']=[x,round(y+i*pitch,3),x2,round(y+(i+1)*pitch,3)]
   cursor+=b['lineCount']
  assert cursor==len(s['lines']),(name,cursor,len(s['lines']))
 idx=json.loads((ROOT/'reference-images.json').read_text());refimg=next(i for i in idx['images']if i['slug']==slug)
 spec=dict(format='vilna-daf-preparation-page',version=1,ref=src['ref'],status='preparation-complete-renderer-adapter-pending',preparationComplete=True,engineReady=False,scan=dict(url=refimg['url'],sha256=refimg['sha256'],width=o['width'],height=o['height'],contentBox=o['coreBox']),coordinateSystem='Pixels in the pinned reference image; measured region boxes and interpolated row cells, not glyph outlines.',renderInstructions=dict(format='vilna-prepared-physical-page',version=1,direction='rtl',coreBox=o['coreBox'],openingLines=4,nextPagePreviewPolicy='omit-isolated-preview-words',streams=streams,blocks=o['blocks'],headers=o.get('headers',[]),titles=o.get('titles',[]),measuredGemaraGuttersPixels=o['gutters'],scaling='Scale boxes and gutter measurements consistently; preserve observed row boundaries.',editingPolicy={'appearance':'Explicit local appearance edits override defaults while preserving source spans.','source':'Keep canonical source identities and document printed variants separately.'}),notes=o.get('notes',[]),remainingPreparation=[],pendingIntegration=['Batch builder integration remains paused until the preparation collection is complete.'],verification=dict(method='Manual enlarged-scan endpoint observations; globally reconciled unique source spans; source snapshot and image hashes pinned.',reviewedOn=o['reviewedOn'],sourceSnapshotSha256=hashlib.sha256(rawfile.read_bytes()).hexdigest(),observationFile='observations/'+slug+'.json'))
 (ROOT/'pages'/f'{slug}.json').write_text(json.dumps(spec,ensure_ascii=False,indent=2)+'\n')
 m=json.loads((ROOT/'manifest.json').read_text())
 for c in m['chapters']:
  for p in c['pages']:
   if p['slug']==slug:p.update(status=spec['status'],preparationComplete=True,engineReady=False,specification='pages/'+slug+'.json')
 (ROOT/'manifest.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
if __name__=='__main__':compile_page(json.loads(Path(sys.argv[1]).read_text()))
