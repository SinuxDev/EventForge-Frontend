import { getPostLoginRoute, type AppUserRole } from '@/lib/auth-redirect';

export function getPostPublishRedirect(role?: AppUserRole): string {
  if (!role) {
    return getPostLoginRoute('organizer');
  }

  return getPostLoginRoute(role);
}
