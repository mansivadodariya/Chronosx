'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../aiStrategy.module.scss';
import { getBidiProps } from '@/lib/bidi';
import { ChevronIcon, BrainRobotIcon, accordionVariants } from '@/icons/analysisIcons';

export default function AiIntelligenceSummarySection({
    aiSummary = {},
    isExpanded,
    onToggle,
    t
}) {
    return (
        <div className={styles.premiumAccordion}>
            <div className={styles.premiumAccordionHeader} onClick={onToggle}>
                <span>{t('aiStrategy.intelligenceSummary', 'AI INTELLIGENCE SUMMARY')}</span>
                <ChevronIcon isOpen={isExpanded} />
            </div>
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        key="ai-content"
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        variants={accordionVariants}
                        style={{ overflow: 'hidden' }}
                    >
                        <div className={styles.premiumAccordionBody}>
                            <div className={styles.purpleAiSummaryCard}>
                                <div className={styles.purpleAiHeader}>
                                    <BrainRobotIcon />
                                    <h5>AI ANALYSIS</h5>
                                </div>
                                <h4 {...getBidiProps(aiSummary.headline, styles.purpleAiHeadline)}>
                                    {aiSummary.headline}
                                </h4>

                                <div className={styles.purpleAiBulletsList}>
                                    {aiSummary.trend && (
                                        <div className={styles.aiBulletSection}>
                                            <span className={styles.sectionLabel} style={{ color: '#18C98B' }}>TREND</span>
                                            <p {...getBidiProps(aiSummary.trend)}>{aiSummary.trend}</p>
                                        </div>
                                    )}
                                    {aiSummary.momentum && (
                                        <div className={styles.aiBulletSection}>
                                            <span className={styles.sectionLabel} style={{ color: '#C084FC' }}>MOMENTUM</span>
                                            <p {...getBidiProps(aiSummary.momentum)}>{aiSummary.momentum}</p>
                                        </div>
                                    )}
                                    {aiSummary.volume && (
                                        <div className={styles.aiBulletSection}>
                                            <span className={styles.sectionLabel} style={{ color: '#38BDF8' }}>VOLUME</span>
                                            <p {...getBidiProps(aiSummary.volume)}>{aiSummary.volume}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
