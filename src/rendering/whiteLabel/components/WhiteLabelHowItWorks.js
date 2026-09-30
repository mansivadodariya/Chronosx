'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from '../whiteLabel.module.scss';

const STEPS = [
    {
        num: '01',
        badge: 'DISCOVER',
        title: 'Share Your Vision',
        desc: 'Tell us about your business, target trader audience, asset markets, and platform requirements. We map out your target ecosystem.',
        outcome: 'We understand what you are building.'
    },
    {
        num: '02',
        badge: 'DESIGN',
        title: 'Define Brand & UX',
        desc: 'Customize your visual identity, typography, UI layout, platform modules, and required broker/auth integrations.',
        outcome: 'We map the technology to your needs.'
    },
    {
        num: '03',
        badge: 'CONFIGURE',
        title: 'Configure Engine Modules',
        desc: 'Our team provisions your dedicated enterprise instance, routes live market data, and configures AI vision models.',
        outcome: 'Your platform begins taking shape.'
    },
    {
        num: '04',
        badge: 'LAUNCH',
        title: 'Deploy & Scale',
        desc: 'Deploy your branded trading ecosystem on your custom domain and begin onboarding your traders with ongoing support.',
        outcome: 'Your brand. Your platform. Your users.'
    }
];

const ADVANTAGES = [
    { title: 'Faster Launch', desc: 'Deploy a full AI trading suite in days, not years of R&D.' },
    { title: 'Lower Dev Cost', desc: 'Fraction of the cost of building deep neural vision internally.' },
    { title: 'Scalable Infrastructure', desc: 'Multi-region cloud nodes capable of handling millions of requests.' },
    { title: 'Continuous Innovation', desc: 'Automatic engine upgrades, new pattern detectors, and features.' }
];

const SECURITY_POINTS = [
    { title: 'Non-Custodial Architecture', desc: 'We never hold user funds or sensitive private broker credentials.' },
    { title: 'Encrypted Infrastructure', desc: '256-bit TLS enterprise encryption on all communications.' },
    { title: 'Security-First Design', desc: 'Built with enterprise privacy, isolated tenancy, and protection.' },
    { title: 'Market Data Integration', desc: 'Reliable real-time tick-level feeds with zero-gap coverage.' }
];

export default function WhiteLabelHowItWorks() {
    return (
        <section className={styles.howItWorksSection}>
            <div className={styles.container}>
                {/* 10 — How it works */}
                <div className={styles.sectionHeaderCenter}>
                    <div className={styles.sectionMiniTag} style={{ justifyContent: 'center' }}>
                        How It Works
                    </div>
                    <h2 className={styles.sectionMainTitle}>
                        From Idea to Branded Platform.
                    </h2>
                    <p className={styles.sectionMainSubtitle}>
                        A streamlined, 4-step deployment process to launch your turnkey trading ecosystem.
                    </p>
                </div>

                <div className={styles.timelineStepsRow}>
                    {STEPS.map((step, index) => (
                        <motion.div
                            key={step.num}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.45, delay: index * 0.1 }}
                            className={styles.timelineStepCard}
                        >
                            <div className={styles.timelineStepHeader}>
                                <div className={styles.stepIconWrap}>
                                    <span style={{ fontWeight: 800, fontSize: '13px' }}>{step.num}</span>
                                </div>
                                <span className={styles.stepBadge}>{step.badge}</span>
                            </div>
                            <h3 className={styles.stepTitle}>{step.title}</h3>
                            <p className={styles.stepDesc}>{step.desc}</p>
                            <div className={styles.stepOutcomeTag}>{step.outcome}</div>
                        </motion.div>
                    ))}
                </div>

                {/* 11 — White-Label Advantage & Security Stack */}
                <div className={styles.advantageSection}>
                    <div className={styles.advantageSplitRow}>
                        {/* Focus on Your Business */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.55 }}
                            className={styles.advantageBox}
                        >
                            <div className={styles.sectionMiniTag}>Why Build From Scratch?</div>
                            <h3 className={styles.sectionMainTitle} style={{ fontSize: '24px', textAlign: 'left' }}>
                                Focus on Your Business. Let Technology Do the Heavy Lifting.
                            </h3>
                            <p className={styles.sectionMainSubtitle} style={{ fontSize: '14px' }}>
                                Skip the high development cycle and get to market immediately with a battle-tested AI and quantitative trading foundation.
                            </p>

                            <div className={styles.advantagePillGrid}>
                                {ADVANTAGES.map((adv) => (
                                    <div key={adv.title} className={styles.advantagePillItem}>
                                        <svg className={styles.pillIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        <div>
                                            <h5>{adv.title}</h5>
                                            <p>{adv.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Institutional Grade Reliability */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.55, delay: 0.1 }}
                            className={styles.advantageBox}
                        >
                            <div className={styles.sectionMiniTag}>Built For Trust</div>
                            <h3 className={styles.sectionMainTitle} style={{ fontSize: '24px', textAlign: 'left' }}>
                                Secure, Reliable, Institutional-Grade.
                            </h3>
                            <p className={styles.sectionMainSubtitle} style={{ fontSize: '14px' }}>
                                Your users’ data and trading experience are protected with enterprise-level security and high-availability SLA.
                            </p>

                            <div className={styles.advantagePillGrid}>
                                {SECURITY_POINTS.map((sec) => (
                                    <div key={sec.title} className={styles.advantagePillItem}>
                                        <svg className={styles.pillIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                        <div>
                                            <h5>{sec.title}</h5>
                                            <p>{sec.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
