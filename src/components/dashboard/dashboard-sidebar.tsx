'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import type { DashboardNavItem } from '@/lib/dashboard-nav';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
  title: string;
  items: DashboardNavItem[];
  activePath: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
  onSignOut: () => void;
}

export function DashboardSidebar({
  title,
  items,
  activePath,
  isCollapsed = false,
  onToggleCollapse,
  onNavigate,
  onSignOut,
}: DashboardSidebarProps) {
  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <aside
      className={cn(
        'relative flex h-full w-full flex-col border-r border-white/10 bg-[#0f121b]/90 backdrop-blur-xl transition-all duration-300',
        isCollapsed ? 'p-3' : 'p-4'
      )}
    >
      {onToggleCollapse ? (
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-8 hidden h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-[#151b27] text-white/85 shadow-[0_10px_22px_rgba(0,0,0,0.35)] transition hover:border-white/35 hover:bg-[#1b2231] lg:inline-flex"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      ) : null}

      <div
        className={cn(
          'rounded-2xl border border-white/14 bg-white/5 transition-all duration-300',
          isCollapsed ? 'px-2 py-3 text-center' : 'px-4 py-3'
        )}
      >
        <p className="text-xs uppercase tracking-[0.16em] text-white/55">
          {isCollapsed ? 'EF' : 'EventForge'}
        </p>
        {!isCollapsed ? <p className="mt-1 text-sm font-semibold text-white">{title}</p> : null}
      </div>

      <nav className="mt-5 space-y-2">
        {items.map((item) => {
          const isActive = activePath === item.href || activePath.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavigate}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                'flex items-center rounded-xl border text-sm transition',
                isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
                isActive
                  ? 'border-[#00A896]/45 bg-[#00A896]/16 text-[#b5fff7]'
                  : 'border-transparent text-white/75 hover:border-white/18 hover:bg-white/8 hover:text-white'
              )}
            >
              <item.icon className="h-4 w-4" />
              {!isCollapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <button
          onClick={onSignOut}
          title={isCollapsed ? 'Sign Out' : undefined}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm font-semibold text-white/92 transition hover:border-white/35 hover:bg-white/16"
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed ? <span>Sign Out</span> : null}
        </button>
      </div>
    </aside>
  );
}
