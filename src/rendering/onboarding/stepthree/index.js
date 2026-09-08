'use client';
import React, { useState } from 'react';
import classNames from 'classnames';
import styles from './stepthree.module.scss';

// High-Definition Official Currency Flag and Asset Vector Icons
const EurUsdIcon = () => (
    <div className={styles.flagPairContainer}>
        {/* EU Flag Disc */}
        <div className={styles.flagDisc}>
            <svg viewBox="0 0 32 32" width="22" height="22">
                <rect width="32" height="32" rx="16" fill="#003399" />
                {/* 12 Gold Stars in circle */}
                <g fill="#FFCC00" transform="translate(16,16) scale(0.65)">
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
                        <circle
                            key={angle}
                            cx={14 * Math.cos((angle * Math.PI) / 180)}
                            cy={14 * Math.sin((angle * Math.PI) / 180)}
                            r="1.6"
                        />
                    ))}
                </g>
            </svg>
        </div>
        {/* US Flag Disc */}
        <div className={`${styles.flagDisc} ${styles.flagDiscOverlap}`}>
            <svg viewBox="0 0 32 32" width="22" height="22">
                <clipPath id="usClip1">
                    <circle cx="16" cy="16" r="16" />
                </clipPath>
                <g clipPath="url(#usClip1)">
                    <rect width="32" height="32" fill="#B22234" />
                    {[3.5, 8.5, 13.5, 18.5, 23.5, 28.5].map((y, i) => (
                        <rect key={i} y={y} width="32" height="2.5" fill="#FFFFFF" />
                    ))}
                    <rect width="15" height="15" fill="#3C3B6E" />
                    <circle cx="4" cy="4" r="1.1" fill="#FFFFFF" />
                    <circle cx="11" cy="4" r="1.1" fill="#FFFFFF" />
                    <circle cx="7.5" cy="7.5" r="1.1" fill="#FFFFFF" />
                    <circle cx="4" cy="11" r="1.1" fill="#FFFFFF" />
                    <circle cx="11" cy="11" r="1.1" fill="#FFFFFF" />
                </g>
            </svg>
        </div>
    </div>
);

const GbpUsdIcon = () => (
    <div className={styles.flagPairContainer}>
        {/* UK Union Jack Disc */}
        <div className={styles.flagDisc}>
            <svg viewBox="0 0 32 32" width="22" height="22">
                <clipPath id="ukClip1">
                    <circle cx="16" cy="16" r="16" />
                </clipPath>
                <g clipPath="url(#ukClip1)">
                    <rect width="32" height="32" fill="#012169" />
                    <path d="M0,0 L32,32 M32,0 L0,32" stroke="#FFFFFF" strokeWidth="4.5" />
                    <path d="M0,0 L32,32 M32,0 L0,32" stroke="#C8102E" strokeWidth="2.5" />
                    <path d="M16,0 V32 M0,16 H32" stroke="#FFFFFF" strokeWidth="7" />
                    <path d="M16,0 V32 M0,16 H32" stroke="#C8102E" strokeWidth="4.2" />
                </g>
            </svg>
        </div>
        {/* US Flag Disc */}
        <div className={`${styles.flagDisc} ${styles.flagDiscOverlap}`}>
            <svg viewBox="0 0 32 32" width="22" height="22">
                <clipPath id="usClip2">
                    <circle cx="16" cy="16" r="16" />
                </clipPath>
                <g clipPath="url(#usClip2)">
                    <rect width="32" height="32" fill="#B22234" />
                    {[3.5, 8.5, 13.5, 18.5, 23.5, 28.5].map((y, i) => (
                        <rect key={i} y={y} width="32" height="2.5" fill="#FFFFFF" />
                    ))}
                    <rect width="15" height="15" fill="#3C3B6E" />
                    <circle cx="4" cy="4" r="1.1" fill="#FFFFFF" />
                    <circle cx="11" cy="4" r="1.1" fill="#FFFFFF" />
                    <circle cx="7.5" cy="7.5" r="1.1" fill="#FFFFFF" />
                    <circle cx="4" cy="11" r="1.1" fill="#FFFFFF" />
                    <circle cx="11" cy="11" r="1.1" fill="#FFFFFF" />
                </g>
            </svg>
        </div>
    </div>
);

const UsdJpyIcon = () => (
    <div className={styles.flagPairContainer}>
        {/* US Flag Disc */}
        <div className={styles.flagDisc}>
            <svg viewBox="0 0 32 32" width="22" height="22">
                <clipPath id="usClip3">
                    <circle cx="16" cy="16" r="16" />
                </clipPath>
                <g clipPath="url(#usClip3)">
                    <rect width="32" height="32" fill="#B22234" />
                    {[3.5, 8.5, 13.5, 18.5, 23.5, 28.5].map((y, i) => (
                        <rect key={i} y={y} width="32" height="2.5" fill="#FFFFFF" />
                    ))}
                    <rect width="15" height="15" fill="#3C3B6E" />
                    <circle cx="4" cy="4" r="1.1" fill="#FFFFFF" />
                    <circle cx="11" cy="4" r="1.1" fill="#FFFFFF" />
                    <circle cx="7.5" cy="7.5" r="1.1" fill="#FFFFFF" />
                    <circle cx="4" cy="11" r="1.1" fill="#FFFFFF" />
                    <circle cx="11" cy="11" r="1.1" fill="#FFFFFF" />
                </g>
            </svg>
        </div>
        {/* Japan Hinomaru Disc */}
        <div className={`${styles.flagDisc} ${styles.flagDiscOverlap}`}>
            <svg viewBox="0 0 32 32" width="22" height="22">
                <rect width="32" height="32" rx="16" fill="#FFFFFF" />
                <circle cx="16" cy="16" r="7.5" fill="#BC002D" />
            </svg>
        </div>
    </div>
);

const GoldIcon = () => (
    <div className={styles.goldBullionBadge}>
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            {/* 3D Stacked Gold Ingots */}
            <path d="M10 5L15 2H23L28 5L23 8H15L10 5Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1.2" />
            <path d="M15 8H23L28 5V7.5L23 10.5H15L10 7.5V5L15 8Z" fill="#D97706" />
            <path d="M4 14L9 11H19L24 14L19 17H9L4 14Z" fill="#FDE047" stroke="#FBBF24" strokeWidth="1.2" />
            <path d="M9 17H19L24 14V17L19 20H9L4 17V14L9 17Z" fill="#D97706" />
            <path d="M12 21L17 18H27L31 21L27 24H17L12 21Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.2" />
            <path d="M17 24H27L31 21V24L27 27H17L12 24V21L17 24Z" fill="#92400E" />
        </svg>
    </div>
);

const GbpJpyIcon = () => (
    <div className={styles.flagPairContainer}>
        {/* UK Union Jack Disc */}
        <div className={styles.flagDisc}>
            <svg viewBox="0 0 32 32" width="22" height="22">
                <clipPath id="ukClip2">
                    <circle cx="16" cy="16" r="16" />
                </clipPath>
                <g clipPath="url(#ukClip2)">
                    <rect width="32" height="32" fill="#012169" />
                    <path d="M0,0 L32,32 M32,0 L0,32" stroke="#FFFFFF" strokeWidth="4.5" />
                    <path d="M0,0 L32,32 M32,0 L0,32" stroke="#C8102E" strokeWidth="2.5" />
                    <path d="M16,0 V32 M0,16 H32" stroke="#FFFFFF" strokeWidth="7" />
                    <path d="M16,0 V32 M0,16 H32" stroke="#C8102E" strokeWidth="4.2" />
                </g>
            </svg>
        </div>
        {/* Japan Hinomaru Disc */}
        <div className={`${styles.flagDisc} ${styles.flagDiscOverlap}`}>
            <svg viewBox="0 0 32 32" width="22" height="22">
                <rect width="32" height="32" rx="16" fill="#FFFFFF" />
                <circle cx="16" cy="16" r="7.5" fill="#BC002D" />
            </svg>
        </div>
    </div>
);

const CryptoIcon = () => (
    <div className={styles.flagPairContainer}>
        {/* Bitcoin ₿ Badge */}
        <div className={styles.flagDisc}>
            <svg viewBox="0 0 32 32" width="22" height="22">
                <circle cx="16" cy="16" r="16" fill="#F7931A" />
                <path
                    d="M21.5 13.5C21.9 12.3 21.2 10.9 19.3 10.4L18.8 8.6L17.7 8.9L18.2 10.7C17.9 10.8 17.6 10.9 17.3 11L16.8 9.2L15.7 9.5L16.2 11.3C15.9 11.4 15.6 11.5 15.3 11.6L13.8 11.2L13.4 12.7C13.4 12.7 14.2 12.9 14.2 12.9C14.6 13 14.7 13.3 14.6 13.6L13.3 18.7C13.2 18.9 13 19 12.7 18.9C12.7 18.9 11.9 18.7 11.9 18.7L11.2 20.3L12.7 20.7C13 20.8 13.3 20.9 13.6 21L13.1 23L14.2 22.7L14.7 20.7C15 20.8 15.3 20.9 15.6 21L15.1 23L16.2 22.7L16.7 20.7C18.6 21 20.1 20.6 20.7 18.9C21.2 17.5 20.7 16.7 19.8 16.2C20.5 15.8 21 14.9 20.7 13.7M18.8 18.3C18.5 19.6 16.2 18.8 15.3 18.6L16 15.9C16.9 16.1 19.2 16.9 18.8 18.3M19.1 14.3C18.8 15.5 16.9 14.8 16.1 14.6L16.7 12.2C17.5 12.4 19.4 13.1 19.1 14.3Z"
                    fill="#FFFFFF"
                />
            </svg>
        </div>
        {/* Ethereum Ξ Badge */}
        <div className={`${styles.flagDisc} ${styles.flagDiscOverlap}`}>
            <svg viewBox="0 0 32 32" width="22" height="22">
                <circle cx="16" cy="16" r="16" fill="#627EEA" />
                <path d="M16 4L15.8 4.6V20.2L16 20.4L22.5 16.5L16 4Z" fill="#FFFFFF" fillOpacity="0.6" />
                <path d="M16 4L9.5 16.5L16 20.4V4Z" fill="#FFFFFF" />
                <path d="M16 21.8L15.9 22V27.6L16 28L22.5 18L16 21.8Z" fill="#FFFFFF" fillOpacity="0.6" />
                <path d="M16 28V21.8L9.5 18L16 28Z" fill="#FFFFFF" />
            </svg>
        </div>
    </div>
);

const IndicesIcon = () => (
    <div className={styles.indicesBoxBadge}>
        <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="16" width="4" height="9" rx="1" fill="#10B981" />
            <rect x="9" y="10" width="4" height="15" rx="1" fill="#10B981" />
            <rect x="16" y="13" width="4" height="12" rx="1" fill="#EF4444" />
            <rect x="23" y="5" width="4" height="20" rx="1" fill="#10B981" />
            <path d="M4 14L11 8L18 11L25 3M25 3H20M25 3V8" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </div>
);

const CommoditiesIcon = () => (
    <div className={styles.commoditiesBoxBadge}>
        <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            {/* Oil Barrel & Flame */}
            <path d="M8 8C8 6.5 11 5 15 5C19 5 22 6.5 22 8V20C22 21.5 19 23 15 23C11 23 8 21.5 8 20V8Z" stroke="#F59E0B" strokeWidth="1.8" />
            <ellipse cx="15" cy="8" rx="7" ry="3" stroke="#F59E0B" strokeWidth="1.8" />
            <path d="M8 14C8 15.5 11 17 15 17C19 17 22 15.5 22 14" stroke="#F59E0B" strokeWidth="1.8" />
            <path d="M15 10C13.5 12 12.5 13.5 12.5 14.5C12.5 15.8 13.6 16.8 15 16.8C16.4 16.8 17.5 15.8 17.5 14.5C17.5 13.5 16.5 12 15 10Z" fill="#F59E0B" />
        </svg>
    </div>
);

const MARKET_OPTIONS = [
    {
        id: 'eur_usd',
        title: 'EUR / USD',
        category: 'FOREX MAJOR',
        desc: 'Euro vs. US Dollar',
        icon: EurUsdIcon,
    },
    {
        id: 'gbp_usd',
        title: 'GBP / USD',
        category: 'FOREX MAJOR',
        desc: 'British Pound vs. US Dollar',
        icon: GbpUsdIcon,
    },
    {
        id: 'usd_jpy',
        title: 'USD / JPY',
        category: 'FOREX MAJOR',
        desc: 'US Dollar vs. Japanese Yen',
        icon: UsdJpyIcon,
    },
    {
        id: 'xau_usd',
        title: 'XAU / USD (Gold)',
        category: 'COMMODITIES',
        desc: 'Spot Gold vs. US Dollar',
        icon: GoldIcon,
    },
    {
        id: 'gbp_jpy',
        title: 'GBP / JPY',
        category: 'FOREX CROSS',
        desc: 'British Pound vs. Japanese Yen',
        icon: GbpJpyIcon,
    },
    {
        id: 'crypto',
        title: 'Crypto / Digital Assets',
        category: 'CRYPTO ASSETS',
        desc: 'BTC, ETH, SOL & Top Liquidity Pairs',
        icon: CryptoIcon,
    },
    {
        id: 'indices',
        title: 'Global Indices',
        category: 'EQUITIES & FUTURES',
        desc: 'US30, NAS100, SPX500, DAX40',
        icon: IndicesIcon,
    },
    {
        id: 'other',
        title: 'Energy & Commodities',
        category: 'COMMODITIES',
        desc: 'USOIL, UKOIL, Silver & Exotics',
        icon: CommoditiesIcon,
    },
];

export default function Stepthree({ selectedOptions: controlledOptions, onToggleOption }) {
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
                    <span>MARKET SELECTION · STEP 04</span>
                </div>
                <h1 className={styles.mainTitle}>
                    Which markets <span className={styles.accentText}>do you trade?</span>
                </h1>
                <p className={styles.subtitle}>
                    Pick your priority financial instruments. ChronosX will stream live data and priority scanner alerts for these pairs.
                </p>
            </div>

            {/* 8 Grid Market Pairs */}
            <div className={styles.marketsGrid}>
                {MARKET_OPTIONS.map((opt) => {
                    const isSelected = selectedOptions.includes(opt.id);
                    const IconComponent = opt.icon;

                    return (
                        <div
                            key={opt.id}
                            className={classNames(styles.marketCard, isSelected && styles.selected)}
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
                                    <span className={styles.categoryBadge}>{opt.category}</span>
                                    <div className={classNames(styles.checkbox, isSelected && styles.checked)}>
                                        {isSelected && (
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                                <path d="M20 6L9 17L4 12" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.cardBody}>
                                <h3 className={styles.marketTitle}>{opt.title}</h3>
                                <p className={styles.marketDesc}>{opt.desc}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Preference Notice */}
            <div className={styles.preferenceNotice}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>You can customize your watched instruments anytime from Dashboard Settings.</span>
            </div>
        </div>
    );
}
