'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from '../aiStrategyPage.module.scss';

export default function StrategyFeaturesBento({ coreFeatures }) {
    return (
        <section className={styles.featuresSection}>
            <div className="container">
                <div className={styles.sectionHeaderCenter}>
                    <div className={styles.sectionBadge}>
                        <span>✦ QUANTITATIVE CAPABILITIES</span>
                    </div>
                    <h2 className={styles.sectionTitle}>
                        CORE PLATFORM FEATURES
                    </h2>
                    <p className={styles.sectionSubtitle}>
                        Engineered for algorithmic accuracy, multi-timeframe confirmation, and real-time execution.
                    </p>
                </div>

                <div className={styles.featuresGrid}>
                    {coreFeatures.map((feat, index) => (
                        <motion.div
                            key={feat.number}
                            className={styles.featureCard}
                            initial={{ opacity: 0, y: 35 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.12 }}
                            whileHover={{ y: -6, transition: { duration: 0.25 } }}
                        >
                            <div className={styles.cardGlowHover} />

                            <div className={styles.cardTopRow}>
                                <div className={styles.featureIconWrap}>
                                    {feat.icon}
                                </div>
                                <span className={styles.featureNum}>{feat.number}</span>
                            </div>

                            <div className={styles.featureBadgePill}>
                                {feat.badge}
                            </div>

                            <h3 className={styles.featureCardTitle}>{feat.title}</h3>
                            <p className={styles.featureCardDesc}>{feat.desc}</p>

                            <div className={styles.featureCardStat}>
                                <span className={styles.statLabel}>{feat.statLabel}</span>
                                <span className={styles.statVal}>{feat.statValue}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
