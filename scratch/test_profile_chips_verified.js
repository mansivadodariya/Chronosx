const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addCookies([
    { name: 'auth_token', value: 'dummy_token', domain: 'localhost', path: '/' },
    { name: 'app_language', value: 'ar', domain: 'localhost', path: '/' }
  ]);
  const page = await context.newPage();

  // Set mock trading profile in localStorage
  await page.addInitScript(() => {
    localStorage.setItem('trading_profile_data', JSON.stringify({
      has_saved_profile: true,
      preferences: {
        personal: { name: 'Mansi Vadodariya', experience_level: 'Beginner', trading_style: 'Scalping' },
        investment: { total_investment: 5000, monthly_top_up: 500 },
        risk: { risk_tolerance: 'Moderate', max_acceptable_drawdown: '15%' },
        goals: { profit_goal: 25000, monthly_return_target: '5%', timeframe: 12 },
        preferences: {
          preferred_currency_pairs: ['AUD/USD', 'EUR/USD', 'GBP/USD', 'USD/CHF'],
          preferred_trading_sessions: ['New York Session', 'London Session']
        }
      }
    }));
    localStorage.setItem('onboarding_survey_data', JSON.stringify({
      completed: true,
      experience: 'beginner',
      tradingStyles: ['scalping'],
      helpGoals: ['analyze_trades'],
      markets: ['gbp_usd', 'usd_chf', 'aud_usd', 'eur_usd']
    }));
  });

  console.log('Navigating to /ar/profile...');
  await page.goto('http://localhost:3000/ar/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Take screenshot of the profile page cards to verify
  await page.screenshot({ path: 'scratch/profile_ar_verified.png', fullPage: true });
  console.log('Screenshot saved to scratch/profile_ar_verified.png');

  await browser.close();
})();
