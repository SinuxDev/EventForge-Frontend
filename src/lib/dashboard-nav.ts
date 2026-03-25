import {
  Compass,
  History,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  PlusSquare,
  Rows3,
  ScrollText,
  ShieldAlert,
  Users,
} from 'lucide-react';
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
      { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
      { href: '/dashboard/admin/users', label: 'User governance', icon: Users },
      { href: '/dashboard/admin/compliance', label: 'Compliance', icon: ShieldAlert },
      { href: '/dashboard/admin/email', label: 'Email center', icon: Mail },
      { href: '/dashboard/admin/email/history', label: 'Campaign history', icon: History },
      { href: '/dashboard/admin/audit', label: 'Audit logs', icon: ScrollText },
      { href: '/book-demo', label: 'Support', icon: LifeBuoy },
    ],
  },
};

export function getDashboardNavConfig(role: AppUserRole): DashboardNavConfig {
  return ROLE_DASHBOARD_NAV[role];
}
