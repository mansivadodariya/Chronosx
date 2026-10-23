'use client';

import React, { useState } from 'react';
import styles from '../styles/strategyStudio.module.scss';
import StrategyRulesEditor from './StrategyRulesEditor';
import CustomSelect from './CustomSelect';
import { UploadFileIcon } from './StudioIcons';

export default function StrategyModifyForm({
    initialStrategy,
    metadata,
    indIndex = {},
    formErrors = [],
    busy = false,
    onSave,
    onCancel,
}) {
    const [draft, setDraft] = useState(() => {
        const base = structuredClone(initialStrategy || {});
        if (!base.entry_conditions) {
            base.entry_conditions = {
                entry_start_time: '00:00',
                entry_end_time: '23:59',
                condition_type: 'all',
                rules: [],
            };
        }
        if (!base.exit_conditions) {
            base.exit_conditions = {
                target: null,
                target_type: 'points',
                stoploss: null,
                stoploss_type: 'points',
                atr_length: 14,
                trailing_stoploss: false,
                condition_type: 'any',
                rules: [],
            };
        }
        return base;
    });

    // Resolve metadata - handle different API response shapes with complete fallbacks
    const rawMeta = metadata || {};
    const defaultPairs = [
        { symbol: 'EURUSD', label: 'EUR/USD' },
        { symbol: 'GBPUSD', label: 'GBP/USD' },
        { symbol: 'EURJPY', label: 'EUR/JPY' },
        { symbol: 'GBPJPY', label: 'GBP/JPY' },
        { symbol: 'USDCAD', label: 'USD/CAD' },
        { symbol: 'XAUUSD', label: 'XAU/USD (Gold)' },
    ];
    const defaultTfs = ['1min', '5min', '15min', '30min', '60min', '1day'];
    const defaultDirs = [
        { value: 0, label: 'Long / Buy' },
        { value: 1, label: 'Short / Sell' },
    ];
    const defaultExitTypes = [
        { value: 'points', label: 'Points (broker points)' },
        { value: 'pips', label: 'Pips' },
        { value: 'percent', label: '% of entry price' },
        { value: 'atr', label: 'x ATR (multiple of ATR)' },
        { value: 'dollar', label: '$ per lot' },
    ];
    const defaultCondTypes = [
        { value: 'all', label: 'ALL rules must be true (AND)' },
        { value: 'any', label: 'ANY rule can be true (OR)' },
    ];
    const defaultOps = [
        { value: 'crossover', label: 'crosses above' },
        { value: 'crossdown', label: 'crosses below' },
        { value: '>', label: 'is greater than (>)' },
        { value: '>=', label: 'is greater than or equal to (>=)' },
        { value: '<', label: 'is less than (<)' },
        { value: '<=', label: 'is less than or equal to (<=)' },
        { value: '==', label: 'equals (==)' },
    ];

    const m = {
        pairs: (rawMeta.pairs?.length ? rawMeta.pairs : rawMeta.data?.pairs) || defaultPairs,
        timeframes: (rawMeta.timeframes?.length ? rawMeta.timeframes : rawMeta.data?.timeframes) || defaultTfs,
        directions: (rawMeta.directions?.length ? rawMeta.directions : rawMeta.data?.directions) || defaultDirs,
        exit_value_types: (rawMeta.exit_value_types?.length ? rawMeta.exit_value_types : rawMeta.data?.exit_value_types) || defaultExitTypes,
        condition_types: (rawMeta.condition_types?.length ? rawMeta.condition_types : rawMeta.data?.condition_types) || defaultCondTypes,
        operators: (rawMeta.operators?.length ? rawMeta.operators : rawMeta.data?.operators) || defaultOps,
        indicator_groups: rawMeta.indicator_groups || rawMeta.data?.indicator_groups || [],
    };

    const en = draft.entry_conditions;
    const ex = draft.exit_conditions;

    const pairOpts = (m.pairs || []).map((p) => ({ value: p.symbol, label: p.label || p.symbol }));
    const tfOpts = (m.timeframes || []).map((t) => ({ value: t, label: t }));

    // Extract current pair safely (string or array)
    const currentPair = Array.isArray(draft.stock_name)
        ? (draft.stock_name[0] || '')
        : (draft.stock_name || draft.symbol || draft.instrument || '');
    const hasPairInOpts = !currentPair || pairOpts.some((p) => p.value === currentPair);
    if (!hasPairInOpts) {
        pairOpts.unshift({ value: currentPair, label: currentPair });
    }

    const currentTf = draft.interval || draft.timeframe || '';
    const hasTfInOpts = !currentTf || tfOpts.some((t) => t.value === currentTf);
    if (!hasTfInOpts) {
        tfOpts.unshift({ value: currentTf, label: currentTf });
    }

    const directionOpts = [...(m.directions || [])];
    let currentDir = draft.entry_type;
    if (typeof currentDir === 'string') {
        const lower = currentDir.toLowerCase();
        if (lower === 'buy' || lower === 'long' || lower === '0') currentDir = 0;
        else if (lower === 'sell' || lower === 'short' || lower === '1') currentDir = 1;
    }
    const hasDirInOpts = currentDir == null || directionOpts.some((d) => String(d.value) === String(currentDir));
    if (!hasDirInOpts) {
        const dirLabel = currentDir === 0 ? 'Long / Buy' : currentDir === 1 ? 'Short / Sell' : `Direction ${currentDir}`;
        directionOpts.unshift({ value: currentDir, label: dirLabel });
    }

    const handleFieldChange = (key, val) => {
        setDraft((prev) => ({
            ...prev,
            [key]: val,
        }));
    };

    const handleEntryChange = (updatedEntry) => {
        setDraft((prev) => ({
            ...prev,
            entry_conditions: updatedEntry,
        }));
    };

    const handleExitChange = (updatedExit) => {
        setDraft((prev) => ({
            ...prev,
            exit_conditions: updatedExit,
        }));
    };

    const handleSubmit = async (e) => {
        e?.preventDefault?.();
        onSave(draft);
    };

    return (
        <form className={styles.copilotCard} onSubmit={handleSubmit}>
            <div className={styles.cardHeaderRow}>
                <h2 className={styles.cardTitle}>Modify Strategy</h2>
            </div>

            {/* General & Market Parameters */}
            <div className={styles.formGrid}>
                <div className={styles.formField} style={{ gridColumn: '1 / -1' }}>
                    <label>Strategy Name</label>
                    <input
                        type="text"
                        value={draft.strategy_name || ''}
                        onChange={(e) => handleFieldChange('strategy_name', e.target.value || null)}
                        placeholder="My Momentum Strategy"
                    />
                </div>

                <div className={styles.formField}>
                    <label>Pair</label>
                    <CustomSelect
                        value={currentPair}
                        onChange={(val) =>
                            handleFieldChange('stock_name', val ? [val] : null)
                        }
                        options={pairOpts}
                        placeholder="Select pair"
                        width="100%"
                    />
                </div>

                <div className={styles.formField}>
                    <label>Timeframe</label>
                    <CustomSelect
                        value={currentTf}
                        onChange={(val) => handleFieldChange('interval', val || null)}
                        options={tfOpts}
                        placeholder="Select timeframe"
                        width="100%"
                    />
                </div>

                <div className={styles.formField}>
                    <label>From Date</label>
                    <input
                        type="date"
                        value={draft.from_date || ''}
                        onChange={(e) => handleFieldChange('from_date', e.target.value || null)}
                    />
                </div>

                <div className={styles.formField}>
                    <label>To Date</label>
                    <input
                        type="date"
                        value={draft.to_date || ''}
                        onChange={(e) => handleFieldChange('to_date', e.target.value || null)}
                    />
                </div>

                <div className={styles.formField}>
                    <label>Direction</label>
                    <CustomSelect
                        value={currentDir != null ? currentDir : ''}
                        onChange={(val) =>
                            handleFieldChange(
                                'entry_type',
                                val === '' ? null : parseInt(val, 10)
                            )
                        }
                        options={directionOpts}
                        placeholder="Select direction"
                        width="100%"
                    />
                </div>

                <div className={styles.formField}>
                    <label>Lots (Quantity)</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={draft.quantity ?? 0.01}
                        onChange={(e) => handleFieldChange('quantity', parseFloat(e.target.value) || 0.01)}
                    />
                </div>

                <div className={styles.formField}>
                    <label>Initial Capital ($)</label>
                    <input
                        type="number"
                        step="100"
                        min="1"
                        value={draft.inital_capital ?? 10000}
                        onChange={(e) =>
                            handleFieldChange('inital_capital', parseFloat(e.target.value) || 10000)
                        }
                    />
                </div>

                <div className={styles.formField}>
                    <label>Close At Day End</label>
                    <CustomSelect
                        value={draft.is_mis ? 'true' : 'false'}
                        onChange={(val) => handleFieldChange('is_mis', val === 'true')}
                        options={[
                            { value: 'false', label: 'No' },
                            { value: 'true', label: 'Yes' },
                        ]}
                        width="100%"
                    />
                </div>

                <div className={styles.formField}>
                    <label>Entry Window Start</label>
                    <input
                        type="time"
                        value={en?.entry_start_time || '00:00'}
                        onChange={(e) =>
                            handleEntryChange({ ...en, entry_start_time: e.target.value })
                        }
                    />
                </div>

                <div className={styles.formField}>
                    <label>Entry Window End</label>
                    <input
                        type="time"
                        value={en?.entry_end_time || '23:59'}
                        onChange={(e) =>
                            handleEntryChange({ ...en, entry_end_time: e.target.value })
                        }
                    />
                </div>
            </div>

            {/* Entry Rules Section */}
            <StrategyRulesEditor
                title="Entry Rules"
                conditions={en}
                isExit={false}
                conditionTypes={m.condition_types}
                operators={m.operators}
                indicatorGroups={m.indicator_groups}
                indIndex={indIndex}
                onChange={handleEntryChange}
            />

            {/* Exit Section: TP / SL / ATR / Trailing */}
            <div className={styles.sectionSubheader} style={{ marginTop: '20px' }}>
                Exit · Take Profit / Stop Loss
            </div>
            <div className={styles.formGrid}>
                <div className={styles.formField}>
                    <label>Take Profit (blank = off)</label>
                    <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="Off"
                        value={ex?.target ?? ''}
                        onChange={(e) =>
                            handleExitChange({
                                ...ex,
                                target: e.target.value === '' ? null : parseFloat(e.target.value),
                            })
                        }
                    />
                </div>

                <div className={styles.formField}>
                    <label>TP Unit</label>
                    <CustomSelect
                        value={ex?.target_type || 'points'}
                        onChange={(val) => handleExitChange({ ...ex, target_type: val })}
                        options={m.exit_value_types}
                        width="100%"
                    />
                </div>

                <div className={styles.formField}>
                    <label>Stop Loss (blank = off)</label>
                    <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="Off"
                        value={ex?.stoploss ?? ''}
                        onChange={(e) =>
                            handleExitChange({
                                ...ex,
                                stoploss: e.target.value === '' ? null : parseFloat(e.target.value),
                            })
                        }
                    />
                </div>

                <div className={styles.formField}>
                    <label>SL Unit</label>
                    <CustomSelect
                        value={ex?.stoploss_type || 'points'}
                        onChange={(val) => handleExitChange({ ...ex, stoploss_type: val })}
                        options={m.exit_value_types}
                        width="100%"
                    />
                </div>

                <div className={styles.formField}>
                    <label>ATR Length (for ATR units)</label>
                    <input
                        type="number"
                        step="1"
                        min="1"
                        value={ex?.atr_length ?? 14}
                        onChange={(e) =>
                            handleExitChange({
                                ...ex,
                                atr_length: parseInt(e.target.value, 10) || 14,
                            })
                        }
                    />
                </div>

                <div className={styles.formField}>
                    <label>Trailing Stop</label>
                    <CustomSelect
                        value={ex?.trailing_stoploss ? 'true' : 'false'}
                        onChange={(val) =>
                            handleExitChange({
                                ...ex,
                                trailing_stoploss: val === 'true',
                            })
                        }
                        options={[
                            { value: 'false', label: 'No' },
                            { value: 'true', label: 'Yes' },
                        ]}
                        width="100%"
                    />
                </div>
            </div>

            {/* Exit Indicator Rules Section */}
            <StrategyRulesEditor
                title="Exit Rules (Optional Indicator Exit)"
                conditions={ex}
                isExit={true}
                conditionTypes={m.condition_types}
                operators={m.operators}
                indicatorGroups={m.indicator_groups}
                indIndex={indIndex}
                onChange={handleExitChange}
            />

            {/* Form Validation Errors */}
            {formErrors && formErrors.length > 0 && (
                <div className={styles.validationErrors}>
                    <strong>Please fix the following:</strong>
                    <ul>
                        {formErrors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Actions */}
            <div className={styles.cardActions}>
                <button
                    type="submit"
                    className={styles.btnPrimaryAction}
                    disabled={busy}
                >
                    {busy ? (
                        <span>Saving…</span>
                    ) : (
                        <>
                            <UploadFileIcon size={14} color="#ffffff" />
                            <span>Save strategy</span>
                        </>
                    )}
                </button>
                <button
                    type="button"
                    className={styles.btnGhostAction}
                    onClick={onCancel}
                    disabled={busy}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
