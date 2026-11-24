// Shared contextual navigation for React and crawlable HTML.
const blog=(slug,label,description)=>({href:'/blog/'+slug+'/',label,description,type:'دليل عملي'})
const tool=(slug,label,description)=>({href:'/tools/'+slug+'/',label,description,type:'أداة مجانية'})
const page=(href,label,description)=>({href,label,description,type:'على المنصة'})
export const resources={
 start:blog('كيف-تصبح-صانع-محتوى-UGC-بدون-متابعين','كيف تبدأ UGC بدون متابعين؟','خطة تطبيقية من اختيار التخصص إلى أول عرض تعاون.'),
 portfolio:blog('كيف-تسوي-بورتفوليو-UGC-احترافي','دليل بناء بورتفوليو UGC احترافي','جهّز نماذج أعمال يسهل على الشركات مراجعتها.'),
 choose:blog('كيف-تختار-صانع-محتوى-UGC-لعلامتك','كيف تختار صانع محتوى UGC لمنتجاتك؟','قارن المهارات والعينات والحقوق قبل التعاقد.'),
 compare:blog('الفرق-بين-UGC-والتسويق-بالمؤثرين','الفرق بين UGC والتسويق بالمؤثرين','اختر طريقة الإنتاج والنشر التي تناسب هدف الحملة.'),
 price:blog('أسعار-فيديوهات-UGC-في-السعودية','أسعار فيديوهات UGC في السعودية','مؤشرات سعرية وجداول تكلفة الباقات والحقوق.'),
 jobs:blog('فرص-عمل-UGC-في-الإمارات-ومصر','فرص عمل UGC في الإمارات ومصر','أمثلة تقديم وخطة تواصل مع الشركات.'),
 plan:tool('ugc-30-day-plan','خطة صناعة محتوى UGC خلال 30 يوماً','نظّم التدريب والنماذج والتواصل خطوة بخطوة.'),
 builder:tool('ugc-portfolio-builder','منشئ بورتفوليو UGC المجاني','أنشئ ملف أعمالك وراجع جاهزيته قبل التقديم.'),
 evaluate:tool('ugc-creator-evaluation','أداة تقييم واختيار صنّاع UGC','قارن ثلاثة مرشحين وجهّز موجز التصوير.'),
 calculator:tool('ugc-pricing-calculator','حاسبة أسعار UGC وميزانية الحملة','احسب الإنتاج والحقوق والرسوم والإنفاق الإعلاني.'),
 strategy:tool('ugc-strategy-planner','مخطط استراتيجية UGC والمؤثرين','حدد مسار الاختبار المناسب ووزع ميزانيتك.'),
 income:tool('ugc-client-income-planner','مخطط عملاء UGC وحاسبة الدخل','خطط للعملاء والسعة والتكاليف والمقبوض.'),
 brands:page('/for-brands/','خدمات UGC للشركات والعلامات التجارية','تعرف على مسار نشر حملة واختيار مبدع مناسب.'),
 creators:page('/for-creators/','دليل العمل في UGC للمبدعين','جهّز ملفك وتعرّف على خطوات التقديم.'),
 directory:page('/creators/','دليل صنّاع محتوى UGC العرب','استعرض المبدعين ونماذج أعمالهم المتاحة.'),
 campaigns:page('/campaigns/','تصفح فرص وحملات UGC','راجع الفرص المنشورة ومتطلبات كل تعاون.'),
 registerCreator:page('/register/?role=creator','إنشاء حساب صانع محتوى UGC','جهّز ملفاً مهنياً للمراجعة والتقديم عند توفر الفرص.'),
 registerBrand:page('/register/?role=company','إنشاء حساب شركة ونشر حملة UGC','ابدأ مسار التعاون وحدد متطلبات حملتك.')
}
const r=resources
export const resourceGroups={
 directory:{title:'قبل اختيار صانع المحتوى',intro:'راجع نماذج المبدعين وحدد نطاق العمل والميزانية لتقارن الملفات على أساس واضح.',items:[r.choose,r.evaluate,r.brands]},
 campaigns:{title:'جهّز طلبك قبل التقديم على الحملة',intro:'ملف أعمال مناسب وعرض واضح يساعدانك على تقديم طلب يطابق متطلبات الفرصة.',items:[r.jobs,r.builder,r.income]},
 creatorDetail:{title:'خطوتك التالية لاختيار المبدع',intro:'قارن الأعمال بالاحتياج الفعلي، وحدد الحقوق والتسليم قبل الاتفاق.',items:[r.evaluate,r.price,r.brands]},
 campaignDetail:{title:'أدوات تساعدك قبل التقديم',intro:'راجع نماذجك وسعر الإنتاج والحقوق قبل التواصل مع فريق الحملة.',items:[r.builder,r.calculator,r.jobs]},
 campaignSaudi:{title:'جهّز عرضك لحملة UGC في السعودية',intro:'راجع تكلفة الإنتاج والحقوق، واختر نموذجاً مناسباً لمتطلبات الحملة.',items:[r.price,r.builder,r.calculator]},
 howCreator:{title:'موارد لصانع المحتوى',intro:'ابدأ بالمهارة والملف المهني، ثم ابحث عن التعاون المناسب.',items:[r.start,r.builder,r.creators]},
 howBrand:{title:'موارد للشركات',intro:'حدّد الهدف والمخرجات والميزانية قبل نشر طلب التعاون.',items:[r.choose,r.calculator,r.brands]}
}
export const campaignResources=country=>country==='السعودية'?resourceGroups.campaignSaudi:resourceGroups.campaignDetail
export const publicHref=href=>{if(!href.startsWith('/')||href.startsWith('//'))return href;const m=href.match(/^([^?#]*)(.*)$/);const base=m[1];return (base==='/'||base.endsWith('/')||/\.[a-z0-9]+$/i.test(base)?base:base+'/')+m[2]}
export const standaloneHref=href=>/^\/(blog|tools)(\/|$)/.test(href)
