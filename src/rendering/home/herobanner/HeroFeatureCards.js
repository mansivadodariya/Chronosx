"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { authNavigate } from '@/lib/authRedirect';
import { useLanguage } from '@/context/LanguageContext';
import styles from './herobanner.module.scss';
import { AiChipIcon, TrendChartIcon, RiskAlertIcon } from './heroIcons';

export default function HeroFeatureCards() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <motion.div
      className={styles.heroCardsRow}
      initial={{ opacity: 0, y: 35 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.85, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* 1. Left Card: AI Market Analysis */}
      <div
        className={`${styles.featureCard} ${styles.cardNormal}`}
        onClick={() => authNavigate(router, '/chart-scanner')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && authNavigate(router, '/chart-scanner')}
      >
        <div className={styles.cardIconBox}>
          <AiChipIcon className={styles.cardSvgIcon} width={38} height={38} />
        </div>
        <div className={styles.cardTextCol}>
          <h3 className={styles.cardTitle}>
            {t('homeSections.hero.cards.analysisTitle', 'AI Market Analysis')}
          </h3>
          <p className={styles.cardDesc}>
            {t('homeSections.hero.cards.analysisDesc', 'Scan charts with computer vision to detect candlestick patterns, liquidity sweeps, and high-probability setups.')}
          </p>
        </div>
      </div>

      {/* 2. Center Card: Smart Trade Strategy (Tilted & Layered Stack) */}
      <div className={styles.tiltedCardWrapper}>
        {/* Layered Backdrop Shadow Card */}
        <div className={styles.layeredCardBack} aria-hidden="true" />

        {/* Main Tilted Card */}
        <div
          className={`${styles.featureCard} ${styles.cardTilted}`}
          onClick={() => authNavigate(router, '/strategy-hub')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && authNavigate(router, '/strategy-hub')}
        >
          <div className={styles.cardIconBox}>
            <TrendChartIcon className={styles.cardSvgIcon} width={38} height={38} />
          </div>
          <div className={styles.cardTextCol}>
            <h3 className={styles.cardTitle}>
              {t('homeSections.hero.cards.strategyTitle', 'Smart Trade Strategy')}
            </h3>
            <p className={styles.cardDesc}>
              {t('homeSections.hero.cards.strategyDesc', 'Build and backtest quantitative trading playbooks with multi-timeframe trend rules and automated signals.')}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Right Card: Risk Management */}
      <div
        className={`${styles.featureCard} ${styles.cardNormal}`}
        onClick={() => authNavigate(router, '/trade-audit')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && authNavigate(router, '/trade-audit')}
      >
        <div className={styles.cardIconBox}>
          <RiskAlertIcon className={styles.cardSvgIcon} width={38} height={38} />
        </div>
        <div className={styles.cardTextCol}>
          <h3 className={styles.cardTitle}>
            {t('homeSections.hero.cards.riskTitle', 'Risk Management')}
          </h3>
          <p className={styles.cardDesc}>
            {t('homeSections.hero.cards.riskDesc', 'Audit trade history, calculate mathematical position sizing, and protect capital with strict drawdown limits.')}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
