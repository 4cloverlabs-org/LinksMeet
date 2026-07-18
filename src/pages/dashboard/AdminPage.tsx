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
    setUserProfile
  } = ctx || {};

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [brandDesc, setBrandDesc] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  
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
    const newAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(randomSeed)}`;
    setProfilePic(newAvatar);
    setAvatarError(false);
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
        {['Profile Settings', 'Preferences', 'Billing & Plans'].map(tab => (
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
            {(!avatarError && profilePic) ? <img src={profilePic} alt="Avatar" onError={() => setAvatarError(true)} /> : (userInitials || <User size={32} />)}
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
        <div className="admin-cards-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        
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
               <textarea className="admin-textarea" value={brandDesc} onChange={e => setBrandDesc(e.target.value)} placeholder="Extracted AI details..." disabled={!isEditingBrand} style={{ minHeight: '200px', resize: 'vertical' }} />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', padding: '24px', background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '1rem', color: '#111827' }}>Account Actions</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6B7280' }}>Save your changes or permanently delete your account.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                style={{ padding: '8px 16px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#EF4444', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Delete Account
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="admin-btn primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {saving && <Loader2 size={16} className="cpm-spin" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
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


        </div>
      )}

      {/* Billing & Plans Tab */}
      {activeTab === 'Billing & Plans' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          <div className="admin-card">
            <div className="admin-card-head">
              <h3>Available Plans</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {/* Growth Plan */}
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Growth</div>
                <div style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '20px', minHeight: '40px' }}>Built for growing teams that need more scale and insights.</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', marginBottom: '24px' }}>$39<span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#6B7280' }}>/mo</span></div>
                <button className="admin-btn" style={{ width: '100%', marginBottom: '24px' }} onClick={() => { if (setToast) { setToast('Redirecting to checkout...'); setTimeout(() => setToast(null), 3000); } }}>Get Started</button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   {['Up to 5 Users', '20 AI Campaigns per month', 'Dynamic Audience Targeting', 'Email, Ads & Social Auto-Templates', 'Performance Insights Dashboard', '5 User Workspace'].map((feat, i) => (
                     <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: '#374151' }}>
                       <Check size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} /> <span>{feat}</span>
                     </div>
                   ))}
                </div>
              </div>

              {/* Pro Plan */}
              <div style={{ border: '2px solid var(--ac, #000)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--ac, #000)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Recommended</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Pro</div>
                <div style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '20px', minHeight: '40px' }}>All the power. For serious marketers and small agencies.</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', marginBottom: '24px' }}>$99<span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#6B7280' }}>/mo</span></div>
                <button className="admin-btn primary" style={{ width: '100%', marginBottom: '24px' }} onClick={() => { if (setToast) { setToast('Redirecting to checkout...'); setTimeout(() => setToast(null), 3000); } }}>Get Started</button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   {['Unlimited Campaigns', 'Unlimited Team Members', 'AI-Performance Predictions', 'A/B Testing Recommendations', 'Performance Insights Dashboard', 'Priority Chat & Email Support'].map((feat, i) => (
                     <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: '#374151' }}>
                       <Check size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} /> <span>{feat}</span>
                     </div>
                   ))}
                </div>
              </div>

              {/* Enterprise Plan */}
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Enterprise</div>
                <div style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '20px', minHeight: '40px' }}>Tailored AI marketing infrastructure for large teams.</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', marginBottom: '24px' }}>Custom</div>
                <button className="admin-btn" style={{ width: '100%', marginBottom: '24px' }} onClick={() => { if (setToast) { setToast('Contacting sales...'); setTimeout(() => setToast(null), 3000); } }}>Get Started</button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   {['Dedicated Onboarding', 'Custom Integrations', 'Performance Insights Dashboard', 'SLA & Security Compliance', 'Priority Chat & Email Support', 'VIP Support & Strategy Calls'].map((feat, i) => (
                     <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: '#374151' }}>
                       <Check size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} /> <span>{feat}</span>
                     </div>
                   ))}
                </div>
              </div>

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
