export const STEPS = [
    { id: 1, label: 'Basics', icon: 'sliders' },
    { id: 2, label: 'Entry Rules', icon: 'pulse' },
    { id: 3, label: 'Exit Rules', icon: 'target' },
    { id: 4, label: 'Risk', icon: 'shield' },
    { id: 5, label: 'Review', icon: 'eye' }
];

export const TRADING_PAIRS = [
    { value: 'EUR/USD', label: 'EUR/USD', category: 'Forex' },
    { value: 'GBP/USD', label: 'GBP/USD', category: 'Forex' },
    { value: 'USD/JPY', label: 'USD/JPY', category: 'Forex' },
    { value: 'AUD/USD', label: 'AUD/USD', category: 'Forex' },
    { value: 'USD/CAD', label: 'USD/CAD', category: 'Forex' },
    { value: 'XAU/USD', label: 'XAU/USD (Gold)', category: 'Commodities' },
    { value: 'BTC/USD', label: 'BTC/USD (Bitcoin)', category: 'Crypto' },
    { value: 'ETH/USD', label: 'ETH/USD (Ethereum)', category: 'Crypto' },
    { value: 'US30', label: 'US30 (Dow Jones)', category: 'Indices' },
    { value: 'NAS100', label: 'NAS100 (Nasdaq)', category: 'Indices' }
];

export const TIMEFRAMES = [
    { value: '1m', label: '1 Minute (M1)' },
    { value: '5m', label: '5 Minutes (M5)' },
    { value: '15m', label: '15 Minutes (M15)' },
    { value: '1h', label: '1 Hour (H1)' },
    { value: '4h', label: '4 Hours (H4)' },
    { value: '1d', label: '1 Day (D1)' }
];

export const INDICATOR_DEFINITIONS = {
    ema_crossover: {
        name: 'EMA Crossover',
        desc: 'Exponential Moving Average crossover — trend direction signals',
        conditions: [
            'Golden Cross (Fast > Slow)',
            'Death Cross (Fast < Slow)',
            'Price Above EMA',
            'Price Below EMA'
        ],
        defaultParams: {
            fastPeriod: 9,
            slowPeriod: 21
        },
        paramLabels: {
            fastPeriod: 'Fast Period',
            slowPeriod: 'Slow Period'
        }
    }
};

export function getConditionParams(condition) {
    if (condition?.includes('Price Above') || condition?.includes('Price Below')) {
        return {
            defaultParams: { fastPeriod: 20 },
            paramLabels: { fastPeriod: 'EMA Period' }
        };
    }
    return {
        defaultParams: { fastPeriod: 9, slowPeriod: 21 },
        paramLabels: { fastPeriod: 'Fast Period', slowPeriod: 'Slow Period' }
    };
}

export function validateEntryCondition(cond) {
    if (!cond) return null;
    const { condition, params = {} } = cond;
    const isSingle = condition?.includes('Price Above') || condition?.includes('Price Below');
    const fast = Number(params.fastPeriod);
    const slow = Number(params.slowPeriod);

    if (isSingle) {
        if (!params.fastPeriod || isNaN(fast) || fast < 1) {
            return 'EMA Period must be at least 1';
        }
        if (fast > 1000) {
            return 'EMA Period cannot exceed 1000';
        }
        return null;
    }

    if (!params.fastPeriod || isNaN(fast) || fast < 1) {
        return 'Fast Period must be at least 1';
    }
    if (fast > 500) {
        return 'Fast Period cannot exceed 500';
    }
    if (!params.slowPeriod || isNaN(slow) || slow < 2) {
        return 'Slow Period must be at least 2';
    }
    if (slow > 1000) {
        return 'Slow Period cannot exceed 1000';
    }
    if (fast >= slow) {
        return `Fast Period (${fast}) must be less than Slow Period (${slow})`;
    }
    return null;
}

export const RISK_LEVELS = [
    {
        id: 'low',
        title: 'Low',
        subtitle: 'Conservative',
        lotSize: 0.05,
        maxOpen: 2,
        riskPerTrade: 1,
        maxDailyLoss: 3
    },
    {
        id: 'medium',
        title: 'Medium',
        subtitle: 'Balanced',
        lotSize: 0.1,
        maxOpen: 3,
        riskPerTrade: 2,
        maxDailyLoss: 5
    },
    {
        id: 'high',
        title: 'High',
        subtitle: 'Aggressive',
        lotSize: 0.5,
        maxOpen: 5,
        riskPerTrade: 4,
        maxDailyLoss: 10
    },
    {
        id: 'aggressive',
        title: 'Aggressive',
        subtitle: 'Most open to trade',
        lotSize: 1.0,
        maxOpen: 8,
        riskPerTrade: 6,
        maxDailyLoss: 15
    }
];
