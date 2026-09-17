"use client";
import React from 'react';
import { motion } from 'framer-motion';
import SectionHeader from '@/components/sectionHeader';
import styles from './customBotBuilder.module.scss';

const MarketplaceIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const AiSparkIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M8 9h8" />
    <path d="M8 13h6" />
  </svg>
);

const SettingsWizardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const WAYS = [
  {
    id: "marketplace",
    icon: <MarketplaceIcon />,
    title: "Bot Marketplace",
    tagline: "Discover. Explore. Choose.",
    desc: "Browse ready-to-use trading bots across different strategies, markets, and trading styles.",
    cta: "EXPLORE MARKETPLACE",
    featured: false
  },
  {
    id: "ai-builder",
    icon: <AiSparkIcon />,
    title: "AI Bot Builder",
    tagline: "Tell AI What You Want.",
    desc: "Describe your strategy in natural language and let ChronosX AI help turn your idea into a structured bot.",
    cta: "BUILD WITH AI",
    featured: true
  },
  {
    id: "custom-builder",
    icon: <SettingsWizardIcon />,
    title: "Custom Bot Builder",
    tagline: "Step-by-Step Control.",
    desc: "Configure your own trading bot manually through a guided builder covering basics, entry rules, exit rules, and risk management.",
    cta: "BUILD MANUALLY",
    featured: false
  }
];

export default function ThreeWaysSection({ onSelectWay }) {
  return (
    <section className={styles.threeWaysSection}>
      <div className="container">
        <SectionHeader
          badge="CREATE YOUR WAY"
          title1="One Platform. Three Ways to"
          title2="Build Your Bot."
          description="Whether you want to discover an existing setup or build something completely new, ChronosX gives you the flexibility to choose your workflow."
        />

        <div className={styles.threeWaysGrid}>
          {WAYS.map((way, idx) => (
            <motion.div
              key={way.id}
              className={`${styles.wayCard} ${way.featured ? styles.featuredCard : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              {way.featured && <span className={styles.featuredBadge}>MOST POPULAR</span>}
              <div className={styles.cardIconHeader}>{way.icon}</div>
              <h3 className={styles.cardHeaderTitle}>{way.title}</h3>
              <div className={styles.cardTagline}>{way.tagline}</div>
              <p className={styles.cardBodyText}>{way.desc}</p>
              <button
                className={styles.cardCtaButton}
                onClick={() => onSelectWay && onSelectWay(way.id)}
              >
                {way.cta}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
