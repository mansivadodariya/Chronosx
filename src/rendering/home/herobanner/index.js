"use client";
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { authNavigate } from '@/lib/authRedirect';
import styles from './herobanner.module.scss';
import Button from '@/components/button';
import SideRays from '@/components/sideRays';
import CountUp from '@/components/countUp';

import NetworkCircuitChart from '@/components/networkCircuitChart';

const RightArrow = '/assets/icons/right.svg';

const metrics = [
  { target: 50, suffix: '+', decimals: 0, label: 'Global Market Pairs', sub: 'Forex, Indices & Metals' },
  { target: 300, prefix: '< ', suffix: 'ms', decimals: 0, label: 'AI Processing Speed', sub: 'Sub-second neural pattern analysis' },
  { target: 6, suffix: ' Timeframes', decimals: 0, label: 'Multi-TF Confluence', sub: 'From 1-minute scalping to daily swings' },
  { target: 99.9, suffix: '%', decimals: 1, label: 'Platform Availability', sub: '24/7 continuous market telemetry' }
];

export default function Herobanner() {
  const router = useRouter();
  const sectionRef = useRef(null);
  const [mousePos, setMousePos] = React.useState({ x: 50, y: 50, isHovered: false });

  // Scroll Progress Driven Motion Animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  // As user scrolls and 2nd section overlays:
  // - Hero content smoothly scales down slightly (1 -> 0.90)
  // - Hero content opacity recedes (1 -> 0.3)
  // - Hero content translates Y (0 -> 70px) for 3D depth parallax
  const heroScale = useTransform(scrollYProgress, [0, 0.9], [1, 0.90]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.3]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.2]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y, isHovered: true });
  };

  const handleMouseLeave = () => {
    setMousePos(prev => ({ ...prev, isHovered: false }));
  };

  return (
    <section
      ref={sectionRef}
      className={styles.herobanner}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* High-Tech Ambient Atmosphere & Glow Layers wrapped in Motion Div for scroll fade */}
      <motion.div style={{ opacity: bgOpacity }} className={styles.scrollBgWrapper}>
        <div className={styles.ambientGlowTop} aria-hidden="true" />
        <div className={styles.ambientGlowCenter} aria-hidden="true" />
        <div className={styles.ambientGlowBottom} aria-hidden="true" />

        {/* Interactive Cursor Spotlight Glow */}
        <div
          className={styles.interactiveSpotlight}
          style={{
            left: `${mousePos.x}%`,
            top: `${mousePos.y}%`,
            opacity: mousePos.isHovered ? 1 : 0
          }}
          aria-hidden="true"
        />

        <div className={styles.gridOverlay} aria-hidden="true" />

        {/* Localized Green Grid Spotlight (Small, tight area around pointer) */}
        <div
          className={styles.greenSpotlightGrid}
          style={{
            opacity: mousePos.isHovered ? 1 : 0,
            WebkitMaskImage: `radial-gradient(circle 120px at ${mousePos.x}% ${mousePos.y}%, #000 0%, transparent 100%)`,
            maskImage: `radial-gradient(circle 120px at ${mousePos.x}% ${mousePos.y}%, #000 0%, transparent 100%)`
          }}
          aria-hidden="true"
        />

        <div className={styles.radialVignette} aria-hidden="true" />

        {/* Modern High-Tech Ambient Atmosphere & Animations for Mobile */}
        <div className={styles.mobileTechAtmosphere} aria-hidden="true">
          <div className={styles.mobileQuantumHalo} />
          <div className={styles.mobileLaserScan} />
          <div className={styles.mobileConstellation}>
            <span className={`${styles.particleDot} ${styles.pDot1}`} />
            <span className={`${styles.particleDot} ${styles.pDot2}`} />
            <span className={`${styles.particleDot} ${styles.pDot3}`} />
            <span className={`${styles.particleDot} ${styles.pDot4}`} />
            <span className={`${styles.particleDot} ${styles.pDot5}`} />
          </div>
        </div>
      </motion.div>

      {/* Main Motion Div Content Container with Scroll Scaling, Opacity, and Parallax */}
      <motion.div
        className="container"
        style={{
          scale: heroScale,
          opacity: heroOpacity,
          y: heroY
        }}
      >
        <div className={styles.heroWrapper}>

          {/* 1. Pill Badge */}
          <motion.div
            className={styles.topBadgeRow}
            initial={{ opacity: 0, y: -20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.badge} onClick={() => authNavigate(router, '/dashboard')}>
              <span className={styles.badgeText}>

                Next-Gen AI Algorithmic Trading Terminal
              </span>
            </div>
          </motion.div>

          {/* 2. Bold High-Impact Headline */}
          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Trade Smarter With <br />
            <span className={styles.greenGradient}>AI That Never Sleeps</span>
          </motion.h1>

          {/* 3. Subheadline */}
          <motion.p
            className={styles.heroDesc}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            Real-time institutional-grade AI signals, multi-timeframe pattern recognition, and precision trade setups engineered for professional Forex traders.
          </motion.p>

          {/* 4. Action Buttons */}
          <motion.div
            className={styles.actionsGroup}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Button
              text="GET STARTED"
              icon={RightArrow}
              onClick={() => authNavigate(router, '/dashboard')}
            />
          </motion.div>

          {/* 5. Main Animated Network Circuit Diagram Showcase */}
          <motion.div
            className={styles.circuitShowcaseRow}
            initial={{ opacity: 0, y: 35, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <NetworkCircuitChart />
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
}
