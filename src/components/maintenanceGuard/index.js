'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useLanguage } from '@/context/LanguageContext';
import styles from './maintenanceGuard.module.scss';

export default function MaintenanceGuard() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [pollCountdown, setPollCountdown] = useState(15);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const { t } = useLanguage();
  const containerRef = useRef(null);

  const evaluateMaintenance = (rawVal) => {
    if (rawVal === undefined || rawVal === null) return false;
    const s = String(rawVal).trim().toLowerCase();
    if (s === 'true' || s === '1' || s === 'on') return true;
    if (s.includes('"is_enabled":true') || s.includes('"is_enabled": true')) return true;
    return false;
  };

  const fetchStatus = useCallback(async () => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'maintenance_mode')
          .single();

        if (!error && data) {
          setIsMaintenance(evaluateMaintenance(data.value));
        }
      }
    } catch (_) {}
  }, []);

  // 1. Initial status fetch & Supabase Realtime Listener (instant sync without refresh)
  useEffect(() => {
    fetchStatus();

    if (!supabase) return;

    let channel = null;
    try {
      channel = supabase
        .channel('realtime:global_maintenance_guard')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'system_settings' },
          (payload) => {
            const row = payload?.new;
            if (row && (row.key === 'maintenance_mode' || row.key === undefined)) {
              const active = evaluateMaintenance(row.value);
              setIsMaintenance(active);
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('[MaintenanceGuard] Realtime error:', err);
    }

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchStatus]);

  // 2. Periodic background verification
  useEffect(() => {
    const interval = setInterval(() => {
      setPollCountdown((prev) => {
        if (prev <= 1) {
          fetchStatus();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchStatus]);

  // 3. Pointer Glow Mouse Move Tracker
  const handleMouseMove = useCallback((e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleManualCheck = async () => {
    setIsChecking(true);
    await fetchStatus();
    setTimeout(() => setIsChecking(false), 600);
  };

  // Lock body scroll when maintenance is active
  useEffect(() => {
    if (isMaintenance) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isMaintenance]);

  if (!isMaintenance) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        className={styles.guardOverlay}
        onMouseMove={handleMouseMove}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Interactive Pointer Glow Spotlight */}
        <div
          className={styles.pointerGlow}
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
          }}
          aria-hidden="true"
        />

        {/* Ambient Background Lights */}
        <div className={styles.ambientGlowTop} aria-hidden="true" />
        <div className={styles.ambientGlowCenter} aria-hidden="true" />
        <div className={styles.gridOverlay} aria-hidden="true" />

        <div className={styles.fullPageContent}>
          {/* Brand Logo */}
          <div className={styles.logoRow}>
            <Image
              src="/assets/logo/logo.png"
              alt="ChronosX"
              width={190}
              height={44}
              priority
              className={styles.brandLogo}
            />
          </div>

          {/* Construction Icon with Emerald Pulse */}
          <div className={styles.heroVisualWrap}>
            <div className={styles.pulseRingWave} />
            <div className={styles.radarRing1} />
            <div className={styles.radarRing2} />
            
            <div className={styles.coreReactor}>
              <Image
                src="/assets/images/construction.png"
                alt="Under Maintenance"
                width={56}
                height={56}
                priority
                className={styles.constructionIcon}
              />
            </div>
          </div>

          {/* Big Impressive Heading: Under Maintenance */}
          <h1 className={styles.bigHeading}>
            {t('maintenance.titlePrefix', 'Under')}{' '}
            <span className={styles.emeraldGradient}>
              {t('maintenance.titleHighlight', 'Maintenance')}
            </span>
          </h1>

          {/* Reassuring Subtitle */}
          <p className={styles.subtext}>
            {t(
              'maintenance.desc',
              'We are deploying high-frequency model updates and database synchronizations to ensure zero-latency execution and optimal pattern recognition. All trading terminals and features will resume automatically.'
            )}
          </p>

          {/* Action Control Button */}
          <div className={styles.actionWrap}>
            <button
              type="button"
              className={styles.statusBtn}
              onClick={handleManualCheck}
              disabled={isChecking}
            >
              <svg
                className={isChecking ? styles.spinIcon : ''}
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>{isChecking ? 'CHECKING CONNECTIVITY...' : 'CHECK STATUS NOW'}</span>
            </button>
          </div>

          {/* Auto Sync Timer */}
          <div className={styles.autoSyncRow}>
            <span className={styles.syncPulseDot} />
            <span>Automatic reconnection check in {pollCountdown}s</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
