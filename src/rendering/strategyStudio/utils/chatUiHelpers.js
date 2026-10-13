export const STEP_TITLES = [
    'Market & Timeframe',
    'Strategy Requirements',
    'Risk & Execution',
    'Strategy Blueprint'
];

export const DYNAMIC_LOADING_STAGES = [
    'Formulating quantitative trading blueprint...',
    'Synthesizing indicators & technical signals...',
    'Optimizing entry triggers and risk parameters (SL/TP)...',
    'Compiling algorithmic strategy rules...'
];

export function getDynamicStepInfo(msg, allMessages) {
    if (!msg || msg.isError || msg.role === 'user') return null;

    // If step is null or not provided from backend, do not show step progress bar (must not be static)
    const rawStep = msg.step ?? msg.step_number;
    const hasValidStepNum = rawStep != null && rawStep !== '' && !isNaN(parseInt(rawStep, 10)) && parseInt(rawStep, 10) > 0;
    const hasValidBadge = Boolean(msg.step_badge && typeof msg.step_badge === 'string' && msg.step_badge.trim());

    if (!hasValidStepNum && !hasValidBadge) {
        return null;
    }

    if (hasValidBadge) {
        const match = msg.step_badge.match(/Step\s*(\d+)/i);
        const stepNum = match ? parseInt(match[1], 10) : (hasValidStepNum ? parseInt(rawStep, 10) : 1);
        const title = msg.step_title || msg.step_badge.replace(/^Step\s*\d+:\s*/i, '') || STEP_TITLES[stepNum - 1] || 'Strategy Configuration';
        const total = msg.total_steps || 4;
        const progress = Math.min(100, Math.max(12, Math.round((stepNum / total) * 100)));
        return { stepNum, total, title, badgeText: `Step ${stepNum}: ${title}`, progress };
    }

    const stepNum = parseInt(rawStep, 10);
    const total = msg.total_steps || 4;
    const title = msg.step_title || STEP_TITLES[stepNum - 1] || 'Strategy Configuration';
    const progress = Math.min(100, Math.max(12, Math.round((stepNum / total) * 100)));
    return { stepNum, total, title, badgeText: `Step ${stepNum}: ${title}`, progress };
}
