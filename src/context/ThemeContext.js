'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

const ThemeContext = createContext({
    theme: 'dark',
    toggleTheme: () => { },
    setTheme: () => { },
});

export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState('dark');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setThemeState(savedTheme);
        applyTheme(savedTheme);
    }, []);

    const applyTheme = (newTheme) => {
        const root = document.documentElement;
        if (newTheme === 'light') {
            root.classList.remove('dark');
            root.classList.add('light');
            root.setAttribute('data-theme', 'light');
        } else {
            root.classList.remove('light');
            root.classList.add('dark');
            root.setAttribute('data-theme', 'dark');
        }
        localStorage.setItem('theme', newTheme);
    };

    /**
     * Executes circular reveal transition originating from the button center
     */
    const executeThemeTransition = (nextTheme, event) => {
        if (typeof window === 'undefined') {
            setThemeState(nextTheme);
            applyTheme(nextTheme);
            return;
        }

        // Calculate origin coordinate (center of clicked button or event coordinate)
        let x = Math.round(window.innerWidth - 80);
        let y = 35;

        if (event) {
            const targetEl = event.currentTarget || (event.target && event.target.closest('button')) || event.target;
            if (targetEl && typeof targetEl.getBoundingClientRect === 'function') {
                const rect = targetEl.getBoundingClientRect();
                x = Math.round(rect.left + rect.width / 2);
                y = Math.round(rect.top + rect.height / 2);
            } else if (typeof event.clientX === 'number' && event.clientX > 0) {
                x = Math.round(event.clientX);
                y = Math.round(event.clientY);
            }
        }

        const endRadius = Math.ceil(
            Math.hypot(
                Math.max(x, window.innerWidth - x),
                Math.max(y, window.innerHeight - y)
            )
        );

        // Feed exact pixel coordinates into CSS keyframe animation
        document.documentElement.style.setProperty('--theme-x', `${x}px`);
        document.documentElement.style.setProperty('--theme-y', `${y}px`);
        document.documentElement.style.setProperty('--theme-r', `${endRadius}px`);

        const isViewTransitionSupported =
            typeof document !== 'undefined' &&
            typeof document.startViewTransition === 'function' &&
            !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Native View Transition API (Chrome, Edge, Safari 18+, Opera)
        if (isViewTransitionSupported) {
            try {
                const transition = document.startViewTransition(() => {
                    try {
                        flushSync(() => {
                            setThemeState(nextTheme);
                        });
                    } catch (_) {
                        setThemeState(nextTheme);
                    }
                    applyTheme(nextTheme);
                });

                transition.ready.then(() => {
                    try {
                        document.documentElement.animate(
                            {
                                clipPath: [
                                    `circle(0px at ${x}px ${y}px)`,
                                    `circle(${endRadius}px at ${x}px ${y}px)`
                                ]
                            },
                            {
                                duration: 650,
                                easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
                                pseudoElement: '::view-transition-new(root)',
                            }
                        );
                    } catch (_) {
                        // Handled natively by @keyframes theme-circle-grow in globalsBase.css
                    }
                }).catch(() => {
                    setThemeState(nextTheme);
                    applyTheme(nextTheme);
                });
                return;
            } catch (_) {
                // Fallback to direct apply if transition throws
            }
        }

        // Fallback expanding circle overlay for browsers without View Transition API
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = `${y}px`;
        overlay.style.left = `${x}px`;
        overlay.style.width = '0px';
        overlay.style.height = '0px';
        overlay.style.borderRadius = '50%';
        overlay.style.transform = 'translate(-50%, -50%)';
        overlay.style.backgroundColor = nextTheme === 'dark' ? '#07090E' : '#F8FAFC';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '999999';
        overlay.style.transition = 'width 500ms cubic-bezier(0.25, 1, 0.5, 1), height 500ms cubic-bezier(0.25, 1, 0.5, 1), opacity 200ms ease';
        overlay.style.boxShadow = `0 0 50px ${nextTheme === 'dark' ? 'rgba(24, 201, 139, 0.3)' : 'rgba(5, 150, 105, 0.2)'}`;

        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.style.width = `${endRadius * 2.2}px`;
            overlay.style.height = `${endRadius * 2.2}px`;
        });

        setTimeout(() => {
            setThemeState(nextTheme);
            applyTheme(nextTheme);
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 220);
        }, 420);
    };

    const setTheme = (newTheme, event) => {
        if (newTheme === theme) return;
        executeThemeTransition(newTheme, event);
    };

    const toggleTheme = (event) => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        executeThemeTransition(nextTheme, event);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
