/**
 * Strategy Advisor & Backtest API Client
 */
import { generateSimulatedBacktest } from './backtestEngine';
import { getStoredUserId } from '@/lib/authSession';

/**
 * Helper to construct headers with Bearer token if present
 */
const getAuthHeaders = () => {
    const headers = {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true"
    };
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

    const backend = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKTEST_API_URL || '').replace(/\/+$/, '');
    if (backend) {
        if (backend.endsWith('/backtest/v1')) {
            return backend;
        }
        return `${backend}/backtest/v1`;
    }
    return '/backtest/v1';
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
                message: (message || '').trim()
            };
            if (sessionId) {
                payload.session_id = sessionId;
            }
            if (currentUserId) {
                payload.user_id = currentUserId;
            }
            if (answers && Array.isArray(answers) && answers.length > 0) {
                payload.answers = answers;
            }
            const res = await fetch(`${apiBase}/wizard/chat`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            const json = await res.json().catch(() => null);
            if (res.ok && json) {
                return json;
            }

            const errorDetail = json?.detail || json?.message || json?.error || (res.status === 422 ? 'Unable to process input format. Please refine your query or try again.' : 'The Strategy Advisor service is currently unavailable. Please try again later.');
            return {
                status: "error",
                isError: true,
                message: typeof errorDetail === 'string' ? errorDetail : 'The Strategy Advisor service is currently unavailable. Please try again later.'
            };
        } catch (err) {
            console.warn("Backend /wizard/chat unreachable:", err.message);
            return {
                status: "error",
                isError: true,
                message: "Unable to connect to the AI Strategy Advisor service. Please check your connection and try again shortly."
            };
        }
    },

    /**
     * Fetch list of chat sessions for user
     * GET /backtest/v1/wizard/chat-sessions/{user_id}?limit=30
     */
    getChatSessions: async (userId, limit = 30) => {
        try {
            const apiBase = getApiBase();
            const currentUserId = userId || getStoredUserId();
            if (!currentUserId) return { status: "success", data: [] };
            const res = await fetch(`${apiBase}/wizard/chat-sessions/${currentUserId}?limit=${limit}`, {
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const json = await res.json();
                return json;
            }
        } catch (err) {
            console.warn("Backend /wizard/chat-sessions unreachable:", err.message);
        }
        return { status: "success", data: [] };
    },

    /**
     * Get specific session messages
     * GET /backtest/v1/wizard/chat-sessions/{user_id}?session_id={session_id}
     */
    getSessionMessages: async (userId, sessionId) => {
        try {
            const apiBase = getApiBase();
            const currentUserId = userId || getStoredUserId();
            if (!currentUserId || !sessionId) return { status: "error", data: null };
            const res = await fetch(`${apiBase}/wizard/chat-sessions/${currentUserId}?session_id=${sessionId}`, {
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const json = await res.json();
                return json;
            }
        } catch (err) {
            console.warn("Backend /wizard/chat-sessions with session_id unreachable:", err.message);
        }
        return { status: "error", data: null };
    },

    /**
     * Delete a chat session
     * DELETE /backtest/v1/wizard/chat-sessions/{user_id}/{session_id}
     */
    deleteChatSession: async (userId, sessionId) => {
        try {
            const apiBase = getApiBase();
            const currentUserId = userId || getStoredUserId();
            if (!currentUserId || !sessionId) return { status: "error" };
            const res = await fetch(`${apiBase}/wizard/chat-sessions/${currentUserId}/${sessionId}`, {
                method: "DELETE",
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const json = await res.json();
                return json;
            }
        } catch (err) {
            console.warn("Backend delete chat session unreachable:", err.message);
        }
        return { status: "error" };
    },

    /**
     * Generate Strategy JSON from AI Draft via /backtest/v1/wizard/generate
     */
    generateStrategy: async ({ sessionId, draft, strategyName, userId }) => {
        const stratName = strategyName || draft?.strategy_name || draft?.name || "AI Strategy";
        const finalDraft = {
            ...(draft || {}),
            strategy_name: stratName,
            name: stratName
        };
        const payload = {
            session_id: sessionId,
            strategy_name: stratName,
            draft: finalDraft,
            ...(userId ? { user_id: userId } : {})
        };
        try {
            const apiBase = getApiBase();
            const candidateUrls = [
                `${apiBase}/wizard/generate`,
                '/backtest/v1/wizard/generate'
            ];

            for (const url of candidateUrls) {
                try {
                    const res = await fetch(url, {
                        method: "POST",
                        headers: getAuthHeaders(),
                        body: JSON.stringify(payload)
                    });
                    if (res.ok) {
                        const json = await res.json();
                        if ((json.status === "success" || json.success === true) && (json.strategies?.length > 0 || json.data || json.strategy)) {
                            const firstStrat = json.strategies?.[0] || json.data?.strategy || (Array.isArray(json.data) ? json.data[0] : json.data) || json.strategy;
                            return {
                                status: "success",
                                success: true,
                                strategy: firstStrat,
                                strategies: json.strategies || (firstStrat ? [firstStrat] : []),
                                data: json.data || { strategy: firstStrat }
                            };
                        }
                        if (json && (json.stock_name || json.strategy_name || json.entry_conditions)) {
                            return {
                                status: "success",
                                success: true,
                                strategy: json,
                                strategies: [json],
                                data: json
                            };
                        }
                    } else {
                        const errText = await res.text().catch(() => '');
                        console.warn(`[strategyApi] ${url} returned HTTP ${res.status}:`, errText);
                    }
                } catch (_) {}
            }
        } catch (err) {
            console.warn("Backend /backtest/v1/wizard/generate unreachable, using local specification builder:", err.message);
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
     * If strategy_id is present, executes POST /backtest/v1/run-by-id with { strategy_id }
     */
    runBacktest: async (payload) => {
        try {
            const apiBase = getApiBase();
            const stratId = payload?.strategy_id || payload?.strategyId;
            if (stratId) {
                return await strategyStudioApi.runBacktestById({ strategy_id: stratId });
            }
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
     * Payload: { strategy_id }
     */
    runBacktestById: async ({ strategy_id, strategyId, userId }) => {
        try {
            const apiBase = getApiBase();
            const effectiveStratId = strategy_id || strategyId;
            const res = await fetch(`${apiBase}/run-by-id`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    strategy_id: effectiveStratId
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

/**
 * Resolves the Interactive Strategy Copilot base URL.
 * Priority:
 * 1. localStorage 'copilot_api' (if customized via UI)
 * 2. process.env.NEXT_PUBLIC_BACKTEST_API_URL or process.env.NEXT_PUBLIC_BACKEND_URL
 */
export const getInteractiveApiBase = () => {
    if (typeof window !== 'undefined') {
        const custom = localStorage.getItem('copilot_api');
        if (custom) return custom.replace(/\/+$/, '');
    }
    const envBacktest = process.env.NEXT_PUBLIC_BACKTEST_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    if (envBacktest) {
        const clean = envBacktest.replace(/\/+$/, '');
        return clean.endsWith('/backtest/v1') ? clean : `${clean}/backtest/v1`;
    }
    return '/backtest/v1';
};

/**
 * Interactive Strategy Copilot API Client
 * (Endpoints: /interactive-metadata, /interactive-chat, /interactive-modify, /interactive-run)
 */
export const interactiveCopilotApi = {
    getMetadata: async () => {
        try {
            const base = getInteractiveApiBase();
            const res = await fetch(`${base}/interactive-metadata`, {
                headers: getAuthHeaders(),
            });
            const body = await res.json().catch(() => ({ success: false, error: `HTTP ${res.status}` }));
            return { ok: res.ok, status: res.status, body };
        } catch (err) {
            return { ok: false, status: 0, body: { success: false, error: err.message || 'Failed to fetch' } };
        }
    },

    chat: async (payload) => {
        try {
            const base = getInteractiveApiBase();
            const res = await fetch(`${base}/interactive-chat`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });
            const body = await res.json().catch(() => ({ success: false, error: `HTTP ${res.status}` }));
            return { ok: res.ok, status: res.status, body };
        } catch (err) {
            return {
                ok: false,
                status: 0,
                body: { success: false, error: err.message || 'Failed to fetch' },
            };
        }
    },

    modify: async ({ sessionId, strategy }) => {
        const base = getInteractiveApiBase();
        const res = await fetch(`${base}/interactive-modify`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ session_id: sessionId, strategy }),
        });
        const body = await res.json().catch(() => ({ success: false, error: `HTTP ${res.status}` }));
        return { ok: res.ok, status: res.status, body };
    },

    run: async ({ sessionId, includePlot = true, strategy, strategy_json, strategyJson, strategy_id, strategyId, userId, ...extra } = {}) => {
        const base = getInteractiveApiBase();
        const currentUserId = userId || getStoredUserId() || '';
        const strat = strategy_json || strategyJson || strategy || {};
        const effectiveStratId = strategy_id || strategyId || strat?.strategy_id || strat?.id || extra?.strategy_id;
        const payload = {
            session_id: sessionId || '',
            ...(effectiveStratId ? { strategy_id: effectiveStratId } : {}),
            strategy: strategy || strat,
            strategy_json: strat,
            include_plot: includePlot ?? true,
            user_id: currentUserId,
            ...extra,
        };
        const res = await fetch(`${base}/interactive-run`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        const body = await res.json().catch(() => ({ success: false, error: `HTTP ${res.status}` }));
        return { ok: res.ok, status: res.status, body };
    },

    getSessions: async ({ userId, page = 1, limit = 30 } = {}) => {
        try {
            const base = getInteractiveApiBase();
            const uid = userId || getStoredUserId() || '';
            const queryParams = new URLSearchParams();
            if (uid) queryParams.set('user_id', uid);
            if (page) queryParams.set('page', String(page));
            if (limit) queryParams.set('limit', String(limit));

            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            const res = await fetch(`${base}/interactive-sessions${queryString}`, {
                headers: getAuthHeaders(),
            });
            const body = await res.json().catch(() => ({ success: false, error: `HTTP ${res.status}` }));
            return { ok: res.ok, status: res.status, body };
        } catch (err) {
            return { ok: false, status: 0, body: { success: false, error: err.message || 'Failed to fetch' } };
        }
    },

    getSessionState: async (sessionId) => {
        try {
            const base = getInteractiveApiBase();
            const res = await fetch(`${base}/interactive-sessions?session_id=${encodeURIComponent(sessionId)}`, {
                headers: getAuthHeaders(),
            });
            const body = await res.json().catch(() => ({ success: false, error: `HTTP ${res.status}` }));
            return { ok: res.ok, status: res.status, body };
        } catch (err) {
            return { ok: false, status: 0, body: { success: false, error: err.message || 'Failed to fetch' } };
        }
    },
};

/**
 * Categorize chat errors into actionable states:
 * - 'credits': User out of AI credits -> Upgrade Plan & Get Credits
 * - 'api_unavailable': Server down / Failed to fetch / 502 / 503 / network -> Try Again Later
 * - 'general': Unexpected error / validation -> Try Again
 */
export const categorizeChatError = (errOrBody, status) => {
    const text = String(
        errOrBody?.error ||
        errOrBody?.message ||
        errOrBody?.detail ||
        (typeof errOrBody === 'string' ? errOrBody : '')
    ).toLowerCase();

    const errorCode = String(
        errOrBody?.error_code ||
        errOrBody?.code ||
        errOrBody?.detail?.error_code ||
        ''
    ).toUpperCase();

    // 1. Check for Credit / Balance issues
    const isCredits =
        status === 402 ||
        errorCode === 'INSUFFICIENT_CREDITS' ||
        errorCode === 'OUT_OF_CREDITS' ||
        errorCode === 'NO_CREDITS' ||
        text.includes('credit') ||
        text.includes('insufficient credits') ||
        text.includes('out of credits') ||
        text.includes('no credit') ||
        text.includes('payment required') ||
        text.includes('upgrade plan') ||
        text.includes('quota exceeded') ||
        text.includes('limit reached');

    if (isCredits) {
        return {
            errorType: 'credits',
            title: 'Insufficient AI Credits',
            message: 'You have run out of AI compute credits to continue chatting and generating strategies.',
            suggestion: 'Top up your credits or upgrade your subscription plan to continue building and backtesting strategies.',
            action: 'upgrade',
            actionLabel: 'Upgrade Plan & AI Credits',
            actionUrl: '/subscription-plans',
        };
    }

    // 2. Check for Network / Server / API offline / Failed to fetch
    const isApiOffline =
        status === 0 ||
        !status ||
        (status >= 500 && status <= 504) ||
        text.includes('failed to fetch') ||
        text.includes('network') ||
        text.includes('connection') ||
        text.includes('econnrefused') ||
        text.includes('timeout') ||
        text.includes('unreachable') ||
        text.includes('unavailable') ||
        text.includes('service unavailable') ||
        text.includes('load failed');

    if (isApiOffline) {
        return {
            errorType: 'api_unavailable',
            title: 'AI Service Temporarily Unavailable',
            message: 'Unable to communicate with the Strategy Copilot API at this moment. The backend service may be offline or restarting.',
            suggestion: 'Please try again in a few moments. Your request has been preserved and can be retried immediately.',
            action: 'retry',
            actionLabel: 'Try Again Later',
        };
    }

    // 3. Fallback General Error
    return {
        errorType: 'general',
        title: 'Unable to Process Strategy Request',
        message: errOrBody?.error || errOrBody?.message || 'An unexpected error occurred while processing your strategy prompt.',
        suggestion: 'Please refine your prompt or try again.',
        action: 'retry',
        actionLabel: 'Try Again',
    };
};


