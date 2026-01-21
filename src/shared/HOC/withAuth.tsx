'use client';
import type { FC } from 'react';
import { useAuth } from '../lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const withAuthProtection = <T extends object>(WrappedComponent: FC<T>) => {
  const WithProtectedComponent = (props: T) => {
    const { isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // If loading is complete and user is not authenticated, redirect to login
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isLoading, isAuthenticated, router]);

    // Show loading state
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    // Don't render component if not authenticated (redirect will happen)
    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  WithProtectedComponent.displayName = `withAuthProtection(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithProtectedComponent;
};
