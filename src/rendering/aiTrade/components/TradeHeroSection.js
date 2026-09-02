'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { authNavigate } from '@/lib/authRedirect';
import { TOP_HIGHLIGHTS } from '../constants/aiTradeData';
import styles from '../aiTrade.module.scss';

export default function TradeHeroSection({ scrollToDemo }) {
    const router = useRouter();

    return (
        <section className={styles.heroSection}>
            <div className="container">
                <div className={styles.heroCenterWrapper}>
                    {/* Main H1 Headline */}
                    <motion.h1
                        className={styles.heroMainTitle}
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        Upload Any Chart. Get Instant <br />
                        <span className={styles.goldGradient}>Institutional AI Trade Signals.</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        className={styles.heroSubtitle}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Experience our Vision AI Chart Scanner. Simply snap or drag-and-drop a screenshot of any TradingView, MT4/MT5, or broker chart — our AI automatically detects the symbol, analyzes market structure, overlays live MT5 technical indicators, and delivers precise BUY / SELL / NO-TRADE setups in seconds.
                    </motion.p>

                    {/* Hero Action CTAs */}
                    <motion.div
                        className={styles.heroCtaGroup}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                    >
                        <button
                            type="button"
                            onClick={() => authNavigate(router, '/trade-snap')}
                            className={styles.heroPrimaryBtn}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <span>UPLOAD CHART &amp; ANALYZE</span>
                        </button>

                        <button
                            type="button"
                            onClick={scrollToDemo}
                            className={styles.heroSecondaryBtn}
                        >
                            <span>TRY DEMO CHART</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M19 12l-7 7-7-7" />
                            </svg>
                        </button>
                    </motion.div>

                    {/* 2. TOP FEATURE HIGHLIGHTS (BADGES) */}
                    <motion.div
                        className={styles.highlightsGrid}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        {TOP_HIGHLIGHTS.map((item) => (
                            <div key={item.id} className={styles.highlightCard}>
                                <div className={`${styles.highlightIconBox} ${styles[item.colorClass]}`}>
                                    {item.icon}
                                </div>
                                <div className={styles.highlightContent}>
                                    <h4>{item.title}</h4>
                                    <p>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
