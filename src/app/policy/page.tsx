import Link from 'next/link';
import { PublicPageShell } from '@/components/shared/public-page-shell';

const policySections = [
  {
    title: 'Acceptable use',
    content:
      'Use EventForge only for lawful event operations. Fraud, abuse, impersonation, and attempts to bypass platform safeguards are prohibited.',
  },
  {
    title: 'Content standards',
    content:
      'Event descriptions, assets, and communications must remain accurate and policy-compliant. Misleading, harmful, or prohibited content may be removed.',
  },
  {
    title: 'Payments and refunds',
    content:
      'Organizers are responsible for transparent payment terms and attendee communication. EventForge may restrict accounts for payment abuse or repeated disputes.',
  },
  {
    title: 'Account enforcement',
    content:
      'When policy risk is detected, EventForge can issue warnings, temporary restrictions, or suspension. Enforcement actions are documented and reviewable.',
  },
  {
    title: 'Data and privacy',
    content:
      'We process account and operational data to deliver platform services, prevent abuse, and maintain trust and safety controls.',
  },
  {
    title: 'Appeals process',
    content:
      'If you believe enforcement is incorrect, submit an appeal with timeline, root cause, and corrective actions. Appeals are reviewed by operations teams.',
  },
];

export default function PolicyPage() {
  return (
    <PublicPageShell
      eyebrow="Trust center / Policy"
      title="Platform policy and enforcement model"
      description="This policy explains how EventForge protects attendees, organizers, and the platform ecosystem through clear standards and accountable enforcement."
    >
      <section className="grid gap-4 md:grid-cols-2">
        {policySections.map((section) => (
          <article
            key={section.title}
            className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur"
          >
            <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.content}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card/80 p-5 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Policy metadata
            </p>
            <p className="mt-2 text-sm text-foreground">Version 1.0 • Last updated March 2026</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/help"
              className="rounded-lg border border-border bg-background/80 px-3 py-2 text-sm font-medium text-foreground transition hover:border-ring/35 hover:bg-muted"
            >
              Open help center
            </Link>
            <Link
              href="/appeal"
              className="rounded-lg border border-primary/40 bg-primary/15 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
            >
              Submit appeal
            </Link>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
