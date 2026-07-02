// Centralized runtime configuration.
//
// API base URL for the LinksMeet backend. Override per-environment with
// VITE_API_URL in your .env (e.g. https://api.yourdomain.com). Falls back to
// the local dev server. Trailing slashes are trimmed so callers can safely
// do `${API_BASE_URL}/api/...`.
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3001'
).replace(/\/+$/, '');
