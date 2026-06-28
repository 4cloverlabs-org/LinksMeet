import React, { useState } from 'react';
import { Shield, Clock, Sliders, Mail, Check } from 'lucide-react';
import { campaignEngine, type CampaignSettingsData } from './campaignEngine';
import { useAuth } from '../../lib/AuthContext';
import { isGmailConnected, getGmailToken, getGmailEmail } from '../../lib/gmailToken';

export const CampaignSettings: React.FC = () => {
  const { signInWithGoogle, user } = useAuth();
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
        {/* Direct Gmail API Engine */}
        <div className="camp-block-card" style={{ border: '2px solid #60A5FA', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#0E61F3' }}>
              ⚡ Direct Gmail API Engine (Live Connected Mailbox)
            </h4>
            <span style={{ fontSize: '0.75rem', background: '#e0e7ff', color: '#0E61F3', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              Auto Sent-Folder Sync
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--camp-text-muted)', marginBottom: '16px' }}>
            Your authenticated Gmail Workspace mailbox dispatches emails directly into client inboxes with zero third-party intermediaries.
          </p>

          <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b' }}>
                  {settings.gmailAccessToken || isGmailConnected() ? '✅ Connected Mailbox Authorized' : '⚠️ No Gmail Mailbox Connected'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  {settings.gmailUserEmail || getGmailEmail() || user?.email || 'Click below to connect your Google account'}
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await signInWithGoogle();
                    const updatedToken = getGmailToken() || '';
                    const updatedEmail = getGmailEmail() || user?.email || '';
                    handleUpdate({ directMailEngine: 'gmail', gmailAccessToken: updatedToken, gmailUserEmail: updatedEmail });
                  } catch (e) {
                    console.error("Gmail OAuth connection failed:", e);
                  }
                }}
                className="camp-btn camp-btn-primary"
                style={{ fontSize: '0.82rem', padding: '8px 16px', background: '#0E61F3' }}
              >
                🔗 1-Click Connect Gmail
              </button>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569' }}>
              💡 <strong>Why Gmail API?</strong> Outbound sequences are sent authenticated natively through Google's REST infrastructure. Copies are automatically indexed inside your Gmail <strong>Sent</strong> folder!
            </p>
          </div>
        </div>

        {/* Sending Limits & Cadence */}
        <div className="camp-block-card">
          <h4 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} style={{ color: '#0E61F3' }} /> Sending Cadence & Limits
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
                style={{ width: '18px', height: '18px', accentColor: '#0E61F3', cursor: 'pointer' }}
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
                style={{ width: '18px', height: '18px', accentColor: '#0E61F3', cursor: 'pointer' }}
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
                style={{ width: '18px', height: '18px', accentColor: '#0E61F3', cursor: 'pointer' }}
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
                style={{ width: '18px', height: '18px', accentColor: '#0E61F3', cursor: 'pointer' }}
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
                style={{ width: '18px', height: '18px', accentColor: '#0E61F3', cursor: 'pointer' }}
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
