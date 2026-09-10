'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/activeSubscriptionCard.module.scss';
import { useLanguage } from '@/context/LanguageContext';

import CalendarCountdownClock from './CalendarCountdownClock';

export default function ActiveSubscriptionCard({ subscription, onRenewClick }) {
    const router = useRouter();
    const { t } = useLanguage();

    if (!subscription) return null;

    const planName = subscription.plan_name || (subscription.plan_id ? subscription.plan_id.toUpperCase() : 'Active Plan');
    const calculateDays = () => {
        if (typeof subscription.days_remaining === 'number') return Math.max(0, subscription.days_remaining);
        const end = subscription.end_date || subscription.expires_at;
        if (end) {
            const diff = new Date(end).getTime() - Date.now();
            return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
        }
        return 0;
    };
    const daysRemaining = calculateDays();
    const credits = subscription.credits_remaining ?? subscription.credits ?? 0;

    return (
        <div className={styles.activeSubCard}>
            <div className={styles.ambientGlow} aria-hidden="true" />

            <div className={styles.cardTopRow}>
                <div className={styles.planTierMeta}>
                    <div className={styles.tierBadge}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span>{t('plans.currentTier', 'CURRENT ACTIVE TIER')}</span>
                    </div>

                    <div className={styles.statusPill}>
                        <span className={styles.pulseDot} />
                        <span>{subscription.status || 'ACTIVE'}</span>
                    </div>
                </div>

                <h2 className={styles.planNameHeading}>
                    {planName}
                    <span>• {t('plans.fullAccess', 'Institutional Bandwidth')}</span>
                </h2>
            </div>

            <div className={styles.showcaseGrid}>
                {/* 1. Big Calendar Reverse Countdown Clock */}
                <div className={styles.calendarClockCol}>
                    <CalendarCountdownClock subscription={subscription} />
                </div>

                {/* 2. Complementary Side Metrics */}
                <div className={styles.sideMetricsCol}>
                    {/* Available Credits */}
                    <div className={styles.metricBox}>
                        <div className={styles.metricLabel}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                            </svg>
                            {t('plans.aiComputeBalance', 'AI Compute Balance')}
                        </div>
                        <p className={styles.metricValue}>{Number(credits).toLocaleString()} Credits</p>
                        <div className={styles.metricSub}>Refreshes with active cycle</div>
                    </div>

                    {/* Coverage Status */}
                    <div className={styles.metricBox}>
                        <div className={styles.metricLabel}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            {t('plans.coverageStatus', 'Coverage Status')}
                        </div>
                        <p className={styles.metricValue}>{daysRemaining > 5 ? 'Guaranteed' : 'Renew Soon'}</p>
                        <div className={styles.metricSub}>Non-interrupted AI execution</div>
                    </div>
                </div>
            </div>

            <div className={styles.cardActionRow}>
                <div className={styles.safeNotice}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <polyline points="9 12 11 14 15 10" />
                    </svg>
                    <span>{t('plans.safeguardNote', 'Your plan remains active during any checkout or upgrade renewal.')}</span>
                </div>

                <div className={styles.actionButtonGroup}>
                    <button
                        type="button"
                        className={styles.invoicesBtn}
                        onClick={() => router.push('/profile?tab=payment_history')}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        <span>{t('plans.invoicesBtn', 'Invoices & Ledger')}</span>
                    </button>

                    <button
                        type="button"
                        className={styles.renewBtn}
                        onClick={onRenewClick}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="23 4 23 10 17 10" />
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                        <span>{t('plans.renewExtend', 'Renew / Extend Plan')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
