'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { submitRsvp } from '@/lib/api/events';

interface RsvpActionCardProps {
  eventId: string;
  eventTitle: string;
}

export function RsvpActionCard({ eventId, eventTitle }: RsvpActionCardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rsvpResult, setRsvpResult] = useState<{
    status: 'registered' | 'waitlisted' | 'cancelled';
    waitlistPosition: number | null;
    rsvpId: string;
  } | null>(null);

  const isAuthenticated = status === 'authenticated';

  const handleRsvp = async () => {
    if (!isAuthenticated || !session?.accessToken) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to RSVP for this event.',
        variant: 'destructive',
      });
      router.push('/');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await submitRsvp(eventId, {}, session.accessToken);
      setRsvpResult({
        status: result.status,
        waitlistPosition: result.waitlistPosition,
        rsvpId: result.rsvpId,
      });

      if (result.status === 'registered') {
        toast({
          title: 'You are registered',
          description: 'We sent a confirmation email to your inbox.',
        });
      } else if (result.status === 'waitlisted') {
        toast({
          title: 'Added to waitlist',
          description: 'You will be notified by email if a seat opens up.',
        });
      } else {
        toast({
          title: 'RSVP updated',
          description: 'Your RSVP status was updated.',
        });
      }
    } catch (error) {
      toast({
        title: 'Unable to RSVP',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="rounded-xl border border-border bg-card/70 p-5">
      <h3 className="text-base font-semibold text-foreground">RSVP</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Reserve your spot for <span className="font-medium text-foreground">{eventTitle}</span>.
      </p>

      {rsvpResult ? (
        <div className="mt-3 rounded-lg border border-border bg-background/70 px-3 py-2 text-sm text-foreground">
          <p>
            Status: <span className="font-semibold capitalize">{rsvpResult.status}</span>
            {rsvpResult.status === 'waitlisted' && rsvpResult.waitlistPosition ? (
              <span className="text-muted-foreground">
                {' '}
                (position #{rsvpResult.waitlistPosition})
              </span>
            ) : null}
          </p>
          {rsvpResult.status === 'registered' ? (
            <Link
              href={`/tickets/${rsvpResult.rsvpId}`}
              className="mt-2 inline-flex text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              View your QR ticket
            </Link>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleRsvp}
        disabled={isSubmitting}
        className="mt-4 inline-flex h-9 items-center rounded-lg border border-primary/35 bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Submitting...' : 'RSVP now'}
      </button>
    </article>
  );
}
