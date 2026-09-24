'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/strategyStudio.module.scss';
import { ChevronDownIcon } from './StudioIcons';

export default function CustomSelect({
    value,
    onChange,
    options = [],
    placeholder = 'Select option...',
    width = 'auto',
    align = 'left'
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Normalize options format: array of strings or { value, label }
    const normalizedOptions = options.map((opt) => {
        if (typeof opt === 'string') {
            return { value: opt, label: opt };
        }
        return opt;
    });

    const selectedOption = normalizedOptions.find(
        (opt) => opt.value === value || String(opt.value) === String(value)
    ) || {
        value,
        label: value || placeholder
    };

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div
            className={styles.customSelectContainer}
            ref={dropdownRef}
            style={{ width }}
        >
            <button
                type="button"
                className={`${styles.customSelectTrigger} ${isOpen ? styles.open : ''}`}
                onClick={() => setIsOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className={styles.customSelectValue}>
                    {selectedOption.label || placeholder}
                </span>
                <span className={`${styles.customSelectChevron} ${isOpen ? styles.rotate : ''}`}>
                    <ChevronDownIcon size={13} />
                </span>
            </button>

            {isOpen && (
                <div
                    className={`${styles.customSelectMenu} ${align === 'right' ? styles.alignRight : ''}`}
                    role="listbox"
                >
                    {normalizedOptions.map((opt) => {
                        const isSelected = opt.value === value || String(opt.value) === String(value);
                        return (
                            <div
                                key={opt.value}
                                className={`${styles.customSelectOption} ${isSelected ? styles.selected : ''}`}
                                onClick={() => handleSelect(opt.value)}
                                role="option"
                                aria-selected={isSelected}
                            >
                                <span>{opt.label}</span>
                                {isSelected && (
                                    <span className={styles.selectedDot} />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
