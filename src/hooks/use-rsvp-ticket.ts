import { useQuery } from '@tanstack/react-query';
import { getRsvpTicket } from '@/lib/api/rsvps';

export const rsvpTicketKeys = {
  all: ['rsvp-ticket'] as const,
  byId: (rsvpId: string, accessToken?: string) =>
    [...rsvpTicketKeys.all, rsvpId, accessToken] as const,
};

export function useRsvpTicket(rsvpId: string, accessToken?: string) {
  return useQuery({
    queryKey: rsvpTicketKeys.byId(rsvpId, accessToken),
    enabled: Boolean(rsvpId) && Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) {
        throw new Error('You must be signed in to view your ticket');
      }

      return getRsvpTicket(rsvpId, accessToken);
    },
  });
}
