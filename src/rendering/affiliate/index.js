'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import CommonSectionHeader from '@/components/CommonSectionHeader';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { getStoredUser, getStoredUserId } from '@/lib/authSession';
import { affiliateApi } from '@/lib/api';
import toast from 'react-hot-toast';
import styles from './affiliate.module.scss';

// SVG Icons
const UsersGroupIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const WalletCryptoIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
        <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
        <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
    </svg>
);

const CopyIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

const CheckIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const StarIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const BoltIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

const EyeIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const BotIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
        <line x1="8" y1="16" x2="8" y2="16" />
        <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
);

const ShieldLockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const QrCodeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
);

const SparkleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const ExternalLinkIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
);

const CloseIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export default function AffiliatePage() {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const user = getStoredUser();
    const userId = getStoredUserId();

    const [activeTab, setActiveTab] = useState('overview'); // overview, ledger, withdrawals, marketing
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Dashboard State
    const [stats, setStats] = useState({
        total_earned: 1280.00,
        withdrawable_balance: 420.00,
        pending_lock_balance: 150.00,
        total_withdrawn: 710.00,
        referral_count: 24,
        active_traders: 18,
        referral_code: 'CHRONOS-8921',
        referral_url: '',
        current_tier: {
            level: 1,
            name: 'Tier 1 - Standard Partner',
            rate_percentage: 10,
            next_tier_name: 'Tier 2 - Pro Partner (20%)',
            next_tier_threshold: 30,
            progress_count: 18,
            min_withdrawal: 50.00
        }
    });

    const [commissionHistory, setCommissionHistory] = useState([]);
    const [withdrawalsList, setWithdrawalsList] = useState([]);
    const [ledgerSearch, setLedgerSearch] = useState('');

    // Withdrawal Form State
    const [withdrawForm, setWithdrawForm] = useState({
        asset: 'USDT',
        network: 'TRC20',
        wallet_address: '',
        amount: ''
    });
    const [withdrawing, setWithdrawing] = useState(false);

    // Compute active referral code and link
    const referralCode = useMemo(() => {
        if (stats.referral_code) return stats.referral_code;
        if (userId) return 'REF' + userId.slice(0, 6).toUpperCase();
        return 'CHRONOS-8921';
    }, [stats.referral_code, userId]);

    const referralUrl = useMemo(() => {
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/signup?ref=${referralCode}`;
        }
        return `https://chronosx.com/signup?ref=${referralCode}`;
    }, [referralCode]);

    // Fetch initial affiliate data
    useEffect(() => {
        let isMounted = true;
        async function loadAffiliateData() {
            try {
                setLoading(true);
                const [dashRes, commRes, withRes] = await Promise.all([
                    affiliateApi.getDashboard().catch(() => null),
                    affiliateApi.getCommissionHistory({ page: 1, limit: 20 }).catch(() => null),
                    affiliateApi.getWithdrawals().catch(() => null),
                ]);

                if (isMounted) {
                    if (dashRes?.data) {
                        setStats(prev => ({ ...prev, ...dashRes.data }));
                    }
                    if (commRes?.data) {
                        setCommissionHistory(commRes.data);
                    }
                    if (withRes?.data) {
                        setWithdrawalsList(withRes.data);
                    }
                }
            } catch (e) {
                console.warn('Error loading affiliate data:', e);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        loadAffiliateData();
        return () => { isMounted = false; };
    }, []);

    // 1-Click Copy Handlers
    const handleCopyCode = () => {
        if (typeof navigator !== 'undefined') {
            navigator.clipboard.writeText(referralCode);
            setCopiedCode(true);
            toast.success('Referral code copied to clipboard!');
            setTimeout(() => setCopiedCode(false), 2000);
        }
    };

    const handleCopyLink = () => {
        if (typeof navigator !== 'undefined') {
            navigator.clipboard.writeText(referralUrl);
            setCopiedLink(true);
            toast.success('Referral link copied to clipboard!');
            setTimeout(() => setCopiedLink(false), 2000);
        }
    };

    const handleCopyText = (text, message = 'Copied to clipboard!') => {
        if (typeof navigator !== 'undefined') {
            navigator.clipboard.writeText(text);
            toast.success(message);
        }
    };

    // Social Sharing Triggers
    const shareToTwitter = () => {
        const text = encodeURIComponent('Join me on ChronosX — the AI trading cockpit for multi-timeframe chart detection & quantitative algorithmic execution. Sign up with my link for exclusive perks:');
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(referralUrl)}`, '_blank');
    };

    const shareToTelegram = () => {
        const text = encodeURIComponent('Elevate your trading with ChronosX AI Desk. Instant vision pattern detection & automated bot strategies.');
        window.open(`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${text}`, '_blank');
    };

    const shareToWhatsApp = () => {
        const text = encodeURIComponent(`Check out ChronosX AI Trading Assistant: ${referralUrl}`);
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    };

    const shareToLinkedIn = () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`, '_blank');
    };

    // Withdrawal submission with Phase-1 Balance Locking
    const handleWithdrawSubmit = async (e) => {
        e.preventDefault();
        const numAmount = Number(withdrawForm.amount);
        const minAmount = stats.current_tier?.min_withdrawal || 50;

        if (!withdrawForm.wallet_address.trim()) {
            toast.error('Please enter a valid destination wallet address.');
            return;
        }

        if (numAmount < minAmount) {
            toast.error(`Minimum withdrawal amount is $${minAmount}.00 USDT/USDC.`);
            return;
        }

        if (numAmount > stats.withdrawable_balance) {
            toast.error(`Requested amount ($${numAmount.toFixed(2)}) exceeds withdrawable balance ($${stats.withdrawable_balance.toFixed(2)}).`);
            return;
        }

        try {
            setWithdrawing(true);
            const res = await affiliateApi.requestWithdrawal({
                amount: numAmount,
                asset: withdrawForm.asset,
                network: withdrawForm.network,
                wallet_address: withdrawForm.wallet_address.trim()
            });

            // Instant UI balance update (Phase 1 Lock: Withdrawable -> Pending)
            setStats(prev => ({
                ...prev,
                withdrawable_balance: Math.max(0, prev.withdrawable_balance - numAmount),
                pending_lock_balance: prev.pending_lock_balance + numAmount
            }));

            // Append to withdrawal history table
            const newRecord = res?.data || {
                id: 'WTH-' + Math.floor(1000 + Math.random() * 9000),
                created_at: new Date().toISOString(),
                amount: numAmount,
                asset: withdrawForm.asset,
                network: withdrawForm.network,
                wallet_address: withdrawForm.wallet_address.trim(),
                status: 'PENDING',
                tx_hash: null
            };

            setWithdrawalsList(prev => [newRecord, ...prev]);

            toast.success(res?.message || 'Withdrawal request submitted! Your balance has been locked for settlement.');
            setShowWithdrawModal(false);
            setWithdrawForm(prev => ({ ...prev, amount: '', wallet_address: '' }));
        } catch (err) {
            toast.error(err.message || 'Failed to submit withdrawal request.');
        } finally {
            setWithdrawing(false);
        }
    };

    // Filtered ledger history
    const filteredLedger = useMemo(() => {
        if (!ledgerSearch.trim()) return commissionHistory;
        const q = ledgerSearch.toLowerCase();
        return commissionHistory.filter(item =>
            (item.trader || '').toLowerCase().includes(q) ||
            (item.id || '').toLowerCase().includes(q) ||
            (item.status || '').toLowerCase().includes(q)
        );
    }, [commissionHistory, ledgerSearch]);

    return (
        <div className={styles.affiliatePage}>
            {/* 1. Header Section */}
            <CommonSectionHeader
                badge={t('affiliate.badge', 'CHRONOSX PARTNER & AFFILIATE PORTAL')}
                badgeIcon={<SparkleIcon />}
                title={t('affiliate.title', 'Affiliate & Partner Program')}
                subtitle={t('affiliate.subtitle', "Earn up to 20% recurring crypto commissions across your network's trade volume and deposits with instant on-chain USDT/USDC settlements.")}
                isCard={true}
                rightAction={
                    <button
                        type="button"
                        className={styles.primaryWithdrawBtn}
                        onClick={() => setShowWithdrawModal(true)}
                    >
                        <WalletCryptoIcon />
                        <span>{t('affiliate.requestWithdrawal', 'Request Withdrawal')}</span>
                    </button>
                }
            >
                {/* 2. Top KPI Stats Row */}
                <div className={styles.kpiGrid}>
                    <div className={styles.kpiCard}>
                        <div className={styles.kpiTop}>
                            <span className={styles.kpiLabel}>{t('affiliate.totalEarned', 'Total Earned')}</span>
                            <span className={styles.kpiBadge}>{t('affiliate.thisMonth', '+18.4% this mo')}</span>
                        </div>
                        <div className={styles.kpiValue}>
                            ${stats.total_earned.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <span className={styles.kpiSub}>{t('affiliate.lifetimeRevenue', 'Lifetime partner revenue')}</span>
                    </div>

                    <div className={`${styles.kpiCard} ${styles.highlightCard}`}>
                        <div className={styles.kpiTop}>
                            <span className={styles.kpiLabel}>{t('affiliate.withdrawableBalance', 'Withdrawable Balance')}</span>
                            <span className={styles.readyBadge}>{t('affiliate.readyPayout', 'Ready Payout')}</span>
                        </div>
                        <div className={styles.kpiValueEmerald}>
                            ${stats.withdrawable_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <span className={styles.kpiSub}>{t('affiliate.availableInstant', 'Available for instant crypto withdrawal')}</span>
                    </div>

                    <div className={styles.kpiCard}>
                        <div className={styles.kpiTop}>
                            <span className={styles.kpiLabel}>{t('affiliate.pendingLock', 'Pending Lock')}</span>
                            <span className={styles.pendingBadge}>{t('affiliate.rolling48h', 'Rolling 48h')}</span>
                        </div>
                        <div className={styles.kpiValueAmber}>
                            ${stats.pending_lock_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <span className={styles.kpiSub}>{t('affiliate.securityWindow', 'In security settlement window')}</span>
                    </div>

                    <div className={styles.kpiCard}>
                        <div className={styles.kpiTop}>
                            <span className={styles.kpiLabel}>{t('affiliate.networkReferrals', 'Network Referrals')}</span>
                            <UsersGroupIcon />
                        </div>
                        <div className={styles.kpiValue}>
                            {stats.referral_count} <span className={styles.unitText}>{t('affiliate.tradersUnit', 'Traders')}</span>
                        </div>
                        <span className={styles.kpiSub}>{stats.active_traders} {t('affiliate.activeTradingAccounts', 'active trading accounts')}</span>
                    </div>

                    <div className={styles.kpiCard}>
                        <div className={styles.kpiTop}>
                            <span className={styles.kpiLabel}>{t('affiliate.totalWithdrawn', 'Total Withdrawn')}</span>
                            <WalletCryptoIcon />
                        </div>
                        <div className={styles.kpiValue}>
                            ${stats.total_withdrawn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <span className={styles.kpiSub}>{t('affiliate.processedOnChain', 'Processed on-chain to your wallets')}</span>
                    </div>
                </div>
            </CommonSectionHeader>

            {/* 3. Navigation Tabs Bar */}
            <div className={styles.tabNavContainer}>
                <div className={styles.tabNavRow}>
                    <button
                        type="button"
                        className={`${styles.tabItem} ${activeTab === 'overview' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <SparkleIcon />
                        <span>{t('affiliate.tabOverview', 'Overview & Referral Link')}</span>
                    </button>
                    <button
                        type="button"
                        className={`${styles.tabItem} ${activeTab === 'ledger' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('ledger')}
                    >
                        <span>{t('affiliate.tabLedger', 'Commission Ledger')}</span>
                        {commissionHistory.length > 0 && <span className={styles.countBadge}>{commissionHistory.length}</span>}
                    </button>
                    <button
                        type="button"
                        className={`${styles.tabItem} ${activeTab === 'withdrawals' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('withdrawals')}
                    >
                        <span>{t('affiliate.tabWithdrawals', 'Withdrawals')}</span>
                        {withdrawalsList.length > 0 && <span className={styles.countBadge}>{withdrawalsList.length}</span>}
                    </button>
                    <button
                        type="button"
                        className={`${styles.tabItem} ${activeTab === 'marketing' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('marketing')}
                    >
                        <span>{t('affiliate.tabMarketing', 'Marketing Kit')}</span>
                    </button>
                </div>
            </div>

            {/* 4. Tab Contents */}
            {activeTab === 'overview' && (
                <div className={styles.overviewGrid}>
                    {/* Left Column: Dynamic Tier Card & Progress */}
                    <div className={styles.tierBoxCard}>
                        <div className={styles.tierHeader}>
                            <div className={styles.tierBadgeGroup}>
                                <div className={styles.tierTag}>
                                    <SparkleIcon />
                                    <span>{t('affiliate.tierPartner', 'TIER {level} PARTNER').replace('{level}', stats.current_tier?.level || 1)}</span>
                                </div>
                                <span className={styles.tierRate}>{stats.current_tier?.rate_percentage || 10}{t('affiliate.commissionSuffix', '% Commission')}</span>
                            </div>
                            <div className={styles.tierStatus}>{t('affiliate.activeStandard', 'Active Standard')}</div>
                        </div>

                        <div className={styles.tierProgressBlock}>
                            <div className={styles.progressLabels}>
                                <span>{t('affiliate.milestoneTo', 'Milestone to')} {stats.current_tier?.next_tier_name || 'Tier 2 (20%)'}</span>
                                <strong>{stats.current_tier?.progress_count || 18} / {stats.current_tier?.next_tier_threshold || 30} {t('affiliate.activeTraders', 'Active Traders')}</strong>
                            </div>
                            <div className={styles.progressBarTrack}>
                                <div
                                    className={styles.progressBarFill}
                                    style={{ width: `${Math.min(100, ((stats.current_tier?.progress_count || 18) / (stats.current_tier?.next_tier_threshold || 30)) * 100)}%` }}
                                />
                            </div>
                            <p className={styles.progressHint}>
                                {t('affiliate.referMorePrefix', 'Refer')} <strong>{(stats.current_tier?.next_tier_threshold || 30) - (stats.current_tier?.progress_count || 18)} {t('affiliate.referMoreMiddle', 'more active traders to unlock')}</strong> <strong>{t('affiliate.referMoreHighlight', '20% Lifetime Commissions')}</strong> {t('affiliate.referMoreSuffix', 'and same-day priority crypto settlements.')}
                            </p>
                        </div>

                        {/* Tier Benefits Comparison */}
                        <div className={styles.tierPerksGrid}>
                            <div className={`${styles.perkCard} ${styles.currentPerk}`}>
                                <div className={styles.perkTitle}>{t('affiliate.tier1Current', 'Tier 1 (Current)')}</div>
                                <ul>
                                    <li><span className={styles.bulletIcon}><CheckIcon /></span> {t('affiliate.perk1_1', '10% Recurring Commission on all deposits')}</li>
                                    <li><span className={styles.bulletIcon}><CheckIcon /></span> {t('affiliate.perk1_2', 'Weekly automated USDT/USDC payouts')}</li>
                                    <li><span className={styles.bulletIcon}><CheckIcon /></span> {t('affiliate.perk1_3', 'Min withdrawal: $50.00')}</li>
                                    <li><span className={styles.bulletIcon}><CheckIcon /></span> {t('affiliate.perk1_4', 'Standard dashboard analytics')}</li>
                                </ul>
                            </div>
                            <div className={`${styles.perkCard} ${styles.vipPerk}`}>
                                <div className={styles.perkTitle}>{t('affiliate.tier2Pro', 'Tier 2 (Pro Partner)')}</div>
                                <ul>
                                    <li><span className={styles.starBullet}><StarIcon /></span> <strong>{t('affiliate.perk2_1', '20% Recurring Commission')}</strong></li>
                                    <li><span className={styles.starBullet}><StarIcon /></span> {t('affiliate.perk2_2', 'Priority Same-Day crypto settlements')}</li>
                                    <li><span className={styles.starBullet}><StarIcon /></span> {t('affiliate.perk2_3', 'Min withdrawal: $25.00')}</li>
                                    <li><span className={styles.starBullet}><StarIcon /></span> {t('affiliate.perk2_4', 'Dedicated VIP Partner Manager on Telegram')}</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Referral Link & 1-Click Social Sharing */}
                    <div className={styles.shareBoxCard}>
                        <div className={styles.shareCardHeader}>
                            <h3>{t('affiliate.uniqueReferralLink', 'Your Unique Referral Link')}</h3>
                            <p>{t('affiliate.shareLinkDesc', 'Share your link with traders, communities, and followers to earn instant crypto payouts on every trade executed.')}</p>
                        </div>

                        {/* Link Box */}
                        <div className={styles.linkBox}>
                            <input
                                type="text"
                                readOnly
                                value={referralUrl}
                                className={styles.linkInput}
                            />
                            <button
                                type="button"
                                className={`${styles.copyBtn} ${copiedLink ? styles.copied : ''}`}
                                onClick={handleCopyLink}
                            >
                                {copiedLink ? <CheckIcon /> : <CopyIcon />}
                                <span>{copiedLink ? t('affiliate.copied', 'Copied') : t('affiliate.copyLink', 'Copy Link')}</span>
                            </button>
                        </div>

                        {/* Code Box */}
                        <div className={styles.codeRow}>
                            <div className={styles.codeGroup}>
                                <span className={styles.codeLabel}>{t('affiliate.referralCodeLabel', 'Referral Code:')}</span>
                                <span className={styles.codeBadge}>{referralCode}</span>
                                <button type="button" className={styles.miniCopyBtn} onClick={handleCopyCode}>
                                    {copiedCode ? <CheckIcon /> : <CopyIcon />}
                                </button>
                            </div>
                            <button
                                type="button"
                                className={styles.qrBtn}
                                onClick={() => setShowQrModal(true)}
                            >
                                <QrCodeIcon />
                                <span>{t('affiliate.showQrCode', 'Show QR Code')}</span>
                            </button>
                        </div>

                        {/* Social Share Buttons */}
                        <div className={styles.socialShareSection}>
                            <span className={styles.socialTitle}>{t('affiliate.instantSocialSharing', '1-Click Instant Social Sharing')}</span>
                            <div className={styles.socialButtonsRow}>
                                <button type="button" className={styles.socialBtnX} onClick={shareToTwitter}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                    </svg>
                                    <span>{t('affiliate.shareOnX', 'Share on X')}</span>
                                </button>

                                <button type="button" className={styles.socialBtnTg} onClick={shareToTelegram}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                                    </svg>
                                    <span>{t('affiliate.telegram', 'Telegram')}</span>
                                </button>

                                <button type="button" className={styles.socialBtnWa} onClick={shareToWhatsApp}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm0 18.15c-1.49 0-2.94-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 012.41 5.83c.01 4.54-3.68 8.23-8.22 8.23z"/>
                                    </svg>
                                    <span>{t('affiliate.whatsapp', 'WhatsApp')}</span>
                                </button>

                                <button type="button" className={styles.socialBtnIn} onClick={shareToLinkedIn}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.65 1.65 0 0 0 0-3.3 1.66 1.66 0 0 0 0 3.3m1.39 9.74v-8.37H5.07v8.37h2.78z"/>
                                    </svg>
                                    <span>{t('affiliate.linkedin', 'LinkedIn')}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 2: Commission Ledger Table */}
            {activeTab === 'ledger' && (
                <div className={styles.tableWrapperCard}>
                    <div className={styles.tableToolbar}>
                        <div className={styles.tableTitleGroup}>
                            <h3>{t('affiliate.commissionLedgerTitle', 'Commission History Ledger')}</h3>
                            <p>{t('affiliate.commissionLedgerDesc', "Real-time audit of commissions credited from referred traders' deposits and trading volume.")}</p>
                        </div>

                        <div className={styles.searchBar}>
                            <input
                                type="text"
                                placeholder={t('affiliate.searchPlaceholder', 'Search by trader, ID or status...')}
                                value={ledgerSearch}
                                onChange={(e) => setLedgerSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.tableScroll}>
                        <table className={styles.customTable}>
                            <thead>
                                <tr>
                                    <th>{t('affiliate.thDateTime', 'Date & Time')}</th>
                                    <th>{t('affiliate.thReferredTrader', 'Referred Trader')}</th>
                                    <th>{t('affiliate.thDepositVolume', 'Deposit / Volume')}</th>
                                    <th>{t('affiliate.thTierRate', 'Tier Rate')}</th>
                                    <th>{t('affiliate.thCommissionEarned', 'Commission Earned')}</th>
                                    <th>{t('affiliate.thStatus', 'Status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLedger.length > 0 ? (
                                    filteredLedger.map((item) => (
                                        <tr key={item.id}>
                                            <td className={styles.dateCol}>
                                                {new Date(item.date).toLocaleDateString()} <span className={styles.timeSub}>{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </td>
                                            <td className={styles.traderCol}>
                                                <strong>{item.trader}</strong>
                                            </td>
                                            <td>${Number(item.deposit_volume).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                            <td><span className={styles.tierPill}>{item.tier_rate}</span></td>
                                            <td className={styles.commissionVal}>+${Number(item.commission_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${item.status === 'CREDITED' ? styles.statusCredited : styles.statusPending}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className={styles.emptyTableRow}>
                                            {t('affiliate.noCommissionRecords', 'No commission records found.')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 3: Withdrawal History Table */}
            {activeTab === 'withdrawals' && (
                <div className={styles.tableWrapperCard}>
                    <div className={styles.tableToolbar}>
                        <div className={styles.tableTitleGroup}>
                            <h3>{t('affiliate.cryptoWithdrawalTitle', 'Crypto Withdrawal Requests')}</h3>
                            <p>{t('affiliate.cryptoWithdrawalDesc', 'History of on-chain crypto settlements to your destination wallet addresses.')}</p>
                        </div>
                        <button
                            type="button"
                            className={styles.secondaryWithdrawBtn}
                            onClick={() => setShowWithdrawModal(true)}
                        >
                            <WalletCryptoIcon />
                            <span>{t('affiliate.requestNewWithdrawal', 'Request New Withdrawal')}</span>
                        </button>
                    </div>

                    <div className={styles.tableScroll}>
                        <table className={styles.customTable}>
                            <thead>
                                <tr>
                                    <th>{t('affiliate.thRequestId', 'Request ID')}</th>
                                    <th>{t('affiliate.thDate', 'Date')}</th>
                                    <th>{t('affiliate.thAssetNetwork', 'Asset & Network')}</th>
                                    <th>{t('affiliate.thAmount', 'Amount')}</th>
                                    <th>{t('affiliate.thDestAddress', 'Destination Address')}</th>
                                    <th>{t('affiliate.thStatus', 'Status')}</th>
                                    <th>{t('affiliate.thTxHash', 'Transaction Hash')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {withdrawalsList.length > 0 ? (
                                    withdrawalsList.map((item) => (
                                        <tr key={item.id}>
                                            <td className={styles.monoId}>{item.id}</td>
                                            <td>{new Date(item.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <span className={styles.assetBadge}>{item.asset}</span>
                                                <span className={styles.networkSub}>{item.network}</span>
                                            </td>
                                            <td className={styles.withdrawAmountVal}>
                                                ${Number(item.amount).toFixed(2)} {item.asset}
                                            </td>
                                            <td>
                                                <div className={styles.addressBox}>
                                                    <span>{item.wallet_address?.slice(0, 8)}...{item.wallet_address?.slice(-6)}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyText(item.wallet_address, 'Wallet address copied!')}
                                                        className={styles.miniCopyIconBtn}
                                                    >
                                                        <CopyIcon />
                                                    </button>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${
                                                    item.status === 'APPROVED' ? styles.statusApproved :
                                                    item.status === 'PENDING' ? styles.statusPending :
                                                    styles.statusRejected
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td>
                                                {item.tx_hash ? (
                                                    <a
                                                        href={`https://tronscan.org/#/transaction/${item.tx_hash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={styles.txLink}
                                                    >
                                                        <span>{item.tx_hash.slice(0, 10)}...</span>
                                                        <ExternalLinkIcon />
                                                    </a>
                                                ) : (
                                                    <span className={styles.pendingTxText}>{t('affiliate.processingSettlement', 'Processing settlement...')}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className={styles.emptyTableRow}>
                                            {t('affiliate.noWithdrawalRecords', 'No withdrawal history records found.')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 4: Marketing Kit */}
            {activeTab === 'marketing' && (
                <div className={styles.marketingKitGrid}>
                    <div className={styles.marketingPitchCard}>
                        <div className={styles.pitchHeader}>
                            <h4>{t('affiliate.twitterPitchTitle', 'High-Converting Twitter / X Post')}</h4>
                            <button
                                type="button"
                                className={styles.copyTemplateBtn}
                                onClick={() => handleCopyText(
                                    `Just started using @ChronosX AI for multi-timeframe pattern detection & algorithmic bot execution. Cleanest interface in modern prop and forex trading.\n\nSign up with my link for exclusive perks:\n${referralUrl}`,
                                    'Twitter template copied!'
                                )}
                            >
                                <CopyIcon />
                                <span>{t('affiliate.copyTemplate', 'Copy Template')}</span>
                            </button>
                        </div>
                        <p className={styles.pitchBody}>
                            &quot;Just started using @ChronosX AI for multi-timeframe pattern detection &amp; algorithmic bot execution. Cleanest interface in modern prop and forex trading.<br/><br/>
                            Sign up with my link for exclusive perks:<br/>
                            <span className={styles.linkHighlight}>{referralUrl}</span>&quot;
                        </p>
                    </div>

                    <div className={styles.marketingPitchCard}>
                        <div className={styles.pitchHeader}>
                            <h4>{t('affiliate.telegramPitchTitle', 'Telegram / Discord Group Broadcast')}</h4>
                            <button
                                type="button"
                                className={styles.copyTemplateBtn}
                                onClick={() => handleCopyText(
                                    `For all traders looking for an institutional-grade edge: ChronosX offers automated MT5 bridging, neural OCR chart vision, and 50+ pre-built algorithmic bots.\n\nClaim your account here:\n${referralUrl}`,
                                    'Telegram template copied!'
                                )}
                            >
                                <CopyIcon />
                                <span>{t('affiliate.copyTemplate', 'Copy Template')}</span>
                            </button>
                        </div>
                        <p className={styles.pitchBody}>
                            &quot;For all traders looking for an institutional-grade edge: ChronosX offers automated MT5 bridging, neural OCR chart vision, and 50+ pre-built algorithmic bots.<br/><br/>
                            Claim your account here:<br/>
                            <span className={styles.linkHighlight}>{referralUrl}</span>&quot;
                        </p>
                    </div>

                    <div className={styles.marketingPitchCard}>
                        <div className={styles.pitchHeader}>
                            <h4>{t('affiliate.keyFeaturesTitle', 'Key Features to Highlight')}</h4>
                        </div>
                        <ul className={styles.featureBulletList}>
                            <li><span className={styles.bulletIcon}><BoltIcon /></span> <strong>{t('affiliate.featureLatency', '< 15ms Latency:')}</strong> {t('affiliate.featureLatencyDesc', 'Direct institutional bridge to MetaTrader 5 & cTrader.')}</li>
                            <li><span className={styles.bulletIcon}><EyeIcon /></span> <strong>{t('affiliate.featureVision', 'Neural OCR Vision:')}</strong> {t('affiliate.featureVisionDesc', 'Multi-timeframe harmonic & breakout pattern detection.')}</li>
                            <li><span className={styles.bulletIcon}><BotIcon /></span> <strong>{t('affiliate.featureBots', '50+ Algorithmic Bots:')}</strong> {t('affiliate.featureBotsDesc', 'Quantitative playbooks with backtested win metrics.')}</li>
                            <li><span className={styles.bulletIcon}><ShieldLockIcon /></span> <strong>{t('affiliate.featureSecurity', 'Non-Custodial Security:')}</strong> {t('affiliate.featureSecurityDesc', '256-bit bank grade encryption.')}</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* 5. Crypto Withdrawal Request Modal */}
            <AnimatePresence>
                {showWithdrawModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowWithdrawModal(false)}>
                        <motion.div
                            className={styles.modalCard}
                            onClick={(e) => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className={styles.modalHeader}>
                                <div className={styles.modalTitleGroup}>
                                    <div className={styles.modalIconWrap}>
                                        <WalletCryptoIcon />
                                    </div>
                                    <div>
                                        <h3>{t('affiliate.modalWithdrawTitle', 'Request Crypto Withdrawal')}</h3>
                                        <p>{t('affiliate.modalWithdrawDesc', 'Fast on-chain settlement directly to your wallet')}</p>
                                    </div>
                                </div>
                                <button type="button" className={styles.modalCloseBtn} onClick={() => setShowWithdrawModal(false)}>
                                    <CloseIcon />
                                </button>
                            </div>

                            <form onSubmit={handleWithdrawSubmit} className={styles.modalForm}>
                                {/* Balance Notice */}
                                <div className={styles.modalBalanceBox}>
                                    <span className={styles.balanceLabel}>{t('affiliate.withdrawableBalance', 'Withdrawable Balance')}</span>
                                    <span className={styles.balanceAmount}>${stats.withdrawable_balance.toFixed(2)} USDT</span>
                                </div>

                                {/* Asset Selection */}
                                <div className={styles.formGroup}>
                                    <label>{t('affiliate.selectCryptoAsset', 'Select Crypto Asset')}</label>
                                    <div className={styles.assetSelector}>
                                        {['USDT', 'USDC'].map((asset) => (
                                            <button
                                                type="button"
                                                key={asset}
                                                className={`${styles.assetOption} ${withdrawForm.asset === asset ? styles.assetActive : ''}`}
                                                onClick={() => setWithdrawForm(f => ({ ...f, asset }))}
                                            >
                                                <span className={styles.coinCircle}>{asset}</span>
                                                <span>{asset} ({asset === 'USDT' ? 'Tether' : 'USD Coin'})</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Network Selection */}
                                <div className={styles.formGroup}>
                                    <label>{t('affiliate.selectNetwork', 'Select Network')}</label>
                                    <div className={styles.networkGrid}>
                                        {[
                                            { id: 'TRC20', name: 'Tron (TRC20)', speed: '~2 mins' },
                                            { id: 'BEP20', name: 'BNB Smart Chain (BEP20)', speed: '~1 min' },
                                            { id: 'SOLANA', name: 'Solana (SPL)', speed: '< 30s' },
                                            { id: 'ERC20', name: 'Ethereum (ERC20)', speed: '~5 mins' },
                                        ].map((net) => (
                                            <button
                                                type="button"
                                                key={net.id}
                                                className={`${styles.netBtn} ${withdrawForm.network === net.id ? styles.netActive : ''}`}
                                                onClick={() => setWithdrawForm(f => ({ ...f, network: net.id }))}
                                            >
                                                <span className={styles.netName}>{net.name}</span>
                                                <span className={styles.netSpeed}>{net.speed}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Destination Address */}
                                <div className={styles.formGroup}>
                                    <label>{t('affiliate.destWalletAddress', 'Destination Wallet Address')}</label>
                                    <div className={styles.inputWithAction}>
                                        <input
                                            type="text"
                                            placeholder={t('affiliate.pastePlaceholder', 'Paste your {network} {asset} address').replace('{network}', withdrawForm.network).replace('{asset}', withdrawForm.asset)}
                                            value={withdrawForm.wallet_address}
                                            onChange={(e) => setWithdrawForm(f => ({ ...f, wallet_address: e.target.value.trim() }))}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className={styles.inlinePasteBtn}
                                            onClick={async () => {
                                                if (navigator?.clipboard) {
                                                    const clip = await navigator.clipboard.readText();
                                                    if (clip) setWithdrawForm(f => ({ ...f, wallet_address: clip.trim() }));
                                                }
                                            }}
                                        >
                                            {t('affiliate.pasteBtn', 'Paste')}
                                        </button>
                                    </div>
                                </div>

                                {/* Amount Input */}
                                <div className={styles.formGroup}>
                                    <div className={styles.amountLabelRow}>
                                        <label>{t('affiliate.withdrawalAmount', 'Withdrawal Amount (${asset})').replace('{asset}', withdrawForm.asset)}</label>
                                        <span className={styles.minLimitText}>{t('affiliate.minLimit', 'Min: ${min}.00').replace('{min}', stats.current_tier?.min_withdrawal || 50)}</span>
                                    </div>
                                    <div className={styles.inputWithAction}>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min={stats.current_tier?.min_withdrawal || 50}
                                            max={stats.withdrawable_balance}
                                            placeholder="0.00"
                                            value={withdrawForm.amount}
                                            onChange={(e) => setWithdrawForm(f => ({ ...f, amount: e.target.value }))}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className={styles.inlineMaxBtn}
                                            onClick={() => setWithdrawForm(f => ({ ...f, amount: String(stats.withdrawable_balance) }))}
                                        >
                                            {t('affiliate.maxBtn', 'MAX')}
                                        </button>
                                    </div>
                                </div>

                                {/* Summary Breakdown */}
                                <div className={styles.feeBreakdown}>
                                    <div className={styles.feeRow}>
                                        <span>{t('affiliate.networkFee', 'Network Transaction Fee:')}</span>
                                        <span className={styles.feeFree}>{t('affiliate.zeroFee', '$0.00 (Zero Fee)')}</span>
                                    </div>
                                    <div className={styles.feeRow}>
                                        <span>{t('affiliate.estimatedSettlement', 'Estimated Settlement:')}</span>
                                        <span>{t('affiliate.within24h', 'Within 24 Hours')}</span>
                                    </div>
                                    <div className={`${styles.feeRow} ${styles.totalRow}`}>
                                        <span>{t('affiliate.netAmountReceive', 'Net Amount to Receive:')}</span>
                                        <strong>${Number(withdrawForm.amount || 0).toFixed(2)} {withdrawForm.asset}</strong>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className={styles.modalSubmitBtn}
                                    disabled={withdrawing || stats.withdrawable_balance <= 0}
                                >
                                    {withdrawing ? t('affiliate.submittingRequest', 'Submitting Request...') : t('affiliate.confirmWithdrawal', 'Confirm Crypto Withdrawal')}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 6. QR Code Modal */}
            <AnimatePresence>
                {showQrModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowQrModal(false)}>
                        <motion.div
                            className={styles.qrModalCard}
                            onClick={(e) => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <div className={styles.modalHeader}>
                                <h3>{t('affiliate.scanQrTitle', 'Scan to Join via Referral')}</h3>
                                <button type="button" className={styles.modalCloseBtn} onClick={() => setShowQrModal(false)}>
                                    <CloseIcon />
                                </button>
                            </div>

                            <div className={styles.qrBox}>
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(referralUrl)}&color=18C98B&bgcolor=040D09`}
                                    alt="Referral QR Code"
                                    className={styles.qrImage}
                                />
                                <span className={styles.qrCodeText}>{t('affiliate.codePrefix', 'Code:')} {referralCode}</span>
                            </div>

                            <button
                                type="button"
                                className={styles.modalSubmitBtn}
                                onClick={handleCopyLink}
                            >
                                {t('affiliate.copyLink', 'Copy Link')} ({referralCode})
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
