import { createClient } from '@supabase/supabase-js'

export const configured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
export const supabase = configured ? createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
) : null

export function safeLink(url) {
  try {
    const parsed = new URL(url)
    return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : null
  } catch { return null }
}

export function formatMoney(amount, currency='USD') {
  if (amount == null || amount === '') return 'حسب الاتفاق'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(amount))
}

export const countries = ['السعودية','الإمارات','مصر','المغرب','الأردن','الكويت','قطر','البحرين','عُمان','لبنان','العراق','الجزائر','تونس','فلسطين','سوريا','أخرى']
export const niches = ['جمال وعناية','أزياء','تقنية','مطاعم وطعام','لايف ستايل','سفر','رياضة','أمومة وأطفال','منزل وديكور','ألعاب']
export const sampleCreators = [
  { user_id:'demo1', headline:'UGC Creator · Beauty & lifestyle', niches:['جمال وعناية','لايف ستايل'], languages:['العربية'], starting_price:110, approved:true, profile:{ display_name:'سارة', slug:'sample-sara',country:'السعودية',avatar_url:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80',bio:'أحب تحويل المنتجات إلى قصص بسيطة وواقعية.' }},
  { user_id:'demo2', headline:'Tech & product storytelling', niches:['تقنية'], languages:['العربية','الإنجليزية'], starting_price:90, approved:true, profile:{ display_name:'آدم',slug:'sample-adam',country:'الإمارات',avatar_url:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80',bio:'محتوى تقني سريع وجذاب.' }},
  { user_id:'demo3', headline:'Lifestyle & authentic reviews', niches:['لايف ستايل','أزياء'],languages:['العربية'],starting_price:75,approved:true,profile:{display_name:'ليلى',slug:'sample-layla',country:'المغرب',avatar_url:'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80',bio:'فيديوهات يومية بطابع إبداعي.'}},
  { user_id:'demo4', headline:'Food & creative content', niches:['مطاعم وطعام'], languages:['العربية'], starting_price:100,approved:true,profile:{display_name:'نور',slug:'sample-nour',country:'مصر',avatar_url:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&q=80',bio:'أقدم تجربة المنتج بطريقة طبيعية.'}}
]
export const sampleCampaigns = [
  {id:'demo1',title:'محتوى UGC لعلامة تجميل',category:'جمال وعناية',country:'السعودية',budget_min:100,budget_max:160,deliverables:'فيديو 30–45 ثانية',description:'نبحث عن مبدعين لتقديم فيديو قصير وتجربة منتج.',company:{display_name:'علامة تجميل — مثال'},status:'published'},
  {id:'demo2',title:'مراجعة منتج تقني',category:'تقنية',country:'الإمارات',budget_min:120,budget_max:200,deliverables:'فيديو 60 ثانية',description:'تجربة عملية ومراجعة مبسطة لمنتج تقني.',company:{display_name:'شركة تقنية — مثال'},status:'published'},
  {id:'demo3',title:'فيديو تجربة لمقهى',category:'مطاعم وطعام',country:'مصر',budget_min:60,budget_max:100,deliverables:'فيديو 30 ثانية',description:'نبحث عن فيديو طبيعي يعرض أجواء المقهى.',company:{display_name:'مقهى — مثال'},status:'published'}
]
