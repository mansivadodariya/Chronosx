'use client';

import React from 'react';
import styles from '../styles/strategyStudio.module.scss';
import { ChartTrendIcon, AreaChartIcon, PieChartIcon, LightningIcon } from './StudioIcons';

/**
 * High-tech animated chart skeleton and state loader
 */
export default function ChartSkeletonLoader({
    type = 'candlestick',
    symbol = 'EURUSD',
    interval = '15min',
    label = ''
}) {
    if (type === 'candlestick') {
        const dummyBars = [
            { wickH: 60, bodyH: 28, top: 45, isBull: true },
            { wickH: 80, bodyH: 42, top: 30, isBull: false },
            { wickH: 50, bodyH: 22, top: 60, isBull: true },
            { wickH: 90, bodyH: 50, top: 20, isBull: true },
            { wickH: 70, bodyH: 35, top: 40, isBull: false },
            { wickH: 45, bodyH: 20, top: 65, isBull: false },
            { wickH: 85, bodyH: 48, top: 25, isBull: true },
            { wickH: 65, bodyH: 30, top: 50, isBull: true },
            { wickH: 95, bodyH: 55, top: 15, isBull: false },
            { wickH: 75, bodyH: 38, top: 35, isBull: true },
            { wickH: 55, bodyH: 26, top: 55, isBull: false },
            { wickH: 80, bodyH: 44, top: 30, isBull: true },
            { wickH: 60, bodyH: 28, top: 48, isBull: false },
            { wickH: 90, bodyH: 52, top: 18, isBull: true },
            { wickH: 70, bodyH: 34, top: 42, isBull: true },
            { wickH: 85, bodyH: 46, top: 28, isBull: false },
            { wickH: 50, bodyH: 24, top: 58, isBull: true },
            { wickH: 78, bodyH: 40, top: 32, isBull: false }
        ];

        return (
            <div className={styles.candlestickLoaderStage}>
                {/* Horizontal dashed grid lines */}
                <div className={styles.chartGridLines}>
                    <div className={styles.gridLine} />
                    <div className={styles.gridLine} />
                    <div className={styles.gridLine} />
                    <div className={styles.gridLine} />
                    <div className={styles.gridLine} />
                </div>

                {/* Sweeping laser radar scanline */}
                <div className={styles.scanRadarLine} />

                {/* Animated Candlestick Bars */}
                <div className={styles.candlestickBarsRow}>
                    {dummyBars.map((b, i) => (
                        <div key={i} className={styles.candleSkeletonItem}>
                            <div
                                className={styles.candleWick}
                                style={{
                                    height: `${b.wickH}%`,
                                    animationDelay: `${i * 0.08}s`
                                }}
                            />
                            <div
                                className={`${styles.candleBody} ${b.isBull ? styles.bullish : styles.bearish}`}
                                style={{
                                    height: `${b.bodyH}%`,
                                    top: `${b.top}%`,
                                    animationDelay: `${i * 0.08}s`
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Overlay with high-tech spinning orbital loader */}
                <div className={styles.chartLoaderOverlay}>
                    <div className={styles.spinnerOrbitalSmall}>
                        <div className={styles.spinnerRing} />
                        <div className={styles.spinnerDot} />
                    </div>
                    <div className={styles.chartLoaderLabel}>
                        <ChartTrendIcon size={14} color="#18C98B" />
                        <span>{label || `Rendering ${symbol} (${interval}) Candlesticks...`}</span>
                    </div>
                    <div className={styles.chartLoaderSub}>
                        Synchronizing trade entry and exit milestones
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'area') {
        return (
            <div className={styles.areaLoaderStage}>
                {/* Horizontal dashed grid lines */}
                <div className={styles.chartGridLines}>
                    <div className={styles.gridLine} />
                    <div className={styles.gridLine} />
                    <div className={styles.gridLine} />
                </div>

                {/* Shimmering wave polygon fill */}
                <div className={styles.waveSkeletonPath} />

                {/* Animated neon spline line */}
                <div className={styles.waveLineTop}>
                    <svg viewBox="0 0 500 120" preserveAspectRatio="none">
                        <path d="M 0,95 Q 75,80 150,100 T 300,65 T 420,35 T 500,18" />
                    </svg>
                </div>

                {/* Centered micro spinner */}
                <div className={styles.chartLoaderOverlay}>
                    <div className={styles.spinnerOrbitalSmall}>
                        <div className={styles.spinnerRing} />
                        <div className={styles.spinnerDot} />
                    </div>
                    <div className={styles.chartLoaderLabel}>
                        <AreaChartIcon size={14} color="#18C98B" />
                        <span>{label || 'Compiling Equity Progression Curve...'}</span>
                    </div>
                    <div className={styles.chartLoaderSub}>
                        Calculating cumulative account balance across executions
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'donut') {
        return (
            <div className={styles.donutLoaderStage}>
                <div className={styles.donutRingWrap}>
                    <svg viewBox="0 0 100 100">
                        <circle className={styles.track} cx="50" cy="50" r="38" />
                        <circle className={styles.segmentWin} cx="50" cy="50" r="38" />
                        <circle className={styles.segmentLoss} cx="50" cy="50" r="38" />
                    </svg>
                    <div className={styles.donutCenterValue}>
                        <span className={styles.donutValTitle}>ANALYZING</span>
                        <span className={styles.donutValNumber}>...</span>
                    </div>
                </div>

                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <div className={styles.chartLoaderLabel} style={{ justifyContent: 'center' }}>
                        <PieChartIcon size={14} color="#18C98B" />
                        <span>{label || 'Aggregating Trade Outcomes...'}</span>
                    </div>
                    <div className={styles.chartLoaderSub} style={{ marginTop: '2px' }}>
                        Measuring win/loss ratios and risk factor
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.chartLoaderContainer}>
            <div className={styles.spinnerOrbitalSmall}>
                <div className={styles.spinnerRing} />
                <div className={styles.spinnerDot} />
            </div>
            <div className={styles.chartLoaderLabel} style={{ marginTop: '12px' }}>
                <span>Loading Chart Data...</span>
            </div>
        </div>
    );
}
