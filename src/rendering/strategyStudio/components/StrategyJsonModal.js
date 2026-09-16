'use client';

import React, { useState, useEffect } from 'react';
import styles from '../styles/strategyStudio.module.scss';
import CustomSelect from './CustomSelect';
import { STRATEGY_PRESETS, validateStrategyInput } from '../utils/backtestEngine';
import {
    DocumentJsonIcon,
    SlidersTuneIcon,
    SparklesMagicIcon,
    CopyClipboardIcon,
    RocketRunIcon,
    ShieldCheckIcon
} from './StudioIcons';

const PRESET_OPTIONS = [
    { value: '', label: 'Select Strategy Preset...' },
    { value: 'donchian', label: 'Donchian Breakout (XAUUSD 15m)' },
    { value: 'bollinger', label: 'Bollinger Bands Breakout (GBPUSD 15m)' },
    { value: 'ema', label: 'EMA Fast/Slow Crossover (EURUSD 30m)' },
    { value: 'rsi', label: 'RSI Oversold Reversal (USDJPY 15m)' },
    { value: 'macd', label: 'MACD Signal Crossover (EURUSD 60m)' }
];

export default function StrategyJsonModal({
    isOpen,
    onClose,
    strategyJson,
    onRunStrategy,
    onToast
}) {
    const [mode, setMode] = useState('view'); // 'view' | 'edit'
    const [editText, setEditText] = useState('');

    useEffect(() => {
        if (strategyJson) {
            setEditText(typeof strategyJson === 'string' ? strategyJson : JSON.stringify(strategyJson, null, 2));
        } else {
            setEditText(JSON.stringify(STRATEGY_PRESETS.donchian, null, 2));
        }
    }, [strategyJson, isOpen]);

    if (!isOpen) return null;

    const validation = validateStrategyInput(editText);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(editText);
            if (onToast) onToast('Copied JSON to clipboard');
        } catch (err) {
            if (onToast) onToast('Failed to copy');
        }
    };

    const handlePrettify = () => {
        try {
            const parsed = JSON.parse(editText);
            setEditText(JSON.stringify(parsed, null, 2));
            if (onToast) onToast('JSON formatted');
        } catch (err) {
            if (onToast) onToast(`Invalid JSON: ${err.message}`);
        }
    };

    const handlePreset = (val) => {
        if (val && STRATEGY_PRESETS[val]) {
            setEditText(JSON.stringify(STRATEGY_PRESETS[val], null, 2));
            if (onToast) onToast(`Loaded preset: ${val}`);
        }
    };

    const handleRun = () => {
        if (mode === 'edit') {
            if (!validation.valid) {
                alert(`Cannot run: ${validation.message}`);
                return;
            }
            onClose();
            onRunStrategy(validation.strategy);
        } else {
            onClose();
            onRunStrategy(typeof strategyJson === 'object' ? strategyJson : null);
        }
    };

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Strategy Specification JSON</h3>
                        <div className={styles.tabBtnGroup}>
                            <button
                                type="button"
                                className={`${styles.tabBtn} ${mode === 'view' ? styles.active : ''}`}
                                onClick={() => setMode('view')}
                            >
                                <DocumentJsonIcon size={13} />
                                <span>View</span>
                            </button>
                            <button
                                type="button"
                                className={`${styles.tabBtn} ${mode === 'edit' ? styles.active : ''}`}
                                onClick={() => setMode('edit')}
                            >
                                <SlidersTuneIcon size={13} />
                                <span>Edit</span>
                            </button>
                        </div>
                    </div>
                    <button
                        type="button"
                        className={styles.btnGhost}
                        style={{ padding: '4px 10px', fontSize: '14px' }}
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {mode === 'view' ? (
                        <pre
                            style={{
                                background: '#020504',
                                color: '#38BDF8',
                                padding: '14px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontFamily: 'monospace',
                                overflow: 'auto',
                                maxHeight: '380px',
                                border: '1px solid rgba(24, 201, 139, 0.2)'
                            }}
                        >
                            {editText}
                        </pre>
                    ) : (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                                <CustomSelect
                                    value=""
                                    onChange={handlePreset}
                                    options={PRESET_OPTIONS}
                                    placeholder="Select Strategy Preset..."
                                    width="240px"
                                />
                                <button type="button" className={styles.btnGhost} onClick={handlePrettify}>
                                    <SparklesMagicIcon size={13} />
                                    <span>Prettify</span>
                                </button>
                            </div>
                            <textarea
                                className={styles.jsonEditorTextarea}
                                spellCheck={false}
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                style={{ minHeight: '260px' }}
                            />
                            <div
                                className={`${styles.validationBox} ${
                                    validation.valid ? styles.valid : styles.invalid
                                }`}
                            >
                                <ShieldCheckIcon size={14} />
                                <span>{validation.valid ? validation.summary : validation.message}</span>
                            </div>
                        </>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button type="button" className={styles.btnGhost} onClick={handleCopy}>
                        <CopyClipboardIcon size={14} />
                        <span>Copy JSON</span>
                    </button>
                    <button type="button" className={styles.btnNeonRunBacktest} onClick={handleRun}>
                        <RocketRunIcon size={14} />
                        <span>Run This Strategy</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
