const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/ar', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const diag = await page.evaluate(() => {
    const docDir = document.documentElement.getAttribute('dir');
    const docDirProp = document.dir;
    const isRtl = docDir === 'rtl' || docDirProp === 'rtl';
    const btn = document.querySelector('button[aria-label="Select Language"]');
    const rect = btn ? btn.getBoundingClientRect() : null;
    return { docDir, docDirProp, isRtl, rect, vw: window.innerWidth };
  });
  console.log('Diagnosis:', diag);
  await browser.close();
})();
