'use client';

import React, { useState, useMemo } from 'react';
import styles from '../styles/strategyStudio.module.scss';

const formatPrice = (val) => {
    if (val === undefined || val === null || isNaN(Number(val))) return '—';
    const num = Number(val);
    return num.toFixed(4).replace(/0+$/, '').replace(/\.$/, '.00');
};

const formatPnL = (val) => {
    if (val === undefined || val === null || isNaN(Number(val))) return '$0.00';
    const num = Number(val);
    const sign = num > 0 ? '+' : '';
    return `${sign}$${num.toFixed(2)}`;
};

const formatBalance = (val) => {
    if (val === undefined || val === null || isNaN(Number(val))) return '$10,000.00';
    return `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function TradesTable({ roundTrips = [] }) {
    const [filter, setFilter] = useState('all');

    const safeRoundTrips = Array.isArray(roundTrips) ? roundTrips : [];

    const filteredTrades = useMemo(() => {
        if (filter === 'win') return safeRoundTrips.filter(t => (Number(t?.pnl) || 0) > 0);
        if (filter === 'loss') return safeRoundTrips.filter(t => (Number(t?.pnl) || 0) <= 0);
        return safeRoundTrips;
    }, [safeRoundTrips, filter]);

    const winCount = safeRoundTrips.filter(t => (Number(t?.pnl) || 0) > 0).length;
    const lossCount = safeRoundTrips.filter(t => (Number(t?.pnl) || 0) <= 0).length;

    return (
        <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
                <h3>Detailed Trades Execution Log ({safeRoundTrips.length})</h3>
                <div className={styles.filterPills}>
                    <button
                        type="button"
                        className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Trades ({safeRoundTrips.length})
                    </button>
                    <button
                        type="button"
                        className={`${styles.filterBtn} ${filter === 'win' ? styles.active : ''}`}
                        onClick={() => setFilter('win')}
                    >
                        Wins ({winCount})
                    </button>
                    <button
                        type="button"
                        className={`${styles.filterBtn} ${filter === 'loss' ? styles.active : ''}`}
                        onClick={() => setFilter('loss')}
                    >
                        Losses ({lossCount})
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
                                <td colSpan="9" style={{ textAlign: 'center', color: '#94A3B8', padding: '28px' }}>
                                    No trades match the selected filter.
                                </td>
                            </tr>
                        ) : (
                            filteredTrades.map((t, idx) => {
                                const pnlNum = Number(t?.pnl) || 0;
                                const isWin = pnlNum > 0;
                                const side = String(t?.side || 'BUY').toUpperCase();
                                const isBuy = side === 'BUY';
                                const trigger = String(t?.trigger || (isWin ? 'TARGET' : 'STOPLOSS')).toUpperCase();
                                const triggerClass = trigger.includes('TARGET') || trigger.includes('TP')
                                    ? styles.target
                                    : trigger.includes('STOPLOSS') || trigger.includes('SL') || trigger.includes('TRAILING')
                                    ? styles.stoploss
                                    : '';

                                return (
                                    <tr key={t?.index || idx + 1}>
                                        <td style={{ color: '#94A3B8' }}>{t?.index || idx + 1}</td>
                                        <td>{t?.entryDate || '—'}</td>
                                        <td>{formatPrice(t?.entryPrice)}</td>
                                        <td>{t?.exitDate || '—'}</td>
                                        <td>{formatPrice(t?.exitPrice)}</td>
                                        <td>
                                            <span className={isBuy ? styles.badgeBuy : styles.badgeSell}>
                                                {side}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`${styles.badgeTrigger} ${triggerClass}`}>
                                                {trigger}
                                            </span>
                                        </td>
                                        <td
                                            style={{
                                                color: isWin ? '#10B981' : '#F43F5E',
                                                fontWeight: 700
                                            }}
                                        >
                                            {formatPnL(pnlNum)}
                                        </td>
                                        <td style={{ fontWeight: 600 }}>
                                            {formatBalance(t?.runningBalance)}
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
