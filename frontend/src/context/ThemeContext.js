import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle(
      'dark',
      theme === 'dark'
    );

    localStorage.setItem(
      'theme',
      theme
    );
  }, [theme]);

  const value = useMemo(() => {
    const toggleTheme = () => {
      setTheme((currentTheme) =>
        currentTheme === 'dark'
          ? 'light'
          : 'dark'
      );
    };

    return {
      theme,
      isDark: theme === 'dark',
      toggleTheme
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
