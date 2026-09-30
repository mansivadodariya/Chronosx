'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from '../whiteLabel.module.scss';

const AUDIENCES = [
    {
        title: 'Forex Brokers',
        desc: 'Enhance your existing trading ecosystem with AI-powered market intelligence and analytical tools. Give your clients more than a traditional MT4/MT5 interface by embedding intelligent analysis and quantitative capabilities into their daily workflow.',
        highlight: 'Build a smarter client experience around your brokerage.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
        )
    },
    {
        title: 'Prop Trading Firms',
        desc: 'Provide traders with advanced analytical, audit, and performance evaluation tools throughout their evaluation and funded journey. Help traders analyze charts, review historical mistakes, and validate risk parameters.',
        highlight: 'Turn your platform into a complete trader workspace.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
            </svg>
        )
    },
    {
        title: 'Fintech Companies',
        desc: 'Launch a state-of-the-art AI-powered financial trading product without having to build and maintain multi-tier AI vision models, tick processing pipelines, and backtest infrastructure internally.',
        highlight: 'Your product vision. Our technology foundation.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
        )
    },
    {
        title: 'Trading Platforms & Communities',
        desc: 'Transform your trader audience into a high-retention branded ecosystem. Provide your community with exclusive access to AI scanner tools, automated market broadcasts, and quantitative bot strategies under your label.',
        highlight: 'Build a deeper product experience around your audience.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        )
    }
];

export default function WhiteLabelAudience() {
    return (
        <section className={styles.audienceSection}>
            <div className={styles.container}>
                <div className={styles.sectionHeaderCenter}>
                    <div className={styles.sectionMiniTag} style={{ justifyContent: 'center' }}>
                        Who Is It For?
                    </div>
                    <h2 className={styles.sectionMainTitle}>
                        Built for Businesses in Financial Technology.
                    </h2>
                    <p className={styles.sectionMainSubtitle}>
                        Empowering brokerages, prop desks, fintech startups, and trading academies with turnkey institutional intelligence.
                    </p>
                </div>

                <div className={styles.audienceGrid}>
                    {AUDIENCES.map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.45, delay: index * 0.08 }}
                            className={styles.audienceCard}
                        >
                            <div className={styles.audienceIconWrap}>
                                {item.icon}
                            </div>
                            <h3 className={styles.audienceTitle}>{item.title}</h3>
                            <p className={styles.audienceDesc}>{item.desc}</p>
                            <div className={styles.audienceHighlight}>{item.highlight}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
