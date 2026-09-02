'use client';

import React from 'react';
import { CameraIcon } from '@/icons/tradeSnapIcons';
import styles from '../tradeSnap.module.scss';

export default function TradeSnapSnapshotPanel({
    capturedImage,
    isAnalyzing,
    analyzeImage
}) {
    return (
        <div className={styles.sideColumn}>
            <div className={styles.panel}>
                <div className={styles.snapshotHeader}>
                    <h3>
                        <CameraIcon />
                        Latest Snapshot
                    </h3>
                    <button
                        type="button"
                        className={styles.btnAnalyze}
                        onClick={analyzeImage}
                        disabled={isAnalyzing || !capturedImage}
                    >
                        {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                    </button>
                </div>
                {capturedImage ? (
                    <img src={capturedImage} alt="Captured screenshot" className={styles.snapshotImg} />
                ) : (
                    <div className={styles.snapshotEmpty}>Capture a screenshot to analyze</div>
                )}
            </div>
        </div>
    );
}
