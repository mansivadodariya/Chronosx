const http = require('http');

const routes = [
  '/',
  '/contact-us',
  '/about-us',
  '/plans',
  '/terms-and-conditions',
  '/privacy-policy',
  '/risk-disclosure',
  '/no-refund-policy',
  '/white-label',
  '/affiliate-program',
  '/economic-calendar',
  '/forex-calculator',
  '/market-news',
  '/blogs',
  '/login',
  '/signup',
  '/forgot-password'
];

const locales = ['en', 'ar', 'ary', 'es', 'ru', 'zh', 'vi', 'id', 'fil', 'arabic', 'spanish', 'chinese', 'russian'];

async function checkUrl(url) {
  return new Promise((resolve) => {
    http.get('http://localhost:3000' + url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (err) => resolve({ url, error: err.message }));
  });
}

async function testAll() {
  let failed = 0;
  let passed = 0;
  
  // 1. Direct URLs
  for (const r of routes) {
    const res = await checkUrl(r);
    if (res.status === 200) {
      passed++;
    } else {
      console.log('FAIL Direct:', r, res.status || res.error);
      failed++;
    }
  }

  // 2. Localized URLs (/en/contact-us, /ar/contact-us, etc.)
  for (const loc of locales) {
    for (const r of routes) {
      const locPath = r === '/' ? '/' + loc : '/' + loc + r;
      const res = await checkUrl(locPath);
      if (res.status === 200) {
        passed++;
      } else {
        console.log('FAIL Localized:', locPath, res.status || res.error);
        failed++;
      }
    }
  }

  console.log(`SUMMARY: ${passed} passed, ${failed} failed out of ${passed + failed} URLs tested.`);
}

testAll();
