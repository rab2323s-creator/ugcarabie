import React,{useState} from 'react'
import { Link,NavLink,useNavigate } from 'react-router-dom'
import { ArrowLeft, Menu, X, Instagram, Linkedin, Mail, LogOut, LayoutDashboard, Sparkles, Heart } from 'lucide-react'
import { useAuth } from '../lib/auth'

export function Brand(){return <Link to="/" className="brand" aria-label="UGC Arabie — الرئيسية"><span className="brand-mark">u<span>✦</span></span><span className="brand-word">ugc<span>arabie</span><b>.</b></span></Link>}
const links=[['/creators','اكتشف المبدعين'],['/for-brands','للشركات'],['/for-creators','للمبدعين'],['/campaigns','فرص UGC'],['/what-is-ugc','ما هو UGC؟'],['/tools','الأدوات'],['/blog','المدونة']]
export function Header(){
 const [menu,setMenu]=useState(false),{user,profile,signOut}=useAuth(),navigate=useNavigate()
 const close=()=>setMenu(false)
 const logout=async()=>{await signOut();close();navigate('/')}
 return <header className="site-header"><div className="container nav-inner"><Brand/><nav aria-label="القائمة الرئيسية" className={'nav-links '+(menu?'open':'')}>
 {links.map(([url,label])=>(url==='/blog'||url==='/tools')?<a href={url+'/'} key={url} onClick={close}>{label}</a>:<NavLink onClick={close} key={url} to={url+'/'} className={({isActive})=>isActive?'active':''}>{label}</NavLink>)}
 <div className="mobile-actions">{user?<><Link to="/dashboard" onClick={close}>لوحة التحكم</Link><button onClick={logout}>تسجيل خروج</button></>:<><Link to="/login/" onClick={close}>دخول</Link><Link to="/register/" onClick={close}>حساب جديد</Link></>}</div>
 </nav><div className="nav-actions">{user?<><Link to="/dashboard" className="btn btn-ghost btn-small"><LayoutDashboard size={16}/> لوحة التحكم</Link><button className="icon-button" title="تسجيل خروج" onClick={logout}><LogOut size={18}/></button></>:<><Link to="/login/" className="nav-login">تسجيل الدخول</Link><Link to="/register/" className="btn btn-primary btn-small">انضم الآن <ArrowLeft size={16}/></Link></>}</div><button className="hamburger" onClick={()=>setMenu(v=>!v)} aria-label={menu?'إغلاق القائمة':'فتح القائمة'} aria-expanded={menu}>{menu?<X/>:<Menu/>}</button></div></header>
}
export function Footer(){return <footer className="footer"><div className="container"><div className="footer-grid"><div><Brand/><p>مساحة تجمع الإبداع العربي بفرص حقيقية. اعرض أعمالك أو اكتشف موهبتك القادمة.</p></div><div><strong>استكشف</strong><Link to="/creators/">المبدعون</Link><Link to="/campaigns/">فرص UGC</Link><Link to="/for-brands/">خدمات UGC للشركات</Link><Link to="/for-creators/">فرص عمل UGC</Link><Link to="/what-is-ugc/">ما هو محتوى UGC؟</Link><Link to="/how-it-works/">كيف تعمل المنصة</Link><a href="/tools/">أدوات UGC المجانية</a><a href="/blog/">مدونة UGC</a></div><div><strong>انضم إلينا</strong><Link to="/register/?role=creator">أنا صانع محتوى</Link><Link to="/register/?role=company">أنا شركة</Link><Link to="/login/">تسجيل الدخول</Link></div><div><strong>معلومات</strong><Link to="/terms/">شروط الاستخدام</Link><Link to="/privacy/">سياسة الخصوصية</Link></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} UGC Arabie. جميع الحقوق محفوظة.</span><span>من تطوير <a className="footer-developer-link" href="https://vivamediacreative.com/labs/" target="_blank" rel="noopener noreferrer">Viva Media Creative</a> عبر VMC Labs</span></div></div></footer>}
export function PageLayout({children}){return <><a className="skip-link" href="#main">تخطي إلى المحتوى</a><Header/><main id="main">{children}</main><Footer/></>}
export function SectionHeading({eyebrow,title,description,action}){return <div className="section-heading"><div><div className="eyebrow"><Sparkles size={15}/> {eyebrow}</div><h2>{title}</h2>{description&&<p>{description}</p>}</div>{action&&<div className="section-action">{action}</div>}</div>}
export function EmptyState({title='ما في نتائج حالياً',description='جرّب تغيير البحث أو ارجع لاحقاً.',action}){return <div className="empty-state"><div className="empty-illustration"><Sparkles size={34}/></div><h3>{title}</h3><p>{description}</p>{action}</div>}
export function Loading(){return <div className="loading" aria-label="جاري التحميل"><div className="spinner"/> جاري التحميل...</div>}
export function DemoNotice(){return <div className="demo-notice">هذه أمثلة توضيحية للتصميم وليست حسابات مبدعين أو حملات حقيقية. ستظهر البيانات الفعلية بعد التسجيل واعتماد الحسابات أو نشر الحملات.</div>}
