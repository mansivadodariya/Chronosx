const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });

  // 1. Landing Page LTR (/en)
  console.log('1. Landing Page /en:');
  const page1 = await context.newPage();
  await page1.goto('http://localhost:3000/en', { waitUntil: 'domcontentloaded' });
  await page1.waitForTimeout(1000);

  // Close welcome modal if present
  await page1.evaluate(() => {
    const modal = document.querySelector('[class*="welcomeModal"]');
    if (modal) modal.remove();
  });

  const langBtn1 = page1.locator('header button[aria-label="Select Language"]');
  await langBtn1.click();
  await page1.waitForTimeout(500);

  const pos1 = await page1.evaluate(() => {
    const btn = document.querySelector('header button[aria-label="Select Language"]')?.getBoundingClientRect();
    const menu = document.querySelector('div[class*="dropdownMenu"]')?.getBoundingClientRect();
    return { btn, menu };
  });
  console.log('LTR Landing Page Positions:', JSON.stringify(pos1, null, 2));
  await page1.screenshot({ path: 'scratch/dropdown_pos_en_landing.png' });

  // 2. Landing Page RTL (/ar)
  console.log('2. Landing Page /ar:');
  const page2 = await context.newPage();
  await page2.goto('http://localhost:3000/ar', { waitUntil: 'domcontentloaded' });
  await page2.waitForTimeout(1000);

  await page2.evaluate(() => {
    const modal = document.querySelector('[class*="welcomeModal"]');
    if (modal) modal.remove();
  });

  const langBtn2 = page2.locator('header button[aria-label="Select Language"]');
  await langBtn2.click();
  await page2.waitForTimeout(500);

  const pos2 = await page2.evaluate(() => {
    const btn = document.querySelector('header button[aria-label="Select Language"]')?.getBoundingClientRect();
    const menu = document.querySelector('div[class*="dropdownMenu"]')?.getBoundingClientRect();
    return { btn, menu };
  });
  console.log('RTL Landing Page Positions:', JSON.stringify(pos2, null, 2));
  await page2.screenshot({ path: 'scratch/dropdown_pos_ar_landing.png' });

  await browser.close();
})();
