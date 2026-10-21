'use client';

import React from 'react';
import styles from '../styles/strategyStudio.module.scss';
import StrategyOperandEditor, { getDefaultParamsForIndicator } from './StrategyOperandEditor';

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
                <select
                    value={cond.condition_type || (isExit ? 'any' : 'all')}
                    onChange={handleConditionTypeChange}
                >
                    {conditionTypes.map((ct) => (
                        <option key={ct.value} value={ct.value}>
                            {ct.label}
                        </option>
                    ))}
                </select>
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
                        <select
                            value={rule.operator || '>'}
                            onChange={(e) =>
                                handleUpdateRule(idx, { ...rule, operator: e.target.value })
                            }
                        >
                            {operators.map((op) => (
                                <option key={op.value} value={op.value}>
                                    {op.label}
                                </option>
                            ))}
                        </select>
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
