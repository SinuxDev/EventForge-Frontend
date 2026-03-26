import { apiClient } from '@/lib/api-client';
import type { CreateAppealRequestPayload, CreateAppealRequestResponse } from '@/types/trust';

export async function createAppealRequest(payload: CreateAppealRequestPayload) {
  return apiClient.post<CreateAppealRequestResponse>('/appeals', payload);
}
