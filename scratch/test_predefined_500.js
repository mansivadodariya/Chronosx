const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addCookies([
    { name: 'auth_token', value: 'dummy_token', domain: 'localhost', path: '/' },
    { name: 'app_language', value: 'ar', domain: 'localhost', path: '/' }
  ]);
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message, err.stack));
  page.on('requestfailed', req => console.log('REQUEST FAILED:', req.url(), req.failure()?.errorText));

  console.log('Navigating to /ar/predefined-strategies...');
  const res = await page.goto('http://localhost:3000/ar/predefined-strategies', { waitUntil: 'networkidle' });
  console.log('Status code:', res.status());
  await page.waitForTimeout(2000);

  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Body snippet:\n', bodyText.slice(0, 500));

  await browser.close();
})();
