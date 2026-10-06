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

function SparklineMini({ isUp }) {
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
}

function TickerCardLogo({ logoUrl, name, color, fallbackChar }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={styles.tickerLogoCircle}>
      {!imgError && logoUrl ? (
        <img
          src={logoUrl}
          alt={name}
          className={styles.tickerLogoImg}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className={styles.tickerFallbackChar} style={{ color: color || '#6EE7B7' }}>
          {fallbackChar || name.charAt(0)}
        </span>
      )}
    </div>
  );
}

export default function HeroTickerMarquee() {
  const router = useRouter();

  // Duplicate items 3x for infinite seamless scroll
  const marqueeItems = [...TICKER_ASSETS, ...TICKER_ASSETS, ...TICKER_ASSETS];

  const getAssetData = (item) => ({
    price: item.price,
    change: item.change,
    isUp: item.isUp,
    signal: item.signal
  });

  return (
    <div className={styles.heroMarqueeWrapper} aria-label="Live Market Assets Ticker" dir="ltr">
      <div className={styles.marqueeTrackWrapper} dir="ltr">
        <div className={styles.heroMarqueeTrack} dir="ltr">
          {marqueeItems.map((item, idx) => {
            const data = getAssetData(item);
            return (
              <div
                key={`hero-ticker-${idx}`}
                className={styles.heroTickerCard}
                dir="ltr"
                onClick={() => navigateFeature(router, '/ai-chart-scanner', '/chart-scanner')}
              >
                <TickerCardLogo
                  logoUrl={item.logoUrl}
                  name={item.name}
                  color={item.color}
                  fallbackChar={item.fallbackChar}
                />
                <div className={styles.tickerCardContent}>
                  <div className={styles.tickerCardTop}>
                    <span className={styles.tickerCardName}>{item.name}</span>
                    <span className={styles.tickerCardSymbol}>{item.symbol}</span>
                    <span className={styles.tickerSignalPill}>{data.signal}</span>
                  </div>
                  <div className={styles.tickerCardBottom}>
                    <span className={styles.tickerPrice}>{data.price}</span>
                    <span className={`${styles.tickerChange} ${data.isUp ? styles.green : styles.red}`}>
                      {data.change}
                    </span>
                    <SparklineMini isUp={data.isUp} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
