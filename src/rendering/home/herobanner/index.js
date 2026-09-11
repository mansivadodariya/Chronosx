"use client";
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { authNavigate } from '@/lib/authRedirect';
import { useLanguage } from '@/context/LanguageContext';
import styles from './herobanner.module.scss';
import Button from '@/components/button';
import CandlesticksIcon from './CandlesticksIcon';
import HeroSideDots from './HeroSideDots';
import HeroFeatureCards from './HeroFeatureCards';
import HeroTickerMarquee from './HeroTickerMarquee';

const RightArrow = '/assets/icons/right.svg';

export default function Herobanner() {
  const router = useRouter();
  const { t } = useLanguage();
  const sectionRef = useRef(null);

  const [mousePos, setMousePos] = React.useState({ x: 50, y: 35, isHovered: false });

  // Scroll Progress Driven Motion Animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const heroScale = useTransform(scrollYProgress, [0, 0.9], [1, 0.92]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.3]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.25]);

  const handleMouseMove = (e) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
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
      {/* Floating Side Animation Dots on Both Sides */}
      <HeroSideDots />

      {/* High-Tech Ambient Atmosphere & Glow Layers */}
      <motion.div style={{ opacity: bgOpacity }} className={styles.scrollBgWrapper}>
        <div className={styles.ambientGlowTop} aria-hidden="true" />
        <div className={styles.ambientGlowCenter} aria-hidden="true" />
        <div className={styles.ambientGlowLeft} aria-hidden="true" />
        <div className={styles.ambientGlowRight} aria-hidden="true" />
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

        {/* Base Grid Overlay */}
        <div className={styles.gridOverlay} aria-hidden="true" />

        {/* Localized Green Spotlight Grid (area around pointer illuminates green grid) */}
        <div
          className={styles.greenSpotlightGrid}
          style={{
            opacity: mousePos.isHovered ? 1 : 0,
            WebkitMaskImage: `radial-gradient(circle 260px at ${mousePos.x}% ${mousePos.y}%, #000 0%, transparent 100%)`,
            maskImage: `radial-gradient(circle 260px at ${mousePos.x}% ${mousePos.y}%, #000 0%, transparent 100%)`
          }}
          aria-hidden="true"
        />
      </motion.div>

      {/* Main Hero Content Container */}
      <motion.div
        className="container"
        style={{ scale: heroScale, opacity: heroOpacity, y: heroY }}
      >
        <div className={styles.heroCenterCol}>
          {/* 1. Top Pill Badge */}
          <motion.div
            className={styles.topBadgeRow}
            initial={{ opacity: 0, y: -20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.badge} onClick={() => authNavigate(router, '/dashboard')}>
              <span className={styles.badgeText}>
                {t('homeSections.hero.badge', 'Next–Gen AI Algorithmic Trading Terminal')}
              </span>
            </div>
          </motion.div>

          {/* 2. Centered Headline with Candlesticks Icon Inline */}
          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className={styles.titleLine1}>
              {t('homeSections.hero.titleLine1', 'TRADE SMARTER')}
            </span>
            <span className={styles.titleLine2}>
              <span>{t('homeSections.hero.titleLine2', 'WITH AI THAT')}</span>
              <span className={styles.candleIconBox}>
                <CandlesticksIcon className={styles.titleCandleIcon} width={38} height={38} />
              </span>
              <span>{t('homeSections.hero.titleLine3', 'NEVER SLEEP')}</span>
            </span>
          </motion.h1>

          {/* Centered Subheadline */}
          <motion.p
            className={styles.heroDesc}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {t('homeSections.hero.description', 'Get real-time AI trading signals, market insights, and trade recommendations across Forex, Crypto, Stocks, and Commodities.')}
          </motion.p>

          {/* Centered Actions Group (Button + Cyber Bracket Trust Badge) */}
          <motion.div
            className={styles.actionsGroup}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <Button
              text={t('homeSections.hero.getStarted', 'GET STARTED')}
              icon={RightArrow}
              onClick={() => authNavigate(router, '/dashboard')}
            />

            {/* Bracketed Cyber Trust Badge */}
            <div className={styles.trustBadge}>
              <span className={styles.cornerTL} aria-hidden="true" />
              <span className={styles.cornerTR} aria-hidden="true" />
              <span className={styles.cornerBL} aria-hidden="true" />
              <span className={styles.cornerBR} aria-hidden="true" />

              <div className={styles.avatarsGroup}>
                {['a1', 'a2', 'a3'].map((img) => (
                  <img key={img} src={`/assets/images/${img}.png`} alt="Trader User" className={styles.avatarItem} />
                ))}
              </div>

              <div className={styles.trustText}>
                <span className={styles.trustHighlight}>{t('homeSections.hero.trustCount', 'Trusted by over +32k')}</span>
                <span className={styles.trustSub}>{t('homeSections.hero.trustSub', 'people in the world')}</span>
              </div>
            </div>
          </motion.div>

          {/* 3 Bottom Feature Cards */}
          <HeroFeatureCards />
        </div>

        {/* Real-time Scrolling Market Pairs Marquee */}
        <HeroTickerMarquee />
      </motion.div>
    </section>
  );
}
