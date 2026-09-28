'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './pageLoader.module.scss';

export default function PageLoader() {
    const pathname = usePathname();
    const [isNavigating, setIsNavigating] = useState(false);
    const timeoutRef = useRef(null);
    const currentPathRef = useRef(pathname);

    // Stop loading when pathname changes
    useEffect(() => {
        if (isNavigating) {
            setIsNavigating(false);
        }
        currentPathRef.current = pathname;
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, [pathname]);

    // Listen to link clicks across the application
    useEffect(() => {
        const handleClick = (e) => {
            const anchor = e.target.closest('a');
            if (!anchor) return;

            const href = anchor.getAttribute('href');
            if (!href) return;

            if (
                href.startsWith('http://') ||
                href.startsWith('https://') ||
                href.startsWith('#') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                anchor.target === '_blank' ||
                e.ctrlKey ||
                e.metaKey ||
                e.shiftKey ||
                e.altKey ||
                e.defaultPrevented
            ) {
                return;
            }

            const current = (currentPathRef.current || window.location.pathname).split('?')[0].replace(/\/$/, '') || '/';
            const target = href.split('?')[0].replace(/\/$/, '') || '/';

            if (current !== target) {
                setIsNavigating(true);

                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(() => {
                    setIsNavigating(false);
                }, 4000);
            }
        };

        const handleStartLoading = () => {
            setIsNavigating(true);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setIsNavigating(false);
            }, 4000);
        };

        const handleStopLoading = () => {
            setIsNavigating(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };

        document.addEventListener('click', handleClick, true);
        window.addEventListener('page:loading:start', handleStartLoading);
        window.addEventListener('page:loading:stop', handleStopLoading);

        return () => {
            document.removeEventListener('click', handleClick, true);
            window.removeEventListener('page:loading:start', handleStartLoading);
            window.removeEventListener('page:loading:stop', handleStopLoading);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <AnimatePresence>
            {isNavigating && (
                <motion.div
                    className={styles.navigationOverlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                    <motion.div
                        className={styles.loaderContent}
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.94 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {/* High-Tech Gyroscope Orbital Core */}
                        <div className={styles.emblemOrbitalWrap}>
                            <div className={styles.outerGlowRing} />
                            <div className={styles.innerGlowRing} />
                            <div className={styles.centerEmblemCore}>
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ width: '18px', height: '18px', display: 'block', flexShrink: 0 }}
                                >
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                </svg>
                            </div>
                        </div>

                        {/* Text Information */}
                        <h4 className={styles.loaderTitle}>Loading...</h4>

                        {/* Scanning Progress Laser Track */}
                        <div className={styles.progressTrack}>
                            <div className={styles.progressLaser} />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
