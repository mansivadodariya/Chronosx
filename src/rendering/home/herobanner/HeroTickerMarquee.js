"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { navigateFeature } from '@/lib/authRedirect';
import styles from './herobanner.module.scss';

// Official TradingView Country Flags & Currency Logos
const TICKER_ASSETS = [
  {
    name: 'EUR / USD',
    symbol: 'EURUSD',
    price: '1.0854',
    change: '+0.25%',
    isUp: true,
    signal: 'BULLISH',
    logoUrl: 'https://s3-symbol-logo.tradingview.com/country/EU.svg',
    fallbackChar: '€',
    color: '#003399'
  },
  {
    name: 'USD / JPY',
    symbol: 'USDJPY',
    price: '154.650',
    change: '-0.34%',
    isUp: false,
    signal: 'BEARISH',
    logoUrl: 'https://s3-symbol-logo.tradingview.com/country/JP.svg',
    fallbackChar: '¥',
    color: '#BC002D'
  },
  {
    name: 'GBP / USD',
    symbol: 'GBPUSD',
    price: '1.2945',
    change: '+0.42%',
    isUp: true,
    signal: 'CONFLUENCE',
    logoUrl: 'https://s3-symbol-logo.tradingview.com/country/GB.svg',
    fallbackChar: '£',
    color: '#C8102E'
  },
  {
    name: 'AUD / USD',
    symbol: 'AUDUSD',
    price: '0.6580',
    change: '+0.15%',
    isUp: true,
    signal: 'BULLISH',
    logoUrl: 'https://s3-symbol-logo.tradingview.com/country/AU.svg',
    fallbackChar: 'A$',
    color: '#00008B'
  },
  {
    name: 'USD / CAD',
    symbol: 'USDCAD',
    price: '1.3830',
    change: '-0.18%',
    isUp: false,
    signal: 'BEARISH',
    logoUrl: 'https://s3-symbol-logo.tradingview.com/country/CA.svg',
    fallbackChar: 'C$',
    color: '#FF0000'
  },
  {
    name: 'USD / CHF',
    symbol: 'USDCHF',
    price: '0.8650',
    change: '+0.12%',
    isUp: true,
    signal: 'STRONG BUY',
    logoUrl: 'https://s3-symbol-logo.tradingview.com/country/CH.svg',
    fallbackChar: 'Fr',
    color: '#D52B1E'
  },
  {
    name: 'NZD / USD',
    symbol: 'NZDUSD',
    price: '0.5876',
    change: '-0.02%',
    isUp: false,
    signal: 'STABLE',
    logoUrl: 'https://s3-symbol-logo.tradingview.com/country/NZ.svg',
    fallbackChar: 'NZ$',
    color: '#00247D'
  },
  {
    name: 'EUR / JPY',
    symbol: 'EURJPY',
    price: '167.850',
    change: '+0.38%',
    isUp: true,
    signal: 'MOMENTUM',
    logoUrl: 'https://s3-symbol-logo.tradingview.com/country/EU.svg',
    fallbackChar: '€',
    color: '#003399'
  },
  {
    name: 'GBP / JPY',
    symbol: 'GBPJPY',
    price: '198.400',
    change: '+0.65%',
    isUp: true,
    signal: 'BREAKOUT',
    logoUrl: 'https://s3-symbol-logo.tradingview.com/country/GB.svg',
    fallbackChar: '£',
    color: '#C8102E'
  }
];

const SparklineMini = React.memo(function SparklineMini({ isUp }) {
  const strokeColor = isUp ? '#34D399' : '#F87171';
  const pathD = isUp
    ? 'M 2 14 Q 12 15, 22 9 T 42 3'
    : 'M 2 3 Q 12 5, 22 11 T 42 16';

  return (
    <div className={styles.sparklineWrap}>
      <svg viewBox="0 0 44 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d={pathD} stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
});

const TickerCard = React.memo(function TickerCard({ item, onClick }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={styles.heroTickerCard}
      dir="ltr"
      onClick={onClick}
    >
      <div className={styles.tickerLogoCircle}>
        {!imgError && item.logoUrl ? (
          <img
            src={item.logoUrl}
            alt={item.name}
            className={styles.tickerLogoImg}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className={styles.tickerFallbackChar} style={{ color: item.color || '#6EE7B7' }}>
            {item.fallbackChar || item.name.charAt(0)}
          </span>
        )}
      </div>
      <div className={styles.tickerCardContent}>
        <div className={styles.tickerCardTop}>
          <span className={styles.tickerCardName}>{item.name}</span>
          <span className={styles.tickerCardSymbol}>{item.symbol}</span>
          <span className={styles.tickerSignalPill}>{item.signal}</span>
        </div>
        <div className={styles.tickerCardBottom}>
          <span className={styles.tickerPrice}>{item.price}</span>
          <span className={`${styles.tickerChange} ${item.isUp ? styles.green : styles.red}`}>
            {item.change}
          </span>
          <SparklineMini isUp={item.isUp} />
        </div>
      </div>
    </div>
  );
});

export default React.memo(function HeroTickerMarquee() {
  const router = useRouter();

  const handleCardClick = React.useCallback(() => {
    navigateFeature(router, '/ai-chart-scanner', '/chart-scanner');
  }, [router]);

  return (
    <div className={styles.heroMarqueeWrapper} aria-label="Live Market Assets Ticker" dir="ltr">
      <div className={styles.marqueeTrackWrapper} dir="ltr">
        <div className={styles.heroMarqueeTrack} dir="ltr">
          {/* First loop group */}
          <div className={styles.marqueeGroup} dir="ltr">
            {TICKER_ASSETS.map((item, idx) => (
              <TickerCard
                key={`hero-ticker-a-${idx}`}
                item={item}
                onClick={handleCardClick}
              />
            ))}
          </div>

          {/* Second identical loop group for 100% seamless, mathematically exact infinite scroll */}
          <div className={styles.marqueeGroup} aria-hidden="true" dir="ltr">
            {TICKER_ASSETS.map((item, idx) => (
              <TickerCard
                key={`hero-ticker-b-${idx}`}
                item={item}
                onClick={handleCardClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
