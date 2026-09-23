'use client';

import React from 'react';
import styles from '../styles/strategyStudio.module.scss';

export default function BackgroundCyberWaves() {
    return (
        <div className={styles.smokyWavesWrapper} aria-hidden="true">
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
                    {/* Gradients for Multi-Layered Silk Waves */}
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

                    <linearGradient id="cyberRibbonGrad4" x1="30%" y1="0%" x2="70%" y2="100%">
                        <stop offset="0%" stopColor="#34D399" stopOpacity="0.28" />
                        <stop offset="40%" stopColor="#18C98B" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#030806" stopOpacity="0" />
                    </linearGradient>

                    {/* Edge Neon Strokes */}
                    <linearGradient id="strokeNeon1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34D399" stopOpacity="0.75" />
                        <stop offset="45%" stopColor="#18C98B" stopOpacity="0.55" />
                        <stop offset="85%" stopColor="#00F2FE" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#18C98B" stopOpacity="0" />
                    </linearGradient>

                    <linearGradient id="strokeNeon2" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.65" />
                        <stop offset="50%" stopColor="#18C98B" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                    </linearGradient>

                    <linearGradient id="strokeNeon3" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.6" />
                        <stop offset="60%" stopColor="#18C98B" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#040605" stopOpacity="0" />
                    </linearGradient>

                    {/* Glow Filter */}
                    <filter id="waveGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="8" result="blur1" />
                        <feGaussianBlur stdDeviation="20" result="blur2" />
                        <feMerge>
                            <feMergeNode in="blur2" />
                            <feMergeNode in="blur1" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

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
                        filter="url(#waveGlowFilter)"
                    />
                    <path
                        d="M 980 -40 C 1120 180 1340 260 1440 440 C 1510 570 1330 730 1140 840"
                        stroke="url(#strokeNeon1)"
                        strokeWidth="1.2"
                        opacity="0.8"
                    />
                    <path
                        d="M 1040 -20 C 1180 200 1380 300 1460 480 C 1520 600 1320 740 1150 830"
                        stroke="url(#strokeNeon1)"
                        strokeWidth="0.8"
                        opacity="0.45"
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
                        filter="url(#waveGlowFilter)"
                    />
                    <path
                        d="M -50 900 C 160 790 310 570 370 370 C 430 180 340 30 230 -60"
                        stroke="url(#strokeNeon2)"
                        strokeWidth="1.2"
                        opacity="0.75"
                    />
                    <path
                        d="M -30 920 C 180 810 320 590 380 390 C 440 200 350 40 240 -50"
                        stroke="url(#strokeNeon2)"
                        strokeWidth="0.8"
                        opacity="0.4"
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
                        filter="url(#waveGlowFilter)"
                    />
                    <path
                        d="M -100 780 C 280 600 660 740 1020 640 C 1200 580 1340 680 1540 770"
                        stroke="url(#strokeNeon3)"
                        strokeWidth="1.2"
                        opacity="0.75"
                    />
                </g>

                {/* Additional Ambient Floating Fluid Curves */}
                <path
                    className={styles.floatingCurve1}
                    d="M 120 960 C 340 780 620 640 820 480 C 1020 320 1140 160 1280 -40"
                    stroke="url(#strokeNeon1)"
                    strokeWidth="1.4"
                    strokeDasharray="8 12"
                />
                <path
                    className={styles.floatingCurve2}
                    d="M 1120 -60 C 1260 160 1390 320 1440 540 C 1480 720 1280 860 1080 960"
                    stroke="url(#strokeNeon2)"
                    strokeWidth="1.2"
                    strokeDasharray="6 10"
                />
            </svg>
        </div>
    );
}
