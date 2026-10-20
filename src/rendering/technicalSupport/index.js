'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import SupportTicketForm from '@/components/supportTicketForm';
import CommonSectionHeader from '@/components/CommonSectionHeader';
import { SupportTicketIcon } from '@/icons/sidebarIcons';
import styles from './technicalSupport.module.scss';

export default function TechnicalSupport() {
    const { t } = useLanguage();

    return (
        <div className={styles.page}>
            <CommonSectionHeader
                badge={t('technicalSupport.badge', 'TECHNICAL SUPPORT')}
                badgeIcon={
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                }
                icon={<SupportTicketIcon width={26} height={26} />}
                title1={t('technicalSupport.title', 'Raise a')}
                title2={t('technicalSupport.titleAccent', 'Support Ticket')}
                subtitle={t(
                    'technicalSupport.subtitle',
                    'Describe the issue you are facing. Attach a screenshot if it helps our desk diagnose faster.'
                )}
                isCard={true}
            />

            <motion.div
                className={styles.card}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className={styles.cardGlow} aria-hidden="true" />
                <SupportTicketForm />
            </motion.div>
        </div>
    );
}
