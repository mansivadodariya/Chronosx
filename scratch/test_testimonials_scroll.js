const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/ar', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => {
    const el = document.querySelector('section[class*="testimonials"]');
    if (el) el.scrollIntoView();
  });
  await page.waitForTimeout(2500);
  
  const cardCount = await page.evaluate(() => {
    return document.querySelectorAll('div[class*="card"]').length;
  });
  console.log('✅ Testimonial cards present in DOM after auto-scroll:', cardCount);
  
  await browser.close();
})();
