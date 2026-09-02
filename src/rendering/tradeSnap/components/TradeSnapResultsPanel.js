'use client';

import React from 'react';
import Loader from '@/components/loader';
import { ClockIcon } from '@/icons/tradeSnapIcons';
import AiSnapDashboard from './AiSnapDashboard';
import styles from '../tradeSnap.module.scss';

export default function TradeSnapResultsPanel({
    isAnalyzing,
    allAnalyses
}) {
    return (
        <div className={styles.resultsColumn}>
            <div className={styles.resultsPanel}>
                <div className={styles.resultsHeader}>
                    <h3>Analysis Results</h3>
                </div>
                <div className={styles.resultsBody}>
                    {isAnalyzing && (
                        <div className={styles.spinnerWrap}>
                            <Loader centered />
                        </div>
                    )}
                    {allAnalyses.map((analysis, analysisIndex) => {
                        const formatted = new Date(analysis.timestamp).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                        });
                        return (
                            <div key={`history-${analysisIndex}`} className={styles.historyGroup}>
                                <div className={styles.historyTime}>
                                    <ClockIcon />
                                    Analysis at {formatted}
                                </div>
                                {analysis.data.map((trade, tradeIndex) => (
                                    <AiSnapDashboard
                                        key={`trade-${analysisIndex}-${tradeIndex}`}
                                        rawData={trade}
                                    />
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
