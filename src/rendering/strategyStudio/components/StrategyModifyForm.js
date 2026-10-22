'use client';

import React, { useState } from 'react';
import styles from '../styles/strategyStudio.module.scss';
import StrategyRulesEditor from './StrategyRulesEditor';
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

    const m = metadata || {
        pairs: [],
        timeframes: [],
        directions: [],
        exit_value_types: [],
        condition_types: [],
        operators: [],
        indicator_groups: [],
    };

    const en = draft.entry_conditions;
    const ex = draft.exit_conditions;

    const pairOpts = (m.pairs || []).map((p) => ({ value: p.symbol, label: p.label }));
    const tfOpts = (m.timeframes || []).map((t) => ({ value: t, label: t }));

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
                    <select
                        value={(draft.stock_name || [])[0] || ''}
                        onChange={(e) =>
                            handleFieldChange('stock_name', e.target.value ? [e.target.value] : null)
                        }
                    >
                        <option value="">Select pair</option>
                        {pairOpts.map((p) => (
                            <option key={p.value} value={p.value}>
                                {p.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.formField}>
                    <label>Timeframe</label>
                    <select
                        value={draft.interval || ''}
                        onChange={(e) => handleFieldChange('interval', e.target.value || null)}
                    >
                        <option value="">Select timeframe</option>
                        {tfOpts.map((t) => (
                            <option key={t.value} value={t.value}>
                                {t.label}
                            </option>
                        ))}
                    </select>
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
                    <select
                        value={draft.entry_type ?? ''}
                        onChange={(e) =>
                            handleFieldChange(
                                'entry_type',
                                e.target.value === '' ? null : parseInt(e.target.value, 10)
                            )
                        }
                    >
                        <option value="">Select direction</option>
                        {(m.directions || []).map((d) => (
                            <option key={d.value} value={d.value}>
                                {d.label}
                            </option>
                        ))}
                    </select>
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
                    <select
                        value={draft.is_mis ? 'true' : 'false'}
                        onChange={(e) => handleFieldChange('is_mis', e.target.value === 'true')}
                    >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                    </select>
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
                    <select
                        value={ex?.target_type || 'points'}
                        onChange={(e) => handleExitChange({ ...ex, target_type: e.target.value })}
                    >
                        {(m.exit_value_types || []).map((vt) => (
                            <option key={vt.value} value={vt.value}>
                                {vt.label}
                            </option>
                        ))}
                    </select>
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
                    <select
                        value={ex?.stoploss_type || 'points'}
                        onChange={(e) => handleExitChange({ ...ex, stoploss_type: e.target.value })}
                    >
                        {(m.exit_value_types || []).map((vt) => (
                            <option key={vt.value} value={vt.value}>
                                {vt.label}
                            </option>
                        ))}
                    </select>
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
                    <select
                        value={ex?.trailing_stoploss ? 'true' : 'false'}
                        onChange={(e) =>
                            handleExitChange({
                                ...ex,
                                trailing_stoploss: e.target.value === 'true',
                            })
                        }
                    >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                    </select>
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
