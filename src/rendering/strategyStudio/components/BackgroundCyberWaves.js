'use client';

import React from 'react';
import styles from '../styles/strategyStudio.module.scss';

export default function BackgroundCyberWaves() {
    return (
        <div className={styles.smokyWavesWrapper} aria-hidden="true">
            {/* Ambient Deep Radial Glows */}
            <div className={styles.ambientRadialTopRight} />
            <div className={styles.ambientRadialBottomLeft} />
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
                    {/* Gradients */}
                    <linearGradient id="cyberRibbonGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#18C98B" stopOpacity="0.28" />
                        <stop offset="35%" stopColor="#059669" stopOpacity="0.16" />
                        <stop offset="70%" stopColor="#00F2FE" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#040605" stopOpacity="0" />
                    </linearGradient>

                    <linearGradient id="cyberRibbonGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                        <stop offset="45%" stopColor="#18C98B" stopOpacity="0.12" />
                        <stop offset="85%" stopColor="#047857" stopOpacity="0.04" />
                        <stop offset="100%" stopColor="#040605" stopOpacity="0" />
                    </linearGradient>

                    <linearGradient id="cyberRibbonGrad3" x1="20%" y1="100%" x2="80%" y2="0%">
                        <stop offset="0%" stopColor="#18C98B" stopOpacity="0.22" />
                        <stop offset="50%" stopColor="#10B981" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#00F2FE" stopOpacity="0" />
                    </linearGradient>

                    <linearGradient id="strokeNeon1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#18C98B" stopOpacity="0.6" />
                        <stop offset="50%" stopColor="#00F2FE" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#18C98B" stopOpacity="0" />
                    </linearGradient>

                    <linearGradient id="strokeNeon2" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.55" />
                        <stop offset="60%" stopColor="#18C98B" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                    </linearGradient>

                    <linearGradient id="strokeNeon3" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.45" />
                        <stop offset="70%" stopColor="#18C98B" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#040605" stopOpacity="0" />
                    </linearGradient>

                    {/* Glow Filter */}
                    <filter id="waveGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="12" result="blur1" />
                        <feGaussianBlur stdDeviation="24" result="blur2" />
                        <feMerge>
                            <feMergeNode in="blur2" />
                            <feMergeNode in="blur1" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Primary Right Sweeping Smoky Silk Ribbon */}
                <g className={styles.waveGroupRight}>
                    <path
                        d="M 980 -60 C 1120 180 1340 240 1480 440 C 1580 580 1380 740 1140 840 C 940 920 740 880 580 940 L 1500 940 L 1500 -60 Z"
                        fill="url(#cyberRibbonGrad1)"
                    />
                    <path
                        d="M 920 -40 C 1080 200 1280 280 1400 460 C 1500 600 1320 760 1080 850 C 900 920 720 890 560 930"
                        stroke="url(#strokeNeon1)"
                        strokeWidth="2.5"
                        filter="url(#waveGlowFilter)"
                    />
                    <path
                        d="M 960 -30 C 1100 210 1300 290 1410 470 C 1490 610 1310 750 1100 840"
                        stroke="url(#strokeNeon1)"
                        strokeWidth="1.2"
                        opacity="0.7"
                    />
                </g>

                {/* Primary Left Sweeping Smoky Silk Ribbon */}
                <g className={styles.waveGroupLeft}>
                    <path
                        d="M -80 620 C 140 580 280 480 360 320 C 440 160 360 20 260 -80 L -80 -80 Z"
                        fill="url(#cyberRibbonGrad2)"
                    />
                    <path
                        d="M -60 760 C 160 700 320 540 380 340 C 440 160 350 20 240 -60"
                        stroke="url(#strokeNeon2)"
                        strokeWidth="2.5"
                        filter="url(#waveGlowFilter)"
                    />
                    <path
                        d="M -40 780 C 180 720 330 550 390 350 C 450 170 360 30 250 -50"
                        stroke="url(#strokeNeon2)"
                        strokeWidth="1"
                        opacity="0.6"
                    />
                </g>

                {/* Bottom Diagonal Ribbon crossing center */}
                <g className={styles.waveGroupBottom}>
                    <path
                        d="M -50 860 C 340 720 720 820 1080 740 C 1300 690 1420 780 1500 880 L -50 880 Z"
                        fill="url(#cyberRibbonGrad3)"
                    />
                    <path
                        d="M -40 840 C 350 700 730 800 1090 730 C 1280 680 1400 760 1480 850"
                        stroke="url(#strokeNeon3)"
                        strokeWidth="2"
                        filter="url(#waveGlowFilter)"
                    />
                </g>

                {/* Subtle sweeping accent ribbons */}
                <path
                    d="M 1100 40 C 1240 220 1380 340 1420 520 C 1460 700 1260 810 1060 880"
                    stroke="url(#strokeNeon1)"
                    strokeWidth="1"
                    strokeDasharray="6 8"
                    opacity="0.3"
                />
                <path
                    d="M 40 880 C 220 740 380 620 420 420 C 460 220 380 80 280 -20"
                    stroke="url(#strokeNeon2)"
                    strokeWidth="1"
                    strokeDasharray="4 6"
                    opacity="0.3"
                />
            </svg>
        </div>
    );
}
