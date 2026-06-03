const { chromium } = require('playwright');
const fs = require('fs');

const HANDLE = 'alexabreutz';

(async () => {
  const browser = await chromium.launch({ headless: true });

  // Try mobile user agent
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  // Try Instagram API endpoint
  console.log('Intentando API pública...');
  try {
    const resp = await page.goto(`https://i.instagram.com/api/v1/users/web_profile_info/?username=${HANDLE}`, {
      waitUntil: 'networkidle', timeout: 15000
    });
    const text = await page.content();
    console.log('API response:', text.slice(0, 2000));
    fs.writeFileSync('api-response.json', text);
  } catch(e) {
    console.log('API falló:', e.message);
  }

  // Try profile page with mobile
  console.log('\nIntentando perfil móvil...');
  await page.goto(`https://www.instagram.com/${HANDLE}/`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(3000);

  const text = await page.content();
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Body text:', bodyText.slice(0, 1000));

  await page.screenshot({ path: 'mobile-screenshot.png' });

  await browser.close();
})();
