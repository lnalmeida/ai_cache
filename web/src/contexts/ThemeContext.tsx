import { createContext } from 'react';


interface ThemeContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);



  