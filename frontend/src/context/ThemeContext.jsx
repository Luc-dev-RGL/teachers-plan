import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(undefined);

export function FournisseurTheme({ enfants }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const basculerTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, basculerTheme }}>
      {enfants}
    </ThemeContext.Provider>
  );
}

export function utiliserTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('utiliserTheme doit être utilisé dans un FournisseurTheme');
  }
  return context;
}