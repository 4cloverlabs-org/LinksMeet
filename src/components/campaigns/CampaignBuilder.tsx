import React, { useState, useEffect } from 'react';
import { Plus, Mail, Send, MoreVertical, CheckCircle2, ChevronDown, ChevronUp, Trash2, Bold, Italic, Underline as UnderlineIcon, Link2, List, Image as ImageIcon, Smile, Eye, Hourglass, LayoutGrid } from 'lucide-react';
import { campaignEngine, type Campaign, type CampaignStep } from './campaignEngine';
import { useAuth } from '../../lib/AuthContext';
import { AICampaignStudio } from './AICampaignStudio';

interface CampaignBuilderProps {
  userEmail: string;
  campaignId: string;
}

export const CampaignBuilder: React.FC<CampaignBuilderProps> = ({ userEmail, campaignId }) => {
  const { } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>(campaignEngine.getCampaigns());
  const [selectedStepId, setSelectedStepId] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = campaignEngine.subscribe((event) => {
      if (['update', 'tick', 'campaign_completed'].includes(event)) {
        setCampaigns(campaignEngine.getCampaigns());
      }
    });
    return () => unsub();
  }, []);

  const activeCamp = campaigns.find(c => c.id === campaignId) || campaigns[0];
  if (!activeCamp) return null;

  const emailSteps = activeCamp.steps.filter(s => s.type === 'email');
  const selectedStep = activeCamp.steps.find(s => s.id === selectedStepId) || emailSteps[0] || activeCamp.steps[0];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleUpdateCamp = (updated: Partial<Campaign>) => {
    const next = { ...activeCamp, ...updated };
    campaignEngine.saveCampaign(next);
    setCampaigns(campaignEngine.getCampaigns());
  };

  const handleUpdateStep = (index: number, step: CampaignStep) => {
    const newSteps = [...activeCamp.steps];
    newSteps[index] = step;
    handleUpdateCamp({ steps: newSteps });
  };

  const handleDeleteStep = (index: number) => {
    const newSteps = [...activeCamp.steps];
    newSteps.splice(index, 1);
    handleUpdateCamp({ steps: newSteps });
  };

  const handleAddFollowUp = () => {
    const newSteps = [...activeCamp.steps];
    const seqNum = newSteps.filter(s => s.type === 'email').length + 1;
    const newEmailId = 's_fup_' + Date.now();
    newSteps.push({
      id: 's_delay_' + Date.now(),
      type: 'delay',
      title: 'Wait 3 days',
      delayValue: 3,
      delayUnit: 'days',
      status: 'Pending',
    });
    newSteps.push({
      id: newEmailId,
      type: 'email',
      title: 'Follow-up ' + (seqNum - 1),
      subject: '',
      body: 'Hi {{first_name}},\n\nJust checking in on my previous note...\n\nBest,\nKushal',
      status: 'Pending',
      opens: 0,
      replies: 0,
      clicks: 0,
    });
    handleUpdateCamp({ steps: newSteps });
    setSelectedStepId(newEmailId);
    showToast('Follow-up step added');
  };

  let emailCounter = 0;
  const selIdx = selectedStep ? activeCamp.steps.findIndex(s => s.id === selectedStep.id) : -1;

  return (
    <div style={{ position: 'relative', fontFamily: "'Geist', 'Geist Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {toastMsg && (
        <div style={{ position: 'fixed', bottom: '40px', right: '32px', zIndex: 100, background: '#0E61F3', color: '#fff', padding: '10px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '0.88rem', boxShadow: '0 8px 20px rgba(14, 97, 243, 0.35)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> {toastMsg}
        </div>
      )}

      {/* 3-Column Grid: Timeline | Step Editor | AI Link & Pitch Analysis */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(380px, 420px) minmax(440px, 1fr) 350px', gap: '28px', alignItems: 'start' }}>
        
        {/* COLUMN 1: Sequence Timeline */}
        <div style={{ position: 'relative' }}>
          {/* Top row above timeline: Add Step button & Grid icon button side-by-side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <button
              onClick={handleAddFollowUp}
              style={{ background: '#0E61F3', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(14, 97, 243, 0.2)' }}
            >
              <Plus size={16} /> Add Step
            </button>
            <button style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}>
              <LayoutGrid size={16} />
            </button>
          </div>

          {/* Vertical timeline connector line */}
          <div style={{ position: 'absolute', left: '16px', top: '70px', bottom: '60px', width: '2px', background: '#cbd5e1', zIndex: 0 }} />

          {activeCamp.steps.map((step, idx) => {
            if (step.type === 'email') {
              emailCounter++;
              const isSel = selectedStep?.id === step.id;
              const curNum = emailCounter;

              return (
                <div key={step.id} style={{ position: 'relative', marginBottom: '16px' }}>
                  {/* Circle indicator on vertical line outside the card */}
                  {curNum === 1 ? (
                    <div style={{ position: 'absolute', left: '10px', top: '30px', width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #0E61F3', background: '#ffffff', zIndex: 2 }} />
                  ) : (
                    <div style={{ position: 'absolute', left: '3px', top: '24px', width: '28px', height: '28px', borderRadius: '50%', background: '#0E61F3', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem', zIndex: 2, boxShadow: '0 2px 4px rgba(14, 97, 243, 0.2)' }}>
                      {curNum}
                    </div>
                  )}

                  {/* Email Step Card */}
                  <div
                    onClick={() => setSelectedStepId(step.id)}
                    style={{ marginLeft: '48px', background: '#ffffff', border: isSel ? '2px solid #0E61F3' : '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 18px', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: isSel ? '0 4px 16px rgba(14, 97, 243, 0.08)' : '0 1px 4px rgba(0,0,0,0.02)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Blue square icon box */}
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#0E61F3', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {curNum === 1 ? <Mail size={18} /> : <Send size={18} />}
                        </div>

                        {/* Light blue round pill number inside card */}
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#dbeafe', color: '#1e40af', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {curNum}
                        </div>

                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                            {step.title || (curNum === 1 ? 'Initial Email' : `Follow-up ${curNum - 1}`)}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', fontWeight: 500 }}>
                            {curNum === 1 ? 'Sent immediately' : 'If no reply'}
                          </div>
                        </div>
                      </div>

                      {/* Right Analytics & Menu */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '14px', textAlign: 'center' }}>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                              <span style={{ fontSize: '0.78rem', marginRight: '3px' }}>👁</span>{step.opens ?? (curNum === 1 ? 124 : curNum === 2 ? 98 : curNum === 3 ? 63 : 37)}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>Opens</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                              <span style={{ fontSize: '0.78rem', marginRight: '3px' }}>↩</span>{step.replies ?? (curNum === 1 ? 23 : curNum === 2 ? 17 : curNum === 3 ? 11 : 7)}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>Replies</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                              <span style={{ fontSize: '0.78rem', marginRight: '3px' }}>⚡</span>{step.clicks ?? (curNum === 1 ? 8 : curNum === 2 ? 5 : curNum === 3 ? 4 : 2)}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>Clicks</div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => { e.stopPropagation(); if (curNum > 1) handleDeleteStep(idx); }}
                          style={{ background: 'none', border: 'none', color: '#64748b', padding: '4px', cursor: 'pointer' }}
                        >
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={step.id} style={{ position: 'relative', marginBottom: '16px' }}>
                  {/* Dot on line */}
                  <div style={{ position: 'absolute', left: '13px', top: '20px', width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8', zIndex: 2 }} />

                  {/* Delay Card */}
                  <div style={{ marginLeft: '48px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Hourglass size={18} color="#0E61F3" />
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Wait for</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>{step.delayValue || 2} {step.delayUnit || 'days'}</div>
                      </div>
                    </div>
                    <span style={{ background: '#f1f5f9', color: '#475569', fontWeight: 600, fontSize: '0.78rem', padding: '4px 8px', borderRadius: '6px' }}>
                      {step.delayValue || 2}d
                    </span>
                  </div>
                </div>
              );
            }
          })}

          {/* Add Step Button at bottom */}
          <div style={{ marginLeft: '48px', marginTop: '8px' }}>
            <button
              onClick={handleAddFollowUp}
              style={{ width: '100%', padding: '12px', background: '#ffffff', border: '1px dashed #93c5fd', borderRadius: '10px', color: '#0E61F3', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.15s ease' }}
            >
              <Plus size={16} /> Add Step
            </button>
          </div>
        </div>

        {/* COLUMN 2: Selected Step Editor Card */}
        {selectedStep && selectedStep.type === 'email' && selIdx !== -1 ? (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
            {/* Editor Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#0E61F3', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={18} />
                </div>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>
                  {selectedStep.title || 'Initial Email'}
                </span>
                <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
                  Step {emailSteps.findIndex(s => s.id === selectedStep.id) + 1} of 7
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 600, fontSize: '0.85rem' }}>
                  <CheckCircle2 size={16} /> Ready
                </span>
                <ChevronUp size={16} color="#64748b" style={{ cursor: 'pointer' }} />
                <button
                  onClick={() => { if (selIdx > 0) handleDeleteStep(selIdx); }}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div style={{ padding: '20px 24px 0' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>From</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 14px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 500, color: '#0f172a' }}>{userEmail || 'kushaljoshi2786@gmail.com'}</span>
                  <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Connected ✓ <ChevronDown size={13} />
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>To</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 14px' }}>
                  <input
                    type="text"
                    value={activeCamp.recipientEmail || 'client@company.com'}
                    onChange={(e) => handleUpdateCamp({ recipientEmail: e.target.value })}
                    style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.88rem', color: '#0f172a', fontWeight: 500, outline: 'none' }}
                  />
                  <span style={{ color: '#0E61F3', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Add Recipient</span>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>Subject</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 14px' }}>
                  <input
                    type="text"
                    value={selectedStep.subject || 'Helping {{company}} streamline their operations'}
                    onChange={(e) => handleUpdateStep(selIdx, { ...selectedStep, subject: e.target.value })}
                    style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.88rem', color: '#0f172a', fontWeight: 500, outline: 'none' }}
                  />
                  <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    ✨ Personalize <ChevronDown size={13} />
                  </span>
                </div>
              </div>
            </div>

            {/* Rich Text Toolbar & Textarea Box */}
            <div style={{ margin: '0 24px 20px', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#475569' }}>
                  <button type="button" onClick={() => handleUpdateStep(selIdx, { ...selectedStep, body: `<b>${selectedStep.body || ''}</b>` })} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}><Bold size={15} /></button>
                  <button type="button" onClick={() => handleUpdateStep(selIdx, { ...selectedStep, body: `<i>${selectedStep.body || ''}</i>` })} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}><Italic size={15} /></button>
                  <button type="button" onClick={() => handleUpdateStep(selIdx, { ...selectedStep, body: `<u>${selectedStep.body || ''}</u>` })} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}><UnderlineIcon size={15} /></button>
                  <button type="button" style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}><Link2 size={15} /></button>
                  <button type="button" style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}><List size={15} /></button>
                  <button type="button" style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}><ImageIcon size={15} /></button>
                  <button type="button" style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}><Smile size={15} /></button>
                </div>

                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleUpdateStep(selIdx, { ...selectedStep, body: `${selectedStep.body || ''} ${e.target.value}` });
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  style={{ background: 'none', border: 'none', fontSize: '0.82rem', fontWeight: 600, color: '#475569', cursor: 'pointer', outline: 'none' }}
                >
                  <option value="" disabled>{'{ } Variables'}</option>
                  <option value="{{first_name}}">First Name ({'{{first_name}}'})</option>
                  <option value="{{company}}">Company ({'{{company}}'})</option>
                  <option value="{{industry}}">Industry ({'{{industry}}'})</option>
                </select>
              </div>

              <textarea
                value={(selectedStep.body || 'Hi {{first_name}},\n\nI came across {{company}} and loved what you\'re building in the {{industry}} space.\n\nMany {{industry}} teams we work with face similar challenges around automation and operational efficiency.\n\nWe help companies like {{company}} streamline workflows, reduce manual work, and scale faster.\n\nWould you be open to a quick 15-min chat next week?\n\nBest,\nKushal').replace(/<[^>]*>?/gm, '')}
                onChange={(e) => {
                  const raw = e.target.value;
                  const formatted = raw.split('\n\n').map(p => `<p>${p}</p>`).join('');
                  handleUpdateStep(selIdx, { ...selectedStep, body: formatted || raw });
                }}
                placeholder="Write your email content..."
                style={{ width: '100%', minHeight: '340px', border: 'none', outline: 'none', resize: 'vertical', fontSize: '0.92rem', lineHeight: '1.6', color: '#0f172a', padding: '20px', fontFamily: 'inherit' }}
              />
            </div>

            {/* Footer Action Bar */}
            <div style={{ padding: '16px 24px', background: '#ffffff', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => showToast('Test email dispatched to ' + userEmail)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', fontWeight: 600, fontSize: '0.88rem', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}
              >
                <Send size={15} /> Send Test Email
              </button>

              <button
                onClick={() => showToast('Preview generated for ' + selectedStep.title)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', fontWeight: 600, fontSize: '0.88rem', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}
              >
                <Eye size={15} /> Preview Email
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '48px', textAlign: 'center', color: '#64748b' }}>
            Select an email step on the left timeline to edit its copy and variables.
          </div>
        )}

        {/* COLUMN 3: AI Link & Description Analysis Section */}
        <div>
          <AICampaignStudio
            onApplySequence={(generatedSteps) => {
              handleUpdateCamp({ steps: generatedSteps });
              const firstEmail = generatedSteps.find(s => s.type === 'email');
              if (firstEmail) setSelectedStepId(firstEmail.id);
              showToast('Sequence analyzed and generated successfully!');
            }}
            recipientEmail={activeCamp.recipientEmail}
          />
        </div>
      </div>
    </div>
  );
};
