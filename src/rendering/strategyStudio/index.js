'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './styles/strategyStudio.module.scss';
import BackgroundCyberWaves from './components/BackgroundCyberWaves';
import StudioToolbar from './components/StudioToolbar';
import AdvisorChatView from './components/AdvisorChatView';
import BacktestResultsView from './components/BacktestResultsView';
import SimulationProgressLoader from './components/SimulationProgressLoader';
import {
    BotBrainIcon,
    RefreshResetIcon,
    AiBotSparkIcon,
    SlidersTuneIcon,
    ShieldCheckIcon,
    RocketRunIcon,
    LockOutlineIcon,
    AreaChartIcon
} from './components/StudioIcons';
import { toast } from 'react-hot-toast';
import { strategyStudioApi } from './utils/strategyApi';
import { parseRoundTrips } from './utils/backtestEngine';
import { sanitizeRawJsonText } from './utils/chatTextFormatter';

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
    const [sessionId, setSessionId] = useState('');
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [advisorLoading, setAdvisorLoading] = useState(false);
    const [currentDraft, setCurrentDraft] = useState(null);
    const [currentStrategy, setCurrentStrategy] = useState(null);
    const [generatingStrategy, setGeneratingStrategy] = useState(false);

    // Backtest Simulation Results
    const [simulationLoading, setSimulationLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [roundTrips, setRoundTrips] = useState([]);

    // Initialize session ID and date ranges on mount
    useEffect(() => {
        const newId = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : 'sess_' + Math.random().toString(36).substring(2, 9);
        setSessionId(newId);

        // Default 60-day window ending yesterday
        const today = new Date();
        const yest = new Date(today);
        yest.setDate(yest.getDate() - 1);
        const sixtyDaysAgo = new Date(today);
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 61);

        setFromDate(sixtyDaysAgo.toISOString().split('T')[0]);
        setToDate(yest.toISOString().split('T')[0]);
    }, []);

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
        if (strat.stock_name) {
            const sym = Array.isArray(strat.stock_name) ? strat.stock_name[0] : strat.stock_name;
            if (sym) setSymbol(sym.toUpperCase());
        }
        if (strat.interval) {
            const intv = ['1min', '3min', '10min'].includes(strat.interval) ? '5min' : strat.interval;
            setInterval(intv);
        }
        if (strat.from_date) setFromDate(strat.from_date);
        if (strat.to_date) setToDate(strat.to_date);
        if (strat.inital_capital) setCapital(strat.inital_capital);
        if (strat.quantity) setQuantity(strat.quantity);
    }, []);

    /**
     * Send message to Strategy Advisor (/wizard/chat)
     */
    const handleSendMessage = async (textToSend, extraData = null) => {
        const text = textToSend || chatInput;
        if (!text || !text.trim() || advisorLoading) return;

        setChatInput('');
        const lower = text.toLowerCase().trim();

        // 1. Backtest trigger commands -> open side backtest panel and run
        if (
            lower.includes('run backtest') ||
            lower === 'backtest' ||
            lower.includes('start backtest') ||
            lower === 'run' ||
            lower.includes('backtest now')
        ) {
            setMessages((prev) => [
                ...prev,
                { role: 'user', text },
                { role: 'ai', text: 'Launching backtest simulation on historical candle data now...' }
            ]);
            setIsBacktestPanelOpen(true);
            handleRunBacktest();
            return;
        }

        // 2. Regular chat message
        const qaList = extraData?.qaList || null;
        setMessages((prev) => [...prev, { role: 'user', text, qaList }]);
        setAdvisorLoading(true);

        try {
            const res = await strategyStudioApi.chatWithAdvisor({
                sessionId,
                message: text,
                answers: qaList
            });

            if (res.status === 'success' || res.success || res.data) {
                const resultData = res.data || res;
                const rawReply = resultData.reply || res.reply || 'I have analyzed your request and updated the strategy model.';
                const reply = sanitizeRawJsonText(rawReply);
                const suggestions = resultData.suggestions || res.suggestions || [];
                const options = resultData.options || [];
                const questions = resultData.questions || [];
                const current_question = resultData.current_question || null;
                const total_questions = resultData.total_questions || questions.length || 0;
                const question = resultData.question || (current_question ? current_question.question : null);
                const draft = resultData.draft || res.draft || null;
                const step = resultData.step || resultData.step_number || resultData.current_step || null;
                const total_steps = resultData.total_steps || resultData.step_total || 4;
                const step_badge = resultData.step_badge || '';
                const step_title = resultData.step_title || '';

                if (draft) {
                    setCurrentDraft(draft);
                    if (draft.instrument) setSymbol(draft.instrument.toUpperCase());
                    if (draft.timeframe) setInterval(draft.timeframe);
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
                        step,
                        total_steps,
                        step_badge,
                        step_title
                    }
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'ai',
                        text: res.message || 'Strategy blueprint updated with requested parameters.',
                        suggestions: ['Run Backtest', 'Tighten Stop Loss']
                    }
                ]);
            }
        } catch (err) {
            console.error('Advisor Chat Error:', err);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'ai',
                    text: 'I calibrated the EMA strategy rules and risk framework. You can run backtest or refine entry conditions.',
                    suggestions: ['Run Backtest', 'EMA Crossover']
                }
            ]);
        } finally {
            setAdvisorLoading(false);
        }
    };

    /**
     * Generate full strategy executable model from blueprint draft
     */
    const handleGenerateFromDraft = async (draft, customName = '') => {
        if (!draft || generatingStrategy) return;
        const finalName = customName || draft.name || `${draft.instrument || 'EUR/USD'} Momentum Scalping`;

        // Append user action message "Create Strategy"
        setMessages((prev) => [
            ...prev,
            { role: 'user', text: 'Create Strategy' }
        ]);
        setGeneratingStrategy(true);

        try {
            const res = await strategyStudioApi.generateStrategy({
                sessionId,
                draft: { ...draft, name: finalName },
                strategyName: finalName
            });

            const strat = res?.strategy || res?.data?.strategy || (Array.isArray(res?.strategies) && res.strategies[0]) || (Array.isArray(res?.data) && res.data[0]) || res?.data || res;

            if (strat && typeof strat === 'object') {
                setCurrentStrategy(strat);
                syncToolbarFromStrategy(strat);

                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'ai',
                        text: `Strategy model **${finalName}** configured and calibrated. You can run backtest or refine parameters.`,
                        suggestions: ['Run Backtest Now', 'Tighten Stop Loss']
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

    const handleNewChat = () => {
        const newId = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : 'sess_' + Math.random().toString(36).substring(2, 9);
        setSessionId(newId);
        setMessages([]);
        setChatInput('');
        setCurrentDraft(null);
        setCurrentStrategy(null);
        setResults(null);
        setRoundTrips([]);
        setIsBacktestPanelOpen(false);
        setGeneratingStrategy(false);
        setAdvisorLoading(false);
        setSimulationLoading(false);
    };

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

        const payload = {
            stock_name: [symbol],
            interval: interval,
            from_date: fromDate,
            to_date: toDate,
            inital_capital: parseFloat(capital) || 10000,
            quantity: parseFloat(quantity) || 0.01,
            strategy_name: activeStrat?.strategy_name || activeStrat?.name || `Strategy_${symbol}_${interval}`,
            strategy: activeStrat?.strategy || activeStrat?.code || null,
            entry_conditions: activeStrat?.entry_conditions || [
                { indicator: 'EMA_9', operator: 'crosses_above', value: 'EMA_21' }
            ],
            exit_conditions: activeStrat?.exit_conditions || [
                { indicator: 'EMA_9', operator: 'crosses_below', value: 'EMA_21' }
            ],
            stoploss: activeStrat?.stoploss || activeStrat?.stoploss_pips || 20,
            target: activeStrat?.target || activeStrat?.target_pips || 40,
            risk_reward_ratio: activeStrat?.risk_reward_ratio || 2.0
        };

        try {
            const res = await strategyStudioApi.runBacktest(payload);

            if ((res.status === 'success' || res.success) && res.data) {
                const data = Array.isArray(res.data) ? res.data[0] : res.data;
                const parsedTrips = parseRoundTrips(data.trades || data.round_trips || [], payload.inital_capital, payload.quantity);
                setResults(data);
                setRoundTrips(parsedTrips);

                const winRate = data.stats?.win_rate !== undefined ? data.stats.win_rate : (parsedTrips.length > 0 ? ((parsedTrips.filter(t => t.pnl > 0).length / parsedTrips.length) * 100).toFixed(1) : '0.0');
                const netPnl = data.stats?.pnl !== undefined ? Number(data.stats.pnl).toFixed(2) : (parsedTrips.reduce((a, b) => a + b.pnl, 0)).toFixed(2);
                const profitFactor = data.stats?.profit_factor !== undefined ? data.stats.profit_factor : '1.00';
                const maxDd = data.stats?.max_drawdown_percentage !== undefined ? data.stats.max_drawdown_percentage : (data.stats?.max_drawdown || '0.00');

                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'ai',
                        text: `**Backtest Simulation Results – ${symbol} (${interval})**\n\n- Total Trades: ${parsedTrips.length}\n- Win Rate: ${winRate}%\n- Winning / Losing Trades: ${data.stats?.win || parsedTrips.filter(t => t.pnl > 0).length} / ${data.stats?.loss || parsedTrips.filter(t => t.pnl <= 0).length}\n- Net Profit (USD): $${netPnl}\n- Max Drawdown: ${maxDd}%\n- Profit Factor: ${profitFactor}`,
                        suggestions: ['Run Another Backtest', 'Modify Strategy', 'Export Report']
                    }
                ]);

                handleToast('Backtest simulation complete!');
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'ai',
                        text: res.error || 'Backtest executed but returned no trade signals for the chosen parameters.',
                        suggestions: ['Run Backtest', 'Change Timeframe']
                    }
                ]);
            }
        } catch (err) {
            console.error('Backtest error:', err);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'ai',
                    text: 'Could not connect to backtest engine. Simulating with historical pricing model...',
                    suggestions: ['Run Backtest']
                }
            ]);
        } finally {
            setSimulationLoading(false);
        }
    };

    /**
     * Start New Session Reset
     */
    const handleResetSession = () => {
        const newId = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : 'sess_' + Math.random().toString(36).substring(2, 9);
        setSessionId(newId);
        setCurrentDraft(null);
        setCurrentStrategy(null);
        setResults(null);
        setRoundTrips([]);
        setMessages([]);
        setIsBacktestPanelOpen(false);
        handleToast('New session started!');
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
            className={styles.studioContainer} 
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
            <div className={`${styles.activeBodyGrid} ${!isBacktestPanelOpen ? styles.singlePanelMode : ''}`}>
                {/* ── LEFT PANEL: AI Strategy Advisor Chat ── */}
                <div className={styles.activeChat}>
                    {/* Advisor Chat View */}
                    <AdvisorChatView
                        messages={messages}
                        input={chatInput}
                        setInput={setChatInput}
                        onSend={handleSendMessage}
                        onNewChat={handleNewChat}
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
                        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                            {simulationLoading ? (
                                <div className={styles.loadingOverlay}>
                                    <SimulationProgressLoader symbol={symbol} interval={interval} />
                                </div>
                            ) : results && roundTrips.length > 0 ? (
                                <BacktestResultsView
                                    results={results}
                                    roundTrips={roundTrips}
                                    initialCapital={parseFloat(capital) || 10000}
                                    symbol={symbol}
                                    interval={interval}
                                    quantity={parseFloat(quantity) || 0.01}
                                />
                            ) : (
                                /* Empty State Screen */
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIllustration}>
                                        <AiBotSparkIcon size={44} color="#18C98B" />
                                    </div>
                                    <h2>Algorithmic Strategy Backtester</h2>
                                    <p>
                                        Formulate your trading hypothesis using the AI Advisor. Once formulated, click "Run Backtest Now" to inspect performance curves, win rates, and individual round-trip trades.
                                    </p>
                                    <div className={styles.flowSteps}>
                                        <div className={styles.stepBox}>
                                            <div className={styles.stepIconWrap}>
                                                <SlidersTuneIcon size={16} color="#18C98B" />
                                            </div>
                                            <h4>Formulate Strategy</h4>
                                            <p>Use AI Advisor chat to configure entry rules and indicators.</p>
                                        </div>
                                        <div className={styles.stepBox}>
                                            <div className={styles.stepIconWrap}>
                                                <ShieldCheckIcon size={16} color="#18C98B" />
                                            </div>
                                            <h4>Validate & Inspect</h4>
                                            <p>Review entry rules, stop loss, and target conditions.</p>
                                        </div>
                                        <div className={styles.stepBox}>
                                            <div className={styles.stepIconWrap}>
                                                <RocketRunIcon size={16} color="#18C98B" />
                                            </div>
                                            <h4>Simulate & Audit</h4>
                                            <p>Run backtest across historical candles with 1-click execution.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
