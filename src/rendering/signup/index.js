'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './signup.module.scss';
import Input from '@/components/input';
import PhoneInput from '@/components/phoneInput';
import FirebasePhoneModal from '@/components/firebasePhoneModal';
import PointerGlow from '@/components/pointerGlow';
import ContinueWithGoogle from '@/components/continueWithGoogle';
import {
    getAuthRedirectTarget,
    getStoredUser,
    getStoredUserId,
    clearAuthSession,
    fetchUserOnboardingStatus,
    setOnboardingCompletedInSession,
    clearOnboardingInSession
} from '@/lib/authSession';
import { authApi, profileApi } from '@/lib/api';
import { validateSignup } from '@/lib/validation';
import { toast } from '@/components/toast';
import { supabase } from '@/lib/supabaseClient';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { getUtmParameters } from '@/lib/utm';
import { useLanguage } from '@/context/LanguageContext';

const Logo = '/assets/logo/logo.png';
const UserIcon = '/assets/icons/user.svg';
const EmailIcon = '/assets/icons/sms.svg';
const Lock = '/assets/icons/lock.svg';

const Signup = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useLanguage();
    const codeFromQuery = searchParams.get('code') || searchParams.get('referral_code') || '';
    const redirectTo = getAuthRedirectTarget(searchParams);
    
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        confirmPassword: '',
        referral_code: codeFromQuery
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // States for phone step after Google Sign-in
    const [pendingPhoneUserId, setPendingPhoneUserId] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [savingPhone, setSavingPhone] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);

    // Auto-cycle active step card on left panel
    const [activeStepIndex, setActiveStepIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStepIndex((prev) => (prev + 1) % 3);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

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
                    console.error('Error fetching user status in signup checkSession', e);
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

    const setPhone = (val) => {
        setForm((f) => ({ ...f, phone_number: val || '' }));
        if (errors.phone_number) setErrors((prev) => ({ ...prev, phone_number: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        const fieldErrors = validateSignup(form);
        if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            return;
        }
        setLoading(true);
        try {
            const utm = getUtmParameters();
            const signupPayload = { ...form, ...utm };
            await authApi.signup(signupPayload);
            setSuccess(true);
        } catch (err) {
            toast.dismiss();
            toast.error(typeof err.message === 'string' ? err.message : 'Something went wrong. Please try again.');
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

    if (success) {
        return (
            <div className={styles.signuppage}>
                <div className={styles.ambientGlowTop} aria-hidden="true" />
                <div className={styles.ambientGlowBottom} aria-hidden="true" />
                <div className={styles.gridOverlay} aria-hidden="true" />

                <div className={styles.authContainer}>
                    <div className={styles.authCardSingle}>
                        <div className={styles.logoWrapper}>
                            <Link href="/" className={styles.logoLink} title="ChronosX Home">
                                <img src={Logo} alt="ChronosX Logo" className={styles.logoImg} />
                            </Link>
                        </div>
                        <div className={styles.text}>
                            <h2>{t('auth.checkEmail', 'Check your email')}</h2>
                            <p>{t('auth.verificationSent', `We sent a verification link to ${form.email}. Click the link to activate your account.`)}</p>
                            <p className={styles.note}>
                                {t('auth.spamNote', "Note: If you don't find the email in your inbox, please check your spam folder.")}
                            </p>
                        </div>
                        <div className={styles.accountText}>
                            <p><Link href="/login">{t('auth.backToLogin', 'Back to Log in')}</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.signuppage}>
            {/* Interactive Mouse Move Emerald Glow Follower */}
            <PointerGlow color="rgba(24, 201, 139, 0.35)" size={250} />

            {/* Ambient Background Glows */}
            <div className={styles.ambientGlowTop} aria-hidden="true" />
            <div className={styles.ambientGlowBottom} aria-hidden="true" />
            <div className={styles.gridOverlay} aria-hidden="true" />

            <div className={styles.authContainer}>
                <div className={styles.splitAuthCard}>
                    
                    {/* ════════════ LEFT HERO PANEL (DESKTOP ONLY) ════════════ */}
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

                                {/* Header & Subtitle */}
                                <div className={styles.leftTextGroup}>
                                    <h2 className={styles.leftTitle}>Join ChronosX Intelligence</h2>
                                    <p className={styles.leftSubtitle}>
                                        Unlock institutional AI market intelligence, live breakout alerts, and automated MT5 execution.
                                    </p>
                                </div>

                                {/* 3 Rounded Step Cards (Auto-Cycles Active State) */}
                                <div className={styles.stepCardList}>
                                    <div
                                        className={`${styles.stepCard} ${activeStepIndex === 0 ? styles.stepCardActive : ''}`}
                                        onClick={() => setActiveStepIndex(0)}
                                        onMouseEnter={() => setActiveStepIndex(0)}
                                    >
                                        <div className={styles.stepBadge}>1</div>
                                        <div className={styles.stepCardContent}>
                                            <span className={styles.stepCardText}>Sign up your account</span>
                                            <span className={styles.stepCardSubtext}>Instant non-custodial setup</span>
                                        </div>
                                    </div>

                                    <div
                                        className={`${styles.stepCard} ${activeStepIndex === 1 ? styles.stepCardActive : ''}`}
                                        onClick={() => setActiveStepIndex(1)}
                                        onMouseEnter={() => setActiveStepIndex(1)}
                                    >
                                        <div className={styles.stepBadge}>2</div>
                                        <div className={styles.stepCardContent}>
                                            <span className={styles.stepCardText}>Set up your workspace</span>
                                            <span className={styles.stepCardSubtext}>AI Breakout &amp; Liquidity scan</span>
                                        </div>
                                    </div>

                                    <div
                                        className={`${styles.stepCard} ${activeStepIndex === 2 ? styles.stepCardActive : ''}`}
                                        onClick={() => setActiveStepIndex(2)}
                                        onMouseEnter={() => setActiveStepIndex(2)}
                                    >
                                        <div className={styles.stepBadge}>3</div>
                                        <div className={styles.stepCardContent}>
                                            <span className={styles.stepCardText}>Connect MT5 &amp; Trade</span>
                                            <span className={styles.stepCardSubtext}>Direct market execution</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Clean SVG Vector Shield Badge (NO EMOJIS) */}
                            <div className={styles.leftFooterNotice}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                </svg>
                                <span>256-Bit Encrypted &amp; Non-Custodial</span>
                            </div>
                        </div>
                    </div>

                    {/* ════════════ RIGHT FORM PANEL ════════════ */}
                    <div className={styles.rightFormPanel}>
                        <div className={styles.formInnerContainer}>
                            {/* Mobile Brand Logo */}
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
                                        <h1 className={styles.formTitle}>Sign Up Account</h1>
                                        <p className={styles.formSubtitle}>Enter your personal data to create your account.</p>
                                    </div>

                                    <form onSubmit={handleSubmit} noValidate autoComplete="off">
                                        <div className={styles.spacingGrid}>
                                            {/* First Name & Last Name in 2 columns */}
                                            <div className={styles.twoCol}>
                                                <Input
                                                    label="First Name"
                                                    icon={UserIcon}
                                                    placeholder="eg. John"
                                                    name="first_name"
                                                    value={form.first_name}
                                                    onChange={set('first_name')}
                                                    error={errors.first_name}
                                                    maxLength={50}
                                                    autoComplete="off"
                                                />
                                                <Input
                                                    label="Last Name"
                                                    icon={UserIcon}
                                                    placeholder="eg. Francisco"
                                                    name="last_name"
                                                    value={form.last_name}
                                                    onChange={set('last_name')}
                                                    error={errors.last_name}
                                                    maxLength={50}
                                                    autoComplete="off"
                                                />
                                            </div>

                                            <Input
                                                label="Email"
                                                icon={EmailIcon}
                                                placeholder="eg. johndoe@gmail.com"
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={set('email')}
                                                error={errors.email}
                                                maxLength={100}
                                                autoComplete="off"
                                            />

                                            <PhoneInput
                                                label="Phone Number"
                                                placeholder="eg. +1 234 567 890"
                                                value={form.phone_number}
                                                onChange={setPhone}
                                                error={errors.phone_number}
                                                defaultCountry="AE"
                                            />

                                            <div className={styles.twoCol}>
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
                                                        autoComplete="new-password"
                                                    />
                                                    <span className={styles.fieldHint}>Must be at least 8 characters</span>
                                                </div>

                                                <Input
                                                    label="Confirm Password"
                                                    icon={Lock}
                                                    placeholder="Confirm your password"
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={form.confirmPassword}
                                                    onChange={set('confirmPassword')}
                                                    error={errors.confirmPassword}
                                                    maxLength={50}
                                                    autoComplete="new-password"
                                                />
                                            </div>

                                            <Input
                                                label="Referral Code (Optional)"
                                                icon={UserIcon}
                                                placeholder="Enter referral code"
                                                name="referral_code"
                                                value={form.referral_code}
                                                onChange={set('referral_code')}
                                                error={errors.referral_code}
                                                maxLength={50}
                                                autoComplete="off"
                                            />

                                            <button
                                                type="submit"
                                                className={styles.submitBtn}
                                                disabled={loading}
                                            >
                                                {loading ? 'Creating account...' : 'Sign Up'}
                                            </button>
                                        </div>
                                    </form>

                                    <div className={styles.orDivider}>
                                        <span>Or</span>
                                    </div>

                                    {/* Social Login Button Row */}
                                    <div className={styles.socialRow}>
                                        <div className={styles.googleButtonWrapper}>
                                            <ContinueWithGoogle redirectTo={redirectTo} onPendingPhone={setPendingPhoneUserId} />
                                        </div>
                                    </div>

                                    <div className={styles.accountBottomLink}>
                                        <p>
                                            Already have an account? <Link href="/login">Log In</Link>
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

export default Signup;
