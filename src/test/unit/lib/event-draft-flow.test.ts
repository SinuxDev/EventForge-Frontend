import { describe, expect, it } from 'vitest';
import { getPostPublishRedirect } from '@/lib/event-draft-flow';

describe('getPostPublishRedirect', () => {
  it('returns organizer dashboard for organizer role', () => {
    expect(getPostPublishRedirect('organizer')).toBe('/dashboard/organizer');
  });

  it('returns admin dashboard for admin role', () => {
    expect(getPostPublishRedirect('admin')).toBe('/dashboard/admin');
  });

  it('defaults to organizer dashboard when role is undefined', () => {
    expect(getPostPublishRedirect(undefined)).toBe('/dashboard/organizer');
  });
});
