'use client';

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import type { AdminOverviewCharts } from '@/types/admin';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface AdminOverviewChartsProps {
  charts: AdminOverviewCharts | null;
  isLoading: boolean;
}

export function AdminOverviewChartsPanel({ charts, isLoading }: AdminOverviewChartsProps) {
  if (isLoading) {
    return (
      <section className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
        <p className="text-sm text-muted-foreground">Loading overview charts...</p>
      </section>
    );
  }

  if (!charts) {
    return (
      <section className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
        <p className="text-sm text-muted-foreground">Overview charts are unavailable right now.</p>
      </section>
    );
  }

  const roleDistributionData = {
    labels: ['Attendee', 'Organizer', 'Admin'],
    datasets: [
      {
        data: [
          charts.roleDistribution.attendee,
          charts.roleDistribution.organizer,
          charts.roleDistribution.admin,
        ],
        backgroundColor: [
          'rgba(0, 184, 163, 0.75)',
          'rgba(41, 109, 255, 0.65)',
          'rgba(255, 105, 180, 0.65)',
        ],
        borderColor: ['rgba(0, 184, 163, 1)', 'rgba(41, 109, 255, 1)', 'rgba(255, 105, 180, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const complianceSeverityData = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [
      {
        label: 'Cases',
        data: [
          charts.complianceSeverity.low,
          charts.complianceSeverity.medium,
          charts.complianceSeverity.high,
          charts.complianceSeverity.critical,
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.6)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(249, 115, 22, 0.65)',
          'rgba(239, 68, 68, 0.7)',
        ],
        borderRadius: 8,
      },
    ],
  };

  const emailDeliveryTrendData = {
    labels: charts.emailDeliveryTrend.map((point) => point.date.slice(5)),
    datasets: [
      {
        label: 'Sent',
        data: charts.emailDeliveryTrend.map((point) => point.sent),
        borderColor: 'rgba(0, 184, 163, 1)',
        backgroundColor: 'rgba(0, 184, 163, 0.18)',
        fill: true,
        tension: 0.35,
      },
      {
        label: 'Failed',
        data: charts.emailDeliveryTrend.map((point) => point.failed),
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgb(148, 163, 184)',
        },
      },
    },
    scales: {
      x: {
        ticks: { color: 'rgb(148, 163, 184)' },
        grid: { color: 'rgba(148, 163, 184, 0.12)' },
      },
      y: {
        ticks: { color: 'rgb(148, 163, 184)' },
        grid: { color: 'rgba(148, 163, 184, 0.12)' },
      },
    },
  };

  return (
    <section className="grid gap-4 xl:grid-cols-3">
      <article className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">User roles</p>
        <h3 className="mt-2 text-lg font-semibold text-foreground">Role distribution</h3>
        <div className="mt-4 h-64">
          <Doughnut
            data={roleDistributionData}
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

      <article className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Compliance</p>
        <h3 className="mt-2 text-lg font-semibold text-foreground">Severity mix</h3>
        <div className="mt-4 h-64">
          <Bar data={complianceSeverityData} options={chartOptions} />
        </div>
      </article>

      <article className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Email center</p>
        <h3 className="mt-2 text-lg font-semibold text-foreground">Delivery trend</h3>
        <div className="mt-4 h-64">
          <Line data={emailDeliveryTrendData} options={chartOptions} />
        </div>
      </article>
    </section>
  );
}
