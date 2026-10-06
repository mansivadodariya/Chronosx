const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });

  await context.addInitScript(() => {
    localStorage.setItem('chronosx_welcome_modal_dismissed', 'true');
    localStorage.setItem('chronosx_welcome_seen', 'true');
    sessionStorage.setItem('welcome_modal_shown', 'true');
  });

  // 1. Landing Page RTL (/ar)
  console.log('1. Landing Page /ar');
  const page1 = await context.newPage();
  await page1.goto('http://localhost:3000/ar', { waitUntil: 'networkidle' });
  await page1.waitForTimeout(1000);
  
  // Close any modal if visible
  await page1.evaluate(() => {
    const modal = document.querySelector('.welcomeModal_backdrop__sHlTU');
    if (modal) modal.remove();
  });

  await page1.locator('header button[aria-label="Select Language"]').click();
  await page1.waitForTimeout(500);
  await page1.screenshot({ path: 'scratch/dropdown_landing_ar.png' });
  console.log('Saved scratch/dropdown_landing_ar.png');

  // 2. Landing Page LTR (/en)
  console.log('2. Landing Page /en');
  const page2 = await context.newPage();
  await page2.goto('http://localhost:3000/en', { waitUntil: 'networkidle' });
  await page2.waitForTimeout(1000);

  await page2.evaluate(() => {
    const modal = document.querySelector('.welcomeModal_backdrop__sHlTU');
    if (modal) modal.remove();
  });

  await page2.locator('header button[aria-label="Select Language"]').click();
  await page2.waitForTimeout(500);
  await page2.screenshot({ path: 'scratch/dropdown_landing_en.png' });
  console.log('Saved scratch/dropdown_landing_en.png');

  // 3. Dashboard RTL (/ar/dashboard)
  console.log('3. Dashboard /ar/dashboard');
  await context.addCookies([
    { name: 'auth_token', value: 'dummy_token', domain: 'localhost', path: '/' },
    { name: 'app_language', value: 'ar', domain: 'localhost', path: '/' }
  ]);
  const page3 = await context.newPage();
  await page3.goto('http://localhost:3000/ar/dashboard', { waitUntil: 'domcontentloaded' });
  await page3.waitForTimeout(1500);
  await page3.locator('button[aria-label="Select Language"]').click();
  await page3.waitForTimeout(500);
  await page3.screenshot({ path: 'scratch/dropdown_dashboard_ar.png' });
  console.log('Saved scratch/dropdown_dashboard_ar.png');

  await browser.close();
})();
