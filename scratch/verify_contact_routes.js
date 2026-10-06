const http = require('http');

async function test(path) {
  return new Promise(res => {
    http.get('http://localhost:3000' + path, r => {
      res({ path, status: r.statusCode, location: r.headers.location });
    }).on('error', e => res({ path, error: e.message }));
  });
}

(async () => {
  const tests = [
    '/',
    '/contact-us',
    '/ai-trade-advisor',
    '/about-us',
    '/plans',
    '/en',
    '/en/contact-us',
    '/en/ai-trade-advisor',
    '/ar/contact-us',
    '/zh/ai-trade-advisor',
    '/es/plans'
  ];
  for (const t of tests) {
    const result = await test(t);
    console.log(result.path, '=> status:', result.status, result.location ? `(redirects to: ${result.location})` : '');
  }
})();
