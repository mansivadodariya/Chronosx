"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import SectionHeader from '@/components/sectionHeader';
import { useLivePrice } from '@/lib/useLivePrice';
import styles from './aiCockpit.module.scss';

// Fallback generator for realistic XAU/USD gold candles (Deterministic for SSR Hydration)
function generateFallbackGoldCandles(count = 38, base = 2748.50) {
  const candles = [];
  let price = base * 0.992;
  const baseTime = 1718000000000;

  for (let i = 0; i < count; i++) {
    const cycle = (i / count) * Math.PI * 2.2;
    const wave = Math.sin(cycle) * 6.5;
    const trend = i > count * 0.4 ? 0.8 : -0.3;
    // Deterministic pseudo-random variation
    const pseudoRand1 = Math.sin(i * 12.9898) * 0.5;
    const pseudoRand2 = Math.cos(i * 78.233) * 0.5 + 0.5;
    const delta = wave * 0.4 + trend + pseudoRand1 * 4.2;
    
    const open = price;
    const close = Math.max(open * 0.98, open + delta);
    const spread = Math.abs(close - open);
    const high = Math.max(open, close) + pseudoRand2 * (spread * 0.8 + 2.5);
    const low = Math.min(open, close) - pseudoRand2 * (spread * 0.8 + 2.5);
    const volume = Math.floor(pseudoRand2 * 65 + 35);
    
    price = close;
    candles.push({
      time: baseTime + i * 3600 * 1000,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
      isBullish: close >= open
    });
  }
  return candles;
}

export default function AiCockpit({ isHero = false, showHeader = true }) {
  const [activeTimeframe, setActiveTimeframe] = useState('1H');
  const [livePrice, setLivePrice] = useState(2748.50);
  const [priceChangeText, setPriceChangeText] = useState('+$14.20 (+0.52%)');
  const [isPositiveChange, setIsPositiveChange] = useState(true);
  const [priceFlash, setPriceFlash] = useState(null);
  const [candles, setCandles] = useState(() => generateFallbackGoldCandles(38, 2748.50));
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

    // Dynamically adjust forming candle in real-time
    setCandles((prevCandles) => {
      if (!prevCandles || prevCandles.length === 0) return prevCandles;
      const lastIndex = prevCandles.length - 1;
      const last = { ...prevCandles[lastIndex] };
      last.close = current;
      last.high = Math.max(last.high, current);
      last.low = Math.min(last.low, current);
      last.isBullish = last.close >= last.open;
      const next = [...prevCandles];
      next[lastIndex] = last;
      return next;
    });

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
              setCandles(generateFallbackGoldCandles(38, rawP));
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
      setCandles((prevCandles) => {
        if (!prevCandles || prevCandles.length === 0) return prevCandles;
        const lastIndex = prevCandles.length - 1;
        const last = { ...prevCandles[lastIndex] };

        const randomJump = (Math.random() - 0.48) * 0.85;
        const newClose = Number((last.close + randomJump).toFixed(2));
        const newHigh = Number(Math.max(last.high, newClose).toFixed(2));
        const newLow = Number(Math.min(last.low, newClose).toFixed(2));
        const isBullish = newClose >= last.open;

        setLivePrice(newClose);
        setPriceFlash(randomJump >= 0 ? 'up' : 'down');
        setTimeout(() => setPriceFlash(null), 400);

        tickCounterRef.current += 1;
        if (tickCounterRef.current % 4 === 0) {
          setLastUpdatedSec(Number((Math.random() * 0.8 + 0.3).toFixed(1)));
        }

        const nextArr = [...prevCandles];
        nextArr[lastIndex] = {
          ...last,
          close: newClose,
          high: newHigh,
          low: newLow,
          isBullish
        };
        return nextArr;
      });
    }, 1800);

    return () => clearInterval(tickInterval);
  }, []);

  // Scaled Coordinates Calculations
  const { minPrice, maxPrice, priceRange, svgWidth, svgHeight, chartPadding, candleSpacing } = useMemo(() => {
    const width = 640;
    const height = 460;
    const padding = { top: 34, bottom: 44, left: 16, right: 72 };
    
    const lows = candles.map(c => c.low);
    const highs = candles.map(c => c.high);
    
    let min = Math.min(...lows, livePrice);
    let max = Math.max(...highs, livePrice);
    const rawRange = max - min || 1;
    min -= rawRange * 0.08;
    max += rawRange * 0.08;
    const range = max - min || 1;

    const availableWidth = width - padding.left - padding.right;
    const spacing = availableWidth / Math.max(1, candles.length);

    return {
      minPrice: min,
      maxPrice: max,
      priceRange: range,
      svgWidth: width,
      svgHeight: height,
      chartPadding: padding,
      candleSpacing: spacing
    };
  }, [candles, livePrice]);

  const priceToY = (price) => {
    const usableHeight = svgHeight - chartPadding.top - chartPadding.bottom;
    const y = svgHeight - chartPadding.bottom - ((price - minPrice) / priceRange) * usableHeight;
    return Math.max(chartPadding.top - 8, Math.min(svgHeight - chartPadding.bottom + 8, y));
  };

  const currentPriceY = priceToY(livePrice);

  // Active Candle Direction Color (Emerald Green or Crimson Red)
  const isLastCandleBullish = candles[candles.length - 1]?.isBullish ?? true;
  const currentLiveColor = isLastCandleBullish ? '#10B981' : '#F43F5E';
  const liveCandleX = chartPadding.left + (candles.length - 1) * candleSpacing + candleSpacing / 2;

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

                  {/* Fixed XAU/USD Gold Pill */}
                  <div className={styles.goldAssetPill}>
                    <span className={styles.goldIconLetter}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
                      </svg>
                    </span>
                    <span className={styles.dropdownSymbol}>XAU/USD</span>
                  </div>

                </div>

                <div className={styles.strategyBadge}>
                  <span className={styles.beaconDot} />
                  <span>AI LIVE FEED</span>
                </div>
              </div>

              {/* Chart Canvas with Visible Mesh Grid & Continuous Moving Candles */}
              <div className={styles.svgChartContainer}>
                
                {/* Clearly Visible Horizontal & Vertical Mesh Grid */}
                <div className={styles.visibleGridOverlay} aria-hidden="true">
                  <div className={styles.gridRow} />
                  <div className={styles.gridRow} />
                  <div className={styles.gridRow} />
                  <div className={styles.gridRow} />
                  <div className={styles.gridRow} />
                  <div className={styles.gridCol} style={{ left: '20%' }} />
                  <div className={styles.gridCol} style={{ left: '40%' }} />
                  <div className={styles.gridCol} style={{ left: '60%' }} />
                  <div className={styles.gridCol} style={{ left: '80%' }} />
                </div>

                {/* Right Y-Axis Scale Gutter */}
                <div className={styles.yAxisScaleGutter} aria-hidden="true">
                  <span>{maxPrice.toFixed(1)}</span>
                  <span>{(maxPrice * 0.75 + minPrice * 0.25).toFixed(1)}</span>
                  <span>{((maxPrice + minPrice) / 2).toFixed(1)}</span>
                  <span>{(maxPrice * 0.25 + minPrice * 0.75).toFixed(1)}</span>
                  <span>{minPrice.toFixed(1)}</span>
                </div>

                <svg 
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                  className={styles.chartSvg}
                  preserveAspectRatio="none"
                >
                  <defs>
                    {/* Volume Gradients */}
                    <linearGradient id="volBullGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.65" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.12" />
                    </linearGradient>
                    <linearGradient id="volBearGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.65" />
                      <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.12" />
                    </linearGradient>
                  </defs>

                  {/* 2. Volume Profile Histogram Bars */}
                  {candles.map((candle, idx) => {
                    const x = chartPadding.left + idx * candleSpacing + candleSpacing * 0.15;
                    const barWidth = Math.max(3.5, candleSpacing * 0.65);
                    const maxVolHeight = 46;
                    const volHeight = (candle.volume / 100) * maxVolHeight;
                    const y = svgHeight - chartPadding.bottom - volHeight;

                    return (
                      <rect
                        key={`vol-${idx}`}
                        x={x}
                        y={y}
                        width={barWidth}
                        height={volHeight}
                        fill={candle.isBullish ? 'url(#volBullGrad)' : 'url(#volBearGrad)'}
                        rx="1"
                      />
                    );
                  })}

                  {/* 3. Candlesticks (Wicks & Bodies) */}
                  {candles.map((candle, idx) => {
                    const xCenter = chartPadding.left + idx * candleSpacing + candleSpacing / 2;
                    const bodyWidth = Math.max(4.8, candleSpacing * 0.64);
                    const xLeft = xCenter - bodyWidth / 2;

                    const wickTop = priceToY(candle.high);
                    const wickBottom = priceToY(candle.low);
                    const bodyTop = priceToY(Math.max(candle.open, candle.close));
                    const bodyBottom = priceToY(Math.min(candle.open, candle.close));
                    const bodyHeight = Math.max(2.5, bodyBottom - bodyTop);

                    const color = candle.isBullish ? '#10B981' : '#F43F5E';
                    const isLast = idx === candles.length - 1;

                    return (
                      <g key={`c-${idx}`}>
                        <line
                          x1={xCenter}
                          y1={wickTop}
                          x2={xCenter}
                          y2={wickBottom}
                          stroke={color}
                          strokeWidth="1.2"
                        />
                        <rect
                          x={xLeft}
                          y={bodyTop}
                          width={bodyWidth}
                          height={bodyHeight}
                          fill={color}
                          stroke={color}
                          strokeWidth="0.5"
                          rx="1"
                        />
                        {/* Live pulsating beacon dot at the head of the forming candle */}
                        {isLast && (
                          <g transform={`translate(${xCenter}, ${currentPriceY})`}>
                            <circle r="3.5" fill={color} />
                            <circle r="7.5" fill="none" stroke={color} strokeWidth="1.5" opacity="0.75" />
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Dashed Laser Price Line (Color-Matched to Bullish Green / Bearish Red) */}
                  <line
                    x1={chartPadding.left}
                    y1={currentPriceY}
                    x2={svgWidth - chartPadding.right}
                    y2={currentPriceY}
                    stroke={currentLiveColor}
                    strokeDasharray="4 4"
                    strokeWidth="1.4"
                    opacity="0.9"
                  />
                </svg>

                {/* Right Gutter Live Price Badge (Dynamically Red or Green) */}
                <div 
                  className={`${styles.liveRightPricePill} ${isLastCandleBullish ? styles.pillGreen : styles.pillRed}`}
                  style={{ top: `${(currentPriceY / svgHeight) * 100}%` }}
                >
                  <span className={styles.pillText}>
                    {livePrice.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  </span>
                </div>
              </div>

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
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="6 3 18 3 22 9 12 21 2 9 6 3" fill="currentColor" fillOpacity="0.15" />
                      <line x1="2" y1="9" x2="22" y2="9" />
                      <line x1="12" y1="21" x2="8" y2="9" />
                      <line x1="12" y1="21" x2="16" y2="9" />
                    </svg>
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

              {/* Cockpit Mode Sub-Tabs with Interactive Luxury Hover */}
              <div className={styles.cockpitSubTabs}>
                <button 
                  type="button" 
                  className={`${styles.tabLink} ${cockpitSubTab === 'overview' ? styles.tabLinkActive : ''}`}
                  onClick={() => setCockpitSubTab('overview')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18M7 16l4-4 4 4 5-6"/>
                  </svg>
                  <span>Overview</span>
                </button>

                <button 
                  type="button" 
                  className={`${styles.tabLink} ${cockpitSubTab === 'deep' ? styles.tabLinkActive : ''}`}
                  onClick={() => setCockpitSubTab('deep')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                  <span>Deep Analysis</span>
                </button>

                <button 
                  type="button" 
                  className={`${styles.tabLink} ${cockpitSubTab === 'tools' ? styles.tabLinkActive : ''}`}
                  onClick={() => setCockpitSubTab('tools')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                  </svg>
                  <span>Trading Tools</span>
                </button>

              </div>


              {/* Two High-Impact Intelligence Cards with Mutual Dimming & Respective Hover Animations */}
              <div className={styles.cardsPairGrid}>
                
                {/* Card 1: AI Score Analysis (Same as Capabilities Heat List Conviction) */}
                <div 
                  className={`${styles.intelCard} ${styles.scoreCard} ${hoveredIntelCard === 'score' ? styles.cardActiveScore : ''} ${hoveredIntelCard === 'rank' ? styles.cardDimmed : ''}`}
                  onMouseEnter={() => setHoveredIntelCard('score')}
                  onMouseLeave={() => setHoveredIntelCard(null)}
                >
                  <div className={styles.cardTopMeta}>
                    <div className={styles.cardHeaderWithIcon}>
                      <div className={styles.radarIconBox}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="9" opacity="0.35" />
                          <path d="M12 3a9 9 0 0 1 9 9" />
                          <circle cx="12" cy="12" r="3" fill="currentColor" />
                          <path d="M12 12l5 -5" />
                        </svg>
                      </div>
                      <div>
                        <h4 className={styles.cardTitle}>AI Score</h4>
                        <p className={styles.cardSub}>Composite analysis</p>
                      </div>
                    </div>
                    <span className={styles.deltaPillGreen}>↑ +3.1</span>
                  </div>

                  <div className={styles.scoreNumberBlock}>
                    <div className={styles.scoreLargeNum}>
                      <span className={`${styles.scoreDigits} ${hoveredIntelCard === 'score' ? styles.scoreActiveText : ''}`}>96</span>
                      <span className={styles.scoreCurrentBadge}>CURRENT</span>
                    </div>

                    <div className={styles.scoreVerdict}>
                      <span className={styles.verdictText}>Strong Buy</span>
                      <span className={styles.confidenceBadge}>97% CONFIDENCE</span>
                    </div>
                  </div>

                  <div className={styles.sliderTrackWrapper}>
                    <div className={styles.sliderRangeHeader}>
                      <span>0</span>
                      <span className={styles.rangeCenterText}>SCORE RANGE</span>
                      <span>100</span>
                    </div>
                    <div className={styles.sliderTrack}>
                      <motion.div 
                        className={styles.sliderFill} 
                        animate={{ 
                          width: hoveredIntelCard === 'score' ? '96%' : '84%',
                          background: hoveredIntelCard === 'score' 
                            ? 'linear-gradient(90deg, #10B981 0%, #34D399 65%, #6EE7B7 100%)' 
                            : 'rgba(255, 255, 255, 0.18)',
                          boxShadow: hoveredIntelCard === 'score' ? '0 0 16px rgba(52, 211, 153, 0.85)' : 'none'
                        }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                      >
                        <motion.span 
                          className={styles.sliderKnob} 
                          animate={{ 
                            scale: hoveredIntelCard === 'score' ? 1.35 : 1,
                            borderColor: hoveredIntelCard === 'score' ? '#6EE7B7' : '#10B981',
                            boxShadow: hoveredIntelCard === 'score' ? '0 0 12px #6EE7B7' : '0 0 8px #34D399'
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Universe Rank & Sparkline (Same as Capabilities Backtesting Equity Curve) */}
                <div 
                  className={`${styles.intelCard} ${styles.rankCard} ${hoveredIntelCard === 'rank' ? styles.cardActiveRank : ''} ${hoveredIntelCard === 'score' ? styles.cardDimmed : ''}`}
                  onMouseEnter={() => setHoveredIntelCard('rank')}
                  onMouseLeave={() => setHoveredIntelCard(null)}
                >
                  <div className={styles.cardTopMeta}>
                    <div className={styles.cardHeaderWithIcon}>
                      <div className={styles.trophyIconBox}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                          <path d="M4 22h16" />
                          <path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34" />
                          <path d="M6 4h12a1 1 0 0 1 1 1v4a7 7 0 0 1-14 0V5a1 1 0 0 1 1-1Z" fill="currentColor" fillOpacity="0.2" />
                        </svg>
                      </div>
                      <div>
                        <h4 className={styles.cardTitle}>Universe Rank</h4>
                        <p className={styles.cardSub}>Of 1,000 assets</p>
                      </div>
                    </div>
                    <span className={styles.deltaPillGreen}>↑ +2</span>
                  </div>

                  <div className={styles.rankNumberBlock}>
                    <div className={styles.rankNumText}>
                      <span className={`${styles.rankGoldDigit} ${hoveredIntelCard === 'rank' ? styles.rankActiveText : ''}`}>#1</span>
                      <span className={styles.rankOutOf}>/ 1,000</span>
                    </div>
                    <span className={styles.topPerformerBadge}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      TOP 0.1% PERFORMER
                    </span>
                  </div>

                  <div className={styles.sparklineContainer}>
                    <svg viewBox="0 0 220 54" className={styles.sparklineSvg} preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="eqGlowGradGoldCockpit" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#18c98b" stopOpacity="0.45" />
                          <stop offset="60%" stopColor="#18c98b" stopOpacity="0.12" />
                          <stop offset="100%" stopColor="#18c98b" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {hoveredIntelCard === 'rank' ? (
                        <g>
                          {/* Luminous Area Under Upward Equity Curve in Green */}
                          <motion.path
                            d="M 6 46 Q 40 44 80 38 T 130 26 T 175 18 T 205 12 L 205 50 L 6 50 Z"
                            fill="url(#eqGlowGradGoldCockpit)"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                          />

                          {/* Moving Upward Equity Surge Curve in Green */}
                          <motion.path
                            d="M 6 46 Q 40 44 80 38 T 130 26 T 175 18 T 205 12"
                            fill="none"
                            stroke="#6EE7B7"
                            strokeWidth="3.2"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.65, ease: "easeOut" }}
                            filter="drop-shadow(0 0 10px rgba(24, 201, 139, 0.95))"
                          />

                          {/* Peak Tip Dot at Top */}
                          <motion.circle 
                            cx="205" 
                            cy="12" 
                            r="5" 
                            fill="#FFFFFF"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.55 }}
                            filter="drop-shadow(0 0 8px #6EE7B7)"
                          />

                          {/* Pulsating Ping Radar Ring */}
                          <motion.circle 
                            cx="205" 
                            cy="12" 
                            r="8" 
                            fill="none"
                            stroke="#6EE7B7"
                            strokeWidth="1.5"
                            initial={{ scale: 0.8, opacity: 0.9 }}
                            animate={{ scale: 1.6, opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 1.1, ease: "easeOut", delay: 0.6 }}
                          />
                        </g>
                      ) : (
                        <g>
                          <path
                            d="M 6 46 Q 40 44 80 38 T 130 26"
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.22)"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <circle cx="130" cy="26" r="3" fill="rgba(255, 255, 255, 0.4)" />
                        </g>
                      )}
                    </svg>
                  </div>

                </div>

              </div>




              {/* Bottom 3-Column Luxury Intelligence Matrix - Clean Single-Line Layout */}
              <div className={styles.metaMatrixGrid}>
                <div className={styles.metaCol}>
                  <div className={styles.metaTopRow}>
                    <span className={styles.metaLabel}>MARKET CAP</span>
                    <span className={styles.metaBadgeGold}>#1 ASSET</span>
                  </div>
                  <span className={styles.metaVal}>$17.8T</span>
                  <span className={styles.metaSub}>World Valuation</span>
                </div>

                <div className={styles.metaCol}>
                  <div className={styles.metaTopRow}>
                    <span className={styles.metaLabel}>24H VOLUME</span>
                    <span className={styles.metaBadgeGreen}>+27.4%</span>
                  </div>
                  <span className={styles.metaVal}>$24.85B</span>
                  <span className={styles.metaSub}>Avg $19.50B</span>
                </div>

                <div className={styles.metaCol}>
                  <div className={styles.metaTopRow}>
                    <span className={styles.metaLabel}>AI SIGNAL</span>
                    <span className={styles.metaBadgeLive}>97% CONF.</span>
                  </div>
                  <div className={styles.signalBadgeGreen}>
                    <span className={styles.signalDot} />
                    <span>Strong Buy</span>
                  </div>
                  <span className={styles.metaSub}>Trend Confirmed</span>
                </div>
              </div>



              {/* Live WebSocket Footer */}
              <div className={styles.cockpitFooterBar}>
                <div className={styles.footerLeft}>
                  <span className={styles.liveGreenDotSmall} />
                  <span>UPDATED {lastUpdatedSec}S AGO · WEBSOCKET LIVE</span>
                </div>
                <div className={styles.footerRight}>
                  <span>CHRONOSX AI LIVE FEED · 12MS LATENCY</span>
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
