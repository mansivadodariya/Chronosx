const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('1. Checking Landing Page /ar Header:');
  await page.goto('http://localhost:3000/ar', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const headerInfo = await page.evaluate(() => {
    const btn = document.querySelector('header button[aria-label="Select Language"]') || document.querySelector('button[aria-label="Select Language"]');
    const rect = btn.getBoundingClientRect();
    return {
      vw: window.innerWidth,
      btnRect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width }
    };
  });
  console.log('Header on Landing Page:', JSON.stringify(headerInfo, null, 2));

  console.log('2. Checking Dashboard /ar Topbar:');
  await context.addCookies([
    { name: 'auth_token', value: 'dummy_token', domain: 'localhost', path: '/' },
    { name: 'app_language', value: 'ar', domain: 'localhost', path: '/' }
  ]);
  await page.goto('http://localhost:3000/ar/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const topbarInfo = await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Select Language"]');
    const rect = btn.getBoundingClientRect();
    return {
      vw: window.innerWidth,
      btnRect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width }
    };
  });
  console.log('Topbar on Dashboard:', JSON.stringify(topbarInfo, null, 2));

  await browser.close();
})();
