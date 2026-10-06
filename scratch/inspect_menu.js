const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/ar', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click toggle
  const toggleBtn = page.locator('button[aria-label="Select Language"]').first();
  await toggleBtn.click({ force: true });
  await page.waitForTimeout(500);

  const menuDetails = await page.evaluate(() => {
    const menu = document.querySelector('[class*="dropdownMenu"]');
    if (!menu) return 'NO MENU';
    const computed = window.getComputedStyle(menu);
    const rect = menu.getBoundingClientRect();
    return {
      rect,
      inlineStyle: menu.getAttribute('style'),
      left: computed.left,
      right: computed.right,
      position: computed.position,
      transform: computed.transform
    };
  });
  console.log('Menu Computed Details:', menuDetails);
  await browser.close();
})();
