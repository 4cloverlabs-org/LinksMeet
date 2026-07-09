import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../lib/config';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const action = searchParams.get('action') || 'accept';
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberWorkspaceId, setMemberWorkspaceId] = useState('');

  useEffect(() => {
    if (!id) {
      setStatus('error');
      setErrorMsg('Invalid invitation link.');
      return;
    }

    const accept = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/team/accept-invite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, action })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStatus('success');
          setIsExistingUser(data.isExistingUser || false);
          if (data.member?.email) setMemberEmail(data.member.email);
          if (data.member?.user_id) setMemberWorkspaceId(data.member.user_id);
        } else {
          setStatus('error');
          setErrorMsg(data.error || 'Failed to accept invitation.');
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.message || 'An error occurred.');
      }
    };

    accept();
  }, [id]);

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    useEffect(() => {
      import('../lib/supabase').then(({ supabase }) => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setIsLoggedIn(!!session);
        });
      });
    }, []);

    const handleNext = () => {
      if (action === 'decline') {
        navigate('/');
      } else {
        if (memberWorkspaceId) {
          localStorage.setItem('sm_active_workspace', memberWorkspaceId);
          localStorage.setItem('sm_just_accepted_invite', 'true');
        }
        if (isLoggedIn) {
          // If already logged in, the active workspace is changed in localStorage, but we need to reload to take effect
          window.location.href = '/dashboard';
        }
        else if (isExistingUser) navigate(`/login?email=${encodeURIComponent(memberEmail)}`);
        else navigate(`/signup?email=${encodeURIComponent(memberEmail)}`);
      }
    };

    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ background: '#FFFFFF', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
          {status === 'loading' && (
            <>
              <Loader2 size={48} color="#2563EB" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
              <h2 style={{ margin: '0 0 8px', color: '#111827', fontSize: '24px' }}>Processing...</h2>
              <p style={{ color: '#6B7280', margin: 0 }}>Please wait while we update your invitation status.</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle2 size={48} color={action === 'decline' ? "#6B7280" : "#10B981"} style={{ margin: '0 auto 16px' }} />
              <h2 style={{ margin: '0 0 8px', color: '#111827', fontSize: '24px' }}>
                {action === 'decline' ? 'Invitation Declined' : 'Invitation Accepted!'}
              </h2>
              <p style={{ color: '#6B7280', margin: '0 0 24px' }}>
                {action === 'decline' ? 'You have declined the team invitation.' : 'You have successfully joined the team.'}
              </p>
              <button 
                onClick={handleNext}
                style={{ background: '#2563EB', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', fontWeight: 500 }}
              >
                {action === 'decline' ? 'Return Home' : (isLoggedIn ? 'Go to Dashboard' : (isExistingUser ? 'Log in to continue' : 'Sign up to continue'))}
              </button>
            </>
          )}
        {status === 'error' && (
          <>
            <XCircle size={48} color="#EF4444" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ margin: '0 0 8px', color: '#111827', fontSize: '24px' }}>Invalid Invitation</h2>
            <p style={{ color: '#6B7280', margin: '0 0 24px' }}>{errorMsg}</p>
            <button 
              onClick={() => navigate('/')}
              style={{ background: '#F3F4F6', color: '#374151', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', fontWeight: 500 }}
            >
              Return Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
