'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import styles from '../styles/strategyStudio.module.scss';
import { RocketRunIcon, CloseXIcon } from './StudioIcons';

export default function StudioToolbar({
    onRunBacktest,
    loading,
    onClose,
}) {
    const { t } = useLanguage();

    return (
        <div className={styles.studioToolbar} style={{ justifyContent: 'flex-start', minHeight: 'auto', padding: '10px 16px' }}>
            <div className={styles.toolbarActionsRow}>
                <button
                    type="button"
                    className={styles.btnNeonRunBacktest}
                    onClick={onRunBacktest}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <div className={`${styles.spinner} ${styles.spinnerSmall}`} />
                            <span>{t('strategyStudio.simulating', 'Simulating...')}</span>
                        </>
                    ) : (
                        <>
                            <RocketRunIcon size={15} />
                            <span>{t('strategyStudio.runBacktest', 'Run Backtest')}</span>
                        </>
                    )}
                </button>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        title="Close Backtest Panel"
                        style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            color: '#94A3B8',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <CloseXIcon size={12} color="currentColor" />
                        <span>Close</span>
                    </button>
                )}
            </div>
        </div>
    );
}
