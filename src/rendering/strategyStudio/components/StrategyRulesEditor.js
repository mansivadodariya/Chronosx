'use client';

import React from 'react';
import styles from '../styles/strategyStudio.module.scss';
import StrategyOperandEditor, { getDefaultParamsForIndicator } from './StrategyOperandEditor';
import CustomSelect from './CustomSelect';

export default function StrategyRulesEditor({
    title,
    conditions,
    isExit = false,
    conditionTypes = [],
    operators = [],
    indicatorGroups = [],
    indIndex = {},
    onChange,
}) {
    const cond = conditions || { condition_type: isExit ? 'any' : 'all', rules: [] };
    const rules = cond.rules || [];

    // Ensure condition_type options always include the current value
    const condTypeOpts = [...conditionTypes];
    const currentCondType = cond.condition_type || (isExit ? 'any' : 'all');
    if (condTypeOpts.length === 0) {
        // Metadata not loaded yet — provide sensible defaults
        condTypeOpts.push({ value: 'all', label: 'All conditions must match (AND)' });
        condTypeOpts.push({ value: 'any', label: 'Any condition matches (OR)' });
    } else if (!condTypeOpts.some((ct) => ct.value === currentCondType)) {
        condTypeOpts.unshift({ value: currentCondType, label: currentCondType });
    }

    // Ensure operator options always include current rule operators
    const operatorOpts = [...operators];
    if (operatorOpts.length === 0) {
        // Provide standard operator defaults matching backend /interactive-metadata
        const defaultOps = [
            { value: 'crossover', label: 'crosses above' },
            { value: 'crossdown', label: 'crosses below' },
            { value: '>', label: 'is greater than (>)' },
            { value: '>=', label: 'is greater than or equal to (>=)' },
            { value: '<', label: 'is less than (<)' },
            { value: '<=', label: 'is less than or equal to (<=)' },
            { value: '==', label: 'equals (==)' },
        ];
        operatorOpts.push(...defaultOps);
    }

    // Ensure all rule operators exist in the options
    rules.forEach((r) => {
        if (r.operator && !operatorOpts.some((o) => o.value === r.operator)) {
            operatorOpts.push({ value: r.operator, label: r.operator });
        }
    });

    const handleConditionTypeChange = (e) => {
        onChange({
            ...cond,
            condition_type: e.target.value,
        });
    };

    const handleUpdateRule = (index, updatedRule) => {
        const nextRules = [...rules];
        nextRules[index] = updatedRule;
        onChange({
            ...cond,
            rules: nextRules,
        });
    };

    const handleRemoveRule = (index) => {
        const nextRules = rules.filter((_, i) => i !== index);
        onChange({
            ...cond,
            rules: nextRules,
        });
    };

    const handleAddRule = () => {
        const smaSpec = indIndex['sma'];
        const defaultSmaParams = getDefaultParamsForIndicator(smaSpec);
        const newRule = {
            indicator1: { name: 'close', parameters: {} },
            operator: '>',
            indicator2: { name: 'sma', parameters: defaultSmaParams },
        };
        onChange({
            ...cond,
            rules: [...rules, newRule],
        });
    };

    return (
        <div style={{ marginTop: '16px' }}>
            <div className={styles.sectionSubheader}>{title}</div>

            {/* Combine Rules Logic Selector */}
            <div className={styles.formField} style={{ marginBottom: '10px' }}>
                <label>Combine rules</label>
                <CustomSelect
                    value={currentCondType}
                    onChange={(val) =>
                        onChange({
                            ...cond,
                            condition_type: val,
                        })
                    }
                    options={condTypeOpts}
                    width="100%"
                />
            </div>

            {/* List of Rules */}
            {rules.map((rule, idx) => (
                <div key={idx} className={styles.ruleEditBox}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px',
                        }}
                    >
                        <strong className={styles.ruleTitle}>
                            Rule {idx + 1}
                        </strong>
                        <button
                            type="button"
                            className={styles.btnDangerAction}
                            onClick={() => handleRemoveRule(idx)}
                        >
                            Remove
                        </button>
                    </div>

                    {/* Indicator 1 Operand */}
                    <StrategyOperandEditor
                        operand={rule.indicator1}
                        indicatorGroups={indicatorGroups}
                        indIndex={indIndex}
                        onChange={(nextInd1) =>
                            handleUpdateRule(idx, { ...rule, indicator1: nextInd1 })
                        }
                    />

                    {/* Operator Select */}
                    <div className={styles.formField} style={{ margin: '8px 0' }}>
                        <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Operator
                        </label>
                        <CustomSelect
                            value={rule.operator || '>'}
                            onChange={(val) =>
                                handleUpdateRule(idx, { ...rule, operator: val })
                            }
                            options={operatorOpts}
                            width="100%"
                        />
                    </div>

                    {/* Indicator 2 Operand */}
                    <StrategyOperandEditor
                        operand={rule.indicator2}
                        indicatorGroups={indicatorGroups}
                        indIndex={indIndex}
                        onChange={(nextInd2) =>
                            handleUpdateRule(idx, { ...rule, indicator2: nextInd2 })
                        }
                    />
                </div>
            ))}

            {/* Add Rule Button */}
            <button
                type="button"
                className={styles.btnGhostAction}
                style={{ marginTop: '6px', fontSize: '12px', padding: '6px 12px' }}
                onClick={handleAddRule}
            >
                {isExit ? '+ Add exit rule' : '+ Add entry rule'}
            </button>
        </div>
    );
}
