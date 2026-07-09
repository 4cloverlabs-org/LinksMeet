import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { Sparkles, Calendar, Globe, User, Loader2 } from 'lucide-react';
import { campaignEngine } from '../components/campaigns/campaignEngine';
import { API_BASE_URL } from '../lib/config';
import './Onboarding.css';

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState<'personal' | 'business'>('personal');
  
  // Step 2 state
  const [profilePic, setProfilePic] = useState(user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '');
  const [name, setName] = useState(user?.user_metadata?.full_name || user?.user_metadata?.name || user?.user_metadata?.first_name || '');
  const [username, setUsername] = useState(user?.email ? user.email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '') : '');
  const [bio, setBio] = useState('');
  
  // Step 4 state
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [brandDesc, setBrandDesc] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If they already have a username, they might have completed it? 
    // We rely on RequireAuth to route them here if they haven't completed onboarding.
  }, []);

  const handleFinish = async () => {
    if (!username) {
      setError("Username is required");
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
          first_name: name,
          username,
          bio,
          website_url: websiteUrl,
          brand_description: brandDesc,
          profile_picture: profilePic
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save onboarding data');

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const renderStep1 = () => (
    <div className="onb-step onb-step-1">
      <h2>Select plan</h2>
      <p className="onb-sub">To personalize your experience, what do you plan to use this for?</p>
      
      <div className="onb-plan-options">
        <div 
          className={`onb-plan-card ${plan === 'personal' ? 'active' : ''}`}
          onClick={() => setPlan('personal')}
        >
          <div className="onb-plan-header">
            <h4>Personal</h4>
            <div className="onb-radio">{plan === 'personal' && <div className="onb-radio-dot" />}</div>
          </div>
          <p>Good for individuals who are just starting out and simply want the essentials.</p>
        </div>
        
        <div 
          className={`onb-plan-card ${plan === 'business' ? 'active' : ''}`}
          onClick={() => setPlan('business')}
        >
          <div className="onb-plan-header">
            <h4>For business</h4>
            <div className="onb-radio">{plan === 'business' && <div className="onb-radio-dot" />}</div>
          </div>
          <p>Set up your personal profile first, then start a Teams trial for your business.</p>
        </div>
      </div>
      
      <div className="onb-actions" style={{ justifyContent: 'flex-end' }}>
        <button className="onb-btn-primary" onClick={() => setStep(2)}>Continue</button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="onb-step onb-step-2">
      <h2>Add your details</h2>
      <p className="onb-sub">Let's set up your personal account</p>
      
      {error && <div className="onb-error">{error}</div>}

      <div className="onb-form-group">
        <label>Profile picture</label>
        <div className="onb-avatar-row">
          <div className="onb-avatar-preview">
            {profilePic ? <img src={profilePic} alt="Profile" /> : <span>{name ? name[0]?.toUpperCase() : 'U'}</span>}
          </div>
          <button className="onb-btn-outline" onClick={() => setProfilePic('https://api.dicebear.com/7.x/avataaars/svg?seed=' + Math.random())}>
            Upload / Generate
          </button>
        </div>
        <span className="onb-hint">Recommended size 64x64px</span>
      </div>

      <div className="onb-form-group">
        <label>Your name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
      </div>

      <div className="onb-form-group">
        <label>Username</label>
        <div className="onb-input-prefix">
          <span>linksmeet.com/</span>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="johndoe" />
        </div>
      </div>

      <div className="onb-form-group">
        <label>Bio</label>
        <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)} placeholder="Add a short bio..."></textarea>
      </div>
      
      <div className="onb-actions" style={{ justifyContent: 'space-between' }}>
        <button className="onb-btn-ghost" onClick={() => setStep(1)}>Back</button>
        <button className="onb-btn-primary" onClick={() => {
          if (!username) setError("Username is required");
          else { setError(''); setStep(3); }
        }}>Continue</button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="onb-step onb-step-3">
      <h2>Connect your calendar</h2>
      <p className="onb-sub">Connect your calendar to prevent double bookings and conflicts</p>
      
      <div className="onb-calendar-grid">
        <div className="onb-cal-card">
          <div className="onb-cal-icon"><Calendar size={24} color="#4285F4" /></div>
          <h4>Google Calendar</h4>
          <button className="onb-btn-outline">Connect</button>
        </div>
        <div className="onb-cal-card">
          <div className="onb-cal-icon"><Calendar size={24} color="#0078D4" /></div>
          <h4>Outlook Calendar</h4>
          <button className="onb-btn-outline">Connect</button>
        </div>
        <div className="onb-cal-card">
          <div className="onb-cal-icon"><Calendar size={24} color="#000000" /></div>
          <h4>Apple Calendar</h4>
          <button className="onb-btn-outline">Connect</button>
        </div>
      </div>
      
      <div className="onb-actions" style={{ justifyContent: 'space-between' }}>
        <button className="onb-btn-ghost" onClick={() => setStep(2)}>Back</button>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="onb-btn-ghost" onClick={() => setStep(4)}>Skip for now</button>
          <button className="onb-btn-primary" onClick={() => setStep(4)}>Continue</button>
        </div>
      </div>
    </div>
  );

  const handleAnalyze = async () => {
    if (!websiteUrl) {
      setError("Please enter a Website URL first to analyze.");
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
Ideal Customer Profile: ${data.idealCustomerProfile || 'N/A'}
Messaging Style: ${data.messagingStyle || 'N/A'}
Business Goals: ${data.businessGoals || 'N/A'}`;
      setBrandDesc(formattedDesc);
    } catch (err: any) {
      setError("Failed to analyze website: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderStep4 = () => (
    <div className="onb-step onb-step-4">
      <h2>Set up your business</h2>
      <p className="onb-sub">We'll use this to generate perfect follow-up emails for your leads</p>
      
      {error && <div className="onb-error">{error}</div>}

      <div className="onb-form-group">
        <label>Website URL</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input style={{ flex: 1 }} type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://example.com" />
          <button 
            className="onb-btn-outline" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }} 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? <Loader2 size={14} className="crm-spin" /> : <Sparkles size={14} color="#7d3bec" />}
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      <div className="onb-form-group">
        <label>Brand & Services Description</label>
        <textarea 
          rows={7} 
          value={brandDesc} 
          onChange={e => setBrandDesc(e.target.value)} 
          placeholder="Describe your brand tone, target audience, and the services you provide..."
        ></textarea>
      </div>
      
      <div className="onb-actions" style={{ justifyContent: 'space-between' }}>
        <button className="onb-btn-ghost" disabled={saving} onClick={() => setStep(3)}>Back</button>
        <button className="onb-btn-primary" disabled={saving} onClick={handleFinish}>
          {saving ? 'Saving...' : 'Finish Setup'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="onb-layout">
      {/* LinksMeet Branding */}
      <div style={{ position: 'absolute', top: '32px', left: '32px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', zIndex: 10 }}>
        <img src="/logo.png" alt="LinksMeet" style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '6px' }} />
        LinksMeet
      </div>

      <div className="onb-left" style={{ paddingTop: '80px' }}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
      <div className="onb-right">
        {step === 1 && (
          <div className="onb-graphic">
            <div className="onb-circles">
              <div className="onb-circle onb-c1"></div>
              <div className="onb-circle onb-c2"></div>
              <div className="onb-circle onb-c3"></div>
              <div className="onb-circle onb-c4">
                <User size={24} />
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="onb-preview">
            <div className="onb-browser-bar">
              <span>linksmeet.com/{username || 'username'}</span>
            </div>
            <div className="onb-preview-content">
              <div className="onb-avatar-preview lg">
                {profilePic ? <img src={profilePic} alt="Profile" /> : <span>{name ? name[0]?.toUpperCase() : 'U'}</span>}
              </div>
              <h3>{name || 'Your Name'}</h3>
              <p>{bio || 'Add your bio here'}</p>
              
              <div className="onb-event-list">
                <div className="onb-event-item">
                  <div>
                    <h5>15 Min Meeting</h5>
                    <span>15 mins</span>
                  </div>
                  <button className="onb-btn-outline sm">Book now</button>
                </div>
                <div className="onb-event-item">
                  <div>
                    <h5>30 Min Meeting</h5>
                    <span>30 mins</span>
                  </div>
                  <button className="onb-btn-outline sm">Book now</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="onb-preview calendar-preview">
             <div className="onb-cal-header">
               <span>Jun 28 – Jul 4, 2026</span>
             </div>
             <div className="onb-cal-grid-lines">
               <div className="onb-cal-col"></div>
               <div className="onb-cal-col"></div>
               <div className="onb-cal-col"></div>
               <div className="onb-cal-col"></div>
               <div className="onb-cal-col"></div>
             </div>
          </div>
        )}
        {step === 4 && (
          <div className="onb-graphic ai-graphic">
             <Sparkles size={48} color="#7d3bec" />
             <h3>AI Powered CRM</h3>
             <p>Your brand details will perfectly tailor automatic email sequences for your inbound leads.</p>
          </div>
        )}
      </div>
    </div>
  );
}
