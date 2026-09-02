'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../aiStrategy.module.scss';
import { ChevronIcon, CircleCheckIcon, getScoreColor, accordionVariants } from '@/icons/analysisIcons';

export default function EvidenceSection({
    evidence = {},
    isExpanded,
    onToggle,
    evidenceSubToggles,
    onToggleSub,
    title = 'EVIDENCE'
}) {
    return (
        <div className={styles.premiumAccordion}>
            <div className={styles.premiumAccordionHeader} onClick={onToggle}>
                <span>{title}</span>
                <ChevronIcon isOpen={isExpanded} />
            </div>
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        key="evidence-content"
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        variants={accordionVariants}
                        style={{ overflow: 'hidden' }}
                    >
                        <div className={styles.premiumAccordionBody}>
                            {Object.entries(evidence).map(([key, data]) => {
                                if (!data.details || data.details.length === 0) return null;
                                const isSubOpen = evidenceSubToggles[key];
                                const itemColor = getScoreColor(data.label);

                                return (
                                    <div
                                        key={key}
                                        className={`${styles.evidenceOutlinedGroup} ${styles[key] || ''}`}
                                    >
                                        <div
                                            className={styles.evidenceGroupClickableHeader}
                                            onClick={(e) => onToggleSub(key, e)}
                                        >
                                            <div className={styles.evidenceTitleGroup}>
                                                <span className={styles.groupTypeTitle}>{key.toUpperCase()}</span>
                                                <span className={styles.groupTypeAction} style={{ color: itemColor }}>
                                                    {data.label}
                                                </span>
                                            </div>
                                            <ChevronIcon isOpen={isSubOpen} className={styles.subChevron} />
                                        </div>

                                        <AnimatePresence initial={false}>
                                            {isSubOpen && (
                                                <motion.div
                                                    key={`evidence-sub-${key}`}
                                                    initial="collapsed"
                                                    animate="expanded"
                                                    exit="collapsed"
                                                    variants={accordionVariants}
                                                    style={{ overflow: 'hidden' }}
                                                >
                                                    <div className={styles.evidenceCollapsedBulletArea}>
                                                        <ul className={styles.evidenceOutlineBulletList}>
                                                            {data.details.map((detail, idx) => (
                                                                <li key={idx} className={styles.evidenceBulletItem}>
                                                                    <CircleCheckIcon color={itemColor} />
                                                                    <span>{detail}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
