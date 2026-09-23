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
    RocketRunIcon
} from './components/StudioIcons';
import { toast } from 'react-hot-toast';
import { strategyStudioApi } from './utils/strategyApi';
import { parseRoundTrips } from './utils/backtestEngine';

const INITIAL_ALEX_MESSAGE = {
    role: 'ai',
    text: "Hey! I'm Alex, your forex strategy advisor 🤖\n\nTell me what you have in mind - whether it's a trend-following Donchian setup, an EMA crossover, or a volatility breakout. What are you thinking?",
    suggestions: ['Trend Following', 'Donchian Breakout', 'EMA Crossover', 'Bollinger Breakout', 'Scalping']
};

export default function StrategyStudio() {
    // Strategy Parameters (Toolbar & Execution)
    const [symbol, setSymbol] = useState('XAUUSD');
    const [interval, setInterval] = useState('15min');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [capital, setCapital] = useState(10000);
    const [quantity, setQuantity] = useState(1);

    // AI Advisor Chat States
    const [sessionId, setSessionId] = useState('');
    const [messages, setMessages] = useState([INITIAL_ALEX_MESSAGE]);
    const [chatInput, setChatInput] = useState('');
    const [advisorLoading, setAdvisorLoading] = useState(false);
    const [currentDraft, setCurrentDraft] = useState(null);
    const [currentStrategy, setCurrentStrategy] = useState(null);
    const [generatingStrategy, setGeneratingStrategy] = useState(false);
    const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);

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
    const handleSendMessage = async (textToSend) => {
        const text = textToSend || chatInput;
        if (!text || !text.trim() || advisorLoading) return;

        setChatInput('');
        const lower = text.toLowerCase().trim();

        // 1. Backtest trigger commands
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
                { role: 'ai', text: '🚀 Launching backtest simulation on historical candle data now...' }
            ]);
            handleRunBacktest();
            return;
        }

        // 2. Regular chat message
        setMessages((prev) => [...prev, { role: 'user', text }]);
        setAdvisorLoading(true);

        try {
            const res = await strategyStudioApi.chatWithAdvisor({
                sessionId,
                message: text
            });

            if (res.status === 'success' || res.success || res.data) {
                const resultData = res.data || res;
                const reply = resultData.reply || res.reply || 'I have analyzed your request and updated the strategy model.';
                const suggestions = resultData.suggestions || res.suggestions || [];
                const draft = resultData.draft || res.draft || null;

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
                        draft
                    }
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'ai',
                        text: res.error || "Something went wrong. Let's try again!",
                        suggestions: ['Trend Following', 'Donchian Breakout', 'EMA Crossover']
                    }
                ]);
            }
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'ai',
                    text: 'Could not reach backend. Make sure the server is running on port 7009.',
                    suggestions: ['Trend Following', 'Donchian Breakout', 'EMA Crossover']
                }
            ]);
        } finally {
            setAdvisorLoading(false);
        }
    };

    /**
     * Generate specification from Draft Blueprint
     */
    const handleGenerateFromDraft = async (draft) => {
        setGeneratingStrategy(true);
        try {
            const res = await strategyStudioApi.generateStrategy({
                sessionId,
                draft: draft || currentDraft
            });

            if (res.status === 'success' && res.strategies?.length > 0) {
                const strat = res.strategies[0];
                setCurrentStrategy(strat);
                syncToolbarFromStrategy(strat);

                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'ai',
                        text: 'Your strategy model has been generated and validated! You can click "🚀 Run Backtest Now" below to simulate it immediately.',
                        suggestions: ['🚀 Run Backtest Now', 'Tighten Stop Loss', 'EMA Crossover']
                    }
                ]);
                handleToast('Strategy model configured successfully!');
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'ai',
                        text: 'Failed to generate strategy: ' + (res.error || 'Unknown error'),
                        suggestions: ['Retry Generation', 'Donchian Breakout', 'EMA Crossover']
                    }
                ]);
            }
        } catch (err) {
            handleToast('Connection error while generating strategy.');
            setMessages((prev) => [
                ...prev,
                {
                    role: 'ai',
                    text: 'Connection error while generating strategy.',
                    suggestions: ['Retry Generation', 'Donchian Breakout']
                }
            ]);
        } finally {
            setGeneratingStrategy(false);
        }
    };

    /**
     * Execute Backtest Simulation
     */
    const handleRunBacktest = async (customStrategy = null) => {
        setSimulationLoading(true);

        const activeStrat = customStrategy || currentStrategy;
        if (customStrategy) {
            setCurrentStrategy(customStrategy);
            syncToolbarFromStrategy(customStrategy);
        }

        const targetSymbol = activeStrat?.stock_name
            ? (Array.isArray(activeStrat.stock_name) ? activeStrat.stock_name[0] : activeStrat.stock_name)
            : symbol;
        const targetInterval = activeStrat?.interval || interval;

        try {
            let entryConditions = activeStrat?.entry_conditions;
            let exitConditions = activeStrat?.exit_conditions;
            let entryType = activeStrat?.entry_type ?? 0;
            let isMis = activeStrat?.is_mis ?? true;

            if (!entryConditions) {
                entryConditions = {
                    entry_start_time: '00:00',
                    entry_end_time: '23:45',
                    condition_type: 'all',
                    rules: [
                        {
                            indicator1: { name: 'close', parameters: {} },
                            operator: 'crossover',
                            indicator2: { name: 'donchian_upper', parameters: { length: 20, offset: 0 } }
                        }
                    ]
                };
            }

            if (!exitConditions) {
                exitConditions = {
                    target: currentDraft?.target_pips || 50,
                    target_type: 'points',
                    stoploss: currentDraft?.stoploss_pips || 25,
                    stoploss_type: 'points',
                    condition_type: 'all',
                    rules: []
                };
            }

            const payload = {
                stock_name: [targetSymbol || 'XAUUSD'],
                from_date: fromDate || '2024-01-01',
                to_date: toDate || '2024-03-01',
                interval: targetInterval || '15min',
                is_mis: isMis,
                entry_type: entryType,
                quantity: parseInt(quantity, 10) || 1,
                inital_capital: parseFloat(capital) || 10000,
                data_provider: 'DB',
                include_plot: true,
                entry_conditions: entryConditions,
                exit_conditions: exitConditions
            };

            const res = await strategyStudioApi.runBacktest(payload);

            if (res.success && res.data && res.data.length > 0) {
                const stockRes = res.data[0];
                setResults(stockRes);
                const trips = parseRoundTrips(stockRes, parseFloat(capital) || 10000, parseInt(quantity, 10) || 1);
                setRoundTrips(trips);

                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'ai',
                        text: `✓ Backtest simulation complete! ${trips.length} round-trip trades were executed across the selected historical period. Performance metrics and charts are rendered in the studio.`,
                        suggestions: ['Run Another Backtest', 'Modify Strategy', 'New Strategy']
                    }
                ]);
                handleToast('Backtest simulation complete!');
            } else {
                setResults(null);
                setRoundTrips([]);
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'ai',
                        text: res.error || 'Backtest executed but returned no trade signals for the chosen parameters.',
                        suggestions: ['Adjust Timeframe', 'Test on XAUUSD', 'Try EMA Setup']
                    }
                ]);
            }
        } catch (err) {
            handleToast('Simulation execution error');
            setMessages((prev) => [
                ...prev,
                {
                    role: 'ai',
                    text: 'Could not connect to backtest engine. Make sure the backend server is running on port 7009.',
                    suggestions: ['Try Again', 'Donchian Breakout', 'EMA Crossover']
                }
            ]);
        } finally {
            setSimulationLoading(false);
        }
    };

    /**
     * Reset the active session and chat history
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
        setMessages([INITIAL_ALEX_MESSAGE]);
        handleToast('New session started!');
    };

    return (
        <div className={styles.studioContainer} data-lenis-prevent="true">
            {/* Main 2-Panel Workspace Layout */}
            <div className={styles.activeBodyGrid}>
                {/* ── LEFT PANEL: AI Strategy Advisor Chat ── */}
                <div className={styles.activeChat}>
                    {/* Left Panel Header */}
                    <div className={styles.sideHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                            <div className={styles.headerIconWrap}>
                                <BotBrainIcon size={16} color="#18C98B" />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span className={styles.title}>
                                    AI Strategy Advisor
                                </span>
                                <div className={styles.statusPillSmall}>
                                    <span className={styles.statusDot} />
                                    <span>Online</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {currentDraft && (
                                <span className={styles.panelBadge}>
                                    Blueprint Ready
                                </span>
                            )}
                            <button
                                type="button"
                                className={styles.btnHeaderNewSession}
                                onClick={handleResetSession}
                                title="Start New Strategy Session"
                            >
                                <RefreshResetIcon size={13} />
                                <span>New Session</span>
                            </button>
                        </div>
                    </div>

                    {/* Advisor Chat View */}
                    <AdvisorChatView
                        messages={messages}
                        input={chatInput}
                        setInput={setChatInput}
                        onSend={handleSendMessage}
                        loading={advisorLoading}
                        currentDraft={currentDraft}
                        onGenerateFromDraft={handleGenerateFromDraft}
                        generatingStrategy={generatingStrategy}
                        onChipClick={handleSendMessage}
                        onRunBacktestFromCard={() => handleRunBacktest()}
                    />
                </div>

                {/* ── RIGHT PANEL: Backtest Command Studio & Results ── */}
                <div className={styles.activeResultsCard}>
                    {/* Continuous Moving Smoky Cyber Waves Inside Right Studio Side Box */}
                    <BackgroundCyberWaves />

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
                            />
                        ) : (
                            /* Empty State Screen */
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIllustration}>
                                    <AiBotSparkIcon size={44} color="#18C98B" />
                                </div>
                                <h2>Algorithmic Strategy Backtester</h2>
                                <p>
                                    Formulate your trading hypothesis on the left using the AI Advisor. Once formulated, run backtest simulation to inspect performance curves, win rates, and individual round-trip trades.
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
            </div>
        </div>
    );
}
