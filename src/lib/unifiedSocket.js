'use client';

/**
 * Unified MT5 Live WebSocket Manager (Singleton)
 *
 * Implements the official Unified MT5 Live WebSocket protocol:
 * Endpoint: /api/v1/ws/live?symbol={symbol}&timeframe={timeframe}&strategy_id={strategy_id}
 *
 * Streams 2 events over a single persistent connection:
 *  1. `price_update`: Live price ticks, bid/ask, volume, 24h change
 *  2. `candle_update`: Active forming candle OHLCV + technical indicators (EMA20, EMA50, SuperTrend, Pivots)
 *
 * Supports dynamic switching via:
 *  { action: "subscribe", symbol: "...", timeframe: "..." }
 */

export function cleanPairSymbol(symbol) {
    if (!symbol) return 'XAUUSD';
    return String(symbol).replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

export function normalizeTimeframe(tf) {
    if (!tf) return 'H1';
    const s = String(tf).trim();
    const upper = s.toUpperCase();
    if (upper === '1' || upper === '1M' || upper === 'M1') return '1m';
    if (upper === '5' || upper === '5M' || upper === 'M5') return '5m';
    if (upper === '15' || upper === '15M' || upper === 'M15') return '15m';
    if (upper === '30' || upper === '30M' || upper === 'M30') return '30m';
    if (upper === '60' || upper === '1H' || upper === 'H1') return 'H1';
    if (upper === '240' || upper === '4H' || upper === 'H4') return 'H4';
    if (upper === 'D' || upper === '1D' || upper === 'D1') return 'D1';
    return s;
}

export function getWsEndpointUrl(symbol = 'XAUUSD', timeframe = 'H1', strategyId = 'default') {
    let base = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_WS_LIVE_URL;
    
    if (base) {
        // Strip existing query parameters if any
        base = base.split('?')[0];
    } else {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (backendUrl) {
            const protocol = backendUrl.startsWith('https') ? 'wss:' : 'ws:';
            const host = backendUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
            base = `${protocol}//${host}/api/v1/ws/live`;
        } else if (typeof window !== 'undefined') {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.host || 'localhost:8000';
            base = `${protocol}//${host}/api/v1/ws/live`;
        } else {
            base = 'ws://localhost:8000/api/v1/ws/live';
        }
    }

    const cleanSym = cleanPairSymbol(symbol);
    const normTf = normalizeTimeframe(timeframe);
    const stratId = strategyId || 'default';

    return `${base}?symbol=${cleanSym}&timeframe=${normTf}&strategy_id=${stratId}`;
}

class UnifiedSocketManager {
    constructor() {
        this.socket = null;
        this.status = 'disconnected'; // 'connecting' | 'connected' | 'disconnected'
        this.currentSymbol = 'XAUUSD';
        this.currentTimeframe = 'H1';
        this.currentStrategyId = 'default';

        this.priceListeners = new Set();
        this.candleListeners = new Set();
        this.strategyListeners = new Set();
        this.statusListeners = new Set();

        this.reconnectTimer = null;
        this.disconnectTimer = null;
        this.lastPriceUpdate = null;
    }

    getStatus() {
        return this.status;
    }

    setStatus(newStatus) {
        if (this.status !== newStatus) {
            this.status = newStatus;
            this.statusListeners.forEach((cb) => {
                try {
                    cb(newStatus);
                } catch (err) {
                    console.error('[UnifiedWS] Status listener error:', err);
                }
            });
        }
    }

    subscribeStatus(callback) {
        if (typeof callback !== 'function') return () => {};
        this.statusListeners.add(callback);
        callback(this.status);
        return () => {
            this.statusListeners.delete(callback);
        };
    }

    _totalSubscriberCount() {
        return this.priceListeners.size + this.candleListeners.size + this.strategyListeners.size;
    }

    ensureConnected() {
        if (typeof window === 'undefined') return;

        if (this.disconnectTimer) {
            clearTimeout(this.disconnectTimer);
            this.disconnectTimer = null;
        }

        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            return;
        }

        this.connect();
    }

    connect() {
        if (typeof window === 'undefined') return;

        if (this.socket) {
            try {
                this.socket.close();
            } catch (e) {
                /* ignore */
            }
            this.socket = null;
        }

        const wsUrl = getWsEndpointUrl(this.currentSymbol, this.currentTimeframe, this.currentStrategyId);
        this.setStatus('connecting');

        try {
            const ws = new WebSocket(wsUrl);
            this.socket = ws;

            ws.onopen = () => {
                if (this.socket !== ws) return;
                this.setStatus('connected');
                console.log(`[UnifiedWS] Connected: ${this.currentSymbol} (${this.currentTimeframe})`);
            };

            ws.onmessage = (event) => {
                if (this.socket !== ws) return;
                try {
                    const payload = JSON.parse(event.data);
                    this._handleMessage(payload);
                } catch (err) {
                    console.error('[UnifiedWS] Failed to parse message:', err);
                }
            };

            ws.onerror = (err) => {
                if (this.socket !== ws) return;
                console.warn('[UnifiedWS] Socket error:', err);
            };

            ws.onclose = (event) => {
                if (this.socket !== ws) return;
                this.socket = null;
                this.setStatus('disconnected');

                // Auto-reconnect if there are active subscribers
                if (this._totalSubscriberCount() > 0) {
                    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
                    this.reconnectTimer = setTimeout(() => {
                        this.reconnectTimer = null;
                        this.connect();
                    }, 3000);
                }
            };
        } catch (err) {
            this.setStatus('disconnected');
            if (this._totalSubscriberCount() > 0) {
                if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
                this.reconnectTimer = setTimeout(() => {
                    this.reconnectTimer = null;
                    this.connect();
                }, 3000);
            }
        }
    }

    _handleMessage(payload) {
        if (!payload) return;

        // 1. Price Update (Tick)
        if (payload.type === 'price_update' || (payload.type === 'tick' && payload.price !== undefined)) {
            const rawPrice = payload.price ?? payload.last ?? payload.close;
            const parsedPrice = parseFloat(rawPrice);
            if (isNaN(parsedPrice) || parsedPrice <= 0) return;

            const sym = cleanPairSymbol(payload.symbol || this.currentSymbol);
            const formatted = {
                symbol: sym,
                price: parsedPrice,
                bid: payload.bid !== undefined && payload.bid !== null ? parseFloat(payload.bid) : parsedPrice,
                ask: payload.ask !== undefined && payload.ask !== null ? parseFloat(payload.ask) : parsedPrice,
                last: payload.last !== undefined && payload.last !== null ? parseFloat(payload.last) : parsedPrice,
                volume: payload.volume !== undefined ? parseFloat(payload.volume) : 0,
                change_percent: payload.change_percent !== undefined
                    ? parseFloat(payload.change_percent)
                    : (payload.changePercent !== undefined ? parseFloat(payload.changePercent) : 0),
                timestamp: payload.timestamp || Math.floor(Date.now() / 1000)
            };

            this.lastPriceUpdate = formatted;

            // Notify price subscribers
            this.priceListeners.forEach(({ callback, symbolFilter }) => {
                if (!symbolFilter || cleanPairSymbol(symbolFilter) === sym) {
                    try {
                        callback(formatted);
                    } catch (e) {
                        console.error('[UnifiedWS] Price callback error:', e);
                    }
                }
            });

            // Dispatch global browser event for cross-component coordination
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('livePriceUpdate', { detail: formatted }));
            }
            return;
        }

        // 2. Candle Update (Active forming bar + Indicators)
        if (payload.type === 'candle_update') {
            const sym = cleanPairSymbol(payload.symbol || this.currentSymbol);
            const tf = normalizeTimeframe(payload.timeframe || this.currentTimeframe);

            // Notify candle subscribers
            this.candleListeners.forEach(({ callback, symbolFilter, tfFilter }) => {
                const symMatches = !symbolFilter || cleanPairSymbol(symbolFilter) === sym;
                const tfMatches = !tfFilter || normalizeTimeframe(tfFilter) === tf;
                if (symMatches && tfMatches) {
                    try {
                        // Pass bar data as first arg, and complete payload as second
                        callback(payload.data, payload);
                    } catch (e) {
                        console.error('[UnifiedWS] Candle callback error:', e);
                    }
                }
            });

            // Notify strategy subscribers
            this.strategyListeners.forEach(({ callback, symbolFilter }) => {
                if (!symbolFilter || cleanPairSymbol(symbolFilter) === sym) {
                    try {
                        callback(payload);
                    } catch (e) {
                        console.error('[UnifiedWS] Strategy callback error:', e);
                    }
                }
            });

            // Dispatch global candle update event
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('liveCandleUpdate', { detail: payload }));
            }
            return;
        }

        // 3. Fallback / Legacy payload support (e.g. initial_state, initial_strategy_state)
        if (payload.type === 'initial_strategy_state' || payload.type === 'strategy_update' || payload.type === 'initial_state') {
            this.strategyListeners.forEach(({ callback }) => {
                try {
                    callback(payload);
                } catch (e) {
                    console.error('[UnifiedWS] Generic strategy callback error:', e);
                }
            });
        }
    }

    /**
     * Dynamically switch active subscription pair / timeframe
     */
    switchSubscription({ symbol, timeframe, strategyId }) {
        let changed = false;

        if (symbol) {
            const cleanSym = cleanPairSymbol(symbol);
            if (cleanSym && cleanSym !== this.currentSymbol) {
                this.currentSymbol = cleanSym;
                changed = true;
            }
        }

        if (timeframe) {
            const normTf = normalizeTimeframe(timeframe);
            if (normTf && normTf !== this.currentTimeframe) {
                this.currentTimeframe = normTf;
                changed = true;
            }
        }

        if (strategyId && strategyId !== this.currentStrategyId) {
            this.currentStrategyId = strategyId;
            changed = true;
        }

        if (changed) {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                const payload = {
                    action: 'subscribe',
                    symbol: this.currentSymbol,
                    timeframe: this.currentTimeframe
                };
                try {
                    this.socket.send(JSON.stringify(payload));
                    console.log(`[UnifiedWS] Sent subscription switch:`, payload);
                } catch (err) {
                    console.error('[UnifiedWS] Failed to send subscription action:', err);
                }
            } else {
                this.ensureConnected();
            }
        }
    }

    /**
     * Subscribe to live price ticks
     */
    subscribePrice(callback, symbolFilter) {
        if (typeof callback !== 'function') return () => {};

        const sub = { callback, symbolFilter };
        this.priceListeners.add(sub);

        if (symbolFilter) {
            this.switchSubscription({ symbol: symbolFilter });
        }

        this.ensureConnected();

        return () => {
            this.priceListeners.delete(sub);
            this._checkIdle();
        };
    }

    /**
     * Subscribe to live candle ticks / forming bars
     */
    subscribeCandles(callback, symbolFilter, tfFilter) {
        if (typeof callback !== 'function') return () => {};

        const sub = { callback, symbolFilter, tfFilter };
        this.candleListeners.add(sub);

        this.switchSubscription({ symbol: symbolFilter, timeframe: tfFilter });
        this.ensureConnected();

        return () => {
            this.candleListeners.delete(sub);
            this._checkIdle();
        };
    }

    /**
     * Subscribe to strategy alerts & indicators
     */
    subscribeStrategy(callback, symbolFilter, strategyId) {
        if (typeof callback !== 'function') return () => {};

        const sub = { callback, symbolFilter, strategyId };
        this.strategyListeners.add(sub);

        if (symbolFilter || strategyId) {
            this.switchSubscription({ symbol: symbolFilter, strategyId });
        }
        this.ensureConnected();

        return () => {
            this.strategyListeners.delete(sub);
            this._checkIdle();
        };
    }

    _checkIdle() {
        if (this._totalSubscriberCount() === 0) {
            // Keep connected for a 15-second grace period during page transitions
            if (!this.disconnectTimer) {
                this.disconnectTimer = setTimeout(() => {
                    this.disconnectTimer = null;
                    if (this._totalSubscriberCount() === 0 && this.socket) {
                        try {
                            this.socket.close();
                        } catch (e) {}
                        this.socket = null;
                        this.setStatus('disconnected');
                    }
                }, 15000);
            }
        }
    }
}

// Global Singleton Instance
export const unifiedSocket = new UnifiedSocketManager();
export default unifiedSocket;
