import {useEffect} from 'react'
import {useLocation} from 'react-router-dom'
import {supabase} from '../lib/supabase'
import {seoPages} from '../lib/seoContent'

const SITE='https://ugcarabie.com'
const org={'@type':'Organization',name:'UGC Arabie',url:SITE+'/'}
const defaults={
 '/': ['صناع محتوى UGC عرب للشركات والعلامات التجارية | UGC Arabie','اكتشف صناع محتوى UGC عرب، تصفّح أعمالهم وتخصصاتهم، وانشر حملات تعاون لعلامتك التجارية. منصة UGC Arabie تجمع المبدعين بالشركات.','WebPage'],
 '/creators': ['صناع محتوى UGC عرب | اكتشف مبدعين لعلامتك التجارية | UGC Arabie','ابحث عن صناع محتوى UGC عرب حسب البلد والتخصص، واستعرض ملفاتهم وروابط أعمالهم لاختيار المبدع المناسب لحملتك الإعلانية.','CollectionPage'],
 '/campaigns': ['فرص عمل وحملات UGC للمبدعين العرب | UGC Arabie','تصفّح فرص وحملات إنشاء محتوى UGC للعلامات التجارية، واعرف التخصصات والميزانيات والمتطلبات، وقدّم على التعاون المناسب لك.','CollectionPage'],
 '/how-it-works': ['كيف تعمل منصة UGC Arabie؟ دليل المبدعين والشركات','دليل استخدام منصة UGC Arabie: إنشاء بروفايل صانع محتوى، الموافقة عليه، البحث عن الحملات، نشر حملات الشركات والتواصل بعد قبول الطلب.','AboutPage']
}
const privateTitles={
 '/register':'إنشاء حساب', '/login':'تسجيل الدخول', '/dashboard':'لوحة التحكم',
 '/dashboard/profile':'الملف الشخصي', '/dashboard/campaigns/new':'حملة جديدة',
 '/messages':'الرسائل الخاصة','/support':'مراسلات الإدارة','/admin':'إدارة المنصة',
 '/terms':'شروط الاستخدام — مسودة','/privacy':'سياسة الخصوصية — مسودة'
}
const short=(text,n=160)=>{const s=String(text||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1).trimEnd()+'…':s}
const canonical=path=>SITE+(path==='/'?'/':path.replace(/\/$/,'')+'/')
const setMeta=(key,value,attr='name')=>{
 let el=document.head.querySelector('meta['+attr+'="'+key+'"]')
 if(!value){el?.remove();return}
 if(!el){el=document.createElement('meta');el.setAttribute(attr,key);document.head.appendChild(el)}
 el.content=value
}
const apply=(pathname,options)=>{
 const {title,description,structured,index=true,image}=options
 document.title=title
 setMeta('description',description)
 setMeta('robots',index?'index,follow,max-image-preview:large':'noindex,follow')
 setMeta('og:title',title,'property')
 setMeta('og:description',description,'property')
 setMeta('og:type','website','property')
 setMeta('og:site_name','UGC Arabie','property')
 setMeta('og:locale','ar_AR','property')
 setMeta('og:url',canonical(pathname),'property')
 setMeta('twitter:card','summary')
 setMeta('og:image',image&&/^https:\/\//.test(image)?image:null,'property')
 let link=document.head.querySelector('link[rel="canonical"]')
 if(index){
  if(!link){link=document.createElement('link');link.rel='canonical';document.head.appendChild(link)}
  link.href=canonical(pathname)
 }else link?.remove()
 document.getElementById('seo-structured-data')?.remove()
 if(index&&structured){
  const script=document.createElement('script')
  script.id='seo-structured-data';script.type='application/ld+json'
  script.textContent=JSON.stringify({'@context':'https://schema.org','@graph':[org,structured]}).replace(/</g,'\\u003c')
  document.head.appendChild(script)
 }
}
export default function SeoHead(){
 const {pathname}=useLocation()
 useEffect(()=>{
  let active=true
  const path=pathname==='/'?'/':pathname.replace(/\/$/,'')
  const common=defaults[path]
  if(common){
   apply(path,{title:common[0],description:common[1],structured:{'@type':common[2],name:common[0],url:canonical(path),inLanguage:'ar'}})
   return()=>{active=false}
  }
  if(seoPages[path]){
   const entry=seoPages[path]
   apply(path,{title:entry.title,description:entry.description,structured:{'@type':'WebPage',name:entry.title,url:canonical(path),description:entry.description,inLanguage:'ar'}})
   return()=>{active=false}
  }
  if(privateTitles[path]){
   apply(path,{title:privateTitles[path]+' | UGC Arabie',description:privateTitles[path]+' على منصة UGC Arabie',index:false})
   return()=>{active=false}
  }
  // Avoid indexing unverified/unapproved users and unpublished campaigns.
  apply(path,{title:'UGC Arabie',description:'محتوى UGC عربي',index:false})
  async function detail(){
   const creatorMatch=path.match(/^\/creator\/([a-z0-9-]{3,100})$/i)
   if(creatorMatch&&supabase){
    const {data:p}=await supabase.from('profiles').select('id,role,display_name,slug,country,city,bio,avatar_url').eq('slug',creatorMatch[1]).maybeSingle()
    if(!active||p?.role!=='creator')return
    const {data:c}=await supabase.from('creator_profiles').select('headline,niches,approved').eq('user_id',p.id).maybeSingle()
    if(!active||!c?.approved)return
    const title=short((p.display_name||'صانع محتوى')+' | صانع محتوى UGC'+(p.country?' في '+p.country:'')+' | UGC Arabie',95)
    const description=short((p.display_name||'صانع محتوى UGC')+' — '+(c.headline||'صانع محتوى UGC عربي')+(p.country?' في '+p.country:'')+((c.niches||[]).length?'. التخصصات: '+c.niches.join('، '):'')+'. '+(p.bio||'اكتشف الملف وأعمال صانع المحتوى على UGC Arabie.'))
    const person={'@type':'Person',name:p.display_name,url:canonical(path),description:short(p.bio||c.headline),...(p.avatar_url?{image:p.avatar_url}:{})}
    apply(path,{title,description,structured:{'@type':'ProfilePage',url:canonical(path),name:p.display_name,inLanguage:'ar',mainEntity:person},image:p.avatar_url})
   }else if(/^\/campaigns\/[0-9a-f-]{36}$/i.test(path)&&supabase){
    const id=path.split('/')[2]
    const {data:c}=await supabase.from('campaigns').select('title,description,category,country,created_at,status').eq('id',id).maybeSingle()
    if(!active||c?.status!=='published')return
    const title=short(c.title+' | حملة وفرصة تعاون UGC | UGC Arabie',95)
    const description=short(c.title+' — '+(c.description||'حملة UGC للعلامات التجارية')+(c.country?' في '+c.country:'')+(c.category?'. التخصص: '+c.category:''))
    apply(path,{title,description,structured:{'@type':'WebPage',name:c.title,url:canonical(path),inLanguage:'ar',datePublished:c.created_at}})
   }
  }
  detail().catch(()=>{})
  return()=>{active=false}
 },[pathname])
 return null
}
