'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/modules/global/auth-context';
import {
  fetchCurrentUser,
  loginWithPassword,
  signupWithPrivateRoute,
} from '@/lib/modules/global/utils/auth-api';
import { cn } from '@/lib/utils';

type Tab = 'login' | 'signup';

const inputClassName =
  'w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none disabled:opacity-50';

export function LoginForm({ redirectTo = '/' }: { redirectTo?: string }) {
  const router = useRouter();
  const { login } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function switchTab(next: Tab) {
    setTab(next);
    setError('');
    setEmail('');
    setPassword('');
    setFullName('');
  }

  async function afterAuth(token: string) {
    const user = await fetchCurrentUser(token);
    login(token, user);
    router.push(redirectTo);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const token = await loginWithPassword(email, password);
      await afterAuth(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Invalid email format');
      return;
    }
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    setIsLoading(true);
    try {
      await signupWithPrivateRoute(email, password, fullName);
      const token = await loginWithPassword(email, password);
      await afterAuth(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-100">Welcome back</h2>
        <p className="mt-2 font-mono text-xs text-slate-500">
          POST /api/v1/private/users/ · dev signup
        </p>
      </div>

      <div className="flex border-b border-slate-800">
        <button
          type="button"
          className={cn(
            'flex-1 py-3 text-sm font-medium transition',
            tab === 'login'
              ? 'border-b-2 border-sky-400/70 bg-sky-900/30 text-slate-100'
              : 'text-slate-500 hover:text-slate-300',
          )}
          onClick={() => switchTab('login')}
        >
          Login
        </button>
        <button
          type="button"
          className={cn(
            'flex-1 py-3 text-sm font-medium transition',
            tab === 'signup'
              ? 'border-b-2 border-emerald-400/70 bg-emerald-900/30 text-slate-100'
              : 'text-slate-500 hover:text-slate-300',
          )}
          onClick={() => switchTab('signup')}
        >
          Sign up
        </button>
      </div>

      <div className="space-y-4">
        {tab === 'login' ? (
          <form onSubmit={(e) => void handleLogin(e)} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className={inputClassName}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className={inputClassName}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-sky-500 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Logging in…
                </span>
              ) : (
                'Login'
              )}
            </button>
            <p className="text-center text-sm text-slate-500">
              No account?{' '}
              <button
                type="button"
                onClick={() => switchTab('signup')}
                className="font-medium text-emerald-400 hover:text-emerald-300"
              >
                Sign up
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={(e) => void handleSignup(e)} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className={inputClassName}
            />
            <input
              type="text"
              placeholder="Full name (optional)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              className={inputClassName}
            />
            <input
              type="password"
              placeholder="Password (min. 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className={inputClassName}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account…
                </span>
              ) : (
                'Create account'
              )}
            </button>
            <p className="text-center text-sm text-slate-500">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => switchTab('login')}
                className="font-medium text-sky-400 hover:text-sky-300"
              >
                Login
              </button>
            </p>
          </form>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-950/30 px-4 py-3 text-center text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}

export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Restoring session…
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
