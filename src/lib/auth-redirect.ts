export type AppUserRole = 'attendee' | 'organizer' | 'admin';

export function getPostLoginRoute(role: AppUserRole): string {
  if (role === 'organizer') {
    return '/dashboard/organizer';
  }

  if (role === 'admin') {
    return '/dashboard/admin';
  }

  return '/dashboard/attendee';
}
