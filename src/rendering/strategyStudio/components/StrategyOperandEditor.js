'use client';

import React from 'react';
import styles from '../styles/strategyStudio.module.scss';

export function getDefaultParamsForIndicator(indicatorSpec) {
    const params = {};
    if (!indicatorSpec?.params) return params;
    indicatorSpec.params.forEach((p) => {
        params[p.name] = p.default;
    });
    return params;
}

export default function StrategyOperandEditor({
    operand,
    indicatorGroups = [],
    indIndex = {},
    onChange,
}) {
    if (!operand) return null;

    const currentName = operand.name || 'close';
    const spec = indIndex[currentName] || { params: [], hint: '' };
    const currentParams = operand.parameters || {};

    const handleIndicatorChange = (e) => {
        const nextName = e.target.value;
        const nextSpec = indIndex[nextName];
        const nextParams = getDefaultParamsForIndicator(nextSpec);
        onChange({
            ...operand,
            name: nextName,
            parameters: nextParams,
        });
    };

    const handleParamChange = (paramSpec, rawValue) => {
        let val = rawValue;
        if (paramSpec.type === 'int') {
            val = parseInt(rawValue, 10);
            if (isNaN(val)) val = paramSpec.default ?? 0;
        } else if (paramSpec.type === 'float') {
            val = parseFloat(rawValue);
            if (isNaN(val)) val = paramSpec.default ?? 0;
        } else if (paramSpec.type === 'select') {
            val = /^-?\d+$/.test(rawValue) ? parseInt(rawValue, 10) : rawValue;
        }

        onChange({
            ...operand,
            parameters: {
                ...currentParams,
                [paramSpec.name]: val,
            },
        });
    };

    return (
        <div className={styles.operandWrap}>
            {/* Grouped Indicator Select */}
            <select
                className={styles.composerInput}
                value={currentName}
                onChange={handleIndicatorChange}
                style={{ width: '100%', marginBottom: '6px' }}
            >
                {indicatorGroups.map((g, gIdx) => (
                    <optgroup key={gIdx} label={g.group}>
                        {(g.indicators || []).map((ind) => (
                            <option key={ind.name} value={ind.name}>
                                {ind.label || ind.name}
                            </option>
                        ))}
                    </optgroup>
                ))}
            </select>

            {/* Dynamic Params Based on Indicator Spec */}
            {spec.params && spec.params.length > 0 && (
                <div className={styles.paramsRow}>
                    {spec.params.map((p) => {
                        const val = currentParams[p.name] ?? p.default;
                        if (p.type === 'select') {
                            const options = (p.options || []).map((o) =>
                                typeof o === 'object' ? o : { value: o, label: String(o) }
                            );
                            return (
                                <label key={p.name}>
                                    <span>{p.label || p.name}</span>
                                    <select
                                        value={val ?? ''}
                                        onChange={(e) => handleParamChange(p, e.target.value)}
                                    >
                                        {options.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            );
                        }

                        const step = p.type === 'int' ? '1' : 'any';
                        return (
                            <label key={p.name}>
                                <span>{p.label || p.name}</span>
                                <input
                                    type="number"
                                    step={step}
                                    min={p.min}
                                    max={p.max}
                                    value={val ?? ''}
                                    onChange={(e) => handleParamChange(p, e.target.value)}
                                />
                            </label>
                        );
                    })}
                </div>
            )}

            {spec.hint ? <div className={styles.fieldHint}>{spec.hint}</div> : null}
        </div>
    );
}
