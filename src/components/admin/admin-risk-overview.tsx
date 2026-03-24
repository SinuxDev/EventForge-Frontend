import type { ComplianceRiskOverview } from '@/types/admin';

interface AdminRiskOverviewProps {
  data: ComplianceRiskOverview | null;
  isLoading: boolean;
}

export function AdminRiskOverview({ data, isLoading }: AdminRiskOverviewProps) {
  if (isLoading) {
    return (
      <section className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur">
        <p className="text-sm text-muted-foreground">Loading risk overview...</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur">
        <p className="text-sm text-muted-foreground">Risk overview is unavailable right now.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-xl border border-border bg-background/70 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Open cases</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{data.totalOpenCases}</p>
        </article>
        <article className="rounded-xl border border-border bg-background/70 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">High severity</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {data.totalHighSeverityCases}
          </p>
        </article>
        <article className="rounded-xl border border-border bg-background/70 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Critical</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{data.totalCriticalCases}</p>
        </article>
        <article className="rounded-xl border border-border bg-background/70 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Suspended users
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{data.totalSuspendedUsers}</p>
        </article>
        <article className="rounded-xl border border-border bg-background/70 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Resolution rate
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{data.resolutionRate}%</p>
        </article>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-background/70 p-4">
        <h3 className="text-sm font-semibold text-foreground">Recent high-priority queue</h3>
        <ul className="mt-3 space-y-2">
          {data.recentCases.length === 0 ? (
            <li className="text-sm text-muted-foreground">No unresolved cases right now.</li>
          ) : (
            data.recentCases.map((item) => (
              <li key={item._id} className="rounded-lg border border-border px-3 py-2 text-sm">
                <span className="font-medium text-foreground">{item.title}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {item.severity} • {item.status}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
