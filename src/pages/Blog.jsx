import React,{useMemo,useState} from 'react'
import {Link,useParams} from 'react-router-dom'
import {ArrowLeft,ArrowUpLeft,BookOpen,CalendarDays,Clock3,Search,CheckCircle2,ChevronLeft,Image as ImageIcon} from 'lucide-react'
import {blogArticles,blogCategories,blogCategory,blogInfo,blogPath,findBlogArticle} from '../lib/blogContent'

const dateLabel=date=>new Intl.DateTimeFormat('ar',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'))
const readingTime=article=>{
 const text=[article.lead,...article.sections.flatMap(s=>[s.answer,...(s.paragraphs||[]),...(s.bullets||[])])].join(' ')
 return Math.max(4,Math.ceil(text.trim().split(/\s+/u).length/190))
}
function BlogImage({article,large=false}){
 const [broken,setBroken]=useState(false)
 return <div className={'blog-image '+(large?'blog-image-large ':'')+'blog-image-'+article.category}>
  {!broken&&<img src={article.image} alt={article.imageAlt} loading={large?'eager':'lazy'} decoding="async" onError={()=>setBroken(true)}/>}
  {broken&&<div className="blog-image-placeholder" aria-label="مساحة صورة المقال — تُضاف الصورة الأصلية قريباً"><span className="blog-image-symbol"><ImageIcon size={26}/></span><span>UGC Arabie <small>مجلة الإبداع</small></span></div>}
 </div>
}
export function BlogCard({article,featured=false}){
 const category=blogCategory(article.category)
 return <article className={'blog-post-card '+(featured?'blog-post-featured':'')}>
  <Link to={blogPath(article)} className="blog-post-image-link" aria-label={'اقرأ '+article.title}><BlogImage article={article}/></Link>
  <div className="blog-post-card-content">
   <div className="blog-card-top"><span className={'blog-category-label category-'+article.category}>{category?.title}</span><span><Clock3 size={13}/> {readingTime(article)} دقائق قراءة</span></div>
   <h2><Link to={blogPath(article)}>{article.title}</Link></h2>
   <p>{article.excerpt}</p>
   <div className="blog-card-bottom"><time dateTime={article.published}>{dateLabel(article.published)}</time><Link to={blogPath(article)} aria-label={'اقرأ '+article.title}>اقرأ المقال <ArrowLeft size={16}/></Link></div>
  </div>
 </article>
}
export function BlogIndex(){
 const [filter,setFilter]=useState('all'),[query,setQuery]=useState('')
 const visible=useMemo(()=>blogArticles.filter(a=>(filter==='all'||a.category===filter)&&[a.title,a.excerpt,a.focusKeyword,...a.sections.map(s=>s.heading)].join(' ').toLowerCase().includes(query.trim().toLowerCase())),[filter,query])
 return <div className="blog-index-page" dir="rtl" lang="ar">
  <section className="blog-hero"><div className="container">
   <div className="blog-hero-brow"><BookOpen size={17}/> المعرفة اللي تتحول لفرص</div>
   <h1>دليل الإبداع <span>في عالم UGC</span></h1>
   <p>{blogInfo.lead}</p>
   <div className="blog-hero-stats"><span><strong>06</strong> أدلة أصلية</span><span><strong>03</strong> مسارات للتعلّم</span><span>من UGC Arabie إلى المبدعين والشركات</span></div>
  </div></section>
  <div className="container blog-index-content">
   <div className="blog-controls"><div className="blog-tabs" aria-label="تصنيف المقالات">
    <button type="button" className={filter==='all'?'active':''} aria-pressed={filter==='all'} onClick={()=>setFilter('all')}>جميع المقالات <span>{blogArticles.length}</span></button>
    {blogCategories.map(cat=><button type="button" key={cat.id} className={filter===cat.id?'active':''} aria-pressed={filter===cat.id} onClick={()=>setFilter(cat.id)}>{cat.title} <span>{blogArticles.filter(a=>a.category===cat.id).length}</span></button>)}
   </div><label className="blog-search"><Search size={17}/><input type="search" placeholder="ابحث عن موضوع UGC..." value={query} onChange={e=>setQuery(e.target.value)} aria-label="ابحث في المقالات"/></label></div>
   {filter==='all'&&!query&&<div className="blog-category-overview">{blogCategories.map(cat=><button type="button" className={'blog-category-overview-card category-'+cat.id} key={cat.id} onClick={()=>setFilter(cat.id)}><strong>{cat.title}</strong><span>{cat.description}</span><span className="blog-category-arrow">تصفّح مقالات القسم <ArrowLeft size={16}/></span></button>)}</div>}
   <div className="blog-list-heading"><div><span>مكتبة المعرفة</span><h2>{filter==='all'?'أحدث الأدلة والمقالات':blogCategory(filter)?.title}</h2></div><span>{visible.length} مقالات</span></div>
   {visible.length?<div className="blog-post-grid">{visible.map((article,i)=><BlogCard key={article.slug} article={article} featured={filter==='all'&&!query&&i===0}/>)}</div>:<div className="blog-no-results"><Search size={30}/><h2>ما في مقالات مطابقة</h2><p>جرّب كلمة أقصر أو تصنيف ثاني.</p><button type="button" onClick={()=>{setFilter('all');setQuery('')}}>اعرض جميع المقالات</button></div>}
   <div className="blog-index-bottom"><div><span>جاهز تتحوّل من القراءة للتطبيق؟</span><h2>مهمتنا نقرّب المبدع من الفرصة.</h2><p>استكشف فرص UGC الحقيقية أو ابحث عن المبدع المناسب لعلامتك.</p></div><div><Link className="btn btn-primary" to="/campaigns">فرص UGC <ArrowLeft size={17}/></Link><Link className="btn btn-outline" to="/creators">تصفّح المبدعين <ArrowLeft size={17}/></Link></div></div>
  </div>
 </div>
}
export function BlogArticle(){
 const {slug}=useParams()
 const article=findBlogArticle(slug)
 if(!article)return <div className="container blog-404"><h1>المقال غير موجود</h1><p>قد يكون رابط المقال غير صحيح.</p><Link to="/blog" className="btn btn-primary">العودة إلى المدونة <ArrowLeft size={16}/></Link></div>
 const category=blogCategory(article.category)
 const related=article.relatedSlugs.map(findBlogArticle).filter(Boolean).filter(a=>a.slug!==article.slug)
 return <article className="blog-article-page" dir="rtl" lang="ar">
  <header className="blog-article-header"><div className="container">
   <nav className="blog-crumbs" aria-label="مسار الصفحة"><Link to="/">الرئيسية</Link><ChevronLeft size={14}/><Link to="/blog">المدونة</Link><ChevronLeft size={14}/><span>{category?.title}</span></nav>
   <div className={'blog-category-label category-'+article.category}>{category?.title}</div>
   <h1>{article.title}</h1>
   <p className="blog-article-deck">{article.lead}</p>
   <div className="blog-article-byline"><span className="blog-byline-logo">u✦</span><div><strong>هيئة تحرير UGC Arabie</strong><span><CalendarDays size={14}/> <time dateTime={article.published}>{dateLabel(article.published)}</time> <span aria-hidden="true">•</span> <Clock3 size={14}/> {readingTime(article)} دقائق قراءة</span></div></div>
  </div></header>
  <div className="container blog-article-layout"><div className="blog-article-main">
   <BlogImage key={article.slug} article={article} large/>
   <div className="blog-article-body">
    <section className="blog-key-takeaways"><h2>ملخص سريع</h2><ul>{article.takeaways.map(item=><li key={item}><CheckCircle2 size={18}/><span>{item}</span></li>)}</ul></section>
    {article.sections.map(s=><section className="blog-article-section" id={s.id} key={s.id}><h2>{s.heading}</h2><p className="blog-direct-answer">{s.answer}</p>{s.paragraphs?.map((p,i)=><p key={i}>{p}</p>)}{s.bullets?.length>0&&<ul>{s.bullets.map((b,i)=><li key={i}>{b}</li>)}</ul>}{s.example&&<div className="blog-editorial-example"><span>مثال تطبيقي</span><p>{s.example}</p></div>}</section>)}
    {article.faqs?.length>0&&<section className="blog-article-section blog-faq"><h2>أسئلة شائعة</h2>{article.faqs.map(f=><div className="blog-faq-item" key={f.question}><h3>{f.question}</h3><p>{f.answer}</p></div>)}</section>}
    <div className="blog-article-cta"><span>الخطوة التالية</span><h2>{article.cta.text}</h2><Link className="btn btn-primary" to={article.cta.href}>{article.cta.label} <ArrowLeft size={17}/></Link></div>
   </div>
  </div>
  <aside className="blog-article-aside"><div className="blog-toc"><span>في هذا المقال</span>{article.sections.map(s=><a href={'#'+s.id} key={s.id}>{s.heading}</a>)}{article.faqs?.length>0&&<a href="#article-related">مقالات ذات صلة</a>}</div><div className="blog-side-cta"><BookOpen size={21}/><strong>أدلة أكثر، قرارات أوضح</strong><p>اقرأ المقالات حسب هدفك: تطوير مهارتك أو إطلاق حملة.</p><Link to="/blog">استكشف المدونة <ArrowLeft size={15}/></Link></div></aside></div>
  <section className="container blog-related" id="article-related"><div className="blog-list-heading"><div><span>أكمل رحلتك</span><h2>مقالات ننصحك فيها</h2></div><Link to="/blog">كل المقالات <ArrowLeft size={16}/></Link></div><div className="blog-post-grid">{related.map(a=><BlogCard key={a.slug} article={a}/>)}</div></section>
 </article>
}
