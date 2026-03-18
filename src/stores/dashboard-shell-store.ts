import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DashboardShellStore {
  isDesktopSidebarCollapsed: boolean;
  toggleDesktopSidebar: () => void;
}

export const useDashboardShellStore = create<DashboardShellStore>()(
  persist(
    (set) => ({
      isDesktopSidebarCollapsed: false,
      toggleDesktopSidebar: () =>
        set((state) => ({
          isDesktopSidebarCollapsed: !state.isDesktopSidebarCollapsed,
        })),
    }),
    {
      name: 'eventforge-dashboard-shell',
      partialize: (state) => ({
        isDesktopSidebarCollapsed: state.isDesktopSidebarCollapsed,
      }),
    }
  )
);
