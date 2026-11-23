import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import {blogArticles,blogCategories,blogInfo,blogPath,articleSchema} from '../src/lib/blogContent.js'

const root=path.resolve('dist')
const clean=s=>String(s).replace(/<[^>]*>/g,' ')
const read=async file=>fs.readFile(path.join(root,file),'utf8')
const count=blogArticles.length
assert.equal(count,6,'Publish exactly six original guides')
assert.equal(blogCategories.length,3,'Three editorial categories')
assert.equal(new Set(blogArticles.map(a=>a.slug)).size,count,'Unique article slugs')
for(const category of blogCategories){
 assert.equal(blogArticles.filter(a=>a.category===category.id).length,2,'Two articles in '+category.id)
}
const index=await read('blog/index.html')
assert.ok(index.includes('application/ld+json')&&index.includes('CollectionPage'),'Blog index needs structured data')
assert.ok(index.includes('rel="canonical"'),'Blog index canonical missing')
for(const article of blogArticles){
 assert.match(article.slug,/^[\p{Script=Arabic}0-9A-Za-z-]+$/u,'Arabic keyword path required')
 assert.ok(article.slug.includes('UGC'),'UGC should remain English')
 assert.ok(article.sections.length>=5,'Depth: five or more sections')
 assert.ok(article.metaDescription.length>75 && article.metaDescription.length<165,'Useful search meta description')
 assert.ok(article.seoTitle.length>=25&&article.seoTitle.length<82,'Search title')
 assert.ok(article.image.startsWith('/images/blog/')&&article.image.endsWith('.webp'),'WebP media path')
 assert.ok(article.sections.every(s=>s.heading.endsWith('؟')&&s.answer.length>100),'Direct-answer H2 structure')
 const words=clean([article.lead,...article.sections.flatMap(s=>[s.heading,s.answer,...(s.paragraphs||[]),...(s.bullets||[]),s.example||'']),...article.faqs.map(f=>f.answer)].join(' ')).split(/\s+/u).filter(Boolean)
 assert.ok(words.length>=450,'Article not substantial: '+article.slug+' '+words.length)
 const relative='blog/'+article.slug+'/index.html'
 const html=await read(relative)
 for(const snippet of [article.title,article.sections[0].heading,article.sections[0].answer,article.cta.label,article.metaDescription]){
  assert.ok(html.includes(snippet),relative+' missing content: '+snippet.slice(0,40))
 }
 assert.ok(html.includes('application/ld+json')&&html.includes('BlogPosting')&&html.includes('BreadcrumbList'),'JSON-LD missing on '+relative)
 assert.ok(html.includes('rel="canonical"')&&html.includes(blogPath(article)),'Canonical missing '+relative)
 assert.ok(html.includes('name="robots" content="index'),'Article accidentally noindex '+relative)
 assert.ok(html.includes('<h2>')&&html.includes('<h3>'),'Structured headings missing '+relative)
 const imageIsAvailable=await fs.access(path.join(root,article.image.slice(1))).then(()=>true,()=>false)
 if(!imageIsAvailable)assert.ok(!html.includes('"image":{"@type":"ImageObject"'),'Do not claim nonexistent image in schema')
 const schema=articleSchema(article,{imageAvailable:imageIsAvailable})
 assert.ok(schema.some(entry=>entry['@type']==='BlogPosting'))
 console.log('PASS',relative,words.length+' words',imageIsAvailable?'image ready':'image awaiting upload')
}
const sitemap=await read('sitemap.xml')
for(const article of blogArticles)assert.ok(sitemap.includes(blogPath(article)),'Sitemap missing '+article.slug)
console.log('Blog editorial audit PASS:',count,'articles, 3 categories, complete metadata and prerender')
