import {creatorAndBrandGuides} from './blogContentPart1.js'
import {marketAndBrandGuides} from './blogContentPart2.js'

export const blogCategories = [
 {id:'creators',title:'لصنّاع المحتوى',description:'من أول فيديو UGC إلى بورتفوليو مرتب وفرصة تعاون مناسبة.',color:'peach'},
 {id:'brands',title:'للشركات',description:'اختيار المبدعين وصناعة حملات واضحة مع حقوق استخدام محددة.',color:'violet'},
 {id:'markets',title:'أدلة السوق العربي',description:'أمثلة عملية من فرص وأسواق السعودية والإمارات ومصر.',color:'blue'}
]
export const blogArticles=[...creatorAndBrandGuides,...marketAndBrandGuides]
export const blogInfo={
 title:'مدونة UGC Arabie | أدلة UGC للمبدعين والشركات',
 metaDescription:'مقالات UGC عربية أصلية للمبدعين والشركات: صناعة المحتوى، البورتفوليو، اختيار صناع UGC، الأسعار وفرص التعاون في السعودية والإمارات ومصر.',
 heading:'دليل الإبداع في عالم UGC',
 lead:'أفكار قابلة للتطبيق، وأجوبة واضحة عن صناعة محتوى UGC والتعاون بين العلامات التجارية والمبدعين في العالم العربي.',
 updated:'2026-11-23'
}
export const blogPath=article=>'/blog/'+article.slug
export const findBlogArticle=slug=>blogArticles.find(article=>article.slug===slug)
export const blogCategory=id=>blogCategories.find(category=>category.id===id)
export const blogUrl=article=>'https://ugcarabie.com'+blogPath(article)+'/'
export function articleSchema(article,options={}){
 const url=blogUrl(article)
 const graph=[
  {'@type':'WebPage','@id':url+'#webpage',url,name:article.seoTitle,description:article.metaDescription,inLanguage:'ar',isPartOf:{'@id':'https://ugcarabie.com/#website'}},
  {
   '@type':'BlogPosting','@id':url+'#article',mainEntityOfPage:{'@id':url+'#webpage'},
   headline:article.title,description:article.metaDescription,inLanguage:'ar',
   datePublished:article.published,dateModified:article.updated,
   author:{'@type':'Organization',name:'UGC Arabie',url:'https://ugcarabie.com/'},
   publisher:{'@type':'Organization',name:'UGC Arabie',url:'https://ugcarabie.com/'},
   articleSection:blogCategory(article.category)?.title,
   keywords:article.focusKeyword,
   ...(options.imageAvailable?{image:{'@type':'ImageObject',url:'https://ugcarabie.com'+article.image,caption:article.imageAlt}}:{}),
   about:{'@type':'Thing',name:article.focusKeyword}
  },
  {'@type':'BreadcrumbList','@id':url+'#breadcrumb',itemListElement:[
    {'@type':'ListItem',position:1,name:'الرئيسية',item:'https://ugcarabie.com/'},
    {'@type':'ListItem',position:2,name:'المدونة',item:'https://ugcarabie.com/blog/'},
    {'@type':'ListItem',position:3,name:article.title,item:url}
   ]}
 ]
 return graph
}
export function blogListingSchema(){
 return [
  {'@type':'CollectionPage','@id':'https://ugcarabie.com/blog/#webpage',name:blogInfo.title,description:blogInfo.metaDescription,inLanguage:'ar',url:'https://ugcarabie.com/blog/'},
  {'@type':'BreadcrumbList',itemListElement:[
   {'@type':'ListItem',position:1,name:'الرئيسية',item:'https://ugcarabie.com/'},
   {'@type':'ListItem',position:2,name:'المدونة',item:'https://ugcarabie.com/blog/'}
  ]},
  {'@type':'ItemList',itemListElement:blogArticles.map((article,i)=>({'@type':'ListItem',position:i+1,url:blogUrl(article),name:article.title}))}
 ]
}
