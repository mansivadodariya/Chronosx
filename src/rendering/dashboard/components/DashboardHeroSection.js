'use client';

import React from 'react';
import styles from '../dashboard.module.scss';

export default function DashboardHeroSection({
    greeting,
    name,
    dailyCreditChartData,
    chartTimeframe,
    setChartTimeframe,
    activeHoverPoint,
    setActiveHoverPoint
}) {
    return (
        <section className={styles.hologramHero}>
            <div className={styles.heroGrid}>
                {/* Left: Greeting & Fast Action Triggers */}
                <div className={styles.heroLeftCol}>
                    <div className={styles.heroTagPill}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="2.5">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span>CHRONOSX AI TRADING DESK</span>
                    </div>

                    <h1 className={styles.heroHeadline}>
                        {greeting}, <span className={styles.nameGradient}>{name || 'Trader'}!</span> <span className={styles.wave}>👋</span>
                    </h1>

                    <p className={styles.heroSubtext}>
                        Real-time multi-timeframe algorithmic pattern detection, neural OCR chart vision, and automated institutional trade setups.
                    </p>
                </div>

                {/* Dynamic Daily AI Credit Consumption Graph */}
                <div className={styles.heroChartSection}>
                    <div className={styles.chartHeaderRow}>
                        <div className={styles.chartTitleGroup}>
                            <span className={styles.chartPulseDot} />
                            <div className={styles.titleTextCol}>
                                <span className={styles.chartTitle}>Daily AI Credit Consumption</span>
                                <span className={styles.chartSubtitle}>Track credit usage per day across AI Chart Scanner & AI Market Assistant</span>
                            </div>
                        </div>

                        <div className={styles.headerRightGroup}>
                            <div className={styles.chartSubBadge}>
                                <span>Total: {dailyCreditChartData.totalUsed} Credits Used</span>
                            </div>

                            <div className={styles.timeframeFilterGroup}>
                                {['7D', '30D', '90D'].map((tf) => (
                                    <button
                                        key={tf}
                                        type="button"
                                        className={`${styles.tfBtn} ${chartTimeframe === tf ? styles.activeTf : ''}`}
                                        onClick={() => setChartTimeframe(tf)}
                                    >
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Interactive SVG Spline Canvas */}
                    <div className={styles.splineCanvasWrap}>
                        {activeHoverPoint && (
                            <div className={styles.floatingChartTooltip} style={{ left: `${(activeHoverPoint.idx / 6) * 82 + 9}%` }}>
                                <span className={styles.tooltipDay}>{activeHoverPoint.dateFormatted}:</span>
                                <span className={styles.tooltipVal}>{activeHoverPoint.credits} Credits</span>
                            </div>
                        )}

                        <svg viewBox="0 0 700 135" preserveAspectRatio="none" className={styles.splineSvg} onMouseLeave={() => setActiveHoverPoint(null)}>
                            <defs>
                                <linearGradient id="creditAreaGlow" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#18C98B" stopOpacity="0.35" />
                                    <stop offset="60%" stopColor="#18C98B" stopOpacity="0.06" />
                                    <stop offset="100%" stopColor="#18C98B" stopOpacity="0" />
                                </linearGradient>
                                <linearGradient id="creditLineStroke" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#00F2FE" />
                                    <stop offset="50%" stopColor="#18C98B" />
                                    <stop offset="100%" stopColor="#6EE7B7" />
                                </linearGradient>
                            </defs>

                            {/* Horizontal Gridlines */}
                            <line x1="0" y1="25" x2="700" y2="25" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="4 4" />
                            <line x1="0" y1="65" x2="700" y2="65" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="4 4" />
                            <line x1="0" y1="105" x2="700" y2="105" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="4 4" />

                            {/* Smooth Bezier Spline Area Fill & Stroke */}
                            <path d={dailyCreditChartData.pathArea} fill="url(#creditAreaGlow)" />
                            <path d={dailyCreditChartData.pathLine} fill="none" stroke="url(#creditLineStroke)" strokeWidth="3.5" strokeLinecap="round" />

                            {/* Interactive Glowing Data Nodes for Each Date */}
                            {dailyCreditChartData.points.map((pt) => (
                                <g key={pt.dateKey} className={styles.chartNodeGroup} onMouseEnter={() => setActiveHoverPoint(pt)}>
                                    <circle cx={pt.x} cy={pt.y} r="5" fill="#18C98B" className={styles.nodeCircle} />
                                    <circle cx={pt.x} cy={pt.y} r="10" fill="rgba(24, 201, 139, 0.3)" className={styles.nodeGlow} />
                                </g>
                            ))}
                        </svg>

                        {/* X-Axis Time Labels displaying Clean Dates */}
                        <div className={styles.chartTimeLabels}>
                            {dailyCreditChartData.points.map((pt) => (
                                <div key={pt.dateKey} className={`${styles.dayLabelItem} ${pt.isToday ? styles.todayLabel : ''}`}>
                                    <span className={styles.dayName}>{pt.dateFormatted}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
