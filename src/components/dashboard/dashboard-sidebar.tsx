'use client';

import Link from 'next/link';
import { LogOut } from 'lucide-react';
import type { DashboardNavItem } from '@/lib/dashboard-nav';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
  title: string;
  items: DashboardNavItem[];
  activePath: string;
  onNavigate?: () => void;
  onSignOut: () => void;
}

export function DashboardSidebar({
  title,
  items,
  activePath,
  onNavigate,
  onSignOut,
}: DashboardSidebarProps) {
  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <aside className="flex h-full w-full flex-col border-r border-white/10 bg-[#0f121b]/90 p-4 backdrop-blur-xl">
      <div className="rounded-2xl border border-white/14 bg-white/5 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.16em] text-white/55">EventForge</p>
        <p className="mt-1 text-sm font-semibold text-white">{title}</p>
      </div>

      <nav className="mt-5 space-y-2">
        {items.map((item) => {
          const isActive = activePath === item.href || activePath.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavigate}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition',
                isActive
                  ? 'border-[#00A896]/45 bg-[#00A896]/16 text-[#b5fff7]'
                  : 'border-transparent text-white/75 hover:border-white/18 hover:bg-white/8 hover:text-white'
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <button
          onClick={onSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm font-semibold text-white/92 transition hover:border-white/35 hover:bg-white/16"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
