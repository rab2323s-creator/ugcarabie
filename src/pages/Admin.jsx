import React,{useEffect,useState} from 'react'
import {Link} from 'react-router-dom'
import {Check,RefreshCw,MessageCircle} from 'lucide-react'
import {DashShell} from './Dashboard'
import {supabase} from '../lib/supabase'
import {useToast} from '../lib/auth'
import {EmptyState,Loading} from '../components/Layout'

export default function Admin(){
 const [pending,setPending]=useState([])
 const [companies,setCompanies]=useState([])
 const [busy,setBusy]=useState('')
 const [loading,setLoading]=useState(true)
 const toast=useToast()
 async function load(){
  setLoading(true)
  const [creatorsResult,companiesResult]=await Promise.all([
   supabase.from('creator_profiles')
    .select('user_id,headline,created_at,approved,profile:profiles!creator_profiles_user_id_fkey!inner(display_name,country,slug,role)')
    .eq('approved',false).eq('profile.role','creator').order('created_at',{ascending:true}),
   supabase.from('profiles')
    .select('id,display_name,country,created_at')
    .eq('role','company').order('created_at',{ascending:false})
  ])
  if(creatorsResult.error)toast(creatorsResult.error.message)
  if(companiesResult.error)toast(companiesResult.error.message)
  setPending(creatorsResult.data||[])
  setCompanies(companiesResult.data||[])
  setLoading(false)
 }
 useEffect(()=>{load()},[])
 async function approve(id){
  setBusy(id)
  const {error}=await supabase.from('creator_profiles').update({approved:true}).eq('user_id',id)
  setBusy('')
  if(error)toast(error.message)
  else {toast('تمت الموافقة على المبدع');load()}
 }
 return <DashShell title="إدارة المنصة" description="راجع المبدعين وتواصل بشكل خاص مع حسابات المبدعين والشركات.">
  <div className="dash-section-head">
   <h2>حسابات بانتظار المراجعة ({pending.length})</h2>
   <button className="btn btn-outline btn-small" onClick={load} disabled={loading}><RefreshCw size={16}/> تحديث</button>
  </div>
  {loading?<Loading/>:<>
   <div className="dash-list">
    {pending.length?pending.map(c=><div className="dash-list-item" key={c.user_id}>
     <div><strong>{c.profile?.display_name||'مبدع'}</strong>
      <small>{c.profile?.country||'بدون دولة'} · {c.headline||'بدون تعريف'} · /creator/{c.profile?.slug}</small></div>
     <div className="item-actions">
      <Link className="btn btn-outline btn-small" to={`/support?recipient=${c.user_id}`}><MessageCircle size={16}/> مراسلة</Link>
      <button className="btn btn-primary btn-small" disabled={busy===c.user_id} onClick={()=>approve(c.user_id)}><Check size={16}/> موافقة</button>
     </div>
    </div>):<EmptyState title="ما في حسابات بانتظار المراجعة"/>}
   </div>
   <div className="dash-section-head"><h2>حسابات الشركات ({companies.length})</h2></div>
   <div className="dash-list">
    {companies.length?companies.map(c=><div className="dash-list-item" key={c.id}>
     <div><strong>{c.display_name||'شركة'}</strong><small>{c.country||'بدون دولة'}</small></div>
     <Link className="btn btn-outline btn-small" to={`/support?recipient=${c.id}`}><MessageCircle size={16}/> مراسلة الشركة</Link>
    </div>):<EmptyState title="ما في شركات مسجلة بعد"/>}
   </div>
  </>}
  <p className="admin-hint">رسائل الإدارة خاصة بين المدير والحساب المعني؛ ولا تمنح أي موافقة تلقائية للمبدعين أو الشركات.</p>
 </DashShell>
}
