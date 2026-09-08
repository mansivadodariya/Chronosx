"use client";
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import styles from './testimonials.module.scss';
import SectionHeader from '@/components/sectionHeader';

const testimonialsData = [
  {
    rating: 5,
    quote: '"The signals are sharp and the AI analysis explains the reasoning behind every setup. My entries have never been cleaner."',
    initials: 'DM',
    name: 'Daniel Mercer',
    role: 'Full-Time Forex Trader'
  },
  {
    rating: 5,
    quote: '"I upload a chart, get a full trade plan with entry, target and risk in seconds. It replaced hours of manual work."',
    initials: 'AR',
    name: 'Aisha Rahman',
    role: 'Swing Trader'
  },
  {
    rating: 5,
    quote: '"Risk management tools alone are worth it. The AI keeps me disciplined and out of low-quality trades."',
    initials: 'MV',
    name: 'Marcus Vela',
    role: 'Prop Firm Trader'
  },
  {
    rating: 5,
    quote: '"The breakout confirmation alerts caught the entire gold surge before the London open. Absolute game changer."',
    initials: 'LV',
    name: 'Liam Vance',
    role: 'Commodities Trader'
  },
  {
    rating: 5,
    quote: '"Having institutional heat list rankings mapped alongside raw price action completely eliminated second-guessing."',
    initials: 'ER',
    name: 'Elena Rostova',
    role: 'Quant Trader'
  },
  {
    rating: 5,
    quote: '"Backtesting my custom ICT strategies against 5 years of tick data gave me the edge I needed to get funded."',
    initials: 'LT',
    name: 'Lucas Thorne',
    role: 'Funded Account Trader'
  }
];

export default function Testimonials() {
  const { t } = useLanguage();
  // Triple array for perfectly seamless continuous scroll
  const marqueeItems = [...testimonialsData, ...testimonialsData, ...testimonialsData];

  return (
    <div className={styles.testimonials}>
      <div className='container'>
        <SectionHeader
          badge="TESTIMONIALS"
          title1="Used by Serious"
          title2="Forex Traders"
          description="Real reviews from active traders using ChronosX."
        />

        {/* Standard Width Marquee with Foggy Edge Layers */}
        <div className={styles.marqueeWrapper}>
          <div className={styles.fogLeft}></div>
          <div className={styles.fogRight}></div>

          <div className={styles.marqueeTrack}>
            {marqueeItems.map((item, index) => (
              <div key={index} className={styles.card}>
                <div className={styles.stars}>
                  {[...Array(item.rating)].map((_, i) => (
                    <img key={i} src="/assets/icons/star.svg" alt="star" />
                  ))}
                </div>

                <p className={styles.quote}>{item.quote}</p>

                <div className={styles.author}>
                  <div className={styles.avatar}>{item.initials}</div>
                  <div className={styles.authorInfo}>
                    <h4>{item.name}</h4>
                    <span>{item.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
