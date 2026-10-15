'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import styles from '../myBots.module.scss';

export default function MyBotsStats({ totalCount, activeCount }) {
    const { t } = useLanguage();

    return (
        <div className={styles.statsBar}>
            <div className={styles.statBox}>
                <span className={styles.statLabel}>{t('myBots.totalStrategies', 'TOTAL STRATEGIES')}</span>
                <span className={styles.statVal}>{totalCount}</span>
            </div>
            <div className={styles.statBox}>
                <span className={styles.statLabel}>{t('myBots.activeDeployments', 'ACTIVE DEPLOYMENTS')}</span>
                <span className={`${styles.statVal} ${styles.activeColor}`}>{activeCount}</span>
            </div>
        </div>
    );
}
