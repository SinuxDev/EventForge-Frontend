import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelRsvp,
  listManagedMyRsvps,
  listMyRsvps,
  type ManagedRsvpSort,
  type ManagedRsvpTab,
} from '@/lib/api/rsvps';

export const attendeeRsvpKeys = {
  all: ['attendee-rsvps'] as const,
  my: (accessToken?: string) => [...attendeeRsvpKeys.all, 'my', accessToken] as const,
  managed: (
    accessToken: string | undefined,
    filters: {
      tab: ManagedRsvpTab;
      search: string;
      page: number;
      limit: number;
      sort: ManagedRsvpSort;
    }
  ) => [...attendeeRsvpKeys.all, 'managed', accessToken, filters] as const,
};

interface ManagedAttendeeRsvpFilters {
  tab: ManagedRsvpTab;
  search: string;
  page: number;
  limit: number;
  sort: ManagedRsvpSort;
}

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

export function useManagedAttendeeRsvps(
  accessToken: string | undefined,
  filters: ManagedAttendeeRsvpFilters
) {
  return useQuery({
    queryKey: attendeeRsvpKeys.managed(accessToken, filters),
    enabled: Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) {
        throw new Error('You must be signed in');
      }

      return listManagedMyRsvps(accessToken, {
        tab: filters.tab,
        search: filters.search,
        page: filters.page,
        limit: filters.limit,
        sort: filters.sort,
      });
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
