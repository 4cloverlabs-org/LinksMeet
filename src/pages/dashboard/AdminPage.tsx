import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Sparkles, LogOut, Loader2, Globe, User, Check, AlertCircle, RefreshCw, Edit2, ChevronDown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { API_BASE_URL } from '../../lib/config';
import { campaignEngine } from '../../components/campaigns/campaignEngine';
import './AdminPage.css';

const CustomSelect = ({ options, value, onChange, searchable = false }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredOptions = searchable 
    ? options.filter((opt: string) => opt.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  return (
    <div style={{ position: 'relative' }}>
      <div 
        className="admin-input" 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
        onClick={() => { setIsOpen(!isOpen); setSearchQuery(''); }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || options[0]}</span>
        <ChevronDown size={16} color="#71717a" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }} />
      </div>
      
      {isOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setIsOpen(false)} />
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: '#fff', border: '1px solid #e4e4e7', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', zIndex: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '300px' }}>
            {searchable && (
              <div style={{ padding: '8px', borderBottom: '1px solid #e4e4e7' }}>
                <input 
                  autoFocus
                  type="text" 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  placeholder="Search..." 
                  style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.9rem', color: '#111' }}
                />
              </div>
            )}
            <div style={{ overflowY: 'auto' }}>
              {filteredOptions.length > 0 ? filteredOptions.map((opt: string) => (
                <div 
                  key={opt}
                  style={{ padding: '8px 12px', fontSize: '0.9rem', cursor: 'pointer', background: value === opt ? '#fafafa' : '#fff', color: value === opt ? '#111' : '#52525b' }}
                  onClick={() => { onChange(opt); setIsOpen(false); }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = value === opt ? '#fafafa' : '#fff')}
                >
                  {opt}
                </div>
              )) : (
                <div style={{ padding: '8px 12px', fontSize: '0.9rem', color: '#a1a1aa' }}>No results found</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

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
  
  const [timezone, setTimezone] = useState('(GMT+05:30) India Standard Time (IST)');
  const [language, setLanguage] = useState('English (US)');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('Profile Settings');

  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingBrand, setIsEditingBrand] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeletingAccount(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token || '';
      
      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete account');
      }
      
      // Successfully deleted, logout and redirect
      if (logoutAndGo) {
        logoutAndGo();
      }
    } catch (err: any) {
      if (setToast) {
        setToast('Error deleting account: ' + err.message);
        setTimeout(() => setToast(null), 5000);
      }
      setIsDeletingAccount(false);
    }
  };

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
      
      if (userProfile.preferences) {
        if (userProfile.preferences.timezone) setTimezone(userProfile.preferences.timezone);
        if (userProfile.preferences.language) setLanguage(userProfile.preferences.language);
        if (userProfile.preferences.notif && setNotif) {
          setNotif(userProfile.preferences.notif);
        }
      }
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

  const updatePreference = async (key: string, value: any) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token || '';

      const res = await fetch(`${API_BASE_URL}/api/user/preferences`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          preferences: { [key]: value }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update preferences');
      
      if (setToast) {
        setToast('Preference saved! 🎉');
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err: any) {
      if (setToast) {
        setToast('Failed to save preference: ' + err.message);
        setTimeout(() => setToast(null), 5000);
      }
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
    <div className="admin-page-container">
      {/* Top Tabs */}
      <div className="admin-tabs-container">
        {['Profile Settings', 'Preferences', 'Billing & Plans', 'Security'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Header Card */}
      <div className="admin-header-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: '1 1 300px' }}>
          <div className="admin-avatar-wrap">
            {profilePic ? <img src={profilePic} alt="Avatar" /> : (userInitials || <User size={32} />)}
          </div>
          <div>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', color: '#111827', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {name || displayName || 'Your Name'}
            </h2>
            <div style={{ color: 'var(--ac)', fontSize: '15px', fontWeight: 600 }}>
              Workspace Owner <span style={{ color: '#9CA3AF', fontWeight: 500 }}>| Administration</span>
            </div>
          </div>
        </div>
        
        <div className="admin-header-divider desktop-only-divider" />
        
        <div className="admin-stats-grid">
          <div className="admin-stat-item">
            <div className="lbl">User ID:</div>
            <div className="val">{userProfile?.id ? userProfile.id.substring(0, 8).toUpperCase() : 'USR-53862'}</div>
          </div>
          <div className="admin-stat-item">
            <div className="lbl">Account Status:</div>
            <div className="val">
              <span className="admin-status-dot" /> Active
            </div>
          </div>
          <div className="admin-stat-item">
            <div className="lbl">Username:</div>
            <div className="val">{username || '--'}</div>
          </div>
          <div className="admin-stat-item">
            <div className="lbl">Email:</div>
            <div className="val" style={{wordBreak: 'break-all'}}>{user?.email || '--'}</div>
          </div>
        </div>
      </div>

      {/* Grid Cards - Profile Settings */}
      {activeTab === 'Profile Settings' && (
        <div className="admin-cards-grid">
        
        {/* Personal Information Card */}
        <div className="admin-card">
          <div className="admin-card-head">
            <h3><User size={18} color="var(--ac)" /> Personal information</h3>
            <button className="admin-edit-btn" onClick={() => setIsEditingPersonal(!isEditingPersonal)}>
              {isEditingPersonal ? <Check size={16} color="var(--ac)" /> : <Edit2 size={16} />}
            </button>
          </div>
          
          <div className="admin-input-group">
            <label>Full Name</label>
            <input className="admin-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jane Doe" disabled={!isEditingPersonal} />
          </div>
          <div className="admin-input-group">
            <label>Email Address</label>
            <input className="admin-input" value={user?.email || ''} disabled />
          </div>
          <div className="admin-input-group">
            <label>Scheduling Username</label>
            <div className={`admin-input-prefix-group ${!isEditingPersonal ? 'disabled' : ''}`}>
              <span>linksmeet.com/</span>
              <input className="admin-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="janedoe" disabled={!isEditingPersonal} />
            </div>
          </div>
          <div className="admin-input-group">
            <label>Short Bio / Headline</label>
            <input className="admin-input" value={bio} onChange={e => setBio(e.target.value)} placeholder="e.g. Founder at Acme Corp" disabled={!isEditingPersonal} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Brand Information */}
          <div className="admin-card">
            <div className="admin-card-head">
              <h3><Globe size={18} color="var(--ac)" /> Brand information</h3>
              <button className="admin-edit-btn" onClick={() => setIsEditingBrand(!isEditingBrand)}>
                {isEditingBrand ? <Check size={16} color="var(--ac)" /> : <Edit2 size={16} />}
              </button>
            </div>
            
            <div className="admin-input-group" style={{ marginBottom: '16px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ margin: 0 }}>Website URL</label>
                  <button className="admin-magic-btn" onClick={handleAnalyze} disabled={isAnalyzing || !websiteUrl || !isEditingBrand}>
                     {isAnalyzing ? <Loader2 size={12} className="cpm-spin" /> : <Sparkles size={12} />} 
                     AI Analyze
                  </button>
               </div>
               <input className="admin-input" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://yourcompany.com" disabled={!isEditingBrand} />
            </div>
            
            <div className="admin-input-group">
               <label>Company Details & Brand Description</label>
               <textarea className="admin-textarea" value={brandDesc} onChange={e => setBrandDesc(e.target.value)} placeholder="Extracted AI details..." disabled={!isEditingBrand} />
            </div>
          </div>
          
          {/* Account Actions */}
          <div className="admin-card">
            <div className="admin-card-head">
              <h3><AlertCircle size={18} color="var(--ac)" /> Account actions</h3>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 600 }}>Profile Setup Score</div>
                <div style={{ color: 'var(--ac)', fontSize: '1rem', fontWeight: 800 }}>{progress}%</div>
              </div>
              <div className="admin-progress-wrap">
                <div className="admin-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
               <button className="admin-btn" onClick={handleGenerateAvatar}>
                 <RefreshCw size={15} /> Change Avatar
               </button>
               {setIsOnboardingModalOpen ? (
                 <button className="admin-btn wizard" onClick={() => setIsOnboardingModalOpen(true)}>
                   <Sparkles size={15} /> Setup Wizard
                 </button>
               ) : <div />}
               <button className="admin-btn primary" onClick={handleSave} disabled={saving} style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
                  {saving ? <Loader2 size={18} className="cpm-spin" /> : <Check size={18} />}
                  {saving ? 'Saving Changes...' : 'Save Profile Changes'}
               </button>
               <button className="admin-btn danger" onClick={() => { setShowDeleteConfirm(true); setDeleteConfirmText(''); }} style={{ gridColumn: '1 / -1' }}>
                  <LogOut size={16} /> Delete Account
               </button>
            </div>
          </div>

        </div>
      </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'Preferences' && (
        <div className="admin-cards-grid">
          <div className="admin-card">
            <div className="admin-card-head">
              <h3>Preferences</h3>
            </div>
            
            <div className="admin-input-group">
              <label>Timezone</label>
              <CustomSelect 
                searchable={true}
                options={[
                  '(GMT-08:00) Pacific Time (US & Canada)', 
                  '(GMT-05:00) Eastern Time (US & Canada)', 
                  '(GMT+00:00) London',
                  '(GMT+01:00) Central European Time',
                  '(GMT+04:00) Dubai',
                  '(GMT+05:30) India Standard Time (IST)',
                  '(GMT+08:00) Singapore',
                  '(GMT+09:00) Tokyo',
                  '(GMT+10:00) Sydney'
                ]} 
                value={timezone} 
                onChange={(val: string) => { setTimezone(val); updatePreference('timezone', val); }} 
              />
            </div>
            
            <div className="admin-input-group">
              <label>Language</label>
              <CustomSelect 
                options={['English (US)', 'Spanish', 'French']} 
                value={language} 
                onChange={(val: string) => { setLanguage(val); updatePreference('language', val); }} 
              />
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-head">
              <h3>Notifications</h3>
            </div>
            
            {[
              { key: 'deals', tt: 'Deal alerts', ds: 'Get notified when a deal changes stage.' },
              { key: 'weekly', tt: 'Weekly summary', ds: 'A digest of your pipeline every Monday.' },
              { key: 'mentions', tt: 'Mentions', ds: 'When a teammate @mentions you.' },
            ].map(n => (
              <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #F3F4F6' }}>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827' }}>{n.tt}</div>
                  <div style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '4px' }}>{n.ds}</div>
                </div>
                <div 
                  className={`admin-toggle ${notif[n.key as keyof typeof notif] ? 'on' : ''}`}
                  onClick={() => {
                    const newVal = { ...notif, [n.key]: !notif[n.key as keyof typeof notif] };
                    if (setNotif) setNotif(newVal);
                    updatePreference('notif', newVal);
                  }}
                >
                  <div className="admin-toggle-knob" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Billing & Plans Tab */}
      {activeTab === 'Billing & Plans' && (
        <div className="admin-cards-grid">
          <div className="admin-card">
            <div className="admin-card-head">
              <h3>Current Plan</h3>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--ac) 0%, var(--ac2) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 20px rgba(125, 59, 236, 0.2)' }}>
                <Sparkles size={32} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>Pro Tier</div>
                <div style={{ fontSize: '0.95rem', color: '#6B7280', fontWeight: 500, marginTop: '2px' }}>$49 / month per user</div>
              </div>
            </div>
            
            <div style={{ background: '#F9FAFB', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB', marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
                <span style={{ color: '#6B7280', fontWeight: 500 }}>Next billing date</span>
                <span style={{ fontWeight: 700, color: '#111827' }}>Oct 1, 2026</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: '#6B7280', fontWeight: 500 }}>Payment method</span>
                <span style={{ fontWeight: 700, color: '#111827' }}>Visa ending in 4242</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="admin-btn" style={{ flex: 1 }} onClick={() => { if (setToast) { setToast('No past invoices found.'); setTimeout(() => setToast(null), 3000); } }}>
                View Invoices
              </button>
              <button className="admin-btn primary" style={{ flex: 1 }} onClick={() => { if (setToast) { setToast('Billing portal opening soon...'); setTimeout(() => setToast(null), 3000); } }}>
                Manage Billing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'Security' && (
        <div className="admin-cards-grid">
          <div className="admin-card">
            <div className="admin-card-head">
              <h3>Security Settings</h3>
            </div>
            
            <div className="admin-input-group">
              <label>Current Password</label>
              <input type="password" placeholder="••••••••" className="admin-input" />
            </div>
            <div className="admin-input-group">
              <label>New Password</label>
              <input type="password" placeholder="••••••••" className="admin-input" />
            </div>
            <button className="admin-btn primary" onClick={() => { if (setToast) { setToast('Password updated successfully! 🔒'); setTimeout(() => setToast(null), 3000); } }} style={{ width: '100%', marginTop: '8px' }}>
              Update Password
            </button>
          </div>

          <div className="admin-card">
            <div className="admin-card-head">
              <h3>Two-Factor Authentication</h3>
            </div>
            
            <p style={{ fontSize: '0.95rem', color: '#6B7280', lineHeight: 1.6, marginBottom: '28px' }}>
              Add an extra layer of security to your account. Once enabled, you'll be required to enter both your password and an authentication code from your mobile device.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827' }}>Authenticator App</div>
              <button className="admin-btn" style={{ padding: '8px 16px' }} onClick={() => { if (setToast) { setToast('2FA setup instructions sent to your email! 🛡️'); setTimeout(() => setToast(null), 3000); } }}>
                Enable 2FA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 999 }} onClick={() => !isDeletingAccount && setShowDeleteConfirm(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', borderRadius: '16px', padding: '32px', width: '90%', maxWidth: '440px', zIndex: 1000, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ width: 48, height: 48, background: '#FEF2F2', color: '#EF4444', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <AlertCircle size={24} />
            </div>
            <h3 style={{ margin: '0 0 12px', fontSize: '1.25rem', color: '#111827', fontWeight: 600 }}>Delete Account</h3>
            <p style={{ margin: '0 0 24px', color: '#6B7280', fontSize: '0.95rem', lineHeight: 1.5 }}>
              This action <strong>cannot be undone</strong>. This will permanently delete your account, campaigns, contacts, bookings, and all associated data from our servers.
            </p>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                Type <strong>DELETE</strong> to confirm
              </label>
              <input 
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none', fontSize: '0.95rem' }}
                disabled={isDeletingAccount}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeletingAccount}
                style={{ flex: 1, padding: '10px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#374151', fontWeight: 600, cursor: isDeletingAccount ? 'not-allowed' : 'pointer', fontSize: '0.95rem' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeletingAccount}
                style={{ flex: 1, padding: '10px', background: '#EF4444', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: (deleteConfirmText !== 'DELETE' || isDeletingAccount) ? 'not-allowed' : 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: (deleteConfirmText !== 'DELETE' || isDeletingAccount) ? 0.6 : 1 }}
              >
                {isDeletingAccount ? <Loader2 size={18} className="cpm-spin" /> : null}
                {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
