/**
 * Changelog API endpoint configuration, shared by the Vite dev proxy (config.mts)
 * and the client fetcher (theme/composables/useChangelogData.ts).
 *
 * Override with `VITE_CHANGELOG_ENDPOINT` (see .env.example). Must be a full URL
 * including the GraphQL path.
 */
export const DEFAULT_CHANGELOG_ENDPOINT = "https://changelog-i0d011qixh.erp.dev/query";

/** Same-origin path the dev server proxies to the upstream endpoint's origin. */
export const CHANGELOG_PROXY_PATH = "/__changelog-api";

export function resolveChangelogEndpoint(raw: string | undefined): URL {
  const value = raw?.trim() || DEFAULT_CHANGELOG_ENDPOINT;
  try {
    return new URL(value);
  } catch {
    throw new Error(
      `VITE_CHANGELOG_ENDPOINT must be a full URL (e.g. ${DEFAULT_CHANGELOG_ENDPOINT}), got: ${value}`,
    );
  }
}
