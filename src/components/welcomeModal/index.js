'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { isUserLoggedIn } from '@/lib/authRedirect';
import { getStoredUser } from '@/lib/authSession';
import styles from './welcomeModal.module.scss';

const TOUR_STEPS = [
    {
        step: 1,
        tag: 'GETTING STARTED',
        title: 'Welcome to ChronosX!',
        subtitle: 'Sign up with email or Google to activate your institutional AI trading desk & neural market feed.',
        badge: 'Quick 30s Signup',
        actionText: 'Create Account',
        actionHref: '/signup',
    },
    {
        step: 2,
        tag: 'SECURITY & VERIFICATION',
        title: 'Verify & Secure Your Session',
        subtitle: 'Confirm your email & password to lock in encrypted session keys, 2FA protection, and trade alerts.',
        badge: '256-Bit Encryption',
        actionText: 'Next Step',
        actionHref: null,
    },
    {
        step: 3,
        tag: 'STARTER CREDITS',
        title: 'Use Complimentary Credits',
        subtitle: 'Test drive the AI Chart Scanner, Custom Bot Builder, and Live Radar with default starter credits.',
        badge: 'Free Credits Active',
        actionText: 'Try AI Tools',
        actionHref: '/ai-cockpit',
    },
    {
        step: 4,
        tag: 'AUTOMATION & TRADING',
        title: 'Deploy Automated Bots',
        subtitle: 'Connect your broker or launch algorithmic strategies with 1-click execution and precision risk rules.',
        badge: '40+ Brokers Supported',
        actionText: 'Get Started',
        actionHref: '/signup',
    },
];

export default function WelcomeModal({ autoShowDelay = 1200 }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const timerRef = useRef(null);

    // Dynamic greeting based on current time
    const timeGreeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Good morning';
        if (hour >= 12 && hour < 17) return 'Good afternoon';
        if (hour >= 17 && hour < 22) return 'Good evening';
        return 'Good night';
    }, []);

    // Check user & session state
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const checkAuth = () => {
            const loggedIn = isUserLoggedIn();
            const stored = getStoredUser();
            setIsLoggedIn(loggedIn);
            setUser(stored);
        };

        // Check URL parameter to force preview (e.g. ?welcome=true or ?tour=true)
        const searchParams = new URLSearchParams(window.location.search);
        const forceWelcome = searchParams.get('welcome') === 'true' || searchParams.get('tour') === 'true';

        if (forceWelcome) {
            setIsOpen(true);
        } else {
            const sessionDismissed = sessionStorage.getItem('chronosx_welcome_dismissed');
            const localDismissed = localStorage.getItem('chronosx_welcome_permanent_dismissed');

            if (!sessionDismissed && !localDismissed) {
                const timer = setTimeout(() => {
                    setIsOpen(true);
                }, autoShowDelay);
                return () => clearTimeout(timer);
            }
        }

        const handleManualOpen = () => setIsOpen(true);
        window.addEventListener('chronosx:open-welcome', handleManualOpen);
        window.addEventListener('user:updated', checkAuth);
        window.addEventListener('auth:logout', checkAuth);
        window.addEventListener('storage', checkAuth);

        return () => {
            window.removeEventListener('chronosx:open-welcome', handleManualOpen);
            window.removeEventListener('user:updated', checkAuth);
            window.removeEventListener('auth:logout', checkAuth);
            window.removeEventListener('storage', checkAuth);
        };
    }, [autoShowDelay]);

    // Auto-advance walkthrough tour every 4.5 seconds for new users (paused on hover)
    useEffect(() => {
        if (!isOpen || isLoggedIn || isHovered) return;

        timerRef.current = setInterval(() => {
            setCurrentStep((prev) => (prev + 1) % TOUR_STEPS.length);
        }, 4500);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isOpen, isLoggedIn, isHovered]);

    // Handle modal close
    const handleClose = useCallback(() => {
        setIsOpen(false);
        try {
            sessionStorage.setItem('chronosx_welcome_dismissed', 'true');
            if (dontShowAgain) {
                localStorage.setItem('chronosx_welcome_permanent_dismissed', 'true');
            }
        } catch (_) {
            /* ignore storage quota issues */
        }
    }, [dontShowAgain]);

    // Close on Escape key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleClose]);

    // Prevent body scroll when open
    useEffect(() => {
        if (!isOpen) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [isOpen]);

    const navigateTo = (path) => {
        handleClose();
        router.push(path);
    };

    const handleNextStep = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            navigateTo('/signup');
        }
    };

    // User details
    const displayName = useMemo(() => {
        if (!user) return 'Trader';
        return (
            user.first_name ||
            user.name ||
            (user.email ? user.email.split('@')[0] : 'Trader')
        );
    }, [user]);

    const userEmail = user?.email || '';
    const userInitials = useMemo(() => {
        if (!displayName) return 'CX';
        const parts = displayName.trim().split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return displayName.substring(0, 2).toUpperCase();
    }, [displayName]);

    const activeStepData = TOUR_STEPS[currentStep];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className={styles.modalRoot}>
                    {/* Backdrop */}
                    <motion.div
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={handleClose}
                    />

                    {/* Modal Card */}
                    <div className={styles.modalCenterWrapper}>
                        <motion.div
                            className={styles.modalCard}
                            role="dialog"
                            aria-modal="true"
                            initial={{ opacity: 0, scale: 0.94, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 16 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
                            onClick={(e) => e.stopPropagation()}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            {/* Close Button */}
                            <button
                                type="button"
                                className={styles.closeBtn}
                                onClick={handleClose}
                                aria-label="Close modal"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>

                            {/* ================= GUEST / NEW USER WALKTHROUGH TOUR ================= */}
                            {!isLoggedIn ? (
                                <div className={styles.tourWrapper}>
                                    {/* Top Graphic Banner with 3D Preview Cards */}
                                    <div className={styles.tourGraphicBox}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src="/assets/images/welcome_tour_preview.jpg"
                                            alt="ChronosX AI Platform"
                                            className={styles.tourBannerImage}
                                        />
                                        <div className={styles.graphicOverlayFade} />
                                        <div className={styles.smokeFade} />
                                    </div>

                                    {/* Content Area */}
                                    <div className={styles.tourContent}>
                                        <div className={styles.stepIndicatorTag}>
                                            <span>STEP {currentStep + 1} OF {TOUR_STEPS.length}</span>
                                            <span className={styles.dotSeparator}>•</span>
                                            <span className={styles.stepThemeLabel}>{activeStepData.tag}</span>
                                        </div>

                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={currentStep}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -8 }}
                                                transition={{ duration: 0.25 }}
                                                className={styles.stepTextWrapper}
                                            >
                                                <h3 className={styles.tourTitle}>{activeStepData.title}</h3>
                                                <p className={styles.tourSubtitle}>{activeStepData.subtitle}</p>
                                            </motion.div>
                                        </AnimatePresence>

                                        {/* Auto-Scroll Interactive Dots Indicator */}
                                        <div className={styles.dotsRow}>
                                            {TOUR_STEPS.map((s, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    className={`${styles.dotItem} ${idx === currentStep ? styles.dotActive : ''}`}
                                                    onClick={() => setCurrentStep(idx)}
                                                    aria-label={`Go to step ${idx + 1}`}
                                                >
                                                    {idx === currentStep && (
                                                        <span className={styles.dotProgressBar} />
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Borderless Seamless Button Actions */}
                                        <div className={styles.tourActionRow}>
                                            <button
                                                type="button"
                                                className={styles.skipBtn}
                                                onClick={handleClose}
                                            >
                                                Skip tour
                                            </button>

                                            <button
                                                type="button"
                                                className={styles.continueBtn}
                                                onClick={handleNextStep}
                                            >
                                                <span>{currentStep === TOUR_STEPS.length - 1 ? 'Get Started' : 'Continue'}</span>
                                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="5" y1="12" x2="19" y2="12" />
                                                    <polyline points="12 5 19 12 12 19" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* ================= LOGGED IN / WELCOME BACK VIEW ================= */
                                <div className={styles.welcomeBackWrapper}>
                                    {/* Top Preview Banner with HUD */}
                                    <div className={styles.welcomeBackGraphicBox}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src="/assets/images/welcome_tour_preview.jpg"
                                            alt="Trading Desk Terminal"
                                            className={styles.welcomeBackBannerImage}
                                        />
                                        <div className={styles.graphicOverlayFade} />
                                        <div className={styles.smokeFade} />
                                    </div>

                                    {/* Content Container */}
                                    <div className={styles.welcomeBackContent}>
                                        {/* Greeting */}
                                        <div className={styles.greetingSection}>
                                            <h3 className={styles.backTitle}>
                                                {timeGreeting},{' '}
                                                <span className={styles.highlightGradient}>{displayName}</span>!
                                            </h3>
                                            <p className={styles.backSubtitle}>
                                                Your institutional trading workspace is active. Neural signal confluence and algorithmic engines are synced.
                                            </p>
                                        </div>

                                        {/* User Snapshot Bar */}
                                        <div className={styles.userSnapshotBar}>
                                            <div className={styles.avatarWrap}>
                                                {user?.profile_picture ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={user.profile_picture} alt={displayName} />
                                                ) : (
                                                    <span>{userInitials}</span>
                                                )}
                                                <span className={styles.onlineBadge} />
                                            </div>
                                            <div className={styles.profileDetails}>
                                                <div className={styles.nameRow}>
                                                    <span className={styles.proName}>{displayName}</span>
                                                    <span className={styles.proBadge}>PRO TRADER</span>
                                                </div>
                                                {userEmail && <span className={styles.proEmail}>{userEmail}</span>}
                                            </div>
                                            <div className={styles.latencyBadge}>
                                                <span className={styles.latencyLabel}>Latency</span>
                                                <span className={styles.latencyVal}>18ms</span>
                                            </div>
                                        </div>

                                        {/* Quick Jump 2x2 Feature Grid */}
                                        <div className={styles.featureGrid}>
                                            <div className={styles.featureCard} onClick={() => navigateTo('/dashboard')}>
                                                <div className={styles.featIconGreen}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="3" y="3" width="7" height="7" />
                                                        <rect x="14" y="3" width="7" height="7" />
                                                        <rect x="14" y="14" width="7" height="7" />
                                                        <rect x="3" y="14" width="7" height="7" />
                                                    </svg>
                                                </div>
                                                <div className={styles.featInfo}>
                                                    <h4>Main Dashboard</h4>
                                                    <p>Portfolio overview & analytics</p>
                                                </div>
                                                <span className={styles.featArrow}>→</span>
                                            </div>

                                            <div className={styles.featureCard} onClick={() => navigateTo('/ai-cockpit')}>
                                                <div className={styles.featIconCyan}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                                    </svg>
                                                </div>
                                                <div className={styles.featInfo}>
                                                    <h4>Live AI Cockpit</h4>
                                                    <p>Institutional signal flow</p>
                                                </div>
                                                <span className={styles.featArrow}>→</span>
                                            </div>

                                            <div className={styles.featureCard} onClick={() => navigateTo('/custom-bot-builder')}>
                                                <div className={styles.featIconPurple}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="4" y="4" width="16" height="16" rx="2" />
                                                        <circle cx="9" cy="9" r="1.5" />
                                                        <circle cx="15" cy="9" r="1.5" />
                                                        <path d="M9 15h6" />
                                                    </svg>
                                                </div>
                                                <div className={styles.featInfo}>
                                                    <h4>Custom Bot Builder</h4>
                                                    <p>Automate execution rules</p>
                                                </div>
                                                <span className={styles.featArrow}>→</span>
                                            </div>

                                            <div className={styles.featureCard} onClick={() => navigateTo('/ai-chart-scanner')}>
                                                <div className={styles.featIconBlue}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M3 3v18h18" />
                                                        <path d="M18 9l-5 5-4-4-6 6" />
                                                    </svg>
                                                </div>
                                                <div className={styles.featInfo}>
                                                    <h4>AI Chart Scanner</h4>
                                                    <p>Pattern breakout vision</p>
                                                </div>
                                                <span className={styles.featArrow}>→</span>
                                            </div>
                                        </div>

                                        {/* Borderless Action Button */}
                                        <div className={styles.backActionRow}>
                                            <button
                                                type="button"
                                                className={styles.launchTerminalBtn}
                                                onClick={() => navigateTo('/dashboard')}
                                            >
                                                <span>Launch Terminal Dashboard</span>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="5" y1="12" x2="19" y2="12" />
                                                    <polyline points="12 5 19 12 12 19" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Modal Footer Preference */}
                            <div className={styles.footerNote}>
                                <label className={styles.checkboxOption}>
                                    <input
                                        type="checkbox"
                                        checked={dontShowAgain}
                                        onChange={(e) => setDontShowAgain(e.target.checked)}
                                    />
                                    <span>Don&apos;t show this again</span>
                                </label>
                                <span className={styles.securedTag}>256-Bit SSL Institutional</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
