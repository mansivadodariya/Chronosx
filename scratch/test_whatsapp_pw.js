const { chromium } = require('@playwright/test');

(async () => {
    try {
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const page = await context.newPage();
        
        await page.goto('http://localhost:3000/en', { waitUntil: 'load', timeout: 30000 });
        await page.waitForTimeout(2000);

        const waData = await page.evaluate(() => {
            const wa = document.querySelector('a[href*="wa.me"]');
            if (!wa) return null;
            const r = wa.getBoundingClientRect();
            return { href: wa.getAttribute('href'), top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
        });

        console.log('WhatsApp data on /en:', waData);

        // Scroll down
        await page.evaluate(() => window.scrollTo(0, 1000));
        await page.waitForTimeout(1000);

        const allStack = await page.evaluate(() => {
            const wa = document.querySelector('a[href*="wa.me"]');
            const notif = document.querySelector('[class*="bottomWidgetsStack"]');
            const btt = document.querySelector('button[aria-label*="Back to top"]');
            return {
                wa: wa ? { bottom: window.innerHeight - wa.getBoundingClientRect().bottom } : null,
                notif: notif ? { bottom: window.innerHeight - notif.getBoundingClientRect().bottom } : null,
                btt: btt ? { bottom: window.innerHeight - btt.getBoundingClientRect().bottom } : null
            };
        });

        console.log('Distances from viewport bottom:', allStack);

        await browser.close();
    } catch (e) {
        console.error('Playwright test failed:', e);
    }
})();
