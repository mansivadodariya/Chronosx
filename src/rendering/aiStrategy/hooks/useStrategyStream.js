'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Pair Metadata Registry
export const PAIR_METADATA_MAP = {
    'EUR/USD': { fullName: 'Euro/US Dollar', short: 'EUR/USD', market: 'Forex' },
    'GBP/USD': { fullName: 'British Pound/US Dollar', short: 'GBP/USD', market: 'Forex' },
    'XAU/USD': { fullName: 'Gold/US Dollar', short: 'XAU/USD', market: 'Commodities' },
    'USD/CAD': { fullName: 'US Dollar/Canadian Dollar', short: 'USD/CAD', market: 'Forex' },
    'GBP/JPY': { fullName: 'British Pound/Japanese Yen', short: 'GBP/JPY', market: 'Forex' },
    'EUR/JPY': { fullName: 'Euro/Japanese Yen', short: 'EUR/JPY', market: 'Forex' },
    'USD/JPY': { fullName: 'US Dollar/Japanese Yen', short: 'USD/JPY', market: 'Forex' },
    'AUD/USD': { fullName: 'Australian Dollar/US Dollar', short: 'AUD/USD', market: 'Forex' },
    'NZD/USD': { fullName: 'New Zealand Dollar/US Dollar', short: 'NZD/USD', market: 'Forex' },
    'USD/CHF': { fullName: 'US Dollar/Swiss Franc', short: 'USD/CHF', market: 'Forex' },
};

// Robust normalizer for incoming WebSocket symbols (e.g. "EURO / US DOLLAR" -> "EUR/USD")
export const normalizePairInfo = (rawSymbol = '', rawDisplayName = '') => {
    const raw = (rawDisplayName || rawSymbol || '').trim();
    const upper = raw.toUpperCase();

    // Specific text matchers
    if (upper.includes('EURO') && upper.includes('DOLLAR')) return PAIR_METADATA_MAP['EUR/USD'];
    if (upper.includes('BRITISH') || (upper.includes('POUND') && upper.includes('DOLLAR'))) return PAIR_METADATA_MAP['GBP/USD'];
    if (upper.includes('GOLD') || upper.includes('XAU')) return PAIR_METADATA_MAP['XAU/USD'];
    if (upper.includes('CANADIAN') || upper.includes('USDCAD')) return PAIR_METADATA_MAP['USD/CAD'];
    if ((upper.includes('GBP') || upper.includes('POUND')) && (upper.includes('JPY') || upper.includes('YEN'))) return PAIR_METADATA_MAP['GBP/JPY'];
    if ((upper.includes('EUR') || upper.includes('EURO')) && (upper.includes('JPY') || upper.includes('YEN'))) return PAIR_METADATA_MAP['EUR/JPY'];
    if (upper.includes('JPY') || upper.includes('YEN')) return PAIR_METADATA_MAP['USD/JPY'];

    // Standard 6 character currency tickers (e.g., "EURUSD")
    const cleanLetters = raw.replace(/[^A-Za-z]/g, '').toUpperCase();
    if (cleanLetters.length === 6) {
        const short = `${cleanLetters.slice(0, 3)}/${cleanLetters.slice(3)}`;
        if (PAIR_METADATA_MAP[short]) return PAIR_METADATA_MAP[short];
        return { fullName: short, short, market: 'Forex' };
    }

    if (raw.includes('/')) {
        const short = raw.replace(/\s+/g, '').toUpperCase();
        if (PAIR_METADATA_MAP[short]) return PAIR_METADATA_MAP[short];
        return { fullName: short, short, market: 'Forex' };
    }

    return {
        fullName: raw || 'Forex Pair',
        short: raw || 'PAIR',
        market: 'Forex',
    };
};

export const formatShortPair = (sym = '') => {
    return normalizePairInfo(sym).short;
};

// Format currency price with proper decimals and optional prefix
export const formatDisplayValue = (val, shortPair = '') => {
    if (val === undefined || val === null || val === '') return '-';
    let str = String(val).trim();
    if (str.startsWith('$')) return str;
    const num = Number(str.replace(/[^0-9.-]/g, ''));
    if (isNaN(num)) return `$${str}`;

    const s = String(shortPair).toUpperCase();
    if (s.includes('JPY')) {
        return `$${num.toFixed(3)}`;
    }
    if (s.includes('XAU') || s.includes('GOLD')) {
        return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (num < 10) {
        return `$${num.toFixed(5)}`;
    }
    return `$${num.toFixed(2)}`;
};

// Generate realistic starter candles for fallback / initial state
export function createSampleCandles(basePrice, direction, count = 25) {
    const isUp = direction === 'BUY';
    const candles = [];
    const now = Math.floor(Date.now() / 1000) - count * 180;
    let curr = basePrice;
    const stepSize = basePrice > 100 ? 0.8 : 0.0004;

    for (let i = 0; i < count; i++) {
        const delta = (Math.random() - (isUp ? 0.42 : 0.58)) * stepSize;
        const open = curr;
        const close = open + delta;
        const high = Math.max(open, close) + Math.random() * (stepSize * 0.6);
        const low = Math.min(open, close) - Math.random() * (stepSize * 0.6);
        curr = close;
        candles.push({
            time: now + i * 180,
            open: parseFloat(open.toFixed(basePrice > 100 ? 2 : 5)),
            high: parseFloat(high.toFixed(basePrice > 100 ? 2 : 5)),
            low: parseFloat(low.toFixed(basePrice > 100 ? 2 : 5)),
            close: parseFloat(close.toFixed(basePrice > 100 ? 2 : 5)),
        });
    }
    return candles;
}

export const STRATEGY_PAIRS = [
    'XAU/USD',
    'EUR/USD',
    'GBP/USD',
    'USD/CAD',
    'GBP/JPY',
    'EUR/JPY'
];

export const DEFAULT_SETUPS_LIST = [];

// Helper to convert any setup item into standard normalized structure
export const normalizeSetupItem = (item) => {
    if (!item) return null;
    const meta = normalizePairInfo(item.symbol, item.display_name);
    const sig = item.signal || item;
    const direction = (sig.direction || item.direction || 'BUY').toUpperCase();
    const strategyName = item.strategy_name || 'EMA Pullback';

    const entry = sig.entry_price ?? sig.entry_target ?? sig.entry ?? 0;
    const sl = sig.stop_loss ?? sig.sl ?? 0;
    const tp = sig.take_profit ?? sig.take_profit_1 ?? sig.tp_1 ?? sig.tp ?? 0;

    const entryDisplay = formatDisplayValue(sig.entry_display || entry, meta.short);
    const slDisplay = formatDisplayValue(sig.sl_display || sl, meta.short);
    const tpDisplay = formatDisplayValue(sig.tp_display || tp, meta.short);

    const timeAgo = sig.time_ago || sig.status_label || (sig.timestamp ? `${Math.max(1, Math.round((Date.now()/1000 - sig.timestamp)/60))}m ago` : '1h ago');
    const riskReward = sig.risk_reward || sig.rr || sig.confluence?.risk_reward || '1:2.0';
    const volumeStrength = sig.confluence?.volume_strength || sig.volume_strength || (sig.indicators?.rvol ? (sig.indicators.rvol >= 1.2 ? 'STRONG' : 'MODERATE') : 'STRONG');
    const tags = Array.isArray(sig.tags) && sig.tags.length > 0
        ? sig.tags
        : [strategyName, direction === 'BUY' ? 'UPTREND' : 'DOWNTREND'];

    const miniCandles = Array.isArray(sig.mini_candles) && sig.mini_candles.length > 0
        ? sig.mini_candles
        : createSampleCandles(entry || 1.15, direction, 25);

    return {
        symbol: item.symbol || meta.short,
        display_name: item.display_name || meta.fullName,
        pair_id: item.pair_id || '',
        strategy_id: item.strategy_id || '',
        strategy_name: strategyName,
        meta,
        signal: {
            active: sig.active !== false,
            status: sig.status || 'RECENT',
            status_label: sig.status_label || timeAgo,
            direction,
            direction_display: sig.direction_display || (direction === 'BUY' ? '↑ BUY' : '↓ SELL'),
            entry,
            entry_display: entryDisplay,
            sl,
            sl_display: slDisplay,
            tp,
            tp_display: tpDisplay,
            time_ago: timeAgo,
            risk_reward: riskReward,
            rr: sig.rr || `R:R ${String(riskReward).replace('1:', '')}`,
            confluence: {
                volume_strength: volumeStrength,
                risk_reward: sig.confluence?.risk_reward || `Risk Reward: ${riskReward}`,
                risk_level: sig.confluence?.risk_level || 'LOW',
            },
            indicators: sig.indicators || { rsi: 60, rvol: 1.2 },
            tags,
            mini_candles: miniCandles,
            sparkline: Array.isArray(sig.sparkline) ? sig.sparkline : [],
        },
    };
};

export const getStrategyWebSocketUrl = () => {
    if (typeof window === 'undefined') return '';
    const envWs = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_WS_LIVE_URL;
    if (envWs) {
        let base = envWs.split('?')[0].replace(/\/api\/v1\/ws\/.*/, '/api/v1/ws/strategy');
        return base;
    }
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
    const proto = backendUrl.startsWith('https') ? 'wss:' : 'ws:';
    const host = backendUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    return `${proto}//${host}/api/v1/ws/strategy`;
};

export function useStrategyStream() {
    const [loading, setLoading] = useState(true);
    const [setupsList, setSetupsList] = useState([]);
    const [setups, setSetups] = useState({});

    const [wsStatus, setWsStatus] = useState('connecting');
    const socketRef = useRef(null);
    const reconnectTimerRef = useRef(null);
    const isUnmountingRef = useRef(false);

    // Conclude initial loading state if WebSocket takes time or returns empty
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    const handleIncomingSetups = useCallback((rawSetups) => {
        if (!rawSetups) return;

        const incomingArray = Array.isArray(rawSetups)
            ? rawSetups
            : typeof rawSetups === 'object'
                ? Object.values(rawSetups)
                : [];

        if (incomingArray.length === 0) return;

        const normalizedItems = incomingArray.map(normalizeSetupItem).filter(Boolean);

        setSetupsList((prevList) => {
            const listMap = new Map();
            prevList.forEach((it) => listMap.set(it.meta.short, it));
            normalizedItems.forEach((it) => listMap.set(it.meta.short, it));
            return Array.from(listMap.values());
        });

        setSetups((prevDict) => {
            const updated = { ...prevDict };
            normalizedItems.forEach((it) => {
                updated[it.meta.short] = it;
                updated[it.symbol] = it;
                if (it.display_name) updated[it.display_name] = it;
            });
            return updated;
        });

        setLoading(false);
    }, []);

    const connectWebSocket = useCallback(() => {
        if (isUnmountingRef.current) return;
        const wsUrl = getStrategyWebSocketUrl();
        if (!wsUrl) return;

        try {
            setWsStatus('connecting');
            const ws = new WebSocket(wsUrl);
            socketRef.current = ws;

            ws.onopen = () => {
                if (isUnmountingRef.current) {
                    ws.close();
                    return;
                }
                setWsStatus('connected');
                try {
                    ws.send(JSON.stringify({ action: 'subscribe_strategy', pairs: STRATEGY_PAIRS }));
                } catch {
                    // Ignore send error
                }
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (!data) return;

                    if (data.type === 'strategy_update_all' || data.type === 'initial_strategy_state') {
                        const payloadSetups = data.active_setups || data.setups || data.data;
                        handleIncomingSetups(payloadSetups);
                    } else if (data.symbol || data.pair || data.signal) {
                        handleIncomingSetups([data]);
                    }
                } catch (err) {
                    console.warn('[StrategyWS] Error parsing message:', err);
                }
            };

            ws.onerror = () => {
                setWsStatus('disconnected');
            };

            ws.onclose = () => {
                setWsStatus('disconnected');
                if (!isUnmountingRef.current) {
                    reconnectTimerRef.current = setTimeout(() => {
                        connectWebSocket();
                    }, 3000);
                }
            };
        } catch (err) {
            console.error('[StrategyWS] Connection error:', err);
            setWsStatus('disconnected');
            if (!isUnmountingRef.current) {
                reconnectTimerRef.current = setTimeout(connectWebSocket, 4000);
            }
        }
    }, [handleIncomingSetups]);

    useEffect(() => {
        isUnmountingRef.current = false;
        connectWebSocket();

        return () => {
            isUnmountingRef.current = true;
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
            }
            if (socketRef.current) {
                const ws = socketRef.current;
                socketRef.current = null;
                try {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.close();
                    } else if (ws.readyState === WebSocket.CONNECTING) {
                        ws.onopen = () => {
                            try { ws.close(); } catch (_) {}
                        };
                        ws.onmessage = null;
                        ws.onerror = null;
                    }
                } catch (_) {}
            }
        };
    }, [connectWebSocket]);

    return {
        setups,
        setupsList,
        wsStatus,
        loading,
    };
}
