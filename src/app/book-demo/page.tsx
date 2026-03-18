'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';
import { demoRequestSchema, type DemoRequestInput } from '@/lib/schemas/demo-request.schema';

const TEAM_SIZE_OPTIONS = ['1-10', '11-50', '51-200', '201-1000', '1000+'];

const USE_CASE_OPTIONS = [
  'Corporate events',
  'Community events',
  'Multi-venue conferences',
  'Internal team events',
  'Other',
];

function AnvilLogo() {
  return (
    <svg viewBox="0 0 64 64" className="h-8 w-8" role="img" aria-label="EventForge logo">
      <defs>
        <linearGradient id="eventForgeLogoGradientDemo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6A1B9A" />
          <stop offset="100%" stopColor="#2196F3" />
        </linearGradient>
      </defs>
      <rect x="8" y="33" width="48" height="12" rx="6" fill="url(#eventForgeLogoGradientDemo)" />
      <rect x="12" y="43" width="40" height="9" rx="4" fill="#12131a" />
      <path
        d="M10 33c3-9 11-14 21-14h12c3 0 5-2 5-5V9h6v7c0 7-5 12-12 12H31c-6 0-11 2-14 5H10z"
        fill="url(#eventForgeLogoGradientDemo)"
      />
      <rect x="43" y="9" width="6" height="8" fill="#12131a" />
      <rect x="40" y="10" width="3" height="13" fill="#12131a" />
    </svg>
  );
}

export default function BookDemoPage() {
  const { data: session, status } = useSession();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const defaults = useMemo(
    () => ({
      fullName: session?.user?.name ?? '',
      workEmail: session?.user?.email ?? '',
      company: '',
      role: '',
      teamSize: '',
      useCase: '',
    }),
    [session?.user?.email, session?.user?.name]
  );

  const form = useForm<DemoRequestInput>({
    resolver: zodResolver(demoRequestSchema),
    values: defaults,
  });

  const isAuthenticated = status === 'authenticated' && Boolean(session?.user?.email);

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

  const onSubmit = async (values: DemoRequestInput) => {
    setIsSaving(true);
    try {
      await apiClient.post('/demo-requests', {
        ...values,
        source: isAuthenticated ? 'authenticated-website' : 'public-website',
      });

      setIsSubmitted(true);
      toast({ title: 'Demo request submitted successfully' });
    } catch {
      toast({ title: 'Unable to submit demo request', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d13] text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(33,150,243,0.2),transparent_42%),radial-gradient(circle_at_75%_24%,rgba(255,105,180,0.16),transparent_45%),radial-gradient(circle_at_52%_80%,rgba(0,168,150,0.14),transparent_40%)]" />
        <div className="absolute inset-0 bg-linear-to-b from-white/6 via-transparent to-[#0b0d13]" />
      </div>

      <header
        className={`sticky top-0 z-20 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0b0d13]/88 shadow-[0_1px_0_rgba(18,20,30,0.85)] backdrop-blur-xl'
            : 'bg-[#0b0d13]/35 backdrop-blur-md'
        }`}
      >
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/90"
          >
            <AnvilLogo />
            <span>EventForge</span>
          </Link>

          <div className="flex items-center gap-3 text-xs text-white/65 sm:gap-6 sm:text-sm">
            <span className="hidden sm:inline">{timezoneLabel}</span>
            <Link href="/#" className="hidden transition hover:text-white sm:inline">
              Explore Events ↗
            </Link>
            {isAuthenticated ? (
              <button
                onClick={handleSignOut}
                className="relative cursor-pointer overflow-hidden rounded-full border border-white/15 bg-white/10 px-4 py-2 font-medium text-white shadow-[0_4px_18px_rgba(0,0,0,0.28)] transition-all duration-200 ease-out before:absolute before:inset-y-0 before:-left-10 before:w-8 before:rotate-12 before:bg-white/30 before:opacity-0 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/18 hover:shadow-[0_10px_28px_rgba(255,255,255,0.16)] hover:before:left-[115%] hover:before:opacity-100 hover:before:transition-all hover:before:duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 active:translate-y-0 active:scale-[0.99]"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/"
                className="relative cursor-pointer overflow-hidden rounded-full border border-white/15 bg-white/10 px-4 py-2 font-medium text-white shadow-[0_4px_18px_rgba(0,0,0,0.28)] transition-all duration-200 ease-out before:absolute before:inset-y-0 before:-left-10 before:w-8 before:rotate-12 before:bg-white/30 before:opacity-0 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/18 hover:shadow-[0_10px_28px_rgba(255,255,255,0.16)] hover:before:left-[115%] hover:before:opacity-100 hover:before:transition-all hover:before:duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 active:translate-y-0 active:scale-[0.99]"
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 pt-10 md:px-6 md:pt-14">
        <section className="mb-8 rounded-2xl border border-white/12 bg-white/5 p-5 backdrop-blur md:p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-white/55">Book Demo</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">
            See EventForge in your workflow
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/72 md:text-base">
            We will walk you through event setup, registration, live RSVP monitoring, and team
            operations in a focused 20-minute session.
          </p>
        </section>

        <section className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-white/12 bg-white/5 p-6 backdrop-blur">
            <div className="space-y-2 text-sm text-white/70">
              <p className="font-medium text-white/85">What to expect:</p>
              <ul className="space-y-2 text-white/65">
                <li>• Tailored walkthrough for your event model</li>
                <li>• Compliance and operational readiness overview</li>
                <li>• Q&A with implementation guidance</li>
              </ul>
            </div>

            <div className="mt-6 rounded-xl border border-[#00A896]/35 bg-[#00A896]/10 p-3 text-xs text-[#9ef0e6]">
              {isAuthenticated
                ? 'Signed in: We pre-filled your profile to speed up scheduling.'
                : 'Not signed in: Complete the form and we will route your request instantly.'}
            </div>

            <p className="mt-4 text-xs text-white/55">No spam. Response in under 1 business day.</p>

            <Link
              href="/"
              className="mt-6 inline-flex text-sm font-medium text-white/75 transition hover:text-white"
            >
              ← Back to home
            </Link>
          </div>

          <div className="rounded-2xl border border-white/12 bg-[#11141d] p-6 backdrop-blur">
            {isSubmitted ? (
              <div className="rounded-xl border border-white/12 bg-white/5 p-5">
                <h2 className="text-xl font-semibold">Thanks — your demo request is confirmed</h2>
                <p className="mt-3 text-sm text-white/72">
                  Our team will contact you shortly with available meeting slots. We can add instant
                  calendar booking in the next step if you want immediate scheduling.
                </p>
              </div>
            ) : (
              <>
                <h2 className="mb-5 text-lg font-semibold text-white/90">
                  Request a personalized demo
                </h2>
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/55">
                        Full name
                      </label>
                      <input
                        className="w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-3 text-sm outline-none transition focus:border-[#00A896]"
                        placeholder="Jane Doe"
                        {...form.register('fullName')}
                      />
                      {isAuthenticated && defaults.fullName ? (
                        <p className="mt-1 text-[11px] text-[#9ef0e6]">
                          Prefilled from your account
                        </p>
                      ) : null}
                      {form.formState.errors.fullName ? (
                        <p className="mt-1 text-xs text-[#ff9ac9]">
                          {form.formState.errors.fullName.message}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/55">
                        Work email
                      </label>
                      <input
                        className="w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-3 text-sm outline-none transition focus:border-[#00A896]"
                        placeholder="you@company.com"
                        {...form.register('workEmail')}
                      />
                      {isAuthenticated && defaults.workEmail ? (
                        <p className="mt-1 text-[11px] text-[#9ef0e6]">
                          Prefilled from your account
                        </p>
                      ) : null}
                      {form.formState.errors.workEmail ? (
                        <p className="mt-1 text-xs text-[#ff9ac9]">
                          {form.formState.errors.workEmail.message}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/55">
                        Company
                      </label>
                      <input
                        className="w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-3 text-sm outline-none transition focus:border-[#00A896]"
                        placeholder="Acme Corp"
                        {...form.register('company')}
                      />
                      {form.formState.errors.company ? (
                        <p className="mt-1 text-xs text-[#ff9ac9]">
                          {form.formState.errors.company.message}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/55">
                        Role
                      </label>
                      <input
                        className="w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-3 text-sm outline-none transition focus:border-[#00A896]"
                        placeholder="Head of Operations"
                        {...form.register('role')}
                      />
                      {form.formState.errors.role ? (
                        <p className="mt-1 text-xs text-[#ff9ac9]">
                          {form.formState.errors.role.message}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/55">
                        Team size
                      </label>
                      <Controller
                        control={form.control}
                        name="teamSize"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select team size" />
                            </SelectTrigger>
                            <SelectContent>
                              {TEAM_SIZE_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {form.formState.errors.teamSize ? (
                        <p className="mt-1 text-xs text-[#ff9ac9]">
                          {form.formState.errors.teamSize.message}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/55">
                        Primary use case
                      </label>
                      <Controller
                        control={form.control}
                        name="useCase"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a use case" />
                            </SelectTrigger>
                            <SelectContent>
                              {USE_CASE_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {form.formState.errors.useCase ? (
                        <p className="mt-1 text-xs text-[#ff9ac9]">
                          {form.formState.errors.useCase.message}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="relative cursor-pointer overflow-hidden rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#10121a] shadow-[0_10px_28px_rgba(0,0,0,0.35)] transition-all duration-200 ease-out before:absolute before:inset-y-0 before:-left-10 before:w-10 before:rotate-12 before:bg-white/80 before:opacity-0 hover:-translate-y-0.5 hover:bg-[#f7f7f7] hover:shadow-[0_14px_36px_rgba(255,105,180,0.34)] hover:before:left-[115%] hover:before:opacity-100 hover:before:transition-all hover:before:duration-500 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSaving ? 'Submitting...' : 'Request Demo'}
                  </button>
                </form>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
