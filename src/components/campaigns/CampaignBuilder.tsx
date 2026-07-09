import React, { useState, useEffect } from 'react';
import { Plus, Mail, Send, CheckCircle2, ChevronDown, Trash2, Bold, Italic, Underline as UnderlineIcon, Link2, List, Image as ImageIcon, Smile, Eye, ArrowLeft, Pause, Edit2, LayoutGrid, Hourglass, Play, Sparkles } from 'lucide-react';
import { campaignEngine, type Campaign, type CampaignStep } from './campaignEngine';
import { useAuth } from '../../lib/AuthContext';
import { AICampaignStudio } from './AICampaignStudio';

const DelayUnitSelect = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        border: '1px solid transparent', 
        background: '#f8fafc',
        borderRadius: '6px', 
        padding: '4px 8px', 
        fontWeight: 700, 
        fontSize: '0.9rem',
        color: '#0f172a', 
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        outline: 'none',
      }}
      onMouseOver={(e) => e.currentTarget.style.border = '1px solid #cbd5e1'}
      onMouseOut={(e) => e.currentTarget.style.border = '1px solid transparent'}
    >
      <option value="minutes">minutes</option>
      <option value="hours">hours</option>
      <option value="days">days</option>
      <option value="weeks">weeks</option>
    </select>
  );
};

interface CampaignBuilderProps {
  userEmail: string;
  campaignId: string;
  onBack?: () => void;
  autoStartAIPrompt?: string;
  onCampaignStart?: () => void;
}

export const CampaignBuilder: React.FC<CampaignBuilderProps> = ({ userEmail, campaignId, onBack, autoStartAIPrompt, onCampaignStart }) => {
  const { } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>(campaignEngine.getCampaigns());
  const [selectedStepId, setSelectedStepId] = useState<string>('');
  const [showAIModal, setShowAIModal] = useState<boolean>(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [promptState, setPromptState] = useState<{ type: 'link' | 'image', selection: Range | null } | null>(null);
  const [promptInput, setPromptInput] = useState('');
  const [showSubjectTokens, setShowSubjectTokens] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const commonEmojis = ['😀', '🚀', '🔥', '✨', '💡', '📈', '👋', '🎉', '✅', '👀', '💪', '📅'];

  const saveSelectionAndPrompt = (type: 'link' | 'image') => {
    const sel = window.getSelection();
    const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
    setPromptState({ type, selection: range });
    setPromptInput('');
  };

  const handlePromptSubmit = () => {
    if (promptState && promptInput) {
      const ed = document.getElementById('rich-text-editor');
      if (ed) ed.focus();
      const sel = window.getSelection();
      if (sel && promptState.selection) {
        sel.removeAllRanges();
        sel.addRange(promptState.selection);
      }
      document.execCommand(promptState.type === 'link' ? 'createLink' : 'insertImage', false, promptInput);
      
      if (ed) {
        handleUpdateStep(selIdx, { ...selectedStep, body: ed.innerHTML } as any);
      }
    }
    setPromptState(null);
    setPromptInput('');
  };

  const [logs, setLogs] = useState(campaignEngine.getLogs());

  useEffect(() => {
    const unsub = campaignEngine.subscribe((event) => {
      if (['update', 'tick', 'campaign_completed', 'email_sent', 'new_reply'].includes(event)) {
        setCampaigns(campaignEngine.getCampaigns());
        setLogs(campaignEngine.getLogs());
      }
    });
    return () => unsub();
  }, []);

  const activeCamp = campaigns.find(c => c.id === campaignId) || campaigns[0];
  if (!activeCamp) return null;

  const campLogs = logs.filter(l => l.campaignId === activeCamp.id);
  const emailsSent = campLogs.filter(l => ['Sent', 'Opened', 'Clicked', 'Replied'].includes(l.status)).length;
  const emailsOpened = campLogs.filter(l => ['Opened', 'Clicked', 'Replied'].includes(l.status)).length;
  const emailsReplied = campLogs.filter(l => l.replied).length;
  
  const openRate = emailsSent > 0 ? ((emailsOpened / emailsSent) * 100).toFixed(1) + '%' : '0%';
  const replyRate = emailsSent > 0 ? ((emailsReplied / emailsSent) * 100).toFixed(1) + '%' : '0%';
  // For the prototype, there's 1 recipient per campaign setup
  const totalEnrolled = activeCamp.recipientEmail ? 1 : 0;

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
    
    // Auto-select the first available email step if the current one was deleted
    const remainingEmails = newSteps.filter(s => s.type === 'email');
    if (remainingEmails.length > 0) {
      setSelectedStepId(remainingEmails[0].id);
    } else {
      setSelectedStepId('');
    }
    showToast('Step deleted');
  };

  const handleAddFollowUp = () => {
    const newSteps = [...activeCamp.steps];
    const seqNum = newSteps.filter(s => s.type === 'email').length + 1;
    
    // Auto-insert a wait delay if the previous step is an email
    const lastStep = newSteps[newSteps.length - 1];
    if (lastStep && lastStep.type === 'email') {
      newSteps.push({
        id: 'd_wait_' + Date.now(),
        type: 'delay',
        title: 'Wait 2 days',
        delayValue: 2,
        delayUnit: 'days',
        status: 'Pending',
      });
    }

    const newEmailId = 's_fup_' + Date.now();
    newSteps.push({
      id: newEmailId,
      type: 'email',
      title: 'Follow-up ' + (seqNum - 1),
      subject: '',
      body: 'Hi {{invitee_name}},\n\nJust checking in on my previous note...',
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
  const tokens = ['{{invitee_name}}', '{{host_name}}', '{{meeting_date}}', '{{meeting_time}}', '{{meeting_link}}'];

  return (
    <div style={{ padding: 0, fontFamily: "'Geist', 'Geist Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* AI Studio moved to the right column */ }

      {toastMsg && (
        <div style={{ position: 'fixed', bottom: '40px', right: '32px', zIndex: 100, background: '#7d3bec', color: '#fff', padding: '10px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> {toastMsg}
        </div>
      )}

      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: '#ffffff', borderBottom: '1px solid #e2e8f0', borderRadius: 0, padding: '16px 40px 16px 40px', marginBottom: '24px' }}>
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#7d3bec', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', padding: 0, marginBottom: '8px' }}
        >
          <ArrowLeft size={16} /> Back to all sequences
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {activeCamp.name}
              </h1>
              <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
                {activeCamp.status === 'Running' ? 'Active' : activeCamp.status}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => {
                if (activeCamp.status !== 'Running') {
                   campaignEngine.startCampaign(activeCamp.id);
                   if (onCampaignStart) onCampaignStart();
                   showToast('Sequence started');
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: activeCamp.status === 'Running' ? '#e2e8f0' : '#7d3bec', border: 'none', color: activeCamp.status === 'Running' ? '#94a3b8' : '#ffffff', fontWeight: 600, fontSize: '0.85rem', padding: '9px 16px', borderRadius: '6px', cursor: activeCamp.status === 'Running' ? 'not-allowed' : 'pointer', transition: 'all 0.15s ease' }}
            >
              <Play size={14} fill="currentColor" /> Start Sequence
            </button>
            <button 
              onClick={() => {
                if (activeCamp.status === 'Running') {
                   handleUpdateCamp({ status: 'Paused' });
                   showToast('Sequence paused');
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #e2e8f0', color: activeCamp.status === 'Running' ? '#0f172a' : '#cbd5e1', fontWeight: 600, fontSize: '0.85rem', padding: '8px 14px', borderRadius: '6px', cursor: activeCamp.status === 'Running' ? 'pointer' : 'not-allowed', transition: 'all 0.15s ease' }}
            >
              <Pause size={14} strokeWidth={2.5} /> Pause Sequence
            </button>
            <button 
              onClick={() => {
                const newName = prompt('Enter new sequence name:', activeCamp.name);
                if (newName && newName.trim()) {
                  handleUpdateCamp({ name: newName.trim() });
                  showToast('Sequence name updated');
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #e2e8f0', color: '#7d3bec', fontWeight: 600, fontSize: '0.85rem', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
            >
              <Edit2 size={14} strokeWidth={2.5} /> Edit Sequence
            </button>

            <button 
              onClick={handleAddFollowUp}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#7d3bec', border: 'none', color: '#ffffff', fontWeight: 600, fontSize: '0.85rem', padding: '9px 16px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#6d28d9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#7d3bec'; }}
            >
              <Plus size={16} strokeWidth={2.5} /> Add Step
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 40px 40px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 350px) minmax(440px, 1fr) 350px', gap: '24px', alignItems: 'start' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f1f5f9', color: '#7d3bec', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>Sequence Overview</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{activeCamp.steps.length} Steps • {emailSteps.length} Emails</div>
            </div>
          </div>

          <div style={{ position: 'relative', paddingLeft: '16px', paddingTop: '10px' }}>
            <div style={{ position: 'absolute', left: '28px', top: '10px', bottom: '0px', width: '2px', background: '#e2e8f0', zIndex: 0 }} />
            {activeCamp.steps.map((step, idx) => {
              if (step.type === 'email') {
                emailCounter++;
                const isSel = selectedStep?.id === step.id;
                const curNum = emailCounter;
                return (
                  <div key={step.id} style={{ position: 'relative', marginBottom: '20px' }}>
                    <div style={{ position: 'absolute', left: '0', top: '24px', width: '26px', height: '26px', borderRadius: '50%', background: '#7d3bec', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', zIndex: 2, border: '2px solid #ffffff' }}>
                      {curNum}
                    </div>
                    <div
                      onClick={() => setSelectedStepId(step.id)}
                      style={{ marginLeft: '40px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: isSel ? '0 0 0 2px #7d3bec, 0 4px 12px rgba(14, 97, 243, 0.1)' : '0 1px 2px rgba(0,0,0,0.02)' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#7d3bec', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Mail size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '2px' }}>Step {curNum}</div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{step.title || (curNum === 1 ? 'Reminder: Upcoming Meeting' : `Follow-up ${curNum - 1}`)}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ background: '#eff6ff', color: '#7d3bec', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>Email</span>
                          {idx > 0 && (
                            <div
                              onClick={(e) => { e.stopPropagation(); handleDeleteStep(idx); }}
                              style={{ color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s ease' }}
                              onMouseOver={(e) => e.currentTarget.style.color = '#dc2626'}
                              onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                              title="Delete Step"
                            >
                              <Trash2 size={15} />
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ marginLeft: '44px', marginTop: '12px', fontSize: '0.8rem', color: '#64748b' }}>{curNum === 1 ? '1 day before meeting at 09:00 AM' : '1 hour before meeting'}</div>
                    </div>
                  </div>
                );
              } else if (step.type === 'delay') {
                return (
                  <div key={step.id} style={{ position: 'relative', marginBottom: '20px' }}>
                    <div style={{ position: 'absolute', left: '9px', top: '24px', width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8', zIndex: 2 }} />
                    <div style={{ marginLeft: '40px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Hourglass size={18} color="#7d3bec" />
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Wait for</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                            <input 
                              type="number" 
                              min="1"
                              value={step.delayValue || 2} 
                              onChange={(e) => handleUpdateStep(idx, { ...step, delayValue: parseInt(e.target.value) || 1 })}
                              style={{ 
                                width: '44px', 
                                border: '1px solid transparent', 
                                background: '#f8fafc',
                                borderRadius: '6px', 
                                padding: '4px 6px', 
                                fontWeight: 700, 
                                fontSize: '0.9rem',
                                outline: 'none', 
                                color: '#0f172a',
                                textAlign: 'center',
                                transition: 'all 0.2s ease',
                                cursor: 'text'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.border = '1px solid #cbd5e1'}
                              onMouseOut={(e) => e.currentTarget.style.border = '1px solid transparent'}
                              onFocus={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.border = '1px solid #7d3bec'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,97,243,0.1)' }}
                              onBlur={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.border = '1px solid transparent'; e.currentTarget.style.boxShadow = 'none' }}
                            />
                            <DelayUnitSelect
                              value={step.delayUnit || 'days'}
                              onChange={(val) => handleUpdateStep(idx, { ...step, delayUnit: val as any })}
                            />
                          </div>
                        </div>
                      </div>
                      <div
                        onClick={(e) => { e.stopPropagation(); handleDeleteStep(idx); }}
                        style={{ color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s ease', padding: '4px' }}
                        onMouseOver={(e) => e.currentTarget.style.color = '#dc2626'}
                        onMouseOut={(e) => e.currentTarget.style.color = '#cbd5e1'}
                        title="Delete Delay"
                      >
                        <Trash2 size={15} />
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })}

            <button onClick={handleAddFollowUp} style={{ marginLeft: '40px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', marginTop: '10px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#ffffff', border: '1px dashed #cbd5e1', color: '#7d3bec', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', left: '-40px' }}><Plus size={14} /></div>
              <div style={{ marginLeft: '-28px', textAlign: 'left' }}>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem' }}>Add Step</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Add Email or SMS step</div>
              </div>
            </button>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginTop: '16px' }}>
            <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem', marginBottom: '16px' }}>Sequence Performance <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Last 30 days)</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} color="#7d3bec" /> Total enrolled</span><span style={{ fontWeight: 700, color: '#0f172a' }}>{totalEnrolled}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14} color="#7d3bec" /> Emails sent</span><span style={{ fontWeight: 700, color: '#0f172a' }}>{emailsSent}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}><Eye size={14} color="#7d3bec" /> Open rate</span><span style={{ fontWeight: 700, color: '#0f172a' }}>{openRate}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}><Send size={14} color="#7d3bec" /> Reply rate</span><span style={{ fontWeight: 700, color: '#0f172a' }}>{replyRate}</span></div>
            </div>
          </div>
        </div>

        {selectedStep && selectedStep.type === 'email' && selIdx !== -1 ? (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#7d3bec', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={16} /></div>
                <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>Step {emailSteps.findIndex(s => s.id === selectedStep.id) + 1}: {selectedStep.title || 'Reminder - Upcoming Meeting'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span 
                  onClick={() => {
                    const newStatus = selectedStep.status === 'Paused' ? 'Pending' : 'Paused';
                    handleUpdateStep(selIdx, { ...selectedStep, status: newStatus });
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: selectedStep.status === 'Paused' ? '#f1f5f9' : '#dcfce7', color: selectedStep.status === 'Paused' ? '#64748b' : '#166534', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                  {selectedStep.status === 'Paused' ? 'Paused' : 'Active'}
                </span>
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', width: '40px' }}>From</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#0f172a' }}>{userEmail || 'sohithkontham5@gmail.com'}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#166534', fontSize: '0.75rem', fontWeight: 500, background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}><CheckCircle2 size={12} /> Connected</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1, marginRight: '16px', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', width: '40px', flexShrink: 0 }}>To</div>
                    {((activeCamp.recipientEmail || '').split(',').map(e => e.trim()).filter(Boolean)).map((email, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#7d3bec', fontSize: '0.8rem', fontWeight: 500, padding: '2px 8px', borderRadius: '6px' }}>
                        {email}
                        <button 
                          onClick={() => {
                            const current = (activeCamp.recipientEmail || '').split(',').map(e => e.trim()).filter(Boolean);
                            const updated = current.filter((_, idx) => idx !== i);
                            campaignEngine.saveCampaign({ ...activeCamp, recipientEmail: updated.join(', ') });
                          }}
                          style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Plus size={12} style={{ transform: 'rotate(45deg)' }} />
                        </button>
                      </div>
                    ))}
                    <input 
                      type="text" 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          const val = e.currentTarget.value.trim();
                          if (val) {
                            const current = (activeCamp.recipientEmail || '').split(',').map(e => e.trim()).filter(Boolean);
                            if (!current.includes(val)) {
                              const updated = [...current, val];
                              campaignEngine.saveCampaign({ ...activeCamp, recipientEmail: updated.join(', ') });
                            }
                            e.currentTarget.value = '';
                          }
                        } else if (e.key === 'Backspace' && !e.currentTarget.value) {
                          const current = (activeCamp.recipientEmail || '').split(',').map(e => e.trim()).filter(Boolean);
                          if (current.length > 0) {
                            const updated = current.slice(0, -1);
                            campaignEngine.saveCampaign({ ...activeCamp, recipientEmail: updated.join(', ') });
                          }
                        }
                      }}
                      style={{ flex: 1, minWidth: '150px', fontSize: '0.85rem', color: '#0f172a', border: 'none', background: 'transparent', outline: 'none' }}
                      placeholder={((activeCamp.recipientEmail || '').split(',').map(e => e.trim()).filter(Boolean)).length === 0 ? "recipient@company.com (press Enter)" : "Add another..."}
                    />
                  </div>
                  <button onClick={() => {
                     const email = prompt("Enter recipient email:");
                     if (email && email.trim()) {
                       const current = (activeCamp.recipientEmail || '').split(',').map(e => e.trim()).filter(Boolean);
                       if (!current.includes(email.trim())) {
                         const updated = [...current, email.trim()];
                         campaignEngine.saveCampaign({ ...activeCamp, recipientEmail: updated.join(', ') });
                       }
                     }
                  }} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#64748b', fontSize: '0.82rem', cursor: 'pointer', padding: 0, transition: 'color 0.15s ease', whiteSpace: 'nowrap' }} onMouseOver={e => e.currentTarget.style.color = '#0f172a'} onMouseOut={e => e.currentTarget.style.color = '#64748b'}>
                    <Plus size={14} /> Add Recipient
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>Subject</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px' }}>
                  <input type="text" value={selectedStep.subject || 'Reminder: Your meeting with {{host_name}} is tomorrow'} onChange={(e) => handleUpdateStep(selIdx, { ...selectedStep, subject: e.target.value })} style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem', color: '#0f172a', outline: 'none' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
                    <div style={{ position: 'relative', display: 'flex' }}>
                      <Smile size={18} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
                      {showEmojiPicker && (
                        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 50, padding: '12px', width: '220px' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>Emojis</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {commonEmojis.map(emoji => (
                              <div 
                                key={emoji}
                                onClick={() => {
                                  const newSub = (selectedStep.subject || '') + emoji;
                                  handleUpdateStep(selIdx, { ...selectedStep, subject: newSub });
                                  setShowEmojiPicker(false);
                                }}
                                style={{ fontSize: '1.2rem', cursor: 'pointer', padding: '4px', borderRadius: '4px', transition: 'background 0.15s ease' }}
                                onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                title={emoji}
                              >
                                {emoji}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <span 
                      onClick={() => setShowSubjectTokens(!showSubjectTokens)}
                      style={{ color: '#7d3bec', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                    >
                      Insert <ChevronDown size={14} />
                    </span>
                    {showSubjectTokens && (
                      <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 50, padding: '8px', width: '200px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '8px', padding: '0 4px' }}>Insert Token</div>
                        {tokens.map(t => (
                          <div 
                            key={t}
                            onClick={() => {
                              const newSub = (selectedStep.subject || '') + ' ' + t;
                              handleUpdateStep(selIdx, { ...selectedStep, subject: newSub });
                              setShowSubjectTokens(false);
                            }}
                            style={{ padding: '6px 8px', fontSize: '0.8rem', color: '#0f172a', cursor: 'pointer', borderRadius: '4px', transition: 'background 0.15s ease' }}
                            onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                          >
                            {t}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>Email Content</div>
                  <button onClick={() => showToast('Preview mode')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#7d3bec', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', padding: 0 }}><Eye size={14} /> Preview Email</button>
                </div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: '#334155' }}>Paragraph <ChevronDown size={14} /></span>
                      <div style={{ width: '1px', height: '16px', background: '#e2e8f0' }} />
                      <span title="Bold"><Bold size={15} onMouseDown={e => e.preventDefault()} onClick={() => document.execCommand('bold', false)} style={{ cursor: 'pointer', color: '#0f172a' }} /></span>
                      <span title="Italic"><Italic size={15} onMouseDown={e => e.preventDefault()} onClick={() => document.execCommand('italic', false)} style={{ cursor: 'pointer', color: '#0f172a' }} /></span>
                      <span title="Underline"><UnderlineIcon size={15} onMouseDown={e => e.preventDefault()} onClick={() => document.execCommand('underline', false)} style={{ cursor: 'pointer', color: '#0f172a' }} /></span>
                      <div style={{ width: '1px', height: '16px', background: '#e2e8f0' }} />
                      <span title="Insert Link"><Link2 size={15} onMouseDown={e => { e.preventDefault(); saveSelectionAndPrompt('link'); }} style={{ cursor: 'pointer', color: '#0f172a' }} /></span>
                      <span title="Insert Image"><ImageIcon size={15} onMouseDown={e => { e.preventDefault(); saveSelectionAndPrompt('image'); }} style={{ cursor: 'pointer', color: '#0f172a' }} /></span>
                      <span title="Bullet List"><List size={15} onMouseDown={e => e.preventDefault()} onClick={() => document.execCommand('insertUnorderedList', false)} style={{ cursor: 'pointer', color: '#0f172a' }} /></span>
                      <LayoutGrid size={15} style={{ cursor: 'pointer', color: '#0f172a' }} />
                    </div>
                  </div>
                  {promptState && (
                    <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input 
                        autoFocus
                        type="text" 
                        placeholder={promptState.type === 'link' ? "Enter link URL (e.g. https://...)" : "Enter image URL..."} 
                        value={promptInput}
                        onChange={e => setPromptInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handlePromptSubmit(); else if (e.key === 'Escape') setPromptState(null); }}
                        style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 10px', fontSize: '0.85rem', outline: 'none' }}
                      />
                      <button onClick={handlePromptSubmit} style={{ background: '#7d3bec', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Apply</button>
                      <button onClick={() => setPromptState(null)} style={{ background: '#ffffff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  )}
                  <div
                    id="rich-text-editor"
                    key={selectedStep.id}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const newHtml = e.currentTarget.innerHTML;
                      handleUpdateStep(selIdx, { ...selectedStep, body: newHtml });
                    }}
                    onFocus={(e) => { e.currentTarget.style.outline = 'none'; }}
                    dangerouslySetInnerHTML={{ __html: selectedStep.body || '' }}
                    style={{ width: '100%', minHeight: '340px', border: 'none', outline: 'none', fontSize: '0.95rem', lineHeight: '1.6', color: '#0f172a', padding: '20px', fontFamily: 'inherit', overflowY: 'auto' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Personalization Tokens</div>
                  <span style={{ fontSize: '0.8rem', color: '#7d3bec', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>View all tokens <ChevronDown size={14} /></span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {tokens.map(t => (
                    <div 
                      key={t} 
                      onClick={() => {
                        const ed = document.getElementById('rich-text-editor');
                        if (ed) {
                          ed.focus();
                          document.execCommand('insertText', false, t);
                          handleUpdateStep(selIdx, { ...selectedStep, body: ed.innerHTML });
                          showToast(`Inserted ${t}`);
                        }
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      style={{ border: '1px solid #bfdbfe', background: '#ffffff', color: '#7d3bec', fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s ease' }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#eff6ff'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#ffffff'}
                      title={`Click to insert ${t} into email`}
                    >
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding: '20px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => { if (selIdx > 0) handleDeleteStep(selIdx); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#dc2626', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}><Trash2 size={16} /> Delete Step</button>
              <div style={{ display: 'flex', gap: '12px' }}>

                <button onClick={() => showToast('Changes saved')} style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', fontWeight: 600, fontSize: '0.88rem', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}>Save Changes</button>
                <button 
                  onClick={() => {
                    const currentEmailIdx = emailSteps.findIndex(s => s.id === selectedStep.id);
                    if (currentEmailIdx >= 0 && currentEmailIdx < emailSteps.length - 1) {
                      setSelectedStepId(emailSteps[currentEmailIdx + 1].id);
                      showToast('Saved & Next');
                    } else {
                      showToast('Saved (Last Step)');
                    }
                  }} 
                  style={{ background: '#7d3bec', border: 'none', color: '#ffffff', fontWeight: 600, fontSize: '0.88rem', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(14, 97, 243, 0.2)' }}
                >
                  Save & Next
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '48px', textAlign: 'center', color: '#64748b' }}>Select an email step on the left timeline to edit its copy and variables.</div>
        )}
        
        {/* Right Sidebar: AI Studio */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <AICampaignStudio
            compact={false}
            onApplySequence={(generatedSteps) => {
              handleUpdateCamp({ steps: generatedSteps });
              const firstEmail = generatedSteps.find(s => s.type === 'email');
              if (firstEmail) setSelectedStepId(firstEmail.id);
              showToast('Sequence analyzed and generated successfully!');
            }}
            recipientEmail={activeCamp.recipientEmail}
            initPrompt={autoStartAIPrompt || ''}
            autoStart={!!autoStartAIPrompt}
          />
        </div>

        </div>
      </div>
    </div>
  );
};
