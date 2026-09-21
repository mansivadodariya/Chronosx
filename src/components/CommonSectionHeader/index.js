'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import styles from './commonSectionHeader.module.scss';
import {
    MyBotsIcon,
    AiBotSparkIcon,
    CustomBotIcon,
    BotLibraryIcon,
} from '@/icons/sidebarIcons';

const PATH_ICON_MAP = {
    '/my-bots': <MyBotsIcon width={28} height={28} />,
    '/ai-bot-builder': <AiBotSparkIcon width={28} height={28} />,
    '/bot-builder': <AiBotSparkIcon width={28} height={28} />,
    '/manual-bot-builder': <CustomBotIcon width={28} height={28} />,
    '/custom-bot-builder': <CustomBotIcon width={28} height={28} />,
    '/bot-library': <BotLibraryIcon width={28} height={28} />,
    '/browse-bots': <BotLibraryIcon width={28} height={28} />,
};

export default function CommonSectionHeader({
    badge = 'CHRONOSX AI TRADING DESK',
    badgeIcon = null,
    icon,
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
    const pathname = usePathname();
    const resolvedIcon = icon !== undefined 
        ? icon 
        : (pathname ? PATH_ICON_MAP[pathname] || null : null);

    return (
        <div className={`${styles.sectionHeaderCard} ${!isCard ? styles.inlineHeader : ''} ${className}`}>
            <div className={styles.headerLayoutRow}>
                {resolvedIcon && (
                    <div className={styles.bigIconBox}>
                        {resolvedIcon}
                    </div>
                )}

                <div className={styles.headerContentCol}>
                    {/* Top Row: Tag Pill Badge & Action Tools */}
                    <div className={styles.headerTopRow}>
                        {badge && (
                            <div className={styles.badgePill}>
                                {badgeIcon && (
                                    <span className={styles.badgeIconWrap}>
                                        {badgeIcon}
                                    </span>
                                )}
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
                </div>
            </div>

            {/* Optional Embedded Children (Chart, Metrics, etc.) */}
            {children}
        </div>
    );
}
