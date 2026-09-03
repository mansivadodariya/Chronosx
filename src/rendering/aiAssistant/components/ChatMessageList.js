'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { getBidiProps, bidiMarkdownComponents } from '@/lib/bidi';
import { parseChatMessage } from '@/utils/chatParser';
import WelcomeActionView from './WelcomeActionView';
import ClarificationOptionButtons from './ClarificationOptionButtons';
import RenderMarkdownWithWidgets from './MarkdownWidgetRenderer';
import VisionAnalysisAccordions from './VisionAnalysisAccordions';
import { WarningIcon, ChatIcon, AnalyticsIcon, DownloadIcon } from '@/icons/visionIcons';
import styles from '../aiAssistant.module.scss';

export default function ChatMessageList({
    chatMessages,
    pendingRequest,
    selectedPair,
    chatEndRef,
    t,
    handleDeepAnalysisClick,
    handleGenerateFromImageClick,
    handleMacroNewsClick,
    setPreviewAttachment,
    handleDownloadFullReport,
    handleOptionClick
}) {
    return (
        <div 
            className={styles.chatBody}
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
        >
            {chatMessages.length === 0 ? (
                <WelcomeActionView
                    t={t}
                    handleDeepAnalysisClick={handleDeepAnalysisClick}
                    handleGenerateFromImageClick={handleGenerateFromImageClick}
                    handleMacroNewsClick={handleMacroNewsClick}
                />
            ) : (
                chatMessages.map((msg, index) => {
                    const isDeepAnalysis = msg.response_format === "deep_analysis" || msg.response_format === "deep_decision";
                    return (
                        <div
                            key={index}
                            className={`${styles.messageRow} ${msg.role === 'user' ? styles.userRow : ''} ${msg.fullReport ? styles.reportRow : ''}`}
                        >
                            {msg.role === 'user' &&
                             msg.pair &&
                             typeof msg.pair === 'string' &&
                             msg.pair.trim() !== '' &&
                             msg.pair !== 'No Pair' &&
                             msg.pair !== 'NO_PAIR' &&
                             !msg.pair.toLowerCase().includes('no pair') &&
                             msg.pair.toLowerCase() !== 'none' && (
                                <span className={styles.pairBadge}>
                                    <ChatIcon size={12} /> {msg.pair.toUpperCase()}
                                </span>
                            )}
                            <div {...getBidiProps(msg.content, msg.role === 'user' ? styles.userMessage : styles.assistantMessage)}>
                                {msg.role === 'user' ? (
                                    <>
                                        {(msg.attachment?.url || msg.image_url) && (
                                            <div
                                                className={styles.userMsgAttachment}
                                                onClick={() => setPreviewAttachment(msg.attachment || { url: msg.image_url, name: 'Chart Image' })}
                                                title="Click to preview image"
                                            >
                                                <img src={msg.attachment?.url || msg.image_url} alt="Attached Chart" />
                                            </div>
                                        )}
                                        {msg.content}
                                    </>
                                ) : (() => {
                                    const parsed = parseChatMessage(msg.content, msg.fullReport);
                                    const sections = msg.chart_sections || (parsed.jsonData ? (parsed.jsonData.chart_sections || parsed.jsonData) : null);
                                    const disclaimerHeader = msg.disclaimer_header || parsed.disclaimerHeader;
                                    const disclaimerFooter = msg.disclaimer_footer || parsed.disclaimerFooter;
                                    const contentText = parsed.fallbackText || (typeof msg.content === 'string' && !msg.content.trim().startsWith('{') ? msg.content : (msg.content || ''));

                                    const isVisionAnalysis = Boolean(
                                        msg.response_format === 'vision_analysis' ||
                                        msg.chat_type === 'With_Image' ||
                                        (sections && typeof sections === 'object' && (
                                            sections.overall_trend ||
                                            sections.market_structure ||
                                            sections.support_and_resistance ||
                                            sections.supply_and_demand_zones ||
                                            sections.trader_actionable_zones ||
                                            sections.volatility_and_price_behavior ||
                                            sections.session_behavior ||
                                            sections.market_mood ||
                                            sections.candlestick_behavior ||
                                            sections.chart_patterns ||
                                            sections.chart_sections ||
                                            (sections.is_valid_chart !== undefined && sections.overall_summary)
                                        ))
                                    );

                                    if (sections && isVisionAnalysis) {
                                        return (
                                            <VisionAnalysisAccordions
                                                data={sections}
                                                chartSections={sections}
                                                textSummary={contentText || sections.overall_summary}
                                                imageWarning={msg.image_warning}
                                                disclaimerHeader={disclaimerHeader}
                                                disclaimerFooter={disclaimerFooter}
                                            />
                                        );
                                    }

                                    return (
                                        <>
                                            {/* 1. Disclaimer Banner if present on plain message */}
                                            {disclaimerHeader && (
                                                <div className={styles.visionWarningCard} style={{ marginBottom: 12 }}>
                                                    <span className={styles.visionWarningIcon}>
                                                        <WarningIcon size={16} />
                                                    </span>
                                                    <div className={styles.chatMarkdown}>
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={bidiMarkdownComponents}>
                                                            {disclaimerHeader.replace(/^[>⚠️\s*]+/, '').replace(/^⚠️\s*/, '')}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                            )}

                                            {/* 2. Structured Deep Analysis or Markdown Content */}
                                            {(msg.response_format === "deep_analysis" || isDeepAnalysis) && msg.fullReport ? (
                                                <div className={styles.deepAnalysisCardWrapper}>
                                                    {/* TOP SECTION: SHORT EXECUTIVE BULLETS */}
                                                    {(contentText || msg.content) && (
                                                        <div className={styles.executiveSummaryCard}>
                                                            <RenderMarkdownWithWidgets
                                                                content={contentText || msg.content}
                                                                visualData={msg.visualData}
                                                                defaultSymbol={msg.detected_pair || selectedPair}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* BOTTOM SECTION: ANALYSIS CENTER */}
                                                    <div className={styles.analysisCenterCard}>
                                                        <div className={styles.analysisCenterHeader}>
                                                            <span className={styles.analysisCenterIcon}>
                                                                <AnalyticsIcon size={18} />
                                                            </span>
                                                            <span className={styles.analysisCenterTitle}>Analysis Center</span>
                                                        </div>

                                                        <RenderMarkdownWithWidgets
                                                            content={msg.fullReport}
                                                            visualData={msg.visualData}
                                                            defaultSymbol={msg.detected_pair || selectedPair}
                                                        />

                                                        {/* DOWNLOAD REPORT BUTTON */}
                                                        <div className={styles.downloadReportRow}>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDownloadFullReport(msg.fullReport, msg.detected_pair || selectedPair)}
                                                                className={styles.downloadFullReportBtn}
                                                            >
                                                                <DownloadIcon size={15} />
                                                                <span>Download Full Report (PDF)</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <RenderMarkdownWithWidgets
                                                    content={contentText || msg.content}
                                                    visualData={msg.visualData}
                                                    defaultSymbol={msg.detected_pair || selectedPair}
                                                />
                                            )}

                                            {/* 3. Disclaimer Footer if present on plain message */}
                                            {disclaimerFooter && (
                                                <div className={styles.visionOverviewCard} style={{ marginTop: 12, opacity: 0.8, fontSize: '11.5px', fontStyle: 'italic' }}>
                                                    <div className={styles.chatMarkdown}>
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={bidiMarkdownComponents}>
                                                            {disclaimerFooter}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                            )}

                                            {msg.response_format === "interactive_clarification" && (
                                                <ClarificationOptionButtons onSelect={handleOptionClick} />
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    );
                })
            )}
            {pendingRequest && (
                <div className={styles.messageRow}>
                    <div className={styles.assistantMessage}>
                        <div className={styles.loadingDots}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={chatEndRef} />
        </div>
    );
}
