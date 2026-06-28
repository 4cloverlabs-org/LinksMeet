// Gmail token handling.
//
// SECURITY: the Gmail access token can send email on the user's behalf, so it is
// deliberately NOT persisted to localStorage (which any XSS can read). It is held
// in memory for the lifetime of the page only. The durable credential (the OAuth
// refresh token) lives server-side in Supabase `users.google_tokens`; the backend
// `/api/gmail-token/:uid` endpoint re-issues a fresh access token on demand, so a
// page reload simply re-fetches it rather than relying on a stored copy.
//
// Only non-secret signals are persisted: the connected email address (for display)
// and a boolean "connected" flag (for the UI indicator).

let inMemoryGmailToken: string | null = null;

const EMAIL_KEY = 'sm_gmail_email';
const CONNECTED_KEY = 'sm_gmail_connected';
const LEGACY_TOKEN_KEY = 'sm_gmail_token';

export function setGmailToken(token: string | null): void {
  inMemoryGmailToken = token || null;
}

export function getGmailToken(): string | null {
  return inMemoryGmailToken;
}

// Records a successful connection. The email is not secret and is safe to persist.
export function markGmailConnected(email?: string): void {
  try {
    localStorage.setItem(CONNECTED_KEY, 'true');
    if (email) localStorage.setItem(EMAIL_KEY, email);
    // Remove any token left in localStorage by older builds.
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch { /* ignore storage errors */ }
}

export function isGmailConnected(): boolean {
  try {
    return localStorage.getItem(CONNECTED_KEY) === 'true' || !!inMemoryGmailToken;
  } catch {
    return !!inMemoryGmailToken;
  }
}

export function getGmailEmail(): string | null {
  try { return localStorage.getItem(EMAIL_KEY); } catch { return null; }
}

export function clearGmail(): void {
  inMemoryGmailToken = null;
  try {
    localStorage.removeItem(CONNECTED_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch { /* ignore */ }
}
