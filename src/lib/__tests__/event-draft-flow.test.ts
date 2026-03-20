import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getPostPublishRedirect } from '@/lib/event-draft-flow';

describe('getPostPublishRedirect', () => {
  it('returns organizer dashboard for organizer role', () => {
    assert.equal(getPostPublishRedirect('organizer'), '/dashboard/organizer');
  });

  it('returns admin dashboard for admin role', () => {
    assert.equal(getPostPublishRedirect('admin'), '/dashboard/admin');
  });

  it('defaults to organizer dashboard when role is undefined', () => {
    assert.equal(getPostPublishRedirect(undefined), '/dashboard/organizer');
  });
});
