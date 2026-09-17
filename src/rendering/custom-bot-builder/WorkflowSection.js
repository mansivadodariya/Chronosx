"use client";
import React from 'react';
import { motion } from 'framer-motion';
import SectionHeader from '@/components/sectionHeader';
import styles from './customBotBuilder.module.scss';

const STEPS = [
  {
    num: "01",
    title: "Define",
    desc: "Start with your trading idea and the market you want to trade."
  },
  {
    num: "02",
    title: "Configure",
    desc: "Set your entry, exit, and risk-management rules."
  },
  {
    num: "03",
    title: "Create",
    desc: "Generate your structured bot configuration."
  },
  {
    num: "04",
    title: "Backtest",
    desc: "Run your bot against historical market data."
  },
  {
    num: "05",
    title: "Refine",
    desc: "Analyze the results, adjust your rules, and test again."
  }
];

export default function WorkflowSection() {
  return (
    <section className={styles.workflowSection}>
      <div className="container">
        <SectionHeader
          badge="FROM IDEA TO BOT"
          title1="Turn Your Trading Idea Into a"
          title2="Structured Bot."
          description="ChronosX brings strategy development into one connected workflow."
        />

        <div className={styles.workflowStepsGrid}>
          {STEPS.map((step, idx) => (
            <motion.div
              key={step.num}
              className={styles.workflowStepCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <div className={styles.stepNumBadge}>{step.num} — STEP</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
