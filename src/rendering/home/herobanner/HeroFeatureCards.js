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
      {/* 1. Left Card: AI Chart Scanner */}
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
          <div className={styles.cardHeaderRow}>
            <h3 className={styles.cardTitle}>
              {t('header.products.chartScanner.title', 'AI Chart Scanner')}
            </h3>
            <span className={styles.cardMiniBadge}>VISION</span>
          </div>
          <p className={styles.cardDesc}>
            {t('homeSections.hero.cards.analysisDesc', 'Multi-timeframe technical pattern detection and neural OCR chart vision.')}
          </p>
        </div>
      </div>

      {/* 2. Center Card: AI Strategy Core (Tilted Angle) */}
      <div
        className={`${styles.featureCard} ${styles.cardTilted}`}
        onClick={() => authNavigate(router, '/strategy-core')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && authNavigate(router, '/strategy-core')}
      >
        <div className={styles.cardIconBox}>
          <TrendChartIcon className={styles.cardSvgIcon} width={38} height={38} />
        </div>
        <div className={styles.cardTextCol}>
          <div className={styles.cardHeaderRow}>
            <h3 className={styles.cardTitle}>
              {t('header.products.strategyHub.title', 'AI Strategy Core')}
            </h3>
            <span className={styles.cardMiniBadge}>ALGO</span>
          </div>
          <p className={styles.cardDesc}>
            {t('homeSections.hero.cards.strategyDesc', 'Execute live market intelligence, algorithmic playbooks, and quant signals.')}
          </p>
        </div>
      </div>

      {/* 3. Right Card: AI Trade Advisor */}
      <div
        className={`${styles.featureCard} ${styles.cardNormal}`}
        onClick={() => authNavigate(router, '/trade-advisor')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && authNavigate(router, '/trade-advisor')}
      >
        <div className={styles.cardIconBox}>
          <RiskAlertIcon className={styles.cardSvgIcon} width={38} height={38} />
        </div>
        <div className={styles.cardTextCol}>
          <div className={styles.cardHeaderRow}>
            <h3 className={styles.cardTitle}>
              {t('header.tradingTools.tradeAudit.title', 'AI Trade Advisor')}
            </h3>
            <span className={styles.cardMiniBadge}>ADVISOR</span>
          </div>
          <p className={styles.cardDesc}>
            {t('homeSections.hero.cards.riskDesc', 'Review historical trading data to evaluate performance, win rates, and max drawdowns.')}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
