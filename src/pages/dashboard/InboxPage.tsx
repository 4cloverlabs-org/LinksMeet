import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Mail, Loader2, Calendar, User, Search, RefreshCw, X, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../lib/config';

interface EmailMeta {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  date: string;
  unread: boolean;
}

export default function InboxPage() {
  const ctx = useOutletContext<any>();
  const { uid, handleConnectGoogle } = ctx || {};

  const [emails, setEmails] = useState<EmailMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedEmail, setSelectedEmail] = useState<EmailMeta | null>(null);
  const [emailBody, setEmailBody] = useState<string | null>(null);
  const [bodyLoading, setBodyLoading] = useState(false);

  const fetchInbox = async () => {
    if (!uid || uid === 'anon') return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/inbox?uid=${uid}`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError('unauthorized');
        } else {
          setError('Failed to fetch inbox');
        }
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      setEmails(data);
    } catch (err) {
      console.error(err);
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, [uid]);

  const loadEmailBody = async (email: EmailMeta) => {
    setSelectedEmail(email);
    setEmailBody(null);
    setBodyLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/inbox/${email.id}?uid=${uid}`);
      if (res.ok) {
        const data = await res.json();
        setEmailBody(data.body);
      } else {
        setEmailBody('Failed to load email content.');
      }
    } catch (err) {
      setEmailBody('Error loading email content.');
    } finally {
      setBodyLoading(false);
    }
  };

  if (error === 'unauthorized') {
    return (
      <div className="crm-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px', textAlign: 'center' }}>
        <div style={{ background: '#FEF2F2', padding: '16px', borderRadius: '50%', marginBottom: '24px', color: '#EF4444' }}>
          <Mail size={48} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>Inbox Access Required</h2>
        <p style={{ color: '#6B7280', maxWidth: '400px', lineHeight: 1.5, marginBottom: '32px' }}>
          To view your emails directly in the dashboard, we need permission to read your inbox. Please reconnect your Google account to grant this access.
        </p>
        <button 
          className="crm-btn" 
          onClick={handleConnectGoogle}
          style={{ background: '#2563EB', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" style={{ width: 18, height: 18, filter: 'brightness(0) invert(1)' }} />
          Reconnect Google Account
        </button>
      </div>
    );
  }

  return (
    <div className="crm-fade" style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      
      {/* Left Pane - Email List */}
      <div style={{ width: '380px', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', background: '#F9FAFB' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={20} color="#6B7280" /> Inbox
          </h2>
          <button onClick={fetchInbox} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }} title="Refresh Inbox">
            <RefreshCw size={16} />
          </button>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <Loader2 className="crm-spin-ic" size={24} color="#6B7280" />
            </div>
          ) : emails.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6B7280' }}>
              <p>Your inbox is empty.</p>
            </div>
          ) : (
            emails.map(email => {
              const isSelected = selectedEmail?.id === email.id;
              
              // Clean up the sender (extract name if possible)
              const senderMatch = email.from.match(/^([^<]+)/);
              const senderName = senderMatch ? senderMatch[1].replace(/"/g, '').trim() : email.from;
              
              // Format date nicely
              const d = new Date(email.date);
              const dateStr = !isNaN(d.getTime()) 
                ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                : '';

              return (
                <div 
                  key={email.id} 
                  onClick={() => loadEmailBody(email)}
                  style={{ 
                    padding: '16px 20px', 
                    borderBottom: '1px solid #E5E7EB',
                    background: isSelected ? '#EFF6FF' : (email.unread ? '#FFFFFF' : '#F9FAFB'),
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: email.unread ? 700 : 500, color: '#111827', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                      {senderName}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: email.unread ? '#2563EB' : '#9CA3AF', fontWeight: email.unread ? 600 : 400 }}>
                      {dateStr}
                    </span>
                  </div>
                  <div style={{ fontWeight: email.unread ? 600 : 400, color: '#374151', fontSize: '0.9rem', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {email.subject}
                  </div>
                  <div style={{ color: '#6B7280', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {email.snippet}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane - Email Detail */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF', overflow: 'hidden' }}>
        {selectedEmail ? (
          <>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #E5E7EB', background: '#FFFFFF' }}>
              <h1 style={{ margin: '0 0 16px 0', fontSize: '1.5rem', fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
                {selectedEmail.subject}
              </h1>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', fontWeight: 600 }}>
                    {selectedEmail.from.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>{selectedEmail.from}</div>
                    <div style={{ color: '#6B7280', fontSize: '0.85rem' }}>{new Date(selectedEmail.date).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
              {bodyLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '40px' }}>
                  <Loader2 className="crm-spin-ic" size={32} color="#6B7280" />
                </div>
              ) : (
                <div 
                  className="email-body-content"
                  style={{ color: '#374151', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '800px' }}
                  dangerouslySetInnerHTML={{ __html: emailBody || '' }} 
                />
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9CA3AF' }}>
            <Mail size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
            <p style={{ fontSize: '1.1rem', margin: 0 }}>Select an email to read</p>
          </div>
        )}
      </div>

    </div>
  );
}
