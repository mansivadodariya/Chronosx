'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../whiteLabel.module.scss';

const CUSTOMIZATION_POINTS = [
    {
        title: 'Your Logo & Visual Identity',
        desc: 'Place your brand identity at the absolute center of the user experience. Adapt the interface around your brand colors, typography, and dark/light design systems.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
        )
    },
    {
        title: 'Custom Domain & Ecosystem',
        desc: 'Seamlessly host on your own domain (e.g. app.yourbrand.com) and position the platform as part of your existing website, application, and customer journey.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
        )
    },
    {
        title: 'Flexible Feature Configuration',
        desc: 'Structure platform modules around your business model. Enable or disable AI Chart Vision, Market Copilot, Past Trade Audit, or Backtesting as desired.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
        )
    },
    {
        title: 'Direct Customer Relationships',
        desc: 'Retain 100% ownership of your customer data, signups, user credentials, and engagement metrics within your private enterprise database.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
        )
    }
];

export default function WhiteLabelMakeItYours() {
    const [activeTheme, setActiveTheme] = useState('Emerald');
    const brandName = 'TRADEFLOW';

    const getThemeClass = () => {
        if (activeTheme === 'Cyan') return styles.themeCyan;
        if (activeTheme === 'Gold') return styles.themeGold;
        return styles.themeEmerald;
    };

    return (
        <section className={styles.customizationSection}>
            <div className={styles.container}>
                <div className={styles.customizationSplitGrid}>
                    {/* Left Points */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55 }}
                        className={styles.customizationTextCol}
                    >
                        <div className={styles.sectionMiniTag}>Your Brand, Your Platform</div>
                        <h2 className={styles.sectionMainTitle} style={{ textAlign: 'left', margin: 0 }}>
                            Make the Experience Yours.
                        </h2>
                        <p className={styles.sectionMainSubtitle} style={{ margin: 0 }}>
                            Your users shouldn&apos;t feel like they&apos;re using someone else&apos;s product. The experience should belong completely to your brand.
                        </p>

                        <div className={styles.customizationPointsList}>
                            {CUSTOMIZATION_POINTS.map((point) => (
                                <div key={point.title} className={styles.customizationPointItem}>
                                    <div className={styles.pointIconWrap}>
                                        {point.icon}
                                    </div>
                                    <div className={styles.pointContent}>
                                        <h4>{point.title}</h4>
                                        <p>{point.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Interactive Brand Simulator */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55, delay: 0.1 }}
                        className={styles.brandSimulatorCard}
                    >
                        <div className={styles.simulatorTopRow}>
                            <span className={styles.simulatorTitle}>Interactive Brand Simulator</span>
                            <div className={styles.brandControlsRow}>
                                {['Emerald', 'Cyan', 'Gold'].map((theme) => (
                                    <button
                                        key={theme}
                                        type="button"
                                        className={`${styles.brandThemeBtn} ${activeTheme === theme ? styles.activeTheme : ''}`}
                                        onClick={() => setActiveTheme(theme)}
                                    >
                                        {theme}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Simulated Mini Terminal */}
                        <div className={`${styles.simulatedTerminal} ${getThemeClass()}`}>
                            <div className={styles.simTerminalHeader}>
                                <div className={styles.simBrandLogo}>
                                    <div className={styles.logoIconBox}>▲</div>
                                    <span>{brandName} AI</span>
                                </div>
                                <div className={styles.simNavLinks}>
                                    <span className={styles.activeLink}>Terminal</span>
                                    <span>OCR Scanner</span>
                                    <span>Signals</span>
                                    <span>Audit</span>
                                </div>
                            </div>

                            <div className={styles.simTerminalBody}>
                                <div className={styles.simChartBox}>
                                    <div className={styles.simChartTitle}>
                                        <span>EUR/USD • M15 Breakout</span>
                                        <span>+1.84%</span>
                                    </div>
                                    <svg className={styles.simCandleSvg} viewBox="0 0 300 100" fill="none">
                                        <path d="M10 80 Q 70 20, 140 60 T 290 15" stroke="currentColor" strokeWidth="2.5" />
                                        <line x1="60" y1="40" x2="60" y2="70" stroke="currentColor" strokeWidth="1.5" />
                                        <line x1="120" y1="30" x2="120" y2="65" stroke="currentColor" strokeWidth="1.5" />
                                        <line x1="180" y1="20" x2="180" y2="80" stroke="currentColor" strokeWidth="1.5" />
                                        <line x1="240" y1="10" x2="240" y2="50" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                </div>

                                <div className={styles.simScoreBox}>
                                    <div className={styles.simScoreVal}>88</div>
                                    <div className={styles.simScoreTag}>Strong Buy</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
