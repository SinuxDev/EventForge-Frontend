import { http, HttpResponse } from 'msw';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export const handlers = [
  http.post(`${API_BASE_URL}/auth/upgrade-role`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Role upgraded successfully',
      data: {
        user: {
          role: 'organizer',
        },
        accessToken: 'upgraded-token',
      },
    });
  }),
];
