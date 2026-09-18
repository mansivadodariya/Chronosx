"use client";
import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './howitWorks.module.scss';
import Link from 'next/link';
import SectionHeader from '@/components/sectionHeader';
const steps = [
  {
    step: '01',
    label: 'Creating account',
    icon: '01',
    title: 'Create Account',
  },
  {
    step: '02',
    label: 'Linking Top Brokers',
    icon: '02',
    title: 'Link Top Brokers',
  },
  {
    step: '03',
    label: 'Scanning market structure',
    icon: '03',
    title: 'Ask the AI',
  },
  {
    step: '04',
    label: 'Replenishing credits',
    icon: '04',
    title: 'Trade & Replenish',
  }
];

export default function HowitWorks() {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);
  const [isIntro, setIsIntro] = useState(true);
  // Phase 1 (intro label) → Phase 2 (simulation) after 1.4s

  useEffect(() => {
    setIsIntro(true);
    const t = setTimeout(() => setIsIntro(false), 1400);
    return () => clearTimeout(t);
  }, [activeStep]);

  // Auto-cycle every 6.5s
  useEffect(() => {
    const t = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 6500);
    return () => clearInterval(t);
  }, []);

  const current = steps[activeStep];

  return (
    <section className={styles.howitWorks} aria-label="How ChronosX Works">
      <div className="container">
        <div className={styles.row}>

          {/* ── LEFT: Text ── */}
          <div className={styles.left}>
            <SectionHeader
              align="left"
              badge="MT5 BROKER INTEGRATION"
              title1="Trade Your Edge."
              title2="Earn Credits. Never Pay for AI."
              description="Every trade you execute automatically refills your AI analysis credits—giving you unlimited access to institutional market scans, signals, and strategy playbooks for free."
            />

            <Link href="/signup" className={styles.cta}>
              Get Started Free <span>&rarr;</span>
            </Link>

            {/* Step dots indicator */}
            <div className={styles.dots}>
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`${styles.dot} ${activeStep === i ? styles.dotActive : ''}`}
                />
              ))}
            </div>
          </div>

          {/* ── RIGHT: TV Screen ── */}
          <div className={styles.right}>
            <div className={styles.tvBox}>
              <AnimatePresence mode="wait">

                {/* Phase 1 — Minimal intro label (LuxAlgo black screen style) */}
                {isIntro ? (
                  <motion.div
                    key={`intro-${activeStep}`}
                    className={styles.introState}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.06 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className={styles.introIcon}>{current.icon}</span>
                    <span className={styles.introLabel}>{current.label}</span>
                  </motion.div>
                ) : (

                  /* Phase 2 — Live simulation */
                  <motion.div
                    key={`sim-${activeStep}`}
                    className={styles.simState}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >

                    {/* ── SCREEN 01 ── */}
                    {activeStep === 0 && (
                      <div className={styles.sim}>
                        <div className={styles.simHead}>
                          <span className={styles.numTag}>01</span>
                          <span className={styles.simTitle}>Create Free Account</span>
                          <span className={styles.statusGreen}>● ACTIVE</span>
                        </div>
                        <div className={styles.form}>
                          <div className={styles.lbl}>EMAIL ADDRESS</div>
                          <div className={styles.input}>
                            <span>trader@institutional.com</span>
                            <span className={styles.cursor}>|</span>
                          </div>
                          <div className={styles.btn}>
                            <span>INITIALIZE AI WORKSPACE</span>
                            <span>&rarr;</span>
                          </div>
                        </div>
                        <div className={styles.alert}>
                          <div className={styles.check}>✓</div>
                          <div>
                            <strong>Instant Email Verification</strong>
                            <span className={styles.alertSub}>+10 Welcome Starter Credits Claimed</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── SCREEN 02 ── */}
                    {activeStep === 1 && (
                      <div className={styles.sim}>
                        <div className={styles.simHead}>
                          <span className={styles.numTag}>02</span>
                          <span className={styles.simTitle}>Link MT5 Broker Account</span>
                          <span className={styles.statusGreen}>● BRIDGE SYNCED</span>
                        </div>
                        <div className={styles.brokerRow}>
                          <div className={styles.brokerLogo}>TB</div>
                          <div>
                            <h4>TOP BROKERS</h4>
                            <p>Server: MT5-LiveBridge01</p>
                          </div>
                        </div>
                        <div className={styles.mt5Row}>
                          <span>MT5 ID:</span>
                          <strong>12849021 (Authenticated)</strong>
                          <span>🔒</span>
                        </div>
                        <div className={styles.reward}>
                          <span className={styles.star}>✦</span>
                          <div>
                            <strong>+50 AI CREDITS UNLOCKED</strong>
                            <p>Direct MT5 Bridge Sync &middot; Auto-Refill on Completed Trades</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── SCREEN 03 ── */}
                    {activeStep === 2 && (
                      <div className={styles.sim}>
                        <div className={styles.simHead}>
                          <span className={styles.numTag}>03</span>
                          <span className={styles.simTitle}>TradeSnap AI &middot; XAU/USD</span>
                          <span className={styles.signal}>▲ BUY SIGNAL</span>
                        </div>
                        <div className={styles.chart}>
                          <div className={styles.sessions}>
                            <span>London</span>
                            <span>New York</span>
                          </div>
                          <div className={styles.sessionZone} />
                          <div className={styles.laser} />
                          <div className={styles.candles}>
                            {[32, 22, 48, 64, 30, 78, 96, 45, 60, 38, 82, 55].map((h, i) => (
                              <div
                                key={i}
                                className={`${styles.candle} ${i % 3 === 1 ? styles.red : styles.green}`}
                                style={{ height: `${h}px` }}
                              />
                            ))}
                          </div>
                          <div className={styles.callouts}>
                            <span className={styles.tp}>TP: $2,764.50 (+1.8%)</span>
                            <span className={styles.sl}>SL: $2,741.00 (-0.8%)</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── SCREEN 04 ── */}
                    {activeStep === 3 && (
                      <div className={styles.sim}>
                        <div className={styles.simHead}>
                          <span className={styles.numTag}>04</span>
                          <span className={styles.simTitle}>Perpetual Credit Engine</span>
                          <span className={styles.statusGold}>● LIFETIME LOOP</span>
                        </div>
                        <div className={styles.loop}>
                          <div className={styles.ring1} />
                          <div className={styles.ring2} />
                          <div className={styles.loopCenter}>
                            <span className={styles.loopIcon}>⟳</span>
                            <span className={styles.loopNum}>+50</span>
                            <span className={styles.loopLabel}>CREDITS REFRESHED</span>
                          </div>
                        </div>
                        <div className={styles.meta}>
                          <div className={styles.metaRow}>
                            <span>Trade Execution:</span>
                            <strong className={styles.green}>Verified on Top Brokers MT5</strong>
                          </div>
                          <div className={styles.metaRow}>
                            <span>Credit Top-Up:</span>
                            <strong className={styles.gold}>Free Instant Refill (+50)</strong>
                          </div>
                        </div>
                      </div>
                    )}

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
