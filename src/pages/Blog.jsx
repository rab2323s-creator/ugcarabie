import React,{useState} from 'react'
import {Clock3,Image as ImageIcon} from 'lucide-react'
import {blogCategory,blogPath} from '../lib/blogContent'

// Lightweight cards within React pages. Full articles are standalone HTML.
function BlogImage({article}){
 const [broken,setBroken]=useState(false)
 return <div className={'blog-image blog-image-'+article.category}>
  {!broken&&<img src={article.image} alt={article.imageAlt} loading="lazy" decoding="async" onError={()=>setBroken(true)}/>}
  {broken&&<div className="blog-image-placeholder" aria-label="صورة المقال غير مرفوعة بعد"><span className="blog-image-symbol"><ImageIcon size={26}/></span><span>UGC Arabie <small>مجلة الإبداع</small></span></div>}
 </div>
}
export function BlogCard({article}){
 const category=blogCategory(article.category)
 const url=blogPath(article)+'/'
 const date=new Intl.DateTimeFormat('ar',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(article.published+'T12:00:00Z'))
 return <article className="blog-post-card">
  <a href={url} className="blog-post-image-link" aria-label={'اقرأ '+article.title}><BlogImage article={article}/></a>
  <div className="blog-post-card-content">
   <div className="blog-card-top"><span className={'blog-category-label category-'+article.category}>{category?.title}</span><span><Clock3 size={13}/> {article.readMinutes} دقائق قراءة</span></div>
   <h2><a href={url}>{article.title}</a></h2>
   <p>{article.excerpt}</p>
   <div className="blog-card-bottom"><time dateTime={article.published}>{date}</time><a href={url}>اقرأ المقال ←</a></div>
  </div>
 </article>
}
