'use client';

import React, { useState, useMemo } from 'react';
import styles from '../styles/strategyStudio.module.scss';

export default function TradesTable({ roundTrips = [] }) {
    const [filter, setFilter] = useState('all');

    const filteredTrades = useMemo(() => {
        if (filter === 'win') return roundTrips.filter(t => t.pnl > 0);
        if (filter === 'loss') return roundTrips.filter(t => t.pnl <= 0);
        return roundTrips;
    }, [roundTrips, filter]);

    return (
        <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
                <h3>Detailed Trades Execution Log ({roundTrips.length})</h3>
                <div className={styles.filterPills}>
                    <button
                        type="button"
                        className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Trades ({roundTrips.length})
                    </button>
                    <button
                        type="button"
                        className={`${styles.filterBtn} ${filter === 'win' ? styles.active : ''}`}
                        onClick={() => setFilter('win')}
                    >
                        Wins ({roundTrips.filter(t => t.pnl > 0).length})
                    </button>
                    <button
                        type="button"
                        className={`${styles.filterBtn} ${filter === 'loss' ? styles.active : ''}`}
                        onClick={() => setFilter('loss')}
                    >
                        Losses ({roundTrips.filter(t => t.pnl <= 0).length})
                    </button>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Entry Date</th>
                            <th>Entry Price</th>
                            <th>Exit Date</th>
                            <th>Exit Price</th>
                            <th>Side</th>
                            <th>Trigger</th>
                            <th>Trade P&L</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTrades.length === 0 ? (
                            <tr>
                                <td colSpan="9" style={{ textAlign: 'center', color: '#94A3B8', padding: '24px' }}>
                                    No trades match the selected filter.
                                </td>
                            </tr>
                        ) : (
                            filteredTrades.map((t) => {
                                const isWin = t.pnl > 0;
                                const isBuy = t.side === 'BUY';
                                const triggerLower = (t.trigger || '').toLowerCase();
                                const triggerClass = triggerLower.includes('target')
                                    ? styles.target
                                    : triggerLower.includes('stoploss')
                                    ? styles.stoploss
                                    : '';

                                return (
                                    <tr key={t.index}>
                                        <td style={{ color: '#94A3B8' }}>{t.index}</td>
                                        <td>{t.entryDate}</td>
                                        <td>{t.entryPrice.toFixed(2)}</td>
                                        <td>{t.exitDate}</td>
                                        <td>{t.exitPrice.toFixed(2)}</td>
                                        <td>
                                            <span className={isBuy ? styles.badgeBuy : styles.badgeSell}>
                                                {t.side}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`${styles.badgeTrigger} ${triggerClass}`}>
                                                {t.trigger}
                                            </span>
                                        </td>
                                        <td
                                            style={{
                                                color: isWin ? '#10B981' : '#F43F5E',
                                                fontWeight: 700
                                            }}
                                        >
                                            {isWin ? '+' : ''}${t.pnl.toFixed(2)}
                                        </td>
                                        <td style={{ fontWeight: 600 }}>
                                            ${t.runningBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
