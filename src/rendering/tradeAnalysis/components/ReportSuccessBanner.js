'use client';

import React from 'react';
import styles from '../tradeAnalysis.module.scss';
import { CheckIcon, UploadIcon } from '@/icons/tradeAnalysisIcons';

export default function ReportSuccessBanner({
    fileDetails,
    totalTradesCount,
    onViewTrades,
    onReupload
}) {
    return (
        <div className={styles.reportSuccessBannerCard}>
            <div className={styles.bannerContentLeft}>
                <div className={styles.bannerFileMetaRow}>
                    <div className={`${styles.fileBadgeBox} ${fileDetails.badgeClass}`}>
                        <span>{fileDetails.ext}</span>
                    </div>
                    <div className={styles.fileMetaDetails}>
                        <span className={styles.fileName}>
                            {fileDetails.name}
                        </span>
                        <span className={styles.fileSub}>
                            {fileDetails.sizeText} • {totalTradesCount} Trades • Uploaded just now
                        </span>
                    </div>
                    <div className={styles.completePillBadge}>
                        <CheckIcon />
                        <span>Processing Complete</span>
                    </div>
                </div>

                <div className={styles.bannerMessageRow}>
                    <div className={styles.checkTitleGroup}>
                        <div className={styles.checkCircle}>
                            <CheckIcon />
                        </div>
                        <h3>AI has successfully processed your report!</h3>
                    </div>
                    <p className={styles.bannerSubtext}>
                        We found {totalTradesCount} trades in your report.
                    </p>
                </div>

                <div className={styles.bannerActionsRow}>
                    <button
                        type="button"
                        className={styles.viewTradesBtn}
                        onClick={onViewTrades}
                    >
                        VIEW TRADES
                    </button>
                    <button
                        type="button"
                        className={styles.reuploadBtn}
                        onClick={onReupload}
                    >
                        <UploadIcon />
                        <span>Upload New Statement</span>
                    </button>
                </div>
            </div>

            <div className={styles.bannerGraphicRight}>
                <img src="/assets/images/brain.png" alt="AI Brain Analysis" className={styles.brainImg} />
            </div>
        </div>
    );
}
