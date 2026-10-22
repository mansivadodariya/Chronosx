'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/strategyStudio.module.scss';
import {
    EditPencilIcon,
    CoinsCapitalIcon,
    AlertTriangleIcon,
    RefreshResetIcon,
    SparklesMagicIcon,
} from './StudioIcons';
import { renderFormattedMarkdown } from '../utils/markdownRenderer';
import { useStreamingText } from '../utils/streamingRenderer';

export function StreamingAiBubble({ text, shouldStream, onStreamComplete, onStreamProgress }) {
    const { displayedText, isStreaming, skipToEnd } = useStreamingText(text, {
        msPerChar: 14,
        enabled: Boolean(shouldStream),
        onComplete: onStreamComplete,
        onProgress: onStreamProgress
    });

    const activeText = shouldStream ? displayedText : text;
    const showCursor = Boolean(shouldStream && isStreaming);

    return (
        <div
            className={`${styles.bubble} ${styles.aiBubble}`}
            onClick={showCursor ? skipToEnd : undefined}
            style={{ cursor: showCursor ? 'pointer' : 'default' }}
            title={showCursor ? 'Click to reveal immediately' : undefined}
        >
            {renderFormattedMarkdown(activeText)}
            {showCursor && (
                <span className={styles.streamingCursorChar}>
                    <EditPencilIcon size={12} color="#18C98B" />
                </span>
            )}
        </div>
    );
}

export function CircuitStrategyDivider() {
    return (
        <div className={styles.circuitStrategyDivider}>
            <div className={styles.circuitLineLeft}>
                <svg className={styles.circuitSvg} viewBox="0 0 160 18" fill="none">
                    <path d="M 4 15 L 38 6 L 160 6" stroke="url(#circuitGradGreenLeft)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="4" cy="15" r="2.5" fill="#18C98B" />
                    <defs>
                        <linearGradient id="circuitGradGreenLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#18C98B" stopOpacity="0.8" />
                            <stop offset="40%" stopColor="#18C98B" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#18C98B" stopOpacity="1" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            <div className={styles.circuitBadge}>
                <span>Strategy</span>
            </div>
            <div className={styles.circuitLineRight}>
                <svg className={styles.circuitSvg} viewBox="0 0 160 18" fill="none">
                    <path d="M 0 6 L 122 6 L 156 1" stroke="url(#circuitGradGreenRight)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="156" cy="1" r="2.5" fill="#18C98B" />
                    <defs>
                        <linearGradient id="circuitGradGreenRight" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#18C98B" stopOpacity="1" />
                            <stop offset="60%" stopColor="#18C98B" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#18C98B" stopOpacity="0.8" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </div>
    );
}

const THINKING_STAGES = [
    'Analyzing market conditions & volatility structure...',
    'Synthesizing indicators & technical signals...',
    'Formulating quantitative strategy blueprint...',
    'Optimizing entry triggers and risk parameters (SL/TP)...',
    'Compiling algorithmic strategy execution rules...',
    'Calibrating statistical edge & probability...',
    'Evaluating liquidity depth & institutional spreads...'
];

export function DynamicThinkingLoader() {
    const [stageIdx, setStageIdx] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setStageIdx((prev) => (prev + 1) % THINKING_STAGES.length);
        }, 1800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.msgThinking} role="status" aria-live="polite">
            <div className={styles.thinkingPulseWrap}>
                <span className={styles.thinkingMiniDot} />
                <span className={styles.thinkingMiniDot} />
                <span className={styles.thinkingMiniDot} />
            </div>
            <span key={stageIdx} className={styles.thinkingText}>
                {THINKING_STAGES[stageIdx]}
            </span>
        </div>
    );
}

export function InteractiveErrorBubble({
    error,
    onRetry,
    isRetrying = false,
}) {
    const router = useRouter();
    const isCredits = error?.errorType === 'credits';

    const handlePrimaryClick = () => {
        if (isCredits) {
            router.push('/subscription-plans');
        } else if (onRetry && error?.retryPayload) {
            onRetry(error.retryPayload);
        }
    };

    return (
        <div
            className={`${styles.errorBubble} ${
                isCredits ? styles.errorCredits : styles.errorApi
            }`}
            role="alert"
        >
            <div className={styles.errorHeader}>
                <div className={styles.errorHeaderLeft}>
                    <div className={styles.errorIconBadge}>
                        {isCredits ? (
                            <CoinsCapitalIcon size={16} color="currentColor" />
                        ) : (
                            <AlertTriangleIcon size={16} color="currentColor" />
                        )}
                    </div>
                    <span className={styles.errorTitle}>
                        {error?.title || (isCredits ? 'Insufficient AI Credits' : 'AI Service Temporarily Unavailable')}
                    </span>
                </div>
                <span className={styles.errorTag}>
                    {isCredits ? 'No Credits' : 'Service Offline'}
                </span>
            </div>

            <div className={styles.errorBody}>
                <div className={styles.errorDesc}>
                    {error?.text || error?.message || (isCredits
                        ? 'You do not have enough AI credits to continue generating strategies.'
                        : 'Unable to communicate with the Strategy Copilot API. The service may be temporarily unavailable.')}
                </div>
                {error?.suggestion && (
                    <div className={styles.errorSuggestion}>{error.suggestion}</div>
                )}
            </div>

            <div className={styles.errorActions}>
                {isCredits ? (
                    <>
                        <button
                            type="button"
                            className={styles.errorPrimaryBtn}
                            onClick={handlePrimaryClick}
                        >
                            <SparklesMagicIcon size={14} color="#000000" />
                            <span>Upgrade Plan &amp; AI Credits</span>
                        </button>
                        <button
                            type="button"
                            className={styles.errorSecondaryBtn}
                            onClick={() => router.push('/profile')}
                        >
                            <span>Check Balance</span>
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            className={styles.errorPrimaryBtn}
                            onClick={handlePrimaryClick}
                            disabled={isRetrying}
                        >
                            <RefreshResetIcon size={14} color="currentColor" />
                            <span>{isRetrying ? 'Retrying…' : (error?.actionLabel || 'Try Again')}</span>
                        </button>
                        <button
                            type="button"
                            className={styles.errorSecondaryBtn}
                            onClick={() => router.push('/support')}
                        >
                            <span>Contact Support</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
