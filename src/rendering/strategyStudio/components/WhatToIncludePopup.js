'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/strategyStudio.module.scss';
import { CloseXIcon, SparklesMiniIcon, ChevronRightMiniIcon, ChevronDownIcon } from './StudioIcons';

export const WHAT_TO_INCLUDE_STEPS = [
    {
        id: 'market',
        category: 'Market and chart',
        shortLabel: 'Market',
        question: 'Which market do you trade?',
        options: [
            { label: '+ EURUSD', text: 'I trade EURUSD.' },
            { label: '+ Gold', text: 'I trade Gold.' },
            { label: '+ Nasdaq', text: 'I trade Nasdaq.' },
            { label: '+ 15 minute chart', text: 'I trade on a 15-minute chart.' },
            { label: '+ 1 hour chart', text: 'I trade on a 1-hour chart.' }
        ]
    },
    {
        id: 'entry',
        category: 'When you enter',
        shortLabel: 'Entry',
        question: 'When do you buy or sell?',
        options: [
            { label: '+ EMA cross', text: 'I enter when EMAs cross.' },
            { label: '+ Breakout', text: 'I enter on a breakout.' },
            { label: '+ RSI bounce', text: 'I enter on an RSI bounce.' }
        ]
    },
    {
        id: 'direction',
        category: 'Long or short',
        shortLabel: 'Direction',
        question: 'Long, short or both?',
        options: [
            { label: '+ Both', text: 'I take both long and short trades.' },
            { label: '+ Long only', text: 'I only take long trades.' },
            { label: '+ Short only', text: 'I only take short trades.' }
        ]
    },
    {
        id: 'stop_loss',
        category: 'Stop loss',
        shortLabel: 'Stop loss',
        question: 'Where does your stop loss go?',
        options: [
            { label: '+ Last swing', text: 'My stop loss is at the last swing.' },
            { label: '+ 20 pips', text: 'My stop loss is 20 pips.' },
            { label: '+ 1.5 ATR', text: 'My stop loss is 1.5 ATR.' }
        ]
    },
    {
        id: 'take_profit',
        category: 'Take profit',
        shortLabel: 'Take profit',
        question: 'Where do you take profit?',
        options: [
            { label: '+ 2 × my risk', text: 'I take profit at 2 times my risk.' },
            { label: '+ Session close', text: 'I take profit at the session close.' },
            { label: '+ Opposite signal', text: 'I take profit on an opposite signal.' }
        ]
    },
    {
        id: 'risk',
        category: 'Risk per trade',
        shortLabel: 'Risk',
        question: 'Not said yet. How much do you risk per trade?',
        options: [
            { label: '+ 0.5%', text: 'I risk 0.5% per trade.' },
            { label: '+ 1%', text: 'I risk 1% per trade.' },
            { label: '+ 2%', text: 'I risk 2% per trade.' }
        ]
    }
];

export default function WhatToIncludePopup({
    isOpen,
    onClose,
    onAppendText
}) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [selectedLabels, setSelectedLabels] = useState(() => new Set());
    const popupRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                // If user clicked the toggle chip button in parent, let toggle handler manage it
                if (e.target.closest && e.target.closest(`.${styles.categoryChipsRow}`)) {
                    return;
                }
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const currentStep = WHAT_TO_INCLUDE_STEPS[currentStepIndex] || WHAT_TO_INCLUDE_STEPS[0];
    const totalSteps = WHAT_TO_INCLUDE_STEPS.length;

    const handleOptionSelect = (opt) => {
        // 1. Append plain-English sentence to input
        if (onAppendText && opt.text) {
            onAppendText(opt.text);
        }

        // 2. Mark this option as selected
        setSelectedLabels((prev) => new Set([...prev, opt.label]));

        // 3. Auto-swipe to next question
        if (currentStepIndex < totalSteps - 1) {
            setTimeout(() => {
                setCurrentStepIndex((prev) => Math.min(totalSteps - 1, prev + 1));
            }, 180);
        }
    };

    return (
        <div ref={popupRef} className={styles.whatToIncludePopup}>
            {/* Header */}
            <div className={styles.wtiHeader}>
                <div className={styles.wtiHeaderLeft}>
                    <SparklesMiniIcon size={15} color="#18C98B" />
                    <span className={styles.wtiHeaderTitle}>What to include</span>
                </div>
                <div className={styles.wtiHeaderRight}>
                    <button
                        type="button"
                        className={styles.wtiCloseBtn}
                        onClick={onClose}
                        title="Close"
                    >
                        <CloseXIcon size={14} />
                    </button>
                </div>
            </div>

            {/* Full-width Equal-spaced Step Tabs Navigation */}
            <div className={styles.wtiStepTabs}>
                {WHAT_TO_INCLUDE_STEPS.map((step, idx) => {
                    const isActive = idx === currentStepIndex;
                    const isPassed = idx < currentStepIndex;
                    return (
                        <button
                            key={step.id}
                            type="button"
                            className={`${styles.wtiStepTab} ${isActive ? styles.wtiStepTabActive : ''} ${isPassed ? styles.wtiStepTabCompleted : ''}`}
                            onClick={() => setCurrentStepIndex(idx)}
                            title={`Step ${idx + 1}: ${step.shortLabel}`}
                        >
                            <span className={styles.wtiStepNum}>
                                {isPassed ? (
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : (
                                    idx + 1
                                )}
                            </span>
                            <span className={styles.wtiStepLabel}>{step.shortLabel}</span>
                        </button>
                    );
                })}
            </div>

            {/* Stepper Progress Line */}
            <div className={styles.wtiProgressTrack}>
                <div
                    className={styles.wtiProgressBar}
                    style={{
                        width: `${((currentStepIndex + 1) / totalSteps) * 100}%`
                    }}
                />
            </div>

            {/* Current Question & Options */}
            <div className={styles.wtiQuestionArea}>
                <div className={styles.wtiQuestionHeader}>
                    <h3 className={styles.wtiQuestionTitle}>
                        {currentStep.question}
                    </h3>
                    <div className={styles.wtiCategoryTag}>
                        {currentStep.category}
                    </div>
                </div>

                <div className={styles.wtiOptionsGrid}>
                    {currentStep.options.map((opt, i) => {
                        const isSelected = selectedLabels.has(opt.label);
                        return (
                            <button
                                key={i}
                                type="button"
                                className={`${styles.wtiOptionBtn} ${isSelected ? styles.wtiOptionBtnSelected : ''}`}
                                onClick={() => handleOptionSelect(opt)}
                            >
                                <span className={styles.wtiOptionPlus}>+</span>
                                <span className={styles.wtiOptionLabel}>
                                    {opt.label.replace(/^\+\s*/, '')}
                                </span>
                                {isSelected && (
                                    <span className={styles.wtiOptionCheck}><ChevronRightMiniIcon size={12} color="#18C98B" style={{marginRight: '4px', verticalAlign: 'middle'}} /> Added</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer Navigation & Note */}
            <div className={styles.wtiFooter}>
                <div className={styles.wtiFooterNav}>
                    <button
                        type="button"
                        className={styles.wtiNavBtn}
                        disabled={currentStepIndex === 0}
                        onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                    >
                        <ChevronDownIcon size={12} color="currentColor" style={{marginRight: '4px', verticalAlign: 'middle', transform: 'rotate(-90deg)'}} /> Back
                    </button>

                    {currentStepIndex < totalSteps - 1 ? (
                        <button
                            type="button"
                            className={styles.wtiNavBtn}
                            onClick={() => setCurrentStepIndex((prev) => prev + 1)}
                        >
                            Skip <ChevronRightMiniIcon size={12} color="currentColor" style={{marginLeft: '4px', verticalAlign: 'middle'}} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            className={`${styles.wtiNavBtn} ${styles.wtiDoneBtn}`}
                            onClick={onClose}
                        >
                            <ChevronRightMiniIcon size={12} color="#ffffff" style={{marginRight: '4px', verticalAlign: 'middle'}} /> Done
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
