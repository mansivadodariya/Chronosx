'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import SupportTicketForm from '@/components/supportTicketForm';
import CommonCta from '@/components/commonCta';
import CommonSectionHeader from '@/components/CommonSectionHeader';
import styles from './publicTechnicalSupport.module.scss';

const FEATURES = [
    {
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        ),
        labelKey: 'technicalSupport.featureFastLabel',
        labelFallback: 'Fast Response',
        descKey: 'technicalSupport.featureFastDesc',
        descFallback: 'Avg. reply under 2 hours',
    },
    {
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
        ),
        labelKey: 'technicalSupport.featureSecureLabel',
        labelFallback: 'Encrypted & Secure',
        descKey: 'technicalSupport.featureSecureDesc',
        descFallback: 'End-to-end ticket privacy',
    },
    {
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
        labelKey: 'technicalSupport.featureExpertLabel',
        labelFallback: 'Expert Engineers',
        descKey: 'technicalSupport.featureExpertDesc',
        descFallback: 'Dedicated quant dev team',
    },
    {
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        ),
        labelKey: 'technicalSupport.featureTrackLabel',
        labelFallback: 'Ticket Tracking',
        descKey: 'technicalSupport.featureTrackDesc',
        descFallback: 'Full status updates via email',
    },
];

export default function PublicTechnicalSupport() {
    const { t } = useLanguage();

    return (
        <div className={styles.page}>
            {/* Ambient glows */}
            <div className={styles.ambientGlowTop} aria-hidden="true" />
            <div className={styles.ambientGlowLeft} aria-hidden="true" />
            <div className={styles.ambientGlowRight} aria-hidden="true" />
            <div className={styles.gridOverlay} aria-hidden="true" />

            {/* ── Common Section Header ── */}
            <motion.div
                className={styles.headerWrap}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
                <CommonSectionHeader
                    badge={t('technicalSupport.publicBadge', 'SUPPORT DESK')}
                    badgeIcon={
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    }
                    title1={t('technicalSupport.publicTitle', 'Need Help? Raise a')}
                    title2={t('technicalSupport.publicTitleAccent', 'Support Ticket')}
                    subtitle={t(
                        'technicalSupport.publicSubtitle',
                        'Describe your issue with as much detail as possible. Attach screenshots to help our engineering team diagnose and resolve faster.'
                    )}
                    isCard={true}
                    as="h1"
                />
            </motion.div>

            {/* ── Main 2-Column Layout ── */}
            <section className={styles.mainSection}>
                <div className={styles.contentLayout}>
                    {/* Left Column: Info & Features */}
                    <motion.div
                        className={styles.infoColumn}
                        initial={{ opacity: 0, x: -24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Info Card */}
                        <div className={styles.infoCard}>
                            <div className={styles.infoCardGlow} aria-hidden="true" />
                            <div className={styles.infoIcon}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            </div>
                            <h2 className={styles.infoTitle}>
                                {t('technicalSupport.infoCardTitle', 'How It Works')}
                            </h2>
                            <p className={styles.infoDescription}>
                                {t(
                                    'technicalSupport.infoCardDesc',
                                    'Submit a ticket with your contact details and a description of the issue. Our dedicated technical team reviews every submission and responds via email within a few hours during business days.'
                                )}
                            </p>
                        </div>

                        {/* Feature Highlights Grid */}
                        <div className={styles.featureGrid}>
                            {FEATURES.map((feat, i) => (
                                <div className={styles.featureItem} key={i}>
                                    <div className={styles.featureIcon}>{feat.icon}</div>
                                    <div className={styles.featureMeta}>
                                        <span className={styles.featureLabel}>
                                            {t(feat.labelKey, feat.labelFallback)}
                                        </span>
                                        <span className={styles.featureDesc}>
                                            {t(feat.descKey, feat.descFallback)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Column: Support Ticket Form */}
                    <motion.div
                        className={styles.formColumn}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className={styles.formCard}>
                            <div className={styles.formCardGlow} aria-hidden="true" />
                            <div className={styles.formHeader}>
                                <div className={styles.formBadge}>
                                    {t('technicalSupport.formBadge', 'RAISE A TICKET')}
                                </div>
                                <h2 className={styles.formTitle}>
                                    {t('technicalSupport.formTitle', 'Submit Your Ticket')}
                                </h2>
                                <p className={styles.formSubtitle}>
                                    {t(
                                        'technicalSupport.formSubtitle',
                                        'Fill in the details below. All fields marked with * are required.'
                                    )}
                                </p>
                            </div>
                            <SupportTicketForm />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Bottom CTA ── */}
            <CommonCta
                badge={t('technicalSupport.ctaBadge', 'NEED FASTER RESOLUTION?')}
                title1={t('technicalSupport.ctaTitle1', 'Start Trading with')}
                title2={t('technicalSupport.ctaTitle2', 'ChronosX AI Intelligence')}
                description={t(
                    'technicalSupport.ctaDesc',
                    'Join thousands of elite traders leveraging real-time neural vision, algorithmic signals, and institutional-grade execution.'
                )}
                primaryBtnText={t('technicalSupport.ctaBtn', 'GET STARTED NOW')}
                primaryBtnAction="/signup"
            />
        </div>
    );
}
