'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { interactiveCopilotApi, getInteractiveApiBase, categorizeChatError } from '../utils/strategyApi';

const generateSessionId = () =>
    'sess_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export default function useStrategyCopilot() {
    const [sessionId, setSessionId] = useState(generateSessionId);
    const [metadata, setMetadata] = useState(null);
    const [indIndex, setIndIndex] = useState({});
    const [resp, setResp] = useState(null);
    const [messages, setMessages] = useState([]);
    const [mode, setMode] = useState('view'); // 'view' | 'edit'
    const [editDraft, setEditDraft] = useState(null);
    const [formErrors, setFormErrors] = useState([]);
    const [result, setResult] = useState(null);
    const [busy, setBusy] = useState(false);
    const [apiBase, setApiBase] = useState('');
    const [bootError, setBootError] = useState(null);

    const isInitializedRef = useRef(false);

    // Initialize apiBase on mount
    useEffect(() => {
        setApiBase(getInteractiveApiBase());
    }, []);

    // Apply Copilot Response to state and chat messages
    const applyResponse = useCallback((r, withMessage = true) => {
        setResp(r);
        if (withMessage && r?.reply) {
            setMessages((prev) => [
                ...prev,
                {
                    id: 'ai_' + Date.now() + Math.random(),
                    role: 'ai',
                    text: r.reply,
                    ...(typeof r === 'object' ? r : {})
                },
            ]);
        }
    }, []);

    // Core Chat invocation
    const chat = useCallback(
        async (payload, userText, sid = sessionId, extra = {}) => {
            if (busy) return;
            if (userText) {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: 'usr_' + Date.now() + Math.random(),
                        role: 'user',
                        text: userText,
                        ...extra
                    },
                ]);
            }
            setBusy(true);

            try {
                const { ok, status, body } = await interactiveCopilotApi.chat({
                    session_id: sid,
                    ...payload,
                });

                setBusy(false);

                if (!ok || !body?.success) {
                    const errorDetail = categorizeChatError(body, status);
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: 'err_' + Date.now(),
                            role: 'error',
                            ...errorDetail,
                            retryPayload: { payload, userText, sid, extra }
                        },
                    ]);
                    return;
                }

                // If backend returned a new or normalized session_id
                if (body.session_id && body.session_id !== sid) {
                    setSessionId(body.session_id);
                }

                applyResponse(body.data, true);
            } catch (err) {
                setBusy(false);
                const errorDetail = categorizeChatError(err.message, 0);
                setMessages((prev) => [
                    ...prev,
                    {
                        id: 'err_' + Date.now(),
                        role: 'error',
                        ...errorDetail,
                        retryPayload: { payload, userText, sid, extra }
                    },
                ]);
            }
        },
        [busy, sessionId, applyResponse]
    );

    // Retry a failed message seamlessly
    const retryMessage = useCallback(
        (retryPayload) => {
            if (!retryPayload || busy) return;
            const { payload, sid, extra } = retryPayload;
            // Remove previous error bubble
            setMessages((prev) => prev.filter((m) => m.role !== 'error'));
            chat(payload, null, sid || sessionId, extra);
        },
        [busy, chat, sessionId]
    );

    // Send a message typed by user or clicked via CTA
    const sendMessage = useCallback(
        (text, extra = {}) => {
            const trimmed = (text || '').trim();
            if (!trimmed || busy) return;
            chat({ message: trimmed, ...extra }, trimmed, sessionId, extra);
        },
        [busy, chat, sessionId]
    );

    // Boot fresh session (resets to initial clean state)
    const boot = useCallback(async (shouldStartChat = false) => {
        const nextSid = generateSessionId();
        setSessionId(nextSid);
        setResp(null);
        setResult(null);
        setMode('view');
        setFormErrors([]);
        setMessages([]);
        setBootError(null);
        setBusy(true);

        try {
            const metaRes = await interactiveCopilotApi.getMetadata();
            if (!metaRes.ok || !metaRes.body?.success) {
                const errText =
                    metaRes.body?.error || metaRes.body?.message || `Failed to fetch metadata (HTTP ${metaRes.status})`;
                setBootError(errText);
                setBusy(false);
                return;
            }

            const m = metaRes.body;
            setMetadata(m);

            // Build indicator index
            const index = {};
            (m.indicator_groups || []).forEach((g) => {
                (g.indicators || []).forEach((ind) => {
                    index[ind.name] = ind;
                });
            });
            setIndIndex(index);
            setBusy(false);

            // Only trigger starting chat if explicitly requested
            if (shouldStartChat) {
                await chat({ action: 'start' }, null, nextSid);
            }
        } catch (err) {
            setBootError(err.message);
            setBusy(false);
        }
    }, [chat]);

    // Initial boot on mount: loads metadata in background, leaves messages empty for explore screen
    useEffect(() => {
        if (!isInitializedRef.current) {
            isInitializedRef.current = true;
            boot(false);
        }
    }, [boot]);

    // Save manual modifications from form
    const saveDraft = useCallback(
        async (strategyData) => {
            setBusy(true);
            try {
                const { ok, body } = await interactiveCopilotApi.modify({
                    sessionId,
                    strategy: strategyData,
                });
                setBusy(false);

                if (ok && body?.success) {
                    setMode('view');
                    setFormErrors([]);
                    applyResponse(body.data, false);
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: 'sys_' + Date.now(),
                            role: 'sys',
                            text: 'Strategy updated and saved from the form.',
                        },
                    ]);
                    return { success: true };
                } else {
                    const errs =
                        body?.errors ||
                        body?.data?.errors ||
                        [body?.error || body?.message || 'Failed to save strategy changes'];
                    setFormErrors(Array.isArray(errs) ? errs : [String(errs)]);
                    return { success: false, errors: errs };
                }
            } catch (err) {
                setBusy(false);
                const errs = [err.message || 'Network error saving strategy'];
                setFormErrors(errs);
                return { success: false, errors: errs };
            }
        },
        [sessionId, applyResponse]
    );

    // Run Backtest
    const runBacktest = useCallback(
        async ({ includePlot = true } = {}) => {
            setBusy(true);
            try {
                const { ok, body } = await interactiveCopilotApi.run({
                    sessionId,
                    includePlot,
                });
                setBusy(false);
                setResult(body);

                if (ok && body?.success) {
                    const total = body.total_trades ?? 0;
                    const winRate = Number(body.win_rate ?? 0).toFixed(2);
                    const pnl = Number(body.pnl ?? 0).toFixed(2);
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: 'sys_' + Date.now(),
                            role: 'sys',
                            text: `Backtest finished: ${total} trades, win rate ${winRate}%, PnL $${pnl}. Ask the AI to improve it, modify it yourself, or run again.`,
                        },
                    ]);
                } else {
                    const errMsg = body?.error || body?.message || 'Backtest execution failed';
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: 'sys_' + Date.now(),
                            role: 'sys',
                            text: `Backtest error: ${errMsg}`,
                        },
                    ]);
                }
                return { ok, body };
            } catch (err) {
                setBusy(false);
                setResult({ success: false, error: err.message });
                setMessages((prev) => [
                    ...prev,
                    {
                        id: 'sys_' + Date.now(),
                        role: 'sys',
                        text: `Backtest network error: ${err.message}`,
                    },
                ]);
                return { ok: false, error: err.message };
            }
        },
        [sessionId]
    );

    const handleUpdateApiBase = useCallback(
        (newBase) => {
            const clean = (newBase || '').trim().replace(/\/+$/, '');
            if (typeof window !== 'undefined') {
                localStorage.setItem('copilot_api', clean);
            }
            setApiBase(clean);
            boot();
        },
        [boot]
    );

    return {
        sessionId,
        metadata,
        indIndex,
        resp,
        messages,
        mode,
        setMode,
        editDraft,
        setEditDraft,
        formErrors,
        setFormErrors,
        result,
        busy,
        apiBase,
        bootError,
        boot,
        sendMessage,
        retryMessage,
        saveDraft,
        runBacktest,
        handleUpdateApiBase,
    };
}
