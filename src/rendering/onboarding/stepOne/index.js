'use client';
import React, { useState } from 'react';
import classNames from 'classnames';
import styles from './stepOne.module.scss';

// Clean SVG Vector Icons
const ScalpingIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#18C98B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const DayTradingIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="#18C98B" strokeWidth="2" />
        <path d="M12 7V12L15 14.5" stroke="#18C98B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const SwingTradingIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 16.5L8.5 11L12.5 15L20.5 7" stroke="#18C98B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 7H20.5V12.5" stroke="#18C98B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const PositionTradingIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 20V14" stroke="#18C98B" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M12 20V10" stroke="#18C98B" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M18 20V5" stroke="#18C98B" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
);

const AlgoIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="16" height="16" rx="4" stroke="#18C98B" strokeWidth="2" />
        <path d="M9 9H15M9 12H15M9 15H13" stroke="#18C98B" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const QuestionIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="#18C98B" strokeWidth="2" />
        <path d="M9.5 9.5C9.5 8.12 10.62 7 12 7C13.38 7 14.5 8.12 14.5 9.5C14.5 10.6 13.78 11.53 12.8 11.85C12.33 12.01 12 12.44 12 12.94V13.5" stroke="#18C98B" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="16.5" r="1" fill="#18C98B" />
    </svg>
);

const TRADE_OPTIONS = [
    {
        id: 'scalping',
        timeframe: '1M – 5M EXECUTIONS',
        label: 'Scalping',
        desc: 'Rapid momentum trades targeting small pip increments with high frequency.',
        icon: ScalpingIcon,
    },
    {
        id: 'day_trading',
        timeframe: '15M – 1H INTRADAY',
        label: 'Day Trading',
        desc: 'Positions opened and closed within the same trading session, zero overnight risk.',
        icon: DayTradingIcon,
    },
    {
        id: 'swing_trading',
        timeframe: '4H – DAILY SETUPS',
        label: 'Swing Trading',
        desc: 'Multi-day trends capturing larger institutional market structure legs.',
        icon: SwingTradingIcon,
    },
    {
        id: 'position_trading',
        timeframe: 'WEEKLY – MONTHLY MACRO',
        label: 'Position Trading',
        desc: 'Long-term macroeconomic positioning based on fundamental rate differentials.',
        icon: PositionTradingIcon,
    },
    {
        id: 'algorithmic',
        timeframe: 'AUTOMATED & SIGNALS',
        label: 'Algorithmic / Quantitative',
        desc: 'Rule-based strategy execution, indicators, and systematic scanner alerts.',
        icon: AlgoIcon,
    },
    {
        id: 'figuring_out',
        timeframe: 'EXPLORATORY',
        label: "I'm Exploring / Learning",
        desc: 'Discovering optimal timeframes and finding the best match for my schedule.',
        icon: QuestionIcon,
    },
];

export default function StepOne({ selectedOptions: controlledOptions, onToggleOption }) {
    const [internalOptions, setInternalOptions] = useState([]);
    const selectedOptions = controlledOptions !== undefined ? controlledOptions : internalOptions;

    const handleToggle = (id) => {
        if (onToggleOption) {
            onToggleOption(id);
        } else {
            setInternalOptions((prev) =>
                prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
            );
        }
    };

    return (
        <div className={styles.stepContainer}>
            {/* Header Title Section */}
            <div className={styles.headerSection}>
                <div className={styles.tagBadge}>
                    <span className={styles.tagDot} />
                    <span>TRADING HORIZON · STEP 02</span>
                </div>
                <h1 className={styles.mainTitle}>
                    How do you <span className={styles.accentText}>usually trade?</span>
                </h1>
                <p className={styles.subtitle}>
                    Select all strategies and timeframes that apply to your trading style.
                </p>
            </div>

            {/* 6 Grid Trading Style Cards */}
            <div className={styles.optionsGrid}>
                {TRADE_OPTIONS.map((opt) => {
                    const isSelected = selectedOptions.includes(opt.id);
                    const IconComponent = opt.icon;

                    return (
                        <div
                            key={opt.id}
                            className={classNames(styles.optionCard, isSelected && styles.selected)}
                            onClick={() => handleToggle(opt.id)}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleToggle(opt.id);
                                }
                            }}
                        >
                            <div className={styles.cardHeaderRow}>
                                <div className={styles.iconBox}>
                                    <IconComponent />
                                </div>
                                <div className={styles.badgeAndCheckbox}>
                                    <span className={styles.timeframeBadge}>{opt.timeframe}</span>
                                    <div className={classNames(styles.checkbox, isSelected && styles.checked)}>
                                        {isSelected && (
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                                <path d="M20 6L9 17L4 12" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.cardBody}>
                                <h3 className={styles.optionLabel}>{opt.label}</h3>
                                <p className={styles.optionDesc}>{opt.desc}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
