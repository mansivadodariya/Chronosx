'use client';

import React from 'react';
import styles from '../tradeAnalysis.module.scss';
import {
    PdfIcon,
    UploadIcon,
    CheckIcon,
    SparklesIcon,
    HistoryIcon,
    LockIcon
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
            {/* 4-Step Progress Header */}
            <div className={styles.stepperCard}>
                <div className={styles.stepItem}>
                    <div className={`${styles.stepCircle} ${styles.active}`}>1</div>
                    <div className={styles.stepMeta}>
                        <span className={styles.stepTitle}>Upload Report</span>
                        <span className={styles.stepSub}>Upload your trade report PDF</span>
                    </div>
                </div>
                <span className={styles.stepArrow}>→</span>

                <div className={styles.stepItem}>
                    <div className={styles.stepCircle}>2</div>
                    <div className={styles.stepMeta}>
                        <span className={styles.stepTitle}>AI Processing</span>
                        <span className={styles.stepSub}>Extracting & analyzing trades</span>
                    </div>
                </div>
                <span className={styles.stepArrow}>→</span>

                <div className={styles.stepItem}>
                    <div className={styles.stepCircle}>3</div>
                    <div className={styles.stepMeta}>
                        <span className={styles.stepTitle}>AI Analysis</span>
                        <span className={styles.stepSub}>Analyzing performance</span>
                    </div>
                </div>
                <span className={styles.stepArrow}>→</span>

                <div className={styles.stepItem}>
                    <div className={styles.stepCircle}>4</div>
                    <div className={styles.stepMeta}>
                        <span className={styles.stepTitle}>Results Ready</span>
                        <span className={styles.stepSub}>Review insights & mistakes</span>
                    </div>
                </div>
            </div>

            {/* Central PDF Upload Box */}
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

                <div className={styles.pdfIconBadge}>
                    <PdfIcon />
                </div>

                <div className={styles.uploadHeadingGroup}>
                    <h2>Upload Your Trade Report (PDF / CSV / Excel)</h2>
                    <p>Upload a report containing your closed trades. It can include one or multiple trades.</p>
                </div>

                <div className={styles.uploadButtonRow}>
                    <button
                        type="button"
                        className={styles.chooseFileBtn}
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        disabled={loading}
                    >
                        <UploadIcon />
                        <span>{loading ? 'Analyzing Report...' : 'Choose PDF File'}</span>
                    </button>                       
                </div>

                <span className={styles.dragDropText}>or drag and drop your file here</span>

                <div className={styles.securityNotice}>
                    <LockIcon />
                    <span>Your data is secure and private. We never share your reports.</span>
                </div>
            </div>

            {/* Supported Report Formats Card */}
            <div className={styles.supportedFormatsCard}>
                <div className={styles.formatsLeft}>
                    <div className={styles.formatIconBox}>PDF</div>
                    <div className={styles.formatText}>
                        <h4>PDF & CSV Reports Supported</h4>
                        <p>Trade reports from MT4, MT5, cTrader or broker exports</p>
                    </div>
                </div>

                <div className={styles.extractChecklist}>
                    <span className={styles.checklistHeading}>What we extract</span>
                    <div className={styles.checklistGrid}>
                        <span><CheckIcon /> Entry / Exit</span>
                        <span><CheckIcon /> Risk & Reward</span>
                        <span><CheckIcon /> Position Size</span>
                        <span><CheckIcon /> Instrument</span>
                        <span><CheckIcon /> Date & Time</span>
                        <span><CheckIcon /> Direction & PnL</span>
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div className={styles.howItWorksBox}>
                <h3>How It Works</h3>
                <div className={styles.stepsRow}>
                    <div className={styles.workStepCard}>
                        <div className={styles.stepIconCircle}><UploadIcon /></div>
                        <h4>Upload Report</h4>
                        <p>Upload your trade report in PDF/CSV format</p>
                    </div>

                    <div className={styles.workStepCard}>
                        <div className={styles.stepIconCircle}><SparklesIcon /></div>
                        <h4>AI Extracts Data</h4>
                        <p>We extract all trades and key details</p>
                    </div>

                    <div className={styles.workStepCard}>
                        <div className={styles.stepIconCircle}><HistoryIcon /></div>
                        <h4>AI Analyzes</h4>
                        <p>AI analyzes performance, mistakes & patterns</p>
                    </div>

                    <div className={styles.workStepCard}>
                        <div className={styles.stepIconCircle}><CheckIcon /></div>
                        <h4>Get Insights</h4>
                        <p>Get detailed feedback and improvements</p>
                    </div>
                </div>
            </div>

            {/* What You'll Get Section */}
            <div className={styles.whatYouGetBox}>
                <h3>What You'll Get</h3>
                <div className={styles.featureGrid}>
                    <div className={styles.featureCard}>
                        <div className={styles.featIconBox}><PdfIcon /></div>
                        <div className={styles.featText}>
                            <h5>Trade Breakdown</h5>
                            <p>Detailed breakdown of every trade</p>
                        </div>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featIconBox}><SparklesIcon /></div>
                        <div className={styles.featText}>
                            <h5>Mistake Detection</h5>
                            <p>Identify mistakes and execution errors</p>
                        </div>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featIconBox}><HistoryIcon /></div>
                        <div className={styles.featText}>
                            <h5>Performance Insights</h5>
                            <p>Advanced stats and performance metrics</p>
                        </div>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featIconBox}><CheckIcon /></div>
                        <div className={styles.featText}>
                            <h5>Improvement Tips</h5>
                            <p>Actionable tips to level up your trading</p>
                        </div>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featIconBox}><SparklesIcon /></div>
                        <div className={styles.featText}>
                            <h5>Pattern Recognition</h5>
                            <p>Discover patterns in your trading behavior</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
