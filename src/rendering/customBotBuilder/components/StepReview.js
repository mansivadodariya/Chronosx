'use client';

import React from 'react';
import styles from '../customBotBuilder.module.scss';
import { INDICATOR_DEFINITIONS, RISK_LEVELS } from '../constants';

export default function StepReview({ data, onEditStep, onRunBacktest, onDeployBot }) {
    const {
        botName,
        description,
        tradingPair,
        timeframe,
        triggerMode,
        entryConditions,
        takeProfitPips,
        stopLossPips,
        trailingStop,
        trailingDistance,
        trailingStep,
        riskLevel,
        lotSize,
        maxOpenPositions,
        riskPerTrade,
        maxDailyLoss
    } = data;

    const currentRiskPreset = RISK_LEVELS.find(r => r.id === riskLevel) || RISK_LEVELS[1];

    return (
        <div className={styles.stepContentWrapper}>
            {/* Top Review Grid */}
            <div className={styles.reviewGrid}>
                {/* 1. Bot Identity & Market */}
                <div className={styles.reviewCard}>
                    <div className={styles.reviewCardHeader}>
                        <div className={styles.headerTitleWrap}>
                            <span className={styles.reviewStepBadge}>1</span>
                            <h4>Bot Identity & Asset</h4>
                        </div>
                        <button
                            type="button"
                            className={styles.editStepLink}
                            onClick={() => onEditStep(1)}
                        >
                            Edit
                        </button>
                    </div>
                    <div className={styles.reviewContent}>
                        <div className={styles.reviewItem}>
                            <span className={styles.reviewLabel}>Bot Name</span>
                            <span className={styles.reviewValHighlight}>{botName || 'Custom Bot'}</span>
                        </div>
                        {description && (
                            <div className={styles.reviewItem}>
                                <span className={styles.reviewLabel}>Description</span>
                                <span className={styles.reviewValText}>{description}</span>
                            </div>
                        )}
                        <div className={styles.reviewBadgesRow}>
                            <span className={styles.badgePair}>{tradingPair}</span>
                            <span className={styles.badgeTimeframe}>{timeframe.toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Entry Rules */}
                <div className={styles.reviewCard}>
                    <div className={styles.reviewCardHeader}>
                        <div className={styles.headerTitleWrap}>
                            <span className={styles.reviewStepBadge}>2</span>
                            <h4>Entry Strategy ({triggerMode === 'ALL' ? 'All Met' : 'Any Met'})</h4>
                        </div>
                        <button
                            type="button"
                            className={styles.editStepLink}
                            onClick={() => onEditStep(2)}
                        >
                            Edit
                        </button>
                    </div>
                    <div className={styles.reviewContent}>
                        <div className={styles.reviewCondsList}>
                            {entryConditions.map((cond, idx) => {
                                const def = INDICATOR_DEFINITIONS[cond.indicatorKey];
                                return (
                                    <div key={cond.id || idx} className={styles.reviewCondRow}>
                                        <span className={styles.condPillNum}>{idx + 1}</span>
                                        <div className={styles.condPillDetails}>
                                            <span className={styles.condPillName}>{def?.name || cond.indicatorKey}</span>
                                            <span className={styles.condPillRule}>
                                                {cond.condition} {cond.params?.slowPeriod ? `(Fast: ${cond.params.fastPeriod}, Slow: ${cond.params.slowPeriod})` : `(EMA: ${cond.params?.fastPeriod || 20})`}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 3. Exit Targets */}
                <div className={styles.reviewCard}>
                    <div className={styles.reviewCardHeader}>
                        <div className={styles.headerTitleWrap}>
                            <span className={styles.reviewStepBadge}>3</span>
                            <h4>Exit Targets & SL</h4>
                        </div>
                        <button
                            type="button"
                            className={styles.editStepLink}
                            onClick={() => onEditStep(3)}
                        >
                            Edit
                        </button>
                    </div>
                    <div className={styles.reviewContent}>
                        <div className={styles.reviewMetricsGrid}>
                            <div className={styles.metricBlockGreen}>
                                <span className={styles.metricLabel}>Take Profit</span>
                                <span className={styles.metricValue}>+{takeProfitPips} Pips</span>
                            </div>
                            <div className={styles.metricBlockRed}>
                                <span className={styles.metricLabel}>Stop Loss</span>
                                <span className={styles.metricValue}>-{stopLossPips} Pips</span>
                            </div>
                        </div>
                        <div className={styles.trailingStatusRow}>
                            <span className={styles.trailingStatusDot} data-active={trailingStop ? 'true' : 'false'} />
                            <span className={styles.trailingStatusText}>
                                Trailing Stop: {trailingStop ? `Enabled (${trailingDistance}p dist, ${trailingStep}p step)` : 'Disabled'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. Risk Controls */}
                <div className={styles.reviewCard}>
                    <div className={styles.reviewCardHeader}>
                        <div className={styles.headerTitleWrap}>
                            <span className={styles.reviewStepBadge}>4</span>
                            <h4>Risk Profile ({currentRiskPreset.title})</h4>
                        </div>
                        <button
                            type="button"
                            className={styles.editStepLink}
                            onClick={() => onEditStep(4)}
                        >
                            Edit
                        </button>
                    </div>
                    <div className={styles.reviewContent}>
                        <div className={styles.riskSummaryGrid}>
                            <div className={styles.riskSumItem}>
                                <span className={styles.riskSumLabel}>Lot Size</span>
                                <span className={styles.riskSumVal}>{lotSize} Lots</span>
                            </div>
                            <div className={styles.riskSumItem}>
                                <span className={styles.riskSumLabel}>Risk / Trade</span>
                                <span className={styles.riskSumVal}>{riskPerTrade}%</span>
                            </div>
                            <div className={styles.riskSumItem}>
                                <span className={styles.riskSumLabel}>Max Open</span>
                                <span className={styles.riskSumVal}>{maxOpenPositions} Trades</span>
                            </div>
                            <div className={styles.riskSumItem}>
                                <span className={styles.riskSumLabel}>Daily Loss Limit</span>
                                <span className={styles.riskSumVal}>{maxDailyLoss}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Simulation Projected Stats Banner */}
            <div className={styles.simulationBanner}>
                <div className={styles.simBannerLeft}>
                    <div className={styles.simIconGlow}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                    </div>
                    <div>
                        <h4 className={styles.simTitle}>Algorithmic Strategy Backtest Model</h4>
                        <p className={styles.simSub}>
                            ChronosX Neural Engine simulation based on 5-year historical tick data on {tradingPair}
                        </p>
                    </div>
                </div>
                <div className={styles.simMetricsRow}>
                    <div className={styles.simStat}>
                        <span className={styles.simStatLabel}>Win Rate</span>
                        <span className={styles.simStatValGreen}>68.4%</span>
                    </div>
                    <div className={styles.simStat}>
                        <span className={styles.simStatLabel}>Profit Factor</span>
                        <span className={styles.simStatValGreen}>1.92</span>
                    </div>
                    <div className={styles.simStat}>
                        <span className={styles.simStatLabel}>Sharpe Ratio</span>
                        <span className={styles.simStatVal}>2.15</span>
                    </div>
                    <div className={styles.simStat}>
                        <span className={styles.simStatLabel}>Max Drawdown</span>
                        <span className={styles.simStatValRed}>-4.8%</span>
                    </div>
                </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className={styles.reviewActionsRow}>
                <button
                    type="button"
                    className={styles.backtestBtn}
                    onClick={onRunBacktest}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>Run Backtest Simulation</span>
                </button>

                <button
                    type="button"
                    className={styles.deployBotBtn}
                    onClick={onDeployBot}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                    </svg>
                    <span>Deploy & Launch Bot</span>
                </button>
            </div>
        </div>
    );
}
