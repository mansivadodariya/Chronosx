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

export const DEFAULT_SETUPS_LIST = [
    {
        symbol: 'EURO / US DOLLAR',
        display_name: 'EURO / US DOLLAR',
        pair_id: 'b0500000-0000-0000-0000-000000000001',
        strategy_id: '3e8d2b78-0e86-4fdf-9759-338276db1742',
        strategy_name: 'EMA Pullback',
        signal: {
            active: true,
            direction: 'SELL',
            direction_display: '↓ SELL',
            entry: 1.16049,
            entry_display: '$1.16049',
            sl: 1.16144,
            sl_display: '$1.16144',
            tp: 1.15353,
            tp_display: '$1.15353',
            time_ago: '1h ago',
            status_label: 'RECENT SETUP (1h ago)',
            risk_reward: '1:2.0',
            rr: 'R:R 1.0',
            confluence: {
                volume_strength: 'MODERATE',
                risk_reward: 'Risk Reward: 1:2.0',
            },
            indicators: { rsi: 65.3, rvol: 1.1 },
            tags: ['EMA Pullback', 'DOWNTREND'],
            mini_candles: createSampleCandles(1.16049, 'SELL', 25),
        },
    },
    {
        symbol: 'GOLD / US DOLLAR',
        display_name: 'GOLD / US DOLLAR',
        pair_id: 'b0500000-0000-0000-0000-000000000002',
        strategy_id: '3e8d2b78-0e86-4fdf-9759-338276db1743',
        strategy_name: 'EMA Pullback',
        signal: {
            active: true,
            direction: 'BUY',
            direction_display: '↑ BUY',
            entry: 2498.45,
            entry_display: '$2,498.45',
            sl: 2490.10,
            sl_display: '$2,490.10',
            tp: 2523.50,
            tp_display: '$2,523.50',
            time_ago: '15m ago',
            status_label: 'RECENT SETUP (15m ago)',
            risk_reward: '1:3.0',
            rr: 'R:R 1.3',
            confluence: {
                volume_strength: 'STRONG',
                risk_reward: 'Risk Reward: 1:3.0',
            },
            indicators: { rsi: 58.2, rvol: 1.4 },
            tags: ['EMA Pullback', 'UPTREND'],
            mini_candles: createSampleCandles(2498.45, 'BUY', 25),
        },
    },
    {
        symbol: 'BRITISH POUND / US DOLLAR',
        display_name: 'BRITISH POUND / US DOLLAR',
        pair_id: 'b0500000-0000-0000-0000-000000000003',
        strategy_id: '3e8d2b78-0e86-4fdf-9759-338276db1744',
        strategy_name: 'EMA Pullback',
        signal: {
            active: true,
            direction: 'BUY',
            direction_display: '↑ BUY',
            entry: 1.31200,
            entry_display: '$1.31200',
            sl: 1.30800,
            sl_display: '$1.30800',
            tp: 1.32400,
            tp_display: '$1.32400',
            time_ago: '1h ago',
            status_label: 'RECENT SETUP (1h ago)',
            risk_reward: '1:3.0',
            rr: 'R:R 1.2',
            confluence: {
                volume_strength: 'STRONG',
                risk_reward: 'Risk Reward: 1:3.0',
            },
            indicators: { rsi: 52.8, rvol: 1.2 },
            tags: ['EMA Pullback', 'UPTREND'],
            mini_candles: createSampleCandles(1.31200, 'BUY', 25),
        },
    },
    {
        symbol: 'US DOLLAR / CANADIAN DOLLAR',
        display_name: 'US DOLLAR / CANADIAN DOLLAR',
        pair_id: 'b0500000-0000-0000-0000-000000000004',
        strategy_id: '3e8d2b78-0e86-4fdf-9759-338276db1745',
        strategy_name: 'EMA Pullback',
        signal: {
            active: true,
            direction: 'SELL',
            direction_display: '↓ SELL',
            entry: 1.34900,
            entry_display: '$1.34900',
            sl: 1.35250,
            sl_display: '$1.35250',
            tp: 1.33850,
            tp_display: '$1.33850',
            time_ago: '2h ago',
            status_label: 'RECENT SETUP (2h ago)',
            risk_reward: '1:3.0',
            rr: 'R:R 1.1',
            confluence: {
                volume_strength: 'STRONG',
                risk_reward: 'Risk Reward: 1:3.0',
            },
            indicators: { rsi: 64.1, rvol: 1.15 },
            tags: ['EMA Pullback', 'DOWNTREND'],
            mini_candles: createSampleCandles(1.34900, 'SELL', 25),
        },
    },
    {
        symbol: 'GBP/JPY',
        display_name: 'GBP/JPY',
        pair_id: '345a3242-01da-4c63-ac74-fe3446b5fc3f',
        strategy_id: '3e8d2b78-0e86-4fdf-9759-338276db1746',
        strategy_name: 'EMA Pullback',
        signal: {
            active: true,
            direction: 'SELL',
            direction_display: '↓ SELL',
            entry: 211.520,
            entry_display: '$211.520',
            sl: 212.578,
            sl_display: '$212.578',
            tp: 209.405,
            tp_display: '$209.405',
            time_ago: '1h ago',
            status_label: 'RECENT SETUP (1h ago)',
            risk_reward: '1:2.0',
            rr: 'R:R 1.0',
            confluence: {
                volume_strength: 'WEAK',
                risk_reward: 'Risk Reward: 1:2.0',
            },
            indicators: { rsi: 61.5, rvol: 0.95 },
            tags: ['EMA Pullback', 'DOWNTREND'],
            mini_candles: createSampleCandles(211.520, 'SELL', 25),
        },
    },
    {
        symbol: 'EUR/JPY',
        display_name: 'EUR/JPY',
        pair_id: 'b2cd25b2-9078-40c0-980a-de3269d61e71',
        strategy_id: '3e8d2b78-0e86-4fdf-9759-338276db1747',
        strategy_name: 'EMA Pullback',
        signal: {
            active: true,
            direction: 'SELL',
            direction_display: '↓ SELL',
            entry: 181.933,
            entry_display: '$181.933',
            sl: 182.843,
            sl_display: '$182.843',
            tp: 180.114,
            tp_display: '$180.114',
            time_ago: '1h ago',
            status_label: 'RECENT SETUP (1h ago)',
            risk_reward: '1:2.0',
            rr: 'R:R 1.0',
            confluence: {
                volume_strength: 'WEAK',
                risk_reward: 'Risk Reward: 1:2.0',
            },
            indicators: { rsi: 63.8, rvol: 0.92 },
            tags: ['EMA Pullback', 'DOWNTREND'],
            mini_candles: createSampleCandles(181.933, 'SELL', 25),
        },
    },
];

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

    // Initial fallback if WebSocket hasn't delivered payload in initial window
    useEffect(() => {
        const timer = setTimeout(() => {
            setSetupsList((prev) => {
                if (prev.length === 0) {
                    return DEFAULT_SETUPS_LIST.map(normalizeSetupItem);
                }
                return prev;
            });
            setSetups((prev) => {
                if (Object.keys(prev).length === 0) {
                    const dict = {};
                    DEFAULT_SETUPS_LIST.forEach((item) => {
                        const norm = normalizeSetupItem(item);
                        if (norm) {
                            dict[norm.meta.short] = norm;
                            dict[norm.symbol] = norm;
                        }
                    });
                    return dict;
                }
                return prev;
            });
            setLoading(false);
        }, 850);

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
                try {
                    socketRef.current.close();
                } catch {
                    // Ignore close exceptions
                }
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
