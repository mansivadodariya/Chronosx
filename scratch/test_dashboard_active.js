const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  // Set auth cookie so auth guard allows /dashboard
  await context.addCookies([
    { name: 'auth_token', value: 'dummy_token', domain: 'localhost', path: '/' },
    { name: 'app_language', value: 'ar', domain: 'localhost', path: '/' }
  ]);
  const page = await context.newPage();
  await page.goto('http://localhost:3000/ar/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const info = await page.evaluate(() => {
    const aside = document.querySelector('aside');
    const links = Array.from(document.querySelectorAll('aside a')).map(a => ({
      href: a.getAttribute('href'),
      text: a.textContent.trim(),
      active: a.getAttribute('data-active'),
      classList: a.className
    }));
    return {
      url: window.location.href,
      pathname: window.location.pathname,
      lang: document.documentElement.getAttribute('lang'),
      dir: document.documentElement.getAttribute('dir'),
      links
    };
  });

  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
