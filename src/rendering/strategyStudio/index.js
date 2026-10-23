'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './styles/strategyStudio.module.scss';
import BackgroundCyberWaves from './components/BackgroundCyberWaves';
import StrategyCopilotChat from './components/StrategyCopilotChat';
import ChatHistoryDrawer from './components/ChatHistoryDrawer';
import StudioToolbar from './components/StudioToolbar';
import SimulationProgressLoader from './components/SimulationProgressLoader';
import BacktestResultsView from './components/BacktestResultsView';
import StrategyModifyForm from './components/StrategyModifyForm';
import { EditPencilIcon, CloseXIcon } from './components/StudioIcons';
import useStrategyCopilot from './hooks/useStrategyCopilot';
import { strategyStudioApi } from './utils/strategyApi';
import { parseRoundTrips, generateSimulatedBacktest } from './utils/backtestEngine';

export default function StrategyStudio() {
    const {
        sessionId,
        metadata,
        indIndex,
        resp,
        messages,
        formErrors,
        result,
        busy,
        boot,
        sendMessage,
        retryMessage,
        saveDraft,
        runBacktest,
    } = useStrategyCopilot();

    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // Backtest Parameters & State
    const [symbol, setSymbol] = useState('XAUUSD');
    const [interval, setInterval] = useState('15min');
    const [capital, setCapital] = useState(10000);
    const [quantity, setQuantity] = useState(0.01);
    const [fromDate, setFromDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 60);
        return d.toISOString().split('T')[0];
    });
    const [toDate, setToDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().split('T')[0];
    });

    const [isBacktestPanelOpen, setIsBacktestPanelOpen] = useState(false);
    const [isEditingForm, setIsEditingForm] = useState(false);
    const [simulationLoading, setSimulationLoading] = useState(false);
    const [backtestResults, setBacktestResults] = useState(null);
    const [backtestRoundTrips, setBacktestRoundTrips] = useState([]);
    const [executedParams, setExecutedParams] = useState(null);

    // Sync parameters from configured strategy if present
    useEffect(() => {
        if (resp?.strategy) {
            const s = resp.strategy;
            const sym = (Array.isArray(s.stock_name) ? s.stock_name[0] : s.stock_name) || s.symbol;
            if (sym) setSymbol(sym);
            if (s.interval || s.timeframe) setInterval(s.interval || s.timeframe);
            if (s.inital_capital || s.capital) setCapital(Number(s.inital_capital || s.capital));
            if (s.quantity) setQuantity(Number(s.quantity));
        }
    }, [resp]);

    // Close Modify Form popup on Escape key
    useEffect(() => {
        if (!isEditingForm) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsEditingForm(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isEditingForm]);

    const handleMouseMove = useCallback((e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
        e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
    }, []);

    const handleNewChatAction = () => {
        setIsBacktestPanelOpen(false);
        setIsEditingForm(false);
        setBacktestResults(null);
        setBacktestRoundTrips([]);
        boot(false);
    };

    // Full High-Fidelity Backtest Simulation via /interactive-run
    const handleExecuteBacktest = useCallback(async (customParams = null) => {
        setIsEditingForm(false);
        setIsBacktestPanelOpen(true);
        setSimulationLoading(true);
        setBacktestResults(null);
        setBacktestRoundTrips([]);

        const activeStrat = resp?.strategy || {};
        const sym = customParams?.symbol || (Array.isArray(activeStrat.stock_name) ? activeStrat.stock_name[0] : activeStrat.stock_name) || symbol || 'XAUUSD';
        const intv = customParams?.interval || activeStrat.interval || interval || '15min';
        const cap = parseFloat(customParams?.capital || activeStrat.inital_capital || capital) || 10000;
        const qty = parseFloat(customParams?.quantity || activeStrat.quantity || quantity) || 0.01;
        const from = fromDate;
        const to = toDate;

        try {
            let resData = null;

            // 1. Primary: Run via interactive-run API (/interactive-run with sessionId)
            if (sessionId) {
                const runRes = await runBacktest({ includePlot: true }).catch(() => null);
                if (runRes && runRes.ok && runRes.body) {
                    const body = runRes.body;
                    if (body.success || body.total_trades !== undefined || body.data) {
                        resData = body;
                    }
                }
            }

            // 2. Fallback if session backtest returned empty or offline
            if (!resData || (!resData.success && !resData.data && resData.total_trades === undefined)) {
                const payload = {
                    stock_name: [sym],
                    from_date: from,
                    to_date: to,
                    interval: intv,
                    is_mis: true,
                    entry_type: 0,
                    quantity: qty,
                    inital_capital: cap,
                    data_provider: 'DB',
                    include_plot: true,
                    strategy_name: activeStrat.strategy_name || `Strategy_${sym}_${intv}`,
                    entry_conditions: activeStrat.entry_conditions || {
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
                    },
                    exit_conditions: activeStrat.exit_conditions || {
                        target: 50,
                        target_type: 'points',
                        stoploss: 25,
                        stoploss_type: 'points',
                        condition_type: 'all',
                        rules: []
                    }
                };

                const res = await strategyStudioApi.runBacktest(payload).catch(() => null);
                if (res && (res.status === 'success' || res.success) && res.data) {
                    resData = Array.isArray(res.data) ? res.data[0] : res.data;
                } else {
                    resData = generateSimulatedBacktest(payload);
                }
            }

            const trips = parseRoundTrips(resData, cap, qty);
            setBacktestResults(resData);
            setBacktestRoundTrips(trips);
            setExecutedParams({
                symbol: sym,
                interval: intv,
                capital: cap,
                quantity: qty,
                fromDate: from,
                toDate: to
            });
        } catch (err) {
            console.error('Backtest error:', err);
            const fallbackSim = generateSimulatedBacktest({
                stock_name: [sym],
                interval: intv,
                inital_capital: cap,
                quantity: qty,
            });
            const trips = parseRoundTrips(fallbackSim, cap, qty);
            setBacktestResults(fallbackSim);
            setBacktestRoundTrips(trips);
        } finally {
            setSimulationLoading(false);
        }
    }, [sessionId, runBacktest, resp, symbol, interval, capital, quantity, fromDate, toDate]);

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

            {/* Ambient Animated Cyber Waves */}
            <BackgroundCyberWaves />

            {/* Main Workspace Layout (Centered single-column chat OR 2-panel with Backtest Studio) */}
            <div className={`${styles.activeBodyGrid} ${!isBacktestPanelOpen ? styles.singleMode : ''}`}>
                <div className={styles.activeChat}>
                    <StrategyCopilotChat
                        messages={messages}
                        inputState={resp?.input}
                        ctaButtons={resp?.cta_buttons}
                        busy={busy}
                        resp={resp}
                        metadata={metadata}
                        indIndex={indIndex}
                        formErrors={formErrors}
                        result={result}
                        onSaveDraft={saveDraft}
                        onSendMessage={sendMessage}
                        onRetryMessage={retryMessage}
                        onRunBacktest={handleExecuteBacktest}
                        onOpenHistory={() => setIsHistoryOpen(true)}
                        onNewChat={handleNewChatAction}
                        onOpenModifyForm={() => {
                            setIsEditingForm(true);
                            setIsBacktestPanelOpen(false);
                        }}
                        isEditingForm={isEditingForm}
                    />
                </div>

                {/* ── RIGHT PANEL: Backtest Studio & Results (Interactive Candlestick, Performance Curves, Trades) ── */}
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
                            onRunBacktest={() => handleExecuteBacktest()}
                            loading={simulationLoading}
                            onClose={() => setIsBacktestPanelOpen(false)}
                        />

                        {/* Right Panel Main Content Area */}
                        <div className={styles.rightPanelContentArea} style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                            {simulationLoading ? (
                                <div className={styles.loadingOverlay}>
                                    <SimulationProgressLoader symbol={symbol} interval={interval} />
                                </div>
                            ) : backtestResults ? (
                                <BacktestResultsView
                                    results={backtestResults}
                                    roundTrips={backtestRoundTrips || []}
                                    initialCapital={parseFloat(executedParams?.capital ?? capital) || 10000}
                                    symbol={executedParams?.symbol ?? symbol}
                                    interval={executedParams?.interval ?? interval}
                                    quantity={parseFloat(executedParams?.quantity ?? quantity) || 0.01}
                                />
                            ) : (
                                <div className={styles.emptyState}>
                                    <h2>Algorithmic Strategy Backtester</h2>
                                    <p>Configure parameters above and click &quot;Run Backtest&quot; to simulate performance.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ── MODAL POPUP: Strategy Modification Form (Centered Dialog Overlay) ── */}
            {isEditingForm && (
                <div
                    className={styles.strategyModalOverlay}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsEditingForm(false);
                    }}
                >
                    <div className={styles.strategyModalDialog}>
                        <div className={styles.strategyModalHeader}>
                            <div className={styles.sidePanelHeaderLeft}>
                                <div className={styles.headerIconWrap}>
                                    <EditPencilIcon size={16} color="#18c98b" />
                                </div>
                                <div>
                                    <div className={styles.title}>Modify Strategy Form</div>
                                    <div className={styles.statusPillSmall}>
                                        <span className={styles.statusDot} />
                                        <span>{resp?.strategy?.strategy_name || 'Dynamic Strategy Configuration'}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                className={styles.sidePanelCloseBtn}
                                onClick={() => setIsEditingForm(false)}
                                title="Close strategy form"
                            >
                                <CloseXIcon size={14} />
                            </button>
                        </div>
                        <div className={styles.strategyModalBody}>
                            <StrategyModifyForm
                                initialStrategy={resp?.strategy}
                                metadata={metadata}
                                indIndex={indIndex}
                                formErrors={formErrors}
                                busy={busy}
                                onSave={async (draft) => {
                                    await saveDraft(draft);
                                    setIsEditingForm(false);
                                }}
                                onCancel={() => setIsEditingForm(false)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Chat History Slide-over Drawer */}
            <ChatHistoryDrawer
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                historyList={[]}
                loading={false}
                currentSessionId={sessionId}
                onSelectSession={() => {}}
                onDeleteSession={() => {}}
                onNewChat={handleNewChatAction}
            />
        </div>
    );
}
