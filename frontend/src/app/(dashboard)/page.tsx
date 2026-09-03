'use client';

import { useEffect, useState } from 'react';
import { toSameOriginApiUrl } from '@/lib/config/api-url';
import { apiBaseUrl } from '@/lib/config/backend';
import { useAuth } from '@/lib/modules/global/auth-context';
import { fetchCurrentUser } from '@/lib/modules/global/utils/auth-api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { getToken } = useAuth();
  const [health, setHealth] = useState<boolean | null>(null);
  const [sample, setSample] = useState('…');
  const [apiError, setApiError] = useState<string | null>(null);
  const [meCheck, setMeCheck] = useState('not tested');
  const [meLoading, setMeLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const healthRes = await fetch(toSameOriginApiUrl(`${apiBaseUrl()}/utils/health-check`));
        setHealth(healthRes.ok ? await healthRes.json() : false);

        const sampleRes = await fetch(toSameOriginApiUrl(`${apiBaseUrl()}/sample`));
        if (sampleRes.ok) {
          const body = (await sampleRes.json()) as { message?: string };
          setSample(body.message ?? 'ok');
        } else {
          setSample(`HTTP ${sampleRes.status}`);
        }
      } catch (e) {
        setApiError(e instanceof Error ? e.message : 'Request failed');
      }
    }
    void load();
  }, []);

  async function testAuthenticatedMe() {
    const token = getToken();
    if (!token) {
      setMeCheck('no token in store');
      return;
    }
    setMeLoading(true);
    try {
      const user = await fetchCurrentUser(token);
      setMeCheck(`${user.email}${user.is_superuser ? ' (superuser)' : ''}`);
    } catch (e) {
      setMeCheck(e instanceof Error ? e.message : 'request failed');
    } finally {
      setMeLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          API health checks and session verification. Default superuser:{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">admin@example.com</code>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Authenticated /me</CardTitle>
            <CardDescription>Test GET /base/login/me with stored JWT</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => void testAuthenticatedMe()} disabled={meLoading}>
              {meLoading ? 'Calling /me…' : 'Test GET /base/login/me'}
            </Button>
            <p className="font-mono text-sm text-muted-foreground">{meCheck}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health check</CardTitle>
            <CardDescription>GET /api/v1/utils/health-check/</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={apiError ? 'destructive' : health ? 'default' : 'secondary'}>
                {apiError ? 'ERR' : health === null ? '…' : health ? '200' : '503'}
              </Badge>
              <span className="font-mono text-sm">
                {apiError ?? (health === null ? 'checking…' : String(health))}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sample module</CardTitle>
            <CardDescription>GET /api/v1/sample/</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm">{sample}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
