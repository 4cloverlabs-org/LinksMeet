import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Sparkles, LogOut, Loader2, Globe, User, Check, AlertCircle, RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { API_BASE_URL } from '../../lib/config';
import { campaignEngine } from '../../components/campaigns/campaignEngine';

export default function AdminPage() {
  const ctx = useOutletContext<any>();
  const { 
    user, uid, userProfile, displayName, firstName, userInitials,
    toast, setToast, notif, setNotif, logoutAndGo,
    setIsOnboardingModalOpen, setUserProfile
  } = ctx || {};

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [brandDesc, setBrandDesc] = useState('');
  const [profilePic, setProfilePic] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);

  const calculateProgress = () => {
    if (userProfile?.onboarding_completed) return 100;
    let score = 20; // Account created
    if (username && username.trim().length > 0) score += 15;
    if (bio && bio.trim().length > 0) score += 15;
    if (profilePic && profilePic.length > 0) score += 10;
    if (websiteUrl && websiteUrl.trim().length > 0) score += 20;
    if (brandDesc && brandDesc.trim().length > 0) score += 20;
    return Math.min(score, 100);
  };
  const progress = calculateProgress();

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.first_name || userProfile.full_name || displayName || '');
      setUsername(userProfile.username || '');
      setBio(userProfile.bio || '');
      setWebsiteUrl(userProfile.website_url || '');
      setBrandDesc(userProfile.brand_description || '');
      setProfilePic(userProfile.profile_picture || userProfile.avatar_url || '');
    } else if (displayName) {
      setName(displayName);
    }
  }, [userProfile, displayName]);

  const handleGenerateAvatar = () => {
    const seeds = ['Felix', 'Aneka', 'Oliver', 'Bob', 'Mimi', 'Sophia', 'Lucas', 'Emma', 'Alex', 'Jack', 'Maya', 'Leo'];
    const randomSeed = seeds[Math.floor(Math.random() * seeds.length)] + '-' + Math.floor(Math.random() * 1000);
    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(randomSeed)}`;
    setProfilePic(newAvatar);
  };

  const handleAnalyze = async () => {
    if (!websiteUrl) {
      if (setToast) setToast("Please enter a Website URL first.");
      return;
    }
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
      if (setToast) setToast("AI Analysis Complete! ✨");
    } catch (err: any) {
      if (setToast) setToast("Failed to analyze website: " + (err.message || 'Unknown error'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
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
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      if (setUserProfile && data.user) {
        setUserProfile(data.user);
      }

      if (setToast) {
        setToast('Profile & Account Settings saved successfully! 🎉');
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err: any) {
      if (setToast) {
        setToast('Error saving profile: ' + (err.message || 'Unknown error'));
        setTimeout(() => setToast(null), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="crm-fade crm-grid-2b">
        <div className="crm-card">
          <div className="crm-card-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3>Profile & Brand Completion</h3>
            {setIsOnboardingModalOpen && (
              <button
                onClick={() => setIsOnboardingModalOpen(true)}
                style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Sparkles size={14} /> Launch Setup Wizard
              </button>
            )}
          </div>

          {/* Onboarding Progress Card */}
          <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', borderRadius: 16, padding: '20px', marginBottom: 24, boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }}>
                  <Sparkles size={22} color="#fff" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                    Onboarding Progress
                    <span style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: 20, background: progress === 100 ? '#10b981' : '#3b82f6', color: '#fff', fontWeight: 700 }}>
                      {progress === 100 ? '✓ Completed' : '⚡ In Progress'}
                    </span>
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                    {progress === 100 
                      ? 'Your brand profile is 100% configured for AI automation.' 
                      : 'Complete your profile details below to unlock all AI features.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: '0.82rem', fontWeight: 600 }}>
                <span style={{ color: '#cbd5e1' }}>Profile Setup Score</span>
                <span style={{ color: '#60a5fa', fontWeight: 800, fontSize: '0.95rem' }}>{progress}%</span>
              </div>
              <div style={{ width: '100%', height: 10, background: '#334155', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #38bdf8 100%)', borderRadius: 10, transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
              </div>
              {progress < 100 && (
                <div style={{ display: 'flex', gap: 14, marginTop: 14, fontSize: '0.78rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                  <span style={{ color: username ? '#10b981' : '#94a3b8', fontWeight: username ? 600 : 400 }}>{username ? '✓' : '○'} Username (+15%)</span>
                  <span style={{ color: bio ? '#10b981' : '#94a3b8', fontWeight: bio ? 600 : 400 }}>{bio ? '✓' : '○'} Bio (+15%)</span>
                  <span style={{ color: profilePic ? '#10b981' : '#94a3b8', fontWeight: profilePic ? 600 : 400 }}>{profilePic ? '✓' : '○'} Avatar (+10%)</span>
                  <span style={{ color: websiteUrl ? '#10b981' : '#94a3b8', fontWeight: websiteUrl ? 600 : 400 }}>{websiteUrl ? '✓' : '○'} Website (+20%)</span>
                  <span style={{ color: brandDesc ? '#10b981' : '#94a3b8', fontWeight: brandDesc ? 600 : 400 }}>{brandDesc ? '✓' : '○'} AI Brand Details (+20%)</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)', border: '1px solid #e2e8f0', borderRadius: 14, padding: '16px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {profilePic ? (
                <img src={profilePic} alt="Avatar" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid #3b82f6', background: '#fff' }} />
              ) : (
                <span className="crm-av" style={{ width: 60, height: 60, fontSize: '1.25rem', background: '#0E61F3', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 700 }}>
                  {userInitials || <User size={28} />}
                </span>
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>{name || displayName || 'Your Name'}</div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{user?.email}</div>
                <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: 2, fontWeight: 600 }}>
                  {userProfile?.onboarding_completed ? '✓ Profile Completed' : '⚡ Profile Incomplete'}
                </div>
              </div>
            </div>
            <button
              onClick={handleGenerateAvatar}
              type="button"
              style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            >
              <RefreshCw size={14} /> Change Avatar
            </button>
          </div>

          <div className="crm-field">
            <label style={{ fontWeight: 600, color: '#334155', marginBottom: 6, display: 'block' }}>Full Name</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Jane Doe"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.95rem' }} 
            />
          </div>

          <div className="crm-field" style={{ marginTop: 16 }}>
            <label style={{ fontWeight: 600, color: '#334155', marginBottom: 6, display: 'block' }}>Email</label>
            <input 
              defaultValue={user?.email || ''} 
              disabled 
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#64748b', fontSize: '0.95rem', cursor: 'not-allowed' }} 
            />
          </div>

          <div className="crm-field" style={{ marginTop: 16 }}>
            <label style={{ fontWeight: 600, color: '#334155', marginBottom: 6, display: 'block' }}>Scheduling Username</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
              <span style={{ padding: '10px 14px', background: '#f8fafc', color: '#64748b', fontSize: '0.9rem', borderRight: '1px solid #e2e8f0', fontWeight: 500 }}>
                linksmeet.com/
              </span>
              <input 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                placeholder="janedoe"
                style={{ flex: 1, border: 'none', padding: '10px 14px', fontSize: '0.95rem', outline: 'none' }} 
              />
            </div>
          </div>

          <div className="crm-field" style={{ marginTop: 16 }}>
            <label style={{ fontWeight: 600, color: '#334155', marginBottom: 6, display: 'block' }}>Short Bio / Headline</label>
            <input 
              value={bio} 
              onChange={e => setBio(e.target.value)} 
              placeholder="e.g. Founder at Acme Corp | Helping teams scale"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.95rem' }} 
            />
          </div>

          <div className="crm-field" style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontWeight: 600, color: '#334155', margin: 0 }}>Website URL</label>
              <button 
                type="button"
                onClick={handleAnalyze} 
                disabled={isAnalyzing || !websiteUrl}
                style={{ 
                  background: isAnalyzing ? '#cbd5e1' : 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '4px 10px', 
                  borderRadius: 6, 
                  fontSize: '0.78rem', 
                  fontWeight: 700, 
                  cursor: isAnalyzing || !websiteUrl ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                {isAnalyzing ? <Loader2 size={12} className="cpm-spin" /> : <Sparkles size={12} />}
                {isAnalyzing ? 'Analyzing AI...' : 'AI Analyze Website'}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Globe size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                value={websiteUrl} 
                onChange={e => setWebsiteUrl(e.target.value)} 
                placeholder="https://yourcompany.com"
                style={{ width: '100%', padding: '10px 14px 10px 42px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.95rem' }} 
              />
            </div>
          </div>

          <div className="crm-field" style={{ marginTop: 16 }}>
            <label style={{ fontWeight: 600, color: '#334155', marginBottom: 6, display: 'block' }}>
              Company Details & Brand Description (AI Trained)
            </label>
            <textarea 
              value={brandDesc} 
              onChange={e => setBrandDesc(e.target.value)} 
              placeholder="Click 'AI Analyze Website' above to automatically extract your company products, value propositions, and brand voice..."
              style={{ width: '100%', minHeight: 140, resize: 'vertical', padding: '12px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.9rem', lineHeight: 1.5, fontFamily: 'inherit' }} 
            />
          </div>
          
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="crm-btn crm-btn-primary" 
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', fontSize: '0.95rem', fontWeight: 700 }}
            >
              {saving ? <Loader2 size={18} className="cpm-spin" /> : <Check size={18} />}
              {saving ? 'Saving changes...' : 'Save Profile Changes'}
            </button>
            <button type="button" className="crm-btn crm-btn-ghost" onClick={logoutAndGo} style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <LogOut size={16} /> Log out
            </button>
          </div>
        </div>

        <div className="crm-card" style={{ alignSelf: 'start' }}>
          <div className="crm-card-head"><h3>Notifications</h3></div>
          {[
            { key: 'deals' as const, tt: 'Deal alerts', ds: 'Get notified when a deal changes stage.' },
            { key: 'weekly' as const, tt: 'Weekly summary', ds: 'A digest of your pipeline every Monday.' },
            { key: 'mentions' as const, tt: 'Mentions', ds: 'When a teammate @mentions you.' },
          ].map(n => (
            <div className="crm-toggle-row" key={n.key}>
              <div><div className="tt">{n.tt}</div><div className="ds">{n.ds}</div></div>
              <button className={`crm-switch${notif[n.key] ? ' on' : ''}`} onClick={() => setNotif(prev => ({ ...prev, [n.key]: !prev[n.key] }))} aria-label={n.tt} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
