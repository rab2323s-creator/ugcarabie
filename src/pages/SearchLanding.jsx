import React from 'react'
import {Link,useLocation} from 'react-router-dom'
import {ArrowLeft,ArrowUpLeft,CheckCircle2,Lightbulb,Search,BriefcaseBusiness,BookOpen} from 'lucide-react'
import {seoPages} from '../lib/seoContent'

export default function SearchLanding(){
 const {pathname}=useLocation()
 const page=seoPages[pathname.replace(/\/$/,'')]
 if(!page)return null
 return <article className="container search-landing" lang="ar" dir="rtl">
  <nav className="seo-breadcrumb" aria-label="مسار التصفح">
   <Link to="/">الرئيسية</Link><span aria-hidden="true"> / </span><span aria-current="page">{page.eyebrow}</span>
  </nav>
  <header className="seo-hero">
   <div className="eyebrow"><Search size={16}/>{page.eyebrow}</div>
   <h1>{page.heading}</h1>
   <p className="seo-lead">{page.lead}</p>
   <div className="seo-actions">{page.actions.map((a,i)=><Link key={a.href} to={a.href} className={i===0?'btn btn-primary':'btn btn-outline'}>{a.label}<ArrowLeft size={17}/></Link>)}</div>
  </header>
  <div className="seo-page-grid">
   <div className="seo-article">
    {page.sections.map((section,i)=><section className="seo-content-section" key={i}>
     <h2>{section.title}</h2>
     {section.paragraphs?.map((p,j)=><p key={j}>{p}</p>)}
     {section.items?.length>0&&<div className="seo-item-grid">{section.items.map((item,j)=><div className="seo-info-item" key={j}><h3><CheckCircle2 size={18}/>{item.heading}</h3><p>{item.text}</p></div>)}</div>}
     {section.bullets?.length>0&&<ul className="seo-checklist">{section.bullets.map((point,j)=><li key={j}>{point}</li>)}</ul>}
     {section.links?.length>0&&<div className="seo-context-links">{section.links.map(a=><Link to={a.href} key={a.href}>{a.label}<ArrowUpLeft size={15}/></Link>)}</div>}
    </section>)}
    <section className="seo-content-section seo-faq" aria-labelledby="seo-faq-title">
     <h2 id="seo-faq-title">أسئلة شائعة</h2>
     {page.faq.map((item,i)=><div className="seo-faq-item" key={i}><h3>{item.question}</h3><p>{item.answer}</p></div>)}
    </section>
   </div>
   <aside className="seo-aside" aria-label="روابط مفيدة">
    <div className="seo-aside-card">
     <Lightbulb size={23}/>
     <h2>الخطوة التالية</h2>
     <p>اختَر المسار الأقرب لاحتياجك واطّلع على الملفات أو الحملات المتاحة.</p>
     {page.actions.map(a=><Link key={a.href} to={a.href}>{a.label}<ArrowUpLeft size={16}/></Link>)}
    </div>
    <div className="seo-aside-card">
     <BookOpen size={23}/>
     <h2>اقرأ أيضاً</h2>
     {page.related.map(a=><Link key={a.href} to={a.href}>{a.label}<ArrowUpLeft size={16}/></Link>)}
    </div>
   </aside>
  </div>
  <section className="seo-bottom-cta">
   <div><h2>ابدأ خطوتك مع UGC Arabie</h2><p>تعرّف على المبدعين والحملات الحقيقية المتاحة في المنصة.</p></div>
   <div className="seo-actions">{page.actions.map((a,i)=><Link key={a.href} to={a.href} className={i===0?'btn btn-white':'btn btn-outline-white'}>{a.label}<ArrowLeft size={17}/></Link>)}</div>
  </section>
 </article>
}
