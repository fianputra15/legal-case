'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/shared/lib/auth';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * App-level providers wrapper
 * Includes AuthProvider for authentication management
 */
export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}