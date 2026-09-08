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
                        {isAnalyzing ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <span className={styles.pulseDot} style={{ width: '6px', height: '6px', background: '#18C98B', borderRadius: '50%', display: 'inline-block' }} />
                                Scanning Chart...
                            </span>
                        ) : 'Analyze'}
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
