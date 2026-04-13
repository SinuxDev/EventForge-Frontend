import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  checkInByTicket,
  checkInByQr,
  getEventAttendance,
  getEventAttendees,
  undoEventCheckIn,
  type EventAttendeesQueryParams,
} from '@/lib/api/event-checkin';
import { runWithIdempotencyRetry } from '@/lib/idempotency';

export const eventCheckInKeys = {
  all: ['event-checkin'] as const,
  attendance: (eventId: string, accessToken?: string) =>
    [...eventCheckInKeys.all, 'attendance', eventId, accessToken] as const,
  attendees: (
    eventId: string,
    accessToken: string | undefined,
    filters: EventAttendeesQueryParams
  ) => [...eventCheckInKeys.all, 'attendees', eventId, accessToken, filters] as const,
};

export function useEventAttendance(eventId: string, accessToken?: string) {
  return useQuery({
    queryKey: eventCheckInKeys.attendance(eventId, accessToken),
    enabled: Boolean(eventId) && Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) {
        throw new Error('You must be signed in to view attendance');
      }

      return getEventAttendance(eventId, accessToken);
    },
  });
}

export function useCheckInByQr(eventId: string, accessToken?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { qrCode: string; source: 'scanner' | 'manual' }) => {
      if (!accessToken) {
        throw new Error('You must be signed in to check in attendees');
      }

      return runWithIdempotencyRetry('checkin-qr', (idempotencyKey) =>
        checkInByQr(eventId, params.qrCode, accessToken, params.source, idempotencyKey)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventCheckInKeys.all });
    },
  });
}

export function useCheckInByTicket(eventId: string, accessToken?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { ticketId: string; source: 'lookup' }) => {
      if (!accessToken) {
        throw new Error('You must be signed in to check in attendees');
      }

      return runWithIdempotencyRetry('checkin-ticket', (idempotencyKey) =>
        checkInByTicket(eventId, params.ticketId, accessToken, params.source, idempotencyKey)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventCheckInKeys.all });
    },
  });
}

export function useUndoCheckIn(eventId: string, accessToken?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketId: string) => {
      if (!accessToken) {
        throw new Error('You must be signed in to undo check-in');
      }

      return runWithIdempotencyRetry('checkin-undo', (idempotencyKey) =>
        undoEventCheckIn(eventId, ticketId, accessToken, idempotencyKey)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventCheckInKeys.all });
    },
  });
}

export function useEventAttendees(
  eventId: string,
  accessToken: string | undefined,
  filters: EventAttendeesQueryParams
) {
  return useQuery({
    queryKey: eventCheckInKeys.attendees(eventId, accessToken, filters),
    enabled: Boolean(eventId) && Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) {
        throw new Error('You must be signed in to view attendees');
      }

      return getEventAttendees(eventId, accessToken, filters);
    },
  });
}
