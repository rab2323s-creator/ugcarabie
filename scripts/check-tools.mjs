import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {toolsCatalog,toolPath} from '../src/lib/toolsCatalog.js'
import vm from 'node:vm'
const read=p=>fs.readFile('dist'+p,'utf8')
const sitemap=await read('/sitemap.xml')
for(const route of ['/tools/',...toolsCatalog.map(toolPath)]){
 const html=await read(route+'index.html')
 assert.ok(html.includes('rel="canonical" href="https://ugcarabie.com'+route+'"'),route+' canonical')
 assert.ok(html.includes('name="robots" content="index'),route+' indexable')
 assert.ok(sitemap.includes('https://ugcarabie.com'+route),route+' sitemap')
 assert.equal((html.match(/<h1>/g)||[]).length,1,route+' single H1')
 assert.ok(!html.includes('id="root"'),route+' static HTML')
 const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])
 assert.ok(schema['@graph'].some(x=>x['@type']==='BreadcrumbList'),route+' breadcrumbs')
}
for(const t of toolsCatalog){
 const html=await read(toolPath(t)+'index.html')
 assert.ok(html.includes('href="'+t.file+'"')&&html.includes('href="'+t.article+'"'),t.slug+' resource and guide')
 await fs.access('dist/tools/assets/'+t.visual+'.svg')
 const file=await fs.readFile('dist'+t.file)
 if(t.download){
 assert.equal(file.subarray(0,4).toString('hex'),'504b0304','Excel ZIP signature')
 assert.ok(file.includes(Buffer.from('xl/workbook.xml')),'Excel workbook XML entry')
 }else{
 const src=file.toString('utf8')
 assert.ok(src.includes('name="robots" content="noindex'),t.slug+' executable noindex')
 for(const match of src.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(match[1],{filename:t.file})
 }
}
new vm.Script(await read('/tools/filter.js'))
console.log('PASS: 6 standalone indexable tools pages, sitemap, assets, downloads and script syntax')
