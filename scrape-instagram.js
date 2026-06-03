const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');

const HANDLE = 'alexabreutz';

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (r2) => {
          r2.pipe(file);
          file.on('finish', () => { file.close(); resolve(); });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 }
  });
  const page = await context.newPage();

  console.log('Accediendo a Instagram...');
  await page.goto(`https://www.instagram.com/${HANDLE}/`, { waitUntil: 'networkidle', timeout: 30000 });

  // Wait a bit for content to load
  await page.waitForTimeout(3000);

  // Accept cookies if present
  try {
    const cookieBtn = page.locator('button:has-text("Allow all cookies"), button:has-text("Accept all"), button:has-text("Aceptar")');
    if (await cookieBtn.count() > 0) {
      await cookieBtn.first().click();
      await page.waitForTimeout(2000);
    }
  } catch(e) {}

  // Dismiss login popup if present
  try {
    const notNow = page.locator('button:has-text("Not now"), button:has-text("Ahora no"), button:has-text("Not Now")');
    if (await notNow.count() > 0) {
      await notNow.first().click();
      await page.waitForTimeout(2000);
    }
  } catch(e) {}

  await page.screenshot({ path: 'instagram-screenshot.png', fullPage: false });
  console.log('Screenshot guardado');

  // Extract profile data
  const data = await page.evaluate(() => {
    const getText = (sel) => {
      const el = document.querySelector(sel);
      return el ? el.innerText || el.textContent : '';
    };

    // Try to get JSON data from window._sharedData or similar
    let sharedData = null;
    try {
      sharedData = window._sharedData;
    } catch(e) {}

    // Get all text content for analysis
    const bodyText = document.body.innerText;

    // Profile image
    const profileImg = document.querySelector('img[data-testid="user-avatar"], header img, article img');
    const profileImgUrl = profileImg ? profileImg.src : '';

    // Stats (followers, following, posts)
    const stats = Array.from(document.querySelectorAll('li span, header ul li')).map(el => el.innerText).filter(t => t.trim());

    // Bio
    const bioEl = document.querySelector('h1 ~ div span, ._aa_q, [data-testid="user-description"]');
    const bio = bioEl ? bioEl.innerText : '';

    // Full name
    const nameEl = document.querySelector('h2, ._aacl._aacs._aact._aacx._aada, header h1');
    const fullName = nameEl ? nameEl.innerText : '';

    // All images on page
    const allImgs = Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      alt: img.alt,
      width: img.naturalWidth,
      height: img.naturalHeight
    })).filter(img => img.src && !img.src.includes('data:') && img.width > 100);

    return {
      profileImgUrl,
      stats,
      bio,
      fullName,
      allImgs: allImgs.slice(0, 20),
      bodyText: bodyText.slice(0, 3000),
      sharedData: sharedData ? JSON.stringify(sharedData).slice(0, 5000) : null
    };
  });

  console.log('Datos extraídos:', JSON.stringify(data, null, 2).slice(0, 2000));

  // Save data
  fs.writeFileSync('instagram-data.json', JSON.stringify(data, null, 2));

  // Download profile image if found
  if (data.profileImgUrl && data.profileImgUrl.startsWith('http')) {
    const assetsDir = path.join(__dirname, 'assets');
    if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);
    try {
      await downloadImage(data.profileImgUrl, path.join(assetsDir, 'profile.jpg'));
      console.log('Foto de perfil descargada');
    } catch(e) {
      console.log('No se pudo descargar la foto de perfil:', e.message);
    }
  }

  // Download post images
  const assetsDir = path.join(__dirname, 'assets');
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);

  const postImgs = data.allImgs.filter(img =>
    img.src.includes('instagram') &&
    !img.src.includes('profile') &&
    img.width > 200
  ).slice(0, 9);

  for (let i = 0; i < postImgs.length; i++) {
    try {
      await downloadImage(postImgs[i].src, path.join(assetsDir, `post-${i+1}.jpg`));
      console.log(`Post ${i+1} descargado`);
    } catch(e) {
      console.log(`Post ${i+1} no descargado:`, e.message);
    }
  }

  await browser.close();
  console.log('SCRAPING COMPLETADO');
})();
