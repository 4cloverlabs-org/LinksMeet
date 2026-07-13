import React, { useState, useEffect } from 'react';
import { Sparkles, User, Globe, Calendar, Mail, CheckCircle2, ArrowRight, ArrowLeft, Loader2, X, RefreshCw, Rocket, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../lib/config';
import { campaignEngine } from './campaigns/campaignEngine';
import './CompleteProfileModal.css';

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
  userEmail?: string;
  userMetadata?: any;
  googleConnected?: boolean;
  onConnectGoogle?: () => void;
  onDisconnectGoogle?: () => void;
  onComplete: (updatedUser: any) => void;
}

export default function CompleteProfileModal({
  isOpen,
  onClose,
  userProfile,
  userEmail,
  userMetadata,
  googleConnected,
  onConnectGoogle,
  onDisconnectGoogle,
  onComplete
}: CompleteProfileModalProps) {
  const [step, setStep] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('google_connected') === 'true' || localStorage.getItem('sm_onboarding_step_3') === 'true') {
      localStorage.removeItem('sm_onboarding_step_3');
      return 3;
    }
    return 1;
  });
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [brandDesc, setBrandDesc] = useState('');
  const [disconnectedLocally, setDisconnectedLocally] = useState(false);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [connectedCals, setConnectedCals] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const loadUserData = async () => {
      let meta = userMetadata || {};
      let authEmail = userEmail;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          meta = { ...meta, ...(user.user_metadata || {}) };
          if (!authEmail) authEmail = user.email;
        }
      } catch (e) {
        console.error('Error fetching auth user for avatar:', e);
      }

      const googleAvatar = userProfile?.profile_picture || userProfile?.avatar_url || userProfile?.picture || meta.avatar_url || meta.picture || meta.avatar || '';
      const googleName = userProfile?.first_name || userProfile?.full_name || userProfile?.name || meta.full_name || meta.name || '';

      setName(googleName);
      const defaultUser = userProfile?.username || (authEmail ? authEmail.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '') : '');
      setUsername(defaultUser);
      setBio(userProfile?.bio || '');
      setWebsiteUrl(userProfile?.website_url || '');
      setBrandDesc(userProfile?.brand_description || '');
      setProfilePic(googleAvatar);
    };

    loadUserData();
  }, [userProfile, userEmail, userMetadata, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('google_connected') === 'true' || localStorage.getItem('sm_onboarding_step_3') === 'true') {
        localStorage.removeItem('sm_onboarding_step_3');
        setStep(3);
      }
    }
  }, [isOpen]);

  const isGoogleConnected = !disconnectedLocally && (googleConnected || Boolean(userProfile?.google_tokens?.access_token || userProfile?.google_tokens?.refresh_token));

  if (!isOpen) return null;

  const progressPercent = step === 1 ? 20 : step === 2 ? 60 : 90;
  const progressLabel = step === 1 
    ? '⚡ 20% Completed (Account Created)' 
    : step === 2 
    ? '⚡ 60% Completed (Personal Details Saved)' 
    : '⚡ 90% Completed (AI Profile Ready)';

  const handleAnalyze = async () => {
    if (!websiteUrl) {
      setError("Please enter your Website URL first to analyze.");
      return;
    }
    setError('');
    setIsAnalyzing(true);
    try {
      const data = await campaignEngine.scrapeUrlMetadata(websiteUrl);
      const formattedDesc = `Company Overview: ${data.companyOverview || 'N/A'}
Industry: ${data.industry || 'N/A'}
Products & Services: ${data.productsAndServices || 'N/A'}
Target Audience: ${data.targetAudience || 'N/A'}
Value Proposition: ${data.valueProposition || 'N/A'}
Brand Voice: ${data.brandVoice || 'N/A'}
Unique Selling Points: ${data.uniqueSellingPoints || 'N/A'}
Ideal Customer Profile: ${data.idealCustomerProfile || 'N/A'}`;
      setBrandDesc(formattedDesc);
    } catch (err: any) {
      setError("Failed to analyze website: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleCal = (calName: string) => {
    if (connectedCals.includes(calName)) {
      setConnectedCals(connectedCals.filter(c => c !== calName));
    } else {
      setConnectedCals([...connectedCals, calName]);
    }
  };

  const handleFinish = async () => {
    if (!username.trim()) {
      setError("Username is required to generate your booking link.");
      return;
    }

    setSaving(true);
    setError('');
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token || '';

      const res = await fetch(`${API_BASE_URL}/api/user/onboarding`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: name.trim(),
          username: username.trim(),
          bio: bio.trim(),
          website_url: websiteUrl.trim(),
          brand_description: brandDesc.trim(),
          profile_picture: profilePic
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save onboarding data');

      const updated = data.user || {
        ...userProfile,
        onboarding_completed: true,
        first_name: name.trim(),
        username: username.trim(),
        bio: bio.trim(),
        website_url: websiteUrl.trim(),
        brand_description: brandDesc.trim(),
        profile_picture: profilePic
      };

      onComplete(updated);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while completing your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cpm-overlay" onClick={onClose}>
      <div className="cpm-modal" onClick={e => e.stopPropagation()}>
        <button className="cpm-close-btn" onClick={onClose} title="Close & finish later">
          <X size={18} />
        </button>

        <div className="cpm-header">
          <div className="cpm-progress-meta">
            <div className="cpm-progress-left">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => { setError(''); setStep(step - 1); }}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '3px 9px', fontSize: '0.78rem', fontWeight: 700, color: '#334155', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', marginRight: '6px', transition: 'all 0.15s' }}
                >
                  <ArrowLeft size={13} /> Back
                </button>
              )}
              Step {step} of 3 <span className="cpm-dot">·</span> <span>{step === 1 ? '20% Completed' : step === 2 ? '60% Completed' : '90% Completed'}</span>
            </div>
          </div>
          <div className="cpm-progress-track">
            <div className="cpm-progress-bar" style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="cpm-title-section">
            <h2 className="cpm-title">Complete Your Profile</h2>
            <p className="cpm-subtitle">Set up your workspace to unlock AI sequences & instant booking links.</p>
          </div>
        </div>

        <div className="cpm-body">
          {error && (
            <div className="cpm-error-box">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <div className="cpm-step-content">
              {/* Row 1: Profile Pic & Full Name side-by-side (Identical 48px height) */}
              <div className="cpm-grid-2" style={{ marginBottom: '16px' }}>
                <div className="cpm-form-group" style={{ marginBottom: 0 }}>
                  <label>Profile Picture</label>
                  <div className="cpm-avatar-box">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="cpm-avatar-preview">
                        {profilePic ? (
                          <img src={profilePic} alt="Profile" />
                        ) : (
                          <span>{name ? name[0]?.toUpperCase() : 'A'}</span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 600 }}>Avatar</span>
                    </div>
                    <button
                      type="button"
                      className="cpm-btn-generate"
                      onClick={() => setProfilePic('https://api.dicebear.com/7.x/avataaars/svg?seed=' + Math.random())}
                    >
                      <Sparkles size={13} color="#2563eb" /> Generate
                    </button>
                  </div>
                </div>

                <div className="cpm-form-group" style={{ marginBottom: 0 }}>
                  <label>Your Full Name</label>
                  <div className="cpm-input-card">
                    <User size={16} color="#64748b" style={{ flexShrink: 0 }} />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Jane Cooper"
                    />
                    {name.trim() && <Check size={16} color="#10b981" style={{ flexShrink: 0 }} />}
                  </div>
                </div>
              </div>

              {/* Row 2: Scheduling URL Full Width Card (Plenty of horizontal space) */}
              <div className="cpm-form-group" style={{ marginBottom: '16px' }}>
                <label>Your Scheduling URL / Username</label>
                <div className="cpm-url-card">
                  <div className="cpm-url-prefix">linksmeet.com/</div>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="janecooper"
                  />
                  {username.trim() && <Check size={16} color="#10b981" style={{ marginRight: 14, flexShrink: 0 }} />}
                </div>
              </div>

              {/* Row 3: Short Bio Full Width Textarea (Compact 2 rows) */}
              <div className="cpm-form-group" style={{ marginBottom: 0 }}>
                <label>Short Bio</label>
                <div className="cpm-bio-box" style={{ height: '72px' }}>
                  <textarea
                    rows={2}
                    maxLength={160}
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Tell bookers a bit about yourself or your role..."
                  />
                  <div className="cpm-bio-counter">{bio.length}/160</div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="cpm-step-content">
              <div className="cpm-form-group" style={{ marginBottom: '16px' }}>
                <label>Company Website URL</label>
                <div className="cpm-input-card" style={{ paddingRight: 6 }}>
                  <Globe size={16} color="#64748b" style={{ flexShrink: 0 }} />
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={e => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourcompany.com"
                  />
                  <button
                    type="button"
                    className="cpm-btn-generate"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    style={{ padding: '6px 14px' }}
                  >
                    {isAnalyzing ? <Loader2 size={13} className="crm-spin" /> : <Sparkles size={13} color="#2563eb" />}
                    {isAnalyzing ? 'Analyzing...' : 'AI Analyze'}
                  </button>
                </div>

                <div style={{ background: '#f8fafc', border: '2px solid #E5E7EB', borderRadius: 14, padding: '10px 14px', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb', fontWeight: 700, fontSize: '0.82rem' }}>
                    <Sparkles size={15} color="#2563eb" /> AI Brand Extraction
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Click <b>AI Analyze</b> to automatically extract target audience & brand tone.
                  </span>
                </div>
              </div>

              <div className="cpm-form-group" style={{ marginBottom: 0 }}>
                <label>Brand & Services Description (AI Trained)</label>
                <div className="cpm-bio-box" style={{ height: '110px' }}>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={brandDesc}
                    onChange={e => setBrandDesc(e.target.value)}
                    placeholder="Describe your target audience, services, and brand tone. Our AI uses this to craft hyper-personalized follow-up email sequences for your leads!"
                  />
                  <div className="cpm-bio-counter">{brandDesc.length}/500</div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="cpm-step-content">
              <div className="cpm-form-group" style={{ marginBottom: '14px' }}>
                <label>Connect Your Google Workspace & Calendar</label>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '-2px 0 10px' }}>
                  Connect your Google account to unlock instant AI calendar scheduling without double-booking and automated email follow-up sequences.
                </p>
                <div className="cpm-cal-grid">
                  <div
                    className={`cpm-cal-card ${isGoogleConnected ? 'connected' : ''}`}
                    onClick={() => {
                      setDisconnectedLocally(false);
                      localStorage.setItem('sm_onboarding_step_3', 'true');
                      if (onConnectGoogle) {
                        onConnectGoogle();
                      } else {
                        window.location.href = `${API_BASE_URL}/auth/google?uid=${userProfile?.id || ''}&origin=${encodeURIComponent(window.location.origin)}`;
                      }
                    }}
                  >
                    <div className="cpm-cal-icon"><Calendar size={22} color="#EA4335" /></div>
                    <h4 style={{ fontSize: '0.88rem', margin: '6px 0 2px' }}>Google Calendar</h4>
                    <span style={{ fontSize: '0.78rem', color: isGoogleConnected ? '#059669' : '#2563eb', fontWeight: 700 }}>
                      {isGoogleConnected ? '✓ Connected' : '+ Connect'}
                    </span>
                  </div>

                  <div
                    className={`cpm-cal-card ${isGoogleConnected ? 'connected' : ''}`}
                    onClick={() => {
                      setDisconnectedLocally(false);
                      localStorage.setItem('sm_onboarding_step_3', 'true');
                      if (onConnectGoogle) {
                        onConnectGoogle();
                      } else {
                        window.location.href = `${API_BASE_URL}/auth/google?uid=${userProfile?.id || ''}&origin=${encodeURIComponent(window.location.origin)}`;
                      }
                    }}
                  >
                    <div className="cpm-cal-icon"><Mail size={22} color="#EA4335" /></div>
                    <h4 style={{ fontSize: '0.88rem', margin: '6px 0 2px' }}>Gmail / Google Workspace</h4>
                    <span style={{ fontSize: '0.78rem', color: isGoogleConnected ? '#059669' : '#2563eb', fontWeight: 700 }}>
                      {isGoogleConnected ? '✓ Connected' : '+ Connect'}
                    </span>
                  </div>
                </div>

                {isGoogleConnected && (
                  <div style={{ textAlign: 'center', marginTop: '12px' }}>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        setDisconnectedLocally(true);
                        if (onDisconnectGoogle) {
                          onDisconnectGoogle();
                        }
                        if (userProfile?.id) {
                          try {
                            await supabase.from('users').update({ google_tokens: null }).eq('id', userProfile.id);
                          } catch (err) {}
                        }
                        if (userProfile) {
                          userProfile.google_tokens = null;
                        }
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Disconnect Google Account (Reset for Testing)
                    </button>
                  </div>
                )}
              </div>

              <div style={{ background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '14px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '14px' }}>
                <CheckCircle2 size={22} color="#16a34a" />
                <div>
                  <h4 style={{ margin: '0 0 2px', fontSize: '0.9rem', color: '#14532d', fontWeight: 800 }}>Almost there!</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#166534' }}>
                    Click below to save your profile and jump right into your dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="cpm-footer">
          <button
            type="button"
            className="cpm-btn-ghost"
            onClick={onClose}
            disabled={saving}
          >
            Skip
          </button>

          {step < 3 ? (
            <button
              type="button"
              className="cpm-btn-primary"
              onClick={() => {
                if (step === 1 && !username.trim()) {
                  setError("Please enter a username to continue.");
                  return;
                }
                setError('');
                setStep(step + 1);
              }}
            >
              Next Step <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="cpm-btn-primary"
              onClick={handleFinish}
              disabled={saving}
            >
              {saving ? <Loader2 size={16} className="crm-spin" /> : <Check size={16} />}
              {saving ? 'Saving...' : 'Save & Complete Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
