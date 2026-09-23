'use client';

import React, { useState, useEffect } from 'react';
import styles from '../styles/strategyStudio.module.scss';
import { RocketRunIcon, LightningIcon, ShieldCheckIcon, SlidersTuneIcon } from './StudioIcons';

const SIMULATION_STAGES = [
    {
        icon: <SlidersTuneIcon size={18} color="#18C98B" />,
        title: 'Streaming Historical Candle Dataset...',
        desc: 'Extracting high-precision Open, High, Low, Close ticks from market database.'
    },
    {
        icon: <LightningIcon size={18} color="#18C98B" />,
        title: 'Evaluating Indicator Signals & Rules...',
        desc: 'Computing Donchian channels, moving averages & technical condition triggers.'
    },
    {
        icon: <RocketRunIcon size={18} color="#18C98B" />,
        title: 'Simulating Execution Round-Trips...',
        desc: 'Testing stop loss limits, take profit targets & order execution slippage.'
    },
    {
        icon: <ShieldCheckIcon size={18} color="#18C98B" />,
        title: 'Compiling Strategy Analytics & Metrics...',
        desc: 'Aggregating equity curves, maximum drawdowns & win/loss streaks.'
    }
];

export default function SimulationProgressLoader({ symbol = 'XAUUSD', interval = '15min' }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(15);

    useEffect(() => {
        const stepInterval = setInterval(() => {
            setCurrentStep((prev) => (prev + 1) % SIMULATION_STAGES.length);
        }, 1400);

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 92) return 92;
                return prev + Math.floor(Math.random() * 8) + 4;
            });
        }, 300);

        return () => {
            clearInterval(stepInterval);
            clearInterval(progressInterval);
        };
    }, []);

    const activeStage = SIMULATION_STAGES[currentStep];

    return (
        <div className={styles.simulationLoaderCard}>
            {/* High-Tech Glowing Orbital Spinner */}
            <div className={styles.orbitalSpinnerWrap}>
                <div className={styles.orbitalGlowRing} />
                <div className={styles.orbitalPulseCore}>
                    {activeStage.icon}
                </div>
            </div>

            {/* Dynamic Stage Title & Description */}
            <div className={styles.simulationStageText} key={currentStep}>
                <h3 className={styles.simulationStageTitle}>{activeStage.title}</h3>
                <p className={styles.simulationStageDesc}>{activeStage.desc}</p>
            </div>

            {/* Live Progress Bar with Meta Info */}
            <div className={styles.simulationProgressWrap}>
                <div className={styles.progressBarTrack}>
                    <div
                        className={styles.progressBarFill}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className={styles.progressMetaRow}>
                    <span>Market: <strong>{symbol} ({interval})</strong></span>
                    <span>{progress}% Complete</span>
                </div>
            </div>

            {/* Micro Multi-Step Pill Row */}
            <div className={styles.simulationPillsRow}>
                {SIMULATION_STAGES.map((s, idx) => (
                    <div
                        key={idx}
                        className={`${styles.simulationPill} ${idx <= currentStep ? styles.active : ''}`}
                    />
                ))}
            </div>
        </div>
    );
}
