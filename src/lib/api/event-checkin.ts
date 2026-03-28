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
  checkedInCount: number;
  attendanceRate: number;
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
