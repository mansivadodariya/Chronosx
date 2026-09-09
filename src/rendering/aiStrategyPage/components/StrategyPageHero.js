'use client';

import React from 'react';
import { motion } from 'framer-motion';
import SectionHeader from '@/components/sectionHeader';
import { useLanguage } from '@/context/LanguageContext';
import { authNavigate } from '@/lib/authRedirect';
import styles from '../aiStrategyPage.module.scss';

export default function StrategyPageHero({
    router,
    scrollToDemo,
    valueBadges
}) {
    const { t } = useLanguage();

    return (
        <section className={styles.heroSection}>
            <div className="container">
                <div className={styles.heroCenterWrapper}>
                    {/* Uniform Section Header */}
                    <SectionHeader
                        badge={t('strategyPage.heroBadge', 'INSTITUTIONAL QUANTITATIVE FEED')}
                        title1={t('strategyPage.heroTitle1', 'Live Analysis Feed & Quantitative')}
                        title2={t('strategyPage.heroTitle2', 'AI Strategy Generator.')}
                        description={t('strategyPage.heroSubtitle', 'Experience real-time institutional FX intelligence. Select custom algorithmic strategies, track live 100-point Technical Scores across major pairs, and execute data-backed trades with multi-factor confluence.')}
                        align="center"
                    />

                    {/* Hero CTAs */}
                    <motion.div
                        className={styles.heroCtaGroup}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                    >
                        <button
                            type="button"
                            onClick={() => authNavigate(router, '/live-scanner')}
                            className={styles.heroPrimaryBtn}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                            </svg>
                            <span>LAUNCH LIVE ANALYSIS FEED</span>
                        </button>

                        <button
                            type="button"
                            onClick={scrollToDemo}
                            className={styles.heroSecondaryBtn}
                        >
                            <span>EXPLORE 100-POINT SCORING</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M19 12l-7 7-7-7" />
                            </svg>
                        </button>
                    </motion.div>

                    {/* Key Interface Highlights (Value Badges) */}
                    <motion.div
                        className={styles.highlightsGrid}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        {valueBadges.map((item) => (
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
