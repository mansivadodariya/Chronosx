'use client';

import React from 'react';
import styles from '../customBotBuilder.module.scss';

function ErrorAlertIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
            <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
            />
        </svg>
    );
}

export default function StepExitRules({ data, errors = {}, onChange }) {
    const { takeProfitPips, stopLossPips, trailingStop, trailingDistance, trailingStep } = data;

    return (
        <div className={styles.stepContentWrapper}>
            {/* Take Profit & Stop Loss 2-Card Grid */}
            <div className={styles.gridTwoCols}>
                {/* Take Profit Card */}
                <div className={`${styles.exitCard} ${styles.takeProfitCard}`}>
                    <div className={styles.exitCardHeader}>
                        <div className={styles.exitIconBoxGreen}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="12" cy="12" r="6" />
                                <circle cx="12" cy="12" r="2" />
                            </svg>
                        </div>
                        <h3 className={styles.exitCardTitle}>Take Profit</h3>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            Pips from entry <span className={styles.requiredStar}>*</span>
                        </label>
                        <input
                            type="number"
                            className={`${styles.textInput} ${errors.takeProfitPips ? styles.inputError : ''}`}
                            placeholder="e.g. 50"
                            value={takeProfitPips}
                            onChange={(e) => onChange('takeProfitPips', e.target.value)}
                        />
                        {errors.takeProfitPips && (
                            <span className={styles.errorHelperText}>
                                <ErrorAlertIcon />
                                {errors.takeProfitPips}
                            </span>
                        )}
                        <span className={styles.exitHelperText}>
                            Bot closes the trade in profit when price moves this many pips in your favor.
                        </span>
                    </div>
                </div>

                {/* Stop Loss Card */}
                <div className={`${styles.exitCard} ${styles.stopLossCard}`}>
                    <div className={styles.exitCardHeader}>
                        <div className={styles.exitIconBoxRed}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <path d="m9 12 2 2 4-4" />
                            </svg>
                        </div>
                        <h3 className={styles.exitCardTitle}>Stop Loss</h3>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            Pips from entry <span className={styles.requiredStar}>*</span>
                        </label>
                        <input
                            type="number"
                            className={`${styles.textInput} ${errors.stopLossPips ? styles.inputError : ''}`}
                            placeholder="e.g. 25"
                            value={stopLossPips}
                            onChange={(e) => onChange('stopLossPips', e.target.value)}
                        />
                        {errors.stopLossPips && (
                            <span className={styles.errorHelperText}>
                                <ErrorAlertIcon />
                                {errors.stopLossPips}
                            </span>
                        )}
                        <span className={styles.exitHelperText}>
                            Bot closes the trade at a loss when price moves this many pips against you.
                        </span>
                    </div>
                </div>
            </div>

            {/* Trailing Stop Card */}
            <div className={styles.trailingCard}>
                <div className={styles.trailingHeader}>
                    <div className={styles.trailingLeft}>
                        <div className={styles.exitIconBoxCyan}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                        </div>
                        <div>
                            <h3 className={styles.exitCardTitle}>Trailing Stop (Optional)</h3>
                            <span className={styles.exitHelperText}>
                                Lock in profits by dynamically adjusting your stop loss as price advances in your favor
                            </span>
                        </div>
                    </div>

                    <label className={styles.switchWrapper}>
                        <input
                            type="checkbox"
                            checked={trailingStop}
                            onChange={(e) => onChange('trailingStop', e.target.checked)}
                        />
                        <span className={styles.switchSlider}></span>
                    </label>
                </div>

                {trailingStop && (
                    <div className={styles.trailingParamsRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                Trailing Distance (Pips) <span className={styles.requiredStar}>*</span>
                            </label>
                            <input
                                type="number"
                                className={`${styles.textInput} ${errors.trailingDistance ? styles.inputError : ''}`}
                                placeholder="e.g. 20"
                                value={trailingDistance}
                                onChange={(e) => onChange('trailingDistance', e.target.value)}
                            />
                            {errors.trailingDistance && (
                                <span className={styles.errorHelperText}>
                                    <ErrorAlertIcon />
                                    {errors.trailingDistance}
                                </span>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                Trailing Step (Pips) <span className={styles.requiredStar}>*</span>
                            </label>
                            <input
                                type="number"
                                className={`${styles.textInput} ${errors.trailingStep ? styles.inputError : ''}`}
                                placeholder="e.g. 5"
                                value={trailingStep}
                                onChange={(e) => onChange('trailingStep', e.target.value)}
                            />
                            {errors.trailingStep && (
                                <span className={styles.errorHelperText}>
                                    <ErrorAlertIcon />
                                    {errors.trailingStep}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
