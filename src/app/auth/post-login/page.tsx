'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getPostLoginRoute } from '@/lib/auth-redirect';

export default function PostLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status !== 'authenticated') {
      router.replace('/');
      return;
    }

    const role = session?.user?.role ?? 'attendee';
    router.replace(getPostLoginRoute(role));
  }, [status, session, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
    </main>
  );
}
