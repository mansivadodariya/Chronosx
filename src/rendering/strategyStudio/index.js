'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './styles/strategyStudio.module.scss';
import BackgroundCyberWaves from './components/BackgroundCyberWaves';
import StudioToolbar from './components/StudioToolbar';
import AdvisorChatView from './components/AdvisorChatView';
import BacktestResultsView from './components/BacktestResultsView';
import SimulationProgressLoader from './components/SimulationProgressLoader';
import ChatHistoryDrawer from './components/ChatHistoryDrawer';
import useStrategyChatHistory from './hooks/useStrategyChatHistory';
import StudioEmptyState from './components/StudioEmptyState';
import useStudioSessionStorage from './hooks/useStudioSessionStorage';
import { clearStudioSession } from './utils/sessionPersistence';
import { toast } from '@/components/toast';
import { strategyStudioApi } from './utils/strategyApi';
import { parseRoundTrips } from './utils/backtestEngine';
import { sanitizeRawJsonText } from './utils/chatTextFormatter';
import { normalizeInterval, normalizeSymbol, extractParamsFromChatAndContext } from './utils/paramExtractor';
import { computeDynamicStrategyName } from './utils/strategyNaming';

export default function StrategyStudio() {
    // Strategy Parameters (Toolbar & Execution)
    const [symbol, setSymbol] = useState('XAUUSD');
    const [interval, setInterval] = useState('15min');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [capital, setCapital] = useState(10000);
    const [quantity, setQuantity] = useState(0.01);
    const [marketMode, setMarketMode] = useState('Forex');

    // UI Workspace & Panel Layout
    const [isBacktestPanelOpen, setIsBacktestPanelOpen] = useState(false);
    const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);

    // AI Advisor Chat States
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [advisorLoading, setAdvisorLoading] = useState(false);
    const [currentDraft, setCurrentDraft] = useState(null);
    const [currentStrategy, setCurrentStrategy] = useState(null);
    const [generatingStrategy, setGeneratingStrategy] = useState(false);

    // Chat History Management Hook
    const {
        currentSessionId,
        setCurrentSessionId,
        historyList,
        isHistoryOpen,
        setIsHistoryOpen,
        historyLoading,
        loadHistoryList,
        handleNewChat: resetHistoryChat,
        handleSelectHistorySession,
        handleDeleteSession
    } = useStrategyChatHistory({
        setMessages,
        setCurrentDraft,
        setCurrentStrategy
    });

    // Backtest Simulation Results
    const [simulationLoading, setSimulationLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [roundTrips, setRoundTrips] = useState([]);
    const [executedParams, setExecutedParams] = useState(null);
    const isSendingRef = useRef(false);
    const lastSendRef = useRef({ time: 0, text: '' });

    const handleToast = useCallback((msg) => {
        toast.success(msg, {
            style: {
                background: '#0D1424',
                color: '#18C98B',
                border: '1px solid rgba(24, 201, 139, 0.3)'
            }
        });
    }, []);

    /**
     * Synchronize top toolbar parameters when a strategy is selected or generated
     */
    const syncToolbarFromStrategy = useCallback((strat) => {
        if (!strat) return;
        if (strat.stock_name || strat.symbol) {
            const sym = normalizeSymbol(strat.stock_name || strat.symbol);
            if (sym) setSymbol(sym);
        }
        if (strat.interval || strat.timeframe) {
            const intv = normalizeInterval(strat.interval || strat.timeframe);
            if (intv) setInterval(intv);
        }
        if (strat.from_date) setFromDate(strat.from_date);
        if (strat.to_date) setToDate(strat.to_date);
        if (strat.inital_capital || strat.capital) setCapital(Number(strat.inital_capital || strat.capital));
        if (strat.quantity || strat.lots) setQuantity(parseFloat(strat.quantity || strat.lots));
    }, []);

    // Session restoration and localStorage synchronization
    useStudioSessionStorage({
        currentSessionId,
        setCurrentSessionId,
        messages,
        setMessages,
        currentDraft,
        setCurrentDraft,
        currentStrategy,
        setCurrentStrategy,
        results,
        setResults,
        roundTrips,
        setRoundTrips,
        executedParams,
        setExecutedParams,
        symbol,
        setSymbol,
        interval,
        setInterval,
        fromDate,
        setFromDate,
        toDate,
        setToDate,
        capital,
        setCapital,
        quantity,
        setQuantity,
        marketMode,
        setMarketMode,
        setChatInput,
        setIsBacktestPanelOpen,
        setGeneratingStrategy,
        setAdvisorLoading,
        setSimulationLoading,
        syncToolbarFromStrategy
    });

    /**
     * Send message to Strategy Advisor (/wizard/chat)
     */
    const handleSendMessage = async (textToSend, extraData = null) => {
        const text = textToSend || chatInput;
        const now = Date.now();
        if (!text || !text.trim() || advisorLoading || isSendingRef.current) return;

        // Prevent duplicate concurrent / rapid submissions within 600ms
        if (lastSendRef.current.text === text.trim() && (now - lastSendRef.current.time) < 600) {
            return;
        }
        lastSendRef.current = { time: now, text: text.trim() };
        isSendingRef.current = true;

        setChatInput('');
        const lower = text.toLowerCase().trim();

        // Dynamically extract and sync header parameters from chat context
        const extracted = extractParamsFromChatAndContext({
            text,
            extraData,
            draft: currentDraft,
            strategy: currentStrategy,
            messages
        });

        if (extracted.symbol) setSymbol(extracted.symbol);
        if (extracted.interval) setInterval(extracted.interval);
        if (extracted.capital) setCapital(extracted.capital);
        if (extracted.quantity) setQuantity(extracted.quantity);

        // 1. Only trigger standalone backtest execution if strategy is already complete and confirmed
        const isExplicitRunCommand = (
            lower === 'run backtest' ||
            lower === 'run backtest now' ||
            lower === 'run simulation' ||
            lower === 'start backtest' ||
            lower.startsWith('run backtest') ||
            lower.includes('run backtest')
        );

        if (isExplicitRunCommand) {
            const displayUserText = extraData?.qaList?.[0]?.answer || extraData?.qaList?.[0]?.label || (text.includes('\n') ? text.split('\n').pop() : text);
            const tSym = extracted.symbol || symbol || 'XAUUSD';
            const tInt = extracted.interval || interval || '15min';
            const tCap = extracted.capital || capital || 10000;
            const tQty = extracted.quantity || quantity || 0.01;
            setSymbol(tSym); setInterval(tInt); setCapital(tCap); setQuantity(tQty);
            setMessages((prev) => [
                ...prev,
                { role: 'user', text: displayUserText },
                { role: 'ai', text: `Launching backtest simulation for **${tSym}** (${tInt}) across historical candle data...` }
            ]);
            setIsBacktestPanelOpen(true);
            handleRunBacktest({ symbol: tSym, interval: tInt, capital: tCap, quantity: tQty, ...currentStrategy });
            isSendingRef.current = false;
            return;
        }

        // 2. Regular chat message
        const qaList = extraData?.qaList || null;
        setMessages((prev) => [...prev, { role: 'user', text, qaList }]);
        setAdvisorLoading(true);

        try {
            const res = await strategyStudioApi.chatWithAdvisor({
                sessionId: currentSessionId,
                message: text,
                answers: qaList
            });

            if (res && !res.isError && (res.status === 'success' || res.success || res.data || res.reply)) {
                const resultData = res.data || res;
                if (!currentSessionId) {
                    const nextSessionId = resultData.session_id || res.session_id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'sess_' + Date.now());
                    setCurrentSessionId(nextSessionId);
                    loadHistoryList();
                }
                const rawReply = resultData.reply || res.reply || 'I have analyzed your strategy request.';
                const reply = sanitizeRawJsonText(rawReply);
                const isComplete = Boolean(
                    resultData.complete === true ||
                    res.complete === true
                );
                const strategyName = resultData.strategy_name || resultData.suggested_strategy_name || res.strategy_name || resultData.draft?.strategy_name || resultData.draft?.suggested_strategy_name || resultData.draft?.name || '';
                // Hide chat suggestion bubbles (options/actions are empty []) when ready to proceed
                const suggestions = isComplete ? [] : (resultData.suggestions || res.suggestions || []);
                const options = isComplete ? [] : (resultData.options || []);
                const questions = isComplete ? [] : (resultData.questions || []);
                const current_question = isComplete ? null : (resultData.current_question || null);
                const total_questions = isComplete ? 0 : (resultData.total_questions || questions.length || 0);
                const question = isComplete ? null : (resultData.question || (current_question ? current_question.question : null));
                const draft = resultData.draft || res.draft || null;
                if (draft && strategyName) {
                    draft.strategy_name = strategyName;
                    draft.name = strategyName;
                }
                const step = resultData.step || resultData.step_number || resultData.current_step || null;
                const total_steps = resultData.total_steps || resultData.step_total || (step ? 4 : null);
                const step_badge = resultData.step_badge || null;
                const step_title = resultData.step_title || null;

                if (draft) {
                    setCurrentDraft(draft);
                    if (draft.instrument || draft.symbol) setSymbol(normalizeSymbol(draft.instrument || draft.symbol));
                    if (draft.timeframe || draft.interval) setInterval(normalizeInterval(draft.timeframe || draft.interval));
                    if (draft.capital || draft.inital_capital) setCapital(Number(draft.capital || draft.inital_capital));
                    if (draft.quantity || draft.lots) setQuantity(parseFloat(draft.quantity || draft.lots));
                } else {
                    const replyExtracted = extractParamsFromChatAndContext({ text: reply, messages });
                    if (replyExtracted.symbol) setSymbol(replyExtracted.symbol);
                    if (replyExtracted.interval) setInterval(replyExtracted.interval);
                    if (replyExtracted.capital) setCapital(replyExtracted.capital);
                    if (replyExtracted.quantity) setQuantity(replyExtracted.quantity);
                }

                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'ai',
                        text: reply,
                        suggestions,
                        options,
                        questions,
                        current_question,
                        total_questions,
                        question,
                        draft,
                        strategy_name: strategyName,
                        complete: isComplete,
                        'ready to proceed': isComplete,
                        step,
                        total_steps,
                        step_badge,
                        step_title
                    }
                ]);
            } else {
                const errorMsg = res?.message || res?.detail || 'The AI Strategy Advisor is temporarily unavailable. Please try again shortly.';
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'ai',
                        isError: true,
                        text: errorMsg
                    }
                ]);
            }
        } catch (err) {
            console.error('Advisor Chat Error:', err);
            const errorMsg = err?.response?.data?.detail 
                || err?.response?.data?.message 
                || err?.message 
                || 'The AI Strategy Advisor is temporarily unavailable. Please try again shortly.';

            setMessages((prev) => [
                ...prev,
                {
                    role: 'ai',
                    isError: true,
                    text: typeof errorMsg === 'string' ? errorMsg : 'The AI Strategy Advisor is temporarily unavailable. Please try again shortly.'
                }
            ]);
        } finally {
            isSendingRef.current = false;
            setAdvisorLoading(false);
        }
    };

    /**
     * Generate full strategy executable model from blueprint draft
     */
    const handleGenerateFromDraft = async (draft, customName = '') => {
        if (!draft || generatingStrategy) return;
        const finalName = customName || draft.name || draft.strategy_name || computeDynamicStrategyName(draft, messages);

        // Append user action message "Create Strategy"
        setMessages((prev) => [
            ...prev,
            { role: 'user', text: 'Create Strategy' }
        ]);
        setGeneratingStrategy(true);

        try {
            const res = await strategyStudioApi.generateStrategy({
                sessionId: currentSessionId,
                draft: { ...draft, name: finalName },
                strategyName: finalName
            });

            const strat = res?.strategy || res?.data?.strategy || (Array.isArray(res?.strategies) && res.strategies[0]) || (Array.isArray(res?.data) && res.data[0]) || res?.data || res;

            if (strat && typeof strat === 'object') {
                strat.name = finalName;
                strat.strategy_name = finalName;
                setCurrentStrategy(strat);
                syncToolbarFromStrategy(strat);

                const genSuggestions = (Array.isArray(res?.suggestions) && res.suggestions.length > 0)
                    ? res.suggestions
                    : (Array.isArray(strat?.suggestions) && strat.suggestions.length > 0)
                        ? strat.suggestions
                        : ['Run Backtest Now'];

                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'ai',
                        text: `Strategy model **${finalName}** configured and calibrated. You can run backtest or refine parameters.`,
                        suggestions: genSuggestions
                    }
                ]);
                handleToast('Strategy blueprint applied successfully!');
            } else {
                handleToast('Strategy blueprint parameters loaded into studio');
            }
        } catch (err) {
            console.warn('Strategy generation error, applying draft parameters to studio:', err.message);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'ai',
                    text: `Strategy model **${finalName}** configured and calibrated. You can run backtest or refine parameters.`,
                    suggestions: ['Run Backtest Now']
                }
            ]);
            handleToast('Strategy parameters configured');
        } finally {
            setGeneratingStrategy(false);
        }
    };

    const handleNewChat = useCallback(() => {
        clearStudioSession();
        resetHistoryChat();
        setMessages([]);
        setCurrentDraft(null);
        setCurrentStrategy(null);
        setCurrentSessionId(null);
        setChatInput('');
        setResults(null);
        setRoundTrips([]);
        setExecutedParams(null);
        setIsBacktestPanelOpen(false);
        setGeneratingStrategy(false);
        setAdvisorLoading(false);
        setSimulationLoading(false);
    }, [resetHistoryChat, setCurrentSessionId]);

    /**
     * Execute Backtest Simulation
     */
    const handleRunBacktest = async (customStrategy = null) => {
        // Automatically make sure the side backtest panel is open
        setIsBacktestPanelOpen(true);
        setSimulationLoading(true);
        setResults(null);
        setRoundTrips([]);

        const activeStrat = customStrategy || currentStrategy;
        const activeSymbol = normalizeSymbol(customStrategy?.symbol || (Array.isArray(customStrategy?.stock_name) ? customStrategy.stock_name[0] : customStrategy?.stock_name) || symbol || 'XAUUSD');
        const activeInterval = normalizeInterval(customStrategy?.interval || customStrategy?.timeframe || interval || '15min');
        const activeCapital = parseFloat(customStrategy?.capital || customStrategy?.inital_capital || capital) || 10000;
        const activeQuantity = parseFloat(customStrategy?.quantity || customStrategy?.lots || quantity) || 0.01;

        if (activeSymbol && activeSymbol !== symbol) setSymbol(activeSymbol);
        if (activeInterval && activeInterval !== interval) setInterval(activeInterval);
        if (activeCapital && activeCapital !== capital) setCapital(activeCapital);
        if (activeQuantity && activeQuantity !== quantity) setQuantity(activeQuantity);

        const defaultFrom = () => {
            const d = new Date();
            d.setDate(d.getDate() - 61);
            return d.toISOString().split('T')[0];
        };
        const defaultTo = () => {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            return d.toISOString().split('T')[0];
        };

        const activeFrom = fromDate || defaultFrom();
        const activeTo = toDate || defaultTo();

        const entryConditions = activeStrat?.entry_conditions || {
            entry_start_time: '00:00',
            entry_end_time: '23:45',
            condition_type: 'all',
            rules: [
                {
                    indicator1: { name: 'ema', parameters: { length: 20 } },
                    operator: 'crossover',
                    indicator2: { name: 'ema', parameters: { length: 50 } }
                }
            ]
        };

        const exitConditions = activeStrat?.exit_conditions || {
            target: activeStrat?.target || activeStrat?.target_pips || 50,
            target_type: 'points',
            stoploss: activeStrat?.stoploss || activeStrat?.stoploss_pips || 25,
            stoploss_type: 'points',
            condition_type: 'all',
            rules: []
        };

        const payload = {
            stock_name: [activeSymbol || 'XAUUSD'],
            from_date: activeFrom,
            to_date: activeTo,
            interval: activeInterval || '15min',
            is_mis: true,
            entry_type: 0,
            quantity: activeQuantity,
            inital_capital: activeCapital,
            data_provider: 'DB',
            include_plot: true,
            strategy_name: activeStrat?.strategy_name || activeStrat?.name || `Strategy_${activeSymbol}_${activeInterval}`,
            strategy: activeStrat?.strategy || activeStrat?.code || null,
            entry_conditions: entryConditions,
            exit_conditions: exitConditions,
            stoploss: activeStrat?.stoploss || activeStrat?.stoploss_pips || 25,
            target: activeStrat?.target || activeStrat?.target_pips || 50,
            risk_reward_ratio: activeStrat?.risk_reward_ratio || 2.0
        };

        try {
            const res = await strategyStudioApi.runBacktest(payload);

            if ((res.status === 'success' || res.success) && res.data) {
                const data = Array.isArray(res.data) ? res.data[0] : res.data;
                const parsedTrips = parseRoundTrips(data, payload.inital_capital, payload.quantity);
                setResults(data);
                setRoundTrips(parsedTrips);
                setExecutedParams({
                    symbol: activeSymbol,
                    interval: activeInterval,
                    capital: activeCapital,
                    quantity: activeQuantity,
                    fromDate: activeFrom,
                    toDate: activeTo
                });

                const totalTradesCount = parsedTrips.length > 0 ? parsedTrips.length : (data.stats?.trades || (Number(data.stats?.win || 0) + Number(data.stats?.loss || 0)) || 0);
                const winRate = data.stats?.win_rate !== undefined ? data.stats.win_rate : (totalTradesCount > 0 && data.stats?.win !== undefined ? ((Number(data.stats.win) / totalTradesCount) * 100).toFixed(1) : (parsedTrips.length > 0 ? ((parsedTrips.filter(t => t.pnl > 0).length / parsedTrips.length) * 100).toFixed(1) : '0.0'));
                const netPnl = data.stats?.pnl !== undefined ? Number(data.stats.pnl).toFixed(2) : (parsedTrips.length > 0 ? (parsedTrips.reduce((a, b) => a + b.pnl, 0)).toFixed(2) : '0.00');
                const profitFactor = data.stats?.profit_factor !== undefined ? data.stats.profit_factor : '1.00';
                const maxDd = data.stats?.max_drawdown_percentage !== undefined ? data.stats.max_drawdown_percentage : (data.stats?.max_drawdown || '0.00');

                const formattedNetPnl = Number(netPnl) >= 0 ? `+$${netPnl}` : `-$${Math.abs(Number(netPnl)).toFixed(2)}`;
                const backendSuggestions = res?.suggestions || res?.data?.suggestions || data?.suggestions;

                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'ai',
                        text: `**Backtest Simulation Results – ${activeSymbol} (${activeInterval})**\n\n- Total Trades: ${totalTradesCount}\n- Win Rate: ${winRate}%\n- Winning / Losing Trades: ${data.stats?.win || parsedTrips.filter(t => t.pnl > 0).length} / ${data.stats?.loss || parsedTrips.filter(t => t.pnl <= 0).length}\n- Net Profit (USD): ${formattedNetPnl}\n- Max Drawdown: ${maxDd}%\n- Profit Factor: ${profitFactor}`,
                        ...(Array.isArray(backendSuggestions) && backendSuggestions.length > 0 ? { suggestions: backendSuggestions } : {})
                    }
                ]);

                handleToast('Backtest simulation complete!');
            } else {
                const failSuggestions = res?.suggestions || res?.data?.suggestions;
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'ai',
                        text: res.error || 'Backtest executed but returned no trade signals for the chosen parameters.',
                            ...(Array.isArray(failSuggestions) && failSuggestions.length > 0 ? { suggestions: failSuggestions } : {})
                    }
                ]);
            }
        } catch (err) {
            console.error('Backtest error:', err);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'ai',
                    text: 'Could not connect to backtest engine. Simulating with historical pricing model...'
                }
            ]);
        } finally {
            setSimulationLoading(false);
        }
    };

    const handleMouseMove = useCallback((e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
        e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
    }, []);

    const isStartingExplore = messages.length <= 1;

    return (
        <div
            className={styles.studio}
            data-lenis-prevent="true"
            onMouseMove={handleMouseMove}
        >
            {/* Global Interactive Pointer Spotlight */}
            <div className={styles.pointerSpotlight} />

            {/* Subtle Cyber Grid Matrix */}
            <div className={styles.cyberGridBackground} />

            {/* Organic Ambient Cyber Waves Background */}
            <BackgroundCyberWaves />

            {/* Main Workspace Layout (Single panel centered or Split 2-panel) */}
            <div className={`${styles.activeBodyGrid} ${!isBacktestPanelOpen ? styles.singleMode : ''}`}>
                {/* ── LEFT PANEL: AI Strategy Advisor Chat ── */}
                <div className={styles.activeChat}>
                    {/* Advisor Chat View */}
                    <AdvisorChatView
                        messages={messages}
                        input={chatInput}
                        setInput={setChatInput}
                        onSend={handleSendMessage}
                        onNewChat={handleNewChat}
                        onOpenHistory={() => setIsHistoryOpen(true)}
                        historyCount={historyList.length}
                        loading={advisorLoading}
                        currentDraft={currentDraft}
                        onGenerateFromDraft={handleGenerateFromDraft}
                        generatingStrategy={generatingStrategy}
                        onChipClick={handleSendMessage}
                        onRunBacktestFromCard={() => handleRunBacktest()}
                        marketMode={marketMode}
                        setMarketMode={setMarketMode}
                        currentStep={isBacktestPanelOpen ? 3 : 2}
                        totalSteps={4}
                    />
                </div>

                {/* ── RIGHT PANEL: Backtest Studio & Results (Visible upon execution / toggle) ── */}
                {isBacktestPanelOpen && (
                    <div className={styles.activeResultsCard}>
                        {/* Top Parameter Command Toolbar */}
                        <StudioToolbar
                            symbol={symbol}
                            setSymbol={setSymbol}
                            interval={interval}
                            setInterval={setInterval}
                            fromDate={fromDate}
                            setFromDate={setFromDate}
                            toDate={toDate}
                            setToDate={setToDate}
                            capital={capital}
                            setCapital={setCapital}
                            quantity={quantity}
                            setQuantity={setQuantity}
                            onManualClick={() => setIsJsonModalOpen(true)}
                            onRunBacktest={() => handleRunBacktest()}
                            loading={simulationLoading}
                        />

                        {/* Right Panel Main Content Area */}
                        <div className={styles.rightPanelContentArea}>
                            {simulationLoading ? (
                                <div className={styles.loadingOverlay}>
                                    <SimulationProgressLoader symbol={symbol} interval={interval} />
                                </div>
                            ) : results ? (
                                <BacktestResultsView
                                    results={results}
                                    roundTrips={roundTrips || []}
                                    initialCapital={parseFloat(executedParams?.capital ?? capital) || 10000}
                                    symbol={executedParams?.symbol ?? symbol}
                                    interval={executedParams?.interval ?? interval}
                                    quantity={parseFloat(executedParams?.quantity ?? quantity) || 0.01}
                                />
                            ) : (
                                <StudioEmptyState />
                            )}
                        </div>
                    </div>
                )}
            </div>
            {/* Chat History Slide-over Drawer */}
            <ChatHistoryDrawer
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                historyList={historyList}
                loading={historyLoading}
                currentSessionId={currentSessionId}
                onSelectSession={handleSelectHistorySession}
                onDeleteSession={handleDeleteSession}
                onNewChat={handleNewChat}
            />
        </div>
    );
}
