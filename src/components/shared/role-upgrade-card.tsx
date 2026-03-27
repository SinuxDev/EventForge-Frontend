'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

interface UpgradeRoleResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      role: 'attendee' | 'organizer' | 'admin';
    };
    accessToken: string;
  };
}

interface RoleUpgradeCardProps {
  title?: string;
  description?: string;
  buttonLabel?: string;
}

export function RoleUpgradeCard({
  title = 'Become an organizer',
  description = 'Switch to organizer access to create events, publish pages, and manage registrations.',
  buttonLabel = 'Become Organizer',
}: RoleUpgradeCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session, update } = useSession();
  const router = useRouter();

  const handleUpgrade = async () => {
    if (!session?.accessToken) {
      toast({ title: 'Please sign in again to continue', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await apiClient.post<UpgradeRoleResponse>(
        '/auth/upgrade-role',
        { role: 'organizer' },
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      await update({
        user: {
          role: result.data.user.role,
        },
        accessToken: result.data.accessToken,
      });

      toast({ title: 'Organizer access enabled' });
      router.push('/dashboard/organizer');
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : 'Unable to upgrade role',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Organizer Access</p>
      <h2 className="mt-3 text-2xl font-semibold text-foreground">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>

      <button
        onClick={handleUpgrade}
        disabled={isSubmitting}
        className="mt-6 relative cursor-pointer overflow-hidden rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_28px_rgba(0,168,150,0.32)] transition-all duration-200 ease-out before:absolute before:inset-y-0 before:-left-10 before:w-10 before:rotate-12 before:bg-white/45 before:opacity-0 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_14px_36px_rgba(0,168,150,0.38)] hover:before:left-[115%] hover:before:opacity-100 hover:before:transition-all hover:before:duration-500 disabled:cursor-not-allowed disabled:opacity-65"
      >
        {isSubmitting ? 'Upgrading...' : buttonLabel}
      </button>
    </section>
  );
}
