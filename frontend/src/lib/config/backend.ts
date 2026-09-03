import { getApiBaseUrl, normalizeApiBaseUrl } from './api-url';

const configuredApiBaseUrl = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

export { getApiBaseUrl };

/** SSR / server-side default. Client code should call getApiBaseUrl(configuredApiBaseUrl). */
export const API_BASE_URL = configuredApiBaseUrl;

export function apiBaseUrl(): string {
  return getApiBaseUrl(configuredApiBaseUrl);
}
