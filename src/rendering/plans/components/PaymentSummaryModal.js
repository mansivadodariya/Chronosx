'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../styles/paymentSummaryModal.module.scss';
import { subscriptionApi } from '@/lib/subscriptionApi';
import { useLanguage } from '@/context/LanguageContext';
import toast from 'react-hot-toast';

export default function PaymentSummaryModal({
    isOpen,
    onClose,
    plan,
    currentSubscription,
    actionType = 'SUBSCRIBE',
    onProceed
}) {
    const { t } = useLanguage();
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [summary, setSummary] = useState(null);
    const [gateway, setGateway] = useState('CRYPTO');
    const [submitting, setSubmitting] = useState(false);

    // Recalculate summary whenever plan or appliedCoupon changes
    useEffect(() => {
        if (!plan) return;
        let isMounted = true;
        async function updateSummary() {
            const calculated = await subscriptionApi.calculateSummary({ plan, coupon: appliedCoupon });
            if (isMounted) setSummary(calculated);
        }
        updateSummary();
        return () => { isMounted = false; };
    }, [plan, appliedCoupon]);

    if (!isOpen || !plan) return null;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        try {
            const result = await subscriptionApi.validateCoupon(couponCode, plan.id);
            setAppliedCoupon(result);
            toast.success(result?.message || t('plans.couponApplied', 'Coupon applied successfully!'));
        } catch (err) {
            toast.error(err.message || t('plans.invalidCoupon', 'Invalid coupon code.'));
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
    };

    const handleCheckout = async () => {
        setSubmitting(true);
        try {
            await onProceed({ plan, couponCode: appliedCoupon?.code, gateway });
        } catch (err) {
            toast.error(err.message || 'Payment initiation failed.');
        } finally {
            setSubmitting(false);
        }
    };

    const modalTitle = actionType === 'RENEW'
        ? t('plans.renewSubscription', 'Renew & Extend Subscription')
        : actionType === 'UPGRADE'
        ? t('plans.upgradeTierTitle', 'Upgrade AI Processing Tier')
        : actionType === 'DOWNGRADE'
        ? t('plans.downgradePlanTitle', 'Select Plan Tier')
        : t('plans.checkoutSummary', 'Payment Order Summary');

    return (
        <AnimatePresence>
            <div className={styles.modalBackdrop} onClick={onClose}>
                <motion.div
                    className={styles.modalCard}
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.25 }}
                >
                    {/* Header */}
                    <div className={styles.modalHeader}>
                        <div className={styles.modalTitleGroup}>
                            <div className={styles.iconBadge}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                            </div>
                            <h3>{modalTitle}</h3>
                        </div>

                        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    {/* Body */}
                    <div className={styles.modalBody}>
                        {/* 1. Plan Overview */}
                        <div className={styles.planOverviewCard}>
                            <div className={styles.planDetails}>
                                <h4>{plan.name} Tier</h4>
                                <p>{plan.validity} Duration • {plan.credits?.toLocaleString() || 'Unlimited'} AI Credits</p>
                            </div>
                            <div className={styles.planPriceCol}>
                                <div className={styles.priceMain}>${plan.price}</div>
                                <div className={styles.validitySub}>Billed Once</div>
                            </div>
                        </div>

                        {/* 2. Coupon Section */}
                        <div className={styles.couponSection}>
                            <label className={styles.couponLabel}>
                                {t('plans.promoCode', 'Promo / Coupon Code')}
                            </label>
                            <div className={styles.couponInputRow}>
                                <input
                                    type="text"
                                    placeholder="ENTER CODE"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    disabled={Boolean(appliedCoupon)}
                                />
                                {appliedCoupon ? (
                                    <button type="button" onClick={handleRemoveCoupon}>
                                        {t('common.remove', 'Remove')}
                                    </button>
                                ) : (
                                    <button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}>
                                        {couponLoading ? '...' : t('common.apply', 'Apply')}
                                    </button>
                                )}
                            </div>

                            {appliedCoupon && (
                                <div className={styles.couponSuccessMsg}>
                                    <span>✓ {appliedCoupon.message || 'Coupon Applied (-20%)'}</span>
                                    <button type="button" className={styles.removeCouponBtn} onClick={handleRemoveCoupon}>
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 3. Itemized Financial Summary */}
                        {summary && (
                            <div className={styles.summaryTable}>
                                <div className={styles.summaryRow}>
                                    <span>{t('plans.basePrice', 'Base Plan Price')}</span>
                                    <span>${summary.base_price.toFixed(2)}</span>
                                </div>

                                {summary.discount_amount > 0 && (
                                    <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                                        <span>{t('plans.discountApplied', 'Promotional Discount')}</span>
                                        <span>-${summary.discount_amount.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className={styles.summaryRow}>
                                    <span>
                                        {t('plans.taxVat', 'Tax / Fee')}
                                        {summary.tax_rate > 0 ? ` (${(summary.tax_rate * 100).toFixed(0)}%)` : ''}
                                    </span>
                                    <span>${summary.tax_amount.toFixed(2)}</span>
                                </div>

                                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                                    <span>{t('plans.netPayable', 'Net Final Payable')}</span>
                                    <span className={styles.totalAmount}>
                                        ${summary.final_amount.toFixed(2)} {summary.currency || 'USD'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* 4. Payment Gateway Selector */}
                        <div className={styles.gatewaySelector}>
                            <span className={styles.gatewayLabel}>{t('plans.selectGateway', 'Select Payment Route')}</span>
                            <div className={styles.gatewayOptions}>
                                <div
                                    className={`${styles.gatewayCard} ${gateway === 'CRYPTO' ? styles.activeGateway : ''}`}
                                    onClick={() => setGateway('CRYPTO')}
                                >
                                    <div className={styles.gatewayIcon}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M9.5 9.5h5a2 2 0 0 1 0 4h-5" />
                                            <line x1="9.5" y1="9.5" x2="9.5" y2="14.5" />
                                        </svg>
                                    </div>
                                    <div className={styles.gatewayInfo}>
                                        <span className={styles.name}>Instant Crypto</span>
                                        <span className={styles.sub}>USDT / SOL / BTC</span>
                                    </div>
                                </div>

                                <div
                                    className={`${styles.gatewayCard} ${gateway === 'CARD' ? styles.activeGateway : ''}`}
                                    onClick={() => setGateway('CARD')}
                                >
                                    <div className={styles.gatewayIcon}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="2" y="5" width="20" height="14" rx="2" />
                                            <line x1="2" y1="10" x2="22" y2="10" />
                                        </svg>
                                    </div>
                                    <div className={styles.gatewayInfo}>
                                        <span className={styles.name}>Credit / Debit</span>
                                        <span className={styles.sub}>Visa / Mastercard</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 5. Zero-Deactivation Safeguard Notice */}
                        <div className={styles.safeguardBanner}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <span>
                                {t(
                                    'plans.safeguardExplanation',
                                    'Safe Checkout: Your existing plan remains 100% active and will not be altered until payment is verified by the gateway.'
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={submitting}>
                            {t('common.cancel', 'Cancel')}
                        </button>

                        <button type="button" className={styles.checkoutBtn} onClick={handleCheckout} disabled={submitting}>
                            {submitting ? t('common.processing', 'Redirecting...') : (
                                <>
                                    <span>{t('plans.proceedToGateway', 'Proceed to Secure Checkout')}</span>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
