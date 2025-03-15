'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { green } from '@mui/material/colors';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Check if localStorage is available (client-side)
  const isClient = typeof window !== 'undefined';
  
  // Get saved theme from localStorage or default to 'light'
  const getSavedTheme = (): ThemeMode => {
    if (isClient) {
      const savedTheme = localStorage.getItem('themeMode');
      return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'light';
    }
    return 'light';
  };

  const [mode, setMode] = useState<ThemeMode>(getSavedTheme());

  // Create theme based on current mode
  const theme = createTheme({
    palette: {
      mode,
      primary: {
        // Use green[600] for both light and dark modes
        main: green[600],
      },
      secondary: {
        main: '#dc004e',
      },
      ...(mode === 'dark' && {
        background: {
          default: '#121212',
          paper: '#1e1e1e',
        },
      }),
    },
    typography: {
      fontFamily: 'var(--font-geist)',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: green[600],
            color: 'white',
          },
        },
      },
    },
  });

  // Toggle between light and dark mode
  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    if (isClient) {
      localStorage.setItem('themeMode', newMode);
    }
  };

  // Effect to handle system preference changes
  useEffect(() => {
    if (!isClient) return;
    
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('themeMode');
    if (savedTheme) return; // User has a preference, don't override
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setMode(e.matches ? 'dark' : 'light');
    };
    
    // Set initial value based on system preference
    if (mediaQuery.matches && !savedTheme) {
      setMode('dark');
    }
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
} 