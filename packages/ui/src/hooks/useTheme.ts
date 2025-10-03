'use client';

import { useContext, useEffect, useState } from 'react';
import { ThemeProviderContext } from '../providers/ThemeProvider';

export type ThemeType = 'light' | 'dark' | 'system';

export interface UseThemeResult {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  mounted: boolean;
}

/**
 * Hook para gerenciar tema da aplicação
 *
 * @returns {UseThemeResult} Objeto com theme atual, setter, toggle e estado mounted
 *
 * @example
 * ```
 * function ThemeToggle() {
 *   const { theme, toggleTheme, mounted } = useTheme();
 *
 *   if (!mounted) return <ThemeSkeleton />;
 *
 *   return (
 *     <button onClick={toggleTheme}>
 *       {theme === 'dark' ? '🌙' : '☀️'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useTheme(): UseThemeResult {
  const context = useContext(ThemeProviderContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  const { theme, setTheme } = context;
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = (): void => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    mounted,
  };
}
