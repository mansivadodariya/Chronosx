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
    initialCapital,
    symbol = 'EURUSD',
    interval = '15min',
    quantity = 0.01
}) {
    if (!results || !roundTrips) return null;

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
