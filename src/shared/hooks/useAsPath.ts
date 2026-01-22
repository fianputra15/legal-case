'use client'
import { usePathname } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';

export function useAsPath() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Only access search params on client side after hydration
    if (typeof window !== 'undefined') {
      setSearchQuery(window.location.search);
    }
  }, []);

  const asPath = useMemo(() => {
    return searchQuery ? `${pathname}${searchQuery}` : pathname;
  }, [pathname, searchQuery]);

  return asPath;
}
