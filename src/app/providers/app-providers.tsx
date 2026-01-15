'use client';

import { ReactNode } from 'react';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * App-level providers wrapper
 * Add your global providers here (Theme, React Query, Auth, etc.)
 */
export default function AppProviders({ children }: AppProvidersProps) {
  return (
    // Add your providers here
    // <ThemeProvider>
    //   <QueryProvider>
    //     <AuthProvider>
    //       {children}
    //     </AuthProvider>
    //   </QueryProvider>
    // </ThemeProvider>
    <>{children}</>
  );
}