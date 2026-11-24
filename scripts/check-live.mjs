import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const siteUrl = process.argv[2] || 'https://ugcarabie.com/';
if (!siteUrl.startsWith('https://')) throw new Error('Expected HTTPS preview URL');
await fs.mkdir('screenshots', { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  for (const test of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    let lastError;
    let passed = false;
    for (let attempt = 1; attempt <= 6; attempt++) {
      const page = await browser.newPage({ viewport: { width: test.width, height: test.height }, deviceScaleFactor: 1 });
      const exceptions = [];
      page.on('pageerror', error => exceptions.push(error.message));
      try {
        const response = await page.goto(siteUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        if (response?.status() !== 200) throw new Error('HTTP ' + response?.status());
        await page.locator('h1').first().waitFor({ state: 'visible', timeout: 12000 });
        const heading = await page.locator('h1').first().innerText();
        if (!heading.includes('صناع محتوى UGC عرب')) throw new Error('Unexpected heading: ' + heading);
        if (exceptions.length) throw new Error('JavaScript error: ' + exceptions.join('; '));
        const app = await page.locator('#root').innerText();
        if (app.length < 300) throw new Error('React app rendered too little content: ' + app.length);
        for (const route of ['register?role=creator', 'register?role=company', 'login', 'creators', 'campaigns', 'for-brands', 'for-creators', 'what-is-ugc', 'terms', 'privacy', 'blog', 'blog/كيف-تصبح-صانع-محتوى-UGC-بدون-متابعين', 'blog/أسعار-فيديوهات-UGC-في-السعودية']) {
          const target = new URL(route, siteUrl).toString();
          const routeResponse = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
          if (routeResponse?.status() !== 200) throw new Error('SEO route ' + route + ' must return HTTP 200, got ' + routeResponse?.status());
          if (route === 'blog' || route.startsWith('blog/')) {
            await page.locator('main#main h1').first().waitFor({ state: 'visible', timeout: 12000 });
            if (await page.locator('#root').count()) throw new Error('Blog page should be standalone HTML, not React: ' + route);
          } else {
            await page.locator('#root').locator('h1').first().waitFor({ state: 'visible', timeout: 12000 });
          }
          if (exceptions.length) throw new Error('JS error on ' + route + ': ' + exceptions.join('; '));
        }
        const homepage = await page.request.get(siteUrl);
        const homepageHtml = await homepage.text();
        if (homepage.status() !== 200 || !homepageHtml.includes('rel="canonical"')) throw new Error('Home SEO prerender missing');
        for (const slug of ['for-brands','for-creators','what-is-ugc']) {
          const res = await page.request.get(new URL('/'+slug+'/',siteUrl).toString());
          const html = await res.text();
          if (res.status() !== 200 || !html.includes('rel="canonical"') || !html.includes('application/ld+json')) throw new Error('SEO '+slug+' metadata or HTTP 200 missing');
          if (!html.includes('<h2>') || !html.includes('أسئلة شائعة')) throw new Error('SEO '+slug+' body not prerendered');
        }
        for (const slug of ['كيف-تصبح-صانع-محتوى-UGC-بدون-متابعين','كيف-تختار-صانع-محتوى-UGC-لعلامتك','أسعار-فيديوهات-UGC-في-السعودية']) {
          const endpoint = new URL('/blog/'+slug+'/',siteUrl).toString();
          const result = await page.request.get(endpoint);
          const html = await result.text();
          if(result.status()!==200) throw new Error('Blog direct HTML must return 200 '+slug+': '+result.status());
          if(!html.includes('BlogPosting') || !html.includes('BreadcrumbList') || !html.includes('rel="canonical"')) throw new Error('Blog HTML metadata missing: '+slug);
          if(!html.includes('<h2>') || !html.includes('meta name="description"')) throw new Error('Blog content missing: '+slug);
        }
        const sitemap = await page.request.get(new URL('/sitemap.xml',siteUrl).toString(), {maxRedirects:0});
        const xml=await sitemap.text();
        if (sitemap.status() !== 200 || !xml.includes('<urlset')) throw new Error('SEO sitemap unavailable');
        // Verify the actual canonical URLs, not just a final 200 after redirects.
        if(test.name==='desktop'){
          const urls=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1].replace(/&amp;/g,'&'));
          if(!urls.length)throw new Error('Empty sitemap');
          for(const url of urls){
            const result=await page.request.get(url,{maxRedirects:0,timeout:30000});
            if(result.status()!==200)throw new Error('Sitemap URL not direct HTTP 200: '+url+' '+result.status()+' location: '+(result.headers().location||''));
            const html=await result.text(),canonical=html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1];
            if(!canonical||new URL(canonical).href!==new URL(url).href)throw new Error('Canonical mismatch: '+url);
            if(/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html))throw new Error('Sitemap URL marked noindex: '+url);
          }
          const source=new URL('/for-brands',siteUrl).toString();
          const target=new URL('/for-brands/',siteUrl).toString();
          const first=await page.request.get(source,{maxRedirects:0,timeout:30000});
          if(first.status()>=300&&first.status()<400){
            const location=first.headers().location;
            if(!location||new URL(location,source).href!==target)throw new Error('Unexpected for-brands redirect: '+first.status()+' '+location);
          }else if(first.status()!==200)throw new Error('Noncanonical for-brands HTTP '+first.status());
          console.log('PASS: '+urls.length+' canonical sitemap URLs direct HTTP 200; /for-brands status '+first.status());
        }
        const robots = await page.request.get(new URL('/robots.txt',siteUrl).toString());
        if (robots.status() !== 200 || !(await robots.text()).includes('Sitemap:')) throw new Error('SEO robots unavailable');
        for (const slug of ['terms','privacy']) {
          const response = await page.request.get(new URL('/'+slug+'/',siteUrl).toString());
          const body = await response.text();
          if (response.status() !== 200) throw new Error('Legal page /'+slug+'/ HTTP '+response.status());
          if (!body.includes('Viva Media Creative') || !body.includes('name="robots" content="noindex')) throw new Error('Legal attribution or noindex missing on '+slug);
          if (!body.includes('<h2>') || !body.includes('info@ugcarabie.com') || body.includes('معلومات قانونية تحتاج استكمالاً')) throw new Error('Legal content not pre-rendered on '+slug);
        }
                const privateSeo = await page.request.get(new URL('/login/',siteUrl).toString());
        if (privateSeo.status() !== 200 || !(await privateSeo.text()).includes('content="noindex,follow"')) throw new Error('Private route noindex missing');
        await page.goto(siteUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.locator('h1').first().waitFor({ state: 'visible', timeout: 12000 });
        await page.screenshot({ path: 'screenshots/' + test.name + '.png', fullPage: false });
        console.log(test.name + ': PASS, HTTP 200, heading and React content visible');
        passed = true;
        break;
      } catch (err) {
        lastError = err;
        console.warn(test.name + ', attempt ' + attempt + ': ' + err.message);
        if (attempt < 6) await new Promise(resolve => setTimeout(resolve, 5000));
      } finally {
        await page.close();
      }
    }
    if (!passed) throw lastError;
  }
} finally {
  await browser.close();
}
