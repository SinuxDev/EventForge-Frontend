'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { getPostLoginRoute, type AppUserRole } from '@/lib/auth-redirect';
import { getDashboardNavConfig } from '@/lib/dashboard-nav';

interface DashboardShellProps {
  requiredRole: AppUserRole;
  children: ReactNode;
}

export function DashboardShell({ requiredRole, children }: DashboardShellProps) {
  const { status, data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const navConfig = useMemo(() => getDashboardNavConfig(requiredRole), [requiredRole]);

  const dashboardLabel = useMemo(() => {
    if (requiredRole === 'admin') {
      return 'Admin';
    }

    if (requiredRole === 'organizer') {
      return 'Organizer';
    }

    return 'Attendee';
  }, [requiredRole]);

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

    if (session.user.role !== requiredRole) {
      router.replace(getPostLoginRoute(session.user.role));
    }
  }, [requiredRole, router, session?.user?.role, status]);

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0d13] text-white">
        <p className="text-sm text-white/70">Preparing your dashboard...</p>
      </main>
    );
  }

  if (status !== 'authenticated' || session?.user?.role !== requiredRole) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0d13] px-6 text-white">
        <div className="w-full max-w-xl rounded-2xl border border-white/12 bg-white/5 p-8 text-center backdrop-blur">
          <h1 className="text-2xl font-semibold">Redirecting to your workspace</h1>
          <p className="mt-3 text-sm text-white/70">
            Please wait while we route you to the correct panel.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d13] text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_18%_18%,rgba(0,168,150,0.2),transparent_44%),radial-gradient(circle_at_78%_22%,rgba(255,105,180,0.16),transparent_46%),radial-gradient(circle_at_55%_85%,rgba(128,0,0,0.18),transparent_40%)]" />
        <div className="absolute inset-0 bg-linear-to-b from-white/6 via-transparent to-[#0b0d13]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0d13]/80 backdrop-blur-xl">
        <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/8 text-white transition hover:border-white/28 hover:bg-white/14 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>

            <Link href="/" className="text-sm font-semibold text-white/88">
              EventForge
            </Link>
            <span className="text-xs uppercase tracking-[0.16em] text-white/45">
              {dashboardLabel}
            </span>
          </div>

          <p className="text-xs text-white/65 sm:text-sm">
            {session.user.name ?? session.user.email}
          </p>
        </div>
      </header>

      <div className="grid w-full grid-cols-1 lg:grid-cols-[280px_1fr]">
        <div className="hidden min-h-[calc(100vh-4rem)] lg:block">
          <DashboardSidebar
            title={navConfig.title}
            items={navConfig.items}
            activePath={pathname}
            onSignOut={handleSignOut}
          />
        </div>

        <main className="px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>

      {isMobileSidebarOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button
            className="absolute inset-0 bg-black/55"
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
