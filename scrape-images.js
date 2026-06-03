const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const HANDLE = 'alexabreutz';

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    const req = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
        'Referer': 'https://www.instagram.com/'
      }
    }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        fs.unlink(dest, () => {});
        downloadImage(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });
    req.on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
    req.setTimeout(15000, () => {
      req.abort();
      reject(new Error('Timeout'));
    });
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  // Capture all network requests with images
  const imageUrls = new Set();
  page.on('response', async (response) => {
    const url = response.url();
    const contentType = response.headers()['content-type'] || '';
    if (contentType.includes('image') && url.includes('instagram')) {
      imageUrls.add(url);
    }
  });

  await page.goto(`https://www.instagram.com/${HANDLE}/`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Extract all image sources
  const imgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      srcset: img.srcset,
      alt: img.alt,
      width: img.naturalWidth,
      height: img.naturalHeight
    }));
  });

  console.log('Imágenes encontradas en la página:', imgs.length);
  imgs.forEach(img => console.log(` - ${img.width}x${img.height} ${img.src.slice(0, 100)}`));

  console.log('\nImagenes capturadas por red:', imageUrls.size);
  Array.from(imageUrls).forEach(url => console.log(' - ' + url.slice(0, 120)));

  // Save all image URLs
  const allUrls = [...new Set([
    ...imgs.map(i => i.src).filter(s => s && s.startsWith('http')),
    ...Array.from(imageUrls)
  ])];

  fs.writeFileSync('image-urls.json', JSON.stringify(allUrls, null, 2));

  const assetsDir = path.join(__dirname, 'assets');
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);

  // Download profile picture (usually the largest img)
  const profileImgs = imgs.filter(i => i.width >= 50 && i.src.includes('instagram'));
  console.log('\nPerfil candidatos:', profileImgs.length);

  for (let i = 0; i < Math.min(profileImgs.length, 3); i++) {
    const dest = path.join(assetsDir, `profile-candidate-${i}.jpg`);
    try {
      await downloadImage(profileImgs[i].src, dest);
      console.log(`Descargado candidate ${i}: ${profileImgs[i].width}x${profileImgs[i].height}`);
    } catch(e) {
      console.log(`Fallo candidate ${i}:`, e.message);
    }
  }

  // Download post images from network capture
  const postUrls = Array.from(imageUrls).filter(u =>
    !u.includes('rsrc.php') && u.includes('instagram')
  );
  console.log('\nPost images de red:', postUrls.length);
  for (let i = 0; i < Math.min(postUrls.length, 9); i++) {
    const dest = path.join(assetsDir, `post-net-${i+1}.jpg`);
    try {
      await downloadImage(postUrls[i], dest);
      console.log(`Post ${i+1} descargado`);
    } catch(e) {
      console.log(`Post ${i+1} fallo:`, e.message);
    }
  }

  await browser.close();
  console.log('\nDONE');
})();
