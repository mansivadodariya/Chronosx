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
import {
    UsersGroupIcon,
    WalletCryptoIcon,
    CopyIcon,
    CheckIcon,
    StarIcon,
    BoltIcon,
    EyeIcon,
    BotIcon,
    ShieldLockIcon,
    QrCodeIcon,
    SparkleIcon,
    ExternalLinkIcon,
    CloseIcon
} from './components/AffiliateIcons';
import { WithdrawModal, QrModal } from './components/WithdrawModal';
import { MarketingKitTab } from './components/MarketingKitTab';
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
                <MarketingKitTab styles={styles} t={t} handleCopyText={handleCopyText} />
            )}

            {/* 5. Crypto Withdrawal Request Modal */}
            <WithdrawModal
                showWithdrawModal={showWithdrawModal}
                setShowWithdrawModal={setShowWithdrawModal}
                styles={styles}
                t={t}
                handleWithdrawSubmit={handleWithdrawSubmit}
                stats={stats}
                withdrawForm={withdrawForm}
                setWithdrawForm={setWithdrawForm}
                withdrawing={withdrawing}
            />

            {/* 6. QR Code Modal */}
            <QrModal
                showQrModal={showQrModal}
                setShowQrModal={setShowQrModal}
                styles={styles}
                t={t}
                referralUrl={referralUrl}
                referralCode={referralCode}
                handleCopyLink={handleCopyLink}
            />
        </div>
    );
}
