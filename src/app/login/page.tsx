'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/features/auth/login';
import { useAuth } from '@/shared/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // If user is already authenticated, redirect to homepage
    if (!isLoading && user) {
      console.log('LoginPage: User already authenticated, redirecting to homepage');
      router.push('/');
    }
  }, [user, isLoading, router]);
  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is authenticated, don't show login form
  if (user) {
    return null; // Redirecting...
  }

  return <LoginForm />;
}