"use client";
import React from 'react';
import { motion } from 'framer-motion';
import styles from './customBotBuilder.module.scss';

export default function FinalCta({ onBuildClick, onMarketplaceClick }) {
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
          <span className={styles.ctaTag}>AI CUSTOM BOT BUILDER</span>
          <h2 className={styles.ctaHeadline}>Your Strategy. Your Rules. Your Bot.</h2>
          <p className={styles.ctaSub}>
            Discover existing strategies, create a bot with AI, or build one from the ground up — then take it directly into backtesting.
          </p>

          <div className={styles.finalCtaGroup}>
            <button className={styles.finalPrimaryBtn} onClick={onBuildClick}>
              BUILD YOUR BOT →
            </button>
            <button className={styles.finalSecondaryBtn} onClick={onMarketplaceClick}>
              EXPLORE BOT MARKETPLACE →
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
