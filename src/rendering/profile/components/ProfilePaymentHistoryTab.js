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
        setDownloadingId(item.id);
        const toastId = toast.loading(t?.('profile.downloadingPdf', 'Downloading official invoice...') || 'Downloading official invoice...');
        try {
            const invoiceNum = item.invoice_number || item.id;
            if (invoiceNum) {
                try {
                    await subscriptionApi.downloadInvoice(invoiceNum);
                    toast.dismiss(toastId);
                    toast.success(t?.('profile.receiptDownloaded', 'PDF Invoice downloaded successfully!') || 'PDF Invoice downloaded!');
                    return;
                } catch (apiErr) {
                    console.warn('[ProfilePaymentHistoryTab] Backend download failed, attempting fallback generator:', apiErr);
                }
            }

            if (item.pdf_url) {
                window.open(item.pdf_url, '_blank');
                toast.dismiss(toastId);
                return;
            }

            await generateInvoicePdf(item, idx + 1);
            toast.dismiss(toastId);
            toast.success(t?.('profile.receiptDownloaded', 'PDF Invoice downloaded successfully!') || 'PDF Invoice downloaded!');
        } catch (err) {
            toast.dismiss(toastId);
            toast.error(err?.message || 'Failed to download PDF receipt.');
        } finally {
            setDownloadingId(null);
        }
    };

    const totalSpent = history
        .filter(item => item.status === 'SUCCESS')
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const activeCount = history.filter(item => item.status === 'SUCCESS').length;

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
                    <p className={styles.statValue}>{activeCount}</p>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statLabel}>{t?.('profile.billingCurrency', 'Settlement') || 'Settlement'}</div>
                    <p className={styles.statValue}>USD / USDT</p>
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

                                const txnFormatted = formatTransactionId(item.invoice_number || item.id, idx + 1);
                                const isSuccess = item.status === 'SUCCESS';
                                const isPending = item.status === 'PENDING';

                                return (
                                    <tr key={item.id}>
                                        <td className={styles.invoiceCol}>{txnFormatted}</td>
                                        <td>{dateStr}</td>
                                        <td>
                                            <span className={styles.planTierBadge}>
                                                {item.plan_name}
                                            </span>
                                        </td>
                                        <td>{item.gateway || 'Crypto USDT'}</td>
                                        <td className={styles.amountText}>${Number(item.amount).toFixed(2)}</td>
                                        <td>
                                            <span
                                                className={`
                                                    ${styles.statusPill}
                                                    ${isSuccess ? styles.statusSuccess : isPending ? styles.statusPending : styles.statusFailed}
                                                `}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                type="button"
                                                className={styles.downloadBtn}
                                                onClick={() => handleDownloadReceipt(item, idx)}
                                                disabled={downloadingId === item.id}
                                                title="Download Official PDF Invoice"
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
