const { chromium } = require('@playwright/test');

(async () => {
    try {
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

        await page.goto('http://localhost:3000/en', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(4000);

        const res = await page.evaluate(() => {
            const html = document.body.innerHTML;
            const waWrapper = document.querySelector('[class*="whatsappWrapper"]');
            const waA = document.querySelector('a[href*="wa.me"]');
            const allA = Array.from(document.querySelectorAll('a')).map(a => a.href);
            const classes = Array.from(document.querySelectorAll('*')).map(el => el.className).filter(c => typeof c === 'string' && (c.includes('whatsapp') || c.includes('bottomWidgets')));
            return {
                waWrapper: Boolean(waWrapper),
                waA: Boolean(waA),
                foundClasses: classes,
                pathname: window.location.pathname
            };
        });

        console.log('Result:', res);
        await browser.close();
    } catch (e) {
        console.error(e);
    }
})();
