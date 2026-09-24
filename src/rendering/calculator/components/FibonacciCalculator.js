'use client';

import React, { useState, useMemo } from 'react';
import styles from '../calculator.module.scss';
import { PAIRS_CONFIG } from '../config';
import CustomDropdown from './CustomDropdown';

export default function FibonacciCalculator() {
    const pairOptions = Object.keys(PAIRS_CONFIG);
    const defaultP = PAIRS_CONFIG['XAU/USD']?.defaultPrice || 4308.18;
    const [fibPair, setFibPair] = useState('XAU/USD');
    const [fibTrend, setFibTrend] = useState('up'); // 'up' (Bullish) | 'down' (Bearish)
    const [fibHigh, setFibHigh] = useState(String((defaultP * 1.01).toFixed(2)));
    const [fibLow, setFibLow] = useState(String((defaultP * 0.99).toFixed(2)));

    const fibResult = useMemo(() => {
        const high = parseFloat(fibHigh) || 0;
        const low = parseFloat(fibLow) || 0;
        const diff = high - low;

        const retracements = [
            { level: '23.6%', ratio: 0.236 },
            { level: '38.2%', ratio: 0.382 },
            { level: '50.0%', ratio: 0.500 },
            { level: '61.8% (Golden)', ratio: 0.618, isGolden: true },
            { level: '78.6%', ratio: 0.786 },
            { level: '88.6%', ratio: 0.886 },
        ];

        const extensions = [
            { level: '127.2%', ratio: 1.272 },
            { level: '141.4%', ratio: 1.414 },
            { level: '161.8% (Golden)', ratio: 1.618, isGolden: true },
            { level: '200.0%', ratio: 2.000 },
            { level: '261.8%', ratio: 2.618 },
        ];

        const calculatedRetracements = retracements.map(item => {
            const price = fibTrend === 'up'
                ? high - (diff * item.ratio)
                : low + (diff * item.ratio);
            return { ...item, price };
        });

        const calculatedExtensions = extensions.map(item => {
            const price = fibTrend === 'up'
                ? low + (diff * item.ratio)
                : high - (diff * item.ratio);
            return { ...item, price };
        });

        return {
            diff,
            retracements: calculatedRetracements,
            extensions: calculatedExtensions,
        };
    }, [fibTrend, fibHigh, fibLow]);

    return (
        <div className={styles.calculatorCardGrid}>
            <div className={styles.formCard}>
                <div className={styles.cardHeader}>
                    <h2>Fibonacci Price Swing Parameters</h2>
                    <span>GOLDEN RATIO</span>
                </div>

                <div className={styles.inputsGrid}>
                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label>Instrument / Asset Preset</label>
                        <CustomDropdown
                            options={pairOptions}
                            value={fibPair}
                            onChange={(val) => {
                                setFibPair(val);
                                const pairData = PAIRS_CONFIG[val] || PAIRS_CONFIG['EUR/USD'];
                                const p = pairData?.defaultPrice || 1.08450;
                                const decimals = (pairData?.type === 'crypto' || pairData?.type === 'metal' || pairData?.type === 'jpy') ? 2 : 5;
                                setFibHigh(String((p * 1.01).toFixed(decimals)));
                                setFibLow(String((p * 0.99).toFixed(decimals)));
                            }}
                        />
                    </div>

                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label>Trend Direction</label>
                        <div className={styles.toggleSwitchRow}>
                            <button
                                type="button"
                                className={`${styles.switchBtn} ${fibTrend === 'up' ? styles.buyActive : ''}`}
                                onClick={() => setFibTrend('up')}
                            >
                                ↑ Uptrend / Bullish Swing (Low → High)
                            </button>
                            <button
                                type="button"
                                className={`${styles.switchBtn} ${fibTrend === 'down' ? styles.sellActive : ''}`}
                                onClick={() => setFibTrend('down')}
                            >
                                ↓ Downtrend / Bearish Swing (High → Low)
                            </button>
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Swing High Price (H)</label>
                        <input
                            type="number"
                            step="0.0001"
                            value={fibHigh}
                            onChange={(e) => setFibHigh(e.target.value)}
                            placeholder="e.g. 1.0950"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Swing Low Price (L)</label>
                        <input
                            type="number"
                            step="0.0001"
                            value={fibLow}
                            onChange={(e) => setFibLow(e.target.value)}
                            placeholder="e.g. 1.0800"
                        />
                    </div>
                </div>

                <div className={styles.actionBtnRow}>
                    <button type="button" className={styles.calculateBtn}>
                        <span>Compute Fibonacci Levels</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            <div className={styles.resultsCard}>
                <div>
                    <div className={styles.resultHeader}>
                        <h3>Fibonacci Levels Breakdown</h3>
                    </div>

                    <h4 style={{ fontSize: '13px', color: '#18C98B', margin: '0 0 8px', textTransform: 'uppercase' }}>
                        Retracement Targets
                    </h4>
                    <table className={styles.levelsTable}>
                        <thead>
                            <tr>
                                <th>Level Ratio</th>
                                <th>Target Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fibResult.retracements.map((r, i) => (
                                <tr key={i} className={r.isGolden ? styles.goldenRatio : ''}>
                                    <td>{r.level}</td>
                                    <td>{r.price.toFixed(4)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
{/* 
                    <h4 style={{ fontSize: '13px', color: '#38BDF8', margin: '18px 0 8px', textTransform: 'uppercase' }}>
                        Extension Targets
                    </h4>
                    <table className={styles.levelsTable}>
                        <thead>
                            <tr>
                                <th>Extension Ratio</th>
                                <th>Target Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fibResult.extensions.map((e, i) => (
                                <tr key={i} className={e.isGolden ? styles.goldenRatio : ''}>
                                    <td>{e.level}</td>
                                    <td>{e.price.toFixed(4)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table> */}
                </div>

                <div className={styles.formulaNote}>
                    <strong>Golden Ratio (61.8% / 161.8%):</strong> Prime institutional reversal and take-profit expansion zones.
                </div>
            </div>
        </div>
    );
}
