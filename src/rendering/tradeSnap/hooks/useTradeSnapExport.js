'use client';

import { useState, useCallback } from 'react';
import { toast } from '@/components/toast';

export function useTradeSnapExport() {
    const [isExporting, setIsExporting] = useState(false);

    const exportToPdf = useCallback(async (element, symbol = 'MARKET', timeframe = 'M15') => {
        if (isExporting) return;
        if (!element) {
            toast.error('Unable to find report to download.');
            return;
        }

        try {
            setIsExporting(true);
            const cleanSymbol = String(symbol || 'MARKET').replace(/[^A-Z0-9]/gi, '').toUpperCase() || 'CHART_SCAN';
            const cleanTf = String(timeframe || 'M15').replace(/[^A-Z0-9]/gi, '').toUpperCase();
            const dateStr = new Date().toISOString().split('T')[0];
            toast(`Generating PDF report for ${cleanSymbol}...`);

            // Dynamically import html2pdf
            const html2pdf = (await import('html2pdf.js')).default;

            const opt = {
                margin: [6, 6, 6, 6],
                filename: `ChronosX_Chart_Scan_${cleanSymbol}_${cleanTf}_${dateStr}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#FFFFFF',
                    scrollX: 0,
                    scrollY: 0,
                    logging: false,
                    onclone: (clonedDoc, clonedElement) => {
                        // html2canvas internal clone - Isolated completely from live DOM
                        // Live UI, document.body, and screen recording stream are NEVER modified
                        if (!clonedDoc) return;

                        // 1. Force light theme variables in cloned document ONLY
                        if (clonedDoc.documentElement) {
                            clonedDoc.documentElement.classList.add('light');
                            clonedDoc.documentElement.setAttribute('data-theme', 'light');
                            clonedDoc.documentElement.style.backgroundColor = '#FFFFFF';
                            clonedDoc.documentElement.style.color = '#0F172A';
                        }
                        if (clonedDoc.body) {
                            clonedDoc.body.classList.add('light', 'pdfExportLight');
                            clonedDoc.body.style.backgroundColor = '#FFFFFF';
                            clonedDoc.body.style.color = '#0F172A';
                        }

                        // 2. Add PDF export classes to target in the clone
                        const target = clonedElement || clonedDoc.body;
                        if (target && target.classList) {
                            target.classList.add('pdfExportLight', 'pdfExportContainer');
                        }

                        // 3. Hide interactive buttons (Download, Retry, Close) in the clone
                        clonedDoc.querySelectorAll('button, [class*="DownloadBtn"], [class*="modalClose"]').forEach((btn) => {
                            const text = (btn.textContent || '').toLowerCase();
                            if (
                                text.includes('download') ||
                                text.includes('export') ||
                                text.includes('retry') ||
                                btn.classList.contains('headerDownloadBtn') ||
                                btn.classList.contains('modalDownloadBtn') ||
                                btn.classList.contains('modalClose')
                            ) {
                                btn.style.display = 'none';
                            }
                        });

                        // 4. Hide tab rows and expand all 4 breakdown tables in the clone
                        clonedDoc.querySelectorAll('.tabNavRow, [class*="tabNavRow"]').forEach((el) => {
                            el.style.display = 'none';
                        });
                        clonedDoc.querySelectorAll('[class*="indicatorPivotSection"] > [class*="tabContentCard"]').forEach((el) => {
                            el.style.display = 'none';
                        });
                        clonedDoc.querySelectorAll('.pdfFullBreakdown, [class*="pdfFullBreakdown"]').forEach((el) => {
                            el.style.display = 'flex';
                            el.style.flexDirection = 'column';
                            el.style.gap = '16px';
                        });

                        // 5. Ensure no scrollbars or clipped heights in the clone
                        clonedDoc.querySelectorAll('[class*="resultsPanel"], [class*="resultsBody"], [class*="analysesListContainer"]').forEach((el) => {
                            el.style.maxHeight = 'none';
                            el.style.overflow = 'visible';
                            el.style.background = '#FFFFFF';
                        });

                        // 6. Force Speedometer needle and pivot dot to high-contrast dark color in the cloned PDF
                        clonedDoc.querySelectorAll('[class*="gaugeNeedleLine"], line[y2="-64"]').forEach((line) => {
                            line.setAttribute('stroke', '#0F172A');
                            line.style.setProperty('stroke', '#0F172A', 'important');
                            line.style.filter = 'drop-shadow(0 0 2px rgba(15, 23, 42, 0.3))';
                        });
                        clonedDoc.querySelectorAll('[class*="gaugeNeedleTip"], polygon[points*="-65"]').forEach((poly) => {
                            poly.setAttribute('fill', '#0F172A');
                            poly.style.setProperty('fill', '#0F172A', 'important');
                        });
                        clonedDoc.querySelectorAll('[class*="gaugePivotDot"]').forEach((dot) => {
                            dot.setAttribute('fill', '#0F172A');
                            dot.style.setProperty('fill', '#0F172A', 'important');
                        });
                        clonedDoc.querySelectorAll('[class*="gaugeNeedleGroup"]').forEach((g) => {
                            g.style.color = '#0F172A';
                        });
                        // 7. Inject dedicated print/PDF page-break styles into cloned document
                        const styleEl = clonedDoc.createElement('style');
                        styleEl.innerHTML = `
                            @media all {
                                tr {
                                    page-break-inside: avoid !important;
                                    break-inside: avoid !important;
                                    break-inside: avoid-page !important;
                                    display: table-row !important;
                                }
                                td, th {
                                    page-break-inside: avoid !important;
                                    break-inside: avoid !important;
                                }
                                table {
                                    page-break-inside: auto !important;
                                    break-inside: auto !important;
                                    border-collapse: collapse !important;
                                }
                                thead {
                                    display: table-header-group !important;
                                }
                                tbody {
                                    display: table-row-group !important;
                                }
                                .pdfBreakdownBlock, [class*="pdfBreakdownBlock"] {
                                    page-break-inside: avoid !important;
                                    break-inside: avoid !important;
                                    break-inside: avoid-page !important;
                                    margin-bottom: 16px !important;
                                }
                                .pdfSubHeading, [class*="pdfSubHeading"], h1, h2, h3, h4 {
                                    page-break-after: avoid !important;
                                    break-after: avoid !important;
                                    break-after: avoid-page !important;
                                }
                                .technicalGaugeCard, [class*="technicalGaugeCard"],
                                .bullBearHero, [class*="bullBearHero"],
                                .heroBanner, [class*="heroBanner"],
                                .tradeSignalSetupCard, [class*="tradeSignalSetupCard"],
                                .patternsCard, [class*="patternsCard"],
                                .riskFlagsCard, [class*="riskFlagsCard"],
                                .summaryHeaderGrid, [class*="summaryHeaderGrid"] {
                                    page-break-inside: avoid !important;
                                    break-inside: avoid !important;
                                    break-inside: avoid-page !important;
                                }
                                .indicatorPivotSection, [class*="indicatorPivotSection"],
                                .pdfFullBreakdown, [class*="pdfFullBreakdown"],
                                .tableWrapper, [class*="tableWrapper"] {
                                    page-break-inside: auto !important;
                                    break-inside: auto !important;
                                    overflow: visible !important;
                                    max-height: none !important;
                                    height: auto !important;
                                }
                            }
                        `;
                        clonedDoc.head.appendChild(styleEl);

                        // 8. Explicitly apply inline avoid rules on all rows and cards
                        clonedDoc.querySelectorAll('tr').forEach((row) => {
                            row.style.setProperty('page-break-inside', 'avoid', 'important');
                            row.style.setProperty('break-inside', 'avoid', 'important');
                            row.style.setProperty('break-inside', 'avoid-page', 'important');
                        });
                        clonedDoc.querySelectorAll('.pdfBreakdownBlock, [class*="pdfBreakdownBlock"]').forEach((block) => {
                            block.style.setProperty('page-break-inside', 'avoid', 'important');
                            block.style.setProperty('break-inside', 'avoid', 'important');
                            block.style.setProperty('break-inside', 'avoid-page', 'important');
                        });
                    }
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: {
                    mode: ['css', 'legacy'],
                    avoid: [
                        'tr',
                        '.pdfBreakdownBlock',
                        '[class*="pdfBreakdownBlock"]',
                        '.technicalGaugeCard',
                        '[class*="technicalGaugeCard"]',
                        '.tradeSignalSetupCard',
                        '[class*="tradeSignalSetupCard"]',
                        '.patternsCard',
                        '[class*="patternsCard"]',
                        '.riskFlagsCard',
                        '[class*="riskFlagsCard"]',
                        '.bullBearHero',
                        '[class*="bullBearHero"]',
                        '.heroBanner',
                        '[class*="heroBanner"]',
                        'svg',
                        'canvas',
                        'figure'
                    ]
                }
            };

            await html2pdf().set(opt).from(element).save();
            toast.success('AI Chart Scan Report downloaded successfully!');
        } catch (err) {
            console.error('PDF export failed:', err);
            toast.error('Failed to generate PDF. Please try again.');
        } finally {
            setIsExporting(false);
        }
    }, [isExporting]);

    return { exportToPdf, isExporting };
}
