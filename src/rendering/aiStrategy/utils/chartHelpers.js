import React from 'react';

// Helper to calculate milliseconds until the next HH:01:00
export function getMsUntilNextHourOOne() {
    const now = new Date();
    const next = new Date(now);

    next.setMinutes(1);
    next.setSeconds(0);
    next.setMilliseconds(0);

    if (now.getMinutes() >= 1) {
        next.setHours(now.getHours() + 1);
    }

    const diff = next.getTime() - now.getTime();
    return diff > 0 ? diff : 3600000;
}

export function formatPairCurrency(val, symbol) {
    if (typeof val !== 'number' || isNaN(val)) return '-';
    let symUpper = (symbol || '').toUpperCase().replace("/", "").replace(" ", "");
    if (symUpper.endsWith("JPY")) return val.toFixed(3);
    if (symUpper.includes("XAU") || symUpper.includes("GOLD") || symUpper.includes("XAG")) return val.toFixed(2);
    if (symUpper.includes("BTC")) return val.toFixed(2);
    if (symUpper.includes("NIFTY")) return val.toFixed(2);
    if (symUpper.length === 6) return val.toFixed(5);
    return val.toFixed(2);
}

export function generateFallbackCandles(symbol = 'XAUUSD', timeframe = '1H') {
    const candlesList = [];
    let basePrice = 4457.50;
    let step = 1.5;

    const symUpper = (symbol || '').toUpperCase().replace('/', '').replace(' ', '');
    if (symUpper.endsWith('JPY')) {
        basePrice = 155.25;
        step = 0.15;
    } else if (symUpper.includes('EUR') || symUpper === 'EURUSD') {
        basePrice = 1.16027;
        step = 0.0004;
    } else if (symUpper.includes('GBP') || symUpper === 'GBPUSD') {
        basePrice = 1.35431;
        step = 0.0005;
    } else if (symUpper.includes('USDCAD')) {
        basePrice = 1.36495;
        step = 0.0004;
    } else if (symUpper.includes('BTC')) {
        basePrice = 78562.99;
        step = 45.0;
    } else if (symUpper.includes('NIFTY')) {
        basePrice = 23500.00;
        step = 12.0;
    } else if (symUpper.includes('XAU') || symUpper.includes('GOLD')) {
        basePrice = 4457.58;
        step = 2.5;
    }

    const now = Math.floor(Date.now() / 1000);
    const count = 120;
    const interval = timeframe === '5M' ? 300 : timeframe === '15M' ? 900 : timeframe === '1D' ? 86400 : 3600;

    let currentPrice = basePrice - count * 0.15 * step;
    let ema20Val = currentPrice;
    let ema50Val = currentPrice;

    for (let i = 0; i < count; i++) {
        const time = now - (count - i) * interval;
        const change = (Math.random() - 0.47) * step * 2;
        const open = currentPrice;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * step * 0.8;
        const low = Math.min(open, close) - Math.random() * step * 0.8;
        const vol = Math.floor(Math.random() * 4000) + 1200;

        currentPrice = close;
        ema20Val = ema20Val * (1 - 2 / 21) + close * (2 / 21);
        ema50Val = ema50Val * (1 - 2 / 51) + close * (2 / 51);
        const supertrend_dir = close >= ema20Val ? 1 : -1;
        const supertrend_val = supertrend_dir === 1 ? low - step * 0.5 : high + step * 0.5;

        candlesList.push({
            time,
            open: Number(open.toFixed(4)),
            high: Number(high.toFixed(4)),
            low: Number(low.toFixed(4)),
            close: Number(close.toFixed(4)),
            tick_volume: vol,
            ema20: Number(ema20Val.toFixed(4)),
            ema50: Number(ema50Val.toFixed(4)),
            supertrend_value: Number(supertrend_val.toFixed(4)),
            supertrend_direction: supertrend_dir,
        });
    }
    return candlesList;
}

export function EyeToggleIcon({ visible, className }) {
    if (visible) {
        return (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
            </svg>
        );
    }
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
            <line x1="2" y1="2" x2="22" y2="22" />
        </svg>
    );
}
