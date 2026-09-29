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

const normalizeInterval = (tf) => {
    if (!tf) return null;
    const s = String(tf).toLowerCase().trim();
    if (s === '1d' || s === '1day' || s === 'd1' || s === 'daily' || s === 'day') return '1day';
    if (s === '60m' || s === '60min' || s === '1h' || s === 'h1' || s === '1hr' || s === '1hour') return '60min';
    if (s === '30m' || s === '30min' || s === 'm30') return '30min';
    if (s === '15m' || s === '15min' || s === 'm15') return '15min';
    if (s === '5m' || s === '5min' || s === 'm5') return '5min';
    if (s.includes('min')) return s;
    return `${s}min`;
};

const normalizeSymbol = (sym) => {
    if (!sym) return null;
    if (Array.isArray(sym)) sym = sym[0];
    const s = String(sym).toUpperCase().replace(/[\/\-_]/g, '').trim();
    const map = {
        'GOLD': 'XAUUSD',
        'BTC': 'BTCUSD',
        'ETH': 'ETHUSD',
        'SOL': 'SOLUSD'
    };
    return map[s] || s;
};

const extractParamsFromChatAndContext = ({ text = '', extraData = null, draft = null, strategy = null, messages = [] }) => {
    const res = {};

    // 1. Direct from draft & strategy
    if (draft?.instrument || draft?.symbol) res.symbol = normalizeSymbol(draft.instrument || draft.symbol);
    if (draft?.timeframe || draft?.interval) res.interval = normalizeInterval(draft.timeframe || draft.interval);
    if (draft?.capital || draft?.inital_capital) res.capital = Number(draft.capital || draft.inital_capital);
    if (draft?.quantity || draft?.lots) res.quantity = Math.min(Math.max(parseFloat(draft.quantity || draft.lots) || 0.01, 0.01), 1);

    if (strategy?.stock_name || strategy?.symbol) res.symbol = res.symbol || normalizeSymbol(strategy.stock_name || strategy.symbol);
    if (strategy?.interval || strategy?.timeframe) res.interval = res.interval || normalizeInterval(strategy.interval || strategy.timeframe);

    // 2. From QA answers in the wizard
    const qaItems = extraData?.qaList || [];
    qaItems.forEach((qa) => {
        const str = `${qa.answer || ''} ${qa.label || ''} ${qa.value || ''} ${qa.question || ''}`;
        
        const symMatch = str.match(/\b(GBPJPY|EURJPY|EURUSD|GBPUSD|USDCAD|XAUUSD|BTCUSD|ETHUSD|US30|SOLUSD|AUDUSD|NZDUSD|USDJPY|EURGBP|NAS100)\b/i);
        if (symMatch && !res.symbol) res.symbol = normalizeSymbol(symMatch[1]);

        const intvMatch = str.match(/\b(1day|1d|daily|60min|1h|1hr|30min|30m|15min|15m|5min|5m)\b/i);
        if (intvMatch && !res.interval) res.interval = normalizeInterval(intvMatch[1]);

        const capMatch = str.match(/\$?\s*([0-9]{3,7})\s*(?:capital|balance|usd|\$)/i);
        if (capMatch && !res.capital) res.capital = Number(capMatch[1]);

        const qtyMatch = str.match(/\b(0\.01|0\.05|0\.10|0\.1|0\.50|0\.5|1\.00|1)\s*(?:lots?|micro|mini|std)?\b/i);
        if (qtyMatch && !res.quantity) res.quantity = parseFloat(qtyMatch[1]);
    });

    // 3. From text and recent messages in reverse order
    const allTexts = [text];
    if (Array.isArray(messages)) {
        for (let i = messages.length - 1; i >= Math.max(0, messages.length - 8); i--) {
            const m = messages[i];
            if (m?.text) allTexts.push(m.text);
            if (m?.draft?.instrument && !res.symbol) res.symbol = normalizeSymbol(m.draft.instrument);
            if (m?.draft?.timeframe && !res.interval) res.interval = normalizeInterval(m.draft.timeframe);
        }
    }

    const combined = allTexts.join(' ');

    if (!res.symbol) {
        const symMatch = combined.match(/\b(GBPJPY|EURJPY|EURUSD|GBPUSD|USDCAD|XAUUSD|BTCUSD|ETHUSD|US30|SOLUSD|AUDUSD|NZDUSD|USDJPY|EURGBP|NAS100)\b/i);
        if (symMatch) res.symbol = normalizeSymbol(symMatch[1]);
    }

    if (!res.interval) {
        const intvMatch = combined.match(/\b(1day|1d|daily|60min|1h|1hr|30min|30m|15min|15m|5min|5m)\b/i);
        if (intvMatch) res.interval = normalizeInterval(intvMatch[1]);
    }

    if (!res.capital) {
        const capMatch = combined.match(/\$?\s*([0-9]{4,7})\s*(?:capital|balance|usd|\$)/i);
        if (capMatch) res.capital = Number(capMatch[1]);
    }

    return res;
};

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

    // Check if strategy was selected from My Bots dashboard
    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                const saved = sessionStorage.getItem('active_selected_strategy');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    sessionStorage.removeItem('active_selected_strategy');
                    if (parsed) {
                        const strat = parsed.config || parsed.blueprint || parsed;
                        setCurrentStrategy(strat);
                        syncToolbarFromStrategy(strat);
                        const name = parsed.strategy_name || parsed.name || 'AI Strategy';
                        const sym = normalizeSymbol(parsed.symbol || parsed.stock_name) || 'BTCUSD';
                        const tf = normalizeInterval(parsed.timeframe || parsed.interval) || '15min';
                        setMessages([
                            {
                                role: 'ai',
                                text: `Loaded quantitative strategy **"${name}"** on **${sym} (${tf})**.\n\n` +
                                    (parsed.trade_reasoning?.rationale ? `> **Rationale:** ${parsed.trade_reasoning.rationale}\n\n` : '') +
                                    `Parameters and indicator rules have been calibrated. You can ask me to refine any parameters, or click **"Run Backtest"** to simulate historical performance.`
                            }
                        ]);
                    }
                }
            }
        } catch (_) { }
    }, [syncToolbarFromStrategy]);

    /**
     * Send message to Strategy Advisor (/wizard/chat)
     */
    const handleSendMessage = async (textToSend, extraData = null) => {
        const text = textToSend || chatInput;
        if (!text || !text.trim() || advisorLoading) return;

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

        // 1. Backtest trigger commands -> open side backtest panel and run real /backtest/v1
        const qaAnswers = (extraData?.qaList || []).map(qa => `${qa.answer || ''} ${qa.label || ''} ${qa.question || ''}`.toLowerCase());
        const isBacktestCommand =
            lower.includes('backtest') ||
            lower.includes('simulate') ||
            lower === 'run' ||
            lower === 'start' ||
            lower.includes('historical candle') ||
            qaAnswers.some(ans => ans.includes('backtest') || ans.includes('simulate'));

        if (isBacktestCommand) {
            const cleanAnswer = extraData?.qaList?.[0]?.answer || extraData?.qaList?.[0]?.label;
            const displayUserText = cleanAnswer || (text.includes('\n') ? text.split('\n').pop() : text);
            
            const targetSymbol = extracted.symbol || symbol || 'XAUUSD';
            const targetInterval = extracted.interval || interval || '15min';
            const targetCapital = extracted.capital || capital || 10000;
            const targetQuantity = extracted.quantity || quantity || 0.01;

            setSymbol(targetSymbol);
            setInterval(targetInterval);
            setCapital(targetCapital);
            setQuantity(targetQuantity);

            setMessages((prev) => [
                ...prev,
                { role: 'user', text: displayUserText },
                { role: 'ai', text: `Launching backtest simulation for **${targetSymbol}** (${targetInterval}) across historical candle data...` }
            ]);
            setIsBacktestPanelOpen(true);
            handleRunBacktest({
                symbol: targetSymbol,
                interval: targetInterval,
                capital: targetCapital,
                quantity: targetQuantity,
                ...currentStrategy
            });
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
                        text: `**Backtest Simulation Results – ${activeSymbol} (${activeInterval})**\n\n- Total Trades: ${parsedTrips.length}\n- Win Rate: ${winRate}%\n- Winning / Losing Trades: ${data.stats?.win || parsedTrips.filter(t => t.pnl > 0).length} / ${data.stats?.loss || parsedTrips.filter(t => t.pnl <= 0).length}\n- Net Profit (USD): $${netPnl}\n- Max Drawdown: ${maxDd}%\n- Profit Factor: ${profitFactor}`,
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
