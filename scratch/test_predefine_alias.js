const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addCookies([
    { name: 'auth_token', value: 'dummy_token', domain: 'localhost', path: '/' },
    { name: 'app_language', value: 'ar', domain: 'localhost', path: '/' }
  ]);
  const page = await context.newPage();

  console.log('1. Testing /ar/predefine-strategy redirect:');
  await page.goto('http://localhost:3000/ar/predefine-strategy', { waitUntil: 'networkidle' });
  console.log('Result URL:', page.url());

  console.log('2. Testing /en/predefine-strategy redirect:');
  await page.goto('http://localhost:3000/en/predefine-strategy', { waitUntil: 'networkidle' });
  console.log('Result URL:', page.url());

  const hasStrategyCards = await page.evaluate(() => {
    return document.querySelectorAll('button').length > 0;
  });
  console.log('Page interactive:', hasStrategyCards);

  await browser.close();
})();
