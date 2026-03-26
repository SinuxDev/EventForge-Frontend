import type { ReactNode } from 'react';
import { PublicHeader } from '@/components/shared/public-header';

interface PublicPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function PublicPageShell({ eyebrow, title, description, children }: PublicPageShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(33,150,243,0.1),transparent_42%),radial-gradient(circle_at_75%_24%,rgba(255,105,180,0.08),transparent_45%),radial-gradient(circle_at_52%_80%,rgba(0,168,150,0.08),transparent_40%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(33,150,243,0.2),transparent_42%),radial-gradient(circle_at_75%_24%,rgba(255,105,180,0.16),transparent_45%),radial-gradient(circle_at_52%_80%,rgba(0,168,150,0.14),transparent_40%)]" />
        <div className="absolute inset-0 bg-linear-to-b from-white/35 via-transparent to-background dark:from-white/6" />
      </div>

      <PublicHeader />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 pt-10 md:px-6 md:pt-14">
        <section className="mb-8 rounded-2xl border border-border bg-card/75 p-5 backdrop-blur md:p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {description}
          </p>
        </section>

        {children}
      </main>
    </div>
  );
}
