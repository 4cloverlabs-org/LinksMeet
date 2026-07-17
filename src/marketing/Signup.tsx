import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, authErrorMessage } from '../lib/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import AuthBackground from './AuthBackground';
import './Auth.css';

export default function Signup() {
  const { signUp, signInWithGoogle, configured } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const [form, setForm] = useState({ name: '', email: initialEmail, password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      setErr('Enter your name, email, and a password of at least 6 characters.');
      return;
    }
    setBusy(true);
    try {
      await signUp(form.name.trim(), form.email.trim(), form.password);
      navigate('/dashboard', { replace: true });
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
          <p>Sign up to access your CRM dashboard and manage your team.</p>
        </div>
      </div>

      {/* Left Form Side */}
      <div className="cc-auth-left">
        <Link to="/" className="cc-auth-brand-top">
          <img src="/LinksMeet-without-bg.png" alt="LinksMeet" /> LinksMeet
        </Link>

        <div className="cc-auth-form-container">
          <h1>Create your account</h1>
          <p className="cc-auth-sub">Enter your details to create your account and get started.</p>

          {!configured && (
            <div className="cc-auth-notice">
              Firebase isn’t configured yet. Add your keys to <code>.env</code> and restart the dev server to enable sign-up.
            </div>
          )}
          {err && <div className="cc-auth-error">{err}</div>}

          <form className="cc-auth-form" onSubmit={submit}>
            <label><span>Full name</span>
              <div className="cc-auth-input-wrapper">
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jane Cooper" autoComplete="name" />
              </div>
            </label>
            <label><span>Work email</span>
              <div className="cc-auth-input-wrapper">
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@company.com" autoComplete="email" />
              </div>
            </label>
            <label><span>Password</span>
              <div className="cc-auth-input-wrapper">
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" autoComplete="new-password" />
              </div>
            </label>
            
            <button type="submit" className="cc-btn-primary" disabled={busy || !configured} style={{ marginTop: '12px' }}>
              {busy ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="cc-auth-divider"><span>Or Register With</span></div>

          <div className="cc-oauth-grid" style={{ justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                if (!credentialResponse.credential) return;
                setErr('');
                setBusy(true);
                try {
                  await signInWithGoogle(credentialResponse.credential);
                  navigate('/dashboard', { replace: true });
                } catch (e) {
                  setErr(authErrorMessage(e));
                  setBusy(false);
                }
              }}
              onError={() => {
                setErr('Google Signup Failed');
              }}
              useOneTap
              width="100%"
            />
          </div>

          <p className="cc-auth-alt">Already have an account? <Link to="/login">Log in</Link></p>
        </div>

        <div className="cc-auth-footer">
          <span>Copyright © 2026 LinksMeet.</span>
          <Link to="/privacy-policy">Privacy Policy</Link>
        </div>
      </div>
    
    </div>
  );
}
