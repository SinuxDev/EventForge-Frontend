'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AuthModal } from '@/components/shared/auth-modal';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { toast } from '@/hooks/use-toast';
import { getPostLoginRoute } from '@/lib/auth-redirect';

const quickStats = [
  { label: 'Events live this week', value: '1,204' },
  { label: 'Average RSVP conversion', value: '87%' },
  { label: 'Time to launch', value: '24 min' },
];

const trustedBy = [
  'Signalbridge',
  'Northstar Labs',
  'Eastline Studios',
  'Orbit Community',
  'Lumen House',
  'Verve Collective',
];

const workflowSteps = [
  {
    step: '01',
    title: 'Create',
    description: 'Launch your event page, schedule, and registration flow in minutes.',
  },
  {
    step: '02',
    title: 'Invite',
    description: 'Share one link across email and social with built-in RSVP tracking.',
  },
  {
    step: '03',
    title: 'Track',
    description: 'Monitor attendance, conversion, and live engagement from one dashboard.',
  },
];

function AnvilLogo() {
  return (
    <svg viewBox="0 0 64 64" className="h-8 w-8" role="img" aria-label="EventForge logo">
      <defs>
        <linearGradient id="eventForgeLogoGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6A1B9A" />
          <stop offset="100%" stopColor="#2196F3" />
        </linearGradient>
      </defs>
      <rect x="8" y="33" width="48" height="12" rx="6" fill="url(#eventForgeLogoGradient)" />
      <rect x="12" y="43" width="40" height="9" rx="4" fill="#12131a" />
      <path
        d="M10 33c3-9 11-14 21-14h12c3 0 5-2 5-5V9h6v7c0 7-5 12-12 12H31c-6 0-11 2-14 5H10z"
        fill="url(#eventForgeLogoGradient)"
      />
      <rect x="43" y="9" width="6" height="8" fill="#12131a" />
      <rect x="40" y="10" width="3" height="13" fill="#12131a" />
    </svg>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-130">
      <div className="absolute inset-0 -z-10 rounded-full bg-radial from-accent/28 via-primary/14 to-transparent blur-2xl" />
      <div className="relative overflow-hidden rounded-full border border-border bg-card p-8 shadow-[0_28px_80px_rgba(0,0,0,0.2)] dark:shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
        <div className="mx-auto max-w-82.5 rounded-[2.2rem] border border-border bg-background p-3 shadow-[0_12px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          <div className="rounded-[1.8rem] bg-linear-to-b from-primary/25 via-background to-muted p-4">
            <div className="mb-4 h-28 rounded-2xl bg-linear-to-br from-[#ff69b4]/55 via-[#6a1b9a]/50 to-[#2196f3]/40" />
            <div className="space-y-2">
              <p className="font-semibold text-foreground">Global Product Summit</p>
              <p className="text-xs text-muted-foreground">Thu, Oct 10 · 9:00 AM · New York</p>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-card/85 px-3 py-2">
              <span className="text-[11px] text-muted-foreground">Live RSVP feed</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                +42 in last hour
              </span>
            </div>
          </div>
        </div>

        <div className="absolute left-6 top-14 rounded-full border border-border bg-background/85 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
          92K RSVPs this month
        </div>
        <div className="absolute bottom-12 right-4 rounded-full border border-border bg-background/85 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
          Multi-venue ready
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && Boolean(session?.user?.email);

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

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      toast({ title: 'Please sign in to continue', variant: 'destructive' });
      return;
    }

    const role = session?.user?.role ?? 'attendee';
    router.push(getPostLoginRoute(role));
  };

  const handleBookDemo = () => {
    router.push('/book-demo');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(33,150,243,0.1),transparent_42%),radial-gradient(circle_at_75%_24%,rgba(255,105,180,0.08),transparent_45%),radial-gradient(circle_at_52%_80%,rgba(0,168,150,0.08),transparent_40%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(33,150,243,0.2),transparent_42%),radial-gradient(circle_at_75%_24%,rgba(255,105,180,0.16),transparent_45%),radial-gradient(circle_at_52%_80%,rgba(0,168,150,0.14),transparent_40%)]" />
        <div className="absolute inset-0 bg-linear-to-b from-white/35 via-transparent to-background dark:from-white/6" />
      </div>

      <header
        className={`sticky top-0 z-20 transition-all duration-300 ${
          isScrolled ? 'bg-background/84 backdrop-blur-xl' : 'bg-background/55 backdrop-blur-md'
        }`}
      >
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-6">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground"
          >
            <AnvilLogo />
            <span>EventForge</span>
          </a>

          <div className="flex items-center gap-3 text-xs text-muted-foreground sm:gap-4 sm:text-sm">
            <span className="hidden sm:inline" suppressHydrationWarning>
              {timezoneLabel}
            </span>
            <Link href="/events" className="hidden transition hover:text-foreground sm:inline">
              Explore Events ↗
            </Link>
            <ThemeToggle />
            {status === 'loading' ? (
              <button
                className="relative cursor-default overflow-hidden rounded-full border border-border bg-card/80 px-4 py-2 font-medium text-foreground/70 shadow-[0_4px_18px_rgba(0,0,0,0.16)]"
                aria-hidden="true"
                tabIndex={-1}
              >
                Loading...
              </button>
            ) : isAuthenticated ? (
              <button
                onClick={handleSignOut}
                className="relative cursor-pointer overflow-hidden rounded-full border border-border bg-card/80 px-4 py-2 font-medium text-foreground shadow-[0_4px_18px_rgba(0,0,0,0.16)] transition-all duration-200 ease-out before:absolute before:inset-y-0 before:-left-10 before:w-8 before:rotate-12 before:bg-white/35 before:opacity-0 hover:-translate-y-0.5 hover:border-ring/45 hover:bg-muted hover:before:left-[115%] hover:before:opacity-100 hover:before:transition-all hover:before:duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 active:translate-y-0 active:scale-[0.99]"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="relative cursor-pointer overflow-hidden rounded-full border border-border bg-card/80 px-4 py-2 font-medium text-foreground shadow-[0_4px_18px_rgba(0,0,0,0.16)] transition-all duration-200 ease-out before:absolute before:inset-y-0 before:-left-10 before:w-8 before:rotate-12 before:bg-white/35 before:opacity-0 hover:-translate-y-0.5 hover:border-ring/45 hover:bg-muted hover:before:left-[115%] hover:before:opacity-100 hover:before:transition-all hover:before:duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 active:translate-y-0 active:scale-[0.99]"
              >
                Sign In
              </button>
            )}
          </div>
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 pt-8 md:px-6 md:pt-16">
        <section className="grid items-center gap-12 md:grid-cols-[1fr_1.1fr] md:gap-10">
          <div className="max-w-xl space-y-7 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/75 px-3 py-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Enterprise event operations platform
            </div>

            <h1 className="text-[2.45rem] leading-[1.05] font-bold tracking-tight sm:text-5xl md:text-6xl md:leading-[1.02]">
              Run high-impact events
              <br />
              <span className="bg-linear-to-r from-[#5e76ff] via-[#FF69B4] to-[#ff8f32] bg-clip-text text-transparent">
                with total control.
              </span>
            </h1>

            <p className="max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
              EventForge centralizes planning, registration, and live RSVP intelligence so your team
              can launch faster and execute with confidence.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleGetStarted}
                className="relative cursor-pointer overflow-hidden rounded-xl bg-primary px-7 py-3 text-base font-semibold text-primary-foreground shadow-[0_10px_28px_rgba(0,168,150,0.32)] transition-all duration-200 ease-out before:absolute before:inset-y-0 before:-left-10 before:w-10 before:rotate-12 before:bg-white/50 before:opacity-0 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_14px_36px_rgba(0,168,150,0.36)] hover:before:left-[115%] hover:before:opacity-100 hover:before:transition-all hover:before:duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 active:translate-y-0 active:scale-[0.99]"
              >
                Get Started Free
              </button>
              <button
                onClick={handleBookDemo}
                className="cursor-pointer rounded-xl border border-border bg-card/80 px-5 py-3 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:border-ring/40 hover:bg-muted"
              >
                Book Demo
              </button>
            </div>

            <div className="rounded-xl border border-primary/30 bg-linear-to-r from-primary/10 via-card/90 to-accent/10 p-3.5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.14em] text-primary">
                Email notice support
              </p>
              <p className="mt-1 text-sm text-foreground">
                Got a warning or suspension email from EventForge? Check Help first, then submit an
                appeal if needed.
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <Link
                  href="/help"
                  className="rounded-lg border border-border bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-ring/35 hover:bg-muted"
                >
                  Open Help
                </Link>
                <Link
                  href="/appeal"
                  className="rounded-lg border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
                >
                  Submit Appeal
                </Link>
                <Link
                  href="/policy"
                  className="text-xs font-medium text-muted-foreground underline-offset-2 transition hover:text-foreground hover:underline"
                >
                  Review policy
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
              <span className="rounded-full border border-border bg-card/70 px-3 py-1">
                No credit card required
              </span>
              <span className="rounded-full border border-border bg-card/70 px-3 py-1">
                SOC-ready workflows
              </span>
              <span className="rounded-full border border-border bg-card/70 px-3 py-1">
                24 min average setup
              </span>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
            <HeroVisual />
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-border bg-card/75 p-3 backdrop-blur md:mt-20 md:p-4">
          <div className="grid gap-0 overflow-hidden rounded-xl border border-border/70 bg-background/25 sm:grid-cols-3">
            {quickStats.map((item, index) => (
              <div
                key={item.label}
                className={`space-y-1 px-5 py-4 text-center sm:py-5 ${
                  index < quickStats.length - 1
                    ? 'border-b border-border/70 sm:border-b-0 sm:border-r'
                    : ''
                }`}
              >
                <p className="text-xl font-semibold text-foreground md:text-2xl">{item.value}</p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <p className="text-center text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Trusted by modern event teams
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {trustedBy.map((brand) => (
              <span
                key={brand}
                className="rounded-full border border-border bg-card/65 px-4 py-2 text-xs font-medium text-muted-foreground transition hover:border-ring/35 hover:text-foreground"
              >
                {brand}
              </span>
            ))}
            <span className="rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">
              92K RSVPs processed this month
            </span>
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-border bg-card/70 p-5 md:mt-14 md:p-6">
          <div className="relative grid gap-6 md:grid-cols-3 md:gap-5">
            <div className="pointer-events-none absolute left-8 right-8 top-4 hidden border-t border-border md:block" />
            {workflowSteps.map((item) => (
              <article
                key={item.step}
                className="rounded-xl border border-border bg-background/75 p-4 backdrop-blur"
              >
                <p className="text-xs font-semibold tracking-[0.16em] text-accent">{item.step}</p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-5 text-center text-xs text-muted-foreground">
            No code, no clutter, no tool-hopping.
          </p>
        </section>
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
