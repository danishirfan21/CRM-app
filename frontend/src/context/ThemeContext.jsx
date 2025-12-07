import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to light
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      // If no saved preference, check system preference
      if (!saved) {
        const prefersDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;
        return prefersDark ? 'dark' : 'light';
      }
      return saved;
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove both classes first to ensure clean state
    root.classList.remove('dark', 'light');

    // Add the current theme class
    if (theme === 'dark') {
      root.classList.add('dark');
    }

    // Save to localStorage
    localStorage.setItem('theme', theme);

    console.log('Theme applied:', theme, 'Classes:', root.classList.value);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      console.log('Toggling theme from', prev, 'to', newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, isDark: theme === 'dark' }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
