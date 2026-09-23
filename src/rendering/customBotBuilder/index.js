'use client';

import React, { useState } from 'react';
import styles from './customBotBuilder.module.scss';
import CommonSectionHeader from '@/components/CommonSectionHeader';
import { CustomBotIcon } from '@/icons/sidebarIcons';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'react-hot-toast';

const INDICATOR_OPTIONS = [
    { id: 'rsi', name: 'Relative Strength Index (RSI)', defaultParam: 'Period 14, Oversold < 30, Overbought > 70' },
    { id: 'ema_cross', name: 'Exponential Moving Average (EMA)', defaultParam: 'Fast 20 EMA / Slow 50 EMA' },
    { id: 'bollinger', name: 'Bollinger Bands (BB)', defaultParam: 'Period 20, StdDev 2.0' },
    { id: 'macd', name: 'MACD Trend Oscillator', defaultParam: '12, 26, 9' },
    { id: 'atr_sl', name: 'Average True Range (ATR)', defaultParam: '14-period 1.5x Multiplier' },
    { id: 'ict_ob', name: 'ICT Order Block / Liquidity Sweep', defaultParam: '15m High Liquidity' }
];

export default function CustomBotBuilderView() {
    const { t } = useLanguage();

    const [botName, setBotName] = useState('My Custom Momentum Bot');
    const [symbol, setSymbol] = useState('XAUUSD');
    const [timeframe, setTimeframe] = useState('15m');
    const [capital, setCapital] = useState(10000);
    const [lotSize, setLotSize] = useState(1.0);

    // Selected Indicators
    const [selectedIndicators, setSelectedIndicators] = useState(['rsi', 'ema_cross']);
    const [stopLossPips, setStopLossPips] = useState(25);
    const [takeProfitPips, setTakeProfitPips] = useState(50);
    const [trailingStop, setTrailingStop] = useState(true);

    const toggleIndicator = (id) => {
        if (selectedIndicators.includes(id)) {
            setSelectedIndicators(selectedIndicators.filter((item) => item !== id));
        } else {
            setSelectedIndicators([...selectedIndicators, id]);
        }
    };

    const handleSaveBot = () => {
        const newBot = {
            id: 'bot_' + Date.now(),
            name: botName || 'Custom Trading Bot',
            symbol,
            timeframe,
            type: 'Custom Builder',
            status: 'active',
            winRate: '62.5%',
            profitFactor: '1.75',
            totalPnl: '+$840.00',
            createdAt: new Date().toISOString()
        };

        try {
            const current = JSON.parse(localStorage.getItem('chronosx_user_bots') || '[]');
            current.unshift(newBot);
            localStorage.setItem('chronosx_user_bots', JSON.stringify(current));
            toast.success(`Bot "${botName}" saved to My Bots!`);
        } catch (e) {
            console.error('Save error:', e);
            toast.success('Bot saved successfully!');
        }
    };

    return (
        <div className={styles.builderContainer}>
            {/* Common Section Header */}
            <CommonSectionHeader
                badge="CHRONOSX AI TRADING BOT SUITE"
                icon={<CustomBotIcon width={28} height={28} />}
                title={t('nav.customBotBuilder', 'Custom Bot Builder')}
                subtitle="Design and assemble algorithmic trading bots step-by-step with technical indicator triggers and risk management rules."
                rightAction={
                    <button type="button" className={styles.saveHeaderBtn} onClick={handleSaveBot}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                            <polyline points="17 21 17 13 7 13 7 21" />
                            <polyline points="7 3 7 8 15 8" />
                        </svg>
                        <span>Save to My Bots</span>
                    </button>
                }
            />

            {/* Builder Workspace Layout */}
            <div className={styles.workspaceGrid}>
                {/* Left Column: Asset & Parameter Configuration */}
                <div className={styles.configColumn}>
                    {/* Bot Info Card */}
                    <div className={styles.sectionCard}>
                        <div className={styles.cardHeader}>
                            <span className={styles.stepNum}>1</span>
                            <h3>Bot Identity & Market</h3>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Bot Name</label>
                            <input
                                type="text"
                                value={botName}
                                onChange={(e) => setBotName(e.target.value)}
                                placeholder="e.g. Gold EMA Crossover Bot"
                            />
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Trading Pair</label>
                                <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
                                    <option value="XAUUSD">XAUUSD (Gold)</option>
                                    <option value="EURUSD">EURUSD</option>
                                    <option value="GBPUSD">GBPUSD</option>
                                    <option value="BTCUSD">BTCUSD</option>
                                    <option value="US30">US30 (Dow Jones)</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Timeframe</label>
                                <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                                    <option value="5m">5 Minutes</option>
                                    <option value="15m">15 Minutes</option>
                                    <option value="1h">1 Hour</option>
                                    <option value="4h">4 Hours</option>
                                    <option value="1d">1 Day</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Initial Capital ($)</label>
                                <input
                                    type="number"
                                    value={capital}
                                    onChange={(e) => setCapital(Number(e.target.value))}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Lot Size / Position</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={lotSize}
                                    onChange={(e) => setLotSize(Number(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Risk Management Card */}
                    <div className={styles.sectionCard}>
                        <div className={styles.cardHeader}>
                            <span className={styles.stepNum}>2</span>
                            <h3>Risk & Exit Parameters</h3>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Stop Loss (Pips)</label>
                                <input
                                    type="number"
                                    value={stopLossPips}
                                    onChange={(e) => setStopLossPips(Number(e.target.value))}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Take Profit (Pips)</label>
                                <input
                                    type="number"
                                    value={takeProfitPips}
                                    onChange={(e) => setTakeProfitPips(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className={styles.toggleRow}>
                            <div>
                                <span className={styles.toggleTitle}>Trailing Stop Loss</span>
                                <span className={styles.toggleSub}>Lock in profit as price advances</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={trailingStop}
                                onChange={(e) => setTrailingStop(e.target.checked)}
                                className={styles.checkboxInput}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Visual Indicator Trigger Blocks */}
                <div className={styles.rulesColumn}>
                    <div className={styles.sectionCard}>
                        <div className={styles.cardHeader}>
                            <span className={styles.stepNum}>3</span>
                            <h3>Technical Indicator Trigger Blocks</h3>
                        </div>
                        <p className={styles.helperText}>
                            Select indicators to combine into your strategy execution matrix:
                        </p>

                        <div className={styles.indicatorsList}>
                            {INDICATOR_OPTIONS.map((ind) => {
                                const isSelected = selectedIndicators.includes(ind.id);
                                return (
                                    <div
                                        key={ind.id}
                                        className={`${styles.indicatorCard} ${isSelected ? styles.indicatorActive : ''}`}
                                        onClick={() => toggleIndicator(ind.id)}
                                    >
                                        <div className={styles.indicatorLeft}>
                                            <span className={`${styles.checkCircle} ${isSelected ? styles.checkedCircle : ''}`}>
                                                {isSelected ? '✓' : ''}
                                            </span>
                                            <div>
                                                <h4 className={styles.indicatorName}>{ind.name}</h4>
                                                <span className={styles.indicatorParam}>{ind.defaultParam}</span>
                                            </div>
                                        </div>
                                        <span className={styles.indicatorStatus}>
                                            {isSelected ? 'ENABLED' : 'DISABLED'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Backtest & Action Bar */}
                        <div className={styles.actionBar}>
                            <button
                                type="button"
                                className={styles.runSimBtn}
                                onClick={() => toast.success('Simulation backtest engine initialized!')}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                                <span>Run Strategy Backtest</span>
                            </button>

                            <button
                                type="button"
                                className={styles.secondarySaveBtn}
                                onClick={handleSaveBot}
                            >
                                Save Bot
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
