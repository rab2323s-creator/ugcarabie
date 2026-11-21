import React, { createContext, useContext, useEffect, useState } from 'react'
import { configured, supabase } from './supabase'

const AuthContext = createContext(null)
const ToastContext = createContext(null)

export function AuthProvider({children}) {
  const [user,setUser] = useState(null)
  const [profile,setProfile] = useState(null)
  const [loading,setLoading] = useState(configured)
  useEffect(() => {
    if (!supabase) return
    let alive = true
    async function sync(session) {
      const authUser = session?.user ?? null
      if (!alive) return
      setUser(authUser)
      if (authUser) {
        const {data} = await supabase.from('profiles').select('*').eq('id',authUser.id).maybeSingle()
        if (alive) setProfile(data ?? null)
      } else setProfile(null)
      if (alive) setLoading(false)
    }
    supabase.auth.getSession().then(({data}) => sync(data.session)).catch(() => {if(alive)setLoading(false)})
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_event,session)=>{
      // Deferred to avoid issuing Supabase requests synchronously inside the auth callback.
      setTimeout(()=>sync(session),0)
    })
    return ()=>{alive=false;subscription.unsubscribe()}
  },[])
  async function refreshProfile(){ if(!user || !supabase)return;const {data}=await supabase.from('profiles').select('*').eq('id',user.id).single();setProfile(data) }
  async function signOut(){if(supabase)await supabase.auth.signOut();setUser(null);setProfile(null)}
  return <AuthContext.Provider value={{user,profile,loading,refreshProfile,signOut}}>{children}</AuthContext.Provider>
}
export const useAuth=()=>useContext(AuthContext)

export function ToastProvider({children}) {
  const [toast,setToast]=useState('')
  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),4200);return()=>clearTimeout(t)},[toast])
  return <ToastContext.Provider value={setToast}>{children}{toast&&<div className="toast" role="status">{toast}</div>}</ToastContext.Provider>
}
export const useToast=()=>useContext(ToastContext)
