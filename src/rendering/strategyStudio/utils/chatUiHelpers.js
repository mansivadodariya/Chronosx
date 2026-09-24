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

export function getDynamicStepInfo(msg, allMessages, defaultCurrentStep = 2, defaultTotalSteps = 4) {
    if (msg.step_badge) {
        const match = msg.step_badge.match(/Step\s*(\d+)/i);
        const stepNum = match ? parseInt(match[1], 10) : defaultCurrentStep;
        const title = msg.step_title || msg.step_badge.replace(/^Step\s*\d+:\s*/i, '') || STEP_TITLES[stepNum - 1] || 'Strategy Configuration';
        const total = msg.total_steps || defaultTotalSteps;
        const progress = Math.min(100, Math.max(12, Math.round((stepNum / total) * 100)));
        return { stepNum, total, title, badgeText: `Step ${stepNum}: ${title}`, progress };
    }

    if (msg.draft) {
        return {
            stepNum: 4,
            total: 4,
            title: 'Strategy Blueprint Ready',
            badgeText: 'Step 4: Strategy Blueprint Ready',
            progress: 100
        };
    }

    if (msg.current_question?.question_number && msg.current_question?.total_questions) {
        const qNum = msg.current_question.question_number;
        const qTotal = msg.current_question.total_questions;
        const total = 4;
        const stepNum = Math.min(4, Math.max(1, Math.ceil((qNum / qTotal) * 4)));
        const title = msg.step_title || STEP_TITLES[stepNum - 1] || 'Strategy Requirements';
        const progress = Math.min(100, Math.max(15, Math.round((qNum / qTotal) * 100)));
        return { stepNum, total, title, badgeText: `Step ${stepNum}: ${title}`, progress };
    }

    if (msg.step || msg.step_number) {
        const stepNum = parseInt(msg.step || msg.step_number, 10);
        const total = msg.total_steps || defaultTotalSteps;
        const title = msg.step_title || STEP_TITLES[stepNum - 1] || 'Strategy Requirements';
        const progress = Math.min(100, Math.max(15, Math.round((stepNum / total) * 100)));
        return { stepNum, total, title, badgeText: `Step ${stepNum}: ${title}`, progress };
    }

    const aiMessages = (allMessages || []).filter((m) => m.role === 'ai');
    const aiIndex = aiMessages.indexOf(msg);
    const stepNum = Math.min(4, Math.max(1, aiIndex >= 0 ? aiIndex + 1 : defaultCurrentStep));
    const total = 4;
    const title = STEP_TITLES[stepNum - 1] || 'Strategy Requirements';
    const progress = Math.min(100, Math.max(25, Math.round((stepNum / total) * 100)));

    return { stepNum, total, title, badgeText: `Step ${stepNum}: ${title}`, progress };
}
