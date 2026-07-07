const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'pages', 'dashboard', 'AdminPage.tsx');
let content = fs.readFileSync(file, 'utf8');

const replacement = `  return (
    <div className="admin-page-container">
      {/* Top Tabs */}
      <div className="admin-tabs-container">
        {['Profile Settings', 'Preferences', 'Billing & Plans', 'Security'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={\`admin-tab \${activeTab === tab ? 'active' : ''}\`}
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
            <button className="admin-edit-btn" onClick={() => { if (setToast) { setToast('You can edit your personal info directly below!'); setTimeout(() => setToast(null), 3000); } }}><Edit2 size={16} /></button>
          </div>
          
          <div className="admin-input-group">
            <label>Full Name</label>
            <input className="admin-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jane Doe" />
          </div>
          <div className="admin-input-group">
            <label>Email Address</label>
            <input className="admin-input" value={user?.email || ''} disabled />
          </div>
          <div className="admin-input-group">
            <label>Scheduling Username</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#F9FAFB', borderBottom: '2px solid #E5E7EB', borderRadius: '8px 8px 0 0', paddingLeft: '12px', transition: 'border-color 0.3s' }}>
              <span style={{ color: '#9CA3AF', fontSize: '0.95rem', fontWeight: 500 }}>linksmeet.com/</span>
              <input className="admin-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="janedoe" style={{ borderBottom: 'none', background: 'transparent', paddingLeft: '4px' }} />
            </div>
          </div>
          <div className="admin-input-group">
            <label>Short Bio / Headline</label>
            <input className="admin-input" value={bio} onChange={e => setBio(e.target.value)} placeholder="e.g. Founder at Acme Corp" />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Brand Information */}
          <div className="admin-card">
            <div className="admin-card-head">
              <h3><Globe size={18} color="var(--ac)" /> Brand information</h3>
              <button className="admin-edit-btn" onClick={() => { if (setToast) { setToast('You can edit brand info directly below!'); setTimeout(() => setToast(null), 3000); } }}><Edit2 size={16} /></button>
            </div>
            
            <div className="admin-input-group" style={{ marginBottom: '16px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ margin: 0 }}>Website URL</label>
                  <button className="admin-magic-btn" onClick={handleAnalyze} disabled={isAnalyzing || !websiteUrl}>
                     {isAnalyzing ? <Loader2 size={12} className="cpm-spin" /> : <Sparkles size={12} />} 
                     AI Analyze
                  </button>
               </div>
               <input className="admin-input" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://yourcompany.com" />
            </div>
            
            <div className="admin-input-group">
               <label>Company Details & Brand Description</label>
               <textarea className="admin-textarea" value={brandDesc} onChange={e => setBrandDesc(e.target.value)} placeholder="Extracted AI details..." />
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
                <div className="admin-progress-fill" style={{ width: \`\${progress}%\` }} />
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
               <button className="admin-btn danger" onClick={logoutAndGo} style={{ gridColumn: '1 / -1' }}>
                  <LogOut size={16} /> Secure Log out
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
              <select className="admin-input" style={{ borderBottom: 'none', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                <option>(GMT-05:00) Eastern Time (US & Canada)</option>
                <option>(GMT-08:00) Pacific Time (US & Canada)</option>
                <option>(GMT+00:00) London</option>
              </select>
            </div>
            
            <div className="admin-input-group">
              <label>Language</label>
              <select className="admin-input" style={{ borderBottom: 'none', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                <option>English (US)</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
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
                  className={\`admin-toggle \${notif[n.key as keyof typeof notif] ? 'on' : ''}\`}
                  onClick={() => setNotif(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
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
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--ac) 0%, var(--ac2) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 20px rgba(14, 97, 243, 0.2)' }}>
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
              <input type="password" placeholder="••••••••" className="admin-input" style={{ borderBottom: 'none', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
            </div>
            <div className="admin-input-group">
              <label>New Password</label>
              <input type="password" placeholder="••••••••" className="admin-input" style={{ borderBottom: 'none', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
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
    </div>
  );
}
`;

// Replace from 'return (' up to the end of the file.
const returnIndex = content.indexOf('  return (\n    <div style={{ maxWidth: \'1200px\'');
if (returnIndex === -1) {
  // Try another match
  const alternateIndex = content.indexOf('  return (');
  if (alternateIndex !== -1) {
    const newContent = content.substring(0, alternateIndex) + replacement;
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Successfully replaced return block.');
  } else {
    console.error('Could not find return statement.');
  }
} else {
  const newContent = content.substring(0, returnIndex) + replacement;
  fs.writeFileSync(file, newContent, 'utf8');
  console.log('Successfully replaced return block.');
}
