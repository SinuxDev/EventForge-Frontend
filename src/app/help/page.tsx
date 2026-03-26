'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PublicPageShell } from '@/components/shared/public-page-shell';

const helpArticles = [
  { title: 'Create and publish events', category: 'Events' },
  { title: 'Manage registrations and RSVPs', category: 'Events' },
  { title: 'Account sign-in and security', category: 'Account' },
  { title: 'Billing, invoices, and refunds', category: 'Billing' },
  { title: 'Policy warnings and suspensions', category: 'Compliance' },
  { title: 'Troubleshooting email delivery', category: 'Support' },
];

export default function HelpPage() {
  const [query, setQuery] = useState('');

  const filteredArticles = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return helpArticles;
    }

    return helpArticles.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) || item.category.toLowerCase().includes(keyword)
    );
  }, [query]);

  return (
    <PublicPageShell
      eyebrow="Trust center / Help"
      title="Help center"
      description="Find fast, self-service answers for setup, operations, policy, and account recovery."
    >
      <section className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur">
        <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Search help
        </label>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by topic, issue, or workflow"
          className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-ring"
        />
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2">
        {filteredArticles.map((article) => (
          <article
            key={article.title}
            className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur"
          >
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              {article.category}
            </p>
            <h2 className="mt-2 text-lg font-semibold text-foreground">{article.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Guidance for this topic is available from our support operations team.
            </p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card/80 p-5 backdrop-blur">
        <h3 className="text-lg font-semibold text-foreground">Need enforcement support?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          If your account received a warning or suspension, submit a formal appeal with evidence for
          review.
        </p>
        <div className="mt-3">
          <Link
            href="/appeal"
            className="rounded-lg border border-primary/40 bg-primary/15 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
          >
            Open appeal form
          </Link>
        </div>
      </section>
    </PublicPageShell>
  );
}
