const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addCookies([
    { name: 'auth_token', value: 'dummy_token', domain: 'localhost', path: '/' },
    { name: 'app_language', value: 'zh', domain: 'localhost', path: '/' }
  ]);
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/zh/dashboard...');
  await page.goto('http://localhost:3000/zh/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click Language Toggle
  console.log('Opening language dropdown...');
  const toggleBtn = page.locator('button[aria-label="Select Language"]');
  await toggleBtn.click();
  await page.waitForTimeout(500);

  // Check bounding boxes of dropdownMenu and activeOption
  const bounds = await page.evaluate(() => {
    const menu = document.querySelector('div[class*="dropdownMenu"]');
    const activeOpt = document.querySelector('button[class*="activeOption"]');
    const allOpts = Array.from(document.querySelectorAll('button[class*="dropdownOption"]')).map(b => {
      const rect = b.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      return {
        text: b.textContent.trim(),
        rightOverflow: rect.right > menuRect.right + 1,
        leftOverflow: rect.left < menuRect.left - 1,
        rect: { left: rect.left, right: rect.right, width: rect.width },
        menuRect: { left: menuRect.left, right: menuRect.right, width: menuRect.width }
      };
    });

    return {
      menuRect: menu ? menu.getBoundingClientRect() : null,
      activeOptRect: activeOpt ? activeOpt.getBoundingClientRect() : null,
      options: allOpts
    };
  });

  console.log('Dropdown layout test results:', JSON.stringify(bounds, null, 2));

  // Take screenshot of language dropdown
  await page.screenshot({ path: 'scratch/lang_dropdown_zh_fixed.png' });
  console.log('Screenshot saved to scratch/lang_dropdown_zh_fixed.png');

  await browser.close();
})();
