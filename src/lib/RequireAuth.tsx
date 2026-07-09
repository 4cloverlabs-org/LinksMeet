import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { type ReactNode, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from './supabase';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, configured, needsWorkspaceSelection } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      return;
    }

    let mounted = true;
    supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (!error && data) {
          if (location.pathname === '/onboarding') {
            navigate('/dashboard', { replace: true });
          }
        }
        setProfileLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user, location.pathname, navigate]);

  if (!configured) return <Navigate to="/login" replace state={{ from: location }} />;
  
  if (loading || (user && profileLoading)) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ width: 34, height: 34, border: '3px solid #ececf0', borderTopColor: '#7d3bec', borderRadius: '50%', animation: 'crmSpin 0.7s linear infinite' }} />
      </div>
    );
  }

  if (!user) {
    if (window.location.hash.includes('error=')) {
      return (
        <div style={{ padding: 40, color: 'red', textAlign: 'center' }}>
          <h2>Authentication Error</h2>
          <p>{decodeURIComponent(window.location.hash)}</p>
          <button onClick={() => window.location.href = '/login'}>Back to Login</button>
        </div>
      );
    }
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return (
    <>
      {children}
    </>
  );
}
