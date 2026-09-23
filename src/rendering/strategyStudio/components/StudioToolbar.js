'use client';

import React from 'react';
import styles from '../styles/strategyStudio.module.scss';
import CustomSelect from './CustomSelect';
import {
    ChartTrendIcon,
    ClockIntervalIcon,
    CalendarDateIcon,
    CoinsCapitalIcon,
    QuantityHashIcon,
    RocketRunIcon,
    DocumentJsonIcon
} from './StudioIcons';

const SYMBOL_OPTIONS = [
    { value: 'XAUUSD', label: 'XAUUSD' },
    { value: 'EURJPY', label: 'EURJPY' },
    { value: 'EURUSD', label: 'EURUSD' },
    { value: 'GBPJPY', label: 'GBPJPY' },
    { value: 'GBPUSD', label: 'GBPUSD' },
    { value: 'USDCAD', label: 'USDCAD' }
];

const INTERVAL_OPTIONS = [
    { value: '5min', label: '5min' },
    { value: '15min', label: '15min' },
    { value: '30min', label: '30min' },
    { value: '60min', label: '60min' },
    { value: '1day', label: '1day' }
];

export default function StudioToolbar({
    symbol,
    setSymbol,
    interval,
    setInterval,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    capital,
    setCapital,
    quantity,
    setQuantity,
    onManualClick,
    onRunBacktest,
    loading
}) {
    return (
        <div className={styles.studioToolbar}>
            <div className={styles.toolbarParams}>
                {/* 1. Symbol */}
                <div className={styles.paramGroup}>
                    <div className={styles.paramLabelRow}>
                        <ChartTrendIcon size={12} />
                        <span>Symbol</span>
                    </div>
                    <div className={styles.paramControlWrap}>
                        <CustomSelect
                            value={symbol}
                            onChange={setSymbol}
                            options={SYMBOL_OPTIONS}
                            width="105px"
                        />
                    </div>
                </div>

                {/* 2. Interval with Custom Themed Dropdown */}
                <div className={styles.paramGroup}>
                    <div className={styles.paramLabelRow}>
                        <ClockIntervalIcon size={12} />
                        <span>Interval</span>
                    </div>
                    <div className={styles.paramControlWrap}>
                        <CustomSelect
                            value={interval}
                            onChange={setInterval}
                            options={INTERVAL_OPTIONS}
                            width="92px"
                        />
                    </div>
                </div>

                {/* 3. From Date */}
                <div className={styles.paramGroup}>
                    <div className={styles.paramLabelRow}>
                        <CalendarDateIcon size={12} />
                        <span>From</span>
                    </div>
                    <div className={styles.paramControlWrap}>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            style={{ width: '135px' }}
                        />
                    </div>
                </div>

                {/* 4. To Date */}
                <div className={styles.paramGroup}>
                    <div className={styles.paramLabelRow}>
                        <CalendarDateIcon size={12} />
                        <span>To</span>
                    </div>
                    <div className={styles.paramControlWrap}>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            style={{ width: '135px' }}
                        />
                    </div>
                </div>

                {/* 5. Capital */}
                <div className={styles.paramGroup}>
                    <div className={styles.paramLabelRow}>
                        <CoinsCapitalIcon size={12} />
                        <span>Capital ($)</span>
                    </div>
                    <div className={styles.paramControlWrap}>
                        <input
                            type="number"
                            value={capital}
                            onChange={(e) => setCapital(Number(e.target.value))}
                            style={{ width: '90px' }}
                        />
                    </div>
                </div>

                {/* 6. Quantity */}
                <div className={styles.paramGroup}>
                    <div className={styles.paramLabelRow}>
                        <QuantityHashIcon size={12} />
                        <span>Quantity</span>
                    </div>
                    <div className={styles.paramControlWrap}>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            style={{ width: '65px' }}
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                    type="button"
                    className={styles.btnNeonRunBacktest}
                    onClick={onRunBacktest}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <div className={styles.spinner} style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                            <span>Simulating...</span>
                        </>
                    ) : (
                        <>
                            <RocketRunIcon size={15} />
                            <span>Run Backtest</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
