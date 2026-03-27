'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { ThemeToggle } from '@/components/shared/theme-toggle';

function AnvilLogo() {
  return (
    <svg viewBox="0 0 64 64" className="h-8 w-8" role="img" aria-label="EventForge logo">
      <defs>
        <linearGradient id="eventForgeLogoGradientShared" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6A1B9A" />
          <stop offset="100%" stopColor="#2196F3" />
        </linearGradient>
      </defs>
      <rect x="8" y="33" width="48" height="12" rx="6" fill="url(#eventForgeLogoGradientShared)" />
      <rect x="12" y="43" width="40" height="9" rx="4" fill="#12131a" />
      <path
        d="M10 33c3-9 11-14 21-14h12c3 0 5-2 5-5V9h6v7c0 7-5 12-12 12H31c-6 0-11 2-14 5H10z"
        fill="url(#eventForgeLogoGradientShared)"
      />
      <rect x="43" y="9" width="6" height="8" fill="#12131a" />
      <rect x="40" y="10" width="3" height="13" fill="#12131a" />
    </svg>
  );
}

export function PublicHeader() {
  const { data: session, status } = useSession();
  const [now, setNow] = useState(() => new Date());
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const timezoneLabel = useMemo(() => {
    const timeLabel = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now);

    const totalOffsetMinutes = -now.getTimezoneOffset();
    const sign = totalOffsetMinutes >= 0 ? '+' : '-';
    const absoluteMinutes = Math.abs(totalOffsetMinutes);
    const offsetHours = String(Math.floor(absoluteMinutes / 60)).padStart(2, '0');
    const offsetMinutes = String(absoluteMinutes % 60).padStart(2, '0');

    return `${timeLabel} GMT${sign}${offsetHours}:${offsetMinutes}`;
  }, [now]);

  return (
    <header
      className={`sticky top-0 z-20 transition-all duration-300 ${
        isScrolled ? 'bg-background/84 backdrop-blur-xl' : 'bg-background/55 backdrop-blur-md'
      }`}
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-foreground"
        >
          <AnvilLogo />
          <span>EventForge</span>
        </Link>

        <div className="flex items-center gap-3 text-xs text-muted-foreground sm:gap-4 sm:text-sm">
          <span className="hidden sm:inline">{timezoneLabel}</span>
          <ThemeToggle />

          {status === 'loading' ? (
            <button
              className="relative cursor-default overflow-hidden rounded-full border border-border bg-card/80 px-4 py-2 font-medium text-foreground/70 shadow-[0_4px_18px_rgba(0,0,0,0.16)]"
              aria-hidden="true"
              tabIndex={-1}
            >
              Loading...
            </button>
          ) : session?.user?.email ? (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="relative cursor-pointer overflow-hidden rounded-full border border-border bg-card/80 px-4 py-2 font-medium text-foreground shadow-[0_4px_18px_rgba(0,0,0,0.16)] transition-all duration-200 ease-out before:absolute before:inset-y-0 before:-left-10 before:w-8 before:rotate-12 before:bg-white/35 before:opacity-0 hover:-translate-y-0.5 hover:border-ring/45 hover:bg-muted hover:before:left-[115%] hover:before:opacity-100 hover:before:transition-all hover:before:duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 active:translate-y-0 active:scale-[0.99]"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/"
              className="relative cursor-pointer overflow-hidden rounded-full border border-border bg-card/80 px-4 py-2 font-medium text-foreground shadow-[0_4px_18px_rgba(0,0,0,0.16)] transition-all duration-200 ease-out before:absolute before:inset-y-0 before:-left-10 before:w-8 before:rotate-12 before:bg-white/35 before:opacity-0 hover:-translate-y-0.5 hover:border-ring/45 hover:bg-muted hover:before:left-[115%] hover:before:opacity-100 hover:before:transition-all hover:before:duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 active:translate-y-0 active:scale-[0.99]"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
