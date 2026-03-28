import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelRsvp, listMyRsvps } from '@/lib/api/rsvps';

export const attendeeRsvpKeys = {
  all: ['attendee-rsvps'] as const,
  my: (accessToken?: string) => [...attendeeRsvpKeys.all, 'my', accessToken] as const,
};

export function useMyAttendeeRsvps(accessToken?: string) {
  return useQuery({
    queryKey: attendeeRsvpKeys.my(accessToken),
    enabled: Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) {
        return [];
      }

      return listMyRsvps(accessToken);
    },
  });
}

export function useCancelAttendeeRsvp(accessToken?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rsvpId: string) => {
      if (!accessToken) {
        throw new Error('You must be signed in to cancel RSVP');
      }

      return cancelRsvp(rsvpId, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendeeRsvpKeys.all });
    },
  });
}
