import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpLeft, ArrowLeft, MapPin, Wallet, Sparkles, BriefcaseBusiness, CheckCircle2, ExternalLink } from 'lucide-react'
import { formatMoney } from '../lib/supabase'
import {campaignInquiryLink} from '../lib/managedCampaigns'
export function CreatorCard({creator, demo=false}){
 const {profile:p={},headline,niches=[],starting_price}=creator
 const Wrapper=demo?'div':Link
 return <Wrapper {...(demo?{}:{to:`/creator/${encodeURIComponent(p.slug||creator.user_id)}/`})} className="creator-card" aria-label={`ملف المبدع ${p.display_name}`}>
  <div className="creator-photo">{p.avatar_url?<img src={p.avatar_url} alt={`صورة ${p.display_name}`} loading="lazy"/>:<div className="avatar-fallback">{p.display_name?.slice(0,1)||'U'}</div>}
   <span className="creator-hover"><ArrowUpLeft size={18}/></span>{demo&&<span className="photo-demo">نموذج</span>}
  </div><div className="creator-card-body"><div className="creator-title-row"><h3>{p.display_name}</h3><span className="country"><MapPin size={13}/>{p.country||'عربي'}</span></div><p className="creator-subtitle">{headline||'صانع محتوى UGC'}</p><div className="creator-tags">{niches.slice(0,2).map(n=><span key={n}>{n}</span>)}</div><div className="creator-price"><span>تبدأ من <b>{formatMoney(starting_price)}</b></span><span className="text-link">عرض الملف <ArrowLeft size={14}/></span></div></div>
 </Wrapper>
}
export function CampaignCard({campaign:c,demo=false}){
 const managed=Boolean(c.managed)
 const details='/campaigns/'+encodeURIComponent(c.id)+'/'
 return <article className="campaign-card">
  <div className="campaign-card-top"><span className="pill pale"><BriefcaseBusiness size={14}/> {c.category}</span><span className="country"><MapPin size={14}/> {c.country}</span></div>
  <div className="campaign-company"><span className="company-monogram">{(c.company?.display_name||'ع').slice(0,1)}</span><span>{c.company?.display_name||'شركة'}</span></div>
  <h3><Link className="campaign-title-link" to={details}>{c.title}</Link></h3><p className="clamp2">{c.description}</p>
  <div className="campaign-meta"><span><Wallet size={15}/> {formatMoney(c.budget_min)} – {formatMoney(c.budget_max)}</span><span>{c.deliverables||'فيديو UGC'}</span></div>
  <div className="campaign-bottom"><Link to={details}>تفاصيل الفرصة <ArrowLeft size={16}/></Link><Link to={details} className="circle-arrow" aria-label={'تفاصيل '+c.title}><ArrowUpLeft size={19}/></Link></div>
  {managed&&<a className="campaign-apply-link" href={campaignInquiryLink(c)}>تواصل معنا للتقديم <ArrowLeft size={16}/></a>}
 </article>
}
