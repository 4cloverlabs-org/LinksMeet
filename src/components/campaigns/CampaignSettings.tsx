import React, { useState } from 'react';
import { 
  Shield, Clock, Mail, Check, BarChart2, Eye, Link as LinkIcon, MessageSquare, Edit2, Lightbulb, 
  RefreshCw, Bold, Italic, Underline, Link2, List, ListOrdered, AlignLeft, AlignCenter, Code, ChevronDown, Info, ArrowRight 
} from 'lucide-react';
import { campaignEngine, type CampaignSettingsData } from './campaignEngine';
import { useAuth } from '../../lib/AuthContext';

export const CampaignSettings: React.FC = () => {
  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (c: boolean) => void }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        background: checked ? '#7d3bec' : '#cbd5e1',
        border: 'none',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.2s ease',
        flexShrink: 0,
        padding: 0
      }}
    >
      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: '#fff',
        position: 'absolute',
        top: '2px',
        left: checked ? '22px' : '2px',
        transition: 'left 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      }} />
    </button>
  );

  const HeaderIcon = ({ icon: Icon, color, bg }: { icon: any, color: string, bg: string }) => (
    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={24} color={color} />
    </div>
  );

  const RowIcon = ({ icon: Icon, color, bg }: { icon: any, color: string, bg: string }) => (
    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={18} color={color} />
    </div>
  );

  const ToolbarBtn = ({ icon: Icon }: { icon: any }) => (
    <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={16} />
    </button>
  );

  const { user } = useAuth();
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
    <div style={{ width: '100%', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Campaign Sending & Safety Settings</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
            Configure sending cadence, tracking pixels, and mailbox deliverability protections.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {savedToast && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '8px', color: '#16a34a', fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <Check size={16} /> All changes saved
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Direct Gmail API Engine */}
        <div style={{ border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '12px', padding: '32px', display: 'flex', gap: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #e2e8f0' }}>
             <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" alt="Gmail" style={{ width: '32px', height: '32px' }} />
          </div>
          
          <div style={{ flex: 1, zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  Direct Gmail API Engine
                </h4>
                <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '999px', fontWeight: 700 }}>
                  Live Connected Mailbox
                </span>
              </div>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#7d3bec', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                <RefreshCw size={14} /> Auto Sent-Folder Sync
              </button>
            </div>
            
            <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '32px', lineHeight: 1.5, maxWidth: '600px' }}>
              Your authenticated Gmail Workspace mailbox sends emails directly into client inboxes with zero third-party intermediaries.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>
              <div style={{ background: '#f8fafc', padding: '20px 24px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: '#16a34a', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={20} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#166534' }}>Connected Mailbox Authorized</div>
                  <div style={{ fontSize: '0.9rem', color: '#475569', marginTop: '2px' }}>
                    {settings.gmailUserEmail || localStorage.getItem('sm_gmail_email') || user?.email || 'Not connected'}
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '20px 24px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Lightbulb size={20} color="#7d3bec" />
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>
                  <strong style={{ color: '#0f172a' }}>Why Gmail API?</strong> Outbound sequences are sent authenticated natively through Google's REST infrastructure. Copies are automatically indexed inside your Gmail Sent folder!
                </p>
              </div>
            </div>
          </div>
          
          {/* Decorative placeholder for the 3D graphic on the right side */}
          <div style={{ position: 'absolute', right: '40px', bottom: '40px', width: '240px', height: '180px', pointerEvents: 'none', zIndex: 1 }}>
            <div style={{ position: 'absolute', right: 0, bottom: 0, width: '200px', height: '140px', background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)', borderRadius: '16px', boxShadow: '0 20px 40px rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #fff' }}>
               <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" alt="Gmail" style={{ width: '80px', height: '80px', opacity: 0.9 }} />
               <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', width: '50px', height: '50px', background: '#16a34a', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(22, 163, 74, 0.2)', border: '3px solid #fff' }}>
                 <Check size={28} color="#fff" strokeWidth={3} />
               </div>
            </div>
            {/* Some floating particles to mimic the image */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', width: '8px', height: '8px', background: '#7d3bec', borderRadius: '50%', opacity: 0.6 }}></div>
            <div style={{ position: 'absolute', top: '80px', left: '10px', width: '4px', height: '4px', background: '#e2e8f0', borderRadius: '50%' }}></div>
          </div>
        </div>

        {/* 2-Column Grid for Cadence and Working Hours */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Sending Cadence & Limits */}
          <div style={{ border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
              <HeaderIcon icon={BarChart2} color="#7d3bec" bg="#eff6ff" />
              <div>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Sending Cadence & Limits</h4>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b' }}>Control how many emails are sent and when.</p>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '8px' }}>Daily Sending Limit per Mailbox</div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>Protects your domain reputation from spam blocks.<br/>Recommended: 50.</div>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    value={settings.dailyLimit}
                    onChange={(e) => handleUpdate({ dailyLimit: parseInt(e.target.value) || 50 })}
                    style={{ width: '120px', padding: '12px 16px', fontSize: '1rem', fontWeight: 600, border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
                    onFocus={(e) => (e.target.style.borderColor = '#7d3bec')}
                    onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '8px' }}>Weekend Sending</div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>Allow automated follow-ups<br/>to go out on Saturdays and Sundays.</div>
                </div>
                <ToggleSwitch
                  checked={settings.weekendSending}
                  onChange={(checked) => handleUpdate({ weekendSending: checked })}
                />
              </div>
            </div>
          </div>

          {/* Working Hours Window */}
          <div style={{ border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
              <HeaderIcon icon={Clock} color="#7d3bec" bg="#eff6ff" />
              <div>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Working Hours Window</h4>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b' }}>Set the time window when emails can be sent.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '10px' }}>Start Time</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="time"
                    value={settings.workingHoursStart}
                    onChange={(e) => handleUpdate({ workingHoursStart: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', fontSize: '0.95rem', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
                  />
                  <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>
                    <Clock size={16} />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '10px' }}>End Time</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="time"
                    value={settings.workingHoursEnd}
                    onChange={(e) => handleUpdate({ workingHoursEnd: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', fontSize: '0.95rem', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
                  />
                  <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>
                    <Clock size={16} />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '10px' }}>Timezone</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleUpdate({ timezone: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px 12px 40px', fontSize: '0.95rem', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', outline: 'none', background: '#fff', appearance: 'none' }}
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                  </select>
                  <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>
                    {/* Globe icon approximation */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
                  </div>
                  <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Safety & Tracking Protections */}
        <div style={{ border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '12px', padding: '32px' }}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
            <HeaderIcon icon={Shield} color="#16a34a" bg="#dcfce7" />
            <div>
              <h4 style={{ margin: '0 0 6px', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Reply Safety & Tracking Protections</h4>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b' }}>Protect conversations and track engagement securely.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '40px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <RowIcon icon={MessageSquare} color="#16a34a" bg="#f0fdf4" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '4px' }}>Stop Campaign on Reply</div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Immediately pause all pending follow-ups the moment a prospect replies.</div>
                  </div>
                </div>
                <ToggleSwitch checked={settings.stopOnReply} onChange={(checked) => handleUpdate({ stopOnReply: checked })} />
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <RowIcon icon={Eye} color="#16a34a" bg="#f0fdf4" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '4px' }}>Open Pixel Tracking</div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Embed invisible tracking pixels to record live email opens.</div>
                  </div>
                </div>
                <ToggleSwitch checked={settings.pixelTracking} onChange={(checked) => handleUpdate({ pixelTracking: checked })} />
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <RowIcon icon={LinkIcon} color="#16a34a" bg="#f0fdf4" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '4px' }}>Link Click Tracking</div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Rewrite links automatically to track clicks and prospect engagement.</div>
                  </div>
                </div>
                <ToggleSwitch checked={settings.linkTracking} onChange={(checked) => handleUpdate({ linkTracking: checked })} />
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <RowIcon icon={Mail} color="#16a34a" bg="#f0fdf4" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '4px' }}>Auto Unsubscribe Link</div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Append CAN-SPAM compliant unsubscribe link at the bottom of sequence emails.</div>
                  </div>
                </div>
                <ToggleSwitch checked={settings.autoUnsubscribe} onChange={(checked) => handleUpdate({ autoUnsubscribe: checked })} />
              </div>

            </div>

            {/* Right side illustration card */}
            <div style={{ width: '320px', background: '#f8fafc', borderRadius: '12px', padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
               <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(22, 163, 74, 0.3)', marginBottom: '32px', position: 'relative' }}>
                 <Check size={40} color="#fff" strokeWidth={3} />
                 {/* Decorative sparkles */}
                 <div style={{ position: 'absolute', top: '-15px', right: '-15px', color: '#86efac', fontSize: '16px' }}>✨</div>
                 <div style={{ position: 'absolute', bottom: '10px', left: '-25px', color: '#86efac', fontSize: '14px' }}>✨</div>
               </div>
               <p style={{ margin: 0, fontSize: '1.05rem', color: '#475569', lineHeight: 1.6, fontWeight: 500 }}>
                 These protections help you stay compliant, improve deliverability, and ensure respectful communication.
               </p>
            </div>
          </div>
        </div>

        {/* Signature */}
        <div style={{ border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '12px', padding: '32px' }}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
            <HeaderIcon icon={Edit2} color="#a855f7" bg="#f3e8ff" />
            <div>
              <h4 style={{ margin: '0 0 6px', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Default Email Signature</h4>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b' }}>Appended automatically to outbound emails if variables are omitted. Supports HTML formatting.</p>
            </div>
          </div>
          
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', gap: '6px' }}>
              <ToolbarBtn icon={Bold} />
              <ToolbarBtn icon={Italic} />
              <ToolbarBtn icon={Underline} />
              <ToolbarBtn icon={Link2} />
              <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 12px' }}></div>
              <ToolbarBtn icon={List} />
              <ToolbarBtn icon={ListOrdered} />
              <ToolbarBtn icon={AlignLeft} />
              <ToolbarBtn icon={AlignCenter} />
              <ToolbarBtn icon={Code} />
              <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 12px' }}></div>
              <button style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#475569', cursor: 'pointer', padding: '4px 8px' }}>
                Variables <ChevronDown size={16} />
              </button>
            </div>
            <textarea
              value={settings.signature}
              onChange={(e) => handleUpdate({ signature: e.target.value })}
              style={{ width: '100%', minHeight: '120px', padding: '24px', fontSize: '0.95rem', border: 'none', color: '#0f172a', outline: 'none', resize: 'vertical', fontFamily: 'monospace' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>
              {settings.signature.length} characters
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #bfdbfe' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#1e40af', fontSize: '0.95rem' }}>
            <Info size={20} />
            <span><strong style={{ fontWeight: 800 }}>Best Practice:</strong> Keep daily limits realistic and ensure your content provides value to maintain high deliverability.</span>
          </div>
          <button style={{ background: 'none', border: 'none', color: '#7d3bec', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            Learn more about deliverability <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};
