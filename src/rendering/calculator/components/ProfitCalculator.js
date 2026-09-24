'use client';

import React, { useState, useMemo } from 'react';
import styles from '../calculator.module.scss';
import { PAIRS_CONFIG, CURRENCIES, RATES_TO_USD } from '../config';
import CustomDropdown from './CustomDropdown';
export default function ProfitCalculator({ onCopy, copied }) {
    const defaultPairData = PAIRS_CONFIG['XAU/USD'] || {};
    const defaultP = defaultPairData.defaultPrice || 4308.18;
    const [profitPair, setProfitPair] = useState('XAU/USD');
    const [profitOrderType, setProfitOrderType] = useState('buy'); // 'buy' | 'sell'
    const [profitLots, setProfitLots] = useState('1.0');
    const [profitOpenPrice, setProfitOpenPrice] = useState(String(defaultP));
    const [profitClosePrice, setProfitClosePrice] = useState(String((defaultP * 1.005).toFixed(2)));
    const [profitStopLoss, setProfitStopLoss] = useState(String((defaultP * 0.997).toFixed(2)));
    const [profitCurrency, setProfitCurrency] = useState('USD');

    const pairOptions = Object.keys(PAIRS_CONFIG);

    const profitResult = useMemo(() => {
        const pairData = PAIRS_CONFIG[profitPair] || PAIRS_CONFIG['EUR/USD'];
        const lots = parseFloat(profitLots) || 0;
        const open = parseFloat(profitOpenPrice) || 0;
        const close = parseFloat(profitClosePrice) || 0;
        const sl = parseFloat(profitStopLoss) || 0;
        const contractSize = pairData.contractSize;
        const pipSize = pairData.pipSize;
        const quoteCurrency = pairData.quote || 'USD';

        const diff = profitOrderType === 'buy' ? close - open : open - close;
        const pips = pipSize > 0 ? diff / pipSize : 0;
        const rawProfitInQuote = diff * lots * contractSize;

        // Convert quote currency to selected account currency
        const quoteToUsd = RATES_TO_USD[quoteCurrency] ?? 1.0;
        const accToUsd = RATES_TO_USD[profitCurrency] ?? 1.0;
        const conversionFactor = quoteToUsd / accToUsd;

        const profit = rawProfitInQuote * conversionFactor;

        const riskDiff = profitOrderType === 'buy' ? open - sl : sl - open;
        const rawRiskInQuote = riskDiff > 0 ? riskDiff * lots * contractSize : 0;
        const riskAmount = rawRiskInQuote * conversionFactor;
        const riskRewardRatio = riskAmount > 0 && profit > 0 ? (profit / riskAmount).toFixed(2) : null;

        return {
            profit,
            pips,
            riskAmount,
            riskRewardRatio,
            isProfit: profit >= 0,
        };
    }, [profitPair, profitOrderType, profitLots, profitOpenPrice, profitClosePrice, profitStopLoss, profitCurrency]);

    return (
        <div className={styles.calculatorCardGrid}>
            <div className={styles.formCard}>
                <div className={styles.cardHeader}>
                    <h2>Trade Outcome & Risk Parameters</h2>
                    <span>P&L ANALYSIS</span>
                </div>

                <div className={styles.inputsGrid}>
                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label>Order Direction</label>
                        <div className={styles.toggleSwitchRow}>
                            <button
                                type="button"
                                className={`${styles.switchBtn} ${profitOrderType === 'buy' ? styles.buyActive : ''}`}
                                onClick={() => setProfitOrderType('buy')}
                            >
                                ▲ BUY (Long Position)
                            </button>
                            <button
                                type="button"
                                className={`${styles.switchBtn} ${profitOrderType === 'sell' ? styles.sellActive : ''}`}
                                onClick={() => setProfitOrderType('sell')}
                            >
                                ▼ SELL (Short Position)
                            </button>
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Instrument</label>
                        <CustomDropdown
                            options={pairOptions}
                            value={profitPair}
                            onChange={(val) => {
                                setProfitPair(val);
                                const pairData = PAIRS_CONFIG[val] || PAIRS_CONFIG['EUR/USD'];
                                const p = pairData?.defaultPrice || 1.08450;
                                const decimals = (pairData?.type === 'crypto' || pairData?.type === 'metal' || pairData?.type === 'jpy') ? 2 : 5;
                                setProfitOpenPrice(String(p));
                                setProfitClosePrice(String(profitOrderType === 'buy' ? (p * 1.005).toFixed(decimals) : (p * 0.995).toFixed(decimals)));
                                setProfitStopLoss(String(profitOrderType === 'buy' ? (p * 0.997).toFixed(decimals) : (p * 1.003).toFixed(decimals)));
                            }}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Account Base Currency</label>
                        <CustomDropdown
                            options={CURRENCIES}
                            value={profitCurrency}
                            onChange={setProfitCurrency}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Trade Size (Lots)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={profitLots}
                            onChange={(e) => setProfitLots(e.target.value)}
                            placeholder="e.g. 1.0"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Entry / Open Price</label>
                        <input
                            type="number"
                            step="0.0001"
                            value={profitOpenPrice}
                            onChange={(e) => setProfitOpenPrice(e.target.value)}
                            placeholder="e.g. 1.0850"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Take Profit / Exit Price</label>
                        <input
                            type="number"
                            step="0.0001"
                            value={profitClosePrice}
                            onChange={(e) => setProfitClosePrice(e.target.value)}
                            placeholder="e.g. 1.0900"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>
                            Stop Loss Price (Optional for R:R)
                            <span className={styles.hint}>Calculates Risk to Reward Ratio</span>
                        </label>
                        <input
                            type="number"
                            step="0.0001"
                            value={profitStopLoss}
                            onChange={(e) => setProfitStopLoss(e.target.value)}
                            placeholder="e.g. 1.0820"
                        />
                    </div>
                </div>

                <div className={styles.actionBtnRow}>
                    <button type="button" className={styles.calculateBtn}>
                        <span>Calculate Profit & Loss</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            <div className={styles.resultsCard}>
                <div>
                    <div className={styles.resultHeader}>
                        <h3>Net Profit / Loss</h3>
                        <button
                            type="button"
                            className={styles.copyBtn}
                            onClick={() => onCopy(`${profitCurrency} ${profitResult.profit.toFixed(2)}`)}
                        >
                            {copied ? '✓ Copied' : 'Copy'}
                        </button>
                    </div>

                    <div className={styles.primaryResultBlock}>
                        <div className={styles.resultLabel}>Expected Net Return</div>
                        <div className={`${styles.resultValue} ${profitResult.isProfit ? styles.positive : styles.negative}`}>
                            {profitResult.isProfit ? '+' : ''}{profitCurrency} {profitResult.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={styles.resultSubtext}>
                            {profitResult.isProfit ? 'Gain: ' : 'Loss: '}{profitResult.pips >= 0 ? '+' : ''}{profitResult.pips.toFixed(1)} Pips
                        </div>
                    </div>

                    <div className={styles.breakdownList}>
                        <div className={styles.breakdownItem}>
                            <span>Pips Moved</span>
                            <span>{profitResult.pips >= 0 ? '+' : ''}{profitResult.pips.toFixed(1)} Pips</span>
                        </div>
                        {profitResult.riskRewardRatio && (
                            <div className={styles.breakdownItem}>
                                <span>Risk / Reward Ratio</span>
                                <span style={{ color: '#18C98B' }}>1 : {profitResult.riskRewardRatio}</span>
                            </div>
                        )}
                        {profitResult.riskAmount > 0 && (
                            <div className={styles.breakdownItem}>
                                <span>Max Capital at Risk</span>
                                <span style={{ color: '#FF7070' }}>{profitCurrency} {profitResult.riskAmount.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                </div>

    
            </div>
        </div>
    );
}
