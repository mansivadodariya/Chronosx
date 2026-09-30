'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from '../whiteLabel.module.scss';

const ECOSYSTEM_LAYERS = [
    {
        step: '01 — DISCOVER',
        title: 'AI Chart Scanner',
        desc: 'Analyze charts in real-time to identify market structures, candlestick patterns, and technical breakout setups with computer vision OCR.'
    },
    {
        step: '02 — UNDERSTAND',
        title: 'AI Market Assistant',
        desc: 'Interact with AI to explore complex macro conditions, technical indicators, and validate trade theses in natural language.'
    },
    {
        step: '03 — ANALYZE',
        title: 'AI Trading Intelligence',
        desc: 'Access structured algorithmic insights, quantitative probability scores, and automated multi-tiered target levels.'
    },
    {
        step: '04 — REVIEW',
        title: 'AI Past Trade Analyzer',
        desc: 'Analyze previous trade executions and detect psychological, risk, or technical errors to steadily increase trader win-rates.'
    },
    {
        step: '05 — TEST',
        title: 'Backtesting Engine',
        desc: 'Evaluate discretionary or automated trading strategies against deep multi-year institutional historical market ticks.'
    },
    {
        step: '06 — BUILD',
        title: 'Custom Bot Builder',
        desc: 'Develop, backtest, and deploy systematic algorithmic trading strategies without complex code overhead.'
    }
];

export default function WhiteLabelEcosystem() {
    return (
        <section className={styles.ecosystemSection}>
            <div className={styles.container}>
                <div className={styles.sectionHeaderCenter}>
                    <div className={styles.sectionMiniTag} style={{ justifyContent: 'center' }}>
                        Platform Ecosystem
                    </div>
                    <h2 className={styles.sectionMainTitle}>
                        One Platform. Multiple Intelligence Layers.
                    </h2>
                    <p className={styles.sectionMainSubtitle}>
                        Create a connected trading experience where different AI capabilities work together synergistically.
                    </p>
                </div>

                <div className={styles.ecosystemGrid}>
                    {ECOSYSTEM_LAYERS.map((layer, index) => (
                        <motion.div
                            key={layer.step}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.45, delay: index * 0.08 }}
                            className={styles.ecosystemCard}
                        >
                            <span className={styles.ecosystemStepTag}>{layer.step}</span>
                            <h3 className={styles.ecosystemName}>{layer.title}</h3>
                            <p className={styles.ecosystemDesc}>{layer.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
