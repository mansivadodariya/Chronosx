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

            // Apply light theme classes on the report element for crisp white-mode PDF export
            element.classList.add('pdfExportLight');

            const html2pdf = (await import('html2pdf.js')).default;
            await new Promise((resolve) => setTimeout(resolve, 800));

            const opt = {
                margin: [8, 8, 8, 8],
                filename: `ChronosX_Chart_Scan_${cleanSymbol}_${cleanTf}_${dateStr}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#FFFFFF',
                    scrollX: 0,
                    scrollY: 0,
                    logging: false
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: {
                    mode: ['avoid-all', 'css', 'legacy'],
                    avoid: [
                        '.topSplitRow',
                        '.summaryHeaderGrid',
                        '.technicalGaugeCard',
                        '.bullBearHero',
                        '.heroBanner',
                        '.tradeSignalSetupCard',
                        '.liveIndicatorsGrid',
                        '.patternsCard',
                        '.riskFlagsCard',
                        '.indicatorPivotSection',
                        '.pdfBreakdownBlock',
                        'table',
                        'tr',
                        'figure',
                        'svg',
                        'canvas'
                    ]
                }
            };

            await html2pdf().set(opt).from(element).save();
            toast.success('AI Chart Scan Report downloaded successfully!');
        } catch (err) {
            console.error('PDF export failed:', err);
            toast.error('Failed to generate PDF. Please try again.');
        } finally {
            if (element) {
                element.classList.remove('pdfExportLight');
            }
            setIsExporting(false);
        }
    }, []);

    return { exportToPdf, isExporting };
}
