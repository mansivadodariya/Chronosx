"use client";
import React from 'react';
import { motion } from 'framer-motion';
import styles from '../aiCockpit.module.scss';

export default function AiCockpitIntelDeck({
  cockpitSubTab,
  setCockpitSubTab,
  hoveredIntelCard,
  setHoveredIntelCard,
}) {
  return (
    <>
      {/* Cockpit Mode Sub-Tabs with Interactive Luxury Hover */}
      <div className={styles.cockpitSubTabs}>
        <button 
          type="button" 
          className={`${styles.tabLink} ${cockpitSubTab === 'overview' ? styles.tabLinkActive : ''}`}
          onClick={() => setCockpitSubTab('overview')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18M7 16l4-4 4 4 5-6"/>
          </svg>
          <span>Overview</span>
        </button>

        <button 
          type="button" 
          className={`${styles.tabLink} ${cockpitSubTab === 'deep' ? styles.tabLinkActive : ''}`}
          onClick={() => setCockpitSubTab('deep')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          <span>Deep Analysis</span>
        </button>

        <button 
          type="button" 
          className={`${styles.tabLink} ${cockpitSubTab === 'tools' ? styles.tabLinkActive : ''}`}
          onClick={() => setCockpitSubTab('tools')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
          </svg>
          <span>Trading Tools</span>
        </button>
      </div>

      {/* Two High-Impact Intelligence Cards with Mutual Dimming & Respective Hover Animations */}
      <div className={styles.cardsPairGrid}>
        
        {/* Card 1: AI Score Analysis */}
        <div 
          className={`${styles.intelCard} ${styles.scoreCard} ${hoveredIntelCard === 'score' ? styles.cardActiveScore : ''} ${hoveredIntelCard === 'rank' ? styles.cardDimmed : ''}`}
          onMouseEnter={() => setHoveredIntelCard('score')}
          onMouseLeave={() => setHoveredIntelCard(null)}
        >
          <div className={styles.cardTopMeta}>
            <div className={styles.cardHeaderWithIcon}>
              <div className={styles.radarIconBox}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" opacity="0.35" />
                  <path d="M12 3a9 9 0 0 1 9 9" />
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                  <path d="M12 12l5 -5" />
                </svg>
              </div>
              <div>
                <h4 className={styles.cardTitle}>AI Score</h4>
                <p className={styles.cardSub}>Composite analysis</p>
              </div>
            </div>
            <span className={styles.deltaPillGreen}>↑ +3.1</span>
          </div>

          <div className={styles.scoreNumberBlock}>
            <div className={styles.scoreLargeNum}>
              <span className={`${styles.scoreDigits} ${hoveredIntelCard === 'score' ? styles.scoreActiveText : ''}`}>96</span>
              <span className={styles.scoreCurrentBadge}>CURRENT</span>
            </div>

            <div className={styles.scoreVerdict}>
              <span className={styles.verdictText}>Strong Buy</span>
              <span className={styles.confidenceBadge}>97% CONFIDENCE</span>
            </div>
          </div>

          <div className={styles.sliderTrackWrapper}>
            <div className={styles.sliderRangeHeader}>
              <span>0</span>
              <span className={styles.rangeCenterText}>SCORE RANGE</span>
              <span>100</span>
            </div>
            <div className={styles.sliderTrack}>
              <motion.div 
                className={styles.sliderFill} 
                animate={{ 
                  width: hoveredIntelCard === 'score' ? '96%' : '84%',
                  background: hoveredIntelCard === 'score' 
                    ? 'linear-gradient(90deg, #10B981 0%, #34D399 65%, #6EE7B7 100%)' 
                    : 'rgba(255, 255, 255, 0.18)',
                  boxShadow: hoveredIntelCard === 'score' ? '0 0 16px rgba(52, 211, 153, 0.85)' : 'none'
                }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <motion.span 
                  className={styles.sliderKnob} 
                  animate={{ 
                    scale: hoveredIntelCard === 'score' ? 1.35 : 1,
                    borderColor: hoveredIntelCard === 'score' ? '#6EE7B7' : '#10B981',
                    boxShadow: hoveredIntelCard === 'score' ? '0 0 12px #6EE7B7' : '0 0 8px #34D399'
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Card 2: Universe Rank & Sparkline */}
        <div 
          className={`${styles.intelCard} ${styles.rankCard} ${hoveredIntelCard === 'rank' ? styles.cardActiveRank : ''} ${hoveredIntelCard === 'score' ? styles.cardDimmed : ''}`}
          onMouseEnter={() => setHoveredIntelCard('rank')}
          onMouseLeave={() => setHoveredIntelCard(null)}
        >
          <div className={styles.cardTopMeta}>
            <div className={styles.cardHeaderWithIcon}>
              <div className={styles.trophyIconBox}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34" />
                  <path d="M6 4h12a1 1 0 0 1 1 1v4a7 7 0 0 1-14 0V5a1 1 0 0 1 1-1Z" fill="currentColor" fillOpacity="0.2" />
                </svg>
              </div>
              <div>
                <h4 className={styles.cardTitle}>Universe Rank</h4>
                <p className={styles.cardSub}>Of 1,000 assets</p>
              </div>
            </div>
            <span className={styles.deltaPillGreen}>↑ +2</span>
          </div>

          <div className={styles.rankNumberBlock}>
            <div className={styles.rankNumText}>
              <span className={`${styles.rankGoldDigit} ${hoveredIntelCard === 'rank' ? styles.rankActiveText : ''}`}>#1</span>
              <span className={styles.rankOutOf}>/ 1,000</span>
            </div>
            <span className={styles.topPerformerBadge}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              TOP 0.1% PERFORMER
            </span>
          </div>

          <div className={styles.sparklineContainer}>
            <svg viewBox="0 0 220 54" className={styles.sparklineSvg} preserveAspectRatio="none">
              <defs>
                <linearGradient id="eqGlowGradGoldCockpit" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#18c98b" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#18c98b" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#18c98b" stopOpacity="0" />
                </linearGradient>
              </defs>

              {hoveredIntelCard === 'rank' ? (
                <g>
                  {/* Luminous Area Under Upward Equity Curve in Green */}
                  <motion.path
                    d="M 6 46 Q 40 44 80 38 T 130 26 T 175 18 T 205 12 L 205 50 L 6 50 Z"
                    fill="url(#eqGlowGradGoldCockpit)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                  />

                  {/* Moving Upward Equity Surge Curve in Green */}
                  <motion.path
                    d="M 6 46 Q 40 44 80 38 T 130 26 T 175 18 T 205 12"
                    fill="none"
                    stroke="#6EE7B7"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.65, ease: "easeOut" }}
                    filter="drop-shadow(0 0 10px rgba(24, 201, 139, 0.95))"
                  />

                  {/* Peak Tip Dot at Top */}
                  <motion.circle 
                    cx="205" 
                    cy="12" 
                    r="5" 
                    fill="#FFFFFF"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.55 }}
                    filter="drop-shadow(0 0 8px #6EE7B7)"
                  />

                  {/* Pulsating Ping Radar Ring */}
                  <motion.circle 
                    cx="205" 
                    cy="12" 
                    r="8" 
                    fill="none"
                    stroke="#6EE7B7"
                    strokeWidth="1.5"
                    initial={{ scale: 0.8, opacity: 0.9 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.1, ease: "easeOut", delay: 0.6 }}
                  />
                </g>
              ) : (
                <g>
                  <path
                    d="M 6 46 Q 40 44 80 38 T 130 26"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.22)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="130" cy="26" r="3" fill="rgba(255, 255, 255, 0.4)" />
                </g>
              )}
            </svg>
          </div>
        </div>

      </div>
    </>
  );
}
