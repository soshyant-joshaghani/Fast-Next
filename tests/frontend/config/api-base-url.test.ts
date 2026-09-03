import { describe, expect, it, vi } from 'vitest';
import {
  getApiBaseUrl,
  isLocalDevApiUrl,
  normalizeApiBaseUrl,
  toSameOriginApiUrl,
} from '../../../frontend/src/lib/config/api-url';

describe('normalizeApiBaseUrl', () => {
  it('defaults to /api/v1 without trailing slash', () => {
    expect(normalizeApiBaseUrl(undefined)).toBe('/api/v1');
  });

  it('strips trailing slash', () => {
    expect(normalizeApiBaseUrl('/api/v1/')).toBe('/api/v1');
  });
});

describe('isLocalDevApiUrl', () => {
  it('detects localhost:8000', () => {
    expect(isLocalDevApiUrl('http://localhost:8000/api/v1')).toBe(true);
  });

  it('detects api.localhost', () => {
    expect(isLocalDevApiUrl('http://api.localhost/api/v1')).toBe(true);
  });
});

describe('getApiBaseUrl', () => {
  it('keeps production API URL in the browser', () => {
    vi.stubGlobal('window', { location: { hostname: 'app.example.com', port: '' } });
    expect(getApiBaseUrl('https://api.example.com/api/v1')).toBe('https://api.example.com/api/v1');
    vi.unstubAllGlobals();
  });

  it('forces /api/v1 for local API URLs in the browser', () => {
    vi.stubGlobal('window', { location: { hostname: 'dashboard.localhost', port: '' } });
    expect(getApiBaseUrl('http://localhost:8000/api/v1')).toBe('/api/v1');
    vi.unstubAllGlobals();
  });
});

describe('toSameOriginApiUrl', () => {
  it('rewrites localhost:8000 to a relative path', () => {
    expect(toSameOriginApiUrl('http://localhost:8000/api/v1/sample/notes/')).toBe(
      '/api/v1/sample/notes/',
    );
  });
});
