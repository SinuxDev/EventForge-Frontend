import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AdminOverviewChartsPanel } from '@/components/admin/admin-overview-charts';
import { useAdminOverviewCharts } from '@/hooks/use-admin-overview';
import type { AdminOverviewChartRange } from '@/types/admin';

export function AdminOverviewView() {
  const { data: session } = useSession();
  const [range, setRange] = useState<AdminOverviewChartRange>('30d');

  const authHeader = useMemo(() => {
    if (!session?.accessToken) {
      return null;
    }

    return {
      Authorization: `Bearer ${session.accessToken}`,
    };
  }, [session?.accessToken]);

  const chartsQuery = useAdminOverviewCharts(authHeader, range);

  return (
    <section className="space-y-5">
      <section className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Admin dashboard
            </p>
            <h1 className="mt-3 text-2xl font-bold md:text-3xl">Operations command center</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Monitor platform role distribution, compliance severity, and campaign delivery
              outcomes from one overview.
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-border bg-background/80 p-1">
            {(['7d', '30d', '90d'] as const).map((item) => (
              <button
                key={item}
                onClick={() => setRange(item)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                  range === item
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <AdminOverviewChartsPanel
        charts={chartsQuery.data?.data ?? null}
        isLoading={chartsQuery.isFetching}
      />
    </section>
  );
}
