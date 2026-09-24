'use client';

/**
 * Formats a key-value pair or complex object from parsed JSON into clean, human-readable bullet points
 */
function formatJsonObjectToReadableSummary(obj) {
    if (!obj || typeof obj !== 'object') return '';
    const lines = [];

    const labelMap = {
        stock_name: 'Asset / Pair',
        asset: 'Asset / Pair',
        instrument: 'Asset / Pair',
        symbol: 'Asset / Pair',
        interval: 'Timeframe',
        timeframe: 'Timeframe',
        from_date: 'From Date',
        to_date: 'To Date',
        inital_capital: 'Initial Capital',
        initial_capital: 'Initial Capital',
        capital: 'Capital',
        quantity: 'Position Size',
        strategy_name: 'Strategy Name',
        name: 'Strategy Name',
        pattern: 'Trading Pattern',
        entry_pattern: 'Entry Pattern',
        entry_conditions: 'Entry Rules',
        exit_conditions: 'Exit Rules',
        stoploss: 'Stop Loss',
        stoploss_pips: 'Stop Loss',
        target: 'Target Profit',
        target_pips: 'Target Profit',
        risk_reward_ratio: 'Risk / Reward',
        win_rate: 'Win Rate',
        total_trades: 'Total Trades',
        indicator: 'Indicator',
        fast_ema: 'Fast EMA',
        slow_ema: 'Slow EMA',
        rsi_period: 'RSI Period'
    };

    const visitedSemantic = new Set();

    for (const [key, value] of Object.entries(obj)) {
        if (value === null || value === undefined || value === '') continue;

        // Skip internal or system metadata
        if (
            key === 'session_id' ||
            key === 'status' ||
            key === 'draft_id' ||
            key === 'step' ||
            key === 'total_steps' ||
            key === 'complete' ||
            key === 'success' ||
            key === 'code'
        ) {
            continue;
        }

        const label = labelMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        if (visitedSemantic.has(label)) continue;
        visitedSemantic.add(label);

        let valStr = '';
        if (Array.isArray(value)) {
            if (value.length === 0) continue;
            if (typeof value[0] === 'object' && value[0] !== null) {
                valStr = value.map((item) => {
                    if (item.indicator && item.operator && item.value !== undefined) {
                        return `${item.indicator} ${String(item.operator).replace(/_/g, ' ')} ${item.value}`;
                    }
                    return Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(', ');
                }).join('; ');
            } else {
                valStr = value.join(', ');
            }
        } else if (typeof value === 'object' && value !== null) {
            valStr = Object.entries(value)
                .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
                .join(', ');
        } else {
            valStr = String(value);
            if (key.includes('capital') && !isNaN(Number(value))) {
                valStr = `$${Number(value).toLocaleString()}`;
            } else if ((key.includes('stoploss') || key.includes('target')) && !isNaN(Number(value))) {
                valStr = `${value} pts`;
            }
        }

        lines.push(`• **${label}**: ${valStr}`);
    }

    return lines.join('\n');
}

/**
 * Sanitizes any raw JSON blocks inside a text string into clean human-friendly summaries.
 * Prevents raw JSON dumps from appearing in chat bubbles.
 */
export function sanitizeRawJsonText(rawText) {
    if (!rawText || typeof rawText !== 'string') return rawText;

    let text = rawText;

    // Pattern 1: Fenced code blocks ```json { ... } ``` or ``` { ... } ```
    text = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, (match, code) => {
        const trimmed = code.trim();
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
                    return parsed.map(formatJsonObjectToReadableSummary).filter(Boolean).join('\n\n');
                } else if (typeof parsed === 'object' && parsed !== null) {
                    return formatJsonObjectToReadableSummary(parsed);
                }
            } catch (e) {
                // Not valid JSON, continue
            }
        }
        return code;
    });

    // Pattern 2: `json\n{ ... }` or `json\n[` (as shown in user's screenshot)
    text = text.replace(/(?:^|\n)\s*json\s*(\{[\s\S]*?\})/gi, (match, jsonBlock) => {
        try {
            const parsed = JSON.parse(jsonBlock.trim());
            return '\n' + formatJsonObjectToReadableSummary(parsed);
        } catch (e) {
            return match;
        }
    });

    // Pattern 3: Standalone top-level { "key": ... } blocks inside text
    text = text.replace(/(\{[\s\r\n]*"(?:stock_name|asset|instrument|symbol|interval|timeframe|from_date|to_date|entry_conditions|exit_conditions|strategy_name|stoploss|target|initial_capital)"[\s\S]*?\})/gi, (match, jsonBlock) => {
        try {
            const parsed = JSON.parse(jsonBlock.trim());
            return '\n' + formatJsonObjectToReadableSummary(parsed);
        } catch (e) {
            return match;
        }
    });

    // Pattern 4: Clean stray asterisks in bullet points or section headers like "• *Chart Elements:" or "*Chart Elements:"
    text = text.replace(/(?:^|\n)\s*[•\-]\s*\*([^*:\n]+):?/g, '\n• $1:');
    text = text.replace(/(?:^|\n)\s*\*([A-Za-z0-9\s]{2,30}:)/g, '\n**$1**');

    // Clean up excessive blank lines
    text = text.replace(/\n{3,}/g, '\n\n').trim();

    return text;
}
