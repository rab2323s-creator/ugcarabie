import React,{useEffect,useState} from 'react'
import {ShieldCheck,Check,RefreshCw} from 'lucide-react'
import {DashShell} from './Dashboard'
import {supabase} from '../lib/supabase'
import {useToast} from '../lib/auth'
import {EmptyState,Loading} from '../components/Layout'

export default function Admin(){const [pending,setPending]=useState([]),[busy,setBusy]=useState(''),[loading,setLoading]=useState(true),toast=useToast()
 async function load(){setLoading(true);const {data,error}=await supabase.from('creator_profiles').select('user_id,headline,created_at,approved,profile:profiles!creator_profiles_user_id_fkey!inner(display_name,country,slug,role)').eq('approved',false).eq('profile.role','creator').order('created_at',{ascending:true});if(error)toast(error.message);setPending(data||[]);setLoading(false)}
 useEffect(()=>{load()},[])
 async function approve(id){setBusy(id);const {error}=await supabase.from('creator_profiles').update({approved:true}).eq('user_id',id);setBusy('');if(error)toast(error.message);else{toast('تمت الموافقة على المبدع');load()}}
 return <DashShell title="إدارة المنصة" description="مراجعة حسابات المبدعين قبل ظهورهم للشركات."><div className="dash-section-head"><h2>حسابات بانتظار المراجعة ({pending.length})</h2><button className="btn btn-outline btn-small" onClick={load}><RefreshCw size={16}/> تحديث</button></div>{loading?<Loading/>:<div className="dash-list">{pending.length?pending.map(c=><div className="dash-list-item" key={c.user_id}><div><strong>{c.profile?.display_name||'مبدع'}</strong><small>{c.profile?.country||'بدون دولة'} · {c.headline||'بدون تعريف'} · /creator/{c.profile?.slug}</small></div><button className="btn btn-primary btn-small" disabled={busy===c.user_id} onClick={()=>approve(c.user_id)}><Check size={16}/> موافقة</button></div>):<EmptyState title="ما في حسابات بانتظار المراجعة"/>}</div>}<p className="admin-hint">تنبيه: وافق فقط بعد مراجعة الصورة وروابط الأعمال والتأكد من ملاءمة المحتوى. الحسابات المعتمدة تظهر بالبحث العام.</p></DashShell>
}
