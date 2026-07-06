import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Sparkles, LogOut, Loader2, Globe, User, Check, AlertCircle, RefreshCw, Edit2
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
  const [activeTab, setActiveTab] = useState('Profile Settings');

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

  const inputStyle = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid #E5E7EB',
    fontSize: '14px',
    fontWeight: 600,
    color: '#111827',
    padding: '6px 0',
    outline: 'none',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Top Tabs */}
      <div style={{ display: 'flex', gap: '8px', background: '#F3F4F6', padding: '8px', borderRadius: '12px', marginBottom: '24px', overflowX: 'auto' }}>
        {['Profile Settings', 'Preferences', 'Billing & Plans', 'Security'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? '#FFFFFF' : 'transparent',
              color: activeTab === tab ? '#0E61F3' : '#6B7280',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: activeTab === tab ? 600 : 500,
              border: 'none',
              boxShadow: activeTab === tab ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              fontSize: '14px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Header Card */}
      <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '32px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '32px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: '1 1 300px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#F3F4F6', overflow: 'hidden', border: '2px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0E61F3', fontSize: '24px', fontWeight: 700 }}>
            {profilePic ? <img src={profilePic} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" /> : (userInitials || <User size={32} />)}
          </div>
          <div>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', color: '#111827', fontWeight: 700 }}>{name || displayName || 'Your Name'}</h2>
            <div style={{ color: '#0E61F3', fontSize: '14px', fontWeight: 600 }}>Workspace Owner <span style={{ color: '#9CA3AF', fontWeight: 500 }}>| Administration</span></div>
          </div>
        </div>
        
        <div style={{ width: '1px', background: '#E5E7EB' }} className="desktop-only-divider" />
        
        <div style={{ flex: '2 1 400px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
          <div>
            <div style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>User ID:</div>
            <div style={{ color: '#111827', fontSize: '14px', fontWeight: 600 }}>{userProfile?.id ? userProfile.id.substring(0, 8).toUpperCase() : 'USR-53862'}</div>
          </div>
          <div>
            <div style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>Account Status:</div>
            <div style={{ color: '#111827', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} /> Active
            </div>
          </div>
          <div>
            <div style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>Username:</div>
            <div style={{ color: '#111827', fontSize: '14px', fontWeight: 600 }}>{username || '--'}</div>
          </div>
          <div>
            <div style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>Email:</div>
            <div style={{ color: '#111827', fontSize: '14px', fontWeight: 600 }}>{user?.email || '--'}</div>
          </div>
        </div>
      </div>

      {/* Grid Cards - Profile Settings */}
      {activeTab === 'Profile Settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* Personal Information Card */}
        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#6B7280', fontWeight: 600 }}>Personal information</h3>
            <button style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}><Edit2 size={16} /></button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <div style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>Full Name</div>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jane Doe" style={inputStyle} />
            </div>
            <div>
              <div style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>Email Address</div>
              <input value={user?.email || ''} disabled style={{ ...inputStyle, color: '#6B7280', cursor: 'not-allowed' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>Scheduling Username</div>
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #E5E7EB' }}>
                <span style={{ color: '#6B7280', fontSize: '14px', fontWeight: 500 }}>linksmeet.com/</span>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="janedoe" style={{ ...inputStyle, borderBottom: 'none' }} />
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>Short Bio / Headline</div>
              <input value={bio} onChange={e => setBio(e.target.value)} placeholder="e.g. Founder at Acme Corp" style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Right Column wrapper for Brand & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Brand Information */}
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#6B7280', fontWeight: 600 }}>Brand information</h3>
              <button style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}><Edit2 size={16} /></button>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ color: '#9CA3AF', fontSize: '12px' }}>Website URL</div>
                  <button onClick={handleAnalyze} disabled={isAnalyzing || !websiteUrl} style={{ background: isAnalyzing ? '#E5E7EB' : '#EEF2FF', color: isAnalyzing ? '#9CA3AF' : '#4F46E5', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: isAnalyzing || !websiteUrl ? 'not-allowed' : 'pointer' }}>
                     {isAnalyzing ? <Loader2 size={10} className="cpm-spin" /> : <Sparkles size={10} />} 
                     AI Analyze
                  </button>
               </div>
               <input value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://yourcompany.com" style={inputStyle} />
            </div>
            
            <div>
               <div style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '8px' }}>Company Details & Brand Description</div>
               <textarea value={brandDesc} onChange={e => setBrandDesc(e.target.value)} placeholder="Extracted AI details..." style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', color: '#111827', resize: 'vertical', background: '#F9FAFB', outline: 'none' }} />
            </div>
          </div>
          
          {/* Account Actions */}
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#6B7280', fontWeight: 600 }}>Account actions</h3>
              <button style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}><Edit2 size={16} /></button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ color: '#6B7280', fontSize: '13px', fontWeight: 500 }}>Profile Setup Score</div>
                <div style={{ color: '#2563EB', fontSize: '14px', fontWeight: 700 }}>{progress}%</div>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: '#2563EB', borderRadius: '4px', transition: 'width 0.5s ease' }} />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
               <button onClick={handleGenerateAvatar} style={{ background: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}><RefreshCw size={14} /> Change Avatar</button>
               {setIsOnboardingModalOpen ? (
                 <button onClick={() => setIsOnboardingModalOpen(true)} style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}><Sparkles size={14} /> Setup Wizard</button>
               ) : <div />}
               <button onClick={handleSave} disabled={saving} style={{ gridColumn: '1 / -1', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                  {saving ? <Loader2 size={16} className="cpm-spin" /> : <Check size={16} />}
                  {saving ? 'Saving...' : 'Save Profile Changes'}
               </button>
               <button onClick={logoutAndGo} style={{ gridColumn: '1 / -1', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                  <LogOut size={14} /> Log out
               </button>
            </div>
          </div>

        </div>
      </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'Preferences' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px', alignItems: 'start' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#6B7280', fontWeight: 600 }}>Preferences</h3>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <div style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>Timezone</div>
              <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', color: '#111827', background: '#F9FAFB', outline: 'none' }}>
                <option>(GMT-05:00) Eastern Time (US & Canada)</option>
                <option>(GMT-08:00) Pacific Time (US & Canada)</option>
                <option>(GMT+00:00) London</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <div style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>Language</div>
              <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', color: '#111827', background: '#F9FAFB', outline: 'none' }}>
                <option>English (US)</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#6B7280', fontWeight: 600 }}>Notifications</h3>
            </div>
            
            {[
              { key: 'deals', tt: 'Deal alerts', ds: 'Get notified when a deal changes stage.' },
              { key: 'weekly', tt: 'Weekly summary', ds: 'A digest of your pipeline every Monday.' },
              { key: 'mentions', tt: 'Mentions', ds: 'When a teammate @mentions you.' },
            ].map(n => (
              <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{n.tt}</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>{n.ds}</div>
                </div>
                <div 
                  onClick={() => setNotif(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                  style={{ width: '40px', height: '24px', background: notif[n.key as keyof typeof notif] ? '#10B981' : '#E5E7EB', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}
                >
                  <div style={{ width: '20px', height: '20px', background: '#FFFFFF', borderRadius: '50%', position: 'absolute', top: '2px', left: notif[n.key as keyof typeof notif] ? '18px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Billing & Plans Tab */}
      {activeTab === 'Billing & Plans' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px', alignItems: 'start' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#6B7280', fontWeight: 600 }}>Current Plan</h3>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Sparkles size={28} />
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>Pro Tier</div>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>$49 / month per user</div>
              </div>
            </div>
            
            <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span style={{ color: '#6B7280' }}>Next billing date</span>
                <span style={{ fontWeight: 600, color: '#111827' }}>Oct 1, 2026</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#6B7280' }}>Payment method</span>
                <span style={{ fontWeight: 600, color: '#111827' }}>Visa ending in 4242</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{ flex: 1, background: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>View Invoices</button>
              <button style={{ flex: 1, background: '#2563EB', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Manage Billing</button>
            </div>
          </div>
        </div>
      )}



      {/* Security Tab */}
      {activeTab === 'Security' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px', alignItems: 'start' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#6B7280', fontWeight: 600 }}>Security Settings</h3>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <div style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>Current Password</div>
              <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', color: '#111827', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>New Password</div>
              <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', color: '#111827', outline: 'none' }} />
            </div>
            <button style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Update Password</button>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#6B7280', fontWeight: 600 }}>Two-Factor Authentication</h3>
            </div>
            
            <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.5, marginBottom: '24px' }}>
              Add an extra layer of security to your account. Once enabled, you'll be required to enter both your password and an authentication code from your mobile device.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Authenticator App</div>
              <button style={{ background: '#FFFFFF', color: '#374151', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>Enable 2FA</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
