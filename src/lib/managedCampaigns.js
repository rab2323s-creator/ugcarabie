/**
 * UGC Arabie-coordinated opportunities. Requirements, budgets and descriptions
 * reflect copy provided by the site owner; inquiries are sent via email.
 */
export const campaignContactEmail = 'info@ugcarabie.com'

export const managedCampaigns = [
  {
    id: 'ugc-beauty-sa',
    title: 'محتوى UGC لعلامة تجميل وعناية بالبشرة',
    category: 'جمال وعناية',
    country: 'السعودية',
    budget_min: 40,
    budget_max: 70,
    deliverables: 'فيديو UGC احترافي مدته 30–45 ثانية',
    description: 'نبحث عن صانعات وصنّاع محتوى UGC مبدعين لإنتاج فيديو تجميلي جذاب يعرض تجربة المنتج بطريقة طبيعية وواقعية، ويسلط الضوء على مميزاته وطريقة استخدامه، بأسلوب يعزز ثقة الجمهور ويشجع على اكتشاف العلامة التجارية.',
    requirements: [
      'فيديو UGC احترافي مدته 30–45 ثانية.',
      'تجربة المنتج وعرض طريقة استخدامه بوضوح.',
      'تصوير جذاب بإضاءة جيدة وجودة عالية.',
      'تقديم المحتوى بأسلوب عفوي ومقنع بعيداً عن الإعلانات التقليدية.',
      'مونتاج الفيديو وتسليم النسخة النهائية.',
      'التواصل الواضح والاتفاق على التفاصيل قبل بدء الإنتاج.'
    ],
    budgetDescription: 'الميزانية التقديرية: 40–70 دولاراً أمريكياً للفيديو الواحد، بحسب جودة المحتوى وخبرة المبدع.',
    company: { display_name: 'UGC Arabie' },
    status: 'published',
    managed: true
  },
  {
    id: 'ugc-tech-ae',
    title: 'عرض تعاون UGC – الإمارات 🇦🇪',
    category: 'تقنية',
    country: 'الإمارات',
    budget_min: 40,
    budget_max: 60,
    deliverables: 'فيديو 60 ثانية',
    description: 'نبحث عن صانع/ة محتوى UGC لإنتاج فيديو قصير مدته 60 ثانية لتجربة ومراجعة منتج تقني.',
    requirements: [
      'تجربة المنتج بشكل عملي.',
      'تصوير فيديو بأسلوب طبيعي واحترافي.',
      'تقديم مراجعة مبسطة وواضحة للمنتج.',
      'مونتاج الفيديو وتسليم النسخة النهائية.',
      'التواصل والاتفاق على التفاصيل قبل بدء الإنتاج.'
    ],
    budgetDescription: 'الميزانية: 40–60 دولار أمريكي للفيديو الواحد.',
    closing: 'نرحب بصناع المحتوى المهتمين بالتعاون وتقديم محتوى إبداعي بجودة جيدة.',
    company: { display_name: 'UGC Arabie' },
    status: 'published',
    managed: true
  },
  {
    id: 'ugc-cafe-eg',
    title: 'تجربة UGC لمقهى – أجواء تستحق المشاركة',
    category: 'مطاعم وطعام',
    country: 'مصر',
    budget_min: 20,
    budget_max: 40,
    deliverables: 'فيديو UGC مدته 30 ثانية',
    description: 'نبحث عن صناع وصانعات محتوى UGC لتقديم تجربة واقعية وجذابة داخل أحد المقاهي، من خلال فيديو قصير ينقل أجواء المكان، ويبرز تفاصيل التجربة، من الديكور والمشروبات إلى جودة الخدمة والتفاصيل التي تجعل زيارة المقهى مميزة.',
    additionalDescription: 'نريد محتوى عفوياً يشبه تجربة الزائر الحقيقية، وليس إعلاناً تقليدياً.',
    requirements: [
      'فيديو UGC مدته 30 ثانية.',
      'تصوير أجواء المقهى والديكور.',
      'عرض المشروبات أو الأطعمة بطريقة جذابة.',
      'إبراز تجربة الزيارة بأسلوب طبيعي.',
      'مونتاج وتسليم الفيديو بجودة عالية.',
      'التواصل والاتفاق على التفاصيل قبل بدء التصوير.'
    ],
    budgetDescription: 'الميزانية التقديرية: 20–40 دولاراً أمريكياً للفيديو الواحد.',
    note: 'يوفر المقهى الضيافة أثناء التصوير، ويتم الاتفاق مسبقاً على موعد الزيارة والتفاصيل.',
    company: { display_name: 'UGC Arabie' },
    status: 'published',
    managed: true
  }
]

export function campaignInquiryLink(campaign) {
  const subject = 'التقديم على فرصة UGC: ' + campaign.title + ' (' + campaign.id + ')'
  const body = [
    'مرحباً فريق UGC Arabie،',
    '',
    'أرغب بالتقديم على فرصة: ' + campaign.title,
    'الدولة المطلوبة: ' + campaign.country,
    '',
    'الاسم:',
    'بلد الإقامة:',
    'التخصص:',
    'رابط نماذج أعمالي (Portfolio):',
    'معلومات إضافية:',
    '',
    'شكراً لكم.'
  ].join('\n')
  return 'mailto:' + campaignContactEmail + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body)
}
