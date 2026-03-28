import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/lib/api-client';

describe('apiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sends request body as json and returns parsed response', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { id: 'evt-1' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const response = await apiClient.post<{ success: boolean; data: { id: string } }>('/events', {
      title: 'Tech Meetup',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:5000/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'Tech Meetup' }),
    });
    expect(response).toEqual({ success: true, data: { id: 'evt-1' } });
  });

  it('throws server message when response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await expect(apiClient.get('/events')).rejects.toThrow('Unauthorized');
  });
});
