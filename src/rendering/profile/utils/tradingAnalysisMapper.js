/**
 * Trading Profile Data Mapper & Schema Converter
 */

export const EXPERIENCE_LEVELS = [
    { value: 'Beginner', label: 'Beginner', desc: '0–1 years. Guided AI validation & foundational models.' },
    { value: 'Intermediate', label: 'Intermediate', desc: '1–3 years. Indicator confluence & multi-timeframe setups.' },
    { value: 'Advanced', label: 'Advanced', desc: '3–5+ years. Orderflow, liquidity pools & quantitative risk.' },
    { value: 'Professional', label: 'Professional / Prop Firm', desc: 'Full-time trader focused on algorithmic execution & MT5 EAs.' },
];

export const TRADING_STYLES = [
    { value: 'Scalping', label: 'Scalping (1M – 5M)' },
    { value: 'Day Trading', label: 'Day Trading (15M – 1H)' },
    { value: 'Swing Trading', label: 'Swing Trading (4H – 1D)' },
    { value: 'Position Trading', label: 'Position Trading (Weekly / Multi-Month)' },
    { value: 'Algorithmic / Automated', label: 'Algorithmic / EA Strategies (24/7 Automation)' },
];

export const RISK_TOLERANCES = [
    { value: 'Low', label: 'Conservative (Low Risk)', maxDd: '8-10%', maxRisk: '0.5-1%' },
    { value: 'Moderate', label: 'Balanced (Moderate Risk)', maxDd: '12-15%', maxRisk: '1-2%' },
    { value: 'High', label: 'Growth (High Risk)', maxDd: '20-25%', maxRisk: '2-3%' },
    { value: 'Aggressive', label: 'Aggressive (Max Yield)', maxDd: '30%+', maxRisk: '3-5%' },
];

export const PRIMARY_GOALS = [
    'Wealth Building',
    'Capital Preservation',
    'Consistent Monthly Income',
    'Prop Firm Challenge Passing',
    'Automated Passive Growth'
];

export const AVAILABLE_PAIRS = [
    { id: 'EUR/USD', symbol: 'EUR/USD', icon: '💶', tag: 'FX Major' },
    { id: 'GBP/USD', symbol: 'GBP/USD', icon: '💷', tag: 'FX Major' },
    { id: 'USD/JPY', symbol: 'USD/JPY', icon: '💴', tag: 'FX Major' },
    { id: 'XAU/USD', symbol: 'XAU/USD', icon: '🪙', tag: 'Gold' },
    { id: 'BTC/USD', symbol: 'BTC/USD', icon: '₿', tag: 'Crypto' },
    { id: 'ETH/USD', symbol: 'ETH/USD', icon: '⟠', tag: 'Crypto' },
    { id: 'US30', symbol: 'US30', icon: '📈', tag: 'Indices' },
    { id: 'NAS100', symbol: 'NAS100', icon: '💻', tag: 'Indices' },
    { id: 'AUD/USD', symbol: 'AUD/USD', icon: '🇦🇺', tag: 'FX Major' },
    { id: 'USD/CAD', symbol: 'USD/CAD', icon: '🍁', tag: 'FX Major' }
];

export const AVAILABLE_SESSIONS = [
    { id: 'London Session', label: 'London Session', icon: '🇬🇧' },
    { id: 'New York Session', label: 'New York Session', icon: '🇺🇸' },
    { id: 'Tokyo / Asian Session', label: 'Tokyo / Asian Session', icon: '🇯🇵' },
    { id: 'Sydney Session', label: 'Sydney Session', icon: '🇦🇺' },
    { id: 'Overlap (London + NY)', label: 'Overlap (London + NY)', icon: '🌐' }
];


const MARKET_TO_PAIR_MAP = {
    eurusd: 'EUR/USD',
    gbpusd: 'GBP/USD',
    usdjpy: 'USD/JPY',
    gold: 'XAU/USD',
    crypto: 'BTC/USD',
    indices: 'NAS100',
    oil: 'US30'
};

const STYLE_TO_LABEL_MAP = {
    scalping: 'Scalping',
    day_trading: 'Day Trading',
    swing_trading: 'Swing Trading',
    position_trading: 'Position Trading',
    algo_trading: 'Algorithmic / Automated'
};

/**
 * Merges API preferences, DB user onboarding survey data, and fallback defaults
 */
export function buildInitialTradingProfileForm({ apiPreferences, onboardingData, user }) {
    const p = apiPreferences || {};
    const personal = p.personal || {};
    const investment = p.investment || {};
    const risk = p.risk || {};
    const goals = p.goals || {};
    const pref = p.preferences || {};

    // 1. Resolve Full Name
    const resolvedName = personal.name || personal.full_name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '') || 'Alex Morgan';

    // 2. Resolve Experience Level
    let resolvedExp = personal.experience_level;
    if (!resolvedExp && onboardingData?.experience) {
        const lower = String(onboardingData.experience).toLowerCase();
        if (lower.includes('begin')) resolvedExp = 'Beginner';
        else if (lower.includes('inter')) resolvedExp = 'Intermediate';
        else if (lower.includes('adv')) resolvedExp = 'Advanced';
        else if (lower.includes('prof')) resolvedExp = 'Professional / Prop Firm';
    }
    resolvedExp = resolvedExp || 'Intermediate';

    // 3. Resolve Trading Style
    let resolvedStyle = personal.trading_style;
    if (!resolvedStyle && Array.isArray(onboardingData?.tradingStyles) && onboardingData.tradingStyles[0]) {
        resolvedStyle = STYLE_TO_LABEL_MAP[onboardingData.tradingStyles[0]] || onboardingData.tradingStyles[0];
    }
    resolvedStyle = resolvedStyle || 'Day Trading';

    // 4. Resolve Preferred Pairs
    let resolvedPairs = pref.preferred_currency_pairs || pref.preferred_pairs;
    if (!resolvedPairs || !Array.isArray(resolvedPairs) || resolvedPairs.length === 0) {
        if (Array.isArray(onboardingData?.markets) && onboardingData.markets.length > 0) {
            resolvedPairs = onboardingData.markets.map(m => MARKET_TO_PAIR_MAP[String(m).toLowerCase()] || m).filter(Boolean);
        }
    }
    if (!resolvedPairs || resolvedPairs.length === 0) {
        resolvedPairs = ['EUR/USD', 'GBP/USD', 'XAU/USD'];
    }

    // 5. Resolve Preferred Sessions
    let resolvedSessions = pref.preferred_trading_sessions || pref.preferred_sessions;
    if (!resolvedSessions || !Array.isArray(resolvedSessions) || resolvedSessions.length === 0) {
        resolvedSessions = ['London Session', 'New York Session'];
    }

    return {
        personal: {
            full_name: resolvedName,
            experience_level: resolvedExp,
            trading_style: resolvedStyle,
        },
        investment: {
            total_investment_capital: Number(investment.total_investment ?? investment.total_investment_capital ?? 5000),
            monthly_top_up: Number(investment.monthly_top_up ?? 500),
        },
        risk: {
            risk_tolerance: risk.risk_capacity || risk.risk_tolerance || 'Moderate',
            max_acceptable_drawdown: risk.max_drawdown_limit || risk.max_acceptable_drawdown || '15%',
            max_risk_per_trade: risk.max_risk_per_trade || '1-2%',
        },
        goals: {
            primary_goal: goals.primary_goal || 'Wealth Building',
            monthly_return_target: goals.monthly_return_rate || goals.monthly_return_target || '5%',
            profit_goal: Number(goals.profit_goal ?? 25000),
            timeframe: Number(goals.timeframe ?? 12),
            describe_goals: goals.describe_goals || 'Achieve consistent risk-adjusted returns and build long-term trading capital.',
        },
        preferences: {
            preferred_currency_pairs: resolvedPairs,
            preferred_sessions: resolvedSessions,
        },
        generate_ai: true
    };
}
