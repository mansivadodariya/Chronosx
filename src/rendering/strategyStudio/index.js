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
        setSessionId('sess_' + Math.random().toString(36).substring(2, 9));
        
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

        setMessages([
            {
                role: 'ai',
                text: "Hello! I am your AI Strategy Copilot. Describe any market hypothesis or archetype (Donchian breakout, EMA pullbacks, Bollinger squeezes), and I'll generate the quantitative rules and run simulation backtests for you.",
                suggestions: [
                    'Build a Donchian breakout on XAUUSD',
                    'Design an EMA 20/50 crossover setup',
                    'Bollinger mean reversion strategy',
                    'Liquidity sweep & ICT scalp model'
                ]
            }
        ]);
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('user:updated', syncUser);
            }
        };
    }, []);

    // Auto-scroll on new message
    useEffect(() => {
        if (viewMode === 'chat' && chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [messages, advisorLoading, viewMode]);

    // Handle smooth wheel scrolling in chat mode
    useEffect(() => {
        if (viewMode !== 'chat') return;

        const originalOverflow = document.body.style.overflow;
        if (typeof window !== 'undefined' && window.lenis) {
            window.lenis.stop();
        }

        const scrollEl = chatScrollRef.current;
        const container = chatContainerRef.current;

        const handleWheel = (e) => {
            if (!scrollEl) return;
            const target = e.target;
            if (target && target.tagName === 'TEXTAREA' && target.scrollHeight > target.clientHeight) {
                return;
            }
            scrollEl.scrollTop += e.deltaY;
            e.preventDefault();
            e.stopPropagation();
        };

        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        } else if (scrollEl) {
            scrollEl.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            document.body.style.overflow = originalOverflow;
            if (typeof window !== 'undefined' && window.lenis) {
                window.lenis.start();
            }
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            } else if (scrollEl) {
                scrollEl.removeEventListener('wheel', handleWheel);
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

    // Chat with AI Advisor
    const handleSendMessage = async (textToSend) => {
        const text = textToSend || (viewMode === 'explore' ? homeQuery : chatInput);
        if (!text || !text.trim() || advisorLoading) return;

        setViewMode('chat');
        setHomeQuery('');
        setChatInput('');
        setSelectedCategory(null);

        const lower = text.toLowerCase();
        if (lower.includes('run backtest') || lower.includes('backtest now') || lower === 'run') {
            setMessages((prev) => [...prev, { role: 'user', text }]);
            handleRunBacktest();
            return;
        }

        const newMsg = { role: 'user', text };
        setMessages((prev) => [...prev, newMsg]);
        setAdvisorLoading(true);

        try {
            const res = await strategyStudioApi.chatWithAdvisor({ sessionId, message: text });
            if (res.status === 'success' && res.data) {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'ai',
                        text: res.data.reply,
                        suggestions: res.data.suggestions || [],
                        draft: res.data.draft || null
                    }
                ]);

                if (res.data.draft) {
                    setCurrentDraft(res.data.draft);
                    if (res.data.draft.instrument) setSymbol(res.data.draft.instrument);
                    if (res.data.draft.timeframe) setInterval(res.data.draft.timeframe);
                }
            }
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { role: 'ai', text: 'Error communicating with strategy advisor. Please try again.' }
            ]);
        } finally {
            setAdvisorLoading(false);
        }
    };

    // Generate Strategy JSON from AI draft
    const handleGenerateStrategy = async (draft) => {
        setGeneratingStrategy(true);
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

                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'ai',
                        text: 'Strategy JSON generated and verified against schema. Click "Run Backtest" below to simulate historical performance on candle data.',
                        suggestions: ['Run Backtest Now', 'View Strategy JSON']
                    }
                ]);
                handleToast('Strategy JSON generated successfully!');
            }
        } catch (err) {
            handleToast('Failed to generate strategy JSON');
        } finally {
            setGeneratingStrategy(false);
        }
    };

    // Run Backtest Simulation
    const handleRunBacktest = async (customStrategy = null) => {
        setSimulationLoading(true);
        const activeStrat = customStrategy || currentStrategy;

        let entryConditions = activeStrat?.entry_conditions || {
            entry_start_time: '00:00',
            entry_end_time: '23:45',
            condition_type: 'all',
            rules: [
                {
                    indicator1: 'close',
                    indicator1_params: {},
                    comparator: '>',
                    indicator2: 'donchian',
                    indicator2_params: { window: 20, band: 'upper' }
                }
            ]
        };

        let exitConditions = activeStrat?.exit_conditions || {
            exit_time: '23:45',
            target_pips: activeStrat?.target_pips || 50,
            stoploss_pips: activeStrat?.stoploss_pips || 25,
            condition_type: 'any',
            rules: [
                {
                    indicator1: 'close',
                    indicator1_params: {},
                    comparator: '<',
                    indicator2: 'donchian',
                    indicator2_params: { window: 20, band: 'lower' }
                }
            ]
        };

        const payload = {
            strategy_name: activeStrat?.strategy_name || 'Quantitative Strategy Simulation',
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
            if (res.success && res.data?.length > 0) {
                const stockResult = res.data[0];
                const trips = parseRoundTrips(stockResult.trades || [], capital, quantity);
                setResults(stockResult);
                setRoundTrips(trips);
                handleToast('Backtest simulation completed successfully!');
            } else {
                handleToast('Simulation returned no data for selected parameters');
            }
        } catch (err) {
            handleToast('Simulation execution error');
        } finally {
            setSimulationLoading(false);
        }
    };

    const handleResetSession = () => {
        setSessionId('sess_' + Math.random().toString(36).substring(2, 9));
        setCurrentDraft(null);
        setCurrentStrategy(null);
        setResults(null);
        setRoundTrips([]);
        setSelectedCategory(null);
        setMessages([
            {
                role: 'ai',
                text: "Session reset. I am ready to craft your next trading strategy!",
                suggestions: ['Donchian Breakout', 'EMA Crossover', 'RSI Reversal', 'Bollinger Bands']
            }
        ]);
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
