const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/ar', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Dismiss welcome modal if present
  try {
    const closeBtn = page.locator('button[class*="close"], [class*="modalClose"], button[aria-label="Close"]');
    if (await closeBtn.count() > 0) {
      await closeBtn.first().click();
      await page.waitForTimeout(300);
    }
  } catch (_) {}

  // Find language button
  const toggleBtn = await page.locator('button[aria-label="Select Language"]');
  if (await toggleBtn.count() > 0) {
    const btnBox = await toggleBtn.first().boundingBox();
    console.log('Button Box:', btnBox);

    await toggleBtn.first().click({ force: true });
    await page.waitForTimeout(500);

    const dropdown = await page.locator('[class*="dropdownMenu"]');
    const menuBox = await dropdown.first().boundingBox();
    console.log('Dropdown Box:', menuBox);

    const diff = Math.abs(menuBox.x - btnBox.x);
    console.log('Difference between Button X and Dropdown X:', diff);
    if (diff < 50) {
      console.log('✅ PASS: Dropdown opened directly aligned under the button in RTL mode!');
    } else {
      console.log('❌ FAIL: Dropdown opened far away from button!');
    }
  } else {
    console.log('No toggle button found');
  }

  await browser.close();
})();
