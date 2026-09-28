'use client';

import React from 'react';
import styles from '../styles/strategyStudio.module.scss';
import BacktestCandlestickChart from './BacktestCandlestickChart';
import BacktestCharts from './BacktestCharts';
import TradesTable from './TradesTable';
import {
    CoinsCapitalIcon,
    ChartTrendIcon,
    RefreshResetIcon,
    SlidersTuneIcon,
    LightningIcon
} from './StudioIcons';

export default function BacktestResultsView({
    results,
    roundTrips,
    initialCapital = 10000,
    symbol = 'EURUSD',
    interval = '15min',
    quantity = 0.01,
    loading = false
}) {
    const isLoading = loading || !results || !roundTrips || (Array.isArray(roundTrips) && roundTrips.length === 0);

    if (isLoading) {
        return (
            <div className={styles.resultsContainer}>
                {/* Row 1: KPI Skeleton Cards */}
                <div className={styles.kpiGrid}>
                    {[
                        { label: 'Net Profit / Loss', icon: <CoinsCapitalIcon size={14} color="#18C98B" /> },
                        { label: 'Win Rate', icon: <ChartTrendIcon size={14} color="#18C98B" /> },
                        { label: 'Completed Trades', icon: <RefreshResetIcon size={14} color="#18C98B" /> },
                        { label: 'Max Gain / Loss', icon: <SlidersTuneIcon size={14} color="#18C98B" /> },
                        { label: 'Execution Streaks', icon: <LightningIcon size={14} color="#18C98B" /> }
                    ].map((card, idx) => (
                        <div key={idx} className={styles.kpiCard}>
                            <div className={styles.kpiLabel}>
                                <span>{card.label}</span>
                                {card.icon}
                            </div>
                            <div className={styles.kpiValue} style={{ color: '#64748B', opacity: 0.6, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className={styles.liveIndicatorPulse} style={{ display: 'inline-block' }} />
                                Loading...
                            </div>
                            <div className={styles.kpiSub}>
                                Synchronizing dataset
                            </div>
                        </div>
                    ))}
                </div>

                {/* Row 2: Market Data & Executions (Candlestick Loader Skeleton) */}
                <BacktestCandlestickChart
                    results={null}
                    roundTrips={[]}
                    symbol={symbol}
                    interval={interval}
                    quantity={quantity}
                    capital={initialCapital}
                />

                {/* Row 3: Performance Charts Loader */}
                <BacktestCharts
                    roundTrips={[]}
                    initialCapital={initialCapital}
                    wins={0}
                    losses={0}
                />
            </div>
        );
    }

    const stats = results.stats || {};
    const totalPnL = stats.pnl !== undefined ? stats.pnl : roundTrips.reduce((acc, t) => acc + t.pnl, 0);
    const pnlPercent = initialCapital > 0 ? (totalPnL / initialCapital) * 100 : 0;
    const wins = stats.win !== undefined ? stats.win : roundTrips.filter(t => t.pnl > 0).length;
    const losses = stats.loss !== undefined ? stats.loss : roundTrips.filter(t => t.pnl <= 0).length;
    const totalCompleted = roundTrips.length;
    const winRate = totalCompleted > 0 ? ((wins / totalCompleted) * 100).toFixed(1) : '0.0';

    const sign = totalPnL >= 0 ? '+' : '';

    return (
        <div className={styles.resultsContainer}>
            {/* Row 1: KPI Cards */}
            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiLabel}>
                        <span>Net Profit / Loss</span>
                        <CoinsCapitalIcon size={14} color="#18C98B" />
                    </div>
                    <div className={`${styles.kpiValue} ${totalPnL >= 0 ? styles.positive : styles.negative}`}>
                        {sign}${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className={styles.kpiSub}>
                        {sign}{pnlPercent.toFixed(2)}% net return
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiLabel}>
                        <span>Win Rate</span>
                        <ChartTrendIcon size={14} color="#18C98B" />
                    </div>
                    <div className={styles.kpiValue} style={{ color: Number(winRate) >= 50 ? '#10B981' : '#F43F5E' }}>
                        {winRate}%
                    </div>
                    <div className={styles.kpiSub}>
                        {wins} Wins / {losses} Losses
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiLabel}>
                        <span>Completed Trades</span>
                        <RefreshResetIcon size={14} color="#18C98B" />
                    </div>
                    <div className={styles.kpiValue}>
                        {totalCompleted}
                    </div>
                    <div className={styles.kpiSub}>
                        Round-trip executions
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiLabel}>
                        <span>Max Gain / Loss</span>
                        <SlidersTuneIcon size={14} color="#18C98B" />
                    </div>
                    <div className={styles.kpiValue} style={{ fontSize: '17px', color: '#10B981' }}>
                        +${(stats.max_gain || 0).toFixed(2)}
                    </div>
                    <div className={styles.kpiSub} style={{ color: '#F43F5E' }}>
                        -${(stats.max_loss || 0).toFixed(2)}
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiLabel}>
                        <span>Execution Streaks</span>
                        <LightningIcon size={14} color="#18C98B" />
                    </div>
                    <div className={styles.kpiValue} style={{ fontSize: '17px', color: '#18C98B' }}>
                        {stats.win_streak || 0} Wins
                    </div>
                    <div className={styles.kpiSub}>
                        {stats.loss_streak || 0} Losses max
                    </div>
                </div>
            </div>

            {/* Row 2: Market Data & Executions (Candlestick Chart with Entry/Exit Markers) */}
            <BacktestCandlestickChart
                results={results}
                roundTrips={roundTrips}
                symbol={symbol}
                interval={interval}
                quantity={quantity}
                capital={initialCapital}
            />

            {/* Row 3: Performance Charts */}
            <BacktestCharts
                roundTrips={roundTrips}
                initialCapital={initialCapital}
                wins={wins}
                losses={losses}
            />

            {/* Row 4: Trades Table */}
            <TradesTable roundTrips={roundTrips} />
        </div>
    );
}
