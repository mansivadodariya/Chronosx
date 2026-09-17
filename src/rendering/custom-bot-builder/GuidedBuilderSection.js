"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from '@/components/sectionHeader';
import styles from './customBotBuilder.module.scss';

const NoCodeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const ControlIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
  </svg>
);

const FullConfigIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const BacktestIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const WIZARD_STEPS = [
  { id: 1, name: "Basics" },
  { id: 2, name: "Entry Rules" },
  { id: 3, name: "Exit Rules" },
  { id: 4, name: "Risk" },
  { id: 5, name: "Review" }
];

export default function GuidedBuilderSection({ refProp }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    botName: "My Scalper Bot",
    description: "High-frequency EMA trend scalper with RSI confirmation",
    pair: "EUR/USD",
    timeframe: "H1",
    indicator: "EMA 20 & EMA 50",
    condition: "Crossover + RSI > 50",
    stopLoss: "20 pips",
    takeProfit: "40 pips",
    riskPercent: "1.0%"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  return (
    <section ref={refProp} className={styles.guidedBuilderSection}>
      <div className="container">
        <SectionHeader
          badge="CUSTOM BOT BUILDER"
          title1="Build Your Bot. Your Rules."
          title2="Your Complete Control."
          description="Prefer a more structured approach? Use the guided bot builder to configure your bot step-by-step — from the initial setup to risk management and final review."
        />

        <div className={styles.guidedWizardContainer}>
          {/* Progress Bar */}
          <div className={styles.wizardProgressBar}>
            {WIZARD_STEPS.map((step) => (
              <div
                key={step.id}
                className={`${styles.stepProgressNode} ${
                  currentStep === step.id ? styles.activeNode : ''
                } ${currentStep > step.id ? styles.completedNode : ''}`}
                onClick={() => setCurrentStep(step.id)}
              >
                <div className={styles.nodeCircle}>
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                <span className={styles.nodeLabel}>{step.name}</span>
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div className={styles.wizardFormCard}>
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.stepHeaderTitle}>Step 1 of 5 — Start With the Essentials</div>
                  <div className={styles.stepHeaderSub}>Define the basic information your bot needs before adding trading logic.</div>

                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Bot Name</label>
                      <input
                        type="text"
                        name="botName"
                        value={formData.botName}
                        onChange={handleChange}
                        placeholder="e.g. My Scalper Bot"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Trading Pair</label>
                      <select name="pair" value={formData.pair} onChange={handleChange}>
                        <option value="EUR/USD">EUR/USD</option>
                        <option value="GBP/USD">GBP/USD</option>
                        <option value="XAU/USD">XAU/USD (Gold)</option>
                        <option value="BTC/USD">BTC/USD</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Timeframe</label>
                      <select name="timeframe" value={formData.timeframe} onChange={handleChange}>
                        <option value="M5">5 Minutes (M5)</option>
                        <option value="M15">15 Minutes (M15)</option>
                        <option value="H1">1 Hour (H1)</option>
                        <option value="H4">4 Hours (H4)</option>
                      </select>
                    </div>
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <label>Description</label>
                      <textarea
                        name="description"
                        rows="2"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe what this bot does..."
                      />
                    </div>
                  </div>
                  <p style={{ marginTop: 16, fontSize: '0.85rem', color: '#18C98B' }}>
                    💡 Your bot will monitor {formData.pair} on the {formData.timeframe} timeframe.
                  </p>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.stepHeaderTitle}>Step 2 of 5 — Entry Rules</div>
                  <div className={styles.stepHeaderSub}>Define exactly when your bot should enter a trade based on your selected conditions.</div>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Primary Indicator</label>
                      <input type="text" name="indicator" value={formData.indicator} onChange={handleChange} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Entry Condition</label>
                      <input type="text" name="condition" value={formData.condition} onChange={handleChange} />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.stepHeaderTitle}>Step 3 of 5 — Exit Rules</div>
                  <div className={styles.stepHeaderSub}>Configure when the bot should close a trade, including SL, TP, and trailing exits.</div>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Stop-Loss (SL)</label>
                      <input type="text" name="stopLoss" value={formData.stopLoss} onChange={handleChange} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Take-Profit (TP)</label>
                      <input type="text" name="takeProfit" value={formData.takeProfit} onChange={handleChange} />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.stepHeaderTitle}>Step 4 of 5 — Risk Management</div>
                  <div className={styles.stepHeaderSub}>Define how much risk your bot should take and position exposure controls.</div>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Risk Per Trade (%)</label>
                      <input type="text" name="riskPercent" value={formData.riskPercent} onChange={handleChange} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Max Open Trades</label>
                      <input type="number" defaultValue={2} min={1} max={10} />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.stepHeaderTitle}>Step 5 of 5 — Review Bot Configuration</div>
                  <div className={styles.stepHeaderSub}>Review your complete bot configuration before creating the final setup.</div>
                  <div style={{ background: 'rgba(24, 201, 139, 0.1)', padding: 20, borderRadius: 12, border: '1px solid rgba(24, 201, 139, 0.3)' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: '#18C98B' }}>🤖 {formData.botName}</p>
                    <p style={{ margin: '8px 0', fontSize: '0.9rem' }}>{formData.description}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 12, fontSize: '0.85rem' }}>
                      <div>Pair: <strong>{formData.pair}</strong></div>
                      <div>Timeframe: <strong>{formData.timeframe}</strong></div>
                      <div>Entry: <strong>{formData.indicator} ({formData.condition})</strong></div>
                      <div>SL / TP: <strong>{formData.stopLoss} / {formData.takeProfit}</strong></div>
                      <div>Risk: <strong>{formData.riskPercent}</strong></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={styles.wizardActionsRow} style={{ marginTop: 24 }}>
              <button
                className={styles.heroSecondaryBtn}
                onClick={handlePrev}
                disabled={currentStep === 1}
                style={{ opacity: currentStep === 1 ? 0.4 : 1, cursor: currentStep === 1 ? 'not-allowed' : 'pointer' }}
              >
                ← PREVIOUS
              </button>
              <button className={styles.heroPrimaryBtn} onClick={handleNext}>
                {currentStep === 5 ? 'CREATE & BACKTEST →' : 'NEXT →'}
              </button>
            </div>
          </div>

          {/* 4 Feature Cards */}
          <div className={styles.guidedFeaturesGrid}>
            <div className={styles.guidedFeatureCard}>
              <div className={styles.cardIcon}><NoCodeIcon /></div>
              <h4 className={styles.cardTitle}>No Coding Required</h4>
              <p className={styles.cardDesc}>Build your trading bot through a structured visual workflow without writing complex code.</p>
            </div>
            <div className={styles.guidedFeatureCard}>
              <div className={styles.cardIcon}><ControlIcon /></div>
              <h4 className={styles.cardTitle}>Set Your Own Rules</h4>
              <p className={styles.cardDesc}>Customize conditions, indicators, entries, exits, and risk parameters to match your style.</p>
            </div>
            <div className={styles.guidedFeatureCard}>
              <div className={styles.cardIcon}><FullConfigIcon /></div>
              <h4 className={styles.cardTitle}>Complete Configuration</h4>
              <p className={styles.cardDesc}>Build your strategy from the foundation up with supported configuration options.</p>
            </div>
            <div className={styles.guidedFeatureCard}>
              <div className={styles.cardIcon}><BacktestIcon /></div>
              <h4 className={styles.cardTitle}>Ready for Backtest</h4>
              <p className={styles.cardDesc}>Once your bot is created, send it directly into ChronosX Backtesting for validation.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
