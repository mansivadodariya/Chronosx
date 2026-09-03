'use client';

import React from 'react';
import styles from '../aiStrategy.module.scss';
import SpeedometerGauge from './SpeedometerGauge';
import { IndicatorIcon, getScoreColor } from '@/icons/analysisIcons';

export default function TechnicalScoreSection({
    technicalScore = {},
}) {
    const scoreColor = getScoreColor(technicalScore.label);
    const breakdown = technicalScore.breakdown || {};

    const trendBreakdown = breakdown.trend || { score: 25, max: 25, label: 'Bullish' };
    const momentumBreakdown = breakdown.momentum || { score: 21, max: 25, label: 'Bullish' };
    const structureBreakdown = breakdown.structure || { score: 12, max: 25, label: 'Neutral' };

    const trendPct = Math.round(((trendBreakdown.score || 25) / (trendBreakdown.max || 25)) * 100);
    const momentumPct = Math.round(((momentumBreakdown.score || 21) / (momentumBreakdown.max || 25)) * 100);
    const structurePct = Math.round(((structureBreakdown.score || 12) / (structureBreakdown.max || 25)) * 100);

    return (
        <div className={styles.technicalScoreShowcaseCard}>
            {/* Header */}
            <div className={styles.sectionHeaderRow}>
                <div className={styles.headerTitleGroup}>
                    <div className={styles.titleIconPulse} style={{ backgroundColor: scoreColor }} />
                    <span className={styles.headerMainTitle}>TECHNICAL SCORE</span>
                </div>
                <div className={styles.headerConfidencePill}>
                    <span className={styles.confLabel}>CONFIDENCE</span>
                    <span className={styles.confValText}>{technicalScore.confidence || '56%'}</span>
                </div>
            </div>

            {/* Main Content: Speedometer (Left) + High Level Pillars (Right) */}
            <div className={styles.scoreShowcaseContentGrid}>
                {/* Left: Master Speedometer Gauge (0 to 100 Numeric Scale) */}
                <div className={styles.speedometerColumn}>
                    <SpeedometerGauge
                        score={technicalScore.total || 68}
                        label={technicalScore.label || 'BULLISH'}
                        confidence={technicalScore.confidence || '56%'}
                        mode="numeric"
                    />
                </div>

                {/* Right: Pillars Confluence Overview */}
                <div className={styles.pillarsOverviewCol}>
                    {/* 1. Trend Pillar */}
                    <div className={styles.pillarSummaryRow}>
                        <div className={styles.pillarMeta}>
                            <div className={styles.pillarIconWrap} style={{ color: '#10B981' }}>
                                <IndicatorIcon type="trend" />
                            </div>
                            <span className={styles.pillarName}>Trend Analysis</span>
                        </div>
                        <div className={styles.pillarTrackWrap}>
                            <div className={styles.pillarTrack}>
                                <div className={styles.pillarFill} style={{ width: `${trendPct}%`, background: '#10B981' }} />
                            </div>
                        </div>
                        <div className={styles.pillarScoreWrap}>
                            <span className={styles.pillarScoreText}>{trendBreakdown.score || 25} <span style={{ color: 'rgba(255,255,255,0.4)' }}>/ 25</span></span>
                            <span className={styles.pillarSentimentBadge} style={{ color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.1)' }}>
                                {trendBreakdown.label || 'Bullish'}
                            </span>
                        </div>
                    </div>

                    {/* 2. Momentum Pillar */}
                    <div className={styles.pillarSummaryRow}>
                        <div className={styles.pillarMeta}>
                            <div className={styles.pillarIconWrap} style={{ color: '#C084FC' }}>
                                <IndicatorIcon type="momentum" />
                            </div>
                            <span className={styles.pillarName}>Momentum Dynamics</span>
                        </div>
                        <div className={styles.pillarTrackWrap}>
                            <div className={styles.pillarTrack}>
                                <div className={styles.pillarFill} style={{ width: `${momentumPct}%`, background: '#C084FC' }} />
                            </div>
                        </div>
                        <div className={styles.pillarScoreWrap}>
                            <span className={styles.pillarScoreText}>{momentumBreakdown.score || 21} <span style={{ color: 'rgba(255,255,255,0.4)' }}>/ 25</span></span>
                            <span className={styles.pillarSentimentBadge} style={{ color: '#C084FC', borderColor: 'rgba(192, 132, 252, 0.3)', background: 'rgba(192, 132, 252, 0.1)' }}>
                                {momentumBreakdown.label || 'Bullish'}
                            </span>
                        </div>
                    </div>

                    {/* 3. Structure Pillar */}
                    <div className={styles.pillarSummaryRow}>
                        <div className={styles.pillarMeta}>
                            <div className={styles.pillarIconWrap} style={{ color: '#38BDF8' }}>
                                <IndicatorIcon type="structure" />
                            </div>
                            <span className={styles.pillarName}>Market Structure</span>
                        </div>
                        <div className={styles.pillarTrackWrap}>
                            <div className={styles.pillarTrack}>
                                <div className={styles.pillarFill} style={{ width: `${structurePct}%`, background: '#38BDF8' }} />
                            </div>
                        </div>
                        <div className={styles.pillarScoreWrap}>
                            <span className={styles.pillarScoreText}>{structureBreakdown.score || 12} <span style={{ color: 'rgba(255,255,255,0.4)' }}>/ 25</span></span>
                            <span className={styles.pillarSentimentBadge} style={{ color: '#38BDF8', borderColor: 'rgba(56, 189, 248, 0.3)', background: 'rgba(56, 189, 248, 0.1)' }}>
                                {structureBreakdown.label || 'Neutral'}
                            </span>
                        </div>
                    </div>

                    {/* Confluence Formula Line */}
                    <div className={styles.confluenceFormulaLine}>
                        <span className={styles.formulaTitle}>SCORING EQUATION:</span>
                        <span className={styles.formulaEquation}>
                            Trend ({trendBreakdown.score || 25}) + Momentum ({momentumBreakdown.score || 21}) + Structure ({structureBreakdown.score || 12}) = <strong style={{ color: '#10B981' }}>{technicalScore.total || 68} / 100</strong>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
