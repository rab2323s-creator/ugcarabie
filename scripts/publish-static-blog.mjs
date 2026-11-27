/**
 * Publish source-controlled standalone blog HTML, without passing it through
 * React, Vite's SPA entry point, or the SEO prerender placeholder.
 * Each blog/<arabic-slug>/index.html is the authoritative editorial source.
 */
import fs from 'node:fs/promises'
import path from 'node:path'

const root=path.resolve('.')
const source=path.join(root,'blog')
const destination=path.join(root,'dist','blog')
const articles=JSON.parse(await fs.readFile(path.join(source,'manifest.json'),'utf8')).articles
const SITE='https://ugcarabie.com'
await fs.cp(source,destination,{recursive:true,force:true})
await fs.copyFile(path.join(root,'src','styles.css'),path.join(destination,'site.css'))

// Images uploaded to /images/blog at the repository root are not copied by Vite.
// Support that location as well as Vite's /public/images/blog, without overwriting
// an image supplied in /public/images/blog when both paths exist.
for(const article of articles){
 const filename=path.basename(article.image)
 if(!/^[-a-z0-9]+\.webp$/.test(filename) || article.image!=='/images/blog/'+filename) {
  throw new Error('Invalid blog image path: '+article.image)
 }
 const target=path.join(root,'dist','images','blog',filename)
 const uploaded=path.join(root,'images','blog',filename)
 const published=await fs.access(target).then(()=>true,()=>false)
 if(published)continue
 const exists=await fs.access(uploaded).then(()=>true,()=>false)
 if(exists){
  await fs.mkdir(path.dirname(target),{recursive:true})
  await fs.copyFile(uploaded,target)
  console.log('Copied repository blog image:',filename)
 }
}

for(const article of articles){
 const file=path.join(destination,article.slug,'index.html')
 let html=await fs.readFile(file,'utf8')
 const imageFile=path.join(root,'dist',article.image.replace(/^\//,''))
 const ready=await fs.access(imageFile).then(()=>true,()=>false)
 const imageUrl=SITE+article.image
 const marker='<!-- BLOG_IMAGE_META -->'
 if(!html.includes(marker))throw new Error('Missing image placeholder: '+article.slug)
 let extra=''
 if(ready){
  extra='<meta property="og:image" content="'+imageUrl+'">\n'+
   '<meta property="og:image:alt" content="'+article.imageAlt.replaceAll('&','&amp;').replaceAll('"','&quot;')+'">\n'+
   '<meta name="twitter:image" content="'+imageUrl+'">'
  const open='<script id="blog-schema" type="application/ld+json">'
  const close='</script>'
  const a=html.indexOf(open),b=html.indexOf(close,a)
  if(a<0||b<0)throw new Error('Missing BlogPosting schema: '+article.slug)
  const json=JSON.parse(html.slice(a+open.length,b))
  const post=json['@graph'].find(x=>x['@type']==='BlogPosting')
  const webpage=json['@graph'].find(x=>x['@type']==='WebPage')
  if(!post||!webpage)throw new Error('Invalid article schema: '+article.slug)
  const image={'@type':'ImageObject','@id':SITE+'/blog/'+article.slug+'/#primaryimage',url:imageUrl,contentUrl:imageUrl,caption:article.imageCaption||article.imageAlt,description:article.imageAlt,encodingFormat:'image/webp'}
  json['@graph'].push(image)
  post.image={'@id':image['@id']}
  webpage.primaryImageOfPage={'@id':image['@id']}
  html=html.slice(0,a+open.length)+JSON.stringify(json).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026')+html.slice(b)
 }
 html=html.replace(marker,extra)
 await fs.writeFile(file,html)
 console.log('Static blog:',article.slug,ready?'image indexed':'image placeholder')
}
console.log('Published',articles.length,'standalone HTML blog articles to dist/blog/')

// Register only verified, published article cover images in the existing sitemap.
const sitemapFile=path.join(root,'dist','sitemap.xml')
let sitemap=await fs.readFile(sitemapFile,'utf8')
const xmlEscape=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
if(!sitemap.includes('xmlns:image='))sitemap=sitemap.replace('<urlset ','<urlset xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" ')
let indexedImages=0
for(const article of articles){
 const ready=await fs.access(path.join(root,'dist',article.image.slice(1))).then(()=>true,()=>false)
 if(!ready)continue
 const loc='<loc>'+xmlEscape(SITE+'/blog/'+article.slug+'/')+'</loc>'
 const entry='<image:image><image:loc>'+xmlEscape(SITE+article.image)+'</image:loc></image:image>'
 let found=false
 sitemap=sitemap.replace(/<url>[\s\S]*?<\/url>/g,block=>{
  if(!block.includes(loc))return block
  found=true
  return block.includes(entry)?block:block.replace('</url>',entry+'</url>')
 })
 if(!found)throw new Error('Missing sitemap entry for blog image: '+article.slug)
 indexedImages++
}
await fs.writeFile(sitemapFile,sitemap)
console.log('Blog cover images in sitemap:',indexedImages)
