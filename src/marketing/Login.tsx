import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, authErrorMessage } from '../lib/AuthContext';
import './Auth.css';

export default function Login() {
  const { logIn, signInWithGoogle, configured, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!form.email.trim() || !form.password) { setErr('Enter your email and password.'); return; }
    setBusy(true);
    try {
      await logIn(form.email.trim(), form.password);
      navigate(from, { replace: true });
    } catch (e) {
      setErr(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setErr('');
    setBusy(true);
    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (e) {
      setErr(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cc-auth">
      <div className="cc-auth-card">
        <Link to="/" className="cc-auth-brand" style={{ color: '#111', textDecoration: 'none' }}>
          <div style={{ width: '10px', height: '10px', background: '#111', transform: 'rotate(45deg)', borderRadius: '1px' }} /> SaleMail
        </Link>
        <h1>Welcome back</h1>
        <p className="cc-auth-sub">Log in to your workspace.</p>

        {!configured && (
          <div className="cc-auth-notice">
            Firebase isn’t configured yet. Add your keys to <code>.env</code> (see <code>.env.example</code>) and restart the dev server to enable login.
          </div>
        )}
        {err && <div className="cc-auth-error">{err}</div>}

        <form onSubmit={submit}>
          <label><span>Email</span>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@company.com" autoComplete="email" />
          </label>
          <label><span>Password</span>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Your password" autoComplete="current-password" />
          </label>
          <button type="submit" className="cc-btn cc-btn-primary cc-btn-block" disabled={busy || !configured}>
            {busy ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <div className="cc-auth-divider"><span>or</span></div>

        <button type="button" className="cc-btn cc-btn-google cc-btn-block" disabled={busy || !configured} onClick={handleGoogle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className="cc-auth-alt">New to SaleMail? <Link to="/signup">Create an account</Link></p>
      </div>
    </div>
  );
}
