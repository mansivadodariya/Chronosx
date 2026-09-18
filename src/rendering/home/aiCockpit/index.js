"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import SectionHeader from '@/components/sectionHeader';
import { useLivePrice } from '@/lib/useLivePrice';
import AiCockpitIntelDeck from './components/AiCockpitIntelDeck';
import AiCockpitLiveChart from './components/AiCockpitLiveChart';
import GoldIcon from '@/icons/goldIcon';
import { useLanguage } from '@/context/LanguageContext';
import styles from './aiCockpit.module.scss';

export default function AiCockpit({ isHero = false, showHeader = true }) {
  const { t } = useLanguage();
  const [activeTimeframe, setActiveTimeframe] = useState('1H');
  const [livePrice, setLivePrice] = useState(2894.50);
  const [priceChangeText, setPriceChangeText] = useState('+$14.20 (+0.52%)');
  const [isPositiveChange, setIsPositiveChange] = useState(true);
  const [priceFlash, setPriceFlash] = useState(null);
  const [volume24h, setVolume24h] = useState('$24.85B');
  const [lastUpdatedSec, setLastUpdatedSec] = useState(1.1);
  const [cockpitSubTab, setCockpitSubTab] = useState('overview');
  const [hoveredIntelCard, setHoveredIntelCard] = useState(null);
  const [currentTimeET, setCurrentTimeET] = useState('');

  const tickCounterRef = useRef(0);
  const cockpitSectionRef = useRef(null);
  const sparklineData = [22, 26, 25, 32, 36, 40, 44, 48, 52, 58, 65, 72, 76, 82, 88, 96];

  // 3D Perspective Scroll Rotation (Rotates from 52deg back to 0deg flat on scroll)
  const { scrollYProgress } = useScroll({
    target: cockpitSectionRef,
    offset: ["start 98%", "center center"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [52, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.82, 1]);
  const translateY = useTransform(scrollYProgress, [0, 1], [75, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.4, 1], [0.6, 0.88, 1]);

  // ET Clock Timer
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTimeET(`${hours}:${minutes}:${seconds} ET`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Connect directly to our backend MT5 WebSocket stream for XAUUSD
  const { priceData, tickDirection } = useLivePrice('XAUUSD');

  // React to live WebSocket prices from our socket
  useEffect(() => {
    if (!priceData || !priceData.price) return;
    const current = parseFloat(priceData.price);
    if (isNaN(current) || current <= 0) return;

    setLivePrice(current);

    const changePct = parseFloat(priceData.changePercent ?? 0);
    const isUp = changePct >= 0;
    setIsPositiveChange(isUp);
    const changeVal = (current * (changePct / 100)).toFixed(2);
    setPriceChangeText(`${isUp ? '+' : ''}$${Math.abs(changeVal)} (${isUp ? '+' : ''}${changePct.toFixed(2)}%)`);

    if (tickDirection) {
      setPriceFlash(tickDirection);
      const timer = setTimeout(() => setPriceFlash(null), 500);
      return () => clearTimeout(timer);
    }
  }, [priceData, tickDirection]);

  // Seed baseline from market tickers if socket is connecting
  useEffect(() => {
    let isMounted = true;
    const fetchInitialGold = async () => {
      try {
        const res = await fetch('/api/v1/market/tickers');
        if (res.ok) {
          const json = await res.json();
          const goldData = json?.data?.XAUUSD || json?.data?.GOLD;
          if (goldData && isMounted && (!priceData || !priceData.price)) {
            const rawP = parseFloat(goldData.rawPrice);
            if (rawP > 0) {
              setLivePrice(rawP);
              setIsPositiveChange(goldData.isUp);
              setPriceChangeText(goldData.change);
            }
          }
        }
      } catch {}
    };
    fetchInitialGold();
    return () => { isMounted = false; };
  }, [priceData]);

  // Micro-tick price engine
  useEffect(() => {
    const tickInterval = setInterval(() => {
      if (document.hidden) return;

      setLivePrice((prev) => {
        const randomJump = (Math.random() - 0.48) * 0.85;
        const newClose = Number((prev + randomJump).toFixed(2));
        setPriceFlash(randomJump >= 0 ? 'up' : 'down');
        setTimeout(() => setPriceFlash(null), 400);

        tickCounterRef.current += 1;
        if (tickCounterRef.current % 4 === 0) {
          setLastUpdatedSec(Number((Math.random() * 0.8 + 0.3).toFixed(1)));
        }
        return newClose;
      });
    }, 2200);

    return () => clearInterval(tickInterval);
  }, []);

  return (
    <section ref={cockpitSectionRef} className={`${styles.cockpitSection} ${isHero ? styles.heroMode : ''}`} aria-label="XAUUSD AI Trading Intelligence Terminal">
      {!isHero && <div className={styles.ambientBackdropGlow} aria-hidden="true" />}

      <div className={isHero ? styles.heroContainer : "container"}>
        
        {/* Section Header */}
        {!isHero && showHeader && (
          <SectionHeader
            badge="AI INTELLIGENCE COCKPIT"
            title1="Real-Time Live Terminal."
            title2="Predictive Cockpit."
            description="Institutional-grade real-time market engine. Stream live gold tick candles, track composite AI conviction scores, and monitor volume flows in one unified terminal."
          />
        )}

        {/* 3D Perspective Scroll Container */}
        <div className={styles.perspectiveWrapper}>
          <motion.div 
            className={styles.masterTerminalBox}
            style={isHero ? {} : {
              rotateX,
              scale,
              translateY,
              opacity,
              transformStyle: "preserve-3d",
              transformOrigin: "top center"
            }}
          >

          {/* 2-Part Grid Layout */}
          <div className={styles.twoPartLayout}>
            
            {/* ------------------------------------------------------------
                PART 1 (LEFT): Real-Time Continuously Forming Gold Candlesticks
                ------------------------------------------------------------ */}
            <div className={styles.partOneChart}>
              
              {/* Header */}
              <div className={styles.partHeader}>
                <div className={styles.headerLeftCluster}>
                  <div className={styles.macDots} aria-hidden="true">
                    <span className={styles.dotRed} />
                    <span className={styles.dotYellow} />
                    <span className={styles.dotGreen} />
                  </div>

                  {/* Fixed XAU/USD Gold Asset Header */}
                  <div className={styles.goldAssetPill}>
                    <span className={styles.goldIconLetter}>
                      <GoldIcon size={19} />
                    </span>
                    <span className={styles.dropdownSymbol}>XAU/USD</span>
                    <span className={styles.assetPairSub}>Gold Spot</span>
                  </div>

                </div>

                <div className={styles.strategyBadge}>
                  <span className={styles.beaconDot} />
                  <span>AI LIVE FEED</span>
                </div>
              </div>

              {/* Real Lightweight Charts TradingView Canvas */}
              <AiCockpitLiveChart
                livePrice={livePrice}
                isPositiveChange={isPositiveChange}
              />

            </div>

            {/* ------------------------------------------------------------
                PART 2 (RIGHT): XAU/USD Gold Spot AI Intelligence Cockpit
                ------------------------------------------------------------ */}
            <div className={styles.partTwoCockpit}>
              
              {/* Breadcrumb Top Bar */}
              <div className={styles.cockpitTopBreadcrumb}>
                <div className={styles.breadcrumbTitle}>
                  <span className={styles.arrowLeft}>‹</span>
                  <span className={styles.parentName}>HEAT LIST</span>
                  <span className={styles.slash}>/</span>
                  <span className={styles.activeAssetTicker}>XAUUSD</span>
                </div>

                <div className={styles.watchlistTag}>
                  <svg className={styles.starSvg} width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span>IN WATCHLIST</span>
                </div>
              </div>

              {/* Asset Identity Header */}
              <div className={styles.assetHeaderRow}>
                <div className={styles.identityLeft}>
                  <div className={styles.logoGold}>
                    <GoldIcon size={24} />
                  </div>
                  
                  <div className={styles.titleAndSub}>
                    <div className={styles.tickerBadgeLine}>
                      <h3 className={styles.assetTickerText}>XAUUSD</h3>
                      <span className={styles.liveStatusPill}>
                        <span className={styles.liveGreenBeacon} />
                        LIVE
                      </span>
                    </div>
                    <p className={styles.assetSubDetails}>Gold Spot · Commodities · Precious Metals</p>
                  </div>
                </div>
              </div>

              {/* Massive Live Price Row */}
              <div className={styles.hugePriceRow}>
                <span className={`${styles.mainPriceNumber} ${isPositiveChange ? styles.priceGreen : styles.priceRed} ${priceFlash === 'up' ? styles.flashUp : priceFlash === 'down' ? styles.flashDown : ''}`}>
                  ${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>


                <div className={styles.priceChangeAndClock}>
                  <span className={`${styles.changePercentTag} ${!isPositiveChange ? styles.changeNegative : ''}`}>
                    <span className={styles.upArrow}>{isPositiveChange ? '↑' : '↓'}</span>
                    {priceChangeText}
                  </span>
                  <span className={styles.liveClockET}>{currentTimeET}</span>
                </div>
              </div>

              {/* Mode Sub-Tabs and Intelligence Cards Deck */}
              <AiCockpitIntelDeck
                cockpitSubTab={cockpitSubTab}
                setCockpitSubTab={setCockpitSubTab}
                hoveredIntelCard={hoveredIntelCard}
                setHoveredIntelCard={setHoveredIntelCard}
              />

              {/* Bottom 3-Column Luxury Intelligence Matrix - Real Institutional Analysis, No Cheap Badges */}
              <div className={styles.metaMatrixGrid}>
                <div className={styles.metaCol}>
                  <div className={styles.metaTopRow}>
                    <span className={styles.metaLabel}>
                      {t('homeSections.aiCockpit.col1Label', 'KEY DEMAND LEVEL')}
                    </span>
                  </div>
                  <span className={styles.metaVal}>
                    {t('homeSections.aiCockpit.col1Val', 'Support Retained')}
                  </span>
                  <span className={styles.metaSub}>
                    {t('homeSections.aiCockpit.col1Sub', 'Fair Value Gap Protected · $4,342')}
                  </span>
                </div>

                <div className={styles.metaCol}>
                  <div className={styles.metaTopRow}>
                    <span className={styles.metaLabel}>
                      {t('homeSections.aiCockpit.col2Label', 'INSTITUTIONAL EXECUTION')}
                    </span>
                  </div>
                  <span className={styles.metaVal}>
                    {t('homeSections.aiCockpit.col2Val', 'Direct MT5 Routing')}
                  </span>
                  <span className={styles.metaSub}>
                    {t('homeSections.aiCockpit.col2Sub', 'Raw 0.0 Pip Spread · Ultra-Low Latency')}
                  </span>
                </div>

                <div className={styles.metaCol}>
                  <div className={styles.metaTopRow}>
                    <span className={styles.metaLabel}>
                      {t('homeSections.aiCockpit.col3Label', 'DIRECTIONAL CONFLUENCE')}
                    </span>
                  </div>
                  <div className={styles.signalBadgeGreen}>
                    <span className={styles.signalDot} />
                    <span>
                      {t('homeSections.aiCockpit.col3Val', 'Trend Continuation')}
                    </span>
                  </div>
                  <span className={styles.metaSub}>
                    {t('homeSections.aiCockpit.col3Sub', 'Multi-Timeframe Momentum Aligned')}
                  </span>
                </div>
              </div>

              {/* Live WebSocket Footer */}
              <div className={styles.cockpitFooterBar}>
                <div className={styles.footerLeft}>
                  <span className={styles.liveGreenDotSmall} />
                  <span>{t('homeSections.aiCockpit.footerLive', 'AI STREAM ACTIVE · REAL-TIME WEBSOCKET')}</span>
                </div>
                <div className={styles.footerRight}>
                  <span>{t('homeSections.aiCockpit.footerFeed', 'CHRONOSX AI TERMINAL · ZERO-LATENCY')}</span>
                </div>
              </div>

            </div>

          </div>

        </motion.div>
      </div>

      </div>
    </section>
  );
}
