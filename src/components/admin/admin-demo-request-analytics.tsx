import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import type { DemoRequestAnalyticsResponse } from '@/types/admin';

ChartJS.register(ArcElement, Tooltip, Legend);

interface AdminDemoRequestAnalyticsProps {
  analytics: DemoRequestAnalyticsResponse['data'] | null;
  isLoading: boolean;
}

export function AdminDemoRequestAnalytics({
  analytics,
  isLoading,
}: AdminDemoRequestAnalyticsProps) {
  if (isLoading) {
    return (
      <section className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur md:p-5">
        <p className="text-sm text-muted-foreground">Loading demo analytics...</p>
      </section>
    );
  }

  if (!analytics) {
    return (
      <section className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur md:p-5">
        <p className="text-sm text-muted-foreground">Demo analytics unavailable right now.</p>
      </section>
    );
  }

  const statusData = {
    labels: ['New', 'Contacted', 'Qualified', 'Scheduled', 'Completed', 'No Show', 'Won', 'Lost'],
    datasets: [
      {
        data: [
          analytics.statusDistribution.new,
          analytics.statusDistribution.contacted,
          analytics.statusDistribution.qualified,
          analytics.statusDistribution.scheduled,
          analytics.statusDistribution.completed,
          analytics.statusDistribution.no_show,
          analytics.statusDistribution.won,
          analytics.statusDistribution.lost,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.65)',
          'rgba(14, 165, 233, 0.65)',
          'rgba(16, 185, 129, 0.65)',
          'rgba(245, 158, 11, 0.65)',
          'rgba(34, 197, 94, 0.65)',
          'rgba(239, 68, 68, 0.65)',
          'rgba(132, 204, 22, 0.65)',
          'rgba(244, 63, 94, 0.65)',
        ],
      },
    ],
  };

  return (
    <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <article className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur md:p-5">
        <h2 className="text-lg font-semibold text-foreground">Demo analytics</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="Total requests" value={analytics.summary.total} />
          <MetricCard
            label="Qualification rate"
            value={`${analytics.summary.qualificationRate}%`}
          />
          <MetricCard label="Schedule rate" value={`${analytics.summary.scheduleRate}%`} />
          <MetricCard label="Win rate" value={`${analytics.summary.winRate}%`} />
          <MetricCard label="No-show rate" value={`${analytics.summary.noShowRate}%`} />
          <MetricCard
            label="Median first response"
            value={`${analytics.summary.medianFirstResponseMinutes}m`}
          />
        </div>
      </article>

      <article className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur md:p-5">
        <h3 className="text-sm font-semibold text-foreground">Status distribution</h3>
        <div className="mt-3 h-64">
          <Doughnut
            data={statusData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  labels: {
                    color: 'rgb(148, 163, 184)',
                  },
                },
              },
            }}
          />
        </div>
      </article>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <article className="rounded-xl border border-border bg-background/80 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </article>
  );
}
