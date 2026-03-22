// ─── UI Store (Zustand) ───────────────────────────────────────────────────────
// Manages global UI state: theme and modal visibility.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface UiState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  // Modal control
  isRsvpModalOpen: boolean;
  rsvpEventId: string | null;
  openRsvpModal: (eventId: string) => void;
  closeRsvpModal: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      isRsvpModalOpen: false,
      rsvpEventId: null,
      openRsvpModal: (eventId) => set({ isRsvpModalOpen: true, rsvpEventId: eventId }),
      closeRsvpModal: () => set({ isRsvpModalOpen: false, rsvpEventId: null }),
    }),
    { name: 'eventforge-ui', partialize: (state) => ({ theme: state.theme }) }
  )
);
