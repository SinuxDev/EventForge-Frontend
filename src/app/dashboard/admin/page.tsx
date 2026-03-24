'use client';

import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function AdminOverviewPage() {
  return (
    <DashboardShell requiredRole="admin">
      <section className="space-y-5">
        <section className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Admin dashboard
          </p>
          <h1 className="mt-3 text-2xl font-bold md:text-3xl">Operations command center</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Use dedicated sections for governance, compliance, email operations, and audit trails.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-xl border border-border bg-card/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              User governance
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Roles, suspension controls, and access safety.
            </p>
          </article>
          <article className="rounded-xl border border-border bg-card/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Compliance</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Case workflows, severity tracking, and SLA posture.
            </p>
          </article>
          <article className="rounded-xl border border-border bg-card/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Email center
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Segment campaigns with modern policy templates.
            </p>
          </article>
          <article className="rounded-xl border border-border bg-card/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Audit logs</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Complete action history for governance confidence.
            </p>
          </article>
        </section>
      </section>
    </DashboardShell>
  );
}
