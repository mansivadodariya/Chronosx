"use client";
import React, { useRef, useMemo, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { authNavigate } from '@/lib/authRedirect';
import { useLanguage } from '@/context/LanguageContext';
import styles from './herobanner.module.scss';
import Button from '@/components/button';
import CandlesticksIcon from './CandlesticksIcon';
import HudPentagonRays from './HudPentagonRays';
import HeroTickerMarquee from './HeroTickerMarquee';
import {
  FlashIcon,
  ShieldIcon,
  GearIcon,
  ActivityIcon,
  ChatBubbleIcon
} from './heroIcons';

const RightArrow = '/assets/icons/right.svg';

const HUD_BADGES_DATA = [
  {
    id: 'chartScanner',
    posClass: 'pentagonTop',
    route: '/chart-scanner',
    Icon: FlashIcon,
    titleKey: 'header.products.chartScanner.title',
    titleDefault: 'AI Chart Scanner',
    descKey: 'homeSections.hero.badges.chartScannerDesc',
    descDefault: 'Pattern & OCR Detection'
  },
  {
    id: 'strategyHub',
    posClass: 'pentagonTopRight',
    route: '/strategy-hub',
    Icon: GearIcon,
    titleKey: 'header.products.strategyHub.title',
    titleDefault: 'Strategy Hub',
    descKey: 'homeSections.hero.badges.strategyHubDesc',
    descDefault: 'Algorithmic Playbooks'
  },
  {
    id: 'liveScanner',
    posClass: 'pentagonBottomRight',
    route: '/live-scanner',
    Icon: ActivityIcon,
    titleKey: 'header.products.liveScanner.title',
    titleDefault: 'Live Market Scanner',
    descKey: 'homeSections.hero.badges.liveScannerDesc',
    descDefault: 'Real-Time Market Feeds'
  },
  {
    id: 'tradeAudit',
    posClass: 'pentagonBottomLeft',
    route: '/trade-audit',
    Icon: ShieldIcon,
    titleKey: 'header.tradingTools.tradeAudit.title',
    titleDefault: 'AI Trade Audit',
    descKey: 'homeSections.hero.badges.tradeAuditDesc',
    descDefault: 'Automated Risk Analytics'
  },
  {
    id: 'marketAssistant',
    posClass: 'pentagonTopLeft',
    route: '/market-assistant',
    Icon: ChatBubbleIcon,
    titleKey: 'header.products.marketAssistant.title',
    titleDefault: 'AI Market Assistant',
    descKey: 'homeSections.hero.badges.marketAssistantDesc',
    descDefault: '24/7 Neural Copilot'
  }
];

export default function Herobanner() {
  const router = useRouter();
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50, isHovered: false });

  // Scroll Progress Driven Motion Animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

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

        <div className={styles.gridOverlay} aria-hidden="true" />

        {/* Localized Green Grid Spotlight */}
        <div
          className={styles.greenSpotlightGrid}
          style={{
            opacity: mousePos.isHovered ? 1 : 0,
            WebkitMaskImage: `radial-gradient(circle 160px at ${mousePos.x}% ${mousePos.y}%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 40%, transparent 100%)`,
            maskImage: `radial-gradient(circle 160px at ${mousePos.x}% ${mousePos.y}%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 40%, transparent 100%)`
          }}
          aria-hidden="true"
        />

        {/* Mobile Ambient Atmosphere */}
        <div className={styles.mobileTechAtmosphere} aria-hidden="true">
          <div className={styles.mobileQuantumHalo} />
          <div className={styles.mobileLaserScan} />
          <div className={styles.mobileConstellation}>
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className={`${styles.particleDot} ${styles[`pDot${i}`]}`} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content Container */}
      <motion.div
        className="container"
        style={{ scale: heroScale, opacity: heroOpacity, y: heroY }}
      >
        <div className={styles.heroGridRow}>

          {/* Left Column: Badge, Headline, Description, Actions & Highlights */}
          <div className={styles.heroLeftCol}>
            {/* 1. Pill Badge */}
            <motion.div
              className={styles.topBadgeRow}
              initial={{ opacity: 0, y: -20, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.badge} onClick={() => authNavigate(router, '/dashboard')}>
                <span className={styles.badgeText}>
                  {t('homeSections.hero.badge', 'Next-Gen AI Algorithmic Trading Terminal')}
                </span>
              </div>
            </motion.div>

            {/* 2. Bold 3-Line Headline with Candlesticks SVG Icon */}
            <motion.h1
              className={styles.heroTitle}
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className={styles.titleLine1}>{t('homeSections.hero.titleLine1', 'TRADE SMARTER')}</span> <br />
              <span className={styles.titleLine2}>
                <span className={styles.greenGradient}>{t('homeSections.hero.titleLine2', 'WITH AI THAT')}</span>
              </span> <br />
              <span className={styles.titleLine3}>
                <span className={styles.candleIconBox}>
                  <CandlesticksIcon className={styles.titleCandleIcon} />
                </span>
                <span className={styles.greenGradient}>{t('homeSections.hero.titleLine3', 'NEVER SLEEP')}</span>
              </span>
            </motion.h1>

            {/* 3. Subheadline */}
            <motion.p
              className={styles.heroDesc}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {t('homeSections.hero.description', 'Get real-time AI trading signals, market insights, and trade recommendations across Forex, Crypto, Stocks, and Global Markets.')}
            </motion.p>

            {/* 4. Action Buttons & Trust Badge */}
            <motion.div
              className={styles.actionsGroup}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
          </div>

          {/* Right Column: Hero AI Neural Core Showcase with 5-Tool Pentagon HUD */}
          <motion.div
            className={styles.heroRightCol}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.hudOrbContainer}>
              {/* Blurry Emerald Ambient Glow behind center video */}
              <div className={styles.orbBlurryGlow} aria-hidden="true" />

              {/* Laser Rays connecting the 5 Pentagon Badges towards video center */}
              <HudPentagonRays />

              {/* Center Neural Orb Video */}
              <div className={styles.videoContainer}>
                <video autoPlay loop muted playsInline className={styles.heroVideo}>
                  <source src="/assets/video/heroVideo.webm" type="video/webm" />
                </video>
              </div>

              {/* 5-Tool Pentagon HUD Badges */}
              {HUD_BADGES_DATA.map(({ id, posClass, route, Icon, titleKey, titleDefault, descKey, descDefault }) => (
                <div
                  key={id}
                  className={`${styles.hudBadge} ${styles[posClass]}`}
                  onClick={() => authNavigate(router, route)}
                >
                  <div className={styles.badgeContent}>
                    <div className={styles.badgeIconWrap}>
                      <Icon className={styles.badgeIcon} width={14} height={14} />
                    </div>
                    <div className={styles.badgeTextCol}>
                      <span className={styles.badgeName}>{t(titleKey, titleDefault)}</span>
                      <span className={styles.badgeDesc}>{t(descKey, descDefault)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Real-time Scrolling Market Pairs Marquee */}
        <HeroTickerMarquee />
      </motion.div>
    </section>
  );
}
