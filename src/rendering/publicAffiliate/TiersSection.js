"use client";
import React from 'react';
import { motion } from 'framer-motion';
import SectionHeader from '@/components/sectionHeader';
import styles from './publicAffiliate.module.scss';

export default function TiersSection({ refProp, onJoinClick }) {
  return (
    <section ref={refProp} className={styles.tiersSection}>
      <div className="container">
        <SectionHeader
          badge="COMMISSION & TIERS"
          title1="Higher Traffic."
          title2="Bigger Rewards."
          description="Build your referral network and unlock higher commission opportunities as you reach the applicable program milestones."
        />

        <div className={styles.tiersGrid}>
          {/* Tier 1 Card */}
          <motion.div
            className={styles.tierCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.tierHeader}>
              <div className={styles.tierName}>TIER 1 — STANDARD PARTNER</div>
              <div className={styles.tierRate}>10% <span>Recurring</span></div>
              <p className={styles.tierDesc}>Start earning with the standard affiliate level.</p>
            </div>

            <div className={styles.checklist}>
              <div className={styles.checkItem}><span className={styles.checkIcon}>✓</span> 10% recurring commission</div>
              <div className={styles.checkItem}><span className={styles.checkIcon}>✓</span> Automated payouts according to program terms</div>
              <div className={styles.checkItem}><span className={styles.checkIcon}>✓</span> Minimum withdrawal threshold</div>
              <div className={styles.checkItem}><span className={styles.checkIcon}>✓</span> Standard affiliate analytics</div>
              <div className={styles.checkItem}><span className={styles.checkIcon}>✓</span> Personal referral link</div>
            </div>

            <button className={styles.heroSecondaryBtn} onClick={onJoinClick}>
              START EARNING
            </button>
          </motion.div>

          {/* Tier 2 Pro Partner Card */}
          <motion.div
            className={`${styles.tierCard} ${styles.proTier}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <span className={styles.proBadge}>MOST REWARDING</span>
            <div className={styles.tierHeader}>
              <div className={styles.tierName}>TIER 2 — PRO PARTNER</div>
              <div className={styles.tierRate}>20% <span>Recurring</span></div>
              <p className={styles.tierDesc}>Grow your active referral network and unlock the Pro Partner tier when you meet qualification requirements.</p>
            </div>

            <div className={styles.checklist}>
              <div className={styles.checkItem}><span className={styles.checkIcon}>✓</span> 20% recurring commission</div>
              <div className={styles.checkItem}><span className={styles.checkIcon}>✓</span> Priority partner benefits</div>
              <div className={styles.checkItem}><span className={styles.checkIcon}>✓</span> Enhanced payout options where applicable</div>
              <div className={styles.checkItem}><span className={styles.checkIcon}>✓</span> Lower withdrawal threshold where applicable</div>
              <div className={styles.checkItem}><span className={styles.checkIcon}>✓</span> Dedicated partner support</div>
            </div>

            <button className={styles.heroPrimaryBtn} onClick={onJoinClick}>
              VIEW COMMISSION DETAILS
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
