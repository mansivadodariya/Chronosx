'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import styles from './maintenance.module.scss';

const DEFAULT_SERVICES = [
  { id: 'ai_signal_core', name: 'AI Neural Signal Engine', status: 'Recalibrating', code: 'SYNC' },
  { id: 'chart_vision_ocr', name: 'Chart Pattern OCR Vision', status: 'Upgrading Models', code: 'UPDT' },
  { id: 'market_data_stream', name: 'Live Market Telemetry', status: 'Standby', code: 'STBY' },
  { id: 'api_gateway', name: 'Core Trading Gateway', status: 'Maintenance', code: 'MAINT' },
];

export default function MaintenancePage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [pollCountdown, setPollCountdown] = useState(15);
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [showBypassModal, setShowBypassModal] = useState(false);
  const [bypassKey, setBypassKey] = useState('');
  const [bypassError, setBypassError] = useState('');
  const [systemRecovered, setSystemRecovered] = useState(false);

  // Check health endpoint
  const checkHealth = useCallback(async (isManual = false) => {
    if (isManual) setIsChecking(true);
    try {
      const res = await fetch('/api/health?detailed=true', {
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({}));
      setLastChecked(new Date());

      if (res.ok && data.status === 'operational') {
        setSystemRecovered(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else if (data.services) {
        setServices((prev) =>
          prev.map((svc) => {
            const remote = data.services[svc.id];
            if (remote) {
              return {
                ...svc,
                status: remote.status.toUpperCase(),
                latency: remote.latencyMs,
              };
            }
            return svc;
          })
        );
      }
    } catch {
      setLastChecked(new Date());
    } finally {
      if (isManual) {
        setTimeout(() => setIsChecking(false), 500);
      }
    }
  }, [router]);

  // Periodic Auto-Polling
  useEffect(() => {
    checkHealth();
    const interval = setInterval(() => {
      setPollCountdown((prev) => {
        if (prev <= 1) {
          checkHealth();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [checkHealth]);

  const handleBypassSubmit = (e) => {
    e.preventDefault();
    if (!bypassKey.trim()) return;

    // Set bypass cookie for 1 day
    document.cookie = `maintenance_bypass=${encodeURIComponent(bypassKey)}; path=/; max-age=86400; SameSite=Lax`;
    
    // Attempt redirect
    window.location.href = `/dashboard?bypass_maintenance=${encodeURIComponent(bypassKey)}`;
  };

  return (
    <div className={styles.maintenanceContainer}>
      {/* Ambient background glows */}
      <div className={styles.ambientGlowTop} aria-hidden="true" />
      <div className={styles.ambientGlowCenter} aria-hidden="true" />
      <div className={styles.gridOverlay} aria-hidden="true" />

      {/* Top HUD Header */}
      <header className={styles.hudHeader}>
        <div className={styles.brandWrap}>
          <div className={styles.brandDot} />
          <span className={styles.brandTitle}>CHRONOS<span className={styles.goldText}>X</span> INTELLIGENCE DESK</span>
        </div>
        <div className={styles.hudRight}>
          <div className={styles.autoPingBadge}>
            <span className={styles.pingIndicator} />
            <span>AUTO-SYNC IN {pollCountdown}S</span>
          </div>
          <button
            type="button"
            className={styles.bypassTrigger}
            onClick={() => setShowBypassModal(true)}
            title="Developer / Admin Access"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>ADMIN BYPASS</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className="container">
          <motion.div
            className={styles.contentWrapper}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Live System Notice Badge */}
            <div className={styles.statusBadge}>
              <span className={styles.pulseDot} />
              <span>
                {systemRecovered
                  ? t('maintenance.systemRestored', 'SYSTEM ONLINE • REDIRECTING...')
                  : t('maintenance.systemRecalibration', 'SYSTEM RECALIBRATION IN PROGRESS • HTTP 503')}
              </span>
            </div>

            {/* Futuristic Telemetry Visual */}
            <div className={styles.visualHudWrap}>
              <div className={styles.radarRing} />
              <div className={styles.radarRingOuter} />
              <div className={styles.hudIconBox}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  <circle cx="12" cy="12" r="3" stroke="#18C98B" />
                </svg>
              </div>
            </div>

            {/* Headings */}
            <h1 className={styles.heading}>
              {t('maintenance.titlePrefix', 'Upgrading Neural')}{' '}
              <span className={styles.goldGradient}>{t('maintenance.titleHighlight', 'Trading Infrastructure')}</span>
            </h1>

            <p className={styles.description}>
              {t(
                'maintenance.desc',
                'We are deploying high-frequency model updates and database synchronizations to ensure zero-latency execution and optimal pattern recognition.'
              )}
            </p>

            {/* Manual Refresh / Connection Check Button */}
            <div className={styles.actionControls}>
              <button
                type="button"
                className={styles.btn}
                onClick={() => checkHealth(true)}
                disabled={isChecking || systemRecovered}
              >
                <svg
                  className={isChecking ? styles.spinIcon : ''}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                <span>{isChecking ? 'TESTING SERVER...' : 'CHECK STATUS NOW'}</span>
              </button>
            </div>

            {/* Services Telemetry Grid */}
            <div className={styles.telemetryCard}>
              <div className={styles.telemetryHeader}>
                <span className={styles.cardTitle}>SUBSYSTEM HEALTH TELEMETRY</span>
                <span className={styles.lastUpdated}>
                  LAST PING: {lastChecked ? lastChecked.toLocaleTimeString() : 'INITIALIZING...'}
                </span>
              </div>

              <div className={styles.servicesGrid}>
                {services.map((svc) => (
                  <div key={svc.id} className={styles.serviceItem}>
                    <div className={styles.serviceMeta}>
                      <span className={styles.serviceName}>{svc.name}</span>
                      <span className={styles.serviceCode}>[{svc.code}]</span>
                    </div>
                    <div className={styles.serviceStatus}>
                      <span className={styles.statusIndicator} />
                      <span>{svc.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Communication & Support Channels */}
            <div className={styles.supportChannels}>
              <span className={styles.supportLabel}>LIVE STATUS & COMMUNITY UPDATES:</span>
              <div className={styles.channelLinks}>
                <a href="https://t.me/chronosx" target="_blank" rel="noopener noreferrer" className={styles.channelLink}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.313 4.674c.458 0 .66-.21.916-.458l2.199-2.138 4.573 3.378c.843.464 1.448.225 1.658-.783l2.997-14.128c.307-1.232-.47-1.79-1.206-1.491z" />
                  </svg>
                  <span>TELEGRAM DESK</span>
                </a>
                <a href="https://discord.gg/chronosx" target="_blank" rel="noopener noreferrer" className={styles.channelLink}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z" />
                  </svg>
                  <span>DISCORD HQ</span>
                </a>
                <a href="mailto:support@chronosx.com" className={styles.channelLink}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span>SUPPORT DESK</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Admin Bypass Passcode Modal */}
      <AnimatePresence>
        {showBypassModal && (
          <div className={styles.modalBackdrop} onClick={() => setShowBypassModal(false)}>
            <motion.div
              className={styles.modalCard}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className={styles.modalHeader}>
                <h3>ADMIN & DEVELOPER BYPASS</h3>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => setShowBypassModal(false)}
                >
                  ✕
                </button>
              </div>

              <p className={styles.modalSubtitle}>
                Enter your platform bypass authorization token to access the live environment during maintenance.
              </p>

              <form onSubmit={handleBypassSubmit} className={styles.modalForm}>
                <div className={styles.inputGroup}>
                  <input
                    type="password"
                    placeholder="Enter bypass authorization key..."
                    value={bypassKey}
                    onChange={(e) => {
                      setBypassKey(e.target.value);
                      setBypassError('');
                    }}
                    autoFocus
                  />
                </div>
                {bypassError && <div className={styles.modalError}>{bypassError}</div>}
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowBypassModal(false)}
                  >
                    CANCEL
                  </button>
                  <button type="submit" className={styles.submitBtn}>
                    AUTHENTICATE & ENTER
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
