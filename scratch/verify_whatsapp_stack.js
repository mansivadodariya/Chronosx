const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
    try {
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const page = await context.newPage();

        await page.goto('http://localhost:3000/en', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);

        // Scroll down to activate back-to-top
        await page.evaluate(() => window.scrollTo(0, 1200));
        await page.waitForTimeout(1500);

        const measurements = await page.evaluate(() => {
            const wa = document.querySelector('a[href*="wa.me"]');
            const notif = document.querySelector('[class*="bottomWidgetsStack"]');
            const btt = document.querySelector('button[aria-label*="Back to top"]');
            const bttWrap = btt ? btt.closest('[class*="backToTopWrapper"]') : null;

            const vh = window.innerHeight;
            return {
                viewportHeight: vh,
                whatsapp: wa ? {
                    href: wa.getAttribute('href'),
                    rect: wa.getBoundingClientRect(),
                    distFromBottom: Math.round(vh - wa.getBoundingClientRect().bottom)
                } : null,
                notificationStack: notif ? {
                    className: notif.className,
                    rect: notif.getBoundingClientRect(),
                    distFromBottom: Math.round(vh - notif.getBoundingClientRect().bottom)
                } : null,
                backToTop: bttWrap ? {
                    className: bttWrap.className,
                    rect: bttWrap.getBoundingClientRect(),
                    distFromBottom: Math.round(vh - bttWrap.getBoundingClientRect().bottom)
                } : null
            };
        });

        console.log('=== STACK MEASUREMENTS ON /en ===');
        console.log(JSON.stringify(measurements, null, 2));

        const screenshotPath = path.resolve(__dirname, 'whatsapp_stack_verified.png');
        await page.screenshot({ path: screenshotPath, fullPage: false });
        console.log('Screenshot saved to:', screenshotPath);

        await browser.close();
    } catch (err) {
        console.error('Verification failed:', err);
    }
})();
