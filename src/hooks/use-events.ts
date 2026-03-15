// ─── TanStack Query hooks — Events ───────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Event, PaginatedResponse, ApiResponse } from "@/types";
import type { CreateEventInput } from "@/lib/schemas";

export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...eventKeys.lists(), filters] as const,
  detail: (id: string) => [...eventKeys.all, "detail", id] as const,
  attendees: (id: string) => [...eventKeys.all, "attendees", id] as const,
  analytics: (id: string) => [...eventKeys.all, "analytics", id] as const,
};

// ─── List / search events ─────────────────────────────────────────────────────
interface EventFilters extends Record<string, unknown> {
  search?: string;
  category?: string;
  type?: "in-person" | "online";
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export function useEvents(filters: EventFilters = {}) {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: () => {
      const params = new URLSearchParams(
        Object.entries(filters)
          .filter(([, v]) => v !== undefined && v !== "")
          .map(([k, v]) => [k, String(v)])
      ).toString();
      return apiClient.get<PaginatedResponse<Event>>(`/events${params ? `?${params}` : ""}`);
    },
  });
}

// ─── Single event ─────────────────────────────────────────────────────────────
export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => apiClient.get<ApiResponse<Event>>(`/events/${id}`),
    enabled: Boolean(id),
  });
}

// ─── Create event ─────────────────────────────────────────────────────────────
export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventInput) =>
      apiClient.post<ApiResponse<Event>>("/events", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

// ─── Update event ─────────────────────────────────────────────────────────────
export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateEventInput>) =>
      apiClient.put<ApiResponse<Event>>(`/events/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

// ─── Delete event ─────────────────────────────────────────────────────────────
export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<ApiResponse<null>>(`/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}
