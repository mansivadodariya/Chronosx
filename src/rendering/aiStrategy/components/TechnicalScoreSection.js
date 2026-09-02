'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../aiStrategy.module.scss';
import { ChevronIcon, IndicatorIcon, getScoreColor, formatValue, accordionVariants } from '@/icons/analysisIcons';

export default function TechnicalScoreSection({
    technicalScore = {},
    trendIndicators = {},
    momentumIndicators = {},
    volumeAnalysis = {},
    levels = {},
    pivotPoints = {},
    isExpanded,
    onToggle,
    scoreSubToggles,
    onToggleSub
}) {
    const scoreColor = getScoreColor(technicalScore.label);

    return (
        <div className={styles.premiumAccordion}>
            <div className={styles.premiumAccordionHeader} onClick={onToggle}>
                <span>TECHNICAL SCORE</span>
                <ChevronIcon isOpen={isExpanded} />
            </div>
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        key="score-content"
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        variants={accordionVariants}
                        style={{ overflow: 'hidden' }}
                    >
                        <div className={styles.premiumAccordionBody}>
                            {/* Score Top Grid */}
                            <div className={styles.scoreTopRow}>
                                <div className={styles.scoreTextGroup}>
                                    <div className={styles.largeScoreText}>
                                        <span style={{ color: scoreColor }}>{technicalScore.total}</span>
                                        <span className={styles.scoreDivider}>/100</span>
                                    </div>
                                    <span className={styles.scoreTextLabel} style={{ color: scoreColor }}>
                                        {(technicalScore.label || 'NEUTRAL').toUpperCase()}
                                    </span>
                                </div>
                                <div className={styles.confidenceGroup}>
                                    <span className={styles.confLabel}>CONFIDENCE</span>
                                    <span className={styles.confValue}>{technicalScore.confidence || '-'}</span>
                                </div>
                            </div>

                            {/* Breakdown Progress Bars */}
                            <div className={styles.breakdownProgressList}>
                                {technicalScore.breakdown && Object.entries(technicalScore.breakdown).map(([key, item]) => {
                                    const pct = Math.round((item.score / item.max) * 100);
                                    const isSubOpen = scoreSubToggles[key];
                                    const itemColor = getScoreColor(item.label);

                                    return (
                                        <div key={key} className={styles.progressRowContainer}>
                                            <div className={styles.progressBarRow} onClick={(e) => onToggleSub(key, e)}>
                                                <div className={styles.progressBarLabelGroup}>
                                                    <IndicatorIcon type={key} />
                                                    <span className={styles.progressBarTitle}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                                </div>

                                                {/* Outer track & fill */}
                                                <div className={styles.progressOuterTrack}>
                                                    <div
                                                        className={styles.progressFillBar}
                                                        style={{ width: `${pct}%`, backgroundColor: itemColor }}
                                                    />
                                                </div>

                                                <div className={styles.progressValueGroup}>
                                                    <span className={styles.progressScoreText}>{item.score}/{item.max}</span>
                                                    <ChevronIcon isOpen={isSubOpen} className={styles.subChevron} />
                                                </div>
                                            </div>

                                            {/* Sub-details nested collapse with Animation */}
                                            <AnimatePresence initial={false}>
                                                {isSubOpen && (
                                                    <motion.div
                                                        key={`sub-${key}`}
                                                        initial="collapsed"
                                                        animate="expanded"
                                                        exit="collapsed"
                                                        variants={accordionVariants}
                                                        style={{ overflow: 'hidden' }}
                                                    >
                                                        <div className={styles.progressSubDetailsCollapse}>
                                                            {key === 'trend' && (
                                                                <div className={styles.subDetailTableGrid}>
                                                                    {Object.entries(trendIndicators).slice(0, 6).map(([indKey, ind]) => (
                                                                        <div key={indKey} className={styles.subDetailMetricRow}>
                                                                            <span className={styles.metricName}>{indKey}</span>
                                                                            <span className={styles.metricVal}>{formatValue(ind.value)}</span>
                                                                            <span className={styles.metricAction} style={{ color: getScoreColor(ind.action) }}>
                                                                                {ind.action}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {key === 'momentum' && (
                                                                <div className={styles.subDetailTableGrid}>
                                                                    {Object.entries(momentumIndicators).slice(0, 5).map(([indKey, ind]) => (
                                                                        <div key={indKey} className={styles.subDetailMetricRow}>
                                                                            <span className={styles.metricName}>{indKey}</span>
                                                                            <span className={styles.metricVal}>{formatValue(ind.value)}</span>
                                                                            <span className={styles.metricAction} style={{ color: getScoreColor(ind.action) }}>
                                                                                {ind.action}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {key === 'volume' && (
                                                                <div className={styles.subDetailSimpleRows}>
                                                                    <div className={styles.simpleRowItem}>
                                                                        <span>Relative Volume:</span>
                                                                        <strong>{volumeAnalysis.relative_volume || '0'}x</strong>
                                                                    </div>
                                                                    <div className={styles.simpleRowItem}>
                                                                        <span>Buying/Selling Ratio:</span>
                                                                        <strong style={{ color: scoreColor }}>
                                                                            {volumeAnalysis.pressure?.buy_pct}% Buy / {volumeAnalysis.pressure?.sell_pct}% Sell
                                                                        </strong>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {key === 'structure' && (
                                                                <div className={styles.subDetailSimpleRows}>
                                                                    <div className={styles.simpleRowItem}>
                                                                        <span>Support Level:</span>
                                                                        <strong>{formatValue(levels.nearest_support)}</strong>
                                                                    </div>
                                                                    <div className={styles.simpleRowItem}>
                                                                        <span>Resistance Level:</span>
                                                                        <strong>{formatValue(levels.nearest_resistance)}</strong>
                                                                    </div>
                                                                    <div className={styles.simpleRowItem}>
                                                                        <span>Pivot standard:</span>
                                                                        <strong>{formatValue(pivotPoints?.standard?.P)}</strong>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
