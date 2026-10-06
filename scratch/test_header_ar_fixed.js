const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log('1. Navigating to /ar');
  await page.goto('http://localhost:3000/ar', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click close button on modal if present
  const closeBtn = page.locator('button:has-text("تخطي الجولة"), button[aria-label="Close"], .welcomeModal_closeBtn');
  if (await closeBtn.count() > 0) {
    await closeBtn.first().click().catch(() => {});
    await page.waitForTimeout(500);
  }

  // Open Language Toggle in Header
  console.log('2. Clicking language toggle in header');
  const langToggle = page.locator('header button[aria-label="Select Language"]');
  await langToggle.click();
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'scratch/dropdown_header_ar_fixed.png' });
  console.log('Screenshot saved to scratch/dropdown_header_ar_fixed.png');

  const positions = await page.evaluate(() => {
    const btn = document.querySelector('header button[aria-label="Select Language"]');
    const menu = document.querySelector('div[class*="dropdownMenu"]');
    return {
      btn: btn ? btn.getBoundingClientRect() : null,
      menu: menu ? menu.getBoundingClientRect() : null
    };
  });
  console.log('Positions:', JSON.stringify(positions, null, 2));

  await browser.close();
})();
