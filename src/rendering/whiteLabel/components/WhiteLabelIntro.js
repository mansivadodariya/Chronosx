'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from '../whiteLabel.module.scss';

export default function WhiteLabelIntro() {
    return (
        <section className={styles.introSection}>
            <div className={styles.container}>
                <div className={styles.introSplitGrid}>
                    {/* 02 — Introduction Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className={styles.introCard}
                    >
                        <div>
                            <div className={styles.sectionMiniTag}>Why ChronosX White Label</div>
                            <h2 className={styles.introCardTitle}>
                                Build the Trading Platform Your Brand Deserves.
                            </h2>
                            <div className={styles.introCardText}>
                                <p>
                                    Your users expect more than charts and market prices. They want intelligent analysis, faster insights, powerful trading tools, and a seamless digital experience.
                                </p>
                                <p>
                                    Building all of this internally can require significant engineering resources, AI infrastructure, market-data integrations, product development, and ongoing maintenance.
                                </p>
                                <p>
                                    ChronosX White Label brings these capabilities together in one technology ecosystem. Customize the experience around your brand while leveraging the intelligence and infrastructure behind the ChronosX platform.
                                </p>
                            </div>
                        </div>

                        <div className={styles.introCardFooterHighlight}>
                            Your Business. Your Users. Your Brand. Powered by ChronosX Technology.
                        </div>
                    </motion.div>

                    {/* 03 — What is ChronosX White Label Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className={styles.introCard}
                    >
                        <div>
                            <div className={styles.sectionMiniTag}>What is ChronosX White Label?</div>
                            <h2 className={styles.introCardTitle}>
                                One Technology Stack. Completely Your Experience.
                            </h2>
                            <div className={styles.introCardText}>
                                <p>
                                    ChronosX White Label allows businesses to create their own branded AI-powered trading environment using the technology behind the ChronosX ecosystem.
                                </p>
                                <p>
                                    Instead of developing every AI and quantitative capability independently, you can build your platform on top of an established technology foundation.
                                </p>
                            </div>

                            <ul className={styles.introChecklist}>
                                <li>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    <span>Real Brand and Visual Identity</span>
                                </li>
                                <li>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    <span>Advanced AI Trading Technology & OCR Models</span>
                                </li>
                                <li>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    <span>Scalable and Secure Enterprise Infrastructure</span>
                                </li>
                            </ul>
                        </div>

                        <div className={styles.stackImageVisual}>
                            <Image
                                src="/assets/images/white-label/customization-stack.jpg"
                                alt="ChronosX White Label Multi-Layer Customization Architecture"
                                width={600}
                                height={340}
                                quality={90}
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
