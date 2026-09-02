'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './plans.module.scss';
import { fetchSubscriptionPlans, defaultSubscriptionPlans } from '@/lib/plansData';
import { depositApi } from '@/lib/api';
import { getStoredUser, getStoredUserId } from '@/lib/authSession';
import { refreshCreditsFromServer } from '@/lib/credits';
import { useLanguage } from '@/context/LanguageContext';
import { getBidiProps } from '@/lib/bidi';
import toast from 'react-hot-toast';
import CommonCta from '@/components/commonCta';

import { HexGiftBoxIcon, Gold3DGiftBox } from '@/icons/giftBoxIcon';

const GoldenCheckCircleIcon = () => (
    <div className={styles.goldenCheckCircle}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    </div>
);

const CheckIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const ZapIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

const ShieldCheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
    </svg>
);

const LockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const CpuIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" />
        <line x1="15" y1="20" x2="15" y2="23" />
        <line x1="20" y1="9" x2="23" y2="9" />
        <line x1="20" y1="14" x2="23" y2="14" />
        <line x1="1" y1="9" x2="4" y2="9" />
        <line x1="1" y1="14" x2="4" y2="14" />
    </svg>
);

const ArrowUpRightIcon = () => (
    <svg className={styles.btnArrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: 'auto' }}>
        <line x1="7" y1="17" x2="17" y2="7" />
        <polyline points="7 7 17 7 17 17" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const faqs = [
    {
        q: "How do ChronosX AI Credits work?",
        a: "Credits power high-compute neural model inferences on the ChronosX platform. For example, an automated Chart Pattern Vision Scan consumes 10 credits, a deep Conversational Market Query consumes 15 credits, and an in-depth AI Past Trade Audit consumes 50 credits. Credits refresh automatically with your active subscription."
    },
    {
        q: "Can I upgrade or renew my plan at any time?",
        a: "Yes. You can upgrade to a higher tier anytime. Unused credits from your previous cycle roll over into your new tier allocation, and your priority execution bandwidth is immediately upgraded."
    },
    {
        q: "Which financial markets and instruments can I analyze?",
        a: "ChronosX supports multi-asset analysis across major & minor Forex pairs (EUR/USD, GBP/USD, USD/JPY), Global Indices (US30, NAS100, SPX500), and Commodities (Gold/XAUUSD, Crude Oil)."
    },
    {
        q: "What payment methods are supported for checkout?",
        a: "We support instant decentralized deposits (USDT, USDC, SOL, BTC) as well as international card gateways. All transactions are securely processed with 256-bit institutional encryption and immediate autonomous activation."
    }
];

export default function SubscriptionPlansView() {
    const router = useRouter();
    const pathname = usePathname();
    const isOutside = pathname === '/plans' || pathname?.includes('/(static)/') || !pathname?.includes('subscription-plans');
    const { t, language } = useLanguage();
    const [plans, setPlans] = useState(defaultSubscriptionPlans);
    const [loading, setLoading] = useState(true);
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [submittingPlanId, setSubmittingPlanId] = useState(null);
    const [openFaq, setOpenFaq] = useState(null);

    useEffect(() => {
        let isMounted = true;
        async function loadPlans() {
            try {
                const data = await fetchSubscriptionPlans();
                if (isMounted && data && data.length > 0) {
                    setPlans(data);
                }
            } catch (_) {
                if (isMounted) setPlans(defaultSubscriptionPlans);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        loadPlans();
        return () => { isMounted = false; };
    }, []);

    // Handle return payment status if user was redirected back from payment gateway
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const isPayment = params.get('isPayment');
        if (isPayment === 'true') {
            toast.success(t('plans.paymentSuccess', 'Payment completed successfully! Credits have been allocated.'));
            refreshCreditsFromServer();
            const cleanUrl = new URL(window.location.href);
            cleanUrl.searchParams.delete('isPayment');
            cleanUrl.searchParams.delete('planId');
            window.history.replaceState({}, '', cleanUrl.toString());
        } else if (isPayment === 'false') {
            toast.error(t('plans.paymentCancelled', 'Payment was cancelled.'));
            const cleanUrl = new URL(window.location.href);
            cleanUrl.searchParams.delete('isPayment');
            cleanUrl.searchParams.delete('planId');
            window.history.replaceState({}, '', cleanUrl.toString());
        }
    }, [t]);

    const handleUpgradePlan = async (plan) => {
        if (typeof window === 'undefined') return;

        const token = localStorage.getItem('access_token');
        const user = getStoredUser();
        const userId = getStoredUserId();

        if (!token || (!user && !userId)) {
            let redirectPath = '/plans';
            if (window.location.pathname === '/' || window.location.pathname === '') {
                redirectPath = '/#pricing';
            } else if (window.location.pathname === '/plans') {
                redirectPath = '/plans';
            } else {
                const hash = window.location.hash || (document.getElementById('pricing') ? '#pricing' : '');
                redirectPath = `${window.location.pathname}${window.location.search || ''}${hash}`;
            }
            router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
            return;
        }

        if (plan.price === 0 || plan.id === 'basic') {
            toast.success(t('plans.freePlanActive', 'You already have full access to Starter AI!'));
            router.push('/dashboard');
            return;
        }

        setSelectedPlanId(plan.id);
        setSubmittingPlanId(plan.id);
        try {
            const successUrl = new URL(window.location.href);
            successUrl.searchParams.set('isPayment', 'true');
            successUrl.searchParams.set('planId', plan.id);

            const cancelUrl = new URL(window.location.href);
            cancelUrl.searchParams.set('isPayment', 'false');
            cancelUrl.searchParams.set('planId', plan.id);

            const payload = {
                plan_id: plan.id,
                planId: plan.id,
                id: plan.id,
                amount: plan.price,
                price: plan.price,
                actualAmount: plan.originalPrice || plan.price,
                currency: plan.currency || '$',
                user_id: user?.id || user?.user_id || userId,
                email: user?.email,
                success_url: successUrl.toString(),
                cancel_url: cancelUrl.toString(),
                isPayment: true,
            };

            const res = await depositApi.createDeposit(payload);

            const checkoutUrl =
                res?.payload?.data?.checkout_url ||
                res?.payload?.checkout_url ||
                res?.data?.checkout_url ||
                res?.data?.payment_url ||
                res?.data?.url ||
                res?.data?.redirect_url ||
                res?.checkout_url ||
                res?.payment_url ||
                res?.url ||
                res?.redirect_url;

            if (res?.payload?.code && res?.payload?.code !== '00000') {
                toast.error(
                    res?.payload?.message ||
                    res?.message ||
                    'A payment session is already active and will expire in 10 minutes. Please complete the current payment or try again.'
                );
            } else if (checkoutUrl) {
                toast.success(t('plans.redirecting', 'Redirecting to secure payment...'));
                window.location.assign(checkoutUrl);
                return;
            } else {
                toast.success(res?.message || t('plans.upgradeSuccess', 'Deposit request created successfully!'));
            }
        } catch (err) {
            toast.error(err?.message || t('common.somethingWentWrong', 'Failed to create deposit request.'));
        } finally {
            setSubmittingPlanId(null);
        }
    };

    const toggleFaq = (idx) => {
        setOpenFaq(prev => (prev === idx ? null : idx));
    };

    return (
        <div className={`${styles.plansPage} ${isOutside ? styles.outsidePage : ''} ${styles[`lang_${language}`] || ''}`}>
            {/* Ambient Background Aura Lights */}
            <div className={styles.ambientGoldTop} aria-hidden="true" />
            <div className={styles.ambientGlowCenter} aria-hidden="true" />
            <div className={styles.gridOverlay} aria-hidden="true" />

            <div className="container">
                {/* 1. Header Section */}
                <motion.div 
                    className={styles.headerSection}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className={styles.eyebrowBadge}>
                        <span className={styles.pulseDot} />
                        <span>CHRONOSX PRICING TIERS</span>
                    </div>

                    <h1 {...getBidiProps(t('plans.mainTitle', 'Institutional AI Trading Intelligence'), styles.title)}>
                        Institutional AI Power, <span className={styles.goldGradient}>Tailored For Your Edge</span>
                    </h1>

                    <p className={styles.subtitle}>
                        {t('plans.subtitle', 'Unlock sub-second AI pattern recognition, live multi-timeframe scans, and automated quant strategy backtesting.')}
                    </p>
                </motion.div>

                {/* 2. Pricing Plans Grid */}
                {loading ? (
                    <div className={styles.loadingGrid}>
                        <div className={styles.skeletonCard} />
                        <div className={styles.skeletonCard} />
                        <div className={styles.skeletonCard} />
                    </div>
                ) : (
                    <motion.div 
                        className={styles.plansGrid}
                        initial={{ opacity: 0, y: 35 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {plans.map((plan) => {
                            const isArabic = language === 'ar';
                            const isFilipino = language === 'ph';
                            const defaultPlan = defaultSubscriptionPlans.find(d => d.id === plan.id) || {};

                            const isBestValue = Boolean(
                                plan.is_best_value ||
                                plan.best_value ||
                                plan.is_featured ||
                                plan.is_popular ||
                                plan.id === 'standard'
                            );

                            let badgeText = isFilipino
                                ? (plan.badge_ph || plan.badge)
                                : isArabic
                                ? (plan.badge_ar || plan.badge)
                                : plan.badge;

                            if (!badgeText && isBestValue) {
                                badgeText = isFilipino ? 'PINAKAMAHUSAY NA HALAGA' : isArabic ? 'الأكثر شعبية' : 'MOST POPULAR';
                            }

                            if (!badgeText && defaultPlan.badge) {
                                badgeText = isFilipino
                                    ? (defaultPlan.badge_ph || defaultPlan.badge)
                                    : isArabic
                                    ? (defaultPlan.badge_ar || defaultPlan.badge)
                                    : defaultPlan.badge;
                            }

                            const isFeatured = isBestValue || plan.id === 'standard';
                            const isPremium = plan.id === 'premium';
                            const isBasic = plan.id === 'basic' || Number(plan.price) === 0 || (plan.name || '').toLowerCase().includes('free');
                            const isSelected = selectedPlanId === plan.id;

                            const name = isFilipino
                                ? (plan.name_ph || defaultPlan.name_ph || plan.name)
                                : isArabic
                                ? (plan.name_ar || defaultPlan.name_ar || plan.name)
                                : (plan.name || defaultPlan.name);

                            const description = isFilipino
                                ? (plan.description_ph || defaultPlan.description_ph || plan.description)
                                : isArabic
                                ? (plan.description_ar || defaultPlan.description_ar || plan.description)
                                : (plan.description || defaultPlan.description);

                            const validity = isFilipino
                                ? (plan.validity_ph || defaultPlan.validity_ph || plan.validity)
                                : isArabic
                                ? (plan.validity_ar || defaultPlan.validity_ar || plan.validity)
                                : (plan.validity || defaultPlan.validity);

                            const ctaText = isBasic
                                ? t('plans.getStartedFree', 'Get Started Free')
                                : t('plans.upgradePlan', isFilipino ? 'Mag-upgrade ng Plano' : isArabic ? 'ترقية الخطة' : 'Upgrade Plan');

                            const featuresList = (isFilipino && plan.features_ph?.length)
                                ? plan.features_ph
                                : (isArabic && plan.features_ar?.length)
                                ? plan.features_ar
                                : (plan.features?.length ? plan.features : defaultPlan.features || []);

                            return (
                                <div
                                    key={plan.id}
                                    className={`${styles.planCard} ${isFeatured ? styles.featuredCard : isPremium ? styles.premiumCard : styles.basicCard} ${isSelected ? styles.selectedCard : ''}`}
                                >
                                    {/* Ambient card top shimmer */}
                                    <div className={styles.cardGlowTop} />

                                    {/* Most Popular / Best Value Badge */}
                                    {badgeText ? (
                                        <div className={styles.tierBadge}>
                                            <ZapIcon />
                                            <span>{badgeText}</span>
                                        </div>
                                    ) : null}

                                    {/* Card Header Content */}
                                    <div className={styles.cardHeader}>
                                        <div className={styles.tierCategoryRow}>
                                            <div className={styles.tierCategoryGroup}>
                                                <HexGiftBoxIcon />
                                                <span className={styles.tierCategory}>
                                                    {plan.tier_category || plan.category || plan.tier || (isBasic ? 'FREE TIER' : isFeatured ? 'QUANT TIER' : isPremium ? 'INSTITUTIONAL TIER' : `${(name || '').toUpperCase()} TIER`)}
                                                </span>
                                            </div>
                                            {(plan.credits || plan.credits_label) && (
                                                <span className={styles.creditsTag}>
                                                    {plan.credits ? `${plan.credits.toLocaleString()} AI Credits` : plan.credits_label}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className={styles.planName}>{name}</h3>
                                        <p className={styles.planDesc}>{description}</p>

                                        {/* Pricing Block */}
                                        <div className={styles.priceContainer}>
                                            <div className={styles.priceRow}>
                                                {plan.originalPrice ? (
                                                    <span className={styles.originalPrice}>
                                                        {plan.currency || '$'}{plan.originalPrice}
                                                    </span>
                                                ) : null}
                                                {Number(plan.price) === 0 || plan.price === 0 || plan.price === '0' || String(plan.price).toLowerCase() === 'free' || isBasic ? (
                                                    <span className={styles.amount}>Free</span>
                                                ) : (
                                                    <>
                                                        <span className={styles.currency}>{plan.currency || '$'}</span>
                                                        <span className={styles.amount}>{plan.price}</span>
                                                    </>
                                                )}
                                                <span className={styles.validityLabel}>/ {validity.replace(/^Free For /i, 'Valid ').replace(/^مجاناً لمدة /i, 'صالح لمدة ')}</span>
                                            </div>
                                            {plan.originalPrice ? (
                                                <div className={styles.savingsBadge}>
                                                    Save ${(plan.originalPrice - plan.price)} on this tier
                                                </div>
                                            ) : null}
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            type="button"
                                            className={`${styles.buyBtn} ${isFeatured ? styles.featuredBuyBtn : isPremium ? styles.premiumBuyBtn : styles.basicBuyBtn}`}
                                            onClick={() => handleUpgradePlan(plan)}
                                            disabled={submittingPlanId === plan.id}
                                        >
                                            <span>
                                                {submittingPlanId === plan.id ? t('common.loading', 'Processing...') : ctaText}
                                            </span>
                                            <div className={styles.btnIconBox}>
                                                <ArrowUpRightIcon />
                                            </div>
                                        </button>

                                        <p className={styles.subCtaNote}>
                                            {plan.subCtaText || (isBasic ? 'No credit card required' : 'Instant activation • Cancel anytime')}
                                        </p>
                                    </div>

                                    {/* Bottom Features Box */}
                                    <div className={styles.cardFeaturesBox}>
                                        <div className={styles.featuresLeftContent}>
                                            <div className={styles.featuresHeader}>
                                                <span className={styles.headerAccentBar} />
                                                <span>{plan.featuresHeader || 'WHAT YOU RECEIVE:'}</span>
                                            </div>
                                            <ul className={styles.featuresList}>
                                                {featuresList.map((feat, idx) => (
                                                    <li key={idx}>
                                                        <GoldenCheckCircleIcon />
                                                        <span>{feat}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                )}

                {/* 3. Trust & Security Strip */}
                <motion.div 
                    className={styles.trustStrip}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className={styles.trustItem}>
                        <div className={styles.trustIcon}><ShieldCheckIcon /></div>
                        <div>
                            <h4>Instant Autonomous Activation</h4>
                            <p>Immediate credit provisioning & access</p>
                        </div>
                    </div>
                    <div className={styles.trustDivider} />
                    <div className={styles.trustItem}>
                        <div className={styles.trustIcon}><LockIcon /></div>
                        <div>
                            <h4>256-Bit Encrypted Payments</h4>
                            <p>Decentralized & secure gateways</p>
                        </div>
                    </div>
                    <div className={styles.trustDivider} />
                    <div className={styles.trustItem}>
                        <div className={styles.trustIcon}><CpuIcon /></div>
                        <div>
                            <h4>Sub-Second Neural Inference</h4>
                            <p>High-availability GPU cloud infrastructure</p>
                        </div>
                    </div>
                </motion.div>

                {/* 4. Frequently Asked Questions Section */}
                <div className={styles.faqSection}>
                    <div className={styles.faqHeader}>
                        <span className={styles.faqTag}>GOT QUESTIONS?</span>
                        <h2>Frequently Asked Questions</h2>
                        <p>Everything you need to know about ChronosX subscription tiers and AI compute allocation.</p>
                    </div>

                    <div className={styles.faqList}>
                        {faqs.map((faq, idx) => {
                            const isOpen = openFaq === idx;
                            return (
                                <div 
                                    key={idx} 
                                    className={`${styles.faqCard} ${isOpen ? styles.faqCardOpen : ''}`}
                                    onClick={() => toggleFaq(idx)}
                                >
                                    <div className={styles.faqQuestionRow}>
                                        <h3>{faq.q}</h3>
                                        <div className={`${styles.faqChevron} ${isOpen ? styles.faqChevronRotated : ''}`}>
                                            <ChevronDownIcon />
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div 
                                                className={styles.faqAnswer}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.25 }}
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

                {/* 5. Bottom Conversion CTA */}
                <CommonCta
                    badge="UNLIMITED INSTITUTIONAL POTENTIAL"
                    title1="Upgrade Your Trading Desk with"
                    title2="Next-Gen AI Intelligence"
                    description="Get higher compute limits, custom MT5 indicators, real-time chart OCR scans, and dedicated quant support."
                    primaryBtnText="CHOOSE YOUR PLAN"
                    primaryBtnAction={() => {
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                />

                {/* 6. Footer Disclaimer Box */}
                <div className={styles.disclaimerBox}>
                    <p>
                        ChronosX provides software, technical tools, and market intelligence algorithms for educational and research purposes only. Subscription fees cover cloud server infrastructure and AI compute processing. Past performance in backtests or simulations is not indicative of future market results.
                    </p>
                </div>
            </div>
        </div>
    );
}
