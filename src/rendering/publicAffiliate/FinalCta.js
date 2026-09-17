"use client";
import React from 'react';
import { motion } from 'framer-motion';
import styles from './publicAffiliate.module.scss';

export default function FinalCta({ onJoinClick, onTiersClick }) {
  return (
    <section className={styles.finalCtaSection}>
      <div className="container">
        <motion.div
          className={styles.finalCtaCard}
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className={styles.ctaTag}>CHRONOSX AFFILIATE PROGRAM</span>
          <h2 className={styles.ctaHeadline}>Start Earning Recurring Commissions Today</h2>
          <p className={styles.ctaSub}>
            Join hundreds of partners sharing ChronosX with their network.
          </p>

          <div className={styles.finalCtaGroup}>
            <button className={styles.finalPrimaryBtn} onClick={onJoinClick}>
              JOIN AFFILIATE PROGRAM →
            </button>
            <button className={styles.finalSecondaryBtn} onClick={onTiersClick}>
              VIEW COMMISSION DETAILS →
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
