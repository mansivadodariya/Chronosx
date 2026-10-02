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
    const isLoading = loading || !results;

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
                    results={null}
                    roundTrips={[]}
                    initialCapital={initialCapital}
                    wins={0}
                    losses={0}
                />
            </div>
        );
    }

    const stats = results.stats || {};
    const safeTrips = Array.isArray(roundTrips) ? roundTrips : [];
    
    // Total completed trades: extract from top-level, stats, or safeTrips
    const totalCompleted = Number(
        results?.total_trades ?? 
        stats?.trades ?? 
        stats?.total_trades ?? 
        safeTrips.length ?? 
        0
    );

    // Wins and Losses
    const wins = Number(
        results?.wins ?? 
        stats?.win ?? 
        stats?.wins ?? 
        (safeTrips.length > 0 ? safeTrips.filter(t => (Number(t?.pnl) || 0) > 0).length : 0)
    );

    const losses = Number(
        results?.losses ?? 
        stats?.loss ?? 
        stats?.losses ?? 
        (safeTrips.length > 0 ? safeTrips.filter(t => (Number(t?.pnl) || 0) <= 0).length : 0)
    );

    // Total PnL
    const rawPnL = results?.pnl ?? results?.net_profit ?? stats?.pnl ?? (safeTrips.length > 0 ? safeTrips.reduce((acc, t) => acc + (Number(t?.pnl) || 0), 0) : 0);
    const totalPnL = parseFloat(Number(rawPnL || 0).toFixed(2));

    // PnL percentage
    const rawPnLPct = results?.pnl_percentage ?? stats?.pnl_percentage ?? (initialCapital > 0 ? (totalPnL / initialCapital) * 100 : 0);
    const pnlPercent = parseFloat(Number(rawPnLPct || 0).toFixed(2));

    // Win rate
    const rawWinRate = results?.win_rate ?? stats?.win_rate ?? (totalCompleted > 0 ? ((wins / totalCompleted) * 100) : 0);
    const winRate = parseFloat(Number(rawWinRate || 0).toFixed(1));

    // Max Gain & Max Loss
    const maxGain = Number(
        results?.max_gain ?? 
        stats?.max_gain ?? 
        (safeTrips.length > 0 ? Math.max(0, ...safeTrips.map(t => Number(t?.pnl) || 0)) : 0)
    );

    const maxLoss = Math.abs(Number(
        results?.max_loss ?? 
        stats?.max_loss ?? 
        (safeTrips.length > 0 ? Math.min(0, ...safeTrips.map(t => Number(t?.pnl) || 0)) : 0)
    ));

    // Streaks
    const winStreak = Number(results?.win_streak ?? stats?.win_streak ?? 0);
    const lossStreak = Number(results?.loss_streak ?? stats?.loss_streak ?? 0);

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
                        {totalPnL >= 0 
                            ? `+$${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                            : `-$${Math.abs(totalPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </div>
                    <div className={styles.kpiSub}>
                        {pnlPercent >= 0 
                            ? `+${pnlPercent.toFixed(2)}% net return` 
                            : `-${Math.abs(pnlPercent).toFixed(2)}% net return`}
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
                        +${maxGain.toFixed(2)}
                    </div>
                    <div className={styles.kpiSub} style={{ color: '#F43F5E' }}>
                        -${maxLoss.toFixed(2)}
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiLabel}>
                        <span>Execution Streaks</span>
                        <LightningIcon size={14} color="#18C98B" />
                    </div>
                    <div className={styles.kpiValue} style={{ fontSize: '17px', color: '#18C98B' }}>
                        {winStreak} Wins
                    </div>
                    <div className={styles.kpiSub}>
                        {lossStreak} Losses max
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
                results={results}
                roundTrips={roundTrips}
                initialCapital={initialCapital}
                wins={wins}
                losses={losses}
                totalPnL={totalPnL}
                totalTrades={totalCompleted}
            />

            {/* Row 4: Trades Table */}
            <TradesTable
                roundTrips={roundTrips}
                totalTrades={totalCompleted}
                wins={wins}
                losses={losses}
            />
        </div>
    );
}
