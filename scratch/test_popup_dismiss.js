const { chromium } = require('@playwright/test');

(async () => {
    try {
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const page = await context.newPage();

        await page.goto('http://localhost:3000/en', { waitUntil: 'domcontentloaded' });
        // Clear previous test dismissals
        await page.evaluate(() => {
            localStorage.removeItem('chronosx_dismissed_updates');
            sessionStorage.removeItem('chronosx_popup_dismissed');
        });
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);

        // Check if popup appears
        const popupExists = await page.evaluate(() => {
            const popup = document.querySelector('[class*="popupContainer"]');
            const closeBtn = document.querySelector('button[title="Close all"]');
            const nextBtn = document.querySelector('[class*="markReadBtn"]');
            return {
                popup: Boolean(popup),
                closeBtn: Boolean(closeBtn),
                nextBtnText: nextBtn ? nextBtn.textContent.trim() : null
            };
        });

        console.log('Popup status with fresh storage:', popupExists);

        if (popupExists.closeBtn) {
            // 1. Test close all button
            await page.click('button[title="Close all"]');
            await page.waitForTimeout(600);

            const isClosed = await page.evaluate(() => {
                const popup = document.querySelector('[class*="popupContainer"]');
                const sessionDismissed = sessionStorage.getItem('chronosx_popup_dismissed');
                return {
                    popupInDom: Boolean(popup),
                    sessionDismissed
                };
            });

            console.log('After clicking Close all:', isClosed);

            // 2. Navigate to another page (e.g. /en/plans) to confirm it stays closed across pages
            await page.goto('http://localhost:3000/en/plans', { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(2500);

            const popupAfterNav = await page.evaluate(() => {
                return Boolean(document.querySelector('[class*="popupContainer"]'));
            });

            console.log('Popup visible after navigating to /en/plans (must be false):', popupAfterNav);
        }

        await browser.close();
    } catch (e) {
        console.error('Test error:', e);
    }
})();
