const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addCookies([
    { name: 'auth_token', value: 'dummy_token', domain: 'localhost', path: '/' },
    { name: 'app_language', value: 'ar', domain: 'localhost', path: '/' }
  ]);
  const page = await context.newPage();

  console.log('Navigating to /ar/profile...');
  await page.goto('http://localhost:3000/ar/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const chipsInfo = await page.evaluate(() => {
    // Check preferred pairs chips
    const pairChips = Array.from(document.querySelectorAll('span')).filter(s => s.textContent.includes('USD') || s.textContent.includes('Session'));
    return pairChips.map(c => ({
      text: c.textContent.trim(),
      width: c.getBoundingClientRect().width,
      height: c.getBoundingClientRect().height,
      svgCount: c.querySelectorAll('svg').length
    }));
  });

  console.log('Chips found:', JSON.stringify(chipsInfo, null, 2));

  // Take screenshot of the profile page cards to verify
  await page.screenshot({ path: 'scratch/profile_ar_test.png', fullPage: true });
  console.log('Screenshot saved to scratch/profile_ar_test.png');

  await browser.close();
})();
