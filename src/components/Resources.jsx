import React from 'react'
import {Link} from 'react-router-dom'
import {ArrowUpLeft,BookOpen,Wrench,Compass} from 'lucide-react'
import {publicHref,standaloneHref} from '../lib/internalResources'
export function ResourceLink({href,children,...props}){const url=publicHref(href);return standaloneHref(url)?<a href={url} {...props}>{children}</a>:<Link to={url} {...props}>{children}</Link>}
export function ResourceCards({group}){return <section className="resource-block" aria-label={group.title}><div className="resource-heading"><span className="eyebrow"><BookOpen size={16}/> موارد تساعدك على اتخاذ الخطوة التالية</span><h2>{group.title}</h2><p>{group.intro}</p></div><div className="resource-grid">{group.items.map(item=>{const Symbol=item.type==='أداة مجانية'?Wrench:item.type==='دليل عملي'?BookOpen:Compass;return <ResourceLink key={item.href} href={item.href} className="resource-card"><span className="resource-type"><Symbol size={17}/>{item.type}</span><h3>{item.label}</h3><p>{item.description}</p><span className="resource-arrow" aria-hidden="true"><ArrowUpLeft size={17}/></span></ResourceLink>})}</div></section>}
