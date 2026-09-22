'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './styles/strategyStudio.module.scss';
import BackgroundCyberWaves from './components/BackgroundCyberWaves';
import AiExploreView from './components/AiExploreView';
import AiChatStreamView from './components/AiChatStreamView';
import {
    ChartTrendIcon,
    ShieldCheckIcon,
    CpuChipIcon
} from './components/StudioIcons';
import { toast } from 'react-hot-toast';
import { strategyStudioApi } from './utils/strategyApi';
import { parseRoundTrips } from './utils/backtestEngine';
import { getStoredUser, getStoredUserId, hydrateUserFromProfile } from '@/lib/authSession';

// Category presets configuration matching Tradezee
const CATEGORY_DATA = {
    strategy: {
        title: 'Strategy',
        icon: <CpuChipIcon size={14} color="#18C98B" />,
        options: [
            'Build a DCA strategy on BTC',
            'Build a grid trading strategy',
            'Backtest my last strategy',
            'Improve my running strategy',
            'Build a momentum strategy from scratch'
        ]
    },
    analyse: {
        title: 'Analyse',
        icon: <ChartTrendIcon size={14} color="#18C98B" />,
        options: [
            'Analyse recent price action on Gold (XAUUSD)',
            'Detect liquidity sweeps & order blocks',
            'Multi-timeframe trend confluence scan',
            'Check current volatility & key support/resistance'
        ]
    },
    auditor: {
        title: 'Account Auditor',
        icon: <ShieldCheckIcon size={14} color="#18C98B" />,
        options: [
            'Audit my account risk exposure & max drawdown',
            'Calculate optimal lot size for 1% risk',
            'Analyze profit factor & win rate history',
            'Check risk-to-reward on open positions'
        ]
    }
};

const createMsgId = (prefix = 'msg') => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

export default function StrategyStudio() {
    // Mode State: 'explore' (Tradezee single starting screen) vs 'chat' (active conversation stream)
    const [viewMode, setViewMode] = useState('explore');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [homeQuery, setHomeQuery] = useState('');
    const [chatInput, setChatInput] = useState('');
    const [userName, setUserName] = useState('Trader');
    const [greetingWord, setGreetingWord] = useState('Good afternoon');

    // Strategy parameters & session
    const [symbol, setSymbol] = useState('XAUUSD');
    const [interval, setInterval] = useState('15min');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [capital, setCapital] = useState(10000);
    const [quantity, setQuantity] = useState(1);

    const [sessionId, setSessionId] = useState('');
    const [messages, setMessages] = useState([]);
    const [advisorLoading, setAdvisorLoading] = useState(false);
    const [currentDraft, setCurrentDraft] = useState(null);
    const [currentStrategy, setCurrentStrategy] = useState(null);
    const [generatingStrategy, setGeneratingStrategy] = useState(false);

    // Results
    const [simulationLoading, setSimulationLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [roundTrips, setRoundTrips] = useState([]);

    const chatScrollRef = useRef(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        const initialSessionId = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : 'sess_' + Math.random().toString(36).substring(2, 9);
        setSessionId(initialSessionId);
        
        const hour = new Date().getHours();
        if (hour < 12) setGreetingWord('Good morning');
        else if (hour < 17) setGreetingWord('Good afternoon');
        else setGreetingWord('Good evening');

        const syncUser = async () => {
            try {
                let user = getStoredUser();
                const userId = getStoredUserId();
                if (userId && (!user?.first_name && !user?.name)) {
                    user = await hydrateUserFromProfile(userId, user);
                }
                const name = user?.first_name || user?.name || (user?.email ? user.email.split('@')[0] : '') || 'Trader';
                if (name) setUserName(name);
            } catch (e) { /* ignore */ }
        };

        syncUser();
        if (typeof window !== 'undefined') {
            window.addEventListener('user:updated', syncUser);
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('user:updated', syncUser);
            }
        };
    }, []);

    // Auto-scroll fallback on new message
    useEffect(() => {
        if (viewMode === 'chat' && chatScrollRef.current) {
            chatScrollRef.current.scrollTo({
                top: chatScrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, advisorLoading, viewMode]);

    // Manage Lenis in chat mode
    useEffect(() => {
        if (viewMode !== 'chat') return;

        const originalOverflow = document.body.style.overflow;
        if (typeof window !== 'undefined' && window.lenis) {
            window.lenis.stop();
        }

        return () => {
            document.body.style.overflow = originalOverflow;
            if (typeof window !== 'undefined' && window.lenis) {
                window.lenis.start();
            }
        };
    }, [viewMode]);

    const handleToast = (msg) => {
        toast.success(msg, {
            style: {
                background: '#0D1424',
                color: '#18C98B',
                border: '1px solid rgba(24, 201, 139, 0.3)'
            }
        });
    };

    /**
     * Chat with AI Advisor — handles all input cases from reference HTML:
     * 1. "run backtest" / "backtest" / "start backtest" / "run" → trigger backtest
     * 2. "view strategy json" / "strategy json" / "show json" → show JSON info
     * 3. Otherwise → send to /wizard/chat API with streaming response
     */
    const handleSendMessage = async (textToSend) => {
        const text = textToSend || (viewMode === 'explore' ? homeQuery : chatInput);
        if (!text || !text.trim() || advisorLoading) return;

        setViewMode('chat');
        setHomeQuery('');
        setChatInput('');
        setSelectedCategory(null);

        const lower = text.toLowerCase();

        // Case 1: Backtest trigger commands (from reference handleSend)
        if (
            lower.includes('run backtest') ||
            lower === 'backtest' ||
            lower.includes('start backtest') ||
            lower === 'run' ||
            lower.includes('backtest now')
        ) {
            setMessages((prev) => [
                ...prev,
                { id: createMsgId('usr'), role: 'user', text },
                {
                    id: createMsgId('ai'),
                    role: 'ai',
                    text: '🚀 Launching backtest simulation on historical candle data now...',
                    isStreaming: true
                }
            ]);
            handleRunBacktest();
            return;
        }

        // Case 2: Strategy JSON viewing (from reference handleSend)
        if (
            lower.includes('view strategy json') ||
            lower.includes('strategy json') ||
            lower.includes('show json') ||
            lower.includes('view json')
        ) {
            setMessages((prev) => [
                ...prev,
                { id: createMsgId('usr'), role: 'user', text },
                {
                    id: createMsgId('ai'),
                    role: 'ai',
                    text: currentStrategy
                        ? `Here is your current strategy specification:\n\n${JSON.stringify(currentStrategy, null, 2)}`
                        : 'No strategy has been generated yet. Describe your trading idea and I\'ll build one for you!',
                    suggestions: currentStrategy
                        ? ['🚀 Run Backtest Now', 'Modify Strategy', 'New Strategy']
                        : ['Trend Following', 'Donchian Breakout', 'EMA Crossover'],
                    isStreaming: true
                }
            ]);
            return;
        }

        // Case 3: Regular message → send to Strategy Advisor
        const newMsg = { id: createMsgId('usr'), role: 'user', text };
        setMessages((prev) => [...prev, newMsg]);
        setAdvisorLoading(true);

        try {
            const res = await strategyStudioApi.chatWithAdvisor({
                sessionId,
                message: text
            });

            if (res.status === 'success' || res.success || res.data) {
                const replyText = res.data?.reply || res.reply || 'I am ready to help you formulate a strategy.';
                const suggestions = res.data?.suggestions || res.suggestions || [];
                const draft = res.data?.draft || res.draft || null;

                const aiMsg = {
                    id: createMsgId('ai'),
                    role: 'ai',
                    text: replyText,
                    suggestions,
                    draft: draft,
                    isStreaming: true
                };

                if (draft) {
                    if (draft.instrument) setSymbol(draft.instrument);
                    if (draft.timeframe) setInterval(draft.timeframe);
                    setCurrentDraft(draft);
                }

                setMessages((prev) => [...prev, aiMsg]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: createMsgId('ai_err'),
                        role: 'ai',
                        text: res.error || "Something went wrong. Let's try again!",
                        suggestions: ['Trend Following', 'Donchian Breakout', 'EMA Crossover'],
                        isStreaming: true
                    }
                ]);
            }
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    id: createMsgId('ai_err'),
                    role: 'ai',
                    text: "Could not reach the strategy advisor backend. Make sure the server is running.",
                    suggestions: ['Try Again', 'Donchian Breakout', 'EMA Crossover'],
                    isStreaming: true
                }
            ]);
        } finally {
            setAdvisorLoading(false);
        }
    };

    /**
     * Generate Strategy JSON from AI draft
     * Shows progress steps during generation, then streams the result message
     */
    const handleGenerateStrategy = async (draft) => {
        setGeneratingStrategy(true);

        // Add progress steps message
        setMessages((prev) => [
            ...prev,
            { role: 'ai', progressType: 'generating', isActive: true }
        ]);

        try {
            const res = await strategyStudioApi.generateStrategy({ sessionId, draft: draft || currentDraft });
            if (res.status === 'success' && res.strategies?.length > 0) {
                const strat = res.strategies[0];
                setCurrentStrategy(strat);

                if (strat.stock_name) {
                    const sym = Array.isArray(strat.stock_name) ? strat.stock_name[0] : strat.stock_name;
                    if (sym) setSymbol(sym);
                }
                if (strat.interval) setInterval(strat.interval);

                // Mark progress as done and add result message
                setMessages((prev) => {
                    const updated = [...prev];
                    // Deactivate progress
                    const progressIdx = updated.findLastIndex((m) => m.progressType === 'generating');
                    if (progressIdx >= 0) {
                        updated[progressIdx] = { ...updated[progressIdx], isActive: false };
                    }
                    // Add success message with streaming
                    updated.push({
                        id: createMsgId('ai_strat'),
                        role: 'ai',
                        text: `Your strategy JSON has been generated and validated! You can click "🚀 Run Backtest Now" below to simulate it immediately, or review the JSON specification.`,
                        suggestions: ['🚀 Run Backtest Now', 'View Strategy JSON'],
                        isStreaming: true
                    });
                    return updated;
                });
                handleToast('Strategy JSON generated successfully!');
            } else {
                setMessages((prev) => {
                    const updated = [...prev];
                    const progressIdx = updated.findLastIndex((m) => m.progressType === 'generating');
                    if (progressIdx >= 0) {
                        updated[progressIdx] = { ...updated[progressIdx], isActive: false };
                    }
                    updated.push({
                        id: createMsgId('ai_err'),
                        role: 'ai',
                        text: 'Failed to generate strategy. Please try describing your strategy again.',
                        suggestions: ['Trend Following', 'Donchian Breakout', 'EMA Crossover'],
                        isStreaming: true
                    });
                    return updated;
                });
            }
        } catch (err) {
            handleToast('Failed to generate strategy JSON');
            setMessages((prev) => {
                const updated = [...prev];
                const progressIdx = updated.findLastIndex((m) => m.progressType === 'generating');
                if (progressIdx >= 0) {
                    updated[progressIdx] = { ...updated[progressIdx], isActive: false };
                }
                updated.push({
                    id: createMsgId('ai_err'),
                    role: 'ai',
                    text: 'Connection error while generating strategy. Please try again.',
                    isStreaming: true
                });
                return updated;
            });
        } finally {
            setGeneratingStrategy(false);
        }
    };

    /**
     * Run Backtest Simulation
     * Shows progress steps during execution, then renders results
     */
    const handleRunBacktest = async (customStrategy = null) => {
        setSimulationLoading(true);
        const activeStrat = customStrategy || currentStrategy;

        // Add progress steps message for backtesting
        setMessages((prev) => [
            ...prev,
            { id: createMsgId('prog_backtest'), role: 'ai', progressType: 'backtesting', isActive: true }
        ]);

        let entryConditions = activeStrat?.entry_conditions || {
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

        let exitConditions = activeStrat?.exit_conditions || {
            target: currentDraft?.target_pips || 50,
            target_type: 'points',
            stoploss: currentDraft?.stoploss_pips || 25,
            stoploss_type: 'points',
            condition_type: 'all',
            rules: []
        };

        const payload = {
            stock_name: [symbol],
            from_date: fromDate || '2024-01-01',
            to_date: toDate || '2024-03-01',
            interval: interval || '15min',
            is_mis: activeStrat?.is_mis ?? true,
            entry_type: activeStrat?.entry_type ?? 0,
            quantity: quantity || 1,
            inital_capital: capital || 10000,
            data_provider: 'DB',
            include_plot: true,
            entry_conditions: entryConditions,
            exit_conditions: exitConditions
        };

        try {
            const res = await strategyStudioApi.runBacktest(payload);

            // Deactivate progress steps
            setMessages((prev) => {
                const updated = [...prev];
                const progressIdx = updated.findLastIndex((m) => m.progressType === 'backtesting');
                if (progressIdx >= 0) {
                    updated[progressIdx] = { ...updated[progressIdx], isActive: false };
                }
                return updated;
            });

            if (res.success && res.data?.length > 0) {
                const stockResult = res.data[0];
                const trips = parseRoundTrips(stockResult.trades || [], capital, quantity);
                setResults(stockResult);
                setRoundTrips(trips);

                // Add completion message with streaming
                setMessages((prev) => [
                    ...prev,
                    {
                        id: createMsgId('ai_backtest_res'),
                        role: 'ai',
                        text: `✓ Backtest simulation complete! Results are displayed below. ${trips.length} round-trip trades were executed across the selected period.`,
                        suggestions: ['Run Another Backtest', 'Modify Strategy', 'New Strategy'],
                        isStreaming: true
                    }
                ]);
                handleToast('Backtest simulation completed successfully!');
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: createMsgId('ai_backtest_empty'),
                        role: 'ai',
                        text: 'Simulation returned no data for selected parameters. Try adjusting the date range or strategy rules.',
                        suggestions: ['Try Different Dates', 'Change Symbol', 'New Strategy'],
                        isStreaming: true
                    }
                ]);
                handleToast('Simulation returned no data for selected parameters');
            }
        } catch (err) {
            // Deactivate progress steps on error
            setMessages((prev) => {
                const updated = [...prev];
                const progressIdx = updated.findLastIndex((m) => m.progressType === 'backtesting');
                if (progressIdx >= 0) {
                    updated[progressIdx] = { ...updated[progressIdx], isActive: false };
                }
                updated.push({
                    id: createMsgId('ai_err'),
                    role: 'ai',
                    text: 'Could not connect to backtest engine. Make sure the backend server is running.',
                    isStreaming: true
                });
                return updated;
            });
            handleToast('Simulation execution error');
        } finally {
            setSimulationLoading(false);
        }
    };

    const handleResetSession = () => {
        const newId = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : 'sess_' + Math.random().toString(36).substring(2, 9);
        setSessionId(newId);
        setCurrentDraft(null);
        setCurrentStrategy(null);
        setResults(null);
        setRoundTrips([]);
        setSelectedCategory(null);
        setMessages([]);
        setViewMode('explore');
        handleToast('Session reset completed!');
    };

    return (
        <div className={styles.studioContainer} data-lenis-prevent="true">
            {/* Continuous Moving Smoky Cyber Waves Across Entire Background */}
            <BackgroundCyberWaves />

            {/* AI Bot Builder Views: Explore vs Chat */}
            {viewMode === 'explore' ? (
                <AiExploreView
                    greetingWord={greetingWord}
                    userName={userName}
                    homeQuery={homeQuery}
                    setHomeQuery={setHomeQuery}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    categoryData={CATEGORY_DATA}
                    symbol={symbol}
                    onSendMessage={handleSendMessage}
                />
            ) : (
                <AiChatStreamView
                    chatContainerRef={chatContainerRef}
                    chatScrollRef={chatScrollRef}
                    messages={messages}
                    advisorLoading={advisorLoading}
                    currentDraft={currentDraft}
                    symbol={symbol}
                    interval={interval}
                    capital={capital}
                    results={results}
                    roundTrips={roundTrips}
                    generatingStrategy={generatingStrategy}
                    simulationLoading={simulationLoading}
                    chatInput={chatInput}
                    setChatInput={setChatInput}
                    onSendMessage={handleSendMessage}
                    onGenerateStrategy={handleGenerateStrategy}
                    onRunBacktest={handleRunBacktest}
                    onResetSession={handleResetSession}
                    onBackToExplore={() => setViewMode('explore')}
                />
            )}
        </div>
    );
}
