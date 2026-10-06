const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addCookies([
    { name: 'auth_token', value: 'dummy_token', domain: 'localhost', path: '/' },
    { name: 'app_language', value: 'ar', domain: 'localhost', path: '/' }
  ]);
  const page = await context.newPage();
  
  console.log('1. Navigating to /ar/dashboard');
  await page.goto('http://localhost:3000/ar/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  console.log('Current URL:', page.url());

  // Click Language Toggle
  console.log('2. Clicking language toggle');
  const toggleBtn = page.locator('button[aria-label="Select Language"]');
  await toggleBtn.click();
  await page.waitForTimeout(500);

  // Click English option
  console.log('3. Selecting English');
  const englishOption = page.locator('button:has-text("English")').first();
  await englishOption.click();
  await page.waitForTimeout(2000);

  console.log('URL after English selection:', page.url());
  const state = await page.evaluate(() => {
    const cookies = document.cookie;
    const langAttr = document.documentElement.getAttribute('lang');
    const dirAttr = document.documentElement.getAttribute('dir');
    const dashboardLink = document.querySelector('aside a[href*="dashboard"]');
    return {
      url: window.location.href,
      pathname: window.location.pathname,
      cookies,
      langAttr,
      dirAttr,
      dashboardActive: dashboardLink?.getAttribute('data-active'),
      dashboardHref: dashboardLink?.getAttribute('href')
    };
  });
  console.log('State:', JSON.stringify(state, null, 2));

  await browser.close();
})();
