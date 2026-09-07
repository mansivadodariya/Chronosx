'use client';

import React, { useState, useEffect } from 'react';
import { ClockIcon } from '@/icons/tradeSnapIcons';
import AiSnapDashboard from './AiSnapDashboard';
import styles from '../tradeSnap.module.scss';

const ANALYZING_PHRASES = [
    { text: 'Scanning chart geometry & candlestick wicks...', progress: 25 },
    { text: 'Detecting order blocks, imbalances & liquidity pools...', progress: 52 },
    { text: 'Computing multi-timeframe confluence & momentum...', progress: 78 },
    { text: 'Synthesizing trade setup, entry zone & R:R ratio...', progress: 95 },
];

export default function TradeSnapResultsPanel({
    isAnalyzing,
    allAnalyses
}) {
    const [phraseIndex, setPhraseIndex] = useState(0);

    useEffect(() => {
        if (!isAnalyzing) {
            setPhraseIndex(0);
            return;
        }

        const interval = setInterval(() => {
            setPhraseIndex((prev) => (prev + 1) % ANALYZING_PHRASES.length);
        }, 1400);

        return () => clearInterval(interval);
    }, [isAnalyzing]);

    const activePhrase = ANALYZING_PHRASES[phraseIndex];

    return (
        <div className={styles.resultsColumn}>
            <div className={styles.resultsPanel} data-lenis-prevent="true">
                <div className={styles.resultsHeader}>
                    <h3>Analysis Results</h3>
                </div>
                <div className={styles.resultsBody} data-lenis-prevent="true">
                    {isAnalyzing && (
                        <div className={styles.analyzingProgressCard}>
                            <div className={styles.analyzingTopRow}>
                                <div className={styles.analyzingPulseBadge}>
                                    <span className={styles.pulseDot} />
                                    <span>AI QUANT ENGINE</span>
                                </div>
                                <span className={styles.analyzingPercent}>{activePhrase.progress}%</span>
                            </div>

                            <div className={styles.analyzingMessageRow}>
                                <div className={styles.scannerIconWrap}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.scannerIcon}>
                                        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                                        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                                        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                                        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                                        <line x1="7" y1="12" x2="17" y2="12" />
                                    </svg>
                                </div>
                                <p className={styles.analyzingText}>
                                    {activePhrase.text}
                                    <span className={styles.typewriterCursor}>▌</span>
                                </p>
                            </div>

                            <div className={styles.analyzingProgressBarTrack}>
                                <div
                                    className={styles.analyzingProgressBarFill}
                                    style={{ width: `${activePhrase.progress}%` }}
                                />
                            </div>
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
