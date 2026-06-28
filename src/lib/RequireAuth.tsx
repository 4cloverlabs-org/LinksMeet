import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const location = useLocation();

  if (!configured) return <Navigate to="/login" replace state={{ from: location }} />;
  
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ width: 34, height: 34, border: '3px solid #ececf0', borderTopColor: '#0E61F3', borderRadius: '50%', animation: 'crmSpin 0.7s linear infinite' }} />
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
  
  return <>{children}</>;
}
