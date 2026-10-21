export const STEP_TITLES = [
    'Market & Timeframe',
    'Strategy Requirements',
    'Risk & Execution',
    'Strategy Blueprint'
];

export const DYNAMIC_LOADING_STAGES = [
    'Formulating quantitative trading blueprint...',
    'Synthesizing indicators & technical signals...',
    'Optimizing entry triggers and risk parameters (SL/TP)...',
    'Compiling algorithmic strategy rules...'
];

export function getDynamicStepInfo(msg, allMessages) {
    if (!msg || msg.isError || msg.role === 'user') return null;

    // If step is null or not provided from backend, do not show step progress bar (must not be static)
    const rawStep = msg.step ?? msg.step_number;
    const hasValidStepNum = rawStep != null && rawStep !== '' && !isNaN(parseInt(rawStep, 10)) && parseInt(rawStep, 10) > 0;
    const hasValidBadge = Boolean(msg.step_badge && typeof msg.step_badge === 'string' && msg.step_badge.trim());

    if (!hasValidStepNum && !hasValidBadge) {
        return null;
    }

    if (hasValidBadge) {
        const match = msg.step_badge.match(/Step\s*(\d+)/i);
        const stepNum = match ? parseInt(match[1], 10) : (hasValidStepNum ? parseInt(rawStep, 10) : 1);
        const title = msg.step_title || msg.step_badge.replace(/^Step\s*\d+:\s*/i, '') || STEP_TITLES[stepNum - 1] || 'Strategy Configuration';
        const total = msg.total_steps || 4;
        const progress = Math.min(100, Math.max(12, Math.round((stepNum / total) * 100)));
        return { stepNum, total, title, badgeText: `Step ${stepNum}: ${title}`, progress };
    }

    const stepNum = parseInt(rawStep, 10);
    const total = msg.total_steps || 4;
    const title = msg.step_title || STEP_TITLES[stepNum - 1] || 'Strategy Configuration';
    const progress = Math.min(100, Math.max(12, Math.round((stepNum / total) * 100)));
    return { stepNum, total, title, badgeText: `Step ${stepNum}: ${title}`, progress };
}

export function formatOptionLabelWithIcon(label) {
    if (!label || typeof label !== 'string') return label;
    const trimmed = label.trim();
    if (/^[\p{Emoji}\u200d\ufe0f]/u.test(trimmed)) {
        return trimmed;
    }
    const upper = trimmed.toUpperCase();
    let icon = '';
    if (upper.includes('XAU') || upper.includes('GOLD')) icon = '[GOLD]';
    else if (upper.includes('EURUSD')) icon = '[EUR]';
    else if (upper.includes('EURJPY')) icon = '[EUR]';
    else if (upper.includes('GBPJPY')) icon = '[JPY]';
    else if (upper.includes('GBPUSD')) icon = '[GBP]';
    else if (upper.includes('USDCAD') || upper.includes('USDCHF')) icon = '[EUR]';
    else if (upper.includes('USDJPY')) icon = '[JPY]';
    else if (upper.includes('AUDUSD') || upper.includes('NZDUSD')) icon = '[EUR]';
    else if (upper.includes('EUR')) icon = '[EUR]';
    else if (upper.includes('GBP')) icon = '[GBP]';
    else if (upper.includes('JPY')) icon = '[JPY]';
    else if (upper.includes('BTC') || upper.includes('ETH') || upper.includes('SOL') || upper.includes('CRYPTO')) icon = '[CRYPTO]';
    else if (upper.includes('15M') || upper.includes('15 MIN')) icon = '[TF]';
    else if (upper.includes('1H') || upper.includes('1 HOUR') || upper.includes('60 MIN')) icon = '[TF]';
    else if (upper.includes('4H') || upper.includes('4 HOUR') || upper.includes('1D') || upper.includes('DAILY')) icon = '[TF]';
    else if (upper.includes('EMA') || upper.includes('SMA') || upper.includes('CROSS')) icon = '[IND]';
    else if (upper.includes('RSI') || upper.includes('MACD') || upper.includes('BOUNCE')) icon = '[IND]';
    else if (upper.includes('BREAKOUT')) icon = '[SETUP]';
    else if (upper.includes('BOTH')) icon = '[DIR]';
    else if (upper.includes('LONG')) icon = '[IND]';
    else if (upper.includes('SHORT')) icon = '[DIR]';
    else if (upper.includes('SWING') || upper.includes('ATR') || upper.includes('PIPS')) icon = '[RISK]';
    else if (upper.includes('RISK') || upper.includes('%')) icon = '[RISK]';

    if (icon) {
        return `${icon} ${trimmed}`;
    }
    return trimmed;
}

export function getTradingOptionDescription(val = '', lbl = '') {
    const s = `${val} ${lbl}`.toUpperCase();
    if (s.includes('EURUSD')) return 'Euro / US Dollar – High liquidity & tightest spread';
    if (s.includes('XAU') || s.includes('GOLD')) return 'Gold / US Dollar – Explosive momentum & wide pip ranges';
    if (s.includes('GBPUSD')) return 'British Pound / US Dollar – Strong intraday volatility';
    if (s.includes('GBPJPY')) return 'British Pound / Japanese Yen – Dynamic trending moves';
    if (s.includes('EURJPY')) return 'Euro / Japanese Yen – Strong volatility & trend runs';
    if (s.includes('USDCAD')) return 'US Dollar / Canadian Dollar – Steady institutional trends';
    if (s.includes('USDJPY')) return 'US Dollar / Japanese Yen – Deep institutional liquidity';
    if (s.includes('AUDUSD')) return 'Australian Dollar / US Dollar – Commodity correlation & steady ranges';
    if (s.includes('NZDUSD')) return 'New Zealand Dollar / US Dollar – Institutional liquidity';
    if (s.includes('EURGBP')) return 'Euro / British Pound – European monetary corridor';
    if (s.includes('BTCUSD') || s.includes('BTC')) return 'Bitcoin / US Dollar – High 24/7 institutional crypto volatility';
    if (s.includes('ETHUSD') || s.includes('ETH')) return 'Ethereum / US Dollar – Smart-contract ecosystem driver';
    if (s.includes('NAS100') || s.includes('NASDAQ') || s.includes('US100')) return 'Nasdaq 100 – High beta technology equity index';
    if (s.includes('US30')) return 'Dow Jones 30 – Institutional blue-chip industrial momentum';
    if (s.includes('15 MIN') || s.includes('15M')) return '15-minute timeframe – High-frequency intraday momentum';
    if (s.includes('1 HOUR') || s.includes('1H') || s.includes('60 MIN')) return '1-hour timeframe – Balanced intraday and swing trends';
    if (s.includes('4 HOUR') || s.includes('4H')) return '4-hour timeframe – Macro trend-following and key levels';
    if (s.includes('1 DAY') || s.includes('1D') || s.includes('DAILY')) return 'Daily timeframe – Strong macro structural trends';
    if (s.includes('EMA')) return 'Exponential Moving Average – Trend and momentum crossover';
    if (s.includes('RSI')) return 'Relative Strength Index – Overbought / oversold oscillator';
    if (s.includes('MACD')) return 'Moving Average Convergence Divergence – Signal momentum';
    if (s.includes('BREAKOUT')) return 'Volatility expansion beyond dynamic support/resistance';
    if (s.includes('BOTH')) return 'Execute both Long and Short orders based on trigger conditions';
    if (s.includes('LONG')) return 'Only take Long (Buy) positions';
    if (s.includes('SHORT')) return 'Only take Short (Sell) positions';
    if (s.includes('LAST SWING')) return 'Dynamic stop based on recent swing high/low';
    if (s.includes('20 PIPS')) return 'Fixed 20 pips risk protection buffer';
    if (s.includes('1.5 ATR')) return 'Adaptive Average True Range volatility distance';
    if (s.includes('2 X MY RISK') || s.includes('2 × MY RISK')) return '1:2 Risk to Reward target ratio';
    if (s.includes('SESSION CLOSE')) return 'Exit all positions at the end of the active trading session';
    if (s.includes('1%')) return 'Standard 1.0% account equity risk per trade';
    if (s.includes('0.5%')) return 'Conservative 0.5% risk profile';
    if (s.includes('2%')) return 'Aggressive 2.0% growth risk allocation';
    return '';
}
