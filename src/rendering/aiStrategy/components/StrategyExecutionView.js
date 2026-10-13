'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from '../aiStrategy.module.scss';
import MiniCandlestickChart from './MiniCandlestickChart';
import StrategyGridSkeleton from './StrategyGridSkeleton';
import { useStrategyStream, formatDisplayValue } from '../hooks/useStrategyStream';

// Helper to guarantee a dollar symbol prefix on all price levels
const ensureDollarPrice = (val, shortPair = '') => {
    if (val === undefined || val === null || val === '') return '-';
    let s = String(val).trim();
    if (s.startsWith('$')) return s;
    const num = Number(s.replace(/[^0-9.-]/g, ''));
    if (!isNaN(num)) {
        return formatDisplayValue(num, shortPair);
    }
    return `$${s}`;
};

export default function StrategyExecutionView({ selectedStrategyId, strategies = [] }) {
    const router = useRouter();
    const { setupsList, wsStatus, loading, initialLoaded } = useStrategyStream();

    const selectedStrategy = Array.isArray(strategies) ? strategies.find(s => (s.id || s.strategy_id) === selectedStrategyId) : null;
    const finalSetups = setupsList;

    const handleViewDetail = (item) => {
        if (typeof window !== 'undefined') {
            const sym = item.meta?.short || item.symbol || 'EUR/USD';
            sessionStorage.setItem('selectedStrategySymbol', sym);
            if (item.pair_id) sessionStorage.setItem('selectedStrategyPairId', item.pair_id);
            if (item.strategy_id) sessionStorage.setItem('selectedStrategyId', item.strategy_id);
        }
        router.push('/signal-terminal');
    };

    return (
        <div className={styles.strategyAccordion}>
            {/* Top Control Bar with Live WS Indicator */}
            <div className={styles.strategyControlBar}>
                <div className={styles.controlTitleGroup}>
                    <span className={styles.strategyPulseDot}></span>
                    <h3>Active Strategy Setups</h3>
                </div>
                <div className={`${styles.wsStatusIndicator} ${styles[wsStatus]}`}>
                    <span>
                        {wsStatus === 'connected' ? '● Live' : wsStatus === 'connecting' ? '◌ Connecting...' : '○ Offline'}
                    </span>
                </div>
            </div>

            {/* Dark Glassmorphism Grid of Strategy Cards (2 Columns per Row) */}
            <div className={styles.pairsGrid}>
                {loading || (!initialLoaded && finalSetups.length < 2) ? (
                    <StrategyGridSkeleton count={6} />
                ) : finalSetups.length === 0 ? (
                    <div className={styles.emptySetupsState}>
                        <div className={styles.emptyIconWrapper}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <h4>No Active Setups</h4>
                        <p>There are currently no active setups for this strategy. Real-time setups will stream live as soon as market conditions trigger.</p>
                    </div>
                ) : (
                    finalSetups.map((item) => {
                    const meta = item.meta || { fullName: item.display_name || item.symbol, short: item.symbol, market: 'Forex' };
                    const sig = item.signal || {};
                    const isBuy = (sig.direction || 'BUY').toUpperCase() === 'BUY';
                    const strategyName = selectedStrategy?.name || item.strategy_name || 'EMA Pullback';
                    const volumeStrength = sig.confluence?.volume_strength || sig.volume_strength || 'STRONG';
                    const riskReward = sig.risk_reward || '1:3.0';
                    const rrLabel = sig.rr ? sig.rr.replace('R:R ', '') : '1:3 R:R';

                    // Compute current price from latest candle close or entry
                    const candles = Array.isArray(sig.mini_candles) ? sig.mini_candles : [];
                    const lastCandle = candles[candles.length - 1];
                    const currentPriceNum = lastCandle ? lastCandle.close : (sig.entry || 1.3377);
                    const displayCurrentPrice = formatDisplayValue(currentPriceNum, meta.short);

                    // Compute 24h % change
                    const firstCandle = candles[0];
                    let diffPercent = 0.33;
                    if (firstCandle && lastCandle && firstCandle.open) {
                        diffPercent = ((lastCandle.close - firstCandle.open) / firstCandle.open) * 100;
                    } else if (!isBuy) {
                        diffPercent = -0.28;
                    }
                    const isPositive = diffPercent >= 0;
                    const changeSymbol = isPositive ? '▲' : '▼';

                    const tags = Array.isArray(sig.tags) && sig.tags.length > 0
                        ? sig.tags
                        : [strategyName, isBuy ? 'UPTREND' : 'DOWNTREND'];

                    const timeTag = sig.time_ago || sig.status_label || '2h ago';

                    return (
                        <div
                            key={item.pair_id || meta.short || item.symbol}
                            className={`${styles.pairCard} ${isBuy ? styles.activeBuy : styles.activeSell}`}
                        >
                            {/* 1. Header: Pair Full Name & Market (Left) + Price / 24h Change (Right) */}
                            <div className={styles.pairCardHead}>
                                <div className={styles.cardHeaderLeft}>
                                    <h4 className={styles.cardPairTitle}>
                                        <span className={styles.pairMainName}>{meta.fullName}</span>
                                        <span className={styles.pairTicker}> ({meta.short})</span>
                                        <span className={styles.marketSeparator}>|</span>
                                        <span className={styles.marketType}>{meta.market}</span>
                                    </h4>
                                </div>
                                <div className={styles.cardHeaderRight}>
                                    <div className={styles.priceMetaBlock}>
                                        <span className={styles.pricePrimary}>{displayCurrentPrice}</span>
                                        <span className={`${styles.changeMeta} ${isPositive ? styles.changePositive : styles.changeNegative}`}>
                                            24h change <span className={styles.arrowIcon}>{changeSymbol}</span> {Math.abs(diffPercent).toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Body: 2 Columns (Left: Trade Parameters | Right: Quantitative Graph with X & Y Axes) */}
                            <div className={styles.cardBodyRow}>
                                {/* Left Column: Pure Quantitative MT5 Trade Levels */}
                                <div className={styles.leftLevelsColumn}>
                                    {/* Direction Row */}
                                    <div className={styles.levelRow}>
                                        <span className={styles.levelLabel}>Direction</span>
                                        <span className={`${styles.directionBadgePill} ${isBuy ? styles.buyPill : styles.sellPill}`}>
                                            {isBuy ? 'BUY' : 'SELL'}
                                        </span>
                                    </div>

                                    {/* Strategy Row */}
                                    <div className={styles.levelRow}>
                                        <span className={styles.levelLabel}>Strategy</span>
                                        <span className={styles.strategyPill}>{strategyName}</span>
                                    </div>

                                    {/* Entry Target */}
                                    <div className={styles.levelRow}>
                                        <span className={styles.levelLabel}>Entry Target</span>
                                        <span className={`${styles.levelValue} ${styles.entryColor}`}>
                                            {ensureDollarPrice(sig.entry_display || sig.entry, meta.short)}
                                        </span>
                                    </div>

                                    {/* Stop Loss */}
                                    <div className={styles.levelRow}>
                                        <span className={styles.levelLabel}>Stop Loss</span>
                                        <span className={`${styles.levelValue} ${styles.slColor}`}>
                                            {ensureDollarPrice(sig.sl_display || sig.sl, meta.short)}
                                        </span>
                                    </div>

                                    {/* Take Profit 1 */}
                                    <div className={styles.levelRow}>
                                        <span className={styles.levelLabel}>Take Profit 1 ({rrLabel})</span>
                                        <span className={`${styles.levelValue} ${styles.tpColor}`}>
                                            {ensureDollarPrice(sig.tp_display || sig.tp, meta.short)}
                                        </span>
                                    </div>

                                    {/* Time Tag */}
                                    <div className={styles.levelRow}>
                                        <span className={styles.levelLabel}>Time Tag</span>
                                        <span className={styles.timeTagValue}>{timeTag}</span>
                                    </div>

                                    {/* Risk Reward */}
                                    <div className={styles.levelRow}>
                                        <span className={styles.levelLabel}>Risk Reward</span>
                                        <span className={styles.riskRewardValue}>{riskReward}</span>
                                    </div>

                                    {/* Volume */}
                                    <div className={styles.levelRow}>
                                        <span className={styles.levelLabel}>Volume</span>
                                        <span className={styles.volumeBadgePill}>{volumeStrength}</span>
                                    </div>
                                </div>

                                {/* Vertical Separator between Trade Levels and Graph */}
                                <div className={styles.verticalSeparator} />

                                {/* Right Column: Mini Candlestick Graph with X and Y Axes */}
                                <div className={styles.rightMiniChartColumn}>
                                    <MiniCandlestickChart
                                        candles={candles}
                                        sparkline={sig.sparkline}
                                        direction={isBuy ? 'BUY' : 'SELL'}
                                        symbol={meta.short}
                                        currentPrice={currentPriceNum}
                                        indicatorValue={sig.rr ? sig.rr.replace('R:R ', '') : (sig.risk_reward || '1.2.0')}
                                        indicators={sig.indicators}
                                    />
                                </div>
                            </div>

                            {/* 3. Footer: Tags on Left + "View Trade Detail" Action Button on Right (Both in One Line) */}
                            <div className={styles.pairCardFooter}>
                                <div className={styles.tagsContainerRow}>
                                    <span className={styles.tagsHeadingLabel}>Tags:</span>
                                    <div className={styles.tagsPillsGroup}>
                                        {tags.map((tag, idx) => (
                                            <span key={idx} className={styles.tagPillBadge}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className={styles.viewDetailBtn}
                                    onClick={() => handleViewDetail(item)}
                                    title={`View detailed chart and execution for ${meta.short}`}
                                >
                                    <span>View Trade Detail</span>
                                </button>
                            </div>
                        </div>
                          );
                })  )}
            </div>
        </div>
    );
}
