'use client';

import React from 'react';
import styles from './loader.module.scss';
import { useTheme } from '@/context/ThemeContext';

/**
 * High-tech Dual-Ring Orbital Loader with Center CX Logo
 * size: 'sm' | 'md' (default) | 'lg' | 'xl'
 * centered: wraps in a flex container that fills available space
 * showLogo: whether to display the central CX logo (default: true)
 */
export default function Loader({ size = 'md', centered = false, className = '', showLogo = true }) {
    let isLight = false;
    try {
        const themeCtx = useTheme();
        isLight = themeCtx?.theme === 'light';
    } catch (_) {}

    const spinner = (
        <div
            className={`${styles.loaderWrapper} ${styles[size] || styles.md} ${isLight ? styles.themeLight : ''} ${className}`}
            aria-label="Loading"
            role="status"
        >
            <div className={styles.outerRing} />
            <div className={styles.innerRing} />
            {showLogo && (
                <div className={styles.centerLogo}>
                    <img
                        src="/assets/logo/cx-mark-dark.png"
                        alt="ChronosX"
                        className={`${styles.logoImg} ${styles.darkLogo}`}
                        draggable={false}
                    />
                    <img
                        src="/assets/logo/cx-mark.png"
                        alt="ChronosX"
                        className={`${styles.logoImg} ${styles.lightLogo}`}
                        draggable={false}
                    />
                </div>
            )}
        </div>
    );

    if (centered) {
        return <div className={styles.centered}>{spinner}</div>;
    }

    return spinner;
}
