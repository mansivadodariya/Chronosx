const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/ar', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  const footerInfo = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    if (!footer) return null;
    const regLine = footer.querySelector('div[class*="companyRegLine"]');
    const h4 = footer.querySelector('h4');
    const brandDesc = footer.querySelector('p[class*="brandDesc"]');
    return {
      regText: regLine ? regLine.textContent.trim() : null,
      regDir: regLine ? regLine.getAttribute('dir') : null,
      h4Align: h4 ? window.getComputedStyle(h4).textAlign : null,
      brandDescAlign: brandDesc ? window.getComputedStyle(brandDesc).textAlign : null
    };
  });
  console.log('✅ Footer RTL Verification:', JSON.stringify(footerInfo, null, 2));
  await browser.close();
})();
