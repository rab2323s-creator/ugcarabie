/**
 * Generate crawlable HTTP-200 HTML pages, sitemap and robots.txt for GitHub Pages.
 * All public member/campaign content comes from Supabase's RLS-protected anon API:
 * never use a service-role key here or include unapproved/private records.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { seoPages } from '../src/lib/seoContent.js'
import { homepageSeo } from '../src/lib/homeSeo.js'
import { legalDocs, legalInfo } from '../src/lib/legalContent.js'
import { managedCampaigns, campaignInquiryLink } from '../src/lib/managedCampaigns.js'

const SITE = 'https://ugcarabie.com'
const OUT = path.resolve('dist')
const src = await fs.readFile(path.join(OUT,'index.html'),'utf8')
const api = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
const supabase = api && key ? createClient(api,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}) : null

const esc = value => String(value??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const clean = value => String(value??'').replace(/\s+/g,' ').trim()
const short = (value,n=160) => {const s=clean(value);return s.length>n?s.slice(0,n-1).trimEnd()+'…':s}
const safeSlug = s => typeof s==='string' && /^[a-z0-9-]{3,100}$/i.test(s)
const safeUuid = s => typeof s==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
const url = pathname => SITE+(pathname==='/'?'/':pathname.replace(/\/$/,'')+'/')
const json = obj => JSON.stringify(obj).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026')
const list = links => '<ul>'+links.map(x=>'<li><a href="'+esc(x.href)+'">'+esc(x.title)+'</a></li>').join('')+'</ul>'
const org = {'@type':'Organization','@id':SITE+'/#organization',name:'UGC Arabie',url:SITE+'/'}
const website = {'@type':'WebSite','@id':SITE+'/#website',name:'UGC Arabie',url:SITE+'/',inLanguage:'ar'}
const intro = 'UGC Arabie منصة عربية تربط صنّاع محتوى UGC بالعلامات التجارية والشركات لاكتشاف المبدعين ونشر فرص التعاون.'

async function allRows(table,select,filters=[]){
 if(!supabase) return []
 const result=[]
 for(let start=0;start<10000;start+=500){
  let query=supabase.from(table).select(select).order('created_at',{ascending:false}).range(start,start+499)
  for(const [field,value] of filters) query=query.eq(field,value)
  const {data,error}=await query
  if(error) throw new Error('SEO Supabase '+table+': '+error.message)
  result.push(...(data||[]))
  if((data||[]).length<500)break
 }
 if(result.length>=10000) throw new Error('Sitemap pagination limit exceeded')
 return result
}

const creators=(await allRows('creator_profiles',
 'user_id,headline,niches,languages,starting_price,approved,created_at,profile:profiles!creator_profiles_user_id_fkey(display_name,avatar_url,country,city,slug,bio,updated_at,role)',
 [['approved',true]]))
 .filter(c=>c.profile?.role==='creator' && safeSlug(c.profile.slug))
const campaigns=(await allRows('campaigns',
 'id,title,description,category,country,budget_min,budget_max,deliverables,deadline,created_at,updated_at,status',
 [['status','published']]))
 .filter(c=>safeUuid(c.id))

const indexable=[]
function page(pathname, options={}){
 const canonical=url(pathname)
 const {title,description,heading,body='',index=true,structured=null,updatedAt=null,image=null}=options
 const metaTitle=title||'UGC Arabie'
 const metaDescription=short(description||intro)
 const hero='<section class="seo-prerender" lang="ar" dir="rtl"><div class="seo-prerender-inner"><h1>'+esc(heading||metaTitle)+'</h1><p>'+esc(metaDescription)+'</p>'+body+'</div></section>'
 let html=src.replace(/<title>[\s\S]*?<\/title>/i,'<title>'+esc(metaTitle)+'</title>')
 html=html.replace(/<meta\s+name="description"[^>]*>/i,'<meta name="description" content="'+esc(metaDescription)+'" />')
 const extra=[
  '<meta name="robots" content="'+(index?'index,follow,max-image-preview:large':'noindex,follow')+'" />',
  ...(index?['<link rel="canonical" href="'+esc(canonical)+'" />']:[]),
  '<meta property="og:locale" content="ar_AR" />',
  '<meta property="og:type" content="website" />',
  '<meta property="og:site_name" content="UGC Arabie" />',
  '<meta property="og:title" content="'+esc(metaTitle)+'" />',
  '<meta property="og:description" content="'+esc(metaDescription)+'" />',
  '<meta property="og:url" content="'+esc(canonical)+'" />',
  '<meta name="twitter:card" content="summary" />',
  ...(image&&/^https:\/\//.test(image)?['<meta property="og:image" content="'+esc(image)+'" />']:[]),
  ...(structured?['<script id="seo-structured-data" type="application/ld+json">'+json({'@context':'https://schema.org','@graph':[org,structured]})+'</script>']:[]),
  '<style>.seo-prerender{padding:48px 24px;min-height:200px;direction:rtl}.seo-prerender-inner{max-width:960px;margin:auto}.seo-prerender h1{font-size:clamp(24px,3vw,38px)}.seo-prerender p{line-height:1.9}.seo-prerender a{color:inherit}</style>'
 ].join('\n')
 html=html.replace('</head>',extra+'\n</head>')
 html=html.replace('<div id="root"></div>','<div id="root">'+hero+'</div>')
 if(pathname==='/')return fs.writeFile(path.join(OUT,'index.html'),html)
 const dir=path.join(OUT,...pathname.split('/').filter(Boolean))
 if(!index && pathname==='/404') return fs.writeFile(path.join(OUT,'404.html'),html)
 return fs.mkdir(dir,{recursive:true}).then(()=>fs.writeFile(path.join(dir,'index.html'),html))
 .then(()=>{if(index)indexable.push({loc:canonical,lastmod:updatedAt})})
}

await page('/',{
 title:homepageSeo.title,
 description:homepageSeo.description,
 heading:homepageSeo.heading,
 body:'<h2>ابحث عن مبدعين وفرص UGC</h2>'+list([{href:'/creators/',title:'اكتشف صناع محتوى UGC عرب'},{href:'/campaigns/',title:'تصفح حملات وفرص UGC'},{href:'/how-it-works/',title:'كيف تعمل المنصة؟'}]),
 structured:{'@type':'WebPage','@id':SITE+'/#home',name:'UGC Arabie — منصة صناع محتوى UGC العرب',url:SITE+'/',inLanguage:'ar',isPartOf:{'@id':website['@id']},about:org}
})
indexable.push({loc:SITE+'/'})
await page('/creators',{
 title:'صناع محتوى UGC عرب | اكتشف مبدعين لعلامتك التجارية | UGC Arabie',
 description:'ابحث عن صناع محتوى UGC عرب حسب البلد والتخصص، واستعرض ملفاتهم وروابط أعمالهم لاختيار المبدع المناسب لحملتك الإعلانية.',
 heading:'اكتشف صناع محتوى UGC العرب',
 body:'<h2>مبدعون معتمدون</h2>'+(creators.length?list(creators.slice(0,100).map(c=>({href:'/creator/'+c.profile.slug+'/',title:c.profile.display_name+' — '+(c.headline||'صانع محتوى UGC')}))):'<p>ستظهر هنا حسابات صنّاع المحتوى المعتمدين بعد التسجيل والمراجعة.</p>'),
 structured:{'@type':'CollectionPage',name:'دليل صناع محتوى UGC العرب',url:url('/creators'),inLanguage:'ar'}
})
await page('/campaigns',{
 title:'فرص عمل وحملات UGC للمبدعين العرب | UGC Arabie',
 description:'تصفّح فرص وحملات إنشاء محتوى UGC للعلامات التجارية، واعرف التخصصات والميزانيات والمتطلبات، وقدّم على التعاون المناسب لك.',
 heading:'حملات UGC وفرص التعاون للمبدعين',
 body:'<h2>فرص التعاون المتاحة</h2>'+list([...managedCampaigns.map(c=>({href:'/campaigns/'+c.id+'/',title:c.title})),...campaigns.slice(0,100).map(c=>({href:'/campaigns/'+c.id+'/',title:c.title}))]),
 structured:{'@type':'CollectionPage',name:'حملات وفرص UGC',url:url('/campaigns'),inLanguage:'ar'}
})
await page('/how-it-works',{
 title:'كيف تعمل منصة UGC Arabie؟ دليل المبدعين والشركات',
 description:'دليل استخدام منصة UGC Arabie: إنشاء بروفايل صانع محتوى، الموافقة عليه، البحث عن الحملات، نشر حملات الشركات والتواصل بعد قبول الطلب.',
 heading:'كيف تعمل منصة UGC Arabie؟',
 body:'<h2>لصانع المحتوى</h2><p>سجّل، وأضف نبذة وروابط أعمالك، وانتظر اعتماد الملف، ثم تقدّم على الحملات المناسبة.</p><h2>للشركات</h2><p>سجّل شركتك، واكتشف المبدعين حسب تخصصهم وبلدهم، وانشر حملة وراجع طلبات التعاون.</p>',
 structured:{'@type':'AboutPage',name:'كيف تعمل منصة UGC Arabie؟',url:url('/how-it-works'),inLanguage:'ar'}
})

// Intent-led evergreen landing pages are rendered both for users and crawlers.
for(const [pathname,content] of Object.entries(seoPages)){
 const sections=content.sections.map(section=>
  '<section><h2>'+esc(section.title)+'</h2>'+
  (section.paragraphs||[]).map(p=>'<p>'+esc(p)+'</p>').join('')+
  (section.items||[]).map(item=>'<div><h3>'+esc(item.heading)+'</h3><p>'+esc(item.text)+'</p></div>').join('')+
  (section.bullets?.length?'<ul>'+section.bullets.map(p=>'<li>'+esc(p)+'</li>').join('')+'</ul>':'')+
  (section.links?.length?list(section.links.map(x=>({href:x.href,title:x.label}))):'')+'</section>'
 ).join('')
 const questions='<section><h2>أسئلة شائعة</h2>'+content.faq.map(q=>'<div><h3>'+esc(q.question)+'</h3><p>'+esc(q.answer)+'</p></div>').join('')+'</section>'
 const links=list([...content.actions,...content.related].map(x=>({href:x.href,title:x.label})))
 await page(pathname,{
  title:content.title,
  description:content.description,
  heading:content.heading,
  body:'<p>'+esc(content.lead)+'</p>'+links+sections+questions,
  structured:{'@type':'WebPage',url:url(pathname),name:content.title,description:content.description,inLanguage:'ar',
    isPartOf:{'@id':website['@id']},about:org}
 })
}

for(const c of creators){
 const p=c.profile
 const pathname='/creator/'+p.slug
 const location=[p.city,p.country].filter(Boolean).join('، ')
 const niche=(c.niches||[]).filter(Boolean).join('، ')
 const description=short((p.display_name||'صانع محتوى UGC')+' — '+(c.headline||'صانع محتوى UGC عربي')+(location?' في '+location:'')+(niche?'. التخصصات: '+niche:'')+'. '+(p.bio||'اكتشف الملف وأعمال صانع المحتوى على UGC Arabie.'))
 const details='<h2>نبذة عن المبدع</h2><p>'+esc(p.bio||c.headline||'صانع محتوى UGC عربي')+'</p>'+
 (niche?'<h2>التخصصات</h2><p>'+esc(niche)+'</p>':'')+
 (location?'<h2>البلد والمدينة</h2><p>'+esc(location)+'</p>':'')+
 ((c.languages||[]).length?'<h2>اللغات</h2><p>'+esc(c.languages.join('، '))+'</p>':'')
 const person={'@type':'Person',name:p.display_name||'صانع محتوى UGC',url:url(pathname),description:short(p.bio||c.headline||'صانع محتوى UGC'),...(p.country?{homeLocation:{'@type':'Country',name:p.country}}:{}),...(p.avatar_url&&/^https:\/\//.test(p.avatar_url)?{image:p.avatar_url}:{})}
 await page(pathname,{title:short((p.display_name||'صانع محتوى')+' | صانع محتوى UGC'+(p.country?' في '+p.country:'')+' | UGC Arabie',95),
 description,heading:(p.display_name||'صانع محتوى UGC')+' — ملف صانع محتوى UGC',body:details,
 updatedAt:p.updated_at||c.created_at,
 structured:{'@type':'ProfilePage',url:url(pathname),name:p.display_name||'ملف صانع محتوى',inLanguage:'ar',mainEntity:person},
 image:p.avatar_url})
}
// Managed opportunities: dedicated HTTP 200 pages with a real contact pathway.
for(const c of managedCampaigns){
 const pathname='/campaigns/'+c.id
 const body='<h2>تفاصيل فرصة التعاون</h2><p>'+esc(c.description)+'</p>'+
 '<p>المجال: '+esc(c.category)+' — البلد: '+esc(c.country)+'</p>'+
 '<p>الميزانية المعلنة: '+esc(c.budget_min)+'–'+esc(c.budget_max)+' دولار أمريكي</p>'+
 '<p>المطلوب: '+esc(c.deliverables)+'</p>'+
 '<h2>التواصل والتقديم</h2><p>للتقديم أرسل اسمك وبلدك وروابط أعمالك إلى فريق UGC Arabie.</p>'+
 list([{href:campaignInquiryLink(c),title:'تواصل معنا للتقديم: info@ugcarabie.com'}])
 await page(pathname,{
  title:short(c.title+' | فرصة UGC للتقديم | UGC Arabie',95),
  description:short(c.title+' — فرصة UGC في '+c.country+'. '+c.description+' تواصل مع UGC Arabie للتقديم.'),
  heading:c.title,body,
  structured:{'@type':'WebPage',name:c.title,url:url(pathname),inLanguage:'ar',about:{'@type':'CreativeWork',name:c.title}}
 })
}
for(const c of campaigns){
 const pathname='/campaigns/'+c.id
 const description=short(c.title+' — '+(c.description||'حملة UGC للعلامات التجارية')+(c.country?' في '+c.country:'')+(c.category?'. التخصص: '+c.category:''))
 const details='<h2>تفاصيل الحملة</h2><p>'+esc(c.description||'حملة تعاون لإنشاء محتوى UGC')+'</p>'+
 (c.category?'<h2>المجال</h2><p>'+esc(c.category)+'</p>':'')+
 (c.country?'<h2>البلد المستهدف</h2><p>'+esc(c.country)+'</p>':'')+
 (c.deliverables?'<h2>المخرجات المطلوبة</h2><p>'+esc(c.deliverables)+'</p>':'')+
 (c.deadline?'<h2>آخر موعد للتقديم</h2><p>'+esc(c.deadline)+'</p>':'')
 await page(pathname,{title:short(c.title+' | حملة وفرصة تعاون UGC | UGC Arabie',95),description,
 heading:c.title,body:details,updatedAt:c.updated_at||c.created_at,
 structured:{'@type':'WebPage',name:c.title,url:url(pathname),inLanguage:'ar',datePublished:c.created_at,
 about:{'@type':'CreativeWork',name:c.title,description:short(c.description||'',400)}}})
}

// Render the same concise legal copy in direct-request HTML.
for(const [pathname,doc] of [['/terms',legalDocs.terms],['/privacy',legalDocs.privacy]]){
 const body='<p>'+esc(doc.subtitle)+'</p><p>آخر مراجعة: '+esc(legalInfo.updated)+'</p>'+
 '<section><h2>جهة تطوير المنصة</h2><p>تم تطوير منصة UGC Arabie بواسطة Viva Media Creative.</p>'+
 list([{href:legalInfo.developerUrl,title:'Viva Media Creative'}])+'</section>'+
 doc.sections.map(section=>'<section><h2>'+esc(section.heading)+'</h2>'+
 section.paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')+
 (section.links?.length?list(section.links.map(l=>({href:l.href,title:l.label}))):'')+'</section>').join('')
 await page(pathname,{title:doc.title+' | UGC Arabie',description:doc.summary,heading:doc.title,body,index:false})
}

// These routes are usable and return HTTP 200, but should never be indexed.
for(const [pathname,heading] of [
 ['/register','إنشاء حساب'],['/login','تسجيل الدخول'],['/dashboard','لوحة التحكم'],
 ['/dashboard/profile','الملف الشخصي'],['/dashboard/campaigns/new','حملة جديدة'],
 ['/messages','الرسائل الخاصة'],['/support','مراسلات الإدارة'],
 ['/admin','إدارة المنصة']
]){
 await page(pathname,{title:heading+' | UGC Arabie',description:heading+' على منصة UGC Arabie',heading,index:false})
}
await page('/404',{title:'الصفحة غير موجودة | UGC Arabie',description:'الرابط المطلوب غير موجود.',heading:'الصفحة غير موجودة',index:false})

const formatDate=v=>{if(!v)return null;const date=new Date(v);return Number.isNaN(date.valueOf())?null:date.toISOString().slice(0,10)}
const unique=[...new Map(indexable.map(e=>[e.loc,e])).values()]
const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+unique.map(e=>'  <url><loc>'+esc(e.loc)+'</loc>'+(formatDate(e.lastmod)?'<lastmod>'+formatDate(e.lastmod)+'</lastmod>':'')+'</url>').join('\n')+'\n</urlset>\n'
await fs.writeFile(path.join(OUT,'sitemap.xml'),xml)
await fs.writeFile(path.join(OUT,'robots.txt'),'User-agent: *\nAllow: /\n\nSitemap: '+SITE+'/sitemap.xml\n')
console.log('SEO generated:',unique.length,'indexable URLs,',creators.length,'approved creator profiles,',campaigns.length,'published campaigns; Supabase:',Boolean(supabase))
