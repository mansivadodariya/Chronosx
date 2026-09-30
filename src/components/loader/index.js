'use client';

import React from 'react';
import styles from './loader.module.scss';

/**
 * High-tech Dual-Ring Orbital Loader
 * size: 'sm' | 'md' (default) | 'lg' | 'xl'
 * centered: wraps in a flex container that fills available space
 */
export default function Loader({ size = 'md', centered = false, className = '' }) {
    const spinner = (
        <div
            className={`${styles.loaderWrapper} ${styles[size] || styles.md} ${className}`}
            aria-label="Loading"
            role="status"
        >
            <div className={styles.outerRing} />
            <div className={styles.innerRing} />
        </div>
    );

    if (centered) {
        return <div className={styles.centered}>{spinner}</div>;
    }

    return spinner;
}
