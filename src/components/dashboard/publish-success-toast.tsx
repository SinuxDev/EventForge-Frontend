'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

export function PublishSuccessToast() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasShownRef = useRef(false);

  useEffect(() => {
    const publishedFlag = searchParams.get('published');
    const updatedFlag = searchParams.get('updated');

    if ((publishedFlag !== '1' && updatedFlag !== '1') || hasShownRef.current) {
      return;
    }

    hasShownRef.current = true;
    toast({
      title: publishedFlag === '1' ? 'Event published successfully' : 'Event updated successfully',
    });

    const params = new URLSearchParams(searchParams.toString());
    params.delete('published');
    params.delete('updated');
    const queryString = params.toString();
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/dashboard';

    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [router, searchParams]);

  return null;
}
