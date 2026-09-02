'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MonitorIcon } from '@/icons/tradeSnapIcons';
import styles from '../tradeSnap.module.scss';

export default function TradeSnapMobileNotice({ t }) {
    return (
        <div className={styles.tradeSnap}>
            <div className={styles.mobileNotice}>
                <motion.div
                    className={styles.mobileCard}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className={styles.mobileIconWrap}>
                        <MonitorIcon className={styles.mobileMonitor} />
                    </div>
                    <h3>{t('tradeSnap.desktopViewRequired', 'Desktop View Required')}</h3>
                    <p>
                        {t('tradeSnap.mobileNoticeText', 'AI Trade uses screen sharing and requires a desktop or laptop computer with Chrome, Edge, or macOS Safari. Screen sharing is not supported on mobile devices or iOS Safari.')}
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
