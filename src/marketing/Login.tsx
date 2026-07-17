import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth, authErrorMessage } from '../lib/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import AuthBackground from './AuthBackground';
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
    <div className="cc-auth-split">
      {/* Right Graphic Side */}
      <div className="cc-auth-right">
        <AuthBackground />
        <div className="cc-auth-graphic-content">
          <h2>Effortlessly manage your scheduling and operations.</h2>
          <p>Log in to access your CRM dashboard and manage your team.</p>
        </div>
      </div>

      {/* Left Form Side */}
      <div className="cc-auth-left">
        <Link to="/" className="cc-auth-brand-top">
          <img src="/LinksMeet-without-bg.png" alt="LinksMeet" /> LinksMeet
        </Link>

        <div className="cc-auth-form-container">
          <h1>Welcome Back</h1>
          <p className="cc-auth-sub">Enter your email and password to access your account.</p>

          {!configured && (
            <div className="cc-auth-notice">
              Firebase isn’t configured yet. Add your keys to <code>.env</code> and restart the dev server to enable login.
            </div>
          )}
          {err && <div className="cc-auth-error">{err}</div>}

          <form className="cc-auth-form" onSubmit={submit}>
            <label><span>Email</span>
              <div className="cc-auth-input-wrapper">
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" autoComplete="email" />
              </div>
            </label>
            <label><span>Password</span>
              <div className="cc-auth-input-wrapper">
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Your password" autoComplete="current-password" />
              </div>
            </label>
            
            <div className="cc-auth-options">
              <label><input type="checkbox" /> Remember Me</label>
              <Link to="/forgot-password">Forgot Your Password?</Link>
            </div>

            <button type="submit" className="cc-btn-primary" disabled={busy || !configured}>
              {busy ? 'Logging in…' : 'Log In'}
            </button>
          </form>

          <div className="cc-auth-divider"><span>Or Login With</span></div>

          <div className="cc-oauth-grid" style={{ justifyContent: 'center' }}>
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
              width="100%"
            />
          </div>

          <p className="cc-auth-alt">Don't Have An Account? <Link to="/signup">Register Now.</Link></p>
        </div>

        <div className="cc-auth-footer">
          <span>Copyright © 2026 LinksMeet.</span>
          <Link to="/privacy-policy">Privacy Policy</Link>
        </div>
      </div>
    
    </div>
  );
}
