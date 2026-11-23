import React,{useEffect} from 'react'
import {Routes,Route,useLocation} from 'react-router-dom'
import {PageLayout} from './components/Layout'
import SeoHead from './components/SeoHead'
import SearchLanding from './pages/SearchLanding'
import Home from './pages/Home'
import {Creators,CreatorDetails,Campaigns,CampaignDetails} from './pages/Explore'
import {AuthPage} from './pages/AuthPages'
import {Protected,DashboardHome,ProfileEditor,NewCampaign} from './pages/Dashboard'
import {Messages} from './pages/Messages'
import SupportMessages from './pages/SupportMessages'
import Admin from './pages/Admin'
import {HowItWorks,Legal,NotFound} from './pages/Static'
import {BlogIndex,BlogArticle} from './pages/Blog'

function ScrollToTop(){const {pathname}=useLocation();useEffect(()=>{window.scrollTo({top:0,behavior:'instant'})},[pathname]);return null}
export default function App(){return <PageLayout><ScrollToTop/><SeoHead/><Routes>
 <Route path="/" element={<Home/>}/>
 <Route path="/creators" element={<Creators/>}/>
 <Route path="/creator/:slug" element={<CreatorDetails/>}/>
 <Route path="/campaigns" element={<Campaigns/>}/>
 <Route path="/campaigns/:id" element={<CampaignDetails/>}/>
 <Route path="/register" element={<AuthPage type="register"/>}/>
 <Route path="/login" element={<AuthPage type="login"/>}/>
 <Route path="/dashboard" element={<Protected><DashboardHome/></Protected>}/>
 <Route path="/dashboard/profile" element={<Protected><ProfileEditor/></Protected>}/>
 <Route path="/dashboard/campaigns/new" element={<Protected roles={['company']}><NewCampaign/></Protected>}/>
 <Route path="/messages" element={<Protected><Messages/></Protected>}/>
 <Route path="/support" element={<Protected roles={['admin','creator','company']}><SupportMessages/></Protected>}/>
 <Route path="/admin" element={<Protected roles={['admin']}><Admin/></Protected>}/>
 <Route path="/how-it-works" element={<HowItWorks/>}/>
 <Route path="/for-brands" element={<SearchLanding/>}/>
 <Route path="/for-creators" element={<SearchLanding/>}/>
 <Route path="/what-is-ugc" element={<SearchLanding/>}/>
 <Route path="/blog" element={<BlogIndex/>}/>
 <Route path="/blog/:slug" element={<BlogArticle/>}/>
 <Route path="/terms" element={<Legal type="terms"/>}/>
 <Route path="/privacy" element={<Legal type="privacy"/>}/>
 <Route path="*" element={<NotFound/>}/>
 </Routes></PageLayout>}
