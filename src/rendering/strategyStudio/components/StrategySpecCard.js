'use client';

import React, { useState, useMemo } from 'react';
import styles from '../styles/strategyStudio.module.scss';
import {
    DocumentJsonIcon,
    CpuChipIcon,
    CopyClipboardIcon,
    CheckmarkIcon,
    EditPencilIcon,
    RocketRunIcon,
} from './StudioIcons';

export default function StrategySpecCard({
    strategy = {},
    summary = null,
    onOpenModifyForm,
    onRunBacktest,
    busy = false,
    isFormOpen = false,
}) {
    const [copied, setCopied] = useState(false);

    const title = strategy?.strategy_name || summary?.title || 'Configured Strategy';
    const symbol = (Array.isArray(strategy?.stock_name) ? strategy.stock_name[0] : strategy?.stock_name) || summary?.market?.pair || '—';
    const timeframe = strategy?.interval || strategy?.timeframe || summary?.market?.timeframe || '—';

    // Build the dynamic JSON representation of whatever is configured
    const formattedJson = useMemo(() => {
        const payload = (strategy && Object.keys(strategy).length > 0)
            ? strategy
            : (summary ? { summary } : { status: 'ready', message: 'Strategy ready to run' });
        return JSON.stringify(payload, null, 2);
    }, [strategy, summary]);

    const lineCount = useMemo(() => formattedJson.split('\n').length, [formattedJson]);

    const handleCopy = async () => {
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(formattedJson);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch {
            // fallback if clipboard api fails
        }
    };

    return (
        <div className={styles.strategySpecCard}>
            {/* Header with Title, Meta, and Action Buttons */}
            <div className={styles.strategySpecHeader}>
                <div className={styles.strategySpecHeaderLeft}>
                    <div className={styles.strategySpecIcon}>
                        <CpuChipIcon size={20} color="#18c98b" />
                    </div>
                    <div className={styles.strategySpecTitleWrap}>
                        <div className={styles.strategySpecTitle}>{title}</div>
                        <div className={styles.strategySpecMeta}>
                            <span>{symbol}</span>
                            <span>•</span>
                            <span>{timeframe}</span>
                            <span>•</span>
                            <span className={styles.strategySpecReadyBadge}>
                                <span className={styles.strategySpecPulseDot} />
                                Ready to Run
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.strategySpecActions}>
                    <button
                        type="button"
                        className={styles.btnGhostAction}
                        style={{ padding: '7px 14px', fontSize: '12.5px' }}
                        onClick={() => onOpenModifyForm?.()}
                        title="Open strategy modification form side-by-side with chat"
                    >
                        <EditPencilIcon size={14} color="currentColor" />
                        <span>{isFormOpen ? 'Modify Form (Active)' : 'Modify Strategy Form'}</span>
                    </button>

                    <button
                        type="button"
                        className={styles.btnPrimaryAction}
                        style={{ padding: '7px 16px', fontSize: '12.5px' }}
                        onClick={() => onRunBacktest?.()}
                        disabled={busy}
                    >
                        <RocketRunIcon size={14} color="currentColor" />
                        <span>Run Backtest</span>
                    </button>
                </div>
            </div>

            {/* Formatted Dynamic JSON Container */}
            <div className={styles.strategyJsonContainer}>
                <div className={styles.strategyJsonBar}>
                    <div className={styles.strategyJsonBarLeft}>
                        <DocumentJsonIcon size={14} color="#18c98b" />
                        <span>strategy_spec.json</span>
                        <span className={styles.strategyJsonBadge}>{lineCount} lines</span>
                    </div>

                    <button
                        type="button"
                        className={styles.strategyCopyBtn}
                        onClick={handleCopy}
                        title="Copy dynamic strategy JSON"
                    >
                        {copied ? (
                            <>
                                <CheckmarkIcon size={12} color="#18c98b" />
                                <span style={{ color: '#18c98b' }}>Copied!</span>
                            </>
                        ) : (
                            <>
                                <CopyClipboardIcon size={12} color="currentColor" />
                                <span>Copy JSON</span>
                            </>
                        )}
                    </button>
                </div>

                <pre className={styles.strategyJsonCode}>
                    <code>{formattedJson}</code>
                </pre>
            </div>
        </div>
    );
}
