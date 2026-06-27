import React, { useState } from 'react';
import { Shield, Clock, Sliders, Mail, Check } from 'lucide-react';
import { campaignEngine, type CampaignSettingsData } from './campaignEngine';

export const CampaignSettings: React.FC = () => {
  const [settings, setSettings] = useState<CampaignSettingsData>(campaignEngine.getSettings());
  const [savedToast, setSavedToast] = useState(false);

  const handleUpdate = (updates: Partial<CampaignSettingsData>) => {
    const next = { ...settings, ...updates };
    setSettings(next);
    campaignEngine.updateSettings(next);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Campaign Sending & Safety Settings</h3>
          <p style={{ margin: '4px 0 0', color: 'var(--camp-text-muted)', fontSize: '0.88rem' }}>
            Configure sending cadence, tracking pixels, and mailbox deliverability protections.
          </p>
        </div>
        {savedToast && (
          <span style={{ background: '#dcfce7', color: '#166534', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Check size={14} /> Settings Saved
          </span>
        )}
      </div>

      <div className="camp-flow-col" style={{ gap: '20px' }}>
        {/* Direct Mail Shoot Engine */}
        <div className="camp-block-card" style={{ border: '2px solid #818cf8', background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#4f46e5' }}>
              ⚡ Direct Mail Shoot Engine (No Activation Required)
            </h4>
            <span style={{ fontSize: '0.75rem', background: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              Instant Inbox Delivery
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--camp-text-muted)', marginBottom: '16px' }}>
            Configure your authenticated mail transport to shoot emails directly into lead inboxes without any verification or activation emails.
          </p>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => handleUpdate({ directMailEngine: 'web3forms' })}
              className={`camp-btn ${settings.directMailEngine === 'web3forms' ? 'camp-btn-primary' : 'camp-btn-ghost'}`}
              style={{ fontSize: '0.85rem', padding: '8px 16px', flex: 1 }}
            >
              🔑 Web3Forms API Key
            </button>
            <button
              type="button"
              onClick={() => handleUpdate({ directMailEngine: 'emailjs' })}
              className={`camp-btn ${settings.directMailEngine === 'emailjs' ? 'camp-btn-primary' : 'camp-btn-ghost'}`}
              style={{ fontSize: '0.85rem', padding: '8px 16px', flex: 1 }}
            >
              📧 EmailJS Connected SMTP
            </button>
          </div>

          {settings.directMailEngine === 'web3forms' ? (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Web3Forms Access Key (<a href="https://web3forms.com" target="_blank" rel="noreferrer" style={{ color: '#4f46e5' }}>Get free key instantly</a>)
              </label>
              <input
                type="text"
                placeholder="e.g. 8a2e41c3-5b8d-4e12-9c3a-1234567890ab"
                value={settings.web3FormsKey || ''}
                onChange={(e) => handleUpdate({ web3FormsKey: e.target.value })}
                className="camp-input"
                style={{ width: '100%', fontFamily: 'monospace' }}
              />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>Service ID</label>
                <input
                  type="text"
                  placeholder="service_xxx"
                  value={settings.emailJsServiceId || ''}
                  onChange={(e) => handleUpdate({ emailJsServiceId: e.target.value })}
                  className="camp-input"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>Template ID</label>
                <input
                  type="text"
                  placeholder="template_xxx"
                  value={settings.emailJsTemplateId || ''}
                  onChange={(e) => handleUpdate({ emailJsTemplateId: e.target.value })}
                  className="camp-input"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>Public Key</label>
                <input
                  type="text"
                  placeholder="public_xxx"
                  value={settings.emailJsPublicKey || ''}
                  onChange={(e) => handleUpdate({ emailJsPublicKey: e.target.value })}
                  className="camp-input"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sending Limits & Cadence */}
        <div className="camp-block-card">
          <h4 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} style={{ color: '#4f46e5' }} /> Sending Cadence & Limits
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Daily Sending Limit per Mailbox</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--camp-text-muted)' }}>Protects your domain reputation from spam blocks. Recommended: 50.</div>
              </div>
              <input
                type="number"
                min={10}
                max={500}
                value={settings.dailyLimit}
                onChange={(e) => handleUpdate({ dailyLimit: parseInt(e.target.value) || 50 })}
                className="camp-input"
                style={{ width: '80px', textAlign: 'center', fontWeight: 700 }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--camp-border)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Weekend Sending</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--camp-text-muted)' }}>Allow automated follow-ups to go out on Saturdays and Sundays.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.weekendSending}
                onChange={(e) => handleUpdate({ weekendSending: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#4f46e5', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Working Hours & Timezone */}
        <div className="camp-block-card">
          <h4 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} style={{ color: '#06b6d4' }} /> Working Hours Window
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--camp-text-muted)', display: 'block', marginBottom: '6px' }}>Start Time</label>
              <input
                type="time"
                value={settings.workingHoursStart}
                onChange={(e) => handleUpdate({ workingHoursStart: e.target.value })}
                className="camp-input"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--camp-text-muted)', display: 'block', marginBottom: '6px' }}>End Time</label>
              <input
                type="time"
                value={settings.workingHoursEnd}
                onChange={(e) => handleUpdate({ workingHoursEnd: e.target.value })}
                className="camp-input"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--camp-text-muted)', display: 'block', marginBottom: '6px' }}>Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => handleUpdate({ timezone: e.target.value })}
                className="camp-input"
                style={{ width: '100%', background: '#fff' }}
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Safety & Tracking Protections */}
        <div className="camp-block-card">
          <h4 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} style={{ color: '#10b981' }} /> Reply Safety & Tracking Protections
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Stop Campaign on Reply</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--camp-text-muted)' }}>Immediately pause all pending follow-ups the moment a prospect replies.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.stopOnReply}
                onChange={(e) => handleUpdate({ stopOnReply: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#4f46e5', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--camp-border)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Open Pixel Tracking</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--camp-text-muted)' }}>Embed invisible tracking pixels to record live email opens.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.pixelTracking}
                onChange={(e) => handleUpdate({ pixelTracking: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#4f46e5', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--camp-border)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Link Click Tracking</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--camp-text-muted)' }}>Rewrite links automatically to track clicks and prospect engagement.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.linkTracking}
                onChange={(e) => handleUpdate({ linkTracking: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#4f46e5', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--camp-border)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Auto Unsubscribe Link</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--camp-text-muted)' }}>Append CAN-SPAM compliant unsubscribe link at the bottom of sequence emails.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoUnsubscribe}
                onChange={(e) => handleUpdate({ autoUnsubscribe: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#4f46e5', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Signature */}
        <div className="camp-block-card">
          <h4 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={18} style={{ color: '#8b5cf6' }} /> Default Email Signature
          </h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--camp-text-muted)', marginBottom: '10px' }}>
            Appended automatically to outbound emails if variables are omitted. Supports HTML formatting.
          </p>
          <textarea
            value={settings.signature}
            onChange={(e) => handleUpdate({ signature: e.target.value })}
            className="camp-textarea"
            style={{ minHeight: '80px' }}
          />
        </div>
      </div>
    </div>
  );
};
