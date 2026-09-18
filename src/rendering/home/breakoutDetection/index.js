"use client";
import { useLanguage } from '@/context/LanguageContext';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './breakoutDetection.module.scss';
import SectionHeader from '@/components/sectionHeader';

const stepsData = [
  {
    step: '01',
    title: 'Track the Key Level.',
    desc: 'ChronosX continuously maps key multi-day resistance and liquidity pools. Real-time telemetry detects when price approaches major decision zones.',
    ticker: 'XAU/USD · Bullish Momentum',
    status: 'APPROACHING RESISTANCE',
    stage: 1
  },
  {
    step: '02',
    title: 'Institutional Volume Break.',
    desc: 'When price breaks resistance backed by an institutional volume surge, the AI confirms order-flow strength and elevates the conviction score to High Bullish.',
    ticker: 'XAU/USD · Breakout Confirmed',
    status: 'BREAKOUT CONFIRMED · HIGH CONVICTION',
    stage: 2
  },
  {
    step: '03',
    title: 'Instant Signal Dispatch.',
    desc: 'A verified signal trigger hits your terminal and phone the exact millisecond the candle closes. By the time the rest of the market notices the news, you’re already in position.',
    ticker: 'XAU/USD · Signal Active',
    status: 'BREAKOUT CONFIRMED · HIGH CONVICTION',
    stage: 3
  }
];

export default function BreakoutDetection() {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef(null);
  const stepRefs = useRef([]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        ticking = false;
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Skip if way offscreen
        if (rect.bottom < 0 || rect.top > windowHeight) return;

        // 1. Initial Scroll Lock: If section is above or just entering the viewport, stay strictly on Step 01
        const stickyThreshold = windowHeight * 0.15;
        if (rect.top > stickyThreshold) {
          setActiveStep(0);
          return;
        }

        // 2. Trigger point: Center of viewport
        const triggerLine = windowHeight * 0.50;

        const step2El = stepRefs.current[1];
        const step3El = stepRefs.current[2];

        if (step3El && step3El.getBoundingClientRect().top <= triggerLine) {
          setActiveStep(2);
        } else if (step2El && step2El.getBoundingClientRect().top <= triggerLine) {
          setActiveStep(1);
        } else {
          setActiveStep(0);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStepClick = (index) => {
    setActiveStep(index);
    if (stepRefs.current[index]) {
      stepRefs.current[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const currentStep = stepsData[activeStep];

  return (
    <section className={styles.breakoutSection} ref={containerRef} aria-label="Breakout Detection Section">
      {/* Background ambient lighting */}
      <div className={styles.ambientGlow} aria-hidden="true" />

      <div className="container">
        <div className={styles.mainLayout}>
          
          {/* Left Column: Pinned Sticky Container with Heading & Interactive Chart */}
          <div className={styles.stickyColumn}>
            <div className={styles.stickyContent}>
              <SectionHeader
                align="left"
                badge="REAL-TIME BREAKOUT DETECTION"
                title1="Catch the Move the"
                title2="Second it Happens."
                description="Follow an institutional setup from early approach to volume validation and instant signal dispatch in real time."
              />

              {/* Pinned Interactive Chart Card */}
              <div className={styles.chartCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.tickerTag}>
                    <span className={styles.liveGreenDot} />
                    {currentStep.ticker}
                  </div>
                  <div className={`${styles.statusTag} ${activeStep >= 1 ? styles.statusBroken : ''}`}>
                    {currentStep.status}
                  </div>
                </div>

                {/* SVG Real-time Candle & Trajectory Graphic */}
                <div className={styles.svgWrapper}>
                  <svg viewBox="0 0 580 290" xmlns="http://www.w3.org/2000/svg" className={styles.chartSvg}>
                    <defs>
                      <linearGradient id="goldLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#18c98b" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#6EE7B7" stopOpacity="1" />
                      </linearGradient>

                      <linearGradient id="baseLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#18c98b" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.85" />
                      </linearGradient>

                      <linearGradient id="glowAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#18c98b" stopOpacity="0.25" />
                        <stop offset="60%" stopColor="#18c98b" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#18c98b" stopOpacity="0" />
                      </linearGradient>

                      <linearGradient id="baseAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#18c98b" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#18c98b" stopOpacity="0" />
                      </linearGradient>

                      <radialGradient id="pointGlowHalo" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                        <stop offset="40%" stopColor="#6EE7B7" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#18c98b" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Subtle Horizontal Grid lines */}
                    <line x1="20" y1="240" x2="560" y2="240" stroke="rgba(24, 201, 139, 0.08)" strokeWidth="1" />
                    <line x1="20" y1="125" x2="560" y2="125" stroke="rgba(24, 201, 139, 0.08)" strokeWidth="1" />

                    {/* Dashed Resistance Line */}
                    <g className={styles.resistanceLineGroup}>
                      <line 
                        x1="20" 
                        y1="180" 
                        x2="480" 
                        y2="180" 
                        className={`${styles.resistanceLine} ${activeStep >= 1 ? styles.resistanceBroken : ''}`}
                      />
                      <text x="555" y="183" textAnchor="end" className={styles.resistanceLabel}>
                        {activeStep >= 1 ? 'SUPPORT' : 'KEY RESISTANCE'}
                      </text>
                    </g>

                    {/* Approach Path Segment (Stage 1 base) */}
                    <path
                      d="M 25 248 L 58 256 L 95 232 L 132 245 L 170 220 L 208 234 L 246 205 L 284 218 L 322 190 L 365 180"
                      className={styles.basePathLine}
                    />

                    {/* Base Area Fill */}
                    <path
                      d="M 25 248 L 58 256 L 95 232 L 132 245 L 170 220 L 208 234 L 246 205 L 284 218 L 322 190 L 365 180 L 365 280 L 25 280 Z"
                      fill="url(#baseAreaGrad)"
                    />

                    {/* Stage 1 Tip Dot with radar beacon */}
                    {activeStep === 0 && (
                      <g className={styles.tipDotGroup}>
                        <circle cx="365" cy="180" r="9" className={styles.sonarRing} />
                        <circle cx="365" cy="180" r="4" fill="#13f9d3ff" />
                        <circle cx="365" cy="180" r="1.8" fill="#00ffaeff" />
                      </g>
                    )}

                    {/* Stage 2 & 3 Breakout Line Extension & Glowing Area */}
                    {activeStep >= 1 && (
                      <g className={styles.breakoutGraphic}>
                        {/* Golden Area Under Breakout */}
                        <motion.path
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          d={
                            activeStep === 1
                              ? "M 365 180 Q 395 180 445 132 L 525 75 L 525 280 L 365 280 Z"
                              : "M 365 180 Q 395 180 445 132 L 535 62 L 535 280 L 365 280 Z"
                          }
                          fill="url(#glowAreaGrad)"
                        />

                        {/* Breakout Surge Curve */}
                        <motion.path
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                          d={
                            activeStep === 1
                              ? "M 365 180 Q 395 180 445 132 L 525 75"
                              : "M 365 180 Q 395 180 445 132 L 535 62"
                          }
                          className={styles.breakoutLine}
                        />

                        {/* Breakout Point Indicator */}
                        <circle cx="365" cy="180" r="12" className={styles.breakoutSonar} />
                        <circle cx="365" cy="180" r="5" fill="none" stroke="#FFFFFF" strokeWidth="1.6" />
                        <circle cx="365" cy="180" r="2.8" fill="#14ffccff" />

                        {/* Current Price Tip Dot */}
                        <circle 
                          cx={activeStep === 1 ? "525" : "535"} 
                          cy={activeStep === 1 ? "75" : "62"} 
                          r="5.5" 
                          fill="url(#pointGlowHalo)" 
                        />
                      </g>
                    )}
                  </svg>

                  {/* Stage 3 Breakout Toast Alert Card */}
                  <AnimatePresence>
                    {activeStep === 2 && (
                      <motion.div 
                        className={styles.toastCard}
                        initial={{ opacity: 0, scale: 0.9, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className={styles.toastTopRow}>
                          <span className={styles.toastBadge}>RESISTANCE BREAK</span>
                          <span className={styles.toastTime}>JUST NOW</span>
                        </div>
                        <div className={styles.toastMainTitle}>
                          XAU/USD
                        </div>
                        <div className={styles.toastSubtitle}>
                          Resistance Break Confirmed
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative Steps that scroll past while left side pins */}
          <div className={styles.scrollingColumn}>
            {stepsData.map((item, index) => {
              const isActive = activeStep === index;
              return (
                <div
                  key={index}
                  ref={(el) => (stepRefs.current[index] = el)}
                  className={`${styles.stepBlock} ${isActive ? styles.stepActive : ''}`}
                  onClick={() => handleStepClick(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleStepClick(index)}
                >
                  <div className={styles.stepHeader}>
                    <div className={styles.numberBadge}>
                      {item.step}
                    </div>
                    <h3>{item.title}</h3>
                  </div>
                  <p className={styles.stepDesc}>{item.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
