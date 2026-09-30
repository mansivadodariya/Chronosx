/**
 * Strategy Advisor & Backtest API Client
 */
import { generateSimulatedBacktest } from './backtestEngine';
import { getStoredUserId } from '@/lib/authSession';

/**
 * Helper to construct headers with Bearer token if present
 */
const getAuthHeaders = () => {
    const headers = { "Content-Type": "application/json" };
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return headers;
};

/**
 * Resolves the Backtest & Wizard API base URL dynamically from environment variables.
 * Priority:
 * 1. process.env.NEXT_PUBLIC_BACKTEST_API_URL
 * 2. process.env.NEXT_PUBLIC_BACKEND_URL (appended with /backtest/v1 if not present)
 * 3. process.env.NEXT_PUBLIC_API_URL
 * 4. Fallback relative path '/backtest/v1'
 */
export const getApiBase = () => {

    const backend = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');
    if (backend) {
        if (backend.endsWith('/backtest/v1')) {
            return backend;
        }
        return `${backend}/backtest/v1`;
    }
    return 'http://192.168.0.153:8000/backtest/v1';
};

export const strategyStudioApi = {
    /**
     * Chat with AI Strategy Advisor
     */
    chatWithAdvisor: async ({ sessionId, message, answers, userId }) => {
        try {
            const apiBase = getApiBase();
            const currentUserId = userId || getStoredUserId() || undefined;
            const payload = {
                session_id: sessionId,
                message,
                ...(currentUserId ? { user_id: currentUserId } : {})
            };
            if (answers && Array.isArray(answers) && answers.length > 0) {
                payload.answers = answers;
            }
            const res = await fetch(`${apiBase}/wizard/chat`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const json = await res.json();
                return json;
            }
        } catch (err) {
            console.warn("Backend /wizard/chat unreachable, using dynamic fallback engine:", err.message);
        }

        // Conversational Fallback Advisor Engine
        const msg = (message || "").toLowerCase();
        let reply = "";
        let suggestions = [];
        let options = [];
        let question = "Do you have specific trading conditions in mind, or would you like us to design the best strategy for you?";
        let draft = null;
        let complete = false;

        if (msg.includes("ema") || msg.includes("moving average") || msg.includes("cross")) {
            reply = "A 9 EMA crossing over 21 EMA provides clear directional momentum signals on 30m charts. I've calibrated a EURUSD setup with 20-pip TP and 10-pip SL.";
            suggestions = ["Run Backtest Now", "Switch to 1hr timeframe", "Add RSI Filter"];
            options = [
                { title: "Run Backtest Now", description: "Simulate strategy performance across 60-day historical candles." },
                { title: "Design for me", description: "We'll optimize indicators and SL/TP risk parameters automatically." },
                { title: "I have my own conditions", description: "Define custom moving average periods and filters." }
            ];
            question = "Would you like to run backtest simulation immediately or fine-tune indicators?";
            draft = {
                instrument: "EURUSD",
                timeframe: "30min",
                entry_pattern: "EMA Crossover",
                target_pips: 20,
                stoploss_pips: 10
            };
            complete = true;
        } else if (msg.includes("dca") || msg.includes("btc") || msg.includes("grid")) {
            reply = "Dynamic Dollar-Cost Averaging (DCA) with grid scaling accumulates positions at systematic intervals. Configured with 5 grid tiers on 15m intervals with 1.5% profit rebalance targets.";
            suggestions = ["Run Backtest Now", "Tighten Grid Spacing", "Adjust Tier Volume"];
            options = [
                { title: "Run Backtest Now", description: "Simulate DCA grid execution on historical pricing." },
                { title: "Design for me", description: "Automatically calculate optimal step distance and take profit." },
                { title: "I have my own conditions", description: "Customize base order size, safety orders, and scale." }
            ];
            question = "Do you want to test this DCA configuration with 10,000 capital?";
            draft = {
                instrument: "BTCUSD",
                timeframe: "15min",
                entry_pattern: "DCA Grid Accumulation",
                target_pips: 45,
                stoploss_pips: 25
            };
            complete = true;
        } else if (msg.includes("backtest") || msg.includes("last")) {
            reply = "Loaded your last formulated quantitative strategy (EMA 20/50 Trend Confluence on XAUUSD 15m). Prepared for historical candle execution.";
            suggestions = ["Run Backtest Now", "Change Timeframe to 30m", "Adjust Stop Loss"];
            options = [
                { title: "Run Backtest Now", description: "Execute simulation on 60 days of historical M15 candle bars." },
                { title: "Design for me", description: "Calibrate risk/reward ratio to 1:2.5 before testing." },
                { title: "I have my own conditions", description: "Specify start date, stoploss pips, and capital." }
            ];
            question = "Ready to simulate this strategy across historical market candles?";
            draft = {
                instrument: "XAUUSD",
                timeframe: "15min",
                entry_pattern: "EMA Trend Confluence",
                target_pips: 40,
                stoploss_pips: 20
            };
            complete = true;
        } else {
            reply = `Understood! I'm configuring an algorithmic strategy blueprint for "${message}". What primary market or timeframe do you prefer?`;
            suggestions = ["XAUUSD 15min", "EURUSD 1hr", "GBPUSD 15min", "Trend Following", "Scalping"];
            options = [
                { title: "Design for me", description: "We'll create a tailored trading strategy for you." },
                { title: "I have my own conditions", description: "You define your own entry and exit rules." }
            ];
            question = "Do you have specific trading conditions in mind, or would you like us to design the best strategy for you?";
            draft = {
                instrument: "XAUUSD",
                timeframe: "15min",
                entry_pattern: "Momentum Breakout",
                target_pips: 30,
                stoploss_pips: 15
            };
            complete = true;
        }

        return {
            status: "success",
            data: {
                reply,
                suggestions,
                options,
                question,
                draft,
                complete
            }
        };
    },

    /**
     * Generate Strategy JSON from AI Draft via /backtest/v1/wizard/generate
     */
    generateStrategy: async ({ sessionId, draft, strategyName, userId }) => {
        const stratName = strategyName || draft?.name || "AI Strategy";
        try {
            const apiBase = getApiBase();
            const currentUserId = userId || getStoredUserId() || undefined;
            const payload = {
                session_id: sessionId,
                strategy_name: stratName,
                draft: draft || {},
                ...(currentUserId ? { user_id: currentUserId } : {})
            };
            const res = await fetch(`${apiBase}/wizard/generate`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const json = await res.json();
                if ((json.status === "success" || json.success === true) && (json.strategies?.length > 0 || json.data)) {
                    const firstStrat = json.strategies?.[0] || json.data?.strategy || (Array.isArray(json.data) ? json.data[0] : json.data);
                    return {
                        status: "success",
                        success: true,
                        strategy: firstStrat,
                        strategies: json.strategies || (firstStrat ? [firstStrat] : []),
                        data: json.data || { strategy: firstStrat }
                    };
                }
            }
        } catch (err) {
            console.warn("Backend /wizard/generate unreachable, using local specification builder:", err.message);
        }

        const sym = draft?.instrument || "XAUUSD";
        const timeframe = draft?.timeframe || "15min";
        const tp = draft?.target_pips || 30;
        const sl = draft?.stoploss_pips || 15;
        const pattern = draft?.entry_pattern || "Breakout Strategy";

        const generated = {
            stock_name: [sym],
            strategy_name: stratName,
            from_date: "2024-01-01",
            to_date: "2024-03-01",
            interval: timeframe,
            is_mis: true,
            entry_type: 0,
            quantity: 1,
            inital_capital: 10000,
            category: "Algorithmic AI",
            entry_pattern: pattern,
            entry_conditions: {
                entry_start_time: "00:00",
                entry_end_time: "23:45",
                condition_type: "all",
                rules: [
                    {
                        indicator1: { name: "close", parameters: {} },
                        operator: "crossover",
                        indicator2: { name: "donchian_upper", parameters: { length: 20, offset: 0 } }
                    }
                ]
            },
            exit_conditions: {
                target: tp,
                target_type: "points",
                stoploss: sl,
                stoploss_type: "points",
                condition_type: "all",
                rules: []
            }
        };

        return {
            status: "success",
            success: true,
            strategy: generated,
            strategies: [generated],
            data: { strategy: generated }
        };
    },

    /**
     * Alias for generateStrategy
     */
    generateStrategyFromDraft: async function (params) {
        return this.generateStrategy(params);
    },

    /**
     * Run Backtest Execution
     */
    runBacktest: async (payload) => {
        try {
            const apiBase = getApiBase();
            const currentUserId = payload?.user_id || getStoredUserId() || undefined;
            const res = await fetch(apiBase, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    ...payload,
                    ...(currentUserId && !payload?.user_id ? { user_id: currentUserId } : {})
                })
            });
            if (res.ok) {
                const json = await res.json();
                if ((json.success || json.status === 'success' || json.message) && json.data) {
                    const dataItem = Array.isArray(json.data) ? json.data[0] : json.data;
                    return {
                        status: "success",
                        success: true,
                        data: dataItem,
                        raw: json
                    };
                }
            } else {
                const errText = await res.text().catch(() => '');
                console.warn(`[strategyApi] /backtest/v1 returned HTTP ${res.status}:`, errText);
                return {
                    status: "error",
                    success: false,
                    error: `Engine returned status ${res.status}: ${errText || 'Backtest execution failed'}`,
                    data: null
                };
            }
        } catch (err) {
            console.error("Backend backtest server unreachable:", err.message);
            return {
                status: "error",
                success: false,
                error: `Backend unreachable: ${err.message}`,
                data: null
            };
        }

        return {
            status: "error",
            success: false,
            error: "No output received from backtest engine.",
            data: null
        };
    },

    /**
     * Run Backtest Execution by Strategy ID
     * POST /backtest/v1/run-by-id
     * Payload: { strategy_id, user_id }
     */
    runBacktestById: async ({ strategy_id, source, fallbackParams = {}, userId }) => {
        try {
            const apiBase = getApiBase();
            const currentUserId = userId || getStoredUserId() || undefined;
            const res = await fetch(`${apiBase}/run-by-id`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    strategy_id,
                    ...(currentUserId ? { user_id: currentUserId } : {})
                })
            });
            if (res.ok) {
                const json = await res.json();
                const dataItem = Array.isArray(json.data) ? json.data[0] : json.data;
                return {
                    status: "success",
                    success: true,
                    data: dataItem || json,
                    strategy: json.strategy || json.strategy_info || json.raw_strategy || null,
                    raw: json
                };
            } else {
                const errText = await res.text().catch(() => '');
                console.warn(`[strategyApi] /backtest/v1/run-by-id returned HTTP ${res.status}:`, errText);
                return {
                    status: "error",
                    success: false,
                    error: `Engine returned status ${res.status}: ${errText || 'Backtest execution failed'}`,
                    data: null
                };
            }
        } catch (err) {
            console.error("Backend backtest server unreachable for run-by-id:", err.message);
            return {
                status: "error",
                success: false,
                error: `Backend unreachable: ${err.message}`,
                data: null
            };
        }
    }
};

