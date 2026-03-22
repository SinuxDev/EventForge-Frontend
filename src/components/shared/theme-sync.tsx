'use client';

import { useEffect } from 'react';
import { useUiStore } from '@/stores/ui-store';

function resolveTheme(theme: 'light' | 'dark' | 'system'): 'light' | 'dark' {
  if (theme === 'light' || theme === 'dark') {
    return theme;
  }

  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

export function ThemeSync() {
  const theme = useUiStore((state) => state.theme);
  const hasHydrated =
    typeof window !== 'undefined'
      ? useUiStore.persist
        ? useUiStore.persist.hasHydrated()
        : true
      : false;

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const resolvedTheme = resolveTheme(theme);
      root.classList.toggle('dark', resolvedTheme === 'dark');
      root.dataset.theme = resolvedTheme;
    };

    applyTheme();

    if (theme !== 'system') {
      return;
    }

    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [theme, hasHydrated]);

  return null;
}
