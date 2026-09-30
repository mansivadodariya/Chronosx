'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import styles from '../styles/strategyStudio.module.scss';
import { RightArrowSelectedIcon, SendPaperAirplaneIcon } from './StudioIcons';

export default function InteractiveQuestionWizard({
    latestAiMessage,
    messages = [],
    onComplete,
    onDismiss,
    loading
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
    const [inlineAnswer, setInlineAnswer] = useState('');
    const [collectedAnswers, setCollectedAnswers] = useState([]);
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const isSubmittingRef = useRef(false);

    // Collect all questions that the user has already answered in the chat session
    const previouslyAnsweredSet = useMemo(() => {
        const set = new Set();
        (messages || []).forEach((msg) => {
            if (msg.role === 'user') {
                if (msg.qaList && Array.isArray(msg.qaList)) {
                    msg.qaList.forEach((qa) => {
                        if (qa.question_id) set.add(qa.question_id.toLowerCase().trim());
                        if (qa.question) set.add(qa.question.toLowerCase().trim());
                    });
                }
                if (typeof msg.text === 'string' && msg.text.includes('?')) {
                    const lines = msg.text.split('\n');
                    lines.forEach((line) => {
                        if (line.includes('?')) {
                            set.add(line.toLowerCase().trim());
                        }
                    });
                }
            }
        });
        if (latestAiMessage?.answered_questions && Array.isArray(latestAiMessage.answered_questions)) {
            latestAiMessage.answered_questions.forEach((q) => {
                if (typeof q === 'string') set.add(q.toLowerCase().trim());
                else if (q?.question_id) set.add(q.question_id.toLowerCase().trim());
                else if (q?.question) set.add(q.question.toLowerCase().trim());
            });
        }
        return set;
    }, [messages, latestAiMessage]);

    // Parse questions list from latest AI message & omit already answered questions
    const questionsList = useMemo(() => {
        if (!latestAiMessage) return [];
        let raw = [];
        if (latestAiMessage.questions && Array.isArray(latestAiMessage.questions) && latestAiMessage.questions.length > 0) {
            raw = latestAiMessage.questions;
        } else if (latestAiMessage.current_question) {
            raw = [latestAiMessage.current_question];
        } else if (latestAiMessage.options && Array.isArray(latestAiMessage.options) && latestAiMessage.options.length > 0) {
            raw = [
                {
                    question_id: 'strategy_preference',
                    question_number: 1,
                    total_questions: 1,
                    question: latestAiMessage.question || 'How would you like to configure your strategy rules?',
                    question_title: latestAiMessage.question || 'How would you like to configure your strategy rules?',
                    description: 'Select your preferred strategy configuration workflow:',
                    options: latestAiMessage.options.map((opt) =>
                        typeof opt === 'string'
                            ? { label: opt, description: '', value: opt }
                            : {
                                label: opt.label || opt.title || opt.value || '',
                                description: opt.description || opt.desc || '',
                                value: opt.value || opt.label || opt.title || ''
                            }
                    )
                }
            ];
        } else if (latestAiMessage.suggestions && Array.isArray(latestAiMessage.suggestions) && latestAiMessage.suggestions.length > 0) {
            raw = [
                {
                    question_id: 'quick_actions',
                    question_number: 1,
                    total_questions: 1,
                    question: 'Select a recommended strategy direction:',
                    question_title: 'Select a recommended strategy direction:',
                    description: 'Choose one of our optimized algorithmic parameters:',
                    options: latestAiMessage.suggestions.map((sug) => {
                        const clean = sug.replace(/^🚀\s*/, '');
                        return {
                            label: clean,
                            description: clean.toLowerCase().includes('backtest')
                                ? 'Simulate strategy performance across historical candles.'
                                : 'Calibrate parameters for higher statistical edge.',
                            value: clean
                        };
                    })
                }
            ];
        }

        if (previouslyAnsweredSet.size === 0) return raw;

        // Auto-filter out questions already answered in previous turns
        const filtered = raw.filter((q) => {
            const qId = (q.question_id || '').toLowerCase().trim();
            const qTitle = (q.question_title || q.question || '').toLowerCase().trim();
            if (qId && previouslyAnsweredSet.has(qId)) return false;
            if (qTitle && previouslyAnsweredSet.has(qTitle)) return false;
            return true;
        });

        return filtered.length > 0 ? filtered : raw;
    }, [latestAiMessage, previouslyAnsweredSet]);

    // Reset when a brand new AI message arrives with questions
    useEffect(() => {
        const initialIdx = typeof latestAiMessage?.current_question_index === 'number'
            ? Math.max(0, Math.min(latestAiMessage.current_question_index, Math.max(0, questionsList.length - 1)))
            : 0;
        setCurrentIndex(initialIdx);
        setSelectedOptionIndex(0);
        setInlineAnswer('');
        setCollectedAnswers([]);
        isSubmittingRef.current = false;
    }, [latestAiMessage, questionsList.length]);

    const totalQuestions = Math.max(1, latestAiMessage?.total_questions || questionsList.length);
    const safeCurrentIndex = Math.min(Math.max(0, currentIndex), Math.max(0, questionsList.length - 1));
    const activeQuestion = questionsList[safeCurrentIndex] || questionsList[0] || null;
    const displayStepNumber = Math.min(safeCurrentIndex + 1, totalQuestions);

    const activeOptions = useMemo(() => {
        if (!activeQuestion || !activeQuestion.options || !Array.isArray(activeQuestion.options)) {
            return [];
        }
        const list = activeQuestion.options.map((opt) =>
            typeof opt === 'string'
                ? { label: opt, description: '', value: opt }
                : {
                    label: opt.label || opt.title || opt.value || '',
                    description: opt.description || opt.desc || '',
                    value: opt.value || opt.label || opt.title || '',
                    is_custom: Boolean(opt.is_custom)
                }
        );

        const hasCustomOption = list.some(
            (opt) =>
                opt.is_custom ||
                opt.label?.toLowerCase().trim() === 'custom' ||
                opt.value?.toLowerCase().trim() === 'custom'
        );
        if (activeQuestion.has_custom && !hasCustomOption) {
            list.push({
                label: 'Custom',
                description: 'Describe your own',
                value: 'custom',
                is_custom: true
            });
        }

        return list;
    }, [activeQuestion]);

    const selectedOption = activeOptions[selectedOptionIndex] || null;
    const isCustomSelected = Boolean(
        selectedOption &&
        (selectedOption.is_custom ||
            selectedOption.value === 'custom' ||
            selectedOption.label?.toLowerCase().trim() === 'custom' ||
            selectedOption.label?.toLowerCase().startsWith('custom'))
    );

    // Auto-focus container or custom input
    useEffect(() => {
        if (isCustomSelected) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 60);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => {
                containerRef.current?.focus();
            }, 60);
            return () => clearTimeout(timer);
        }
    }, [isCustomSelected, currentIndex, selectedOptionIndex]);

    if (!activeQuestion || activeOptions.length === 0 || loading) {
        return null;
    }

    const handleAnswerSubmit = (value, label = '') => {
        const answerText = value || label;
        if (!answerText) return;

        const newAnswerItem = {
            question_id: activeQuestion.question_id || `q_${currentIndex}`,
            question: activeQuestion.question || activeQuestion.question_title || 'Question',
            answer: answerText,
            label: label || answerText
        };

        const updatedAnswers = [...collectedAnswers, newAnswerItem];
        setCollectedAnswers(updatedAnswers);

        // Check if there are more questions in the flow
        if (currentIndex + 1 < totalQuestions) {
            setCurrentIndex((prev) => prev + 1);
            setSelectedOptionIndex(0);
            setInlineAnswer('');
            isSubmittingRef.current = false;
        } else {
            // All questions answered — compile formatted summary string matching Image 2
            const formattedSummary = updatedAnswers
                .map((item) => `${item.question}\n${item.answer}`)
                .join('\n\n');

            onComplete(formattedSummary, updatedAnswers);
            setCurrentIndex(0);
            setCollectedAnswers([]);
            // Keep locked until new AI response arrives
            isSubmittingRef.current = true;
        }
    };

    const handleOptionClick = (choice, cIdx) => {
        if (isSubmittingRef.current || loading) return;
        setSelectedOptionIndex(cIdx);
        const isCustom = Boolean(
            choice.is_custom ||
            choice.value === 'custom' ||
            choice.label?.toLowerCase().trim() === 'custom' ||
            choice.label?.toLowerCase().startsWith('custom')
        );

        if (isCustom) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 60);
        } else {
            isSubmittingRef.current = true;
            // Visually show option selected with arrow before submitting
            setTimeout(() => {
                handleAnswerSubmit(choice.value, choice.label);
            }, 180);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (activeOptions.length > 0) {
                setSelectedOptionIndex((prev) => (prev + 1) % activeOptions.length);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (activeOptions.length > 0) {
                setSelectedOptionIndex((prev) => (prev - 1 + activeOptions.length) % activeOptions.length);
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            if (isSubmittingRef.current || loading) return;
            if (inlineAnswer.trim()) {
                isSubmittingRef.current = true;
                handleAnswerSubmit(inlineAnswer.trim(), inlineAnswer.trim());
            } else if (selectedOption) {
                if (isCustomSelected) {
                    inputRef.current?.focus();
                } else {
                    isSubmittingRef.current = true;
                    handleAnswerSubmit(selectedOption.value, selectedOption.label);
                }
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            if (onDismiss) onDismiss();
        }
    };

    return (
        <div
            ref={containerRef}
            className={styles.interactiveOptionBox}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            style={{ outline: 'none' }}
            role="region"
            aria-label="Strategy Questions Wizard"
        >
            {/* Header: Keyboard Navigation Shortcuts (Left) + Step Counter Badge (Right) */}
            <div className={styles.optionBoxHeaderRow}>
                <div className={styles.optionBoxHintsRow}>
                    <span className={styles.hint}>
                        <kbd>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="18 15 12 9 6 15" />
                            </svg>
                        </kbd>
                        <kbd>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </kbd>
                        <span>to navigate</span>
                    </span>
                    <span className={styles.hint}>
                        <kbd>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 10 4 15 9 20" />
                                <path d="M20 4v7a4 4 0 0 1-4 4H4" />
                            </svg>
                        </kbd>
                        <span>to select</span>
                    </span>
                    <span className={styles.hint}>
                        <kbd>esc</kbd>
                        <span>to close</span>
                    </span>
                </div>
                <div className={styles.stepCounterBadge}>
                    <span>{displayStepNumber}/{totalQuestions}</span>
                </div>
            </div>

            {/* Question Title */}
            <div className={styles.optionBoxQuestion}>
                {activeQuestion.question_title || activeQuestion.question}
            </div>

            {/* Optional Question Context / Description */}
            {activeQuestion.description && (
                <div className={styles.optionBoxDescription}>
                    {activeQuestion.description}
                </div>
            )}

            {/* Selectable Option Choices List */}
            <div className={styles.optionChoicesList}>
                {activeOptions.map((choice, cIdx) => {
                    const isSelected = selectedOptionIndex === cIdx;
                    return (
                        <button
                            key={cIdx}
                            type="button"
                            disabled={loading}
                            className={`${styles.optionChoiceItem} ${isSelected ? styles.selectedOption : ''}`}
                            onClick={() => handleOptionClick(choice, cIdx)}
                        >
                            <span className={`${styles.selectedArrowPrefix} ${isSelected ? styles.visibleArrow : styles.placeholderArrow}`}>
                                <RightArrowSelectedIcon size={14} color="#18C98B" />
                            </span>
                            <div className={styles.choiceTextContainer}>
                                <span className={styles.choiceTitle}>{choice.label}</span>
                                {choice.description && (
                                    <span className={styles.choiceDesc}>{choice.description}</span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Bottom Row: Type Custom Answer + Send Airplane Icon — ONLY DISPLAYED WHEN CUSTOM IS SELECTED */}
            {isCustomSelected && (
                <div className={styles.optionInlineInputWrap}>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type your answer..."
                        value={inlineAnswer}
                        onChange={(e) => setInlineAnswer(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && inlineAnswer.trim()) {
                                e.preventDefault();
                                handleAnswerSubmit(inlineAnswer.trim(), inlineAnswer.trim());
                            }
                        }}
                    />
                    <button
                        type="button"
                        className={styles.inlineSendBtn}
                        onClick={() => {
                            if (inlineAnswer.trim()) {
                                handleAnswerSubmit(inlineAnswer.trim(), inlineAnswer.trim());
                            }
                        }}
                        disabled={!inlineAnswer.trim()}
                        title="Submit Answer"
                    >
                        <SendPaperAirplaneIcon size={14} color="#18C98B" />
                    </button>
                </div>
            )}
        </div>
    );
}
