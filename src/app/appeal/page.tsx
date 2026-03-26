'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { PublicPageShell } from '@/components/shared/public-page-shell';
import { toast } from '@/hooks/use-toast';
import { createAppealRequest } from '@/lib/api/trust';
import { appealRequestSchema, type AppealRequestInput } from '@/lib/schemas/appeal-request.schema';
import type { AppealIssueType } from '@/types/trust';

const ISSUE_OPTIONS: Array<{ value: AppealIssueType; label: string }> = [
  { value: 'account_suspension', label: 'Account suspension' },
  { value: 'policy_warning', label: 'Policy warning' },
  { value: 'payment_restriction', label: 'Payment restriction' },
  { value: 'content_violation', label: 'Content violation' },
  { value: 'other', label: 'Other' },
];

export default function AppealPage() {
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);

  const defaults = useMemo(
    () => ({
      fullName: session?.user?.name ?? '',
      workEmail: session?.user?.email ?? '',
      company: '',
      accountEmail: session?.user?.email ?? '',
      issueType: 'account_suspension' as AppealIssueType,
      timeline: '',
      whatHappened: '',
      correctiveActions: '',
      evidenceLinksInput: '',
      consent: false,
    }),
    [session?.user?.email, session?.user?.name]
  );

  const form = useForm<AppealRequestInput>({
    resolver: zodResolver(appealRequestSchema),
    values: defaults,
  });

  const isAuthenticated = status === 'authenticated' && Boolean(session?.user?.email);

  const onSubmit = async (values: AppealRequestInput) => {
    setIsSubmitting(true);
    try {
      const evidenceLinks = (values.evidenceLinksInput || '')
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);

      const response = await createAppealRequest({
        fullName: values.fullName,
        workEmail: values.workEmail,
        company: values.company,
        accountEmail: values.accountEmail,
        issueType: values.issueType,
        timeline: values.timeline,
        whatHappened: values.whatHappened,
        correctiveActions: values.correctiveActions,
        evidenceLinks,
        consent: values.consent,
        source: isAuthenticated ? 'authenticated-website' : 'public-website',
      });

      setReferenceCode(response.data.referenceCode);
      toast({ title: 'Appeal submitted successfully' });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : 'Unable to submit appeal',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicPageShell
      eyebrow="Trust center / Appeal"
      title="Submit an enforcement appeal"
      description="Use this form if your account received a policy warning, restriction, or suspension and you want a formal review by EventForge operations."
    >
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-2xl border border-border bg-card p-6 backdrop-blur">
          {referenceCode ? (
            <div className="rounded-xl border border-border bg-muted/35 p-5">
              <h2 className="text-xl font-semibold text-foreground">Appeal submitted</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We received your appeal. Keep your reference code for follow-up.
              </p>
              <p className="mt-4 rounded-lg border border-primary/35 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
                Reference: {referenceCode}
              </p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    Full name
                  </label>
                  <input
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none transition focus:border-ring"
                    {...form.register('fullName')}
                  />
                  {form.formState.errors.fullName ? (
                    <p className="mt-1 text-xs text-destructive">
                      {form.formState.errors.fullName.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    Work email
                  </label>
                  <input
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none transition focus:border-ring"
                    {...form.register('workEmail')}
                  />
                  {form.formState.errors.workEmail ? (
                    <p className="mt-1 text-xs text-destructive">
                      {form.formState.errors.workEmail.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    Company
                  </label>
                  <input
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none transition focus:border-ring"
                    {...form.register('company')}
                  />
                  {form.formState.errors.company ? (
                    <p className="mt-1 text-xs text-destructive">
                      {form.formState.errors.company.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    Account email in notice
                  </label>
                  <input
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none transition focus:border-ring"
                    {...form.register('accountEmail')}
                  />
                  {form.formState.errors.accountEmail ? (
                    <p className="mt-1 text-xs text-destructive">
                      {form.formState.errors.accountEmail.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Issue type
                </label>
                <select
                  className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring"
                  {...form.register('issueType')}
                >
                  {ISSUE_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Timeline of events
                </label>
                <textarea
                  className="min-h-24 w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none transition focus:border-ring"
                  placeholder="Include dates, notice received, and key milestones."
                  {...form.register('timeline')}
                />
                {form.formState.errors.timeline ? (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.timeline.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  What happened
                </label>
                <textarea
                  className="min-h-28 w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none transition focus:border-ring"
                  placeholder="Describe the issue clearly and factually."
                  {...form.register('whatHappened')}
                />
                {form.formState.errors.whatHappened ? (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.whatHappened.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Corrective actions implemented
                </label>
                <textarea
                  className="min-h-28 w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none transition focus:border-ring"
                  placeholder="Explain root cause fixes and prevention actions."
                  {...form.register('correctiveActions')}
                />
                {form.formState.errors.correctiveActions ? (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.correctiveActions.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Evidence links (one URL per line)
                </label>
                <textarea
                  className="min-h-20 w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none transition focus:border-ring"
                  placeholder="https://example.com/evidence-1"
                  {...form.register('evidenceLinksInput')}
                />
              </div>

              <label className="flex items-start gap-2 rounded-lg border border-border bg-background/70 px-3 py-2.5 text-sm text-muted-foreground">
                <input type="checkbox" className="mt-1" {...form.register('consent')} />
                <span>
                  I confirm this information is accurate and I understand EventForge may request
                  additional verification.
                </span>
              </label>
              {form.formState.errors.consent ? (
                <p className="text-xs text-destructive">{form.formState.errors.consent.message}</p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_28px_rgba(0,168,150,0.32)] transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Submitting appeal...' : 'Submit appeal'}
              </button>
            </form>
          )}
        </article>

        <article className="space-y-4 rounded-2xl border border-border bg-card/80 p-5 backdrop-blur">
          <h2 className="text-lg font-semibold text-foreground">Review expectations</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>- Initial review usually starts within 1 business day.</li>
            <li>- Include clear timeline and concrete corrective actions.</li>
            <li>- Avoid duplicate submissions for the same case.</li>
            <li>- Keep evidence links accessible to reviewers.</li>
          </ul>

          <div className="rounded-xl border border-primary/35 bg-primary/10 p-3 text-xs text-primary">
            {isAuthenticated
              ? 'Signed in: identity fields are prefilled from your account.'
              : 'Not signed in: include accurate contact details to avoid review delays.'}
          </div>
        </article>
      </section>
    </PublicPageShell>
  );
}
