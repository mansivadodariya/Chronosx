import { tryRefreshToken } from '@/lib/api';
import { getStoredUserId } from '@/lib/authSession';

/**
 * Resolves the Bot Builder API base URL dynamically from environment variables.
 * Priority:
 * 1. process.env.NEXT_PUBLIC_BACKEND_URL (appended with /api/v1 if not present)
 * 2. process.env.NEXT_PUBLIC_API_URL
 */
export const getBotBuilderApiBase = () => {
    const raw = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
    if (!raw) return '/api/v1';
    return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`;
};

/**
 * Construct authorization and content headers
 */
function getAuthHeaders() {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return headers;
}

/**
 * Formats custom bot form state into standard backend strategy JSON
 */
export function formatBotStrategyPayload(formData, userId) {
    const rawPair = formData.tradingPair || 'EUR/USD';
    const cleanSymbol = rawPair.replace('/', '').toUpperCase();
    const timeframe = formData.timeframe || '1h';
    const tp = Number(formData.takeProfitPips) || 20;
    const sl = Number(formData.stopLossPips) || 10;
    const lotSize = Number(formData.lotSize) || 0.1;
    const maxOpen = Number(formData.maxOpenPositions) || 3;
    const riskPerTrade = Number(formData.riskPerTrade) || 2;
    const maxDailyLoss = Number(formData.maxDailyLoss) || 5;

    const rules = (formData.entryConditions || []).map((cond, idx) => ({
        id: cond.id || `cond_${idx + 1}`,
        indicator: cond.indicatorKey,
        condition: cond.condition,
        params: cond.params || {}
    }));

    return {
        user_id: userId || undefined,
        name: formData.botName || 'Custom Algo Bot',
        strategy_name: formData.botName || 'Custom Algo Bot',
        description: formData.description || '',
        symbol: rawPair,
        pair: cleanSymbol,
        timeframe: timeframe,
        trigger_mode: (formData.triggerMode || 'ALL').toLowerCase(),
        entry_conditions: {
            condition_type: (formData.triggerMode || 'ALL').toLowerCase(),
            rules: rules,
            raw_conditions: formData.entryConditions || []
        },
        exit_conditions: {
            take_profit_pips: tp,
            stop_loss_pips: sl,
            trailing_stop: Boolean(formData.trailingStop),
            trailing_distance: formData.trailingStop ? (Number(formData.trailingDistance) || 0) : 0,
            trailing_step: formData.trailingStop ? (Number(formData.trailingStep) || 0) : 0,
            target: tp,
            stoploss: sl
        },
        risk_management: {
            risk_level: formData.riskLevel || 'medium',
            lot_size: lotSize,
            max_open_positions: maxOpen,
            risk_per_trade_percent: riskPerTrade,
            max_daily_loss_percent: maxDailyLoss
        },
        status: 'active',
        created_at: new Date().toISOString()
    };
}

/**
 * Bot Builder Strategy API Client
 */
export const botBuilderApi = {
    /**
     * Create/Save Strategy via POST /api/v1/bot-builder/strategies
     */
    createStrategy: async (formData) => {
        const userId = typeof window !== 'undefined' ? getStoredUserId() : null;
        const payload = formatBotStrategyPayload(formData, userId);
        const apiBase = getBotBuilderApiBase();
        const primaryUrl = `${apiBase}/bot-builder/strategies`;
        const headers = getAuthHeaders();

        try {
            const res = await fetch(primaryUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });

            if (res.status === 401) {
                const refreshed = await tryRefreshToken();
                if (refreshed) {
                    const retryRes = await fetch(primaryUrl, {
                        method: 'POST',
                        headers: {
                            ...headers,
                            Authorization: `Bearer ${refreshed}`
                        },
                        body: JSON.stringify(payload)
                    });
                    if (retryRes.ok) {
                        const json = await retryRes.json();
                        return { success: true, data: json?.data || json, raw: json };
                    }
                }
            }

            if (res.ok) {
                const json = await res.json();
                return { success: true, data: json?.data || json, raw: json };
            }

            const errData = await res.json().catch(() => null);
            const errMsg = errData?.detail || errData?.message || errData?.error || `Request failed with status ${res.status}`;
            return { success: false, error: errMsg, payload };
        } catch (err) {
            console.warn('[botBuilderApi] Backend strategy request failed:', err.message);
            return { success: false, error: err.message, payload };
        }
    },

    /**
     * Fetch user strategies via GET /api/v1/bot-builder/strategies
     */
    getStrategies: async (userId) => {
        const uid = userId || (typeof window !== 'undefined' ? getStoredUserId() : '');
        const apiBase = getBotBuilderApiBase();
        const url = uid ? `${apiBase}/bot-builder/strategies?user_id=${encodeURIComponent(uid)}` : `${apiBase}/bot-builder/strategies`;
        try {
            const res = await fetch(url, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const json = await res.json();
                return { success: true, data: json?.data || json?.strategies || json };
            }
        } catch (err) {
            console.warn('[botBuilderApi] Get strategies failed:', err.message);
        }
        return { success: false, data: [] };
    }
};
