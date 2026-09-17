'use client';

import React, { useMemo } from 'react';
import styles from '../aiStrategy.module.scss';
import { useLanguage } from '@/context/LanguageContext';

export default function StrategyCategoryTabs({
    strategies = [],
    selectedStrategyId,
    onSelectStrategyId,
    activeCategory,
    onSelectCategory
}) {
    const { t } = useLanguage();

    // Dynamically build category / strategy tabs from the API response (without 'All Strategies')
    const dynamicTabs = useMemo(() => {
        const tabs = [];
        if (Array.isArray(strategies) && strategies.length > 0) {
            strategies.forEach(st => {
                const id = st.id || st.strategy_id;
                const label = st.name || st.title || st.strategy_name || st.description || 'EMA Pullback';
                tabs.push({ id, label });
            });
        } else {
            tabs.push({ id: '3e8d2b78-0e86-4fdf-9759-338276db1742', label: 'EMA Pullback' });
        }
        return tabs;
    }, [strategies]);

    const isTabActive = (tabId, index) => {
        if (!selectedStrategyId && !activeCategory) {
            return index === 0;
        }
        return selectedStrategyId === tabId || activeCategory === tabId;
    };

    const handleTabClick = (tab) => {
        if (onSelectCategory) onSelectCategory(tab.id);
        if (onSelectStrategyId) onSelectStrategyId(tab.id);
    };

    return (
        <div className={styles.strategyCategoryFilterBar} role="toolbar" aria-label="Strategy Category Filter">
            {/* Filter by Category Header */}
            <div className={styles.filterTitleGroup}>
                <svg
                    className={styles.filterIcon}
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                <span>{t('aiStrategy.filterByCategory', 'Filter by Strategy')}</span>
            </div>

            {/* Category Pills Track */}
            <div className={styles.categoryPillsTrack}>
                {dynamicTabs.map((tab, idx) => {
                    const isActive = isTabActive(tab.id, idx);

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            className={`${styles.categoryPill} ${isActive ? styles.activeCategoryPill : ''}`}
                            onClick={() => handleTabClick(tab)}
                            aria-pressed={isActive}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

