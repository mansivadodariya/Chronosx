'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './login.module.scss';
import Input from '@/components/input';
import ContinueWithGoogle from '@/components/continueWithGoogle';
import { authApi, profileApi } from '@/lib/api';
import {
    persistAuthSession,
    getAuthRedirectTarget,
    getStoredUser,
    getStoredUserId,
    clearAuthSession,
    setOnboardingCompletedInSession,
    clearOnboardingInSession,
    fetchUserOnboardingStatus
} from '@/lib/authSession';
import { validateLogin } from '@/lib/validation';
import { toast } from '@/components/toast';
import PhoneInput from '@/components/phoneInput';
import FirebasePhoneModal from '@/components/firebasePhoneModal';
import PointerGlow from '@/components/pointerGlow';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { supabase } from '@/lib/supabaseClient';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

const DarkLogo = '/assets/logo/logo.png';
const LightLogo = '/assets/logo/darklogo.png';
const UserIcon = '/assets/icons/user.svg';
const Lock = '/assets/icons/lock.svg';

const HERO_FEATURES = [
    {
        title: 'AI Chart Scanner',
        desc: 'Instant neural OCR pattern detection',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="m7 14 4-4 4 2 5-6" />
                <circle cx="7" cy="14" r="1.2" fill="currentColor" />
                <circle cx="11" cy="10" r="1.2" fill="currentColor" />
                <circle cx="15" cy="12" r="1.2" fill="currentColor" />
                <circle cx="20" cy="6" r="1.2" fill="currentColor" />
            </svg>
        ),
        badge: '98.4%'
    },
    {
        title: 'Signal Terminal',
        desc: 'Real-time breakout & momentum radar',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
        ),
        badge: 'LIVE'
    },
    {
        title: 'AI Market Assistant',
        desc: '24/7 conversational market copilot',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                <circle cx="9" cy="12" r="1" fill="currentColor" />
                <circle cx="12" cy="12" r="1" fill="currentColor" />
                <circle cx="15" cy="12" r="1.2" fill="currentColor" />
            </svg>
        ),
        badge: 'COPILOT'
    },
    {
        title: 'AI Trading Signal',
        desc: 'Algorithmic quantitative playbooks',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h3l3-7 4 14 3-8 2 4h4" />
                <circle cx="9" cy="5" r="1.2" fill="currentColor" />
                <circle cx="13" cy="19" r="1.2" fill="currentColor" />
            </svg>
        ),
        badge: 'QUANT'
    },
    {
        title: 'Bank-Level Encryption',
        desc: '256-bit non-custodial protocol security',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        badge: 'SECURE'
    }
];

const Login = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useLanguage();
    const { theme } = useTheme();
    const Logo = theme === 'light' ? LightLogo : DarkLogo;
    const redirectTo = getAuthRedirectTarget(searchParams);
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Auto-cycling active feature highlight animation
    const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveFeatureIndex((prev) => (prev + 1) % HERO_FEATURES.length);
        }, 2800);
        return () => clearInterval(timer);
    }, []);

    // States for phone step after Google Sign-in
    const [pendingPhoneUserId, setPendingPhoneUserId] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [savingPhone, setSavingPhone] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);



    useEffect(() => {
        const checkSession = async () => {
            const uid = getStoredUserId();
            const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
            const hasCookie = typeof document !== 'undefined' && document.cookie.split(';').some(c => c.trim().startsWith('auth_token='));
            if (uid && token && hasCookie) {
                try {
                    const user = getStoredUser();
                    const status = await fetchUserOnboardingStatus(uid, user?.email);

                    if (status.exists && !status.is_active) {
                        clearAuthSession();
                        toast.error('Your account is inactive. Please contact admin.');
                        return;
                    }

                    const isPhoneVerified = status.is_phone_verified === true || status.user?.is_phone_verified === true;
                    if (status.user && !isPhoneVerified) {
                        setPendingPhoneUserId(status.user.id || uid);
                        setPhoneNumber(status.user.phone_number || '');
                        setShowOtpModal(true);
                        return;
                    }

                    let destination = redirectTo;
                    if (!destination || destination === '/onboarding' || destination === '/steper' || destination.startsWith('/onboarding') || destination.startsWith('/steper')) {
                        destination = '/dashboard';
                    }

                    if (status.onboarding_completed) {
                        setOnboardingCompletedInSession();
                        window.location.assign(destination);
                    } else {
                        clearOnboardingInSession();
                        window.location.assign('/onboarding');
                    }
                } catch (e) {
                    console.error('Error fetching user status in checkSession', e);
                }
            }
        };

        checkSession();
    }, [searchParams, redirectTo]);

    const set = (field) => (e) => {
        const val = e.target.value.trimStart();
        setForm((f) => ({ ...f, [field]: val }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        const fieldErrors = validateLogin(form);
        if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            return;
        }
        setLoading(true);
        try {
            const data = await authApi.login(form.email, form.password);
            const sessionUser = persistAuthSession(data);
            const uid = sessionUser?.id || getStoredUserId();
            const cleanEmail = form.email.trim().toLowerCase();

            // Fetch authenticated user's onboarding status
            const status = await fetchUserOnboardingStatus(uid, cleanEmail);

            if (status.user?.id && sessionUser) {
                sessionUser.id = status.user.id;
                sessionUser.user_id = status.user.id;
                localStorage.setItem('user_id', status.user.id);
            }

            if (status.exists && !status.is_active) {
                clearAuthSession();
                toast.error('Your account is inactive. Please contact admin.');
                return;
            }

            const isPhoneVerified = status.is_phone_verified === true || status.user?.is_phone_verified === true;
            if (status.user && !isPhoneVerified) {
                setPendingPhoneUserId(status.user.id || uid);
                setPhoneNumber(status.user.phone_number || '');
                setShowOtpModal(true);
                return;
            }

            let destination = redirectTo;
            if (!destination || destination === '/onboarding' || destination === '/steper' || destination.startsWith('/onboarding') || destination.startsWith('/steper')) {
                destination = '/dashboard';
            }

            if (status.onboarding_completed) {
                setOnboardingCompletedInSession();
                window.location.assign(destination);
            } else {
                clearOnboardingInSession();
                window.location.assign('/onboarding');
            }
        } catch (err) {
            toast.dismiss();
            let msg = typeof err.message === 'string' ? err.message : 'Something went wrong. Please try again.';
            if (
                msg.toLowerCase().includes('account is not active') ||
                msg.toLowerCase().includes('account is inactive') ||
                msg.toLowerCase().includes('account not active')
            ) {
                msg = 'Account is not active. Please contact admin.';
            }
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePhoneNumber = async (e) => {
        if (e) e.preventDefault();

        if (!phoneNumber) {
            setPhoneError('Phone number is required.');
            return;
        }

        if (!isValidPhoneNumber(phoneNumber)) {
            setPhoneError('Please enter a valid phone number with country code.');
            return;
        }

        const activeUid = pendingPhoneUserId || getStoredUserId();
        if (!activeUid) {
            toast.error('Session expired. Please log in again.');
            clearAuthSession();
            setPendingPhoneUserId('');
            return;
        }

        setPhoneError('');
        setShowOtpModal(true);
    };

    const handleOtpSuccess = async () => {
        setSavingPhone(true);
        const activeUid = pendingPhoneUserId || getStoredUserId();
        try {
            let apiRes = null;
            try {
                apiRes = await profileApi.updateProfile({
                    phone_number: phoneNumber,
                    is_phone_verified: true
                });
            } catch (apiErr) {
                console.warn("profileApi.updateProfile fallback to direct update:", apiErr);
            }

            if (supabase && activeUid) {
                try {
                    await supabase
                        .from('users')
                        .update({
                            phone_number: phoneNumber,
                            is_phone_verified: true
                        })
                        .eq('id', activeUid);
                } catch (dbErr) {
                    console.warn("Supabase direct phone verification update error:", dbErr);
                }
            }

            let isOnboardingDone = localStorage.getItem('has_completed_onboarding') === 'true';
            if (typeof window !== 'undefined') {
                const parsed = JSON.parse(localStorage.getItem('user') || '{}');
                parsed.phone_number = phoneNumber;
                parsed.is_phone_verified = true;
                if (parsed.onboarding_completed) isOnboardingDone = true;
                localStorage.setItem('user', JSON.stringify(parsed));
                document.cookie = 'has_phone=true; path=/; SameSite=Lax';
                window.dispatchEvent(new CustomEvent('user:updated'));
            }

            toast.success(apiRes?.message || 'Phone number verified and saved!');
            let destination = redirectTo;
            if (!destination || destination === '/onboarding' || destination === '/steper' || destination.startsWith('/onboarding') || destination.startsWith('/steper')) {
                destination = '/dashboard';
            }
            if (!isOnboardingDone) {
                window.location.assign('/onboarding');
            } else {
                window.location.assign(destination);
            }
        } catch (err) {
            console.error('Failed to save phone number after verification:', err);
            const msg = String(err.message || '');
            let userFriendlyMsg = 'Failed to save phone number.';
            if (msg.includes('unique constraint') || msg.includes('duplicate key') || msg.includes('already exists') || msg.includes('already in use')) {
                userFriendlyMsg = 'This phone number is already in use.';
            } else if (msg) {
                userFriendlyMsg = msg;
            }
            setPhoneError(userFriendlyMsg);
            toast.error(userFriendlyMsg);
        } finally {
            setSavingPhone(false);
            setShowOtpModal(false);
        }
    };

    return (
        <div className={styles.loginpage}>
            {/* Interactive Mouse Move Emerald Glow Follower */}
            <PointerGlow color="rgba(24, 201, 139, 0.35)" size={250} />

            {/* Ambient Background Glows */}
            <div className={styles.ambientGlowTop} aria-hidden="true" />
            <div className={styles.ambientGlowBottom} aria-hidden="true" />
            <div className={styles.gridOverlay} aria-hidden="true" />

            <div className={styles.authContainer}>
                <div className={styles.splitAuthCard}>

                    {/* ════════════ LEFT HERO PANEL (MATCHING REFERENCE DESIGN) ════════════ */}
                    <div className={styles.leftStepperPanel}>
                        <div className={styles.auroraGlow} aria-hidden="true" />

                        <div className={styles.leftContentWrapper}>
                            {/* Top Aura Area */}
                            <div className={styles.topAuraSpacer} aria-hidden="true" />

                            {/* Center/Bottom Info Stack */}
                            <div className={styles.leftMainBlock}>
                                {/* Brand Logo */}
                                <Link href="/" className={styles.brandHeaderLink} title="ChronosX Home">
                                    <img src={Logo} alt="ChronosX" className={styles.leftLogoImg} />
                                </Link>

                                {/* Header & Subtitle (Aligned with Landing Page) */}
                                <div className={styles.leftTextGroup}>
                                    <h2 className={styles.leftTitle}>
                                        Trade Smarter with <br />
                                        <span className={styles.highlightText}>AI That Never Sleeps</span>
                                    </h2>
                                    <p className={styles.leftSubtitle}>
                                        Get real-time AI trading signals, market insights, and trade recommendations across Forex, Stocks, and Global Markets.
                                    </p>
                                </div>

                                {/* 5 Feature Highlight Pills with Auto-Cycling Animation */}
                                <div className={styles.featurePillList}>
                                    {HERO_FEATURES.map((feat, idx) => {
                                        const isActive = activeFeatureIndex === idx;
                                        return (
                                            <div
                                                key={feat.title}
                                                className={`${styles.featurePill} ${isActive ? styles.activePill : ''}`}
                                                onMouseEnter={() => setActiveFeatureIndex(idx)}
                                            >
                                                <div className={styles.featureIconBox}>
                                                    {feat.icon}
                                                </div>
                                                <div className={styles.featureContent}>
                                                    <span className={styles.featurePillText}>{feat.title}</span>
                                                    <span className={styles.featurePillDesc}>{feat.desc}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Clean SVG Vector Assurance Badge */}
                            <div className={styles.leftFooterNotice}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                                <span>256-Bit Encrypted &amp; Non-Custodial</span>
                            </div>
                        </div>
                    </div>

                    {/* ════════════ RIGHT FORM PANEL ════════════ */}
                    <div className={styles.rightFormPanel}>
                        <div className={styles.formInnerContainer}>
                            {/* Mobile Brand Logo (Visible only on mobile/tablet) */}
                            <div className={styles.mobileLogoWrapper}>
                                <Link href="/" className={styles.mobileLogoLink} title="ChronosX Home">
                                    <img src={Logo} alt="ChronosX" className={styles.mobileLogoImg} />
                                </Link>
                            </div>

                            {pendingPhoneUserId ? (
                                <>
                                    <div className={styles.formHeader}>
                                        <h1 className={styles.formTitle}>{t('auth.completeProfile', 'Complete Your Profile')}</h1>
                                        <p className={styles.formSubtitle}>{t('auth.enterPhoneDesc', 'Please enter your phone number to continue.')}</p>
                                    </div>
                                    <form onSubmit={handleSavePhoneNumber} noValidate>
                                        <div className={styles.spacingGrid}>
                                            <PhoneInput
                                                label={t('profile.phoneLabel', 'Phone Number')}
                                                value={phoneNumber}
                                                onChange={(val) => {
                                                    setPhoneNumber(val || '');
                                                    setPhoneError('');
                                                }}
                                                placeholder={t('profile.phoneLabel', 'Phone number')}
                                                error={phoneError}
                                                defaultCountry="AE"
                                            />
                                            <button
                                                type="submit"
                                                className={styles.submitBtn}
                                                disabled={savingPhone}
                                            >
                                                {savingPhone ? t('auth.saving', 'Saving...') : t('auth.continue', 'Continue')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    clearAuthSession();
                                                    window.location.assign('/');
                                                }}
                                                className={styles.backBtn}
                                            >
                                                {t('auth.backToHome', 'Back to Home')}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <>
                                    <div className={styles.formHeader}>
                                        <h1 className={styles.formTitle}>Log In Account</h1>
                                        <p className={styles.formSubtitle}>Enter your credentials to access your account.</p>
                                    </div>


                                    <form onSubmit={handleSubmit} noValidate>
                                        <div className={styles.spacingGrid}>
                                            <Input
                                                label="Email or Username"
                                                icon={UserIcon}
                                                placeholder="eg. johndoe@gmail.com"
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={set('email')}
                                                error={errors.email}
                                                maxLength={100}
                                                autoComplete="username"
                                            />

                                            <div>
                                                <Input
                                                    label="Password"
                                                    icon={Lock}
                                                    placeholder="Enter your password"
                                                    type="password"
                                                    name="password"
                                                    value={form.password}
                                                    onChange={set('password')}
                                                    error={errors.password}
                                                    maxLength={50}
                                                    autoComplete="current-password"
                                                />
                                                <div className={styles.forgotRow}>
                                                    <Link href="/forgot-password">Forgot password?</Link>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                className={styles.submitBtn}
                                                disabled={loading}
                                            >
                                                {loading ? 'Logging in...' : 'Log In'}
                                            </button>
                                        </div>
                                    </form>

                                    <div className={styles.orDivider}>
                                        <span>Or</span>
                                    </div>

                                    {/* Social Login Header Row */}
                                    <div className={styles.socialRow}>
                                        <div className={styles.googleButtonWrapper}>
                                            <ContinueWithGoogle redirectTo={redirectTo} onPendingPhone={setPendingPhoneUserId} />
                                        </div>
                                    </div>

                                    <div className={styles.accountBottomLink}>
                                        <p>
                                            Don&apos;t have an account? <Link href="/signup">Sign Up</Link>
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            <FirebasePhoneModal
                isOpen={showOtpModal}
                phoneNumber={phoneNumber}
                onClose={() => setShowOtpModal(false)}
                onSuccess={handleOtpSuccess}
            />
        </div>
    );
};

export default Login;