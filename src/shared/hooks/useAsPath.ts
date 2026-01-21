'use client'
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export function useAsPath() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const asPath = useMemo(() => {
    const query = searchParams?.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  return asPath;
}
