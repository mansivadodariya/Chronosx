'use client';

import React from 'react';
import styles from './commonSectionHeader.module.scss';

export default function CommonSectionHeader({
    badge = 'CHRONOSX AI TRADING DESK',
    badgeIcon,
    title,
    highlightText,
    emoji,
    subtitle,
    tabs = [],
    activeTab,
    onTabChange,
    rightAction,
    isCard = true,
    className = '',
    children
}) {
    return (
        <div className={`${styles.sectionHeaderCard} ${!isCard ? styles.inlineHeader : ''} ${className}`}>
            {/* Top Row: Tag Pill Badge & Action Tools */}
            <div className={styles.headerTopRow}>
                {badge && (
                    <div className={styles.badgePill}>
                        <span className={styles.badgeIconWrap}>
                            {badgeIcon || (
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="2.5">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                            )}
                        </span>
                        <span>{badge}</span>
                    </div>
                )}

                {rightAction && (
                    <div className={styles.rightActions}>
                        {rightAction}
                    </div>
                )}
            </div>

            {/* Main Row: Title, Highlight, Subtitle, and Tabs */}
            <div className={styles.headerMainRow}>
                <div className={styles.textGroup}>
                    {title && (
                        <h2 className={styles.headline}>
                            {title}{' '}
                            {highlightText && <span className={styles.highlight}>{highlightText}</span>}
                            {emoji && <span className={styles.emoji}>{emoji}</span>}
                        </h2>
                    )}
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>

                {tabs && tabs.length > 0 && (
                    <div className={styles.tabBar}>
                        {tabs.map((tab) => {
                            const tabId = typeof tab === 'string' ? tab : tab.id;
                            const tabLabel = typeof tab === 'string' ? tab : tab.label;
                            const isActive = activeTab === tabId;
                            return (
                                <button
                                    key={tabId}
                                    type="button"
                                    className={`${styles.tabBtn} ${isActive ? styles.activeTab : ''}`}
                                    onClick={() => onTabChange && onTabChange(tabId)}
                                >
                                    {tabLabel}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Optional Embedded Children (Chart, Metrics, etc.) */}
            {children}
        </div>
    );
}
