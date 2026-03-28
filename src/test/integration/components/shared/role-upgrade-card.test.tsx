import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RoleUpgradeCard } from '@/components/shared/role-upgrade-card';

const { mockPush, mockUpdate, mockToast } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockUpdate: vi.fn(async () => undefined),
  mockToast: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      accessToken: 'test-access-token',
    },
    update: mockUpdate,
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: mockToast,
}));

describe('RoleUpgradeCard', () => {
  it('upgrades role and redirects organizer to dashboard', async () => {
    const user = userEvent.setup();

    render(<RoleUpgradeCard />);

    await user.click(screen.getByRole('button', { name: 'Become Organizer' }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        user: {
          role: 'organizer',
        },
        accessToken: 'upgraded-token',
      });
    });

    expect(mockPush).toHaveBeenCalledWith('/dashboard/organizer');
    expect(mockToast).toHaveBeenCalledWith({ title: 'Organizer access enabled' });
  });
});
