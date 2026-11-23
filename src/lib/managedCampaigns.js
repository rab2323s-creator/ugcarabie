/**
 * Opportunities coordinated by the UGC Arabie team.
 * These are not Supabase company-owned campaigns, so inquiries go by email.
 * Do not attribute them to a specific advertiser without authorization.
 */
export const campaignContactEmail = 'info@ugcarabie.com'

export const managedCampaigns = [
  {
    id: 'ugc-beauty-sa',
    title: 'محتوى UGC لعلامة تجميل',
    category: 'جمال وعناية',
    country: 'السعودية',
    budget_min: 100,
    budget_max: 160,
    deliverables: 'فيديو 30–45 ثانية',
    description: 'نبحث عن مبدعين لتقديم فيديو قصير وتجربة منتج.',
    company: { display_name: 'UGC Arabie' },
    status: 'published',
    managed: true
  },
  {
    id: 'ugc-tech-ae',
    title: 'مراجعة منتج تقني',
    category: 'تقنية',
    country: 'الإمارات',
    budget_min: 120,
    budget_max: 200,
    deliverables: 'فيديو 60 ثانية',
    description: 'تجربة عملية ومراجعة مبسطة لمنتج تقني.',
    company: { display_name: 'UGC Arabie' },
    status: 'published',
    managed: true
  },
  {
    id: 'ugc-cafe-eg',
    title: 'فيديو تجربة لمقهى',
    category: 'مطاعم وطعام',
    country: 'مصر',
    budget_min: 60,
    budget_max: 100,
    deliverables: 'فيديو 30 ثانية',
    description: 'نبحث عن فيديو طبيعي يعرض أجواء المقهى.',
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
