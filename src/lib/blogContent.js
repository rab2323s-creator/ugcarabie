import manifest from '../../blog/manifest.json' with {type:'json'}

// Navigation metadata only: full editorial text lives in blog/<slug>/index.html.
export const blogCategories=manifest.categories
export const blogArticles=manifest.articles
export const blogInfo=manifest.info
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
