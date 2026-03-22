'use client';

import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/ui-store';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const setTheme = useUiStore((state) => state.setTheme);
  const handleToggle = () => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label="Toggle dark mode"
      className={cn(
        'relative inline-flex h-7 w-14 items-center overflow-hidden rounded-full border border-border/70 bg-linear-to-r from-[#e7c400] via-[#a8c4a4] to-[#61aef3] shadow-[0_6px_16px_rgba(0,0,0,0.14)] transition-[background,box-shadow] duration-300 dark:from-[#2b63ff] dark:via-[#5a2fc5] dark:to-[#ad00d7] dark:shadow-[0_6px_16px_rgba(0,0,0,0.3)]',
        className
      )}
      suppressHydrationWarning
    >
      <span className="pointer-events-none absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-[0_4px_10px_rgba(0,0,0,0.22)] transition-transform duration-300 dark:translate-x-7 dark:bg-black" />

      <Sun className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-white opacity-100 transition-all duration-200 dark:translate-x-1 dark:opacity-0" />
      <Moon className="pointer-events-none absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-white opacity-0 transition-all duration-200 dark:opacity-100" />

      <span className="sr-only">Theme toggle</span>
    </button>
  );
}
