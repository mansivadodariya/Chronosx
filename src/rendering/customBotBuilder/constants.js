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
    { value: '1d', label: '1 Day (D1)' }
];

export const INDICATOR_DEFINITIONS = {
    ema_crossover: {
        id: 'ema_crossover',
        name: 'EMA Crossover',
        desc: 'Exponential Moving Average crossover — trend direction signals',
        category: 'Trend',
        conditions: [
            'Golden Cross (Fast > Slow)',
            'Death Cross (Fast < Slow)',
            'Price Above EMA',
            'Price Below EMA'
        ],
        fields: [
            { key: 'fastPeriod', label: 'Fast Period', type: 'number', default: 9, min: 1, max: 500, step: 1 },
            { key: 'slowPeriod', label: 'Slow Period', type: 'number', default: 21, min: 2, max: 1000, step: 1 }
        ],
        defaultParams: {
            fastPeriod: 9,
            slowPeriod: 21
        },
        paramLabels: {
            fastPeriod: 'Fast Period',
            slowPeriod: 'Slow Period'
        }
    },
    // rsi: {
    //     id: 'rsi',
    //     name: 'Relative Strength Index (RSI)',
    //     desc: 'Measures momentum and overbought / oversold market extremes',
    //     category: 'Momentum',
    //     conditions: [
    //         'Crosses Above Oversold (Bullish)',
    //         'Crosses Below Overbought (Bearish)',
    //         'RSI Greater Than 50 (Uptrend)',
    //         'RSI Less Than 50 (Downtrend)',
    //         'Bullish Divergence',
    //         'Bearish Divergence'
    //     ],
    //     fields: [
    //         { key: 'period', label: 'RSI Period', type: 'number', default: 14, min: 2, max: 100, step: 1 },
    //         { key: 'overbought', label: 'Overbought Level', type: 'number', default: 70, min: 50, max: 95, step: 1 },
    //         { key: 'oversold', label: 'Oversold Level', type: 'number', default: 30, min: 5, max: 50, step: 1 }
    //     ],
    //     defaultParams: {
    //         period: 14,
    //         overbought: 70,
    //         oversold: 30
    //     },
    //     paramLabels: {
    //         period: 'RSI Period',
    //         overbought: 'Overbought Level',
    //         oversold: 'Oversold Level'
    //     }
    // },
    // macd: {
    //     id: 'macd',
    //     name: 'MACD',
    //     desc: 'Moving Average Convergence Divergence momentum and trend signals',
    //     category: 'Momentum',
    //     conditions: [
    //         'MACD Line Crosses Above Signal (Bullish)',
    //         'MACD Line Crosses Below Signal (Bearish)',
    //         'MACD Histogram Turns Positive',
    //         'MACD Histogram Turns Negative',
    //         'MACD Crosses Above Zero'
    //     ],
    //     fields: [
    //         { key: 'fastEma', label: 'Fast EMA', type: 'number', default: 12, min: 1, max: 200, step: 1 },
    //         { key: 'slowEma', label: 'Slow EMA', type: 'number', default: 26, min: 2, max: 500, step: 1 },
    //         { key: 'signalPeriod', label: 'Signal Smoothing', type: 'number', default: 9, min: 1, max: 100, step: 1 }
    //     ],
    //     defaultParams: {
    //         fastEma: 12,
    //         slowEma: 26,
    //         signalPeriod: 9
    //     },
    //     paramLabels: {
    //         fastEma: 'Fast EMA',
    //         slowEma: 'Slow EMA',
    //         signalPeriod: 'Signal Smoothing'
    //     }
    // },
    // bollinger_bands: {
    //     id: 'bollinger_bands',
    //     name: 'Bollinger Bands',
    //     desc: 'Volatility bands indicating dynamic support, resistance, and squeeze breakouts',
    //     category: 'Volatility',
    //     conditions: [
    //         'Price Closes Below Lower Band (Oversold Bounce)',
    //         'Price Closes Above Upper Band (Overbought Pullback)',
    //         'Bollinger Band Squeeze Breakout (Bullish)',
    //         'Bollinger Band Squeeze Breakout (Bearish)',
    //         'Price Crosses Middle SMA Line'
    //     ],
    //     fields: [
    //         { key: 'period', label: 'SMA Period', type: 'number', default: 20, min: 2, max: 200, step: 1 },
    //         { key: 'stdDev', label: 'Std Deviation', type: 'number', default: 2.0, min: 0.5, max: 5.0, step: 0.1 }
    //     ],
    //     defaultParams: {
    //         period: 20,
    //         stdDev: 2.0
    //     },
    //     paramLabels: {
    //         period: 'SMA Period',
    //         stdDev: 'Std Deviation'
    //     }
    // },
    // supertrend: {
    //     id: 'supertrend',
    //     name: 'Supertrend',
    //     desc: 'ATR-based trend identifier for precise direction flips and trailing stops',
    //     category: 'Trend',
    //     conditions: [
    //         'Supertrend Flips Green (Bullish Entry)',
    //         'Supertrend Flips Red (Bearish Entry)',
    //         'Price Above Supertrend',
    //         'Price Below Supertrend'
    //     ],
    //     fields: [
    //         { key: 'atrPeriod', label: 'ATR Period', type: 'number', default: 10, min: 1, max: 100, step: 1 },
    //         { key: 'multiplier', label: 'Multiplier', type: 'number', default: 3.0, min: 0.5, max: 10.0, step: 0.1 }
    //     ],
    //     defaultParams: {
    //         atrPeriod: 10,
    //         multiplier: 3.0
    //     },
    //     paramLabels: {
    //         atrPeriod: 'ATR Period',
    //         multiplier: 'Multiplier'
    //     }
    // }
};

export const STANDARD_EMA_PAIRS = [
    { fastPeriod: 9, slowPeriod: 21 },
    { fastPeriod: 50, slowPeriod: 200 },
    { fastPeriod: 20, slowPeriod: 50 },
    { fastPeriod: 12, slowPeriod: 26 }
];

export const STANDARD_SINGLE_EMA_PERIODS = [20, 50, 200, 100];

export function getNextEmaDefaults(existingConditions = [], excludeIndex = -1, isSingleEma = false) {
    if (isSingleEma) {
        const usedPeriods = new Set(
            existingConditions
                .filter((c, idx) => idx !== excludeIndex && c.indicatorKey === 'ema_crossover' && (c.condition?.includes('Price Above') || c.condition?.includes('Price Below')))
                .map(c => Number(c.params?.fastPeriod))
                .filter(Boolean)
        );
        const nextPeriod = STANDARD_SINGLE_EMA_PERIODS.find(p => !usedPeriods.has(p)) || 20;
        return { fastPeriod: nextPeriod };
    }

    const otherEmaConditions = existingConditions.filter((c, idx) => {
        if (idx === excludeIndex) return false;
        if (c.indicatorKey !== 'ema_crossover') return false;
        return !c.condition?.includes('Price Above') && !c.condition?.includes('Price Below');
    });

    const usedPairs = new Set(
        otherEmaConditions.map(c => `${Number(c.params?.fastPeriod)}_${Number(c.params?.slowPeriod)}`)
    );

    const nextPair = STANDARD_EMA_PAIRS.find(p => !usedPairs.has(`${p.fastPeriod}_${p.slowPeriod}`)) 
        || STANDARD_EMA_PAIRS[otherEmaConditions.length % STANDARD_EMA_PAIRS.length] 
        || { fastPeriod: 50, slowPeriod: 200 };

    return {
        fastPeriod: nextPair.fastPeriod,
        slowPeriod: nextPair.slowPeriod
    };
}

export function getConditionParams(indicatorKey = 'ema_crossover', condition = '', existingConditions = [], excludeIndex = -1) {
    const def = INDICATOR_DEFINITIONS[indicatorKey] || INDICATOR_DEFINITIONS.ema_crossover;
    const isSingleEma = indicatorKey === 'ema_crossover' && (condition?.includes('Price Above') || condition?.includes('Price Below'));

    if (isSingleEma) {
        const defaults = getNextEmaDefaults(existingConditions, excludeIndex, true);
        return {
            fields: [
                { key: 'fastPeriod', label: 'EMA Period', type: 'number', default: defaults.fastPeriod, min: 1, max: 1000, step: 1 }
            ],
            defaultParams: defaults,
            paramLabels: { fastPeriod: 'EMA Period' }
        };
    }

    if (indicatorKey === 'ema_crossover') {
        const defaults = getNextEmaDefaults(existingConditions, excludeIndex, false);
        return {
            fields: [
                { key: 'fastPeriod', label: 'Fast Period', type: 'number', default: defaults.fastPeriod, min: 1, max: 500, step: 1 },
                { key: 'slowPeriod', label: 'Slow Period', type: 'number', default: defaults.slowPeriod, min: 2, max: 1000, step: 1 }
            ],
            defaultParams: defaults,
            paramLabels: {
                fastPeriod: 'Fast Period',
                slowPeriod: 'Slow Period'
            }
        };
    }

    return {
        fields: def.fields || [],
        defaultParams: { ...(def.defaultParams || {}) },
        paramLabels: { ...(def.paramLabels || {}) }
    };
}

export function validateEntryCondition(cond, allConditions = [], currentIndex = -1) {
    if (!cond) return null;
    const { indicatorKey = 'ema_crossover', condition, params = {} } = cond;
    const def = INDICATOR_DEFINITIONS[indicatorKey] || INDICATOR_DEFINITIONS.ema_crossover;

    if (indicatorKey === 'ema_crossover') {
        const isSingle = condition?.includes('Price Above') || condition?.includes('Price Below');
        const fast = Number(params.fastPeriod);
        const slow = Number(params.slowPeriod);

        if (isSingle) {
            if (!params.fastPeriod || isNaN(fast) || fast < 1) return 'EMA Period must be at least 1';
            if (fast > 1000) return 'EMA Period cannot exceed 1000';
            return null;
        }

        if (!params.fastPeriod || isNaN(fast) || fast < 1) return 'Fast Period must be at least 1';
        if (fast > 500) return 'Fast Period cannot exceed 500';
        if (!params.slowPeriod || isNaN(slow) || slow < 2) return 'Slow Period must be at least 2';
        if (slow > 1000) return 'Slow Period cannot exceed 1000';
        if (fast >= slow) return `Fast Period (${fast}) must be less than Slow Period (${slow})`;

        // Check duplicate EMA crossover periods across other conditions
        if (Array.isArray(allConditions) && allConditions.length > 1) {
            const hasDuplicate = allConditions.some((other, idx) => {
                if (idx === currentIndex || !other || other.indicatorKey !== 'ema_crossover') return false;
                const otherIsSingle = other.condition?.includes('Price Above') || other.condition?.includes('Price Below');
                if (otherIsSingle) return false;
                return Number(other.params?.fastPeriod) === fast && Number(other.params?.slowPeriod) === slow;
            });
            if (hasDuplicate) {
                return `Duplicate EMA (${fast}/${slow}). Use distinct periods (e.g. 9/21, 50/200, 20/50)`;
            }
        }
        return null;
    }

    if (indicatorKey === 'rsi') {
        const period = Number(params.period);
        const overbought = Number(params.overbought);
        const oversold = Number(params.oversold);
        if (!period || isNaN(period) || period < 2 || period > 100) return 'RSI Period must be between 2 and 100';
        if (!overbought || isNaN(overbought) || overbought < 50 || overbought > 95) return 'Overbought Level must be between 50 and 95';
        if (!oversold || isNaN(oversold) || oversold < 5 || oversold > 50) return 'Oversold Level must be between 5 and 50';
        if (oversold >= overbought) return 'Oversold level must be lower than Overbought level';
        return null;
    }

    if (indicatorKey === 'macd') {
        const fast = Number(params.fastEma);
        const slow = Number(params.slowEma);
        const signal = Number(params.signalPeriod);
        if (!fast || isNaN(fast) || fast < 1) return 'Fast EMA must be at least 1';
        if (!slow || isNaN(slow) || slow < 2) return 'Slow EMA must be at least 2';
        if (fast >= slow) return 'Fast EMA must be less than Slow EMA';
        if (!signal || isNaN(signal) || signal < 1) return 'Signal Period must be at least 1';
        return null;
    }

    if (indicatorKey === 'bollinger_bands') {
        const period = Number(params.period);
        const stdDev = Number(params.stdDev);
        if (!period || isNaN(period) || period < 2) return 'SMA Period must be at least 2';
        if (!stdDev || isNaN(stdDev) || stdDev < 0.5 || stdDev > 5) return 'Standard Deviation must be between 0.5 and 5.0';
        return null;
    }

    if (indicatorKey === 'supertrend') {
        const atr = Number(params.atrPeriod);
        const mult = Number(params.multiplier);
        if (!atr || isNaN(atr) || atr < 1) return 'ATR Period must be at least 1';
        if (!mult || isNaN(mult) || mult < 0.5 || mult > 10) return 'Multiplier must be between 0.5 and 10.0';
        return null;
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
