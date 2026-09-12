/**
 * Changelog API endpoint configuration, shared by the Vite dev proxy (config.mts)
 * and the client fetcher (theme/composables/useChangelogData.ts).
 *
 * The endpoint is intentionally not defaulted in source. It must be supplied via
 * `VITE_CHANGELOG_ENDPOINT` (a full URL including the GraphQL path) — locally in
 * `.env` (see .env.example), in CI via the repository variable of the same name.
 */
export const CHANGELOG_ENDPOINT_VAR = "VITE_CHANGELOG_ENDPOINT";

/** Same-origin path the dev server proxies to the upstream endpoint's origin. */
export const CHANGELOG_PROXY_PATH = "/__changelog-api";

export function resolveChangelogEndpoint(raw: string | undefined): URL {
  const value = raw?.trim();
  if (!value) {
    throw new Error(
      `${CHANGELOG_ENDPOINT_VAR} is not set. Add it to .env (see .env.example) or the CI environment.`,
    );
  }
  try {
    return new URL(value);
  } catch {
    throw new Error(`${CHANGELOG_ENDPOINT_VAR} must be a full URL, got: ${value}`);
  }
}
