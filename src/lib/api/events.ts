import type { EventEntity, EventPayload } from '@/types/event';
import { apiClient } from '@/lib/api-client';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface UploadCoverResponse {
  url: string;
  fileName: string;
}

export interface PaginatedEvents {
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

interface ListMyEventsOptions {
  page?: number;
  limit?: number;
}

export async function listMyEvents(
  accessToken: string,
  options: ListMyEventsOptions = {}
): Promise<PaginatedEvents> {
  const query = new URLSearchParams();
  if (options.page) {
    query.set('page', String(options.page));
  }
  if (options.limit) {
    query.set('limit', String(options.limit));
  }

  const response = await apiClient.get<ApiEnvelope<PaginatedEvents>>(
    `/events${query.toString() ? `?${query.toString()}` : ''}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
}

export async function uploadEventCover(
  file: File,
  accessToken: string
): Promise<UploadCoverResponse> {
  const formData = new FormData();
  formData.append('coverImage', file);

  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';
  const trimmedBaseUrl = configuredBaseUrl.replace(/\/$/, '');
  const apiBaseUrl = /\/v\d+$/.test(trimmedBaseUrl) ? trimmedBaseUrl : `${trimmedBaseUrl}/v1`;

  const response = await fetch(`${apiBaseUrl}/events/upload-cover`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorBody?.message ?? 'Unable to upload cover image');
  }

  const json = (await response.json()) as ApiEnvelope<UploadCoverResponse>;
  return json.data;
}
