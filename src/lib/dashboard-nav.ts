import { Compass, LayoutDashboard, LifeBuoy, PlusSquare, Rows3, UserRoundCog } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AppUserRole } from '@/lib/auth-redirect';

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface DashboardNavConfig {
  title: string;
  items: DashboardNavItem[];
}

const ROLE_DASHBOARD_NAV: Record<AppUserRole, DashboardNavConfig> = {
  attendee: {
    title: 'Attendee workspace',
    items: [
      { href: '/dashboard/attendee', label: 'Overview', icon: LayoutDashboard },
      { href: '/', label: 'Discover events', icon: Compass },
      { href: '/book-demo', label: 'Book demo', icon: LifeBuoy },
    ],
  },
  organizer: {
    title: 'Organizer workspace',
    items: [
      { href: '/dashboard/organizer', label: 'My events', icon: Rows3 },
      { href: '/events/new', label: 'Create event', icon: PlusSquare },
      { href: '/book-demo', label: 'Support', icon: LifeBuoy },
    ],
  },
  admin: {
    title: 'Admin workspace',
    items: [
      { href: '/dashboard/admin', label: 'User governance', icon: UserRoundCog },
      { href: '/book-demo', label: 'Support', icon: LifeBuoy },
    ],
  },
};

export function getDashboardNavConfig(role: AppUserRole): DashboardNavConfig {
  return ROLE_DASHBOARD_NAV[role];
}
