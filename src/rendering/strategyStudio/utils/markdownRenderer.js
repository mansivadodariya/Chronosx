import React from 'react';
import styles from '../styles/strategyStudio.module.scss';

/**
 * Parses markdown inline tokens (**bold**, `code`, *italic*) into styled elements.
 * Automatically cleans any stray or unclosed asterisks so no literal '**' or '*' leaks into the UI.
 */
export function renderInlineTokens(str) {
    if (!str) return null;
    let cleanStr = String(str);

    // Remove any leading/trailing unclosed asterisks
    cleanStr = cleanStr.replace(/^\*+\s*/, '').replace(/\s*\*+$/, '');

    // If string has an uneven count of '**', strip orphaned '**' at boundaries
    const countDoubleStars = (cleanStr.match(/\*\*/g) || []).length;
    if (countDoubleStars % 2 !== 0) {
        cleanStr = cleanStr.replace(/\*\*+$/, '').replace(/^\*\*+/, '');
    }

    const parts = [];
    const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = tokenRegex.exec(cleanStr)) !== null) {
        if (match.index > lastIndex) {
            const textPart = cleanStr.substring(lastIndex, match.index).replace(/\*+/g, '');
            if (textPart) parts.push(textPart);
        }
        const token = match[0];
        if (token.startsWith('**') && token.endsWith('**')) {
            const boldInner = token.slice(2, -2).replace(/\*+/g, '').trim();
            if (boldInner) {
                parts.push(
                    <strong key={`b_${key++}`} style={{ fontFamily: '"Euclid-Bold", "Euclid Circular A", sans-serif', fontWeight: 800, color: '#FFFFFF' }}>
                        {boldInner}
                    </strong>
                );
            }
        } else if (token.startsWith('`') && token.endsWith('`')) {
            parts.push(
                <code
                    key={`c_${key++}`}
                    style={{
                        background: 'rgba(24, 201, 139, 0.15)',
                        color: '#18C98B',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        fontSize: '0.9em',
                        fontFamily: 'monospace'
                    }}
                >
                    {token.slice(1, -1)}
                </code>
            );
        } else if (token.startsWith('*') && token.endsWith('*')) {
            parts.push(
                <em key={`i_${key++}`}>
                    {token.slice(1, -1)}
                </em>
            );
        }
        lastIndex = match.index + token.length;
    }

    if (lastIndex < cleanStr.length) {
        const remaining = cleanStr.substring(lastIndex).replace(/\*+/g, '');
        if (remaining) parts.push(remaining);
    }

    return parts.length > 0 ? parts : cleanStr.replace(/\*+/g, '');
}

/**
 * Helper to get an appropriate icon/emoji for a chart element
 */
function getChartElementIcon(label) {
    const lower = label.toLowerCase();
    if (lower.includes('ema') || lower.includes('sma') || lower.includes('rsi') || lower.includes('macd') || lower.includes('stoch') || lower.includes('indicator') || lower.includes('band')) {
        return '📈';
    }
    if (lower.includes('take profit') || lower.includes('stop loss') || lower.includes('trailing') || lower.includes('level') || lower.includes('support') || lower.includes('resistance')) {
        return '📐';
    }
    if (lower.includes('buy signal') || lower.includes('sell signal') || lower.includes('signal') || lower.includes('entry') || lower.includes('trigger')) {
        return '🔵';
    }
    if (lower.includes('structure') || lower.includes('bos') || lower.includes('choch') || lower.includes('fvg') || lower.includes('liquidity')) {
        return '⚡';
    }
    return '•';
}

/**
 * Parses markdown and structured lists:
 * - Step progress titles (e.g. Step 1 of 5: Asset Selection) -> Bold formatted header with 0 asterisks
 * - Bullet points with titles (e.g. • Entry Logic: description...) -> Title bold, description on next line/inline
 * - Key-Value headers (e.g. Strategy Name: ...) -> Bold title
 * - Section titles (e.g. Chart Elements:) -> Bold section title
 * - Chart element indicators -> Styled with bold name and indicator icon
 */
export function renderFormattedMarkdown(text) {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((rawLine, lineIdx) => {
        let line = rawLine.trim();
        if (!line) {
            return <div key={lineIdx} style={{ height: '6px' }} />;
        }

        // Clean stray leading asterisks in bullets like "• *Chart Elements:" -> "• Chart Elements:"
        line = line.replace(/^[•\-]\s*\*+([^*]+)\*?:?$/, '• $1:');

        // 0a. Step Progress Headers (e.g. "**Step 1 of 5: Asset Selection**" or "Step 1 of 5: Asset Selection**")
        const stepHeaderMatch = line.match(/^(?:\*\*)?(Step\s*\d+(?:\s*(?:of|\/)\s*\d+)?)(?:\*\*)?:?\s*(?:\*\*)?([^:\n*]+)?(?:\*\*)?:?$/i);
        if (stepHeaderMatch) {
            const stepNum = stepHeaderMatch[1].replace(/\*/g, '').trim();
            const stepTitle = (stepHeaderMatch[2] || '').replace(/\*/g, '').trim();
            const fullTitle = stepTitle ? `${stepNum}: ${stepTitle}` : stepNum;
            return (
                <div key={lineIdx} className={styles.keyValueRow} style={{ marginTop: '12px', marginBottom: '6px' }}>
                    <strong style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '15px' }}>{fullTitle}</strong>
                </div>
            );
        }

        // 0b. Markdown Headings (e.g. "### Chart Elements:" or "# Overview")
        const headingMatch = line.match(/^#{1,6}\s+(.+)$/);
        if (headingMatch) {
            const headingText = headingMatch[1].replace(/^\*\*|\*\*$/g, '').replace(/\*/g, '').replace(/:$/, '').trim();
            return (
                <div key={lineIdx} className={styles.keyValueRow} style={{ marginTop: '12px', marginBottom: '6px' }}>
                    <strong style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '15px' }}>{headingText}:</strong>
                </div>
            );
        }

        // 1. Standalone Section Titles (e.g. "**Chart Elements:**", "Chart Elements:", "*Chart Elements:*")
        const standaloneHeaderMatch = line.match(/^(?:(?:\*{1,3})?([A-Za-z0-9\s/&()-]{2,35})(?:\*{1,3})?:?\s*)$/);
        if (standaloneHeaderMatch && (line.endsWith(':') || line.startsWith('**') || line.toLowerCase().includes('chart element') || line.toLowerCase().includes('overview'))) {
            const titleLabel = standaloneHeaderMatch[1].replace(/\*/g, '').trim();
            return (
                <div key={lineIdx} className={styles.keyValueRow} style={{ marginTop: '12px', marginBottom: '6px' }}>
                    <strong style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '15px' }}>{titleLabel}:</strong>
                </div>
            );
        }

        // 2. Bullet point with bold or plain title AND description on same line: e.g. "• **Entry Logic:** desc" or "• Entry Logic: desc"
        const bulletWithDescMatch = line.match(/^(?:[•\-]|(?:\*\s+))\s*(?:\*\*)?([^:\n]+?)(?:\*\*)?:\s*(.+)$/);
        if (bulletWithDescMatch) {
            const titleLabel = bulletWithDescMatch[1].replace(/\*/g, '').trim();
            const descText = bulletWithDescMatch[2].replace(/^\*\*:\s*|^\*\*\s*/, '').replace(/\*+$/, '').trim();
            return (
                <div key={lineIdx} className={styles.bulletInlineRow}>
                    <span className={styles.bulletDot}>•</span>
                    <div className={styles.bulletContent}>
                        <strong style={{ fontWeight: 800, color: '#FFFFFF' }}>{titleLabel}:</strong>
                        <span>{renderInlineTokens(descText)}</span>
                    </div>
                </div>
            );
        }

        // 3. Chart Element / Indicator single bullet (e.g. "• EMA 9:", "• EMA 9", "• Buy Signal:", "• Take Profit Level:")
        const chartElementBulletMatch = line.match(/^(?:[•\-]|(?:\*\s+))\s*(.+)$/);
        if (chartElementBulletMatch) {
            let itemContent = chartElementBulletMatch[1].replace(/\*/g, '').trim();
            const cleanLabel = itemContent.replace(/:$/, '').trim();
            const icon = getChartElementIcon(cleanLabel);

            // If it has a recognized indicator/signal icon or ends with a colon, render bold with icon
            if (icon !== '•' || itemContent.endsWith(':') || itemContent.toLowerCase().includes('signal') || itemContent.toLowerCase().includes('ema') || itemContent.toLowerCase().includes('level')) {
                return (
                    <div key={lineIdx} className={styles.simpleBulletRow} style={{ margin: '5px 0' }}>
                        <span className={styles.bulletDot}>•</span>
                        <div className={styles.bulletContent} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {icon !== '•' && <span>{icon}</span>}
                            <strong style={{ fontWeight: 800, color: '#FFFFFF' }}>{cleanLabel}</strong>
                        </div>
                    </div>
                );
            }

            return (
                <div key={lineIdx} className={styles.simpleBulletRow}>
                    <span className={styles.bulletDot}>•</span>
                    <div className={styles.bulletContent}>{renderInlineTokens(itemContent)}</div>
                </div>
            );
        }

        // 4. Plain or Bold Key-Value header: e.g. "Strategy Name: EMA Crossover..." or "Category: Forex"
        const keyValueMatch = line.match(/^([A-Za-z0-9\s/&()-]{2,35}):\s*(.+)$/);
        if (keyValueMatch && !line.includes('http://') && !line.includes('https://')) {
            const keyLabel = keyValueMatch[1].replace(/\*/g, '').trim();
            const valText = keyValueMatch[2].replace(/^\*\*:\s*|^\*\*\s*/, '').replace(/\*+$/, '').trim();
            return (
                <div key={lineIdx} className={styles.keyValueRow}>
                    <strong style={{ fontWeight: 800, color: '#FFFFFF' }}>{keyLabel}:</strong>
                    <span>{renderInlineTokens(valText)}</span>
                </div>
            );
        }

        // 5. Italic Footer Prompt line (e.g. "Want to add or change any chart elements? Just let me know...")
        let cleanRaw = rawLine.trim();
        cleanRaw = cleanRaw.replace(/^\*+\s*/, '').replace(/\s*\*+$/, '');

        if (
            cleanRaw.toLowerCase().startsWith('want to add or change') ||
            cleanRaw.toLowerCase().includes('confirm to proceed') ||
            cleanRaw.toLowerCase().startsWith('sounds good')
        ) {
            return (
                <div key={lineIdx} style={{ margin: '12px 0 4px', fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.88)', lineHeight: 1.6 }}>
                    {cleanRaw.replace(/:$/, '')}
                </div>
            );
        }

        // 6. Default plain text line
        return (
            <div key={lineIdx} style={{ margin: '4px 0', lineHeight: 1.6 }}>
                {renderInlineTokens(cleanRaw)}
            </div>
        );
    });
}
