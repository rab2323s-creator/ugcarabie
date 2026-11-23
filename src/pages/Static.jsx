import React from 'react'
import {Link} from 'react-router-dom'
import {ArrowLeft,UserRound,Building2,CheckCircle2,Sparkles} from 'lucide-react'
import {legalInfo,legalDocs} from '../lib/legalContent'
export function HowItWorks(){return <div className="container static-page"><div className="page-heading centered"><div className="eyebrow">✦ كيف نشتغل؟</div><h1>طريقك للتعاون <span className="accent">أسهل</span></h1><p>إلك مسار واضح، سواء بدك تنتج محتوى أو تدور على صانع محتوى.</p></div><div className="two-journeys"><div className="journey"><div className="journey-icon"><UserRound/></div><h2>أنا صانع محتوى</h2><ol><li>أنشئ حسابك وأضف صورة ونبذة وتعريفاً بأعمالك.</li><li>ارفع روابط أفضل فيديوهاتك وانتظر مراجعة البروفايل.</li><li>تصفح الحملات وتقدم للفرص المناسبة.</li><li>بعد قبولك، تواصل مع الشركة واتفقوا على التفاصيل.</li></ol><Link className="btn btn-primary" to="/register?role=creator">سجّل كمبدع <ArrowLeft size={17}/></Link></div><div className="journey"><div className="journey-icon lavender"><Building2/></div><h2>أنا شركة</h2><ol><li>افتح حساب لشركتك وأكمل بياناتها.</li><li>تصفح المبدعين حسب البلد والتخصص والميزانية.</li><li>انشر حملة مع وصف واضح ومتطلبات وميزانية.</li><li>راجع الطلبات، اختر المبدع، وتواصلوا داخل المنصة.</li></ol><Link className="btn btn-dark" to="/register?role=company">سجّل كشركة <ArrowLeft size={17}/></Link></div></div></div>}
export function Legal({type}){
 const privacy=type==='privacy'
 const doc=legalDocs[privacy?'privacy':'terms']
 return <article className="container static-page legal legal-document" lang="ar" dir="rtl">
  <nav className="legal-breadcrumb" aria-label="مسار التصفح"><Link to="/">الرئيسية</Link><span>/</span><span aria-current="page">{doc.title}</span></nav>
  <header className="page-heading legal-heading">
   <div className="eyebrow">{privacy?'حماية البيانات والخصوصية':'حقوق ومسؤوليات المستخدمين'}</div>
   <h1>{doc.title}</h1>
   <p>{doc.subtitle}</p>
   <div className="legal-meta"><span>UGC Arabie</span><span>آخر مراجعة: {legalInfo.updated}</span></div>
  </header>
  <p className="legal-intro">{doc.summary}</p>
  <div className="legal-content-grid">
   <nav className="legal-toc" aria-label="محتويات الوثيقة">
    <strong>في هذه الصفحة</strong>
    {doc.sections.map(item=><a key={item.id} href={'#'+item.id}>{item.heading}</a>)}
   </nav>
   <div className="legal-article">
    <section className="legal-developer" aria-label="جهة تطوير UGC Arabie">
     <div className="legal-developer-label">جهة تطوير المنصة</div>
     <h2>Viva Media Creative <span>— VMC Labs</span></h2>
     <p>منصة UGC Arabie مشروع مستقل من تطوير <a href={legalInfo.developerUrl} target="_blank" rel="noopener noreferrer">Viva Media Creative</a> ضمن مشاريع VMC Labs. هذا توثيق لجهة التطوير، وليس إقراراً بصفة المشغّل القانوني أو المسؤول عن البيانات.</p>
     <a className="legal-dev-link" href={legalInfo.developerUrl} target="_blank" rel="noopener noreferrer">التعرّف على مشاريع VMC Labs <ArrowLeft size={16}/></a>
    </section>
    <div className="legal-notice" role="note"><strong>معلومات قانونية تحتاج استكمالاً</strong><p>{doc.alert}</p></div>
    {doc.sections.map(item=><section className="legal-section" key={item.id} id={item.id}>
     <h2>{item.heading}</h2>
     {item.paragraphs.map((text,i)=><p key={i}>{text}</p>)}
     {item.links?.length>0&&<div className="legal-reference-links">{item.links.map(link=>link.href.startsWith('/')?<Link to={link.href} key={link.href}>{link.label}<ArrowLeft size={15}/></Link>:<a key={link.href} href={link.href} target={link.href.startsWith('http')?'_blank':undefined} rel={link.href.startsWith('http')?'noopener noreferrer':undefined}>{link.label}<ArrowLeft size={15}/></a>)}</div>}
    </section>)}
    <div className="legal-end-links"><Link to={privacy?'/terms':'/privacy'}>{privacy?'اقرأ شروط الاستخدام':'اقرأ سياسة الخصوصية'}<ArrowLeft size={16}/></Link><Link to="/">العودة للرئيسية<ArrowLeft size={16}/></Link></div>
   </div>
  </div>
 </article>
}
export function NotFound(){return <div className="container page-padded"><div className="empty-state"><h1>404</h1><h2>الصفحة مش موجودة</h2><p>يمكن تغيّر الرابط أو تم حذف الصفحة.</p><Link to="/" className="btn btn-primary">العودة للرئيسية <ArrowLeft size={17}/></Link></div></div>}
