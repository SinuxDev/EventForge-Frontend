import { apiClient } from '@/lib/api-client';
import type { EventEntity } from '@/types/event';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export type RsvpStatus = 'registered' | 'waitlisted' | 'cancelled';

export interface MyRsvpEntity {
  _id: string;
  event: EventEntity;
  user: string;
  status: RsvpStatus;
  formResponses: Array<{ question: string; answer: string }>;
  waitlistPosition?: number;
  createdAt: string;
  updatedAt: string;
}

interface CancelRsvpResult {
  rsvpId: string;
  status: RsvpStatus;
  promotedRsvpId: string | null;
}

export interface RsvpTicketEntity {
  rsvpId: string;
  eventId: string;
  eventTitle: string;
  eventStartDateTime: string;
  eventTimezone: string;
  status: RsvpStatus;
  ticketId: string;
  qrCode: string;
  qrCodeImage: string | null;
}

export async function listMyRsvps(accessToken: string): Promise<MyRsvpEntity[]> {
  const response = await apiClient.get<ApiEnvelope<MyRsvpEntity[]>>('/rsvps/my', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

export async function cancelRsvp(rsvpId: string, accessToken: string): Promise<CancelRsvpResult> {
  const response = await apiClient.delete<ApiEnvelope<CancelRsvpResult>>(`/rsvps/${rsvpId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

export async function getRsvpTicket(
  rsvpId: string,
  accessToken: string
): Promise<RsvpTicketEntity> {
  const response = await apiClient.get<ApiEnvelope<RsvpTicketEntity>>(`/rsvps/${rsvpId}/ticket`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}
