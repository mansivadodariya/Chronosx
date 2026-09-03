'use client';

import React from 'react';
import styles from '../tradeAnalysis.module.scss';
import {
    PdfIcon,
    UploadIcon,
    CheckIcon,
    SparklesIcon,
    HistoryIcon,
    LockIcon,
    TargetIcon,
    ScaleIcon,
    BarChartIcon
} from '@/icons/tradeAnalysisIcons';

export default function UploadSection({
    fileInputRef,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFilesSelected,
    loading
}) {
    return (
        <div className={styles.fullWidthUploadSection}>
            {/* 1. Next-Gen 4-Step Pipeline Stepper */}
            <div className={styles.stepperCard}>
                <div className={`${styles.stepItem} ${styles.stepActive}`}>
                    <div className={styles.stepCircle}>
                        <span className={styles.stepNum}>01</span>
                        <span className={styles.pulseHalo} />
                    </div>
                    <div className={styles.stepMeta}>
                        <span className={styles.stepTitle}>Statement Ingestion</span>
                        <span className={styles.stepSub}>PDF, CSV, XLSX, or HTML</span>
                    </div>
                </div>

                <div className={styles.stepConnector}>
                    <div className={styles.connectorLine} />
                    <span className={styles.connectorDot} />
                </div>

                <div className={styles.stepItem}>
                    <div className={styles.stepCircle}>
                        <span className={styles.stepNum}>02</span>
                    </div>
                    <div className={styles.stepMeta}>
                        <span className={styles.stepTitle}>Neural Extraction</span>
                        <span className={styles.stepSub}>Executions, lots & SL/TP</span>
                    </div>
                </div>

                <div className={styles.stepConnector}>
                    <div className={styles.connectorLine} />
                    <span className={styles.connectorDot} />
                </div>

                <div className={styles.stepItem}>
                    <div className={styles.stepCircle}>
                        <span className={styles.stepNum}>03</span>
                    </div>
                    <div className={styles.stepMeta}>
                        <span className={styles.stepTitle}>Behavioral Audit</span>
                        <span className={styles.stepSub}>Leaks, tilt & bias detection</span>
                    </div>
                </div>

                <div className={styles.stepConnector}>
                    <div className={styles.connectorLine} />
                    <span className={styles.connectorDot} />
                </div>

                <div className={styles.stepItem}>
                    <div className={styles.stepCircle}>
                        <span className={styles.stepNum}>04</span>
                    </div>
                    <div className={styles.stepMeta}>
                        <span className={styles.stepTitle}>Executive Scorecard</span>
                        <span className={styles.stepSub}>Win-rate, R:R & playbook</span>
                    </div>
                </div>
            </div>

            {/* 2. Top Row: 2 Boxes (Dropzone on Left, Neural Extraction Engine on Right) */}
            <div className={styles.topUploadRow}>
                {/* Left Box: Central High-Tech Obsidian Glass Dropzone */}
                <div
                    className={`${styles.uploadCard} ${isDragging ? styles.activeDrag : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".csv,.xlsx,.xls,.pdf,.html,.htm,.txt"
                        className={styles.hiddenInput}
                        onChange={(e) => handleFilesSelected(e.target.files)}
                    />           

                    {/* Floating Holographic Icon Pedestal */}
                    <div className={styles.iconPedestal}>
                        <div className={styles.pedestalGlow} />
                        <div className={styles.pedestalIcon}>
                            <PdfIcon />
                        </div>
                    </div>

                    <div className={styles.uploadHeadingGroup}>
                        <h2>Drop Your Trading Statement Here</h2>
                        <p>Drag & drop your account report or browse files from your computer to run a deep AI audit.</p>
                    </div>

       

                    {/* Action Button Row */}
                    <div className={styles.uploadButtonRow}>
                        <button
                            type="button"
                            className={styles.chooseFileBtn}
                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                            disabled={loading}
                        >
                            <UploadIcon />
                            <span>{loading ? 'Processing Statement...' : 'Choose Statement File'}</span>
                        </button>
                    </div>

                    <span className={styles.dragDropText}>Supported formats: PDF, CSV, Excel (XLSX, XLS), HTML & TXT</span>

                    <div className={styles.securityNotice}>
                        <LockIcon />
                        <span>256-Bit Encrypted Client-Side Processing • Private & Confidential</span>
                    </div>
                </div>

                {/* Right Box: Neural Data Extraction Engine */}
                <div className={styles.extractionCard}>
   
                    <div className={styles.matrixHeader}>
                        <div className={styles.matrixBadge}>
                            <TargetIcon />
                        </div>
                        <div>
                            <h4>Neural Data Extraction Engine</h4>
                            <p>Multi-broker statement normalization into institutional analytics</p>
                        </div>
                    </div>

                    {/* 8-Item Telemetry Matrix */}
                    <div className={styles.checklistGrid}>
                        <div className={styles.checkItem}>
                            <div className={styles.checkIconBox}><CheckIcon /></div>
                            <span>Entry & Exit Precision</span>
                        </div>
                        <div className={styles.checkItem}>
                            <div className={styles.checkIconBox}><CheckIcon /></div>
                            <span>Risk-to-Reward (R:R)</span>
                        </div>
                        <div className={styles.checkItem}>
                            <div className={styles.checkIconBox}><CheckIcon /></div>
                            <span>Position Size & Lot Scale</span>
                        </div>
                        <div className={styles.checkItem}>
                            <div className={styles.checkIconBox}><CheckIcon /></div>
                            <span>Exact Execution Timestamps</span>
                        </div>
                        <div className={styles.checkItem}>
                            <div className={styles.checkIconBox}><CheckIcon /></div>
                            <span>Net PnL & Drawdown Curve</span>
                        </div>
                        <div className={styles.checkItem}>
                            <div className={styles.checkIconBox}><CheckIcon /></div>
                            <span>Commission, Swap & Slippage</span>
                        </div>
                        <div className={styles.checkItem}>
                            <div className={styles.checkIconBox}><CheckIcon /></div>
                            <span>Session & Market Hours</span>
                        </div>
                        <div className={styles.checkItem}>
                            <div className={styles.checkIconBox}><CheckIcon /></div>
                            <span>Order Types (Market/Limit)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. What The AI Audit Delivers Bento Grid */}
            <div className={styles.whatYouGetBox}>
                <div className={styles.sectionHeadingRow}>
                    <div>
                        <h3>What The Neural Audit Delivers</h3>
                        <p>Institutional-grade analysis designed to eliminate capital leaks and compound edge</p>
                    </div>
                </div>
                <div className={styles.featureGrid}>
                    <div className={styles.featureCard}>
                        <div className={styles.featIconBox}><TargetIcon /></div>
                        <div className={styles.featText}>
                            <h5>Execution Leak Detection</h5>
                            <p>Detect revenge trading, premature exits, moving stop-losses, and overleveraging before they erode equity.</p>
                        </div>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featIconBox}><ScaleIcon /></div>
                        <div className={styles.featText}>
                            <h5>Mathematical Edge & R:R</h5>
                            <p>Rigorous breakdown of your expectancy, profit factor, Kelly criterion sizing, and win/loss asymmetry.</p>
                        </div>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featIconBox}><HistoryIcon /></div>
                        <div className={styles.featText}>
                            <h5>Psychology & Tilt Mapping</h5>
                            <p>Isolate day-of-week tilt, time-of-day drawdown, session fatigue, and emotional holding patterns.</p>
                        </div>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featIconBox}><BarChartIcon /></div>
                        <div className={styles.featText}>
                            <h5>Actionable Trade Playbook</h5>
                            <p>Synthesizes a concrete, prioritized checklist of rules tailored specifically to your historical executions.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
