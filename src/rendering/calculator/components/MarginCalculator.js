'use client';

import React, { useState, useMemo } from 'react';
import styles from '../calculator.module.scss';
import { PAIRS_CONFIG, CURRENCIES, LEVERAGES, RATES_TO_USD } from '../config';
import CustomDropdown from './CustomDropdown';

export default function MarginCalculator({ onCopy, copied }) {
    const [marginPair, setMarginPair] = useState('XAU/USD');
    const [marginLots, setMarginLots] = useState('1.0');
    const [marginLeverage, setMarginLeverage] = useState(100);
    const [marginCurrency, setMarginCurrency] = useState('USD');
    const [marginPrice, setMarginPrice] = useState(String(PAIRS_CONFIG['XAU/USD']?.defaultPrice || '4308.18'));

    const pairOptions = Object.keys(PAIRS_CONFIG);

    const marginResult = useMemo(() => {
        const pairData = PAIRS_CONFIG[marginPair] || PAIRS_CONFIG['EUR/USD'];
        const lots = parseFloat(marginLots) || 0;
        const leverage = parseInt(marginLeverage, 10) || 100;
        const price = parseFloat(marginPrice) || pairData.defaultPrice;
        const contractSize = pairData.contractSize;

        // Base currency (e.g. EUR in EUR/USD) vs Account Currency
        const notionalInQuoteOrUSD = lots * contractSize * price;
        const rawRequiredMarginInUSD = notionalInQuoteOrUSD / leverage;

        // Convert required margin to selected account base currency
        const accToUsd = RATES_TO_USD[marginCurrency] ?? 1.0;
        const requiredMargin = rawRequiredMarginInUSD / accToUsd;
        const notionalValue = notionalInQuoteOrUSD / accToUsd;
        const marginPct = (1 / leverage) * 100;

        return {
            requiredMargin,
            notionalValue,
            marginPct,
            leverage,
        };
    }, [marginPair, marginLots, marginLeverage, marginPrice, marginCurrency]);

    return (
        <div className={styles.calculatorCardGrid}>
            <div className={styles.formCard}>
                <div className={styles.cardHeader}>
                    <h2>Margin Requirement Parameters</h2>
                    <span>LEVERAGE CALC</span>
                </div>

                <div className={styles.inputsGrid}>
                    <div className={styles.inputGroup}>
                        <label>Instrument / Asset</label>
                        <CustomDropdown
                            options={pairOptions}
                            value={marginPair}
                            onChange={(val) => {
                                setMarginPair(val);
                                setMarginPrice(String(PAIRS_CONFIG[val]?.defaultPrice || '1.0850'));
                            }}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Account Base Currency</label>
                        <CustomDropdown
                            options={CURRENCIES}
                            value={marginCurrency}
                            onChange={setMarginCurrency}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Account Leverage</label>
                        <CustomDropdown
                            options={LEVERAGES}
                            value={marginLeverage}
                            onChange={(val) => setMarginLeverage(Number(val))}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Trade Size (Lots)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={marginLots}
                            onChange={(e) => setMarginLots(e.target.value)}
                            placeholder="e.g. 1.0"
                        />
                        <div className={styles.quickChips}>
                            {['0.01', '0.10', '0.50', '1.0', '5.0'].map((l) => (
                                <button
                                    key={l}
                                    type="button"
                                    className={`${styles.chipBtn} ${marginLots === l ? styles.activeChip : ''}`}
                                    onClick={() => setMarginLots(l)}
                                >
                                    {l} Lot
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label>Current Market Price</label>
                        <input
                            type="number"
                            step="0.0001"
                            value={marginPrice}
                            onChange={(e) => setMarginPrice(e.target.value)}
                            placeholder="e.g. 1.0850"
                        />
                    </div>
                </div>

                <div className={styles.actionBtnRow}>
                    <button type="button" className={styles.calculateBtn}>
                        <span>Calculate Required Margin</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            <div className={styles.resultsCard}>
                <div>
                    <div className={styles.resultHeader}>
                        <h3>Required Margin</h3>
                        <button
                            type="button"
                            className={styles.copyBtn}
                            onClick={() => onCopy(`${marginCurrency} ${marginResult.requiredMargin.toFixed(2)}`)}
                        >
                            {copied ? '✓ Copied' : 'Copy'}
                        </button>
                    </div>

                    <div className={styles.primaryResultBlock}>
                        <div className={styles.resultLabel}>Required Margin ({marginLots} Lot @ 1:{marginLeverage})</div>
                        <div className={styles.resultValue}>
                            {marginCurrency} {marginResult.requiredMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={styles.resultSubtext}>
                            Margin Rate: {marginResult.marginPct.toFixed(2)}%
                        </div>
                    </div>

                    <div className={styles.breakdownList}>
                        <div className={styles.breakdownItem}>
                            <span>Notional Position Value</span>
                            <span>{marginCurrency} {marginResult.notionalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className={styles.breakdownItem}>
                            <span>Effective Leverage</span>
                            <span>1 : {marginResult.leverage}</span>
                        </div>
                    </div>
                </div>

        
            </div>
        </div>
    );
}
