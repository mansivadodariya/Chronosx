'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './login.module.scss';
import Input from '@/components/input';
import Button from '@/components/button';
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
import { isValidPhoneNumber } from 'react-phone-number-input';
import { supabase } from '@/lib/supabaseClient';

import { useLanguage } from '@/context/LanguageContext';
import LanguageToggle from '@/components/languageToggle';

const Logo = '/assets/logo/logo.png';
const ArrowIcon = '/assets/icons/arrow.svg';
const EmailIcon = '/assets/icons/sms.svg';
const UserIcon = '/assets/icons/user.svg';
const Lock = '/assets/icons/lock.svg';

const Login = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useLanguage();
    const redirectTo = getAuthRedirectTarget(searchParams);
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // States for phone step after Google Sign-in
    const [pendingPhoneUserId, setPendingPhoneUserId] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [savingPhone, setSavingPhone] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    useEffect(() => {
        console.log('Login mount/update: pendingPhoneUserId =', pendingPhoneUserId);
    }, [pendingPhoneUserId]);

    useEffect(() => {
        const checkSession = async () => {
            const uid = getStoredUserId();
            const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
            const hasCookie = typeof document !== 'undefined' && document.cookie.split(';').some(c => c.trim().startsWith('auth_token='));
            console.log('Login checkSession: uid =', uid, 'token =', token, 'hasCookie =', hasCookie);
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

            // Fetch authenticated user's onboarding status directly from Supabase (primary source of truth: users.onboarding_completed)
            const status = await fetchUserOnboardingStatus(uid, cleanEmail);

            // Sync user ID if Supabase returned a UUID and sessionUser had empty or non-UUID
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

    return (
        <div className={styles.loginpage}>
            {/* Ambient Background Glows */}
            <div className={styles.ambientGlowTop} aria-hidden="true" />
            <div className={styles.ambientGlowBottom} aria-hidden="true" />
            <div className={styles.gridOverlay} aria-hidden="true" />

            <div className={styles.authContainer}>
                <div className={styles.authCard}>
                    {/* Redesigned Logo */}
                    <div className={styles.logoWrapper}>
                        <Link href="/" className={styles.logoLink} title="ChronosX Home">
                            <img src={Logo} alt="ChronosX Logo" className={styles.logoImg} />
                        </Link>
                    </div>

                    {pendingPhoneUserId ? (
                        <>
                            <div className={styles.text}>
                                <h2>{t('auth.completeProfile', 'Complete Your Profile')}</h2>
                                <p>{t('auth.enterPhoneDesc', 'Please enter your phone number to continue.')}</p>
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
                                    <Button
                                        text={savingPhone ? t('auth.saving', 'Saving...') : t('auth.continue', 'Continue')}
                                        type="submit"
                                        disabled={savingPhone}
                                        icon={ArrowIcon}
                                    />
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
                            <div className={styles.text}>
                                <h2>{t('auth.loginHeader', 'Log In')}</h2>
                                <p>{t('auth.loginDesc', 'Log in to your account to access AI strategy tools and market analysis.')}</p>
                            </div>
                            <form onSubmit={handleSubmit} noValidate autoComplete="off">
                                <div className={styles.spacingGrid}>
                                    <Input
                                        label={t('auth.emailOrUsername', 'EMAIL OR USERNAME')}
                                        icon={UserIcon}
                                        placeholder={t('auth.emailPlaceholder', 'Enter your email or username')}
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={set('email')}
                                        error={errors.email}
                                        maxLength={100}
                                        autoComplete="off"
                                    />
                                    <Input
                                        label={t('auth.passwordLabel', 'PASSWORD')}
                                        icon={Lock}
                                        placeholder={t('auth.passwordPlaceholder', 'Enter your password')}
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={set('password')}
                                        error={errors.password}
                                        maxLength={50}
                                        autoComplete="new-password"
                                    />
                                    <div className={styles.forgotRow}>
                                        <Link href="/forgot-password">{t('auth.forgotPasswordQuestion', 'Forgot password?')}</Link>
                                    </div>
                                    <Button text={loading ? t('auth.loggingInBtn', 'Logging in...') : t('auth.loginBtn', 'Log in')} icon={ArrowIcon} disabled={loading} type="submit" />
                                </div>
                            </form>
                            <div className={styles.accountText}>
                                <p>{t('auth.noAccount', "Don't have an account?")} <Link href="/signup">{t('auth.signupHeader', 'Sign up')}</Link></p>
                            </div>
                            <div className={styles.orText}><span>{t('auth.or', 'or')}</span></div>
                            <ContinueWithGoogle redirectTo={redirectTo} onPendingPhone={setPendingPhoneUserId} />
                        </>
                    )}
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