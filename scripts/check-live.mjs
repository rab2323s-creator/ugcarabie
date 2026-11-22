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
        if (!heading.includes('محتواك اليوم')) throw new Error('Unexpected heading: ' + heading);
        if (exceptions.length) throw new Error('JavaScript error: ' + exceptions.join('; '));
        const app = await page.locator('#root').innerText();
        if (app.length < 300) throw new Error('React app rendered too little content: ' + app.length);
        for (const route of ['register?role=creator', 'register?role=company', 'login', 'creators', 'campaigns']) {
          const target = new URL(route, siteUrl).toString();
          const routeResponse = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
          if (!routeResponse || ![200, 404].includes(routeResponse.status())) throw new Error('Route ' + route + ' HTTP ' + routeResponse?.status());
          await page.locator('#root').locator('h1').first().waitFor({ state: 'visible', timeout: 12000 });
          if (exceptions.length) throw new Error('JS error on ' + route + ': ' + exceptions.join('; '));
        }
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
