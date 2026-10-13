'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import styles from './not-found.module.scss';

export default function ErrorBoundary({ error, reset }) {
  const { t } = useLanguage();

  useEffect(() => {
    console.error('ChronosX Segment Error caught:', error);

    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('Failed to fetch dynamically imported module');

    if (isChunkError && typeof window !== 'undefined') {
      const retryKey = 'chunk_err_retry_' + window.location.pathname;
      const lastRetry = sessionStorage.getItem(retryKey);
      const now = Date.now();
      if (!lastRetry || now - Number(lastRetry) > 10000) {
        sessionStorage.setItem(retryKey, String(now));
        window.location.reload();
      }
    }
  }, [error]);

  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    } else {
      reset();
    }
  };

  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.ambientGlowTop} aria-hidden="true" />
      <div className={styles.ambientGlowCenter} aria-hidden="true" />
      <div className={styles.gridOverlay} aria-hidden="true" />

      <main className={styles.mainContent}>
        <div className="container">
          <div className={styles.contentWrapper}>
            <div className={styles.syncStatusTag}>
              <span className={styles.pulseDotGreen} />
              <span>{t('errors.boundary.tag', 'AUTO-RECONNECTING • LIVE SYNC')}</span>
            </div>

            <div className={styles.reconnectVisualWrap} aria-hidden="true">
              <div className={styles.pulseWave} />
              <div className={styles.radarRingOuter} />
              <div className={styles.radarRingInner} />
              <div className={styles.reconnectOrbCore}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                </svg>
              </div>
            </div>

            <h2 className={styles.heading}>
              {t('errors.boundary.headingPrefix', 'We Will')}{' '}
              <span className={styles.goldGradient}>{t('errors.boundary.headingHighlight', 'Connect Soon')}</span>
            </h2>

            <p className={styles.description}>
              {t('errors.boundary.description', 'Establishing a secure connection with the live telemetry engine. Your session and settings are safely preserved. You can retry connection or return to your main desk.')}
            </p>

            <div className={styles.actionButtons}>
              <button
                type="button"
                className={`${styles.btn} ${styles.primaryBtn}`}
                onClick={handleRetry}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
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
