import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth, authErrorMessage } from '../lib/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import './Auth.css';

export default function Login() {
  const { logIn, signInWithGoogle, configured, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const initialEmail = searchParams.get('email') || '';
  const [form, setForm] = useState({ email: initialEmail, password: '' });
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


  return (
    <div className="cc-auth">
      <div className="cc-auth-card">
        <Link to="/" className="cc-auth-brand" style={{ color: '#111', textDecoration: 'none' }}>
          <img src="/logo.png" alt="LinksMeet" style={{ width: '26px', height: '26px', objectFit: 'contain', borderRadius: '5px', marginRight: '6px' }} /> LinksMeet
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

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              if (!credentialResponse.credential) return;
              setErr('');
              setBusy(true);
              try {
                await signInWithGoogle(credentialResponse.credential);
                navigate(from, { replace: true });
              } catch (e) {
                setErr(authErrorMessage(e));
                setBusy(false);
              }
            }}
            onError={() => {
              setErr('Google Login Failed');
            }}
            useOneTap
            width="320"
          />
        </div>

        <p className="cc-auth-alt">New to LinksMeet? <Link to="/signup">Create an account</Link></p>
      </div>
    </div>
  );
}
