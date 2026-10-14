'use client';

import React from 'react';
import styles from '../tradeAnalysis.module.scss';
import { SparklesIcon, formatCurrency } from '@/icons/tradeAnalysisIcons';

export default function TradeLedgerTab({
    filteredTrades = [],
    analyzingTradeId,
    handleAnalyzeIndividualTrade
}) {
    return (
        <div className={styles.dataTableCard}>
            <div className={styles.tableSectionHeader}>
                <h3>Normalized Trades Ledger ({filteredTrades.length})</h3>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Date & Time</th>
                        <th>Symbol</th>
                        <th>Side</th>
                        <th>Lots</th>
                        <th>Entry Price</th>
                        <th>Outcome</th>
                        <th>Net PnL</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTrades.map((t, i) => {
                        const tId = t.trade_id || t.id || t.ticket || t.ticket_id || `trade_${i + 1}`;
                        const isAnalyzing = analyzingTradeId === tId;

                        return (
                            <tr key={i}>
                                <td>{t.date} {t.time}</td>
                                <td className={styles.symbolCell}>{t.symbol}</td>
                                <td className={(t.side || '').toUpperCase() === 'BUY' ? styles.greenText : styles.redText}>
                                    {t.side || 'BUY'}
                                </td>
                                <td>{t.quantity ?? '0.1'}</td>
                                <td>{t.entry_price ?? '—'}</td>
                                <td className={Number(t.pnl) >= 0 ? styles.greenText : styles.redText}>
                                    {t.outcome || (Number(t.pnl) >= 0 ? 'WIN' : 'LOSS')}
                                </td>
                                <td className={Number(t.pnl) >= 0 ? styles.greenText : styles.redText}>
                                    {formatCurrency(t.pnl)}
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        className={styles.rowAnalyzeBtn}
                                        onClick={() => handleAnalyzeIndividualTrade(t, i)}
                                        disabled={isAnalyzing}
                                    >
                                        {isAnalyzing ? (
                                            <span>Analyzing...</span>
                                        ) : (
                                            <>
                                                <SparklesIcon />
                                                <span>Analyze</span>
                                            </>
                                        )}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
