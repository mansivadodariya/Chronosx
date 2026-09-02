'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../aiStrategy.module.scss';
import { RadarIcon, VolumeIcon, RiskRewardIcon } from '@/icons/aiStrategyIcons';
import { formatCurrency } from '../strategyUtils';

export default function StrategyExecutionView({
    activeSignals = {},
    showPairSelector = true,
    setShowPairSelector,
    wsStatus = 'disconnected'
}) {
    return (
        <div className={styles.strategyAccordion}>
            <button
                className={`${styles.accordionTrigger} ${showPairSelector ? styles.accordionOpen : ''}`}
                onClick={() => setShowPairSelector(!showPairSelector)}
            >
                <div className={styles.accordionLeft}>
                    <span className={`${styles.strategyDot} ${styles.buyDot}`}></span>
                    <span className={styles.accordionTitle}>EMA Pullback Strategy</span>
                    {Object.keys(activeSignals).length > 0 && (
                        <span className={styles.accordionBadge}>
                            {Object.keys(activeSignals).length} Pairs
                        </span>
                    )}
                </div>
                <div className={styles.accordionRight}>
                    <span className={`${styles.accordionWsBadge} ${styles[wsStatus]}`}>
                        {wsStatus === 'connected' ? '● Live' : wsStatus === 'connecting' ? '◌ Connecting...' : '○ Offline'}
                    </span>
                    <span className={`${styles.dropdownArrow} ${showPairSelector ? styles.open : ''}`}>▼</span>
                </div>
            </button>

            {/* Accordion Content: All Pair Cards */}
            <AnimatePresence>
                {showPairSelector && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                    >
                        {Object.keys(activeSignals).length === 0 ? (
                            <div className={`${styles.noTradeCard} ${styles.accordionEmpty}`}>
                                <div className={`${styles.radarIcon} ${styles.radarIconSpinner}`}>
                                    <RadarIcon />
                                </div>
                                <h4>Awaiting Strategy Stream</h4>
                                <p>Connecting to the live Global Scan strategy feed. Waiting for active setups...</p>
                            </div>
                        ) : (
                            <div className={styles.pairsGrid}>
                                {Object.entries(activeSignals).map(([symName, setup]) => {
                                    const sig = setup.signal || {};
                                    const sigActive = sig.active;
                                    const isBuy = sig.direction === 'BUY';
                                    const confVal = sig.confidence || 0;

                                    return (
                                        <div
                                            key={symName}
                                            className={`${styles.pairCard} ${sigActive ? (isBuy ? styles.activeBuy : styles.activeSell) : ''}`}
                                        >
                                            {/* Card Header */}
                                            <div className={styles.pairCardHead}>
                                                <div className={styles.cardHeaderTitle}>
                                                    <span className={`${styles.strategyDot} ${sigActive ? (isBuy ? styles.buyDot : styles.sellDot) : styles.holdDot}`}></span>
                                                    <h4>
                                                        {setup.symbol || symName}
                                                        {sig.timestamp && (
                                                            <span className={styles.timeTag}>
                                                                &nbsp;{new Date(sig.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()}
                                                            </span>
                                                        )}
                                                    </h4>
                                                </div>
                                                <span className={styles.strategyTypeTag}>{setup.strategy_name || 'EMA Pullback'}</span>
                                            </div>

                                            {/* Direction Badge */}
                                            <div className={`${styles.directionBadge} ${sigActive ? (isBuy ? styles.buyColor : styles.sellColor) : styles.holdColor}`}>
                                                {sigActive ? (isBuy ? '↑ BUY' : '↓ SELL') : '→ HOLD'}
                                            </div>

                                            {/* Trade Details or No Active Trade */}
                                            {sigActive ? (
                                                <>
                                                    {/* Price Levels */}
                                                    <div className={styles.levelsCard}>
                                                        <div className={styles.gridLevelRow}>
                                                            <span className={styles.gridLevelLabel}>Entry Target</span>
                                                            <span className={styles.gridLevelValue}>{formatCurrency(sig.entry, symName)}</span>
                                                        </div>
                                                        <div className={styles.gridLevelRow}>
                                                            <span className={styles.gridLevelLabel}>Stop Loss</span>
                                                            <span className={`${styles.gridLevelValue} ${styles.slColor}`}>{formatCurrency(sig.sl, symName)}</span>
                                                        </div>
                                                        <div className={styles.gridLevelRow}>
                                                            <span className={styles.gridLevelLabel}>Take Profit 1 (1.5 R:R)</span>
                                                            <span className={`${styles.gridLevelValue} ${styles.tpColor}`}>{formatCurrency(sig.tp1, symName)}</span>
                                                        </div>
                                                        {sig.tp2 && (
                                                            <div className={styles.gridLevelRow}>
                                                                <span className={styles.gridLevelLabel}>Take Profit 2 (3.0 R:R)</span>
                                                                <span className={`${styles.gridLevelValue} ${styles.tpColor}`}>{formatCurrency(sig.tp2, symName)}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Confluence Indicators */}
                                                    <div className={styles.confluenceBox}>
                                                        <div className={styles.confluenceStats}>
                                                            <span className={styles.confKicker}>Confluence Indicators</span>
                                                            {sig.rvol && (
                                                                <div className={styles.confItem}>
                                                                    <VolumeIcon />
                                                                    <span>Volume: <strong className={styles.strongText}>STRONG ({sig.rvol})</strong></span>
                                                                </div>
                                                            )}
                                                            {sig.risk_reward && (
                                                                <div className={styles.confItem}>
                                                                    <RiskRewardIcon />
                                                                    <span>Risk Reward: <strong>{sig.risk_reward}</strong></span>
                                                                </div>
                                                            )}
                                                            <span className={`${styles.confStrengthBadge} ${confVal >= 90 ? styles.highConf : styles.medConf}`}>
                                                                {confVal >= 90 ? 'HIGH' : 'MEDIUM'} CONFIDENCE
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* AI Analysis & Reasoning */}
                                                    <div className={styles.strategyReasoning}>
                                                        <span className={styles.reasoningLabel}>AI Analysis &amp; Reasoning</span>
                                                        <p>
                                                            {sig.reasoning ||
                                                                `${setup.strategy_name || 'EMA Pullback'} setup detected on H1 timeframe for ${setup.symbol || symName}. ` +
                                                                `Price is showing a ${isBuy ? 'bullish' : 'bearish'} bias` +
                                                                `${sig.rsi ? ` with RSI at ${Number(sig.rsi).toFixed(1)}` : ''}.` +
                                                                `${sig.confidence ? ` Signal confidence: ${sig.confidence}%.` : ''}` +
                                                                `${sig.rvol ? ` Volume is elevated at ${sig.rvol}, confirming momentum.` : ''}`
                                                            }
                                                        </p>
                                                    </div>

                                                    {/* Signal Tags */}
                                                    <div className={styles.tagFlex}>
                                                        <span className={styles.strategyTag}>{setup.strategy_name || 'EMA PULLBACK'}</span>
                                                        <span className={styles.strategyTag}>
                                                            {isBuy ? 'UPTREND' : 'DOWNTREND'}
                                                        </span>
                                                        {sig.rsi && (
                                                            <span className={styles.strategyTag}>RSI {Number(sig.rsi).toFixed(1)}</span>
                                                        )}
                                                        {sig.scanners_count && (
                                                            <span className={styles.strategyTag}>{sig.scanners_count} SCANNERS</span>
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className={styles.inactiveMessage}>
                                                    <RadarIcon width={16} height={16} />
                                                    <span>{sig.message || 'No active trade setup'}</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
