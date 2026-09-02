'use client';

import React from 'react';
import styles from '../profile.module.scss';

export default function ProfileRightSidebar({
    referralCount,
    credits,
    canViewPlans,
    router,
    setShowPasswordModal,
    setActiveTab,
    setShowLogoutConfirm,
    t
}) {
    return (
        <div className={styles.rightSidebar}>
            {/* Card 1: Account Summary */}
            <div className={styles.rightCard}>
                <h4 className={styles.rightCardTitle}>{t('profile.accountSummary', 'Account Summary')}</h4>

                <div className={styles.summaryMetaRows}>
                    <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Account Status</span>
                        <span className={styles.summaryActiveTag}>Active ✓</span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Total Referrals</span>
                        <span className={styles.summaryProTag}>{referralCount} Ref{referralCount !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                {/* Real Dynamic Credits Box */}
                <div className={styles.creditsCardBox}>
                    <div className={styles.creditsHead}>
                        <span className={styles.creditsLabel}>{t('topbar.credits', 'Available Credits')}</span>
                        {canViewPlans() && (
                            <button type="button" onClick={() => router.push('/plans')} className={styles.viewPlansBtn}>
                                {t('sidebar.proAccount', 'View Plans')} →
                            </button>
                        )}
                    </div>

                    <div className={styles.creditsValueRow}>
                        <div className={styles.creditsNumbers}>
                            <h3 className={styles.creditsAmount}>
                                {credits} <span>{t('topbar.credits', 'Credits')}</span>
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card 2: Verification Status */}
            <div className={styles.rightCard}>
                <h4 className={styles.rightCardTitle}>{t('profile.verificationStatus', 'Verification Status')}</h4>
                <div className={styles.verificationList}>
                    <div className={styles.verifItem}>
                        <div className={styles.verifLeft}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            <span>Email Verification</span>
                        </div>
                        <span className={styles.verifStatusGreen}>Verified ✓</span>
                    </div>
                </div>
            </div>

            {/* Card 3: Quick Actions */}
            <div className={styles.rightCard}>
                <h4 className={styles.rightCardTitle}>{t('profile.quickActions', 'Quick Actions')}</h4>
                <div className={styles.quickActionsGrid}>
                    <button type="button" className={styles.actionGridBtn} onClick={() => setShowPasswordModal(true)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <span>Change Password</span>
                    </button>

                    {canViewPlans() && (
                        <button type="button" className={styles.actionGridBtn} onClick={() => router.push('/plans')}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="2">
                                <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5v-2z" />
                            </svg>
                            <span>Subscription Plans</span>
                        </button>
                    )}

                    <button type="button" className={styles.actionGridBtn} onClick={() => setActiveTab('credit_history')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="2">
                            <rect x="2" y="5" width="20" height="14" rx="2" />
                            <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                        <span>Credit History</span>
                    </button>

                    <button type="button" className={styles.actionGridBtn} onClick={() => setActiveTab('activity_log')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>Recent Activity</span>
                    </button>
                </div>

                <div className={styles.logoutActionWrap}>
                    <button type="button" className={styles.logoutBtn} onClick={() => setShowLogoutConfirm(true)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Sign Out of Account</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
