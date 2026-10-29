/** Pure helper — safe to import from Vitest without Next.js env. */
export function normalizeApiBaseUrl(value: string | undefined, fallback = '/api/v1'): string {
  return (value ?? fallback).replace(/\/$/, '');
}

/** True when the configured API URL points at the local FastAPI dev server. */
export function isLocalDevApiUrl(configured: string): boolean {
  if (!configured.startsWith('http://') && !configured.startsWith('https://')) return false;
  try {
    const { hostname, port } = new URL(configured);
    return (hostname === 'localhost' && port === '8000') || hostname === 'api.localhost';
  } catch {
    return false;
  }
}

/**
 * Browser fetch base URL.
 * Never call http://localhost:8000 from the dashboard — use the /api/v1 proxy.
 */
export function getApiBaseUrl(configured: string): string {
  if (typeof window === 'undefined') return configured;
  const base = normalizeApiBaseUrl(configured);
  if (!base.startsWith('http')) return base;
  if (isLocalDevApiUrl(base)) return '/api/v1';
  return base;
}

/** Rewrite any stray absolute local API URL to the same-origin proxy path. */
export function toSameOriginApiUrl(url: string): string {
  if (url.startsWith('http://localhost:8000')) {
    return url.slice('http://localhost:8000'.length);
  }
  if (url.startsWith('http://api.localhost')) {
    return url.slice('http://api.localhost'.length);
  }
  return url;
}
