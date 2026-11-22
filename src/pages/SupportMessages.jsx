import React,{useEffect,useRef,useState} from 'react'
import {useSearchParams} from 'react-router-dom'
import {MessageCircle,Send,RefreshCw} from 'lucide-react'
import {DashShell} from './Dashboard'
import {supabase} from '../lib/supabase'
import {useAuth,useToast} from '../lib/auth'
import {Loading} from '../components/Layout'

export default function SupportMessages(){
 const {user,profile}=useAuth(),toast=useToast(),[params,setParams]=useSearchParams()
 const [threads,setThreads]=useState([]),[people,setPeople]=useState({}),[messages,setMessages]=useState([])
 const [draft,setDraft]=useState(''),[loading,setLoading]=useState(true),[sending,setSending]=useState(false)
 const [opening,setOpening]=useState(false),endRef=useRef(null)
 const requestedRecipient=params.get('recipient')||params.get('creator')
 const activeId=params.get('chat')||threads[0]?.id
 async function loadThreads(){
  if(!user)return
  const {data,error}=await supabase.from('support_conversations').select('id,admin_id,recipient_id,created_at').order('created_at',{ascending:false})
  if(error){toast(error.message);setLoading(false);return}
  const arr=data||[];setThreads(arr)
  const ids=[...new Set(arr.flatMap(t=>[t.admin_id,t.recipient_id]))]
  if(ids.length){const {data:p}=await supabase.from('profiles').select('id,display_name').in('id',ids);setPeople(Object.fromEntries((p||[]).map(x=>[x.id,x])))}
  setLoading(false)
 }
 useEffect(()=>{loadThreads()},[user?.id])
 useEffect(()=>{
  if(!user||profile?.role!=='admin'||!requestedRecipient||opening)return
  // Open only the recipient selected from an admin action.
  let cancelled=false
  async function openThread(){
   setOpening(true)
   const {data:existing,error:findError}=await supabase.from('support_conversations').select('id').eq('admin_id',user.id).eq('recipient_id',requestedRecipient).maybeSingle()
   if(cancelled)return
   if(findError){toast(findError.message);setOpening(false);return}
   let id=existing?.id
   if(!id){
    const {data,error}=await supabase.from('support_conversations').insert({admin_id:user.id,recipient_id:requestedRecipient}).select('id').single()
    if(cancelled)return
    if(error?.code==='23505'){
     const {data:existingNow,error:lookupError}=await supabase.from('support_conversations').select('id').eq('admin_id',user.id).eq('recipient_id',requestedRecipient).single()
     if(cancelled)return
     if(lookupError){toast(lookupError.message);setOpening(false);return}
     id=existingNow.id
    }else if(error){toast(error.message);setOpening(false);return}
    else id=data.id
   }
   setParams({chat:id},{replace:true})
   await loadThreads()
   setOpening(false)
  }
  openThread()
  return()=>{cancelled=true}
 },[requestedRecipient,user?.id,profile?.role])
 useEffect(()=>{
  setMessages([])
  if(!activeId||!threads.some(t=>t.id===activeId))return
  let active=true
  async function load(){const {data,error}=await supabase.from('support_messages').select('id,conversation_id,sender_id,body,created_at').eq('conversation_id',activeId).order('created_at',{ascending:true}).limit(200);if(active){if(error)toast(error.message);else setMessages(data||[])}}
  load()
  const channel=supabase.channel('support-'+activeId).on('postgres_changes',{event:'INSERT',schema:'public',table:'support_messages',filter:'conversation_id=eq.'+activeId},payload=>{
   setMessages(prev=>prev.some(m=>m.id===payload.new.id)?prev:[...prev,payload.new])
  }).subscribe()
  return()=>{active=false;supabase.removeChannel(channel)}
 },[activeId,threads.length])
 useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth',block:'nearest'})},[messages.length])
 async function send(e){
  e.preventDefault()
  if(!draft.trim()||!activeId||!threads.some(t=>t.id===activeId)||sending)return
  setSending(true)
  const {data,error}=await supabase.from('support_messages').insert({conversation_id:activeId,sender_id:user.id,body:draft.trim()}).select('id,conversation_id,sender_id,body,created_at').single()
  setSending(false)
  if(error){toast(error.message);return}
  setDraft('')
  setMessages(prev=>prev.some(m=>m.id===data.id)?prev:[...prev,data])
 }
 const current=threads.find(t=>t.id===activeId)
 const partner=t=>t.admin_id===user?.id?t.recipient_id:t.admin_id
 return <DashShell title="مراسلات الإدارة" description="قناة خاصة بين إدارة المنصة وصنّاع المحتوى والشركات، منفصلة عن محادثات الحملات.">
  <div className="messaging-shell">
   <aside className="chat-list"><h2>مراسلات الإدارة <span>{threads.length}</span></h2>
    {loading||opening?<Loading/>:threads.length?threads.map(t=><button key={t.id} className={'chat-list-item '+(activeId===t.id?'selected':'')} onClick={()=>setParams({chat:t.id})}>
     <span className="chat-avatar">{people[partner(t)]?.display_name?.slice(0,1)||'U'}</span>
     <span><strong>{people[partner(t)]?.display_name||'مستخدم'}</strong><small>رسالة من إدارة المنصة</small></span>
    </button>):<p className="muted" style={{padding:15}}>لا توجد مراسلات إدارية بعد.</p>}
   </aside>
   <section className="chat-main">{current?<><div className="chat-header"><div><strong>{people[partner(current)]?.display_name||'مستخدم'}</strong><small>مراسلة إدارية خاصة</small></div>
    <button className="icon-button" title="تحديث الرسائل" onClick={async()=>{const {data,error}=await supabase.from('support_messages').select('id,conversation_id,sender_id,body,created_at').eq('conversation_id',activeId).order('created_at',{ascending:true}).limit(200);if(error)toast(error.message);else setMessages(data||[])}}><RefreshCw size={17}/></button></div>
    <div className="chat-messages" aria-live="polite">{messages.length?messages.map(m=><div key={m.id} className={'bubble '+(m.sender_id===user.id?'mine':'theirs')}><p>{m.body}</p><small>{new Date(m.created_at).toLocaleTimeString('ar',{hour:'2-digit',minute:'2-digit'})}</small></div>):<div className="chat-placeholder">اكتب أول رسالة إلى الطرف الآخر.</div>}<div ref={endRef}/></div>
    <form className="chat-compose" onSubmit={send}><input aria-label="اكتب رسالة للإدارة" value={draft} maxLength={5000} onChange={e=>setDraft(e.target.value)} placeholder="اكتب رسالتك هنا..."/><button type="submit" className="btn btn-primary" disabled={!draft.trim()||sending}><Send size={18}/></button></form>
   </>:<div className="chat-placeholder large"><MessageCircle size={38}/>اختر محادثة لعرض الرسائل.</div>}</section>
  </div>
 </DashShell>
}
