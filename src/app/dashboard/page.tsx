'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getPostLoginRoute } from '@/lib/auth-redirect';

export default function DashboardGatewayPage() {
  const { status, data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status !== 'authenticated' || !session?.user?.role) {
      router.replace('/');
      return;
    }

    router.replace(getPostLoginRoute(session.user.role));
  }, [router, session?.user?.role, status]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <p className="text-sm text-muted-foreground">Preparing your dashboard...</p>
    </main>
  );
}
