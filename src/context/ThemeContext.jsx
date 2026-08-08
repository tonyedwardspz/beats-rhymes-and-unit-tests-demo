import { createContext, useContext, useEffect, useState } from 'react';
import { applyTheme, getStoredTheme } from '../lib/theme.js';

const ThemeContext = createContext({
  theme: 'light',
  darkMode: false,
  setDarkMode: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setDarkMode = (enabled) => {
    setTheme(enabled ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        darkMode: theme === 'dark',
        setDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
