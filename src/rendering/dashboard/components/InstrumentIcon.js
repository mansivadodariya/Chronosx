'use client';

import React from 'react';
import { cleanPairSymbol } from '@/lib/unifiedSocket';
import styles from '../dashboard.module.scss';

/* ---------------- Flag Discs (22x22 Vector Circles) ---------------- */

const EUFlagDisc = () => (
    <div className={styles.flagDisc}>
        <svg viewBox="0 0 32 32" width="20" height="20">
            <rect width="32" height="32" rx="16" fill="#003399" />
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
);

const USFlagDisc = ({ overlap = false }) => (
    <div className={`${styles.flagDisc} ${overlap ? styles.flagDiscOverlap : ''}`}>
        <svg viewBox="0 0 32 32" width="20" height="20">
            <clipPath id={`usClip_${overlap ? 'ov' : 'no'}`}>
                <circle cx="16" cy="16" r="16" />
            </clipPath>
            <g clipPath={`url(#usClip_${overlap ? 'ov' : 'no'})`}>
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
);

const UKFlagDisc = ({ overlap = false }) => (
    <div className={`${styles.flagDisc} ${overlap ? styles.flagDiscOverlap : ''}`}>
        <svg viewBox="0 0 32 32" width="20" height="20">
            <clipPath id={`ukClip_${overlap ? 'ov' : 'no'}`}>
                <circle cx="16" cy="16" r="16" />
            </clipPath>
            <g clipPath={`url(#ukClip_${overlap ? 'ov' : 'no'})`}>
                <rect width="32" height="32" fill="#012169" />
                <path d="M0,0 L32,32 M32,0 L0,32" stroke="#FFFFFF" strokeWidth="4.5" />
                <path d="M0,0 L32,32 M32,0 L0,32" stroke="#C8102E" strokeWidth="2.5" />
                <path d="M16,0 V32 M0,16 H32" stroke="#FFFFFF" strokeWidth="7" />
                <path d="M16,0 V32 M0,16 H32" stroke="#C8102E" strokeWidth="4.2" />
            </g>
        </svg>
    </div>
);

const JPYFlagDisc = ({ overlap = false }) => (
    <div className={`${styles.flagDisc} ${overlap ? styles.flagDiscOverlap : ''}`}>
        <svg viewBox="0 0 32 32" width="20" height="20">
            <rect width="32" height="32" rx="16" fill="#FFFFFF" />
            <circle cx="16" cy="16" r="7.5" fill="#BC002D" />
        </svg>
    </div>
);

const AUDFlagDisc = () => (
    <div className={styles.flagDisc}>
        <svg viewBox="0 0 32 32" width="20" height="20">
            <rect width="32" height="32" rx="16" fill="#00008B" />
            <path d="M0,0 L16,16 M16,0 L0,16" stroke="#FFFFFF" strokeWidth="2.5" />
            <path d="M8,0 V16 M0,8 H16" stroke="#FFFFFF" strokeWidth="3.5" />
            <path d="M8,0 V16 M0,8 H16" stroke="#C8102E" strokeWidth="2" />
            <circle cx="23" cy="10" r="1.5" fill="#FFFFFF" />
            <circle cx="25" cy="18" r="1.5" fill="#FFFFFF" />
            <circle cx="21" cy="24" r="1.5" fill="#FFFFFF" />
            <circle cx="16" cy="22" r="1.5" fill="#FFFFFF" />
        </svg>
    </div>
);

const CADFlagDisc = ({ overlap = false }) => (
    <div className={`${styles.flagDisc} ${overlap ? styles.flagDiscOverlap : ''}`}>
        <svg viewBox="0 0 32 32" width="20" height="20">
            <rect width="32" height="32" rx="16" fill="#FF0000" />
            <rect x="8" width="16" height="32" fill="#FFFFFF" />
            <path d="M16 8L17.5 13H21L18 15.5L19.5 20.5L16 17.5L12.5 20.5L14 15.5L11 13H14.5L16 8Z" fill="#FF0000" />
        </svg>
    </div>
);

const CHFFlagDisc = ({ overlap = false }) => (
    <div className={`${styles.flagDisc} ${overlap ? styles.flagDiscOverlap : ''}`}>
        <svg viewBox="0 0 32 32" width="20" height="20">
            <rect width="32" height="32" rx="16" fill="#D52B1E" />
            <rect x="13" y="7" width="6" height="18" fill="#FFFFFF" rx="1" />
            <rect x="7" y="13" width="18" height="6" fill="#FFFFFF" rx="1" />
        </svg>
    </div>
);

/* ---------------- Asset Badges (Gold, Oil, Crypto, Indices) ---------------- */

const GoldAssetIcon = () => (
    <div className={styles.assetBadgeGold}>
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <path d="M10 5L15 2H23L28 5L23 8H15L10 5Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1.2" />
            <path d="M15 8H23L28 5V7.5L23 10.5H15L10 7.5V5L15 8Z" fill="#D97706" />
            <path d="M4 14L9 11H19L24 14L19 17H9L4 14Z" fill="#FDE047" stroke="#FBBF24" strokeWidth="1.2" />
            <path d="M9 17H19L24 14V17L19 20H9L4 17V14L9 17Z" fill="#D97706" />
            <path d="M12 21L17 18H27L31 21L27 24H17L12 21Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.2" />
            <path d="M17 24H27L31 21V24L27 27H17L12 24V21L17 24Z" fill="#92400E" />
        </svg>
    </div>
);

const SilverAssetIcon = () => (
    <div className={styles.assetBadgeSilver}>
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
            <text x="16" y="20" fill="#475569" fontSize="11" fontWeight="800" textAnchor="middle">Ag</text>
        </svg>
    </div>
);

const OilAssetIcon = () => (
    <div className={styles.assetBadgeOil}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 6C6 4.5 9 3 12 3C15 3 18 4.5 18 6V18C18 19.5 15 21 12 21C9 21 6 19.5 6 18V6Z" stroke="#F59E0B" strokeWidth="1.8" />
            <ellipse cx="12" cy="6" rx="6" ry="2.5" stroke="#F59E0B" strokeWidth="1.8" />
            <path d="M6 12C6 13.5 9 15 12 15C15 15 18 13.5 18 12" stroke="#F59E0B" strokeWidth="1.8" />
            <path d="M12 8.5C10.8 10.2 10 11.5 10 12.3C10 13.4 10.9 14.3 12 14.3C13.1 14.3 14 13.4 14 12.3C14 11.5 13.2 10.2 12 8.5Z" fill="#F59E0B" />
        </svg>
    </div>
);

const BitcoinAssetIcon = () => (
    <div className={styles.assetBadgeBtc}>
        <svg viewBox="0 0 32 32" width="22" height="22">
            <circle cx="16" cy="16" r="16" fill="#F7931A" />
            <path
                d="M21.5 13.5C21.9 12.3 21.2 10.9 19.3 10.4L18.8 8.6L17.7 8.9L18.2 10.7C17.9 10.8 17.6 10.9 17.3 11L16.8 9.2L15.7 9.5L16.2 11.3C15.9 11.4 15.6 11.5 15.3 11.6L13.8 11.2L13.4 12.7C13.4 12.7 14.2 12.9 14.2 12.9C14.6 13 14.7 13.3 14.6 13.6L13.3 18.7C13.2 18.9 13 19 12.7 18.9C12.7 18.9 11.9 18.7 11.9 18.7L11.2 20.3L12.7 20.7C13 20.8 13.3 20.9 13.6 21L13.1 23L14.2 22.7L14.7 20.7C15 20.8 15.3 20.9 15.6 21L15.1 23L16.2 22.7L16.7 20.7C18.6 21 20.1 20.6 20.7 18.9C21.2 17.5 20.7 16.7 19.8 16.2C20.5 15.8 21 14.9 20.7 13.7M18.8 18.3C18.5 19.6 16.2 18.8 15.3 18.6L16 15.9C16.9 16.1 19.2 16.9 18.8 18.3M19.1 14.3C18.8 15.5 16.9 14.8 16.1 14.6L16.7 12.2C17.5 12.4 19.4 13.1 19.1 14.3Z"
                fill="#FFFFFF"
            />
        </svg>
    </div>
);

const EthereumAssetIcon = () => (
    <div className={styles.assetBadgeEth}>
        <svg viewBox="0 0 32 32" width="22" height="22">
            <circle cx="16" cy="16" r="16" fill="#627EEA" />
            <path d="M16 4L15.8 4.6V20.2L16 20.4L22.5 16.5L16 4Z" fill="#FFFFFF" fillOpacity="0.7" />
            <path d="M16 4L9.5 16.5L16 20.4V4Z" fill="#FFFFFF" />
            <path d="M16 21.8L15.9 22V27.6L16 28L22.5 18L16 21.8Z" fill="#FFFFFF" fillOpacity="0.7" />
            <path d="M16 28V21.8L9.5 18L16 28Z" fill="#FFFFFF" />
        </svg>
    </div>
);

const SolanaAssetIcon = () => (
    <div className={styles.assetBadgeSol}>
        <svg viewBox="0 0 32 32" width="22" height="22">
            <circle cx="16" cy="16" r="16" fill="#14F195" />
            <path d="M8 20L11 17H24L21 20H8ZM8 12L11 9H24L21 12H8ZM11 16L8 13H21L24 16H11Z" fill="#000000" />
        </svg>
    </div>
);

const BnbAssetIcon = () => (
    <div className={styles.assetBadgeBnb}>
        <svg viewBox="0 0 32 32" width="22" height="22">
            <circle cx="16" cy="16" r="16" fill="#F3BA2F" />
            <path d="M16 7L20 11L16 15L12 11L16 7ZM8 15L12 19L8 23L4 19L8 15ZM24 15L28 19L24 23L20 19L24 15ZM16 17L20 21L16 25L12 21L16 17Z" fill="#FFFFFF" />
        </svg>
    </div>
);

const IndexChartAssetIcon = ({ label = 'IDX' }) => (
    <div className={styles.assetBadgeIndex}>
        <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="16" width="4" height="9" rx="1" fill="#10B981" />
            <rect x="9" y="10" width="4" height="15" rx="1" fill="#10B981" />
            <rect x="16" y="13" width="4" height="12" rx="1" fill="#EF4444" />
            <rect x="23" y="5" width="4" height="20" rx="1" fill="#10B981" />
            <path d="M4 14L11 8L18 11L25 3M25 3H20M25 3V8" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </div>
);

/* ---------------- Main Unified Instrument Icon Component ---------------- */

export default function InstrumentIcon({ symbol = 'EURUSD' }) {
    const sym = cleanPairSymbol(symbol);

    // 1. Forex Pairs (Dual Overlapping Flags)
    if (sym === 'EURUSD') {
        return (
            <div className={styles.flagPairContainer}>
                <EUFlagDisc />
                <USFlagDisc overlap={true} />
            </div>
        );
    }
    if (sym === 'GBPUSD') {
        return (
            <div className={styles.flagPairContainer}>
                <UKFlagDisc />
                <USFlagDisc overlap={true} />
            </div>
        );
    }
    if (sym === 'USDJPY') {
        return (
            <div className={styles.flagPairContainer}>
                <USFlagDisc />
                <JPYFlagDisc overlap={true} />
            </div>
        );
    }
    if (sym === 'AUDUSD') {
        return (
            <div className={styles.flagPairContainer}>
                <AUDFlagDisc />
                <USFlagDisc overlap={true} />
            </div>
        );
    }
    if (sym === 'USDCAD') {
        return (
            <div className={styles.flagPairContainer}>
                <USFlagDisc />
                <CADFlagDisc overlap={true} />
            </div>
        );
    }
    if (sym === 'USDCHF') {
        return (
            <div className={styles.flagPairContainer}>
                <USFlagDisc />
                <CHFFlagDisc overlap={true} />
            </div>
        );
    }
    if (sym === 'GBPJPY') {
        return (
            <div className={styles.flagPairContainer}>
                <UKFlagDisc />
                <JPYFlagDisc overlap={true} />
            </div>
        );
    }
    if (sym === 'EURGBP') {
        return (
            <div className={styles.flagPairContainer}>
                <EUFlagDisc />
                <UKFlagDisc overlap={true} />
            </div>
        );
    }
    if (sym === 'EURJPY') {
        return (
            <div className={styles.flagPairContainer}>
                <EUFlagDisc />
                <JPYFlagDisc overlap={true} />
            </div>
        );
    }

    // 2. Commodities
    if (sym === 'XAUUSD' || sym.includes('GOLD')) {
        return <GoldAssetIcon />;
    }
    if (sym === 'XAGUSD' || sym.includes('SILVER')) {
        return <SilverAssetIcon />;
    }
    if (sym === 'USOIL' || sym === 'UKOIL' || sym.includes('OIL') || sym.includes('CRUDE')) {
        return <OilAssetIcon />;
    }

    // 3. Crypto
    if (sym === 'BTCUSD' || sym === 'BTC') {
        return <BitcoinAssetIcon />;
    }
    if (sym === 'ETHUSD' || sym === 'ETH') {
        return <EthereumAssetIcon />;
    }
    if (sym === 'SOLUSD' || sym === 'SOL') {
        return <SolanaAssetIcon />;
    }
    if (sym === 'BNBUSD' || sym === 'BNB') {
        return <BnbAssetIcon />;
    }

    // 4. Indices
    if (sym === 'US30' || sym === 'US500' || sym === 'USTEC' || sym === 'GER40' || sym.includes('SPX') || sym.includes('NAS')) {
        return <IndexChartAssetIcon label={sym} />;
    }

    // 5. General Fallback
    return (
        <div className={styles.flagPairContainer}>
            <EUFlagDisc />
            <USFlagDisc overlap={true} />
        </div>
    );
}
