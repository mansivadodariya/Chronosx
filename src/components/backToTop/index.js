"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import styles from './backToTop.module.scss';

export default function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const pathname = usePathname();
    const { t } = useLanguage();

    const publicLandingPages = [
        '/',
        '/capabilities',
        '/economic-calendar',
        '/forex-calculator',
        '/market-news',
        '/blogs',
        '/about-us',
        '/contact-us',
        '/terms-and-conditions',
        '/privacy-policy',
        '/risk-disclosure',
        '/plans',
        '/white-label',
        '/affiliate-program',
        '/ai-chart-scanner',
        '/ai-market-assistant',
        '/ai-strategy-core',
        '/ai-strategy-hub',
        '/ai-trade-advisor',
        '/ai-trade-audit',
        '/ai-trading-signal',
        '/backtesting',
        '/custom-bot-builder',
        '/live-market-scanner',
        '/no-refund-policy',
        '/supported-brokers'
    ];

    const isWhatsAppVisible = pathname && (
        publicLandingPages.includes(pathname) ||
        publicLandingPages.some(page => page !== '/' && pathname.startsWith(page))
    );

    const handleScroll = useCallback(() => {
        if (typeof window === 'undefined') return;

        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

        if (scrollHeight > 0) {
            const progress = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
            setScrollProgress(progress);
        }

        if (scrollTop > 250) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, []);

    useEffect(() => {
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const scrollToTop = () => {
        if (typeof window === 'undefined') return;

        if (window.lenis && typeof window.lenis.scrollTo === 'function') {
            window.lenis.scrollTo(0, { immediate: false, duration: 1.0 });
        } else {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    // Circle radius & stroke calculation for 50x50 SVG (desktop) & 44x44 (mobile)
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={`${styles.backToTopWrapper} ${isWhatsAppVisible ? styles.aboveWhatsapp : styles.standalone}`}
                    initial={{ scale: 0, opacity: 0, y: 15 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0, y: 15 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                    <button
                        type="button"
                        onClick={scrollToTop}
                        className={styles.backToTopBtn}
                        aria-label={t('common.backToTop', 'Back to top')}
                    >
                        <div className={styles.tooltip}>
                            {t('common.backToTop', 'Back to top')}
                        </div>

                        <svg
                            className={styles.progressRing}
                            width="50"
                            height="50"
                            viewBox="0 0 50 50"
                            aria-hidden="true"
                        >
                            <circle
                                className={styles.progressRingTrack}
                                strokeWidth="2.5"
                                fill="transparent"
                                r={radius}
                                cx="25"
                                cy="25"
                            />
                            <circle
                                className={styles.progressRingIndicator}
                                strokeWidth="2.5"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                fill="transparent"
                                r={radius}
                                cx="25"
                                cy="25"
                            />
                        </svg>

                        <div className={styles.arrowIconWrap}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={styles.arrowIcon}
                            >
                                <path d="M12 19V5" />
                                <path d="M5 12l7-7 7 7" />
                            </svg>
                        </div>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
