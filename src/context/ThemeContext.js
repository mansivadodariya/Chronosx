'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
    theme: 'dark',
    toggleTheme: () => {},
    setTheme: () => {},
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

    const setTheme = (newTheme) => {
        setThemeState(newTheme);
        applyTheme(newTheme);
    };

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
