import { apiClient } from '@/lib/api-client';
import type { EventEntity } from '@/types/event';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export type RsvpStatus = 'registered' | 'waitlisted' | 'cancelled';
export type ManagedRsvpTab = 'upcoming' | 'waitlisted' | 'past' | 'cancelled' | 'all';
export type ManagedRsvpSort = 'eventStartAsc' | 'eventStartDesc' | 'createdDesc';

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

export interface ManagedRsvpItem {
  rsvpId: string;
  status: RsvpStatus;
  tab: Exclude<ManagedRsvpTab, 'all'>;
  waitlistPosition: number | null;
  createdAt: string;
  updatedAt: string;
  event: {
    eventId: string;
    title: string;
    shortSummary: string;
    startDateTime: string;
    endDateTime: string;
    timezone: string;
    attendanceMode: string;
    venueName: string | null;
    city: string | null;
    country: string | null;
    registrationCloseAt: string | null;
    status: string;
    coverImage: string | null;
  };
  actions: {
    canViewTicket: boolean;
    canCancel: boolean;
    canJoinWaitlist: boolean;
    canLeaveWaitlist: boolean;
    canReregister: boolean;
  };
}

export interface ManagedRsvpsEntity {
  items: ManagedRsvpItem[];
  counts: {
    upcoming: number;
    waitlisted: number;
    past: number;
    cancelled: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    tab: ManagedRsvpTab;
    search: string;
    sort: ManagedRsvpSort;
  };
}

export interface ManagedRsvpsQuery {
  tab?: ManagedRsvpTab;
  search?: string;
  page?: number;
  limit?: number;
  sort?: ManagedRsvpSort;
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

export async function listManagedMyRsvps(
  accessToken: string,
  query: ManagedRsvpsQuery = {}
): Promise<ManagedRsvpsEntity> {
  const searchParams = new URLSearchParams();

  if (query.tab) {
    searchParams.set('tab', query.tab);
  }

  if (query.search && query.search.trim().length > 0) {
    searchParams.set('search', query.search.trim());
  }

  if (typeof query.page === 'number') {
    searchParams.set('page', String(query.page));
  }

  if (typeof query.limit === 'number') {
    searchParams.set('limit', String(query.limit));
  }

  if (query.sort) {
    searchParams.set('sort', query.sort);
  }

  const suffix = searchParams.toString();
  const endpoint = suffix ? `/rsvps/my/managed?${suffix}` : '/rsvps/my/managed';

  const response = await apiClient.get<ApiEnvelope<ManagedRsvpsEntity>>(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}
