'use client';

import * as React from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

export type ThemeType = 'light' | 'dark' | 'system';

export interface ThemeProviderState {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  systemTheme: 'light' | 'dark';
  actualTheme: 'light' | 'dark';
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeType;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  systemTheme: 'light',
  actualTheme: 'light',
};

export const ThemeProviderContext =
  createContext<ThemeProviderState>(initialState);

/**
 * ThemeProvider component for managing application theme
 *
 * @example
 * ```
 * function App() {
 *   return (
 *     <ThemeProvider
 *       defaultTheme="system"
 *       storageKey="ui-theme"
 *       attribute="class"
 *       enableSystem
 *     >
 *       <YourApp />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
  attribute = 'class',
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps): JSX.Element {
  const [theme, setThemeState] = useState<ThemeType>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Get actual theme considering system preference
  const actualTheme = theme === 'system' ? systemTheme : theme;

  // Update theme in DOM and localStorage
  const applyTheme = useCallback(
    (newTheme: ThemeType): void => {
      const root = window.document.documentElement;
      const actualNewTheme = newTheme === 'system' ? systemTheme : newTheme;

      // Remove existing theme classes
      root.classList.remove('light', 'dark');

      if (attribute === 'class') {
        root.classList.add(actualNewTheme);
      } else {
        root.setAttribute(attribute, actualNewTheme);
      }

      // Optionally disable transitions during theme change
      if (disableTransitionOnChange) {
        const css = document.createElement('style');
        css.appendChild(
          document.createTextNode(
            '*, *::before, *::after { transition: none !important; animation-duration: 0.01ms !important; animation-delay: 0s !important; }'
          )
        );
        document.head.appendChild(css);

        window.getComputedStyle(document.body);

        setTimeout(() => {
          document.head.removeChild(css);
        }, 1);
      }
    },
    [systemTheme, attribute, disableTransitionOnChange]
  );

  const setTheme = (newTheme: ThemeType): void => {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem) {
      return;
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const updateSystemTheme = (): void => {
      const isDark = media.matches;
      setSystemTheme(isDark ? 'dark' : 'light');

      // If currently using system theme, apply the change
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    // Set initial system theme
    updateSystemTheme();

    // Listen for changes
    if (media.addEventListener) {
      media.addEventListener('change', updateSystemTheme);
    } else {
      // Fallback for older browsers
      media.addListener(updateSystemTheme);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', updateSystemTheme);
      } else {
        media.removeListener(updateSystemTheme);
      }
    };
  }, [theme, enableSystem, applyTheme]);

  // Initialize theme from localStorage and apply it
  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey) as ThemeType;
    const initialTheme = storedTheme || defaultTheme;

    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);
  }, [defaultTheme, storageKey, applyTheme]);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  const value: ThemeProviderState = {
    theme,
    setTheme,
    systemTheme,
    actualTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

/**
 * Hook to use theme context
 * Must be used within ThemeProvider
 */
export function useThemeProvider(): ThemeProviderState {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useThemeProvider must be used within a ThemeProvider');
  }

  return context;
}
