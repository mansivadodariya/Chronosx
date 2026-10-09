const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 900 });
        await page.goto('http://localhost:3000/en', { waitUntil: 'networkidle2', timeout: 30000 });
        
        await page.waitForTimeout(1500);

        const whatsappFound = await page.evaluate(() => {
            const el = document.querySelector('a[href*="wa.me"]');
            if (!el) return { found: false };
            const rect = el.getBoundingClientRect();
            return {
                found: true,
                href: el.getAttribute('href'),
                rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width, height: rect.height }
            };
        });

        console.log('WhatsApp Element Info:', JSON.stringify(whatsappFound, null, 2));

        // Scroll down to see back to top button
        await page.evaluate(() => window.scrollTo(0, 1000));
        await page.waitForTimeout(1000);

        const stackInfo = await page.evaluate(() => {
            const wa = document.querySelector('a[href*="wa.me"]');
            const notif = document.querySelector('[class*="bottomWidgetsStack"]');
            const btt = document.querySelector('button[aria-label*="Back to top"]');
            return {
                wa: wa ? wa.getBoundingClientRect() : null,
                notif: notif ? notif.getBoundingClientRect() : null,
                btt: btt ? btt.getBoundingClientRect() : null
            };
        });

        console.log('Stack Positions after scroll:', JSON.stringify(stackInfo, null, 2));

        await browser.close();
    } catch (err) {
        console.error('Test error:', err);
    }
})();
