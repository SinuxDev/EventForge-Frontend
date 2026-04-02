// ─── TanStack Query hooks — RSVPs ─────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Rsvp, Ticket, ApiResponse } from '@/types';
import type { RsvpInput } from '@/lib/schemas';

export const rsvpKeys = {
  all: ['rsvps'] as const,
  my: () => [...rsvpKeys.all, 'my'] as const,
  ticket: (id: string) => [...rsvpKeys.all, 'ticket', id] as const,
};

// ─── My RSVPs ─────────────────────────────────────────────────────────────────
export function useMyRsvps() {
  return useQuery({
    queryKey: rsvpKeys.my(),
    queryFn: () => apiClient.get<ApiResponse<Rsvp[]>>('/rsvps/my'),
  });
}

// ─── Submit RSVP ──────────────────────────────────────────────────────────────
export function useSubmitRsvp(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RsvpInput) =>
      apiClient.post<ApiResponse<Rsvp>>(`/events/${eventId}/rsvp`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rsvpKeys.my() });
    },
  });
}

// ─── Cancel RSVP ─────────────────────────────────────────────────────────────
export function useCancelRsvp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rsvpId: string) => apiClient.delete<ApiResponse<null>>(`/rsvps/${rsvpId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rsvpKeys.my() });
    },
  });
}

// ─── Get ticket ───────────────────────────────────────────────────────────────
export function useTicket(rsvpId: string) {
  return useQuery({
    queryKey: rsvpKeys.ticket(rsvpId),
    queryFn: () => apiClient.get<ApiResponse<Ticket>>(`/rsvps/${rsvpId}/ticket`),
    enabled: Boolean(rsvpId),
  });
}
