import React,{useState} from 'react'
import {Link,useLocation,useNavigate,useSearchParams} from 'react-router-dom'
import {ArrowLeft,CheckCircle2,LockKeyhole,Mail,UserRound,Building2,Eye,EyeOff} from 'lucide-react'
import {configured,supabase} from '../lib/supabase'
import {useAuth,useToast} from '../lib/auth'

export function AuthPage({type}){
 const [params]=useSearchParams(),[role,setRole]=useState(params.get('role')==='company'?'company':'creator'),[name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[show,setShow]=useState(false),[busy,setBusy]=useState(false),[success,setSuccess]=useState(false),toast=useToast(),navigate=useNavigate(),{user}=useAuth(),location=useLocation()
 const signup=type==='register'
 async function submit(e){e.preventDefault();if(!configured){toast('المنصة قيد التجهيز: أضف إعدادات Supabase لتفعيل الحسابات.');return}
 if(password.length<8){toast('كلمة المرور لازم تكون 8 أحرف على الأقل.');return}
 setBusy(true)
 let result
 if(signup)result=await supabase.auth.signUp({email:email.trim(),password,options:{data:{display_name:name.trim(),role},emailRedirectTo:new URL(import.meta.env.BASE_URL,window.location.origin).toString()}})
 else result=await supabase.auth.signInWithPassword({email:email.trim(),password})
 setBusy(false)
 if(result.error){toast(result.error.message);return}
 if(signup&&!result.data.session){setSuccess(true);return}
 navigate('/dashboard',{replace:true})
 }
 if(user)return <div className="container page-padded centered"><h2>أنت مسجّل دخول بالفعل</h2><Link className="btn btn-primary" to="/dashboard">لوحة التحكم <ArrowLeft size={17}/></Link></div>
 return <div className="auth-layout"><div className="auth-side"><div className="auth-side-inner"><div className="auth-deco">✳</div><div className="eyebrow">UGC Arabie</div><h2>مكان يصنع فيه<br/>الإبداع <em>فرصاً.</em></h2><p>كل قصة حلوة بتبدأ بخطوة. انضم لمساحة تجمع المواهب العربية مع العلامات التجارية.</p><div className="auth-side-float"><CheckCircle2/> موهبتك هي البداية</div></div></div><div className="auth-form-wrap">{success?<div className="auth-card centered"><div className="success-icon"><Mail size={27}/></div><h1>افتح بريدك الإلكتروني</h1><p>أرسلنا لك رابط تأكيد الحساب. فعّل بريدك أولاً ثم سجّل الدخول.</p><Link to="/login" className="btn btn-primary full-width">العودة لتسجيل الدخول</Link></div>:<form className="auth-card" onSubmit={submit}><div className="eyebrow">{signup?'حساب جديد':'مرحباً بعودتك'}</div><h1>{signup?'خلينا نبدأ الرحلة!':'أهلاً وسهلاً من جديد'}</h1><p>{signup?'سجّل حسابك خلال دقيقة، وبعدها كمّل ملفك الشخصي.':'ادخل لحسابك وتابع كل الفرص والتعاونات.'}</p>{signup&&<><span className="field-label">أنا هنا بصفتي</span><div className="role-switch"><button className={role==='creator'?'selected':''} type="button" onClick={()=>setRole('creator')}><UserRound size={19}/> صانع محتوى</button><button className={role==='company'?'selected':''} type="button" onClick={()=>setRole('company')}><Building2 size={19}/> شركة / علامة تجارية</button></div><label className="form-field"><span>{role==='creator'?'الاسم الكامل':'اسم الشركة'}</span><input required minLength={2} maxLength={80} value={name} onChange={e=>setName(e.target.value)} placeholder={role==='creator'?'مثال: سارة أحمد':'مثال: إبداع ستور'} autoComplete="name"/></label></>}
 <label className="form-field"><span>البريد الإلكتروني</span><div className="input-with-icon"><Mail size={18}/><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" dir="ltr" autoComplete="email"/></div></label><label className="form-field"><span>كلمة المرور</span><div className="input-with-icon"><LockKeyhole size={18}/><input required minLength={8} type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="ثمانية أحرف على الأقل" autoComplete={signup?'new-password':'current-password'}/><button type="button" className="show-password" aria-label={show?'إخفاء كلمة المرور':'إظهار كلمة المرور'} onClick={()=>setShow(!show)}>{show?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label><button className="btn btn-primary full-width auth-submit" disabled={busy}>{busy?'جاري المعالجة...':signup?'إنشاء الحساب':'تسجيل الدخول'} <ArrowLeft size={17}/></button>{signup&&<small className="form-disclaimer">بإنشاء الحساب، أنت توافق على <Link to="/terms">الشروط</Link> و<Link to="/privacy">سياسة الخصوصية</Link>.</small>}<div className="auth-alternate">{signup?'عندك حساب من قبل؟':'ما عندك حساب؟'} <Link to={signup?'/login':'/register'}>{signup?'سجّل دخول':'أنشئ حساب مجاني'}</Link></div></form>}</div></div>
}
