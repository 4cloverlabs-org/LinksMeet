import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, User, Globe, Calendar, Mail, CheckCircle2, Loader2, Check, AlertCircle, Copy, MessageCircle, Twitter, Linkedin, Github, Youtube, PieChart, Briefcase, Zap, Building2, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../lib/config';
import { campaignEngine } from '../components/campaigns/campaignEngine';
import './Onboarding.css';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('google_connected') === 'true' || localStorage.getItem('sm_onboarding_step_3') === 'true') {
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
  
  const [googleConnected, setGoogleConnected] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const meta = user.user_metadata || {};
          const authEmail = user.email;
          
          const googleAvatar = meta.avatar_url || meta.picture || meta.avatar || '';
          const googleName = meta.full_name || meta.name || '';
          
          const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
          
          setName(profile?.first_name || profile?.full_name || profile?.name || googleName);
          setUsername(profile?.username || (authEmail ? authEmail.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '') : ''));
          setBio(profile?.bio || '');
          setWebsiteUrl(profile?.website_url || '');
          setBrandDesc(profile?.brand_description || '');
          setProfilePic(profile?.profile_picture || profile?.avatar_url || googleAvatar);
          
          if (profile?.google_tokens?.refresh_token) {
            setGoogleConnected(true);
          }
        }
      } catch (e) {
        console.error('Error loading user data:', e);
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('google_connected') === 'true' || localStorage.getItem('sm_onboarding_step_3') === 'true') {
      localStorage.removeItem('sm_onboarding_step_3');
      setGoogleConnected(true);
      setStep(3);
    }
  }, []);

  const isGoogleConnected = !disconnectedLocally && googleConnected;

  const handleAnalyze = async () => {
    if (!websiteUrl) {
      setError("Please enter your Website URL first to analyze.");
      return;
    }
    setError('');
    setIsAnalyzing(true);
    try {
      const data = await campaignEngine.scrapeUrlMetadata(websiteUrl);
      const formattedDesc = `Company Overview: ${data.companyOverview || 'N/A'}\nIndustry: ${data.industry || 'N/A'}\nProducts & Services: ${data.productsAndServices || 'N/A'}\nTarget Audience: ${data.targetAudience || 'N/A'}\nValue Proposition: ${data.valueProposition || 'N/A'}\nBrand Voice: ${data.brandVoice || 'N/A'}\nUnique Selling Points: ${data.uniqueSellingPoints || 'N/A'}\nIdeal Customer Profile: ${data.idealCustomerProfile || 'N/A'}`;
      setBrandDesc(formattedDesc);
    } catch (err: any) {
      setError("Failed to analyze website: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFinish = async () => {
    if (step === 1 && !username.trim()) {
      setError("Username is required.");
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

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong while completing your profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleConnectGoogle = () => {
    setDisconnectedLocally(false);
    localStorage.setItem('sm_onboarding_step_3', 'true');
    window.location.href = `${API_BASE_URL}/auth/google?uid=${userId}&origin=${encodeURIComponent(window.location.origin)}&returnPath=${encodeURIComponent(window.location.pathname)}`;
  };

  return (
    <div className="onb-ui-wrapper">
      {/* Left Sidebar */}
      <div className="onb-ui-sidebar">
        <div className="onb-ui-brand">
          <img src="/LinksMeet-without-bg.png" alt="LinksMeet" /> LinksMeet
        </div>
        
        <div className="onb-ui-support-list">
          <div className="onb-ui-progress-tracker">
            <div className="onb-ui-step-item done">
              <div className="step-circle"><Check size={14} strokeWidth={3} /></div>
              <div className="step-line"></div>
              <div className="step-content">
                <h4>Account created</h4>
                <p>You're successfully registered.</p>
              </div>
            </div>
            
            <div className={`onb-ui-step-item ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`}>
              <div className="step-circle">{step > 1 ? <Check size={14} strokeWidth={3} /> : <span className="step-dot"></span>}</div>
              <div className="step-line"></div>
              <div className="step-content">
                <h4>Personal details</h4>
                <p>Set up your profile and bio.</p>
              </div>
            </div>
            
            <div className={`onb-ui-step-item ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}>
              <div className="step-circle">{step > 2 ? <Check size={14} strokeWidth={3} /> : <span className="step-dot"></span>}</div>
              <div className="step-line"></div>
              <div className="step-content">
                <h4>Company & brand</h4>
                <p>Train AI for your sequences.</p>
              </div>
            </div>
            
            <div className={`onb-ui-step-item ${step === 3 ? 'active' : ''}`}>
              <div className="step-circle"><span className="step-dot"></span></div>
              <div className="step-content">
                <h4>Connect calendar</h4>
                <p>Sync your Google workspace.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="onb-ui-socials">
          <Twitter size={18} />
          <Linkedin size={18} />
          <Github size={18} />
          <Youtube size={18} />
        </div>
      </div>

      {/* Right Content */}
      <div className="onb-ui-main">
        <div className="onb-ui-content-box">
          
          {step === 1 && (
            <div className="onb-ui-step-anim">
              <div className="onb-ui-icon-header">
                <div className="onb-ui-icon-circle"><User size={24} color="#6b7280" /></div>
              </div>
              <h1 className="onb-ui-title">Complete your profile</h1>
              <p className="onb-ui-subtitle">Let's get your workspace set up with your personal details.</p>
              
              {error && <div className="onb-ui-error"><AlertCircle size={16} />{error}</div>}

              <div className="onb-ui-form">
                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                  <div className="onb-ui-field" style={{ flexShrink: 0 }}>
                    <label>Profile Picture</label>
                    <div className="onb-ui-avatar-row" style={{ marginLeft: '22px' }}>
                      <div className="onb-ui-avatar">
                        {profilePic ? <img src={profilePic} alt="Profile" /> : <span>{name ? name[0]?.toUpperCase() : 'A'}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="onb-ui-field" style={{ flex: 1 }}>
                    <label>Your Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Cooper" className="onb-ui-input" style={{ marginTop: '12px' }} />
                  </div>
                </div>

                <div className="onb-ui-field">
                  <label>Scheduling URL</label>
                  <div className="onb-ui-input-prefix">
                    <span className="prefix">linksmeet.com/</span>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="janecooper" />
                  </div>
                </div>
                
                <div className="onb-ui-field">
                  <label>Short Bio</label>
                  <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell bookers a bit about yourself..." className="onb-ui-input" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="onb-ui-step-anim">
              <div className="onb-ui-icon-header">
                <div className="onb-ui-icon-circle"><Globe size={24} color="#6b7280" /></div>
              </div>
              <h1 className="onb-ui-title">Company & Brand</h1>
              <p className="onb-ui-subtitle">We use this to train our AI for your follow-up email sequences.</p>
              
              {error && <div className="onb-ui-error"><AlertCircle size={16} />{error}</div>}

              <div className="onb-ui-form">
                <div className="onb-ui-field">
                  <label>Company Website URL</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://yourcompany.com" className="onb-ui-input" />
                    <button type="button" className="onb-ui-btn-outline" onClick={handleAnalyze} disabled={isAnalyzing} style={{ flexShrink: 0 }}>
                      {isAnalyzing ? <Loader2 size={16} className="crm-spin" /> : <Sparkles size={16} />}
                      {isAnalyzing ? 'Analyzing...' : 'AI Analyze'}
                    </button>
                  </div>
                </div>

                <div className="onb-ui-field">
                  <label>Brand & Services Description</label>
                  <textarea rows={6} value={brandDesc} onChange={e => setBrandDesc(e.target.value)} placeholder="Describe your target audience and brand tone..." className="onb-ui-input" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="onb-ui-step-anim">
              <div className="onb-ui-icon-header">
                <div className="onb-ui-icon-circle"><Calendar size={24} color="#6b7280" /></div>
              </div>
              <h1 className="onb-ui-title">Connect your calendar</h1>
              <p className="onb-ui-subtitle">Sync your Google Workspace to prevent double-bookings and automate emails.</p>
              
              <div className="onb-ui-form">
                <div className="onb-ui-cal-grid">
                  <div className={`onb-ui-cal-card ${isGoogleConnected ? 'active' : ''}`} onClick={handleConnectGoogle}>
                    <div className="cal-header">
                      <div className="cal-icon"><Calendar size={20} /></div>
                      <div className="cal-radio"><div className="dot"></div></div>
                    </div>
                    <h4>Google Calendar</h4>
                    <p>I need my schedule synced.</p>
                  </div>

                  <div className={`onb-ui-cal-card ${isGoogleConnected ? 'active' : ''}`} onClick={handleConnectGoogle}>
                    <div className="cal-header">
                      <div className="cal-icon"><Mail size={20} /></div>
                      <div className="cal-radio"><div className="dot"></div></div>
                    </div>
                    <h4>Gmail / Workspace</h4>
                    <p>I need to send emails.</p>
                  </div>
                </div>

                {isGoogleConnected && (
                  <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <button type="button" onClick={() => { setDisconnectedLocally(true); setGoogleConnected(false); }} className="onb-ui-disconnect">
                      Disconnect Account
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="onb-ui-footer">
            {step > 1 ? (
              <button type="button" className="onb-ui-btn-back" onClick={() => { setError(''); setStep(step - 1); }}>
                <ChevronLeft size={16} /> Go back
              </button>
            ) : (
              <div></div> // Empty div for flex space-between alignment
            )}
            
            {step < 3 ? (
              <button 
                type="button" 
                className="onb-ui-btn-next" 
                disabled={(step === 2 && !brandDesc.trim()) || isAnalyzing}
                onClick={() => {
                  if (step === 1 && !username.trim()) { setError("Username is required."); return; }
                  setError(''); setStep(step + 1);
                }}>
                Continue
              </button>
            ) : (
              <button type="button" className="onb-ui-btn-next" onClick={handleFinish} disabled={saving}>
                {saving ? <Loader2 size={16} className="crm-spin" /> : null}
                {saving ? 'Saving...' : 'Finish Setup'}
              </button>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
