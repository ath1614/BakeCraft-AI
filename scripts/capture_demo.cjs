const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  const assetsDir = path.join('/Users/ath1614/Dadi-s-Dawai-Diary/BakeCraft-AI/docs/assets');
  fs.mkdirSync(assetsDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 950 },
    deviceScaleFactor: 2, // Retina 2x high resolution
    recordVideo: {
      dir: assetsDir,
      size: { width: 1400, height: 950 }
    }
  });

  const page = await context.newPage();
  console.log('Navigating to BakeCraft AI...');
  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Dashboard Loaded
  console.log('Capturing bakecraft_studio_loaded.png...');
  await page.screenshot({ path: path.join(assetsDir, 'bakecraft_studio_loaded.png') });

  // 2. Click Brioche Buns
  console.log('Selecting Brioche Buns...');
  await page.click('button[data-preset="brown-butter-brioche-buns"]');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(assetsDir, 'brioche_buns_loaded.png') });

  // 3. Click Celebration Cake
  console.log('Selecting Celebration Cake...');
  await page.click('button[data-preset="vanilla-bean-celebration-cake"]');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(assetsDir, 'celebration_cake_loaded.png') });

  // 4. Click Luxe Macarons
  console.log('Selecting Luxe Macarons...');
  await page.click('button[data-preset="raspberry-rose-macarons-12"]');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(assetsDir, 'luxe_macarons_loaded.png') });

  // 5. Back to Sourdough Batard & Batch Scaled 3x
  console.log('Selecting Sourdough Batard and scaling 3x...');
  await page.click('button[data-preset="artisan-sourdough-batard"]');
  await page.waitForTimeout(500);
  await page.click('button[data-mult="3.0"]');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(assetsDir, 'sourdough_scaled_3x.png') });

  // 6. Scroll down to show FDA Label and Social Drop
  console.log('Capturing FDA Label & Social Copy...');
  await page.evaluate(() => window.scrollBy(0, 480));
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(assetsDir, 'fda_label_and_social.png') });

  // 7. Click Chalkboard Menu tab
  console.log('Clicking Chalkboard Menu...');
  await page.click('button[data-social="chalkboard"]');
  await page.waitForTimeout(500);

  // 8. Click Pre-Order DM tab
  console.log('Clicking Pre-Order DM...');
  await page.click('button[data-social="dm"]');
  await page.waitForTimeout(500);

  // 9. Back to Instagram and click Copy
  await page.click('button[data-social="instagram"]');
  await page.waitForTimeout(500);
  await page.click('#btn-copy-social');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(assetsDir, 'toast_and_social.png') });

  await page.close();
  await context.close();
  await browser.close();

  // Find the recorded video and rename
  const files = fs.readdirSync(assetsDir);
  const videoFile = files.find(f => f.endsWith('.webm'));
  if (videoFile) {
    fs.copyFileSync(path.join(assetsDir, videoFile), path.join(assetsDir, 'bakecraft_demo.webm'));
    console.log('Video saved as bakecraft_demo.webm');
  }

  console.log('All screenshots and video captured successfully!');
}

run().catch(err => {
  console.error('Error running script:', err);
  process.exit(1);
});
