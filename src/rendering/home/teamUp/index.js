"use client";
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import styles from './teamUp.module.scss';
import SectionHeader from '@/components/sectionHeader';

const pillars = [
  {
    icon: '/assets/icons/hex-chart.svg?v=2',
    title: 'Tier-1 Liquidity Access',
    stat: 'FROM 0.0 PIPS',
    desc: 'Tap directly into deep institutional order books with raw spreads and zero hidden markups.'
  },
  {
    icon: '/assets/icons/hex-shield.svg?v=2',
    title: 'Regulated Broker Partners',
    stat: 'FCA · ASIC · CySEC',
    desc: 'Connect seamlessly to fully licensed brokerages featuring segregated client accounts and top-tier compliance.'
  },
  {
    icon: '/assets/icons/hex-speed.svg?v=2',
    title: 'Ultra-Low Latency Routing',
    stat: '< 12MS LATENCY',
    desc: 'High-speed fiber cross-connects co-located at London (LD4) and New York (NY4) financial data centers.'
  },
  {
    icon: '/assets/icons/hex-users.svg?v=2',
    title: 'Institutional Scale & Uptime',
    stat: '$50B+ ROUTED',
    desc: 'Enterprise-grade matching engine with 99.99% uptime, built to handle massive high-frequency trading volume.'
  }
];

export default function TeamUp() {
  const { t } = useLanguage();
  return (
    <section className={styles.teamUp} aria-label="Supported Brokers and Platforms">

      <div className="container">
        <div className={styles.gridWrapper}>

          {/* Left Column: Clean, Elegant Typography */}
          <motion.div
            className={styles.leftContent}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionHeader
              align="left"
              badge="INSTITUTIONAL INFRASTRUCTURE"
              title1="Direct Market Access to"
              title2="World-Class Liquidity."
              description="Direct connectivity to Tier-1 institutional liquidity providers, high-speed matching engines, and regulated broker bridges—ensuring unmatched speed, ultra-tight spreads, and zero-compromise execution."
            />
          </motion.div>


          {/* Right Column: 2x2 Bento Pillar Grid & Trust Banner */}
          <motion.div
            className={styles.rightContent}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.bentoGrid}>
              {pillars.map((item, idx) => (
                <motion.div
                  key={idx}
                  className={styles.bentoCard}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div className={styles.bentoCardTop}>
                    <div className={styles.iconBox}>
                      <img src={item.icon} alt={item.title} />
                    </div>
                    <span className={styles.statPill}>{item.stat}</span>
                  </div>
                  <h3 className={styles.bentoTitle}>{item.title}</h3>
                  <p className={styles.bentoDesc}>{item.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Bottom Institutional Trust Banner */}
            <motion.div
              className={styles.trustBanner}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.bannerInfo}>
                <span className={styles.verifiedTag}>ENTERPRISE SECURITY VAULT</span>
                <h4>100% NON-CUSTODIAL & SEGREGATED</h4>
                <p><strong>You maintain 100% custody of your trading capital.</strong> ChronosX operates purely as an analytical AI layer and bridge. We never hold, manage, or custody user funds—your capital remains securely deposited with your regulated MT5 broker.</p>
              </div>
              <div className={styles.shieldVisual}>
                <img src="/assets/images/shield-network.svg?v=2" alt="Security Shield" />
              </div>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
