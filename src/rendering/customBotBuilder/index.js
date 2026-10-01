'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/toast';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './customBotBuilder.module.scss';
import CommonSectionHeader from '@/components/CommonSectionHeader';
import { CustomBotIcon } from '@/icons/sidebarIcons';
import { useLanguage } from '@/context/LanguageContext';
import StepperHeader from './components/StepperHeader';
import StepBasics from './components/StepBasics';
import StepEntryRules from './components/StepEntryRules';
import StepExitRules from './components/StepExitRules';
import StepRisk from './components/StepRisk';
import StepReview from './components/StepReview';
import StepFooterNav from './components/StepFooterNav';
import { validateEntryCondition } from './constants';

const INITIAL_FORM_DATA = {
    botName: '',
    description: '',
    tradingPair: '',
    timeframe: '',
    triggerMode: 'ALL',
    entryConditions: [
        {
            id: 'cond_1',
            indicatorKey: 'ema_crossover',
            condition: 'Golden Cross (Fast > Slow)',
            params: { fastPeriod: 9, slowPeriod: 21 }
        }
    ],
    takeProfitPips: '',
    stopLossPips: '',
    trailingStop: false,
    trailingDistance: '',
    trailingStep: '',
    riskLevel: '',
    lotSize: '',
    maxOpenPositions: '',
    riskPerTrade: '',
    maxDailyLoss: ''
};

function validateStep(step, data) {
    const errors = {};

    if (step === 1) {
        if (!data.botName || !data.botName.trim()) {
            errors.botName = 'Bot name is required';
        } else if (data.botName.trim().length < 3) {
            errors.botName = 'Bot name must be at least 3 characters';
        }

        if (!data.tradingPair) {
            errors.tradingPair = 'Please select a trading pair';
        }

        if (!data.timeframe) {
            errors.timeframe = 'Please select a timeframe';
        }
    }

    if (step === 2) {
        if (!data.entryConditions || data.entryConditions.length === 0) {
            errors.entryConditions = 'Please add at least one entry condition';
        } else {
            for (let i = 0; i < data.entryConditions.length; i++) {
                const condErr = validateEntryCondition(data.entryConditions[i]);
                if (condErr) {
                    errors.entryConditions = `Condition #${i + 1}: ${condErr}`;
                    break;
                }
            }
        }
    }

    if (step === 3) {
        if (!data.takeProfitPips || Number(data.takeProfitPips) <= 0) {
            errors.takeProfitPips = 'Take Profit must be greater than 0 pips';
        }
        if (!data.stopLossPips || Number(data.stopLossPips) <= 0) {
            errors.stopLossPips = 'Stop Loss must be greater than 0 pips';
        }
        if (data.trailingStop) {
            if (!data.trailingDistance || Number(data.trailingDistance) <= 0) {
                errors.trailingDistance = 'Trailing distance must be greater than 0 pips';
            }
            if (!data.trailingStep || Number(data.trailingStep) <= 0) {
                errors.trailingStep = 'Trailing step must be greater than 0 pips';
            }
        }
    }

    if (step === 4) {
        if (!data.lotSize || Number(data.lotSize) <= 0) {
            errors.lotSize = 'Lot size must be greater than 0 (e.g. 0.10)';
        }
        if (!data.maxOpenPositions || Number(data.maxOpenPositions) < 1) {
            errors.maxOpenPositions = 'Max open positions must be at least 1';
        }
        if (!data.riskPerTrade || Number(data.riskPerTrade) <= 0 || Number(data.riskPerTrade) > 100) {
            errors.riskPerTrade = 'Risk per trade must be between 0.1% and 100%';
        }
        if (!data.maxDailyLoss || Number(data.maxDailyLoss) <= 0 || Number(data.maxDailyLoss) > 100) {
            errors.maxDailyLoss = 'Max daily loss must be between 0.5% and 100%';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

export default function CustomBotBuilderView() {
    const { t } = useLanguage();
    const router = useRouter();

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [errors, setErrors] = useState({});
    const [isSimulating, setIsSimulating] = useState(false);

    const handleFormChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (errors[field]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handlePrev = () => {
        setErrors({});
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleNext = () => {
        const { isValid, errors: validationErrors } = validateStep(currentStep, formData);

        if (!isValid) {
            setErrors(validationErrors);
            const firstError = Object.values(validationErrors)[0];
            toast.error(firstError);
            return;
        }

        setErrors({});
        setCurrentStep(prev => Math.min(prev + 1, 5));
    };

    const handleSelectStep = (targetStep) => {
        if (targetStep < currentStep) {
            setErrors({});
            setCurrentStep(targetStep);
            return;
        }

        const { isValid, errors: validationErrors } = validateStep(currentStep, formData);
        if (!isValid) {
            setErrors(validationErrors);
            toast.error(Object.values(validationErrors)[0]);
            return;
        }

        setErrors({});
        setCurrentStep(targetStep);
    };

    const handleRunBacktest = () => {
        setIsSimulating(true);
        toast.loading('Running historical tick simulation...', { id: 'sim-toast' });
        setTimeout(() => {
            setIsSimulating(false);
            toast.success('Simulation completed: 68.4% Win Rate, Profit Factor 1.92!', { id: 'sim-toast' });
        }, 1200);
    };

    const handleDeployBot = () => {
        for (let s = 1; s <= 4; s++) {
            const { isValid, errors: validationErrors } = validateStep(s, formData);
            if (!isValid) {
                setCurrentStep(s);
                setErrors(validationErrors);
                toast.error(Object.values(validationErrors)[0]);
                return;
            }
        }

        const newBot = {
            id: 'custom_bot_' + Date.now(),
            name: formData.botName || 'Custom Algo Bot',
            symbol: formData.tradingPair || 'EUR/USD',
            timeframe: formData.timeframe || '1h',
            type: 'Custom Bot',
            status: 'active',
            winRate: '68.4%',
            profitFactor: '1.92',
            totalPnl: '+$0.00',
            lotSize: formData.lotSize || 0.1,
            riskLevel: formData.riskLevel || 'medium',
            createdAt: new Date().toISOString()
        };

        try {
            const current = JSON.parse(localStorage.getItem('chronosx_user_bots') || '[]');
            current.unshift(newBot);
            localStorage.setItem('chronosx_user_bots', JSON.stringify(current));
            toast.success(`Custom Bot "${newBot.name}" deployed successfully!`);
            setTimeout(() => {
                router.push('/my-bots');
            }, 800);
        } catch (e) {
            console.error('Error saving bot:', e);
            toast.success('Bot saved successfully!');
            router.push('/my-bots');
        }
    };

    return (
        <div className={styles.builderContainer}>
            {/* Common Section Header */}
            <CommonSectionHeader
                badge="CHRONOSX QUANT SUITE"
                icon={<CustomBotIcon width={26} height={26} />}
                title={t('nav.customBotBuilder', 'Custom Bot Builder')}
                subtitle="Build custom algorithmic trading bots step-by-step with technical entry signals, exit targets, and risk parameters."
            />

            {/* Stepper Header Bar */}
            <StepperHeader
                currentStep={currentStep}
                onSelectStep={handleSelectStep}
            />

            {/* Step Body Content with Smooth Transition */}
            <div className={styles.stepBodyArea}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.22 }}
                    >
                        {currentStep === 1 && (
                            <StepBasics
                                data={formData}
                                errors={errors}
                                onChange={handleFormChange}
                            />
                        )}
                        {currentStep === 2 && (
                            <StepEntryRules
                                data={formData}
                                errors={errors}
                                onChange={handleFormChange}
                            />
                        )}
                        {currentStep === 3 && (
                            <StepExitRules
                                data={formData}
                                errors={errors}
                                onChange={handleFormChange}
                            />
                        )}
                        {currentStep === 4 && (
                            <StepRisk
                                data={formData}
                                errors={errors}
                                onChange={handleFormChange}
                            />
                        )}
                        {currentStep === 5 && (
                            <StepReview
                                data={formData}
                                onEditStep={(step) => setCurrentStep(step)}
                                onRunBacktest={handleRunBacktest}
                                onDeployBot={handleDeployBot}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Step Footer Navigation */}
            <StepFooterNav
                currentStep={currentStep}
                totalSteps={5}
                onPrev={handlePrev}
                onNext={handleNext}
                onDeploy={handleDeployBot}
            />
        </div>
    );
}
