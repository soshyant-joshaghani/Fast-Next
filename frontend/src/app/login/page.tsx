'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/modules/global/auth-context';
import { LoginForm } from '@/components/auth/LoginForm';
import { APP_NAME } from '@/lib/modules/global';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Welcome to
        </p>
        <h1 className="text-3xl font-bold">{APP_NAME}</h1>
      </div>
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        <LoginForm redirectTo="/" />
      </div>
    </div>
  );
}
