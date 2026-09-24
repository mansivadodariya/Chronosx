'use client';

import React, { useRef } from 'react';
import Modal from '../Modal';
import Loader from '@/components/loader';
import AnalysisResultItem from '../AnalysisResultItem';
import AiSnapDashboard from './AiSnapDashboard';
import { DownloadIcon } from '@/icons/aiSnapIcons';
import { useTradeSnapExport } from '../hooks/useTradeSnapExport';
import styles from '../tradeSnap.module.scss';

export default function TradeSnapModals({
    isDetailModalOpen,
    setIsDetailModalOpen,
    selectedAnalysis,
    historyOpen,
    setHistoryOpen,
    historyLoading,
    historyItems,
    openDetailModal,
    handleDeleteHistoryItem,
    confirmDeleteOpen,
    setConfirmDeleteOpen,
    confirmDeleteHistoryItem,
    t
}) {
    const modalDashboardRef = useRef(null);
    const { exportToPdf, isExporting } = useTradeSnapExport();

    const handleDownloadModalPdf = () => {
        const analysis = selectedAnalysis?.analysis || selectedAnalysis || {};
        const symbol = analysis.symbol || analysis.Symbol || selectedAnalysis?.symbol || 'XAUUSD';
        const timeframe = analysis.timeframe || analysis.Timeframe || selectedAnalysis?.timeframe || 'M15';
        exportToPdf(modalDashboardRef.current, symbol, timeframe);
    };

    return (
        <>
            <Modal
                open={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                size="large"
                title="AI Snap Technical Analysis Dashboard"
                description="State-of-the-art AI market diagnosis and trade signal setup"
                headerActions={
                    <button
                        type="button"
                        className={styles.modalDownloadBtn}
                        onClick={handleDownloadModalPdf}
                        disabled={isExporting}
                        title="Download Complete AI Analysis Report (PDF)"
                    >
                        <DownloadIcon size={14} />
                        <span>{isExporting ? 'Exporting...' : 'Download PDF'}</span>
                    </button>
                }
            >
                {selectedAnalysis && (
                    <div ref={modalDashboardRef}>
                        <AiSnapDashboard rawData={selectedAnalysis} />
                    </div>
                )}
            </Modal>

            <Modal
                open={historyOpen}
                onClose={() => setHistoryOpen(false)}
                title={t('tradeSnap.historyTitle', 'AI Trade History')}
                description={t('tradeSnap.historyDesc', 'Your past AI Trade analyses')}
            >
                {historyLoading ? (
                    <div className={styles.loadingBox}>
                        <Loader centered />
                    </div>
                ) : historyItems.length === 0 ? (
                    <div className={styles.recentEmpty}>
                        <p>{t('tradeSnap.noHistoryYet', 'No analysis history yet.')}</p>
                    </div>
                ) : (
                    <div className={styles.historyList}>
                        {historyItems.map((item, index) => {
                            const tradeObj = (Array.isArray(item?.data) && item.data.length > 0)
                                ? item.data[0]
                                : (item?.analysis_data || item);
                            return (
                                <AnalysisResultItem
                                    key={item.id || index}
                                    trade={tradeObj}
                                    onViewDetails={() => {
                                        setHistoryOpen(false);
                                        openDetailModal(tradeObj);
                                    }}
                                    onDelete={item.id || item.deleteId ? () => handleDeleteHistoryItem(item) : null}
                                />
                            );
                        })}
                    </div>
                )}
            </Modal>

            {confirmDeleteOpen && (
                <div className={styles.modalOverlay} role="dialog" aria-modal="true">
                    <div className={styles.modalBox}>
                        <div className={styles.modalHeader}>
                            <h3>{t('tradeSnap.confirmDeleteTitle', 'Delete Analysis')}</h3>
                            <button
                                type="button"
                                className={styles.modalClose}
                                onClick={() => setConfirmDeleteOpen(false)}
                                aria-label={t('tradeSnap.close', 'Close')}
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <p>{t('tradeSnap.confirmDeleteBody', 'Are you sure you want to delete this analysis? This action cannot be undone.')}</p>
                        </div>
                        <div className={styles.modalFooter}>
                            <button
                                type="button"
                                className={styles.btnSecondary}
                                onClick={() => setConfirmDeleteOpen(false)}
                            >
                                {t('tradeSnap.cancel', 'Cancel')}
                            </button>
                            <button
                                type="button"
                                className={styles.btnDanger}
                                onClick={confirmDeleteHistoryItem}
                            >
                                {t('tradeSnap.delete', 'Delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
