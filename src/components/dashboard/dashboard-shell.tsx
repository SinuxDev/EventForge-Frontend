'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { getPostLoginRoute, type AppUserRole } from '@/lib/auth-redirect';
import { getDashboardNavConfig } from '@/lib/dashboard-nav';
import { useDashboardShellStore } from '@/stores/dashboard-shell-store';

interface DashboardShellProps {
  requiredRole?: AppUserRole;
  allowedRoles?: AppUserRole[];
  navRole?: AppUserRole;
  children: ReactNode;
}

function getRoleLabel(role: AppUserRole): string {
  if (role === 'admin') {
    return 'Admin';
  }

  if (role === 'organizer') {
    return 'Organizer';
  }

  return 'Attendee';
}

function getInitials(value: string): string {
  const normalized = value.trim();

  if (!normalized) {
    return 'U';
  }

  const words = normalized.split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase();
}

export function DashboardShell({
  requiredRole,
  allowedRoles,
  navRole,
  children,
}: DashboardShellProps) {
  const { status, data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const isDesktopSidebarCollapsed = useDashboardShellStore(
    (state) => state.isDesktopSidebarCollapsed
  );
  const toggleDesktopSidebar = useDashboardShellStore((state) => state.toggleDesktopSidebar);

  const effectiveAllowedRoles = useMemo(() => {
    if (allowedRoles && allowedRoles.length > 0) {
      return allowedRoles;
    }

    if (requiredRole) {
      return [requiredRole];
    }

    return ['attendee', 'organizer', 'admin'] as AppUserRole[];
  }, [allowedRoles, requiredRole]);

  const effectiveNavRole = useMemo(() => {
    if (navRole) {
      return navRole;
    }

    if (requiredRole) {
      return requiredRole;
    }

    if (session?.user?.role) {
      return session.user.role;
    }

    return 'attendee' as AppUserRole;
  }, [navRole, requiredRole, session]);

  const navConfig = useMemo(() => getDashboardNavConfig(effectiveNavRole), [effectiveNavRole]);
  const dashboardLabel = useMemo(() => getRoleLabel(effectiveNavRole), [effectiveNavRole]);
  const displayName = useMemo(() => {
    const name = session?.user?.name?.trim();
    if (name) {
      return name;
    }

    return session?.user?.email ?? 'User';
  }, [session?.user?.email, session?.user?.name]);
  const secondaryLabel = useMemo(() => {
    const email = session?.user?.email;
    if (!email || email === displayName) {
      return null;
    }

    return email;
  }, [displayName, session?.user?.email]);
  const userInitials = useMemo(() => getInitials(displayName), [displayName]);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleMobileNavigate = () => {
    setIsMobileSidebarOpen(false);
  };

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status !== 'authenticated' || !session?.user?.role) {
      router.replace('/');
      return;
    }

    if (!effectiveAllowedRoles.includes(session.user.role)) {
      router.replace(getPostLoginRoute(session.user.role));
    }
  }, [effectiveAllowedRoles, router, session?.user?.role, status]);

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Preparing your dashboard...</p>
      </main>
    );
  }

  if (status !== 'authenticated' || !effectiveAllowedRoles.includes(session.user.role)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="w-full max-w-xl rounded-2xl border border-border bg-card/90 p-8 text-center backdrop-blur">
          <h1 className="text-2xl font-semibold">Redirecting to your workspace</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Please wait while we route you to the correct panel.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_18%_18%,rgba(0,168,150,0.16),transparent_44%),radial-gradient(circle_at_78%_22%,rgba(255,105,180,0.1),transparent_46%),radial-gradient(circle_at_55%_85%,rgba(41,109,255,0.08),transparent_40%)] dark:bg-[radial-gradient(circle_at_18%_18%,rgba(0,168,150,0.2),transparent_44%),radial-gradient(circle_at_78%_22%,rgba(255,105,180,0.16),transparent_46%),radial-gradient(circle_at_55%_85%,rgba(128,0,0,0.18),transparent_40%)]" />
        <div className="absolute inset-0 bg-linear-to-b from-white/35 via-transparent to-background dark:from-white/6" />
      </div>

      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/85 backdrop-blur-xl">
        <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition hover:border-ring/50 hover:bg-muted lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>

            <Link href="/" className="text-sm font-semibold text-foreground">
              EventForge
            </Link>
            <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {dashboardLabel}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2 rounded-full border border-border bg-card/80 px-2.5 py-1">
              {session.user.image && failedAvatarUrl !== session.user.image ? (
                <img
                  src={session.user.image}
                  alt={`${displayName} profile photo`}
                  className="h-8 w-8 rounded-full object-cover"
                  onError={() => setFailedAvatarUrl(session.user.image ?? null)}
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                  {userInitials}
                </div>
              )}
              <div className="hidden leading-tight sm:block">
                <p className="text-sm font-medium text-foreground">{displayName}</p>
                {secondaryLabel ? (
                  <p className="text-xs text-muted-foreground">{secondaryLabel}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div
        className="grid w-full grid-cols-1 transition-[grid-template-columns] duration-300 lg:grid-cols-[var(--dashboard-sidebar-width)_1fr]"
        style={
          {
            '--dashboard-sidebar-width': isDesktopSidebarCollapsed ? '82px' : '280px',
          } as React.CSSProperties
        }
      >
        <div className="hidden min-h-[calc(100vh-4rem)] lg:block">
          <DashboardSidebar
            title={navConfig.title}
            items={navConfig.items}
            activePath={pathname}
            isCollapsed={isDesktopSidebarCollapsed}
            onToggleCollapse={toggleDesktopSidebar}
            onSignOut={handleSignOut}
          />
        </div>

        <main className="px-3 py-6 sm:px-4 sm:py-8">{children}</main>
      </div>

      {isMobileSidebarOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button
            className="absolute inset-0 bg-black/45"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-label="Close sidebar"
          />

          <div className="absolute left-0 top-0 h-full w-[82vw] max-w-[320px]">
            <DashboardSidebar
              title={navConfig.title}
              items={navConfig.items}
              activePath={pathname}
              onNavigate={handleMobileNavigate}
              onSignOut={handleSignOut}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
