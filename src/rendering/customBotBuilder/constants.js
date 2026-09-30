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
    },
    rsi: {
        name: 'RSI (Relative Strength Index)',
        desc: 'Momentum oscillator measuring overbought and oversold levels',
        conditions: [
            'RSI Crosses Below Oversold',
            'RSI Crosses Above Overbought',
            'RSI Greater Than',
            'RSI Less Than'
        ],
        defaultParams: {
            period: 14,
            oversold: 30,
            overbought: 70
        },
        paramLabels: {
            period: 'RSI Period',
            oversold: 'Oversold Level',
            overbought: 'Overbought Level'
        }
    },
    macd: {
        name: 'MACD (Moving Average Convergence)',
        desc: 'Trend momentum oscillator tracking fast vs slow exponential moving averages',
        conditions: [
            'MACD Line Crosses Signal Line Up',
            'MACD Line Crosses Signal Line Down',
            'MACD Histogram Turns Positive',
            'MACD Histogram Turns Negative'
        ],
        defaultParams: {
            fastEma: 12,
            slowEma: 26,
            signalPeriod: 9
        },
        paramLabels: {
            fastEma: 'Fast EMA',
            slowEma: 'Slow EMA',
            signalPeriod: 'Signal Period'
        }
    },
    bollinger: {
        name: 'Bollinger Bands',
        desc: 'Volatility envelope bands measuring standard deviation breakouts & pullbacks',
        conditions: [
            'Price Touches Lower Band (Buy)',
            'Price Touches Upper Band (Sell)',
            'Band Squeeze Breakout',
            'Price Crosses Middle Band'
        ],
        defaultParams: {
            period: 20,
            stdDev: 2.0
        },
        paramLabels: {
            period: 'Period',
            stdDev: 'StdDev Multiplier'
        }
    },
    supertrend: {
        name: 'SuperTrend Indicator',
        desc: 'ATR-based trend following dynamic support & resistance signals',
        conditions: [
            'SuperTrend Turns Bullish (Buy)',
            'SuperTrend Turns Bearish (Sell)',
            'Price Above SuperTrend',
            'Price Below SuperTrend'
        ],
        defaultParams: {
            atrPeriod: 10,
            multiplier: 3.0
        },
        paramLabels: {
            atrPeriod: 'ATR Period',
            multiplier: 'Multiplier'
        }
    },
    stochastic: {
        name: 'Stochastic Oscillator',
        desc: 'Momentum indicator comparing closing price to high-low range over period',
        conditions: [
            'K% Crosses Above D% (Oversold Buy)',
            'K% Crosses Below D% (Overbought Sell)',
            'K% Above 80 (Overbought)',
            'K% Below 20 (Oversold)'
        ],
        defaultParams: {
            kPeriod: 14,
            dPeriod: 3,
            slowing: 3
        },
        paramLabels: {
            kPeriod: '%K Period',
            dPeriod: '%D Period',
            slowing: 'Slowing'
        }
    }
};

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
