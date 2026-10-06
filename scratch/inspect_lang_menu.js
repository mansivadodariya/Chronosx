const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('has_visited_chronosx', 'true');
    localStorage.setItem('visited', 'true');
    sessionStorage.setItem('welcome_seen', 'true');
  });

  await page.goto('http://localhost:3000/ar', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Close modal if present
  try {
    await page.evaluate(() => {
      const modal = document.querySelector('[class*="welcomeModal"]');
      if (modal) modal.remove();
      const backdrop = document.querySelector('[class*="backdrop"]');
      if (backdrop) backdrop.remove();
    });
  } catch (_) {}

  // Dispatch click directly via DOM
  const btnBox = await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Select Language"]');
    if (!btn) return null;
    const rect = btn.getBoundingClientRect();
    btn.click();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
  console.log('Language Button BoundingBox:', btnBox);
  await page.waitForTimeout(400);

  const menuDetails = await page.evaluate(() => {
    // Find the language dropdown specifically
    const menu = document.querySelector('div[class*="languageToggle_dropdownMenu"]');
    if (!menu) return 'NO LANGUAGE MENU';
    const computed = window.getComputedStyle(menu);
    const rect = menu.getBoundingClientRect();
    return {
      rect,
      inlineStyle: menu.getAttribute('style'),
      left: computed.left,
      right: computed.right,
      position: computed.position,
      zIndex: computed.zIndex
    };
  });
  console.log('Language Menu Computed Details:', JSON.stringify(menuDetails, null, 2));

  if (menuDetails && menuDetails.rect) {
    const diff = Math.abs(menuDetails.rect.left - btnBox.x);
    console.log('Horizontal alignment diff (Menu Left vs Button Left):', diff);
    if (diff < 50) {
      console.log('✅ PASS: Language dropdown is correctly aligned right beneath the toggle button in RTL mode!');
    } else {
      console.log('❌ FAIL: Language dropdown is misaligned!');
    }
  }

  await browser.close();
})();
