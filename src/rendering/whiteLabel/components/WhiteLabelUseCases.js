'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from '../whiteLabel.module.scss';

const USE_CASES = [
    {
        title: 'Broker AI Platform',
        desc: 'Add AI-powered analysis, automated chart scanning, and trade diagnostic tools to your existing brokerage interface.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
        )
    },
    {
        title: 'Prop Trading Intelligence',
        desc: 'Create an analytical and risk evaluation workspace tailored for challenge participants and funded prop traders.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
            </svg>
        )
    },
    {
        title: 'AI Trading SaaS',
        desc: 'Launch a standalone subscription-based AI trading intelligence product monetized directly under your brand name.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
        )
    },
    {
        title: 'Trader Analytics Desk',
        desc: 'Focus your offering around comprehensive past trade review, journal audits, risk modeling, and algorithmic backtesting.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
            </svg>
        )
    },
    {
        title: 'Fintech Ecosystem',
        desc: 'Combine market intelligence, AI vision models, and custom automated execution into your existing mobile or web app.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
        )
    }
];

export default function WhiteLabelUseCases() {
    return (
        <section className={styles.useCasesSection}>
            <div className={styles.container}>
                <div className={styles.sectionHeaderCenter}>
                    <div className={styles.sectionMiniTag} style={{ justifyContent: 'center' }}>
                        Ideal White-Label Use Cases
                    </div>
                    <h2 className={styles.sectionMainTitle}>
                        One Technology. Multiple Business Models.
                    </h2>
                    <p className={styles.sectionMainSubtitle}>
                        Flexible architectural configurations designed to match your specific financial enterprise model.
                    </p>
                </div>

                <div className={styles.useCasesGrid}>
                    {USE_CASES.map((uc, index) => (
                        <motion.div
                            key={uc.title}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.45, delay: index * 0.08 }}
                            className={styles.useCaseCard}
                        >
                            <div className={styles.useCaseIcon}>
                                {uc.icon}
                            </div>
                            <h4>{uc.title}</h4>
                            <p>{uc.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
