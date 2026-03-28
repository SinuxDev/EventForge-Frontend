'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { useRsvpTicket } from '@/hooks/use-rsvp-ticket';

function formatTicketDate(value: string, timezone: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  }).format(date);
}

export default function TicketDetailPage() {
  const { rsvpId } = useParams<{ rsvpId: string }>();
  const { data: session } = useSession();
  const ticketQuery = useRsvpTicket(rsvpId, session?.accessToken);

  return (
    <DashboardShell requiredRole="attendee">
      <section className="mx-auto w-full max-w-3xl space-y-6">
        <header className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Attendee ticket
          </p>
          <h1 className="mt-3 text-3xl font-bold">Your QR Ticket</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Present this ticket at check-in. Keep this page accessible on your phone.
          </p>
        </header>

        {ticketQuery.isLoading ? (
          <section className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
            <p className="text-sm text-muted-foreground">Loading your ticket...</p>
          </section>
        ) : ticketQuery.isError || !ticketQuery.data ? (
          <section className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6">
            <p className="text-sm text-destructive">Unable to load your ticket.</p>
            <Link
              href="/dashboard/attendee"
              className="mt-4 inline-flex h-9 items-center rounded-lg border border-border bg-background/80 px-4 text-sm font-medium text-foreground"
            >
              Back to attendee dashboard
            </Link>
          </section>
        ) : (
          <section className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
            <h2 className="text-xl font-semibold text-foreground">{ticketQuery.data.eventTitle}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatTicketDate(
                ticketQuery.data.eventStartDateTime,
                ticketQuery.data.eventTimezone
              )}
            </p>

            <div className="mt-6 rounded-xl border border-border bg-background/80 p-5">
              {ticketQuery.data.qrCodeImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ticketQuery.data.qrCodeImage}
                  alt="Ticket QR code"
                  className="mx-auto h-64 w-64 rounded-lg border border-border bg-white p-2 object-contain"
                />
              ) : (
                <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-4 text-center text-sm text-muted-foreground">
                  QR image rendering will be added next. Your ticket code is available below.
                </div>
              )}

              <p className="mt-4 text-xs text-muted-foreground">Ticket code</p>
              <p className="mt-1 break-all rounded-md border border-border bg-muted/40 px-3 py-2 font-mono text-xs text-foreground">
                {ticketQuery.data.qrCode}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={`/events/${ticketQuery.data.eventId}`}
                className="inline-flex h-9 items-center rounded-lg border border-border bg-background/80 px-4 text-sm font-medium text-foreground"
              >
                View event
              </Link>
              <Link
                href="/dashboard/attendee"
                className="inline-flex h-9 items-center rounded-lg border border-border bg-background/80 px-4 text-sm font-medium text-foreground"
              >
                Back to my RSVPs
              </Link>
            </div>
          </section>
        )}
      </section>
    </DashboardShell>
  );
}
