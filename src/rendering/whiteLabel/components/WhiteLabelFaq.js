'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../whiteLabel.module.scss';

const FAQS = [
    {
        q: 'What is ChronosX White Label?',
        a: 'ChronosX White Label is a turnkey B2B technology solution designed to allow eligible businesses to create a fully branded AI trading platform using selected AI-powered and quantitative capabilities from the ChronosX institutional ecosystem.'
    },
    {
        q: 'Who can use ChronosX White Label?',
        a: 'The solution is purpose-built for forex and CFD brokers, prop trading firms, fintech startups, trading communities, educators, and enterprise teams building customer experiences around global financial markets.'
    },
    {
        q: 'Can I use my own branding and custom domain?',
        a: 'Yes. The white-label offering provides a completely branded customer experience. You can customize your logo, typography, primary color palettes, custom sub-domain (e.g. app.yourbrand.com), and interface styling.'
    },
    {
        q: 'Which ChronosX features can be included?',
        a: 'Depending on your agreed package, you can include the AI Chart Scanner (Neural Vision OCR), AI Market Assistant, AI Trading Intelligence & Signals, AI Past Trade Analyzer, Strategy Backtesting suite, and Custom Bot Builder.'
    },
    {
        q: 'Do I need to build the AI technology or train models myself?',
        a: 'No. The purpose of our white-label model is to give your business instant access to an established, battle-tested AI and quantitative foundation, eliminating the need to hire internal AI researchers or build infrastructure from scratch.'
    },
    {
        q: 'Can the platform be customized for my specific business workflow?',
        a: 'Yes. Branding, interface requirements, selected modules, webhook integrations, and user onboarding workflows can be tailored during the consultation and onboarding phase.'
    },
    {
        q: 'Can I integrate it with my existing broker or trading infrastructure?',
        a: 'Yes. We support custom API endpoints, Webhook signals to MetaTrader 4/5 or cTrader, and authentication bridging to connect seamlessly with your existing infrastructure.'
    },
    {
        q: 'How do I get started?',
        a: 'Contact our enterprise team with your business requirements, target audience, desired feature modules, and timeline. Our team will guide you through the architecture setup and implementation.'
    }
];

export default function WhiteLabelFaq({ onContactClick }) {
    const [openIndex, setOpenIndex] = useState(0);

    const toggleFaq = (index) => {
        setOpenIndex((prev) => (prev === index ? -1 : index));
    };

    return (
        <>
            {/* 17 — Call To Action Section */}
            <section className={styles.ctaSection}>
                <div className={styles.container}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55 }}
                        className={styles.ctaCardBox}
                    >
                        <div className={styles.sectionMiniTag} style={{ justifyContent: 'center' }}>
                            Ready to Get Started?
                        </div>
                        <h2 className={styles.ctaTitle}>
                            Build Your Trading Platform With ChronosX.
                        </h2>
                        <p className={styles.ctaSubtitle}>
                            Your business already has the vision. Now build the technology around it. Launch an AI-powered trading experience under your own brand with everything you need in one connected environment.
                        </p>
                        <div className={styles.ctaTagline}>
                            Your Brand. Your Users. Your Platform. Powered by ChronosX.
                        </div>

                        <div className={styles.heroCtaGroup} style={{ margin: 0 }}>
                            <button
                                type="button"
                                onClick={onContactClick}
                                className={styles.primaryCtaBtn}
                            >
                                <span>Talk to Our Team</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>

                            <Link href="/capabilities" className={styles.secondaryCtaBtn}>
                                <span>Explore ChronosX</span>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 18 — FAQ Accordion Section */}
            <section className={styles.faqSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeaderCenter}>
                        <div className={styles.sectionMiniTag} style={{ justifyContent: 'center' }}>
                            FAQ
                        </div>
                        <h2 className={styles.sectionMainTitle}>
                            Frequently Asked Questions.
                        </h2>
                        <p className={styles.sectionMainSubtitle}>
                            Everything you need to know about ChronosX White-Label platform deployment.
                        </p>
                    </div>

                    <div className={styles.faqList}>
                        {FAQS.map((faq, index) => {
                            const isOpen = openIndex === index;
                            return (
                                <div
                                    key={faq.q}
                                    className={`${styles.faqItem} ${isOpen ? styles.faqOpen : ''}`}
                                >
                                    <button
                                        type="button"
                                        className={styles.faqQuestionBtn}
                                        onClick={() => toggleFaq(index)}
                                    >
                                        <span>{faq.q}</span>
                                        <span
                                            className={styles.faqToggleIcon}
                                            style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
                                        >
                                            ▼
                                        </span>
                                    </button>

                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.28, ease: 'easeInOut' }}
                                                className={styles.faqAnswerBox}
                                            >
                                                <p>{faq.a}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </>
    );
}
