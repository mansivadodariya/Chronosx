'use client';

import React, { useMemo } from 'react';
import styles from '../aiStrategy.module.scss';
import { STRATEGY_CATEGORIES, PRESET_STRATEGIES } from '../constants/strategyCategories';
import { useLanguage } from '@/context/LanguageContext';

export default function StrategyCategoryTabs({
    selectedStrategyId,
    onSelectStrategyId,
    activeCategory,
    onSelectCategory
}) {
    const { t } = useLanguage();

    // Determine current active category based on activeCategory prop or selectedStrategyId
    const currentActiveCategory = useMemo(() => {
        if (activeCategory) return activeCategory;
        if (!selectedStrategyId) return 'all';

        const matchedStrategy = PRESET_STRATEGIES.find(
            s => s.id === selectedStrategyId || s.name?.toLowerCase() === selectedStrategyId?.toLowerCase()
        );
        return matchedStrategy ? matchedStrategy.category : 'all';
    }, [activeCategory, selectedStrategyId]);

    const handleCategoryClick = (category) => {
        if (onSelectCategory) {
            onSelectCategory(category.id);
        }

        if (category.id === 'all') {
            const defaultStrategy = PRESET_STRATEGIES[0];
            if (onSelectStrategyId && defaultStrategy) {
                onSelectStrategyId(defaultStrategy.id);
            }
            return;
        }

        const targetStrategy = PRESET_STRATEGIES.find(s => s.category === category.id);
        if (targetStrategy && onSelectStrategyId) {
            onSelectStrategyId(targetStrategy.id);
        }
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
                <span>{t('aiStrategy.filterByCategory', 'Filter by Category')}</span>
            </div>

            {/* Category Pills Track */}
            <div className={styles.categoryPillsTrack}>
                {STRATEGY_CATEGORIES.map((cat) => {
                    const isActive = currentActiveCategory === cat.id;

                    return (
                        <button
                            key={cat.id}
                            type="button"
                            className={`${styles.categoryPill} ${isActive ? styles.activeCategoryPill : ''}`}
                            onClick={() => handleCategoryClick(cat)}
                            aria-pressed={isActive}
                        >
                            {cat.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
