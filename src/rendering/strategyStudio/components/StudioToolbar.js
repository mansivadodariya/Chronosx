'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import styles from '../styles/strategyStudio.module.scss';
import CustomSelect from './CustomSelect';
import CustomDatePicker from '@/components/customDatePicker';
import {
    getTodayDateStr,
    getPastYearsDateStr,
    addYearsToStr,
    handleFromDateChangeConstrained,
    handleToDateChangeConstrained
} from '@/utils/dateRangeUtils';
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
    { value: 'USDCAD', label: 'USDCAD' },
    { value: 'BTCUSD', label: 'BTCUSD' },
    { value: 'ETHUSD', label: 'ETHUSD' },
    { value: 'US30', label: 'US30' }
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
    const { t } = useLanguage();
    // 3-Year past limit & 1-Year maximum range difference
    const todayStr = getTodayDateStr();
    const threeYearsAgoStr = getPastYearsDateStr(3);

    // Dynamic min/max bounds for From date input
    const fromMinAttr = toDate
        ? (addYearsToStr(toDate, -1) > threeYearsAgoStr ? addYearsToStr(toDate, -1) : threeYearsAgoStr)
        : threeYearsAgoStr;
    const fromMaxAttr = toDate ? (toDate < todayStr ? toDate : todayStr) : todayStr;

    // Dynamic min/max bounds for To date input
    const toMinAttr = fromDate
        ? (fromDate > threeYearsAgoStr ? fromDate : threeYearsAgoStr)
        : threeYearsAgoStr;
    const toMaxAttr = fromDate
        ? (addYearsToStr(fromDate, 1) < todayStr ? addYearsToStr(fromDate, 1) : todayStr)
        : todayStr;

    const handleFromChange = (val) => {
        const { from, to } = handleFromDateChangeConstrained(val, toDate, 1, 3);
        if (setFromDate) setFromDate(from);
        if (setToDate && to !== toDate) setToDate(to);
    };

    const handleToChange = (val) => {
        const { from, to } = handleToDateChangeConstrained(val, fromDate, 1, 3);
        if (setToDate) setToDate(to);
        if (setFromDate && from !== fromDate) setFromDate(from);
    };

    return (
        <div className={styles.studioToolbar}>
            <div className={styles.toolbarParams}>
                {/* 1. Symbol */}
                <div className={styles.paramGroup}>
                    <div className={styles.paramLabelRow}>
                        <ChartTrendIcon size={12} />
                        <span>{t('strategyStudio.symbol', 'Symbol')}</span>
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
                        <span>{t('strategyStudio.interval', 'Interval')}</span>
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
                        <span>{t('strategyStudio.from', 'From')}</span>
                    </div>
                    <div className={styles.paramControlWrap}>
                        <CustomDatePicker
                            value={fromDate}
                            min={fromMinAttr}
                            max={fromMaxAttr}
                            onChange={handleFromChange}
                            width="125px"
                            placeholder={t('strategyStudio.selectDate', 'Select Date')}
                        />
                    </div>
                </div>

                {/* 4. To Date */}
                <div className={styles.paramGroup}>
                    <div className={styles.paramLabelRow}>
                        <CalendarDateIcon size={12} />
                        <span>{t('strategyStudio.to', 'To')}</span>
                    </div>
                    <div className={styles.paramControlWrap}>
                        <CustomDatePicker
                            value={toDate}
                            min={toMinAttr}
                            max={toMaxAttr}
                            onChange={handleToChange}
                            width="125px"
                            placeholder={t('strategyStudio.selectDate', 'Select Date')}
                        />
                    </div>
                </div>

                {/* 5. Capital */}
                <div className={styles.paramGroup}>
                    <div className={styles.paramLabelRow}>
                        <CoinsCapitalIcon size={12} />
                        <span>{t('strategyStudio.capital', 'Capital ($)')}</span>
                    </div>
                    <div className={styles.paramControlWrap}>
                        <input
                            type="number"
                            min="1"
                            className={styles.paramInputCapital}
                            onKeyDown={(e) => {
                                if (['-', '+', 'e', 'E'].includes(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            value={capital}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === '') {
                                    setCapital('');
                                    return;
                                }
                                const clean = String(val).replace(/[^0-9]/g, '');
                                const num = parseInt(clean, 10);
                                if (!isNaN(num)) {
                                    setCapital(Math.max(1, num));
                                } else {
                                    setCapital('');
                                }
                            }}
                        />
                    </div>
                </div>

                {/* 6. Volume (Lots) */}
                <div className={styles.paramGroup}>
                    <div className={styles.paramLabelRow}>
                        <QuantityHashIcon size={12} />
                        <span>{t('strategyStudio.volume', 'Volume (Lots)')}</span>
                    </div>
                    <div className={styles.paramControlWrap}>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max="1"
                            className={styles.paramInputVolume}
                            onKeyDown={(e) => {
                                if (['-', '+', 'e', 'E'].includes(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            placeholder="0.01"
                            value={quantity}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === '') {
                                    setQuantity('');
                                    return;
                                }
                                const clean = String(val).replace(/[^0-9.]/g, '');
                                const num = parseFloat(clean);
                                if (!isNaN(num)) {
                                    if (num > 1) {
                                        setQuantity(1);
                                    } else if (num < 0) {
                                        setQuantity(0.01);
                                    } else {
                                        setQuantity(clean);
                                    }
                                } else {
                                    setQuantity(clean);
                                }
                            }}
                            onBlur={(e) => {
                                const num = parseFloat(e.target.value);
                                if (isNaN(num) || num < 0.01) {
                                    setQuantity(0.01);
                                } else if (num > 1) {
                                    setQuantity(1);
                                } else {
                                    setQuantity(num);
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className={styles.toolbarActionsRow}>
                <button
                    type="button"
                    className={styles.btnNeonRunBacktest}
                    onClick={onRunBacktest}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <div className={`${styles.spinner} ${styles.spinnerSmall}`} />
                            <span>{t('strategyStudio.simulating', 'Simulating...')}</span>
                        </>
                    ) : (
                        <>
                            <RocketRunIcon size={15} />
                            <span>{t('strategyStudio.runBacktest', 'Run Backtest')}</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
