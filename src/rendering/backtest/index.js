'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './backtest.module.scss';
import studioStyles from '../strategyStudio/styles/strategyStudio.module.scss';
import BackgroundCyberWaves from '../strategyStudio/components/BackgroundCyberWaves';
import StudioToolbar from '../strategyStudio/components/StudioToolbar';
import BacktestResultsView from '../strategyStudio/components/BacktestResultsView';
import SimulationProgressLoader from '../strategyStudio/components/SimulationProgressLoader';
import {
    AiBotSparkIcon,
    SlidersTuneIcon,
    ShieldCheckIcon,
    RocketRunIcon
} from '../strategyStudio/components/StudioIcons';
import { toast } from 'react-hot-toast';
import { strategyStudioApi } from '../strategyStudio/utils/strategyApi';
import { parseRoundTrips } from '../strategyStudio/utils/backtestEngine';

export default function BacktestPage() {
    // Strategy Parameters (Toolbar & Execution)
    const [symbol, setSymbol] = useState('XAUUSD');
    const [interval, setInterval] = useState('15min');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [capital, setCapital] = useState(10000);
    const [quantity, setQuantity] = useState(0.01);

    // Backtest Simulation Results
    const [simulationLoading, setSimulationLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [roundTrips, setRoundTrips] = useState([]);

    // Initialize date ranges on mount
    useEffect(() => {
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
     * Execute Backtest Simulation
     */
    const handleRunBacktest = async () => {
        setSimulationLoading(true);

        try {
            const entryConditions = {
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

            const exitConditions = {
                target: 50,
                target_type: 'points',
                stoploss: 25,
                stoploss_type: 'points',
                condition_type: 'all',
                rules: []
            };

            const payload = {
                stock_name: [symbol || 'XAUUSD'],
                from_date: fromDate || '2024-01-01',
                to_date: toDate || '2024-03-01',
                interval: interval || '15min',
                is_mis: true,
                entry_type: 0,
                quantity: parseFloat(quantity) || 0.01,
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
                const trips = parseRoundTrips(stockRes, parseFloat(capital) || 10000, parseFloat(quantity) || 0.01);
                setRoundTrips(trips);
                handleToast('Backtest simulation complete!');
            } else {
                setResults(null);
                setRoundTrips([]);
                handleToast(res.error || 'No trade signals found for the chosen parameters.');
            }
        } catch (err) {
            handleToast('Simulation execution error. Ensure backend is running on port 7009.');
        } finally {
            setSimulationLoading(false);
        }
    };

    return (
        <div className={styles.backtestContainer} data-lenis-prevent="true">
            <div className={styles.backtestInner}>
                <div className={styles.backtestPanel}>
                    {/* Background Cyber Waves */}
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
                        onRunBacktest={handleRunBacktest}
                        loading={simulationLoading}
                    />

                    {/* Main Content Area */}
                    <div className={styles.contentArea}>
                        {simulationLoading ? (
                            <div className={studioStyles.loadingOverlay}>
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
                            <div className={studioStyles.emptyState}>
                                <div className={studioStyles.emptyIllustration}>
                                    <AiBotSparkIcon size={44} color="#18C98B" />
                                </div>
                                <h2>Algorithmic Strategy Backtester</h2>
                                <p>
                                    Configure your trading parameters in the toolbar above and click &quot;Run Backtest&quot; to simulate. Inspect performance curves, win rates, and individual round-trip trades.
                                </p>
                                <div className={studioStyles.flowSteps}>
                                    <div className={studioStyles.stepBox}>
                                        <div className={studioStyles.stepIconWrap}>
                                            <SlidersTuneIcon size={16} color="#18C98B" />
                                        </div>
                                        <h4>Configure Parameters</h4>
                                        <p>Set symbol, timeframe, date range, capital and quantity above.</p>
                                    </div>
                                    <div className={studioStyles.stepBox}>
                                        <div className={studioStyles.stepIconWrap}>
                                            <ShieldCheckIcon size={16} color="#18C98B" />
                                        </div>
                                        <h4>Validate & Inspect</h4>
                                        <p>Review entry rules, stop loss, and target conditions.</p>
                                    </div>
                                    <div className={studioStyles.stepBox}>
                                        <div className={studioStyles.stepIconWrap}>
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
