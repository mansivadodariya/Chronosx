'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import styles from './not-found.module.scss';

export default function ErrorBoundary({ error, reset }) {
  const { t } = useLanguage();

  useEffect(() => {
    console.error('ChronosX Segment Error caught:', error);
  }, [error]);

  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.ambientGlowTop} aria-hidden="true" />
      <div className={styles.ambientGlowCenter} aria-hidden="true" />
      <div className={styles.gridOverlay} aria-hidden="true" />

      <main className={styles.mainContent}>
        <div className="container">
          <div className={styles.contentWrapper}>
            <div className={styles.statusTag}>
              <span className={styles.pulseDot} />
              <span>{t('errors.boundary.tag', 'TEMPORARY SYSTEM DISRUPTION • ERROR 500')}</span>
            </div>

            <div className={styles.visual404Wrap}>
              <h1 className={styles.glitch404}>500</h1>
              <div className={styles.radarRing} />
            </div>

            <h2 className={styles.heading}>
              {t('errors.boundary.headingPrefix', 'Telemetry Stream')}{' '}
              <span className={styles.goldGradient}>{t('errors.boundary.headingHighlight', 'Interrupted')}</span>
            </h2>

            <p className={styles.description}>
              {t('errors.boundary.description', 'A runtime anomaly was detected in this segment. The neural engine is attempting auto-recovery. You can retry the operation or return to the main desk.')}
            </p>

            <div className={styles.actionButtons}>
              <button
                type="button"
                className={`${styles.btn} ${styles.primaryBtn}`}
                onClick={() => reset()}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                <span>{t('errors.boundary.retry', 'RETRY CONNECTION')}</span>
              </button>

              <Link href="/dashboard" className={`${styles.btn} ${styles.secondaryBtn}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="7" height="9" x="3" y="3" rx="1" />
                  <rect width="7" height="5" x="14" y="3" rx="1" />
                  <rect width="7" height="9" x="14" y="12" rx="1" />
                  <rect width="7" height="5" x="3" y="16" rx="1" />
                </svg>
                <span>{t('errors.boundary.dashboard', 'DASHBOARD')}</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
