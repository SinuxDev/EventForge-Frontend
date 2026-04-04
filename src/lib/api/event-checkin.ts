import { apiClient } from '@/lib/api-client';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AttendanceSummary {
  eventId: string;
  registeredCount: number;
  waitlistedCount: number;
  cancelledCount: number;
  checkedInCount: number;
  attendanceRate: number;
}

export type EventAttendeeStatusFilter = 'all' | 'registered' | 'waitlisted' | 'cancelled';
export type EventAttendeeCheckInFilter = 'all' | 'checked_in' | 'not_checked_in';

export interface EventAttendeesQueryParams {
  status: EventAttendeeStatusFilter;
  checkIn: EventAttendeeCheckInFilter;
  query: string;
  page: number;
  limit: number;
}

export interface EventAttendeeItem {
  rsvpId: string;
  status: 'registered' | 'waitlisted' | 'cancelled';
  waitlistPosition: number | null;
  joinedAt: string;
  attendee: {
    id: string;
    name: string;
    email: string;
  };
  ticket: {
    id: string;
    code: string;
    isCheckedIn: boolean;
    checkedInAt: string | null;
  } | null;
}

export interface EventAttendeesResponse {
  eventId: string;
  items: EventAttendeeItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CheckInResponse {
  eventId: string;
  ticketId: string;
  rsvpId: string;
  attendeeId: string;
  attendeeName: string;
  attendeeEmail: string;
  alreadyCheckedIn: boolean;
  checkedInAt: string;
  source: 'scanner' | 'manual';
}

interface UndoCheckInResponse {
  eventId: string;
  ticketId: string;
  isCheckedIn: boolean;
}

export async function getEventAttendance(
  eventId: string,
  accessToken: string
): Promise<AttendanceSummary> {
  const response = await apiClient.get<ApiEnvelope<AttendanceSummary>>(
    `/events/${eventId}/attendance`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
}

export async function checkInByQr(
  eventId: string,
  qrCode: string,
  accessToken: string,
  source: 'scanner' | 'manual'
): Promise<CheckInResponse> {
  const response = await apiClient.post<ApiEnvelope<CheckInResponse>>(
    `/events/${eventId}/check-in`,
    {
      qrCode,
      source,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
}

export async function undoEventCheckIn(
  eventId: string,
  ticketId: string,
  accessToken: string
): Promise<UndoCheckInResponse> {
  const response = await apiClient.post<ApiEnvelope<UndoCheckInResponse>>(
    `/events/${eventId}/check-in/undo`,
    {
      ticketId,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
}

export async function getEventAttendees(
  eventId: string,
  accessToken: string,
  filters: EventAttendeesQueryParams
): Promise<EventAttendeesResponse> {
  const query = new URLSearchParams();

  if (filters.status !== 'all') {
    query.set('status', filters.status);
  }

  if (filters.checkIn !== 'all') {
    query.set('checkIn', filters.checkIn);
  }

  if (filters.query.trim()) {
    query.set('q', filters.query.trim());
  }

  query.set('page', String(filters.page));
  query.set('limit', String(filters.limit));

  const suffix = query.toString();
  const endpoint = suffix
    ? `/events/${eventId}/attendees?${suffix}`
    : `/events/${eventId}/attendees`;

  const response = await apiClient.get<ApiEnvelope<EventAttendeesResponse>>(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

export async function downloadEventAttendeesCsv(
  eventId: string,
  accessToken: string,
  filters: Pick<EventAttendeesQueryParams, 'status' | 'checkIn' | 'query'>
): Promise<Blob> {
  const query = new URLSearchParams();

  if (filters.status !== 'all') {
    query.set('status', filters.status);
  }

  if (filters.checkIn !== 'all') {
    query.set('checkIn', filters.checkIn);
  }

  if (filters.query.trim()) {
    query.set('q', filters.query.trim());
  }

  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';
  const trimmedBaseUrl = configuredBaseUrl.replace(/\/$/, '');
  const apiBaseUrl = /\/v\d+$/.test(trimmedBaseUrl) ? trimmedBaseUrl : `${trimmedBaseUrl}/v1`;
  const suffix = query.toString();
  const endpoint = suffix
    ? `${apiBaseUrl}/events/${eventId}/attendees/export?${suffix}`
    : `${apiBaseUrl}/events/${eventId}/attendees/export`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorBody?.message ?? 'Unable to export attendees');
  }

  return response.blob();
}

export async function downloadBulkEventAttendeesXlsx(
  eventIds: string[],
  accessToken: string,
  filters: Pick<EventAttendeesQueryParams, 'status' | 'checkIn' | 'query'>
): Promise<Blob> {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';
  const trimmedBaseUrl = configuredBaseUrl.replace(/\/$/, '');
  const apiBaseUrl = /\/v\d+$/.test(trimmedBaseUrl) ? trimmedBaseUrl : `${trimmedBaseUrl}/v1`;

  const response = await fetch(`${apiBaseUrl}/events/attendees/export-bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      eventIds,
      status: filters.status,
      checkIn: filters.checkIn,
      q: filters.query.trim() || undefined,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorBody?.message ?? 'Unable to export attendees workbook');
  }

  return response.blob();
}
