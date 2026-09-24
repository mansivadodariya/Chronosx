'use client';

import React, { useState, useEffect } from 'react';
import styles from '../styles/strategyStudio.module.scss';
import { useTheme } from '@/context/ThemeContext';

export default function BackgroundCyberWaves() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isLight = mounted ? theme === 'light' : false;

    return (
        <div className={`${styles.smokyWavesWrapper} ${isLight ? styles.isLightModeWaves : ''}`} aria-hidden="true">
            {/* Ambient Deep Radial Glows */}
            <div className={styles.ambientRadialTopRight} />
            <div className={styles.ambientRadialBottomLeft} />
            <div className={styles.ambientRadialBottomRight} />
            <div className={styles.ambientRadialCenter} />

            {/* High-Fidelity Silky Cyber Waves SVG */}
            <svg
                className={styles.smokyWavesSvg}
                viewBox="0 0 1440 900"
                fill="none"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    {/* ── DARK THEME GRADIENTS ── */}
                    <linearGradient id="cyberRibbonGrad1" x1="10%" y1="0%" x2="90%" y2="100%">
                        <stop offset="0%" stopColor="#18C98B" stopOpacity="0.32" />
                        <stop offset="30%" stopColor="#10B981" stopOpacity="0.2" />
                        <stop offset="60%" stopColor="#059669" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#030806" stopOpacity="0" />
                    </linearGradient>

                    <linearGradient id="cyberRibbonGrad2" x1="90%" y1="10%" x2="10%" y2="90%">
                        <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.2" />
                        <stop offset="35%" stopColor="#18C98B" stopOpacity="0.25" />
                        <stop offset="70%" stopColor="#047857" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#030806" stopOpacity="0" />
                    </linearGradient>

                    <linearGradient id="cyberRibbonGrad3" x1="0%" y1="80%" x2="100%" y2="20%">
                        <stop offset="0%" stopColor="#18C98B" stopOpacity="0.26" />
                        <stop offset="45%" stopColor="#10B981" stopOpacity="0.16" />
                        <stop offset="80%" stopColor="#059669" stopOpacity="0.06" />
                        <stop offset="100%" stopColor="#030806" stopOpacity="0" />
                    </linearGradient>

                    <linearGradient id="strokeNeon1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34D399" stopOpacity="0.85" />
                        <stop offset="45%" stopColor="#18C98B" stopOpacity="0.65" />
                        <stop offset="85%" stopColor="#00F2FE" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#18C98B" stopOpacity="0" />
                    </linearGradient>

                    <linearGradient id="strokeNeon2" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#18C98B" stopOpacity="0.55" />
                        <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                    </linearGradient>

                    <linearGradient id="strokeNeon3" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.75" />
                        <stop offset="60%" stopColor="#18C98B" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#040605" stopOpacity="0" />
                    </linearGradient>

                    {/* ── LIGHT THEME GRADIENTS (Vivid Rich Emerald, Teal & Cyan Ribbons) ── */}
                    <linearGradient id="cyberRibbonGradLight1" x1="15%" y1="0%" x2="85%" y2="100%">
                        <stop offset="0%" stopColor="#059669" stopOpacity="0.45" />
                        <stop offset="30%" stopColor="#10B981" stopOpacity="0.35" />
                        <stop offset="65%" stopColor="#06B6D4" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.04" />
                    </linearGradient>

                    <linearGradient id="cyberRibbonGradLight2" x1="90%" y1="10%" x2="10%" y2="90%">
                        <stop offset="0%" stopColor="#0284C7" stopOpacity="0.4" />
                        <stop offset="35%" stopColor="#0D9488" stopOpacity="0.32" />
                        <stop offset="70%" stopColor="#10B981" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#059669" stopOpacity="0.04" />
                    </linearGradient>

                    <linearGradient id="cyberRibbonGradLight3" x1="0%" y1="80%" x2="100%" y2="20%">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.42" />
                        <stop offset="45%" stopColor="#059669" stopOpacity="0.3" />
                        <stop offset="80%" stopColor="#0284C7" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#0D9488" stopOpacity="0.03" />
                    </linearGradient>

                    <linearGradient id="strokeNeonLight1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#047857" stopOpacity="1" />
                        <stop offset="40%" stopColor="#059669" stopOpacity="1" />
                        <stop offset="75%" stopColor="#0284C7" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.6" />
                    </linearGradient>

                    <linearGradient id="strokeNeonLight2" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#0284C7" stopOpacity="1" />
                        <stop offset="45%" stopColor="#0D9488" stopOpacity="0.95" />
                        <stop offset="80%" stopColor="#059669" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.55" />
                    </linearGradient>

                    <linearGradient id="strokeNeonLight3" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#047857" stopOpacity="1" />
                        <stop offset="50%" stopColor="#059669" stopOpacity="0.95" />
                        <stop offset="85%" stopColor="#10B981" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#0284C7" stopOpacity="0.45" />
                    </linearGradient>

                    {/* Glow Filter for Dark Mode */}
                    <filter id="waveGlowFilterDark" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="8" result="blur1" />
                        <feGaussianBlur stdDeviation="20" result="blur2" />
                        <feMerge>
                            <feMergeNode in="blur2" />
                            <feMergeNode in="blur1" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Crisp Glow Filter for Light Mode */}
                    <filter id="waveGlowFilterLight" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur1" />
                        <feGaussianBlur stdDeviation="10" result="blur2" />
                        <feMerge>
                            <feMergeNode in="blur2" />
                            <feMergeNode in="blur1" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* ── LIGHT THEME WAVE GROUP (Rendered whenever light theme is active) ── */}
                <g className={styles.lightWaveGroup}>
                    {/* Primary Top-Right Sweeping Wave Ribbons */}
                    <g className={styles.waveGroupRight}>
                        <path
                            d="M 820 -80 C 1020 140 1260 200 1440 380 C 1560 520 1400 700 1180 820 C 980 910 760 880 580 940 L 1520 1100 L 1520 -80 Z"
                            fill="url(#cyberRibbonGradLight1)"
                        />
                        <path
                            d="M 890 -60 C 1060 160 1300 240 1420 420 C 1500 560 1340 720 1120 830 C 940 910 740 880 560 960"
                            stroke="url(#strokeNeonLight1)"
                            strokeWidth="3.6"
                            filter="url(#waveGlowFilterLight)"
                        />
                        <path
                            d="M 950 -40 C 1100 180 1320 260 1440 440 C 1510 570 1330 730 1140 840"
                            stroke="url(#strokeNeonLight1)"
                            strokeWidth="2.4"
                            opacity="0.95"
                        />
                        <path
                            d="M 1010 -20 C 1160 200 1360 300 1460 480 C 1520 600 1320 740 1150 830"
                            stroke="url(#strokeNeonLight1)"
                            strokeWidth="1.6"
                            opacity="0.85"
                        />
                        <path
                            d="M 1070 0 C 1220 220 1400 340 1480 520 C 1530 640 1310 760 1160 850"
                            stroke="url(#strokeNeonLight1)"
                            strokeWidth="1.2"
                            strokeDasharray="6 8"
                            opacity="0.7"
                        />
                    </g>

                    {/* Primary Left Sweeping Wave Ribbons */}
                    <g className={styles.waveGroupLeft}>
                        <path
                            d="M -100 720 C 120 660 260 520 340 340 C 420 160 340 10 240 -90 L -100 -90 Z"
                            fill="url(#cyberRibbonGradLight2)"
                        />
                        <path
                            d="M -70 880 C 140 770 300 560 360 360 C 420 170 330 20 220 -70"
                            stroke="url(#strokeNeonLight2)"
                            strokeWidth="3.4"
                            filter="url(#waveGlowFilterLight)"
                        />
                        <path
                            d="M -50 900 C 160 790 310 570 370 370 C 430 180 340 30 230 -60"
                            stroke="url(#strokeNeonLight2)"
                            strokeWidth="2.2"
                            opacity="0.95"
                        />
                        <path
                            d="M -30 920 C 180 810 320 590 380 390 C 440 200 350 40 240 -50"
                            stroke="url(#strokeNeonLight2)"
                            strokeWidth="1.5"
                            opacity="0.8"
                        />
                        <path
                            d="M -10 940 C 200 830 330 610 390 410 C 450 220 360 50 250 -40"
                            stroke="url(#strokeNeonLight2)"
                            strokeWidth="1.1"
                            strokeDasharray="6 8"
                            opacity="0.7"
                        />
                    </g>

                    {/* Bottom Extended Full-Bleed Wave Ribbons */}
                    <g className={styles.waveGroupBottom}>
                        <path
                            d="M -100 820 C 260 640 640 780 1000 680 C 1240 610 1380 720 1540 820 L 1540 1100 L -100 1100 Z"
                            fill="url(#cyberRibbonGradLight3)"
                        />
                        <path
                            d="M -100 800 C 270 620 650 760 1010 660 C 1220 600 1360 700 1540 790"
                            stroke="url(#strokeNeonLight3)"
                            strokeWidth="3.2"
                            filter="url(#waveGlowFilterLight)"
                        />
                        <path
                            d="M -100 780 C 280 600 660 740 1020 640 C 1200 580 1340 680 1540 770"
                            stroke="url(#strokeNeonLight3)"
                            strokeWidth="2.0"
                            opacity="0.9"
                        />
                    </g>
                </g>

                {/* ── DARK THEME WAVE GROUP (Rendered whenever dark theme is active) ── */}
                <g className={styles.darkWaveGroup}>
                    {/* Primary Top-Right Sweeping Wave Ribbons */}
                    <g className={styles.waveGroupRight}>
                        <path
                            d="M 850 -80 C 1040 140 1280 200 1440 380 C 1560 520 1400 700 1180 820 C 980 910 760 880 580 940 L 1520 1100 L 1520 -80 Z"
                            fill="url(#cyberRibbonGrad1)"
                        />
                        <path
                            d="M 920 -60 C 1080 160 1320 240 1420 420 C 1500 560 1340 720 1120 830 C 940 910 740 880 560 960"
                            stroke="url(#strokeNeon1)"
                            strokeWidth="2.8"
                            filter="url(#waveGlowFilterDark)"
                        />
                        <path
                            d="M 980 -40 C 1120 180 1340 260 1440 440 C 1510 570 1330 730 1140 840"
                            stroke="url(#strokeNeon1)"
                            strokeWidth="1.2"
                            opacity="0.8"
                        />
                    </g>

                    {/* Primary Left Sweeping Wave Ribbons */}
                    <g className={styles.waveGroupLeft}>
                        <path
                            d="M -100 720 C 120 660 260 520 340 340 C 420 160 340 10 240 -90 L -100 -90 Z"
                            fill="url(#cyberRibbonGrad2)"
                        />
                        <path
                            d="M -70 880 C 140 770 300 560 360 360 C 420 170 330 20 220 -70"
                            stroke="url(#strokeNeon2)"
                            strokeWidth="2.6"
                            filter="url(#waveGlowFilterDark)"
                        />
                        <path
                            d="M -50 900 C 160 790 310 570 370 370 C 430 180 340 30 230 -60"
                            stroke="url(#strokeNeon2)"
                            strokeWidth="1.2"
                            opacity="0.75"
                        />
                    </g>

                    {/* Bottom Extended Full-Bleed Wave Ribbons */}
                    <g className={styles.waveGroupBottom}>
                        <path
                            d="M -100 820 C 260 640 640 780 1000 680 C 1240 610 1380 720 1540 820 L 1540 1100 L -100 1100 Z"
                            fill="url(#cyberRibbonGrad3)"
                        />
                        <path
                            d="M -100 800 C 270 620 650 760 1010 660 C 1220 600 1360 700 1540 790"
                            stroke="url(#strokeNeon3)"
                            strokeWidth="2.4"
                            filter="url(#waveGlowFilterDark)"
                        />
                    </g>
                </g>

                {/* Additional Ambient Floating Fluid Curves */}
                <path
                    className={styles.floatingCurve1}
                    d="M 120 960 C 340 780 620 640 820 480 C 1020 320 1140 160 1280 -40"
                    stroke={isLight ? "url(#strokeNeonLight1)" : "url(#strokeNeon1)"}
                    strokeWidth={isLight ? "2.4" : "1.4"}
                    strokeDasharray="8 12"
                />
                <path
                    className={styles.floatingCurve2}
                    d="M 1120 -60 C 1260 160 1390 320 1440 540 C 1480 720 1280 860 1080 960"
                    stroke={isLight ? "url(#strokeNeonLight2)" : "url(#strokeNeon2)"}
                    strokeWidth={isLight ? "2.2" : "1.2"}
                    strokeDasharray="6 10"
                />
            </svg>
        </div>
    );
}
