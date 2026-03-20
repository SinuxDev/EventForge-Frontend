import type { EventEntity, EventPayload } from '@/types/event';
import { apiClient } from '@/lib/api-client';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedEvents {
  data: EventEntity[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function createEventDraft(
  payload: EventPayload,
  accessToken: string
): Promise<EventEntity> {
  const response = await apiClient.post<ApiEnvelope<EventEntity>>('/events', payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

export async function updateEventDraft(
  eventId: string,
  payload: Partial<EventPayload>,
  accessToken: string
): Promise<EventEntity> {
  const response = await apiClient.patch<ApiEnvelope<EventEntity>>(`/events/${eventId}`, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

export async function publishEvent(eventId: string, accessToken: string): Promise<EventEntity> {
  const response = await apiClient.post<ApiEnvelope<EventEntity>>(
    `/events/${eventId}/publish`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
}

export async function getMyEvent(eventId: string, accessToken: string): Promise<EventEntity> {
  const response = await apiClient.get<ApiEnvelope<EventEntity>>(`/events/${eventId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

export async function listMyEvents(accessToken: string): Promise<PaginatedEvents> {
  const response = await apiClient.get<ApiEnvelope<PaginatedEvents>>('/events', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}
