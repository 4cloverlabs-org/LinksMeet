import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useAuth, authErrorMessage } from '../lib/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
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
    <div className="cc-auth">
      <div className="cc-auth-card">
        <Link to="/" className="cc-auth-brand" style={{ color: '#111', textDecoration: 'none' }}>
          <img src="/logo.png" alt="LinksMeet" style={{ width: '26px', height: '26px', objectFit: 'contain', borderRadius: '5px', marginRight: '6px' }} /> LinksMeet
        </Link>
        <h1>Create your account</h1>
        <p className="cc-auth-sub">Start organizing your pipeline in minutes. No credit card required.</p>

        {!configured && (
          <div className="cc-auth-notice">
            Firebase isn’t configured yet. Add your keys to <code>.env</code> (see <code>.env.example</code>) and restart the dev server to enable sign-up.
          </div>
        )}
        {err && <div className="cc-auth-error">{err}</div>}

        <form onSubmit={submit}>
          <label><span>Full name</span>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jane Cooper" autoComplete="name" />
          </label>
          <label><span>Work email</span>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@company.com" autoComplete="email" />
          </label>
          <label><span>Password</span>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" autoComplete="new-password" />
          </label>
          <button type="submit" className="cc-btn cc-btn-primary cc-btn-block" disabled={busy || !configured}>
            {busy ? 'Creating account…' : 'Create account'}
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
            width="320"
          />
        </div>

        <ul className="cc-auth-perks">
          <li><Check size={14} /> Your own private workspace</li>
          <li><Check size={14} /> 14-day free trial of every feature</li>
        </ul>

        <p className="cc-auth-alt">Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
}
