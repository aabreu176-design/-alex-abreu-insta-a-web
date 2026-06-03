const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  // Try several possible handles
  const handles = ['asatcambios', 'asat_cambios', 'asatcambio', 'asat.cambios'];

  for (const handle of handles) {
    await page.goto(`https://www.instagram.com/${handle}/`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    const text = await page.evaluate(() => document.body.innerText);
    console.log(`\n=== @${handle} ===`);
    console.log(text.slice(0, 500));
    await page.screenshot({ path: `asat-${handle}.png` });
  }

  await browser.close();
})();
