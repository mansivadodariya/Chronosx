'use client';

import React from 'react';
import styles from '../styles/strategyStudio.module.scss';

function formatVal(val, decimals = 2) {
    if (val == null || isNaN(Number(val))) return '—';
    return Number(val).toFixed(decimals);
}

export default function StrategyBacktestCard({ result }) {
    if (!result) return null;

    if (!result.success) {
        const errorText = result.message || result.error || 'Backtest execution failed';
        const errorsList = result.errors || [];
        return (
            <div className={styles.copilotCard}>
                <div className={styles.cardHeaderRow}>
                    <h2 className={styles.cardTitle}>Backtest Result</h2>
                </div>
                <div className={styles.validationErrors}>
                    <strong>{errorText}</strong>
                    {errorsList.length > 0 && (
                        <ul>
                            {errorsList.map((e, idx) => (
                                <li key={idx}>{e}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        );
    }

    const st = result.stats || {};
    const items = [
        { label: 'Trades', val: result.total_trades, d: 0 },
        { label: 'Win rate %', val: result.win_rate, d: 2 },
        { label: 'Net PnL $', val: result.pnl, d: 2, isPnl: true },
        { label: 'Return %', val: result.pnl_percentage, d: 2, isPnl: true },
        { label: 'Profit factor', val: result.profit_factor, d: 2 },
        { label: 'Max DD %', val: result.max_drawdown_percentage, d: 2 },
        { label: 'Wins', val: result.wins, d: 0 },
        { label: 'Losses', val: result.losses, d: 0 },
        { label: 'Expectancy $', val: st.expectancy, d: 2 },
        { label: 'Avg win $', val: st.avg_win, d: 2 },
        { label: 'Avg loss $', val: st.avg_loss, d: 2 },
        { label: 'Sharpe', val: st.sharpe_ratio, d: 2 },
    ];

    const positions = (result.data && result.data[0] && result.data[0].positions) || [];

    const getPnlClass = (val) => {
        const num = Number(val);
        if (num > 0) return styles.pos;
        if (num < 0) return styles.neg;
        return '';
    };

    return (
        <div className={styles.copilotCard}>
            <div className={styles.cardHeaderRow}>
                <h2 className={styles.cardTitle}>Backtest Results</h2>
                <span className={`${styles.stageChip} ${styles.chipReady}`}>Complete</span>
            </div>

            {/* 12 Key Performance Metrics Grid */}
            <div className={styles.statsGrid}>
                {items.map((it, idx) => {
                    const num = Number(it.val);
                    const pnlClass = it.isPnl ? getPnlClass(num) : '';
                    return (
                        <div key={idx} className={styles.statItem}>
                            <b className={pnlClass}>{formatVal(it.val, it.d)}</b>
                            <span>{it.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Executed Positions / Trades Table */}
            <div className={styles.tableWrap}>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Side</th>
                            <th>Entry</th>
                            <th>Entry Px</th>
                            <th>Exit</th>
                            <th>Exit Px</th>
                            <th>Reason</th>
                            <th>PnL $</th>
                        </tr>
                    </thead>
                    <tbody>
                        {positions && positions.length > 0 ? (
                            positions.map((p) => {
                                const pnlNum = Number(p.pnl);
                                return (
                                    <tr key={p.position_id}>
                                        <td>{p.position_id}</td>
                                        <td>{p.type}</td>
                                        <td>{p.entry_time}</td>
                                        <td>{p.entry_price}</td>
                                        <td>{p.exit_time || '—'}</td>
                                        <td>{p.exit_price ?? '—'}</td>
                                        <td>{p.exit_trigger || p.status || '—'}</td>
                                        <td className={getPnlClass(pnlNum)}>
                                            {formatVal(p.pnl, 2)}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '16px' }}>
                                    No trade positions executed in this backtest window.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
