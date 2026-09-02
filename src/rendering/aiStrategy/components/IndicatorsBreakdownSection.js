'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../aiStrategy.module.scss';
import {
    ChevronIcon,
    TrendArrowIcon,
    TrendBoxIcon,
    getScoreColor,
    formatValue,
    formatVolVal,
    accordionVariants
} from '@/icons/analysisIcons';

export default function IndicatorsBreakdownSection({
    trendAnalysis = {},
    momentum = {},
    volumeAnalysis = {},
    scoreColor,
    expandedAccordions,
    onToggleMain,
    t
}) {
    return (
        <>
            {/* TREND ANALYSIS ACCORDION */}
            <div className={styles.premiumAccordion}>
                <div className={styles.premiumAccordionHeader} onClick={() => onToggleMain('trend')}>
                    <span>{t('aiStrategy.trendTitle', 'TREND ANALYSIS')}</span>
                    <ChevronIcon isOpen={expandedAccordions.trend} />
                </div>
                <AnimatePresence initial={false}>
                    {expandedAccordions.trend && (
                        <motion.div
                            key="trend-content"
                            initial="collapsed"
                            animate="expanded"
                            exit="collapsed"
                            variants={accordionVariants}
                            style={{ overflow: 'hidden' }}
                        >
                            <div className={styles.premiumAccordionBody}>
                                <div className={styles.trendRowHeader}>
                                    <TrendBoxIcon isBullish={trendAnalysis.direction?.toLowerCase().includes('bull') || trendAnalysis.direction?.toLowerCase().includes('buy')} />
                                    <div className={styles.trendHeaderText}>
                                        <h4>{trendAnalysis.direction || 'Neutral'}</h4>
                                        <span>{trendAnalysis.strength || '-'}</span>
                                    </div>
                                </div>

                                {/* EMA Grid list */}
                                <div className={styles.indicatorMetricGrid}>
                                    <div className={styles.metricGridItem}>
                                        <div className={styles.indicatorLabelBox}>
                                            <span className={`${styles.dotDot} ${styles.ema20}`} />
                                            <span>EMA 20</span>
                                        </div>
                                        <div className={styles.indicatorValueAction}>
                                            <span className={styles.positionTxt} style={{ color: trendAnalysis.ema_20?.position === 'Above' ? '#10b981' : '#ef4444' }}>
                                                {trendAnalysis.ema_20?.position || 'Below'}
                                            </span>
                                            <TrendArrowIcon direction={trendAnalysis.ema_20?.position} />
                                        </div>
                                    </div>

                                    <div className={styles.metricGridItem}>
                                        <div className={styles.indicatorLabelBox}>
                                            <span className={`${styles.dotDot} ${styles.ema50}`} />
                                            <span>EMA 50</span>
                                        </div>
                                        <div className={styles.indicatorValueAction}>
                                            <span className={styles.positionTxt} style={{ color: trendAnalysis.ema_50?.position === 'Above' ? '#10b981' : '#ef4444' }}>
                                                {trendAnalysis.ema_50?.position || 'Below'}
                                            </span>
                                            <TrendArrowIcon direction={trendAnalysis.ema_50?.position} />
                                        </div>
                                    </div>

                                    <div className={styles.metricGridItem}>
                                        <div className={styles.indicatorLabelBox}>
                                            <span className={`${styles.dotDot} ${styles.supertrend}`} />
                                            <span>SuperTrend</span>
                                        </div>
                                        <div className={styles.indicatorValueAction}>
                                            <span className={styles.positionTxt} style={{ color: trendAnalysis.supertrend?.direction === 'BULLISH' ? '#10b981' : '#ef4444' }}>
                                                {trendAnalysis.supertrend?.direction === 'BULLISH' ? 'Above' : 'Below'}
                                            </span>
                                            <TrendArrowIcon direction={trendAnalysis.supertrend?.direction === 'BULLISH' ? 'Above' : 'Below'} />
                                        </div>
                                    </div>
                                </div>

                                {/* Trend Confidence Fill */}
                                <div className={styles.trendConfidenceContainer}>
                                    <div className={styles.confidenceTexts}>
                                        <span>Trend Confidence</span>
                                        <strong>{trendAnalysis.trend_confidence || '-'}</strong>
                                    </div>
                                    <div className={styles.confidenceTrack}>
                                        <div
                                            className={styles.confidenceFill}
                                            style={{
                                                width: trendAnalysis.trend_confidence || '0%',
                                                backgroundColor: scoreColor
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* MOMENTUM ACCORDION */}
            <div className={styles.premiumAccordion}>
                <div className={styles.premiumAccordionHeader} onClick={() => onToggleMain('momentum')}>
                    <span>{t('aiStrategy.momentumTitle', 'MOMENTUM')}</span>
                    <ChevronIcon isOpen={expandedAccordions.momentum} />
                </div>
                <AnimatePresence initial={false}>
                    {expandedAccordions.momentum && (
                        <motion.div
                            key="momentum-content"
                            initial="collapsed"
                            animate="expanded"
                            exit="collapsed"
                            variants={accordionVariants}
                            style={{ overflow: 'hidden' }}
                        >
                            <div className={styles.premiumAccordionBody}>
                                {/* RSI Slider Range */}
                                <div className={styles.momentumSliderContainer}>
                                    <div className={styles.sliderLabelRow}>
                                        <span className={styles.sliderName}>RSI (14)</span>
                                        <span className={styles.sliderValTxt}>{formatValue(momentum.rsi?.value)}</span>
                                    </div>

                                    {/* Gradient Track & Pin Pointer */}
                                    <div className={styles.gradientTrackBg}>
                                        <div
                                            className={styles.sliderPinPointer}
                                            style={{ left: `${Math.min(100, Math.max(0, momentum.rsi?.value || 50))}%` }}
                                        >
                                            <div className={styles.pinDot} />
                                            <div className={styles.pinLine} />
                                        </div>
                                        <span className={styles.axisMarker} style={{ left: '30%' }}>30</span>
                                        <span className={styles.axisMarker} style={{ left: '70%' }}>70</span>
                                    </div>

                                    <span className={styles.sliderStatusLabel}>
                                        {momentum.rsi?.value < 30 ? 'Oversold' : momentum.rsi?.value > 70 ? 'Overbought' : 'Neutral'}
                                    </span>
                                </div>

                                {/* MACD Histogram Zero Center Bar */}
                                {momentum.macd && (
                                    <div className={styles.macdMetricsContainer}>
                                        <div className={styles.macdHeaderRow}>
                                            <span className={styles.macdTitle}>MACD ({momentum.macd.params})</span>
                                            <span
                                                className={styles.macdLabelValue}
                                                style={{ color: getScoreColor(momentum.macd.direction) }}
                                            >
                                                {momentum.macd.direction}
                                            </span>
                                        </div>

                                        {/* Histogram Center Alignment Track */}
                                        <div className={styles.macdHistogramTrack}>
                                            <div className={styles.centerLine} />
                                            {momentum.macd.histogram !== undefined && (
                                                <div
                                                    className={styles.histogramFillBar}
                                                    style={{
                                                        left: momentum.macd.histogram >= 0 ? '50%' : `calc(50% - ${Math.min(48, Math.abs(momentum.macd.histogram) * 2.5)}%)`,
                                                        width: `${Math.min(48, Math.abs(momentum.macd.histogram) * 2.5)}%`,
                                                        backgroundColor: momentum.macd.histogram >= 0 ? '#10b981' : '#ef4444'
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <div className={styles.macdSubDetailsRow}>
                                            <span>Line: {formatValue(momentum.macd.line)}</span>
                                            <span>Signal: {formatValue(momentum.macd.signal)}</span>
                                            <span>Hist: {formatValue(momentum.macd.histogram)}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Stochastic %K and %D progress rows */}
                                {momentum.stochastic && (
                                    <div className={styles.stochasticSubProgressList}>
                                        <div className={styles.stochProgressRow}>
                                            <span className={styles.stochLabel}>Stoch %K</span>
                                            <div className={styles.stochTrackBg}>
                                                <div
                                                    className={styles.stochFillBar}
                                                    style={{
                                                        width: `${momentum.stochastic.k || 0}%`,
                                                        backgroundColor: getScoreColor(momentum.stochastic.direction)
                                                    }}
                                                />
                                            </div>
                                            <span className={styles.stochValText}>{Math.round(momentum.stochastic.k || 0)}</span>
                                        </div>

                                        <div className={styles.stochProgressRow}>
                                            <span className={styles.stochLabel}>Stoch %D</span>
                                            <div className={styles.stochTrackBg}>
                                                <div
                                                    className={styles.stochFillBar}
                                                    style={{
                                                        width: `${momentum.stochastic.d || 0}%`,
                                                        backgroundColor: getScoreColor(momentum.stochastic.direction)
                                                    }}
                                                />
                                            </div>
                                            <span className={styles.stochValText}>{Math.round(momentum.stochastic.d || 0)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* VOLUME ANALYSIS ACCORDION */}
            <div className={styles.premiumAccordion}>
                <div className={styles.premiumAccordionHeader} onClick={() => onToggleMain('volume')}>
                    <span>{t('aiStrategy.volumeTitle', 'VOLUME ANALYSIS')}</span>
                    <ChevronIcon isOpen={expandedAccordions.volume} />
                </div>
                <AnimatePresence initial={false}>
                    {expandedAccordions.volume && (
                        <motion.div
                            key="volume-content"
                            initial="collapsed"
                            animate="expanded"
                            exit="collapsed"
                            variants={accordionVariants}
                            style={{ overflow: 'hidden' }}
                        >
                            <div className={styles.premiumAccordionBody}>
                                {/* Relative Volume Track */}
                                <div className={styles.relativeVolumeContainer}>
                                    <div className={styles.volHeaderRow}>
                                        <span>Relative Volume</span>
                                        <strong>{volumeAnalysis.relative_volume || '0'}x</strong>
                                    </div>
                                    <div className={styles.relativeVolumeTrack}>
                                        <div
                                            className={styles.relativeVolPointer}
                                            style={{ left: `${Math.min(100, (volumeAnalysis.relative_volume || 0) * 33.3)}%` }}
                                        />
                                        <span className={styles.volMarker} style={{ left: '0%' }}>0x</span>
                                        <span className={styles.volMarker} style={{ left: '33.3%' }}>1x</span>
                                        <span className={styles.volMarker} style={{ left: '66.6%' }}>2x</span>
                                        <span className={styles.volMarker} style={{ left: '100%' }}>3x+</span>
                                    </div>
                                </div>

                                {/* Current vs 20D Avg Cards Grid */}
                                <div className={styles.volumeCompareGrid}>
                                    <div className={styles.volCompareCard}>
                                        <span className={styles.volCompareLabel}>Current</span>
                                        <strong className={styles.volCompareValue}>{formatVolVal(volumeAnalysis.current_volume)}</strong>
                                    </div>
                                    <div className={styles.volCompareCard}>
                                        <span className={styles.volCompareLabel}>20D Avg</span>
                                        <strong className={styles.volCompareValue}>{formatVolVal(volumeAnalysis.avg_volume_20d)}</strong>
                                    </div>
                                </div>

                                {/* Buying/Selling Pressure segments */}
                                {volumeAnalysis.pressure && (
                                    <div className={styles.volumePressureContainer}>
                                        <div className={styles.pressureHeaderRow}>
                                            <span>Pressure</span>
                                            <strong style={{ color: getScoreColor(volumeAnalysis.pressure.label) }}>
                                                {volumeAnalysis.pressure.label}
                                            </strong>
                                        </div>

                                        {/* Segmented Bar Fill */}
                                        <div className={styles.segmentedPressureBar}>
                                            <div
                                                className={styles.buySegment}
                                                style={{ width: `${volumeAnalysis.pressure.buy_pct || 50}%` }}
                                            >
                                                <span>{volumeAnalysis.pressure.buy_pct}%</span>
                                            </div>
                                            <div
                                                className={styles.sellSegment}
                                                style={{ width: `${volumeAnalysis.pressure.sell_pct || 50}%` }}
                                            >
                                                <span>{volumeAnalysis.pressure.sell_pct}%</span>
                                            </div>
                                        </div>
                                        <div className={styles.pressureLabelsRow}>
                                            <span className={styles.buyText}>Buy</span>
                                            <span className={styles.sellText}>Sell</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
