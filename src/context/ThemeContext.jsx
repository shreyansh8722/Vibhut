import React, { createContext, useState, useContext, useEffect } from 'react';

// Explicitly export context
export const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};

// Explicitly export provider
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light'); // 'light' is default for Vishwanatham

  // Simple theme toggle logic (extend if dark mode is needed)
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Default export if needed
export default ThemeProvider;