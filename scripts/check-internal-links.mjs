import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
const root=path.resolve('dist'),site='https://ugcarabie.com'
const decode=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>')
const sitemap=await fs.readFile(path.join(root,'sitemap.xml'),'utf8')
const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(x=>new URL(decode(x[1])))
const routes=new Set(urls.map(x=>decodeURIComponent(x.pathname)))
const graph=new Map(),errors=[],warnings=[]
let edges=0
const fileFor=p=>path.join(root,p.replace(/^\//,''),p.endsWith('/')?'index.html':'')
const exists=async p=>{try{return (await fs.stat(p)).isFile()}catch{return false}}
for(const route of routes){
 const file=fileFor(route)
 if(!await exists(file)){errors.push('Missing sitemap page '+route);continue}
 const html=await fs.readFile(file,'utf8')
 const canonical=html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1]
 if(!canonical||decodeURIComponent(new URL(decode(canonical)).pathname)!==route)errors.push('Canonical mismatch '+route)
 const clean=html.replace(/<script\b[\s\S]*?<\/script>/gi,'').replace(/<style\b[\s\S]*?<\/style>/gi,'')
 const targets=new Set()
 for(const match of clean.matchAll(/<a\b[^>]*\bhref="([^"]*)"/gi)){
  const raw=decode(match[1]);if(!raw||/^(mailto:|tel:|javascript:)/i.test(raw))continue
  let u;try{u=new URL(raw,site+route)}catch{errors.push('Invalid link '+route+' '+raw);continue}
  if(u.origin!==site)continue
  const p=decodeURIComponent(u.pathname),canonicalPath=p.endsWith('/')?p:p+'/'
  if(routes.has(canonicalPath)){
   targets.add(canonicalPath)
   if(p!==canonicalPath)warnings.push(route+' → '+raw+' (noncanonical)')
  }else if(!await exists(fileFor(p))&&!await exists(fileFor(canonicalPath))){
   errors.push(route+' → '+raw+' (missing destination)')
  }
  if(u.hash&&p===route&&!clean.includes('id="'+decodeURIComponent(u.hash.slice(1))+'"'))errors.push(route+' → '+raw+' (missing fragment)')
 }
 graph.set(route,targets);edges+=targets.size
}
const depth=new Map([['/',0]]),queue=['/']
while(queue.length){const r=queue.shift();for(const dest of graph.get(r)||[]){if(!depth.has(dest)){depth.set(dest,depth.get(r)+1);queue.push(dest)}}}
const orphan=[...routes].filter(r=>!depth.has(r))
const deep=[...depth].filter(([r,d])=>d>3)
if(orphan.length)errors.push('Unreachable sitemap routes: '+orphan.join(', '))
if(deep.length)errors.push('More than 3 clicks: '+deep.map(([r,d])=>r+' ('+d+')').join(', '))
console.log('Internal links: '+routes.size+' sitemap routes, '+edges+' unique page-to-page links, '+orphan.length+' unreachable, maximum depth '+Math.max(...depth.values()))
if(warnings.length)console.warn('Noncanonical existing links: '+warnings.length+'\n'+warnings.slice(0,15).join('\n'))
assert.equal(errors.length,0,errors.join('\n'))
