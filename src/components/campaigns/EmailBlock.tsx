import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Eye, CheckCircle2, AlertCircle, Link as LinkIcon, Bold, Italic, Mail, MoreVertical } from 'lucide-react';
import { type CampaignStep, type EmailStatus, campaignEngine } from './campaignEngine';

interface EmailBlockProps {
  step: CampaignStep;
  stepIndex: number;
  userEmail: string;
  recipientEmail: string;
  onUpdate: (updated: CampaignStep) => void;
  onUpdateRecipient?: (email: string) => void;
  onDelete: () => void;
}

const statusMeta: Record<EmailStatus, { label: string; className: string }> = {
  Pending: { label: 'Pending', className: 'pending' },
  Generating: { label: 'Generating AI...', className: 'sending' },
  Queued: { label: 'Queued', className: 'queued' },
  Sending: { label: 'Sending...', className: 'sending' },
  Sent: { label: 'Sent', className: 'sent' },
  Opened: { label: 'Opened (Live)', className: 'opened' },
  Clicked: { label: 'Clicked Link', className: 'clicked' },
  Replied: { label: 'Replied!', className: 'replied' },
  Failed: { label: 'Delivery Failed', className: 'pending' },
  Skipped: { label: 'Skipped', className: 'pending' },
  Unsubscribed: { label: 'Unsubscribed', className: 'pending' },
  Paused: { label: 'Paused', className: 'pending' },
};

export const EmailBlock: React.FC<EmailBlockProps> = ({
  step,
  stepIndex,
  userEmail,
  recipientEmail,
  onUpdate,
  onUpdateRecipient,
  onDelete,
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [testStatus, setTestStatus] = useState<{ active: boolean; error: boolean; text: string }>({ active: false, error: false, text: '' });

  const insertVariable = (varName: string) => {
    const newBody = (step.body || '') + ` ${varName} `;
    onUpdate({ ...step, body: newBody });
  };

  const handleSendTest = async () => {
    const target = recipientEmail || 'kushaljoshi2786@gmail.com';
    const subj = step.subject || 'Test Email from LinksMeet';
    const html = renderPreview(step.body || '');
    setTestStatus({ active: true, error: false, text: 'Sending via Gmail API...' });
    const res = await campaignEngine.sendRealEmail(target, subj, html);
    setTestStatus({ active: true, error: !res.success, text: res.message });
    setTimeout(() => setTestStatus({ active: false, error: false, text: '' }), 6000);
  };

  const deriveName = (email: string) => {
    const [local = ''] = (email || 'joshikushal148@gmail.com').split('@');
    if (local.toLowerCase().includes('kushal')) return 'Kushal';
    let cleaned = local.replace(/[0-9_.-]+/g, ' ').trim();
    let words = cleaned.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    if (words.length === 1 && words[0].toLowerCase() === 'joshikushal') {
      words = ['Joshi', 'Kushal'];
    }
    return words.join(' ') || 'Joshi Kushal';
  };

  const renderPreview = (html: string) => {
    const toEmail = recipientEmail || 'joshikushal148@gmail.com';
    const toName = deriveName(toEmail);
    const fromName = 'Kushal';
    const domain = toEmail.includes('@') ? toEmail.split('@')[1] : '';
    const genericDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    const companyName = (!genericDomains.includes(domain.toLowerCase()) && domain.includes('.'))
      ? domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)
      : 'your organization';

    return html
      .replace(/{{RecipientID}}|{{RecipientEmail}}|{{FirstName}}|{{LastName}}/g, `<strong style="color: #0E61F3;">${toName}</strong>`)
      .replace(/{{SenderID}}|{{SenderEmail}}|{{MyEmail}}/g, `<strong style="color: #0E61F3;">${fromName}</strong>`)
      .replace(/{{Company}}/g, `<strong style="color: #0E61F3;">${companyName}</strong>`)
      .replace(/{{Industry}}/g, '<strong style="color: #0E61F3;">B2B Operations</strong>')
      .replace(/{{Location}}/g, '<strong style="color: #0E61F3;">Global</strong>');
  };

  const meta = statusMeta[step.status] || statusMeta.Pending;
  const isLivePulse = ['Sending', 'Generating', 'Queued'].includes(step.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="camp-block-card"
      style={{ marginLeft: stepIndex === 0 ? '0' : '0' }}
    >
      <div className="camp-block-head" style={{ padding: '16px 20px', background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: stepIndex === 0 ? '#0E61F3' : '#f8fafc', color: stepIndex === 0 ? '#fff' : '#0E61F3', borderRadius: '8px' }}>
            {stepIndex === 0 ? <Mail size={16} /> : <Send size={16} />}
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>{stepIndex === 0 ? 'Initial Email' : `Follow-up ${stepIndex}`}</h4>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
              {stepIndex === 0 ? 'Sent immediately upon starting' : 'Automated follow-up trigger'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className={`camp-status-badge ${meta.className}`} style={{ padding: '4px 12px', borderRadius: '100px', fontWeight: 700, letterSpacing: '0.02em', border: stepIndex === 0 ? 'none' : 'none' }}>
            {isLivePulse && <span className="camp-pulse-dot" style={{ width: 6, height: 6 }} />}
            {meta.label}
          </span>
          {stepIndex > 0 && (
            <button
              onClick={onDelete}
              className="camp-btn camp-btn-ghost"
              style={{ padding: '6px', color: '#64748b', border: '1px solid rgba(0,0,0,0.08)', background: '#fff' }}
              title="Remove step"
            >
              <MoreVertical size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="camp-block-body">
        <div className="camp-form-row">
          <span className="camp-form-label">To:</span>
          <input
            type="text"
            className="camp-email-input"
            value={recipientEmail || ''}
            placeholder="client@company.com"
            onChange={(e) => onUpdateRecipient ? onUpdateRecipient(e.target.value) : null}
            title="Target recipient email address"
          />
        </div>

        <div className="camp-form-row">
          <span className="camp-form-label">From:</span>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 500, color: '#334155', fontSize: '0.9rem' }}>{userEmail || 'kushal@linksmeet.io'}</span>
            <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
              Connected Mailbox ✓
            </span>
          </div>
        </div>

        <div className="camp-form-row">
          <span className="camp-form-label">Subject:</span>
          <input
            type="text"
            className="camp-email-input"
            placeholder="Enter subject line or let AI auto-fill..."
            value={step.subject || ''}
            onChange={(e) => onUpdate({ ...step, subject: e.target.value })}
          />
        </div>

      <div style={{ marginTop: '14px' }}>
        <div className="camp-rte-toolbar">
          <button
            type="button"
            className="camp-rte-btn"
            onClick={() => onUpdate({ ...step, body: `<b>${step.body || ''}</b>` })}
            title="Bold"
          >
            <Bold size={13} />
          </button>
          <button
            type="button"
            className="camp-rte-btn"
            onClick={() => onUpdate({ ...step, body: `<i>${step.body || ''}</i>` })}
            title="Italic"
          >
            <Italic size={13} />
          </button>
          <button
            type="button"
            className="camp-rte-btn"
            onClick={() => onUpdate({ ...step, body: `${step.body || ''} <a href="#">Link</a>` })}
            title="Insert Link"
          >
            <LinkIcon size={13} />
          </button>

          <span style={{ height: '14px', width: '1px', background: '#cbd5e1', margin: '0 4px' }} />

          <select
            className="camp-rte-btn"
            onChange={(e) => {
              if (e.target.value) {
                insertVariable(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>+ Insert Detail</option>
            <option value={deriveName(recipientEmail || 'joshikushal148@gmail.com')}>Recipient Name ({deriveName(recipientEmail || 'joshikushal148@gmail.com')})</option>
            <option value="Kushal">Sender Name (Kushal)</option>
            <option value="your organization">Organization</option>
          </select>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="camp-rte-btn"
              onClick={() => setIsPreview(!isPreview)}
              style={isPreview ? { background: '#0E61F3', color: '#fff', borderColor: '#0E61F3' } : {}}
            >
              <Eye size={13} style={{ display: 'inline', marginRight: '4px' }} />
              {isPreview ? 'Edit Mode' : 'Preview Live'}
            </button>
          </div>
        </div>

        {isPreview ? (
          <div
            className="camp-textarea"
            style={{ background: '#fcfcfd', borderTop: 'none', minHeight: '150px' }}
            dangerouslySetInnerHTML={{ __html: renderPreview(step.body || '<p style="color: #94a3b8;">No content entered yet.</p>') }}
          />
        ) : (
          <textarea
            className="camp-textarea"
            placeholder="Write your email copy or use the AI Campaign Studio on the right..."
            value={step.body?.replace(/<[^>]*>?/gm, '') || ''}
            onChange={(e) => {
              // Convert plain text breaks into simple p tags for storage
              const raw = e.target.value;
              const formatted = raw.split('\n\n').map(p => `<p>${p}</p>`).join('');
              onUpdate({ ...step, body: formatted || raw });
            }}
          />
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
        <button
          type="button"
          onClick={handleSendTest}
          className="camp-btn camp-btn-ghost"
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
        >
          {testStatus.active ? (
            <span style={{ color: testStatus.error ? '#dc2626' : '#16a34a', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              {testStatus.error ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />} {testStatus.text}
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Send size={13} /> Send Test Email
            </span>
          )}
        </button>
      </div>
      </div>
    </motion.div>
  );
};
