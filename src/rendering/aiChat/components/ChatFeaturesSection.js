'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { KEY_FEATURES } from '../constants/aiChatData';
import styles from '../aiChat.module.scss';

export default function ChatFeaturesSection() {
    return (
        <section className={styles.capabilitiesSection}>
            <div className="container">
                <div className={styles.sectionHeaderCenter}>
                    <div className={styles.sectionBadge}>
                        <span>✦ QUANTITATIVE CAPABILITIES</span>
                    </div>
                    <h2 className={styles.sectionTitle}>
                        ENGINEERED FOR INSTITUTIONAL ACCURACY
                    </h2>
                    <p className={styles.sectionSubtitle}>
                        Built specifically for traders who demand real-time data feeds, strict risk models, and reliable execution.
                    </p>
                </div>

                <div className={styles.featuresGrid}>
                    {KEY_FEATURES.map((feat, index) => (
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
