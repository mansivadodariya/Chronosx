'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/paymentHistoryTab.module.scss';
import { subscriptionApi } from '@/lib/subscriptionApi';
import { generateInvoicePdf, formatTransactionId } from '../utils/invoicePdfGenerator';
import toast from 'react-hot-toast';

export default function ProfilePaymentHistoryTab({ t }) {
    const router = useRouter();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState(null);

    useEffect(() => {
        let isMounted = true;
        async function loadHistory() {
            try {
                const data = await subscriptionApi.getPaymentHistory();
                if (isMounted && Array.isArray(data)) {
                    setHistory(data);
                }
            } catch (err) {
                console.warn('Failed to load payment history:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        loadHistory();
        return () => { isMounted = false; };
    }, []);

    const handleDownloadReceipt = async (item, idx) => {
        const isPending = String(item.status || '').toUpperCase() === 'PENDING';
        if (isPending) {
            toast.error(t?.('profile.invoicePendingNotice', 'Invoice is available after payment is confirmed.') || 'Invoice is available after payment is confirmed.');
            return;
        }

        setDownloadingId(item.id);
        const toastId = toast.loading(t?.('profile.downloadingPdf', 'Downloading official invoice...') || 'Downloading official invoice...');
        try {
            let downloaded = false;

            // 1. Primary: Call backend invoice download API
            const invoiceNum = item.invoice_number || item.id;
            if (invoiceNum) {
                try {
                    const res = await subscriptionApi.downloadInvoice(invoiceNum);
                    if (res?.downloaded) {
                        downloaded = true;
                    }
                } catch (apiErr) {
                    console.warn('[ProfilePaymentHistoryTab] Backend download API error:', apiErr);
                }
            }

            // 2. Secondary: If direct pdf_url exists on item
            if (!downloaded && item.pdf_url) {
                try {
                    const fileFetch = await fetch(item.pdf_url);
                    if (fileFetch.ok) {
                        const blob = await fileFetch.blob();
                        const blobUrl = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = blobUrl;
                        a.download = `Invoice-${invoiceNum || item.id}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
                        downloaded = true;
                    }
                } catch (urlErr) {
                    console.warn('[ProfilePaymentHistoryTab] Failed to fetch pdf_url:', urlErr);
                }
            }

            // 3. Guaranteed fallback: Generate executive PDF invoice immediately
            if (!downloaded) {
                await generateInvoicePdf(item, idx + 1);
                downloaded = true;
            }

            toast.dismiss(toastId);
            toast.success(t?.('profile.receiptDownloaded', 'PDF Invoice downloaded successfully!') || 'PDF Invoice downloaded!');
        } catch (err) {
            toast.dismiss(toastId);
            toast.error(err?.message || 'Failed to download PDF receipt.');
        } finally {
            setDownloadingId(null);
        }
    };

    const isPaidRecord = (item) => {
        if (item?.is_paid === true) return true;
        const s = String(item?.status || item?.payment_status || item?.original_status || '').toUpperCase();
        return s === 'SUCCESS' || s === 'COMPLETED' || s === 'PAID';
    };

    const totalSpent = history
        .filter(isPaidRecord)
        .reduce((sum, item) => sum + (Number(item?.amount_paid || item?.paid_amount || item?.amount || item?.total) || 0), 0);

    const activeCount = history.filter(isPaidRecord).length;

    const settlementCurrency = React.useMemo(() => {
        const currencies = new Set();
        history.forEach(item => {
            if (item?.currency) currencies.add(String(item.currency).toUpperCase());
        });
        if (currencies.size === 0) return 'USD / USDT';
        if (currencies.size === 1) return `${Array.from(currencies)[0]}`;
        return Array.from(currencies).join(' / ');
    }, [history]);

    return (
        <div className={styles.paymentHistoryPanel}>
            <div className={styles.panelHeaderRow}>
                <div>
                    <h3>{t?.('profile.paymentHistoryTitle', 'Payment History & Invoices') || 'Payment History & Invoices'}</h3>
                    <p className={styles.panelSubtitle}>
                        {t?.('profile.paymentHistorySubtitle', 'Audit all previous subscription transactions, renewals, and download formal receipts.') || 'Audit all previous subscription transactions, renewals, and download formal receipts.'}
                    </p>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>{t?.('profile.totalInvested', 'Total Invested') || 'Total Invested'}</div>
                    <p className={styles.statValue}>${totalSpent.toFixed(2)}</p>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statLabel}>{t?.('profile.invoicesCount', 'Paid Invoices') || 'Paid Invoices'}</div>
                    <p className={styles.statValue}>
                        {activeCount} {history.length > 0 && <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>/ {history.length}</span>}
                    </p>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statLabel}>{t?.('profile.billingCurrency', 'Settlement') || 'Settlement'}</div>
                    <p className={styles.statValue}>{settlementCurrency}</p>
                </div>
            </div>

            {/* Ledger Table */}
            {loading ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                    {t?.('common.loading', 'Loading ledger...') || 'Loading ledger...'}
                </div>
            ) : history.length > 0 ? (
                <div className={styles.tableWrapper}>
                    <table className={styles.historyTable}>
                        <thead>
                            <tr>
                                <th>{t?.('profile.invoiceNumber', 'Transaction / Invoice #') || 'Transaction / Invoice #'}</th>
                                <th>{t?.('profile.date', 'Date') || 'Date'}</th>
                                <th>{t?.('profile.planTier', 'Tier') || 'Tier'}</th>
                                <th>{t?.('profile.gateway', 'Method') || 'Method'}</th>
                                <th>{t?.('profile.amount', 'Amount') || 'Amount'}</th>
                                <th>{t?.('profile.status', 'Status') || 'Status'}</th>
                                <th style={{ textAlign: 'right' }}>{t?.('profile.action', 'Receipt') || 'Receipt'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((item, idx) => {
                                const d = new Date(item.created_at);
                                const dateStr = !isNaN(d.getTime())
                                    ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                    : '—';

                                const txnFormatted = item.invoice_number || formatTransactionId(item.id, idx + 1);
                                const statusStr = String(item.status || item.payment_status || item.original_status || 'PENDING').toUpperCase();
                                const isSuccess = statusStr === 'SUCCESS' || statusStr === 'COMPLETED' || statusStr === 'PAID' || item.is_paid;
                                const isPending = statusStr === 'PENDING' || statusStr === 'WAITING_PAYMENT' || statusStr === 'CREATED';
                                const isExpired = statusStr === 'EXPIRED';

                                const planName = item.plan_name || item.tier_name || item.tier || item.subscription_plans?.name || item.plan || 'Starter';
                                const method = item.method || item.gateway || (item.currency ? `Crypto ${item.currency} (${item.chain || 'TRON'})` : 'Crypto USDT');
                                const amountNum = Number(item.amount ?? item.total ?? 0).toFixed(2);

                                return (
                                    <tr key={item.id || idx}>
                                        <td className={styles.invoiceCol}>{txnFormatted}</td>
                                        <td>{dateStr}</td>
                                        <td>
                                            <span className={styles.planTierBadge}>
                                                {planName}
                                            </span>
                                        </td>
                                        <td>{method}</td>
                                        <td className={styles.amountText}>${amountNum}</td>
                                        <td>
                                            <span
                                                className={`
                                                    ${styles.statusPill}
                                                    ${isSuccess ? styles.statusSuccess : isPending ? styles.statusPending : styles.statusFailed}
                                                `}
                                            >
                                                {statusStr}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                type="button"
                                                className={`${styles.downloadBtn} ${isPending ? styles.btnDisabled : ''}`}
                                                onClick={() => handleDownloadReceipt({ ...item, invoice_number: txnFormatted, plan_name: planName, gateway: method, amount: amountNum, status: statusStr }, idx)}
                                                disabled={isPending || downloadingId === item.id}
                                                title={
                                                    isPending
                                                        ? (t?.('profile.invoicePendingTooltip', 'Invoice available once payment is confirmed') || 'Invoice available once payment is confirmed')
                                                        : (t?.('profile.downloadInvoiceTooltip', 'Download Official PDF Invoice') || 'Download Official PDF Invoice')
                                                }
                                            >
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                    <polyline points="7 10 12 15 17 10" />
                                                    <line x1="12" y1="15" x2="12" y2="3" />
                                                </svg>
                                                <span>{downloadingId === item.id ? 'Exporting...' : (t?.('profile.invoice', 'Invoice') || 'Invoice')}</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="2" y="5" width="20" height="14" rx="2" />
                            <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                    </div>
                    <h4>{t?.('profile.noPaymentsYet', 'No Payment Records Found') || 'No Payment Records Found'}</h4>
                    <p>
                        {t?.('profile.noPaymentsDesc', 'You have not made any plan purchases yet. Explore our high-speed AI subscription tiers to unlock institutional analytics.') || 'You have not made any plan purchases yet. Explore our high-speed AI subscription tiers to unlock institutional analytics.'}
                    </p>
                    <button
                        type="button"
                        className={styles.exploreBtn}
                        onClick={() => router.push('/subscription-plans')}
                    >
                        <span>{t?.('profile.viewPlansBtn', 'Explore Subscription Plans') || 'Explore Subscription Plans'}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}
