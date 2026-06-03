const { chromium } = require('playwright');
const fs = require('fs');

const HANDLE = 'alexabreutz';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  await page.goto(`https://www.instagram.com/${HANDLE}/`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(4000);

  const data = await page.evaluate(() => {
    const body = document.body.innerText;
    const links = Array.from(document.querySelectorAll('a')).map(a => ({
      text: a.innerText,
      href: a.href
    })).filter(l => l.href && !l.href.includes('javascript'));
    return { body: body.slice(0, 3000), links };
  });

  console.log('BODY TEXT:');
  console.log(data.body);
  console.log('\nLINKS:');
  data.links.forEach(l => console.log(`  [${l.text}] -> ${l.href}`));

  await page.screenshot({ path: 'profile-full.png', fullPage: true });

  await browser.close();
})();
