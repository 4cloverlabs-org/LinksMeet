import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Play, Pause, Save, CheckCircle2 } from 'lucide-react';
import { campaignEngine, type Campaign, type CampaignStep } from './campaignEngine';
import { EmailBlock } from './EmailBlock';
import { DelayBlock } from './DelayBlock';
import { AICampaignStudio } from './AICampaignStudio';

interface CampaignBuilderProps {
  userEmail: string;
}

export const CampaignBuilder: React.FC<CampaignBuilderProps> = ({ userEmail }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(campaignEngine.getCampaigns());
  const [activeCampId, setActiveCampId] = useState<string>(campaigns[0]?.id || 'new');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = campaignEngine.subscribe((event) => {
      if (['update', 'tick', 'campaign_completed'].includes(event)) {
        setCampaigns(campaignEngine.getCampaigns());
      }
    });
    return () => unsub();
  }, []);

  const activeCamp = campaigns.find(c => c.id === activeCampId) || {
    id: 'camp_' + Math.random().toString(36).substring(2, 9),
    name: 'New Outbound Sequence',
    status: 'Draft' as const,
    recipientEmail: 'client@targetcompany.com',
    createdAt: Date.now(),
    steps: [
      {
        id: 's_init',
        type: 'email' as const,
        title: 'Initial Email',
        subject: '',
        body: '',
        status: 'Pending' as const,
      },
    ],
  };

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
    const newSteps = activeCamp.steps.filter((_, i) => i !== index);
    // Re-title emails
    let emailIdx = 0;
    newSteps.forEach((s) => {
      if (s.type === 'email') {
        s.title = emailIdx === 0 ? 'Initial Email' : `Follow-up ${emailIdx}`;
        emailIdx++;
      }
    });
    handleUpdateCamp({ steps: newSteps });
  };

  const handleAddFollowUp = () => {
    const emailCount = activeCamp.steps.filter(s => s.type === 'email').length;
    const newSteps = [
      ...activeCamp.steps,
      {
        id: 's_' + Math.random().toString(36).substring(2, 9),
        type: 'delay' as const,
        title: `Wait 2 days`,
        delayValue: 2,
        delayUnit: 'days' as const,
        status: 'Pending' as const,
      },
      {
        id: 's_' + Math.random().toString(36).substring(2, 9),
        type: 'email' as const,
        title: `Follow-up ${emailCount}`,
        subject: '',
        body: '',
        status: 'Pending' as const,
      },
    ];
    handleUpdateCamp({ steps: newSteps });
  };

  const handleApplyAI = (aiSteps: CampaignStep[]) => {
    handleUpdateCamp({ steps: aiSteps });
    showToast('✨ AI Sequence Applied to Workflow!');
  };

  const handleStartPause = () => {
    if (activeCamp.status === 'Running') {
      campaignEngine.pauseCampaign(activeCamp.id);
      showToast('Campaign Paused');
    } else {
      campaignEngine.startCampaign(activeCamp.id);
      showToast('🚀 Campaign Started! First email dispatching.');
    }
  };

  const handleSaveDraft = () => {
    campaignEngine.saveCampaign(activeCamp);
    showToast('💾 Draft Saved');
  };

  let emailCounter = 0;

  return (
    <div>
      {/* Selector & Actions Bar */}
      <div className="camp-flow-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <select
            value={activeCampId}
            onChange={(e) => {
              if (e.target.value === 'create_new') {
                const newId = 'camp_' + Math.random().toString(36).substring(2, 9);
                const newCamp: Campaign = {
                  id: newId,
                  name: 'New Sequence ' + (campaigns.length + 1),
                  status: 'Draft',
                  recipientEmail: 'client@targetcompany.com',
                  createdAt: Date.now(),
                  steps: [
                    { id: 's_init', type: 'email', title: 'Initial Email', subject: '', body: '', status: 'Pending' },
                  ],
                };
                campaignEngine.saveCampaign(newCamp);
                setCampaigns(campaignEngine.getCampaigns());
                setActiveCampId(newId);
              } else {
                setActiveCampId(e.target.value);
              }
            }}
            className="camp-input"
            style={{ fontWeight: 700, width: '220px', background: '#fff' }}
          >
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.status})</option>
            ))}
            <option value="create_new">+ Create New Campaign</option>
          </select>

          <input
            type="text"
            value={activeCamp.name}
            onChange={(e) => handleUpdateCamp({ name: e.target.value })}
            className="camp-input"
            style={{ fontWeight: 600, width: '200px' }}
            placeholder="Campaign Name"
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--camp-text-muted)' }}>Target Lead:</span>
            <input
              type="email"
              value={activeCamp.recipientEmail}
              onChange={(e) => handleUpdateCamp({ recipientEmail: e.target.value })}
              className="camp-input"
              style={{ width: '190px', padding: '6px 10px', fontSize: '0.85rem' }}
              placeholder="recipient@company.com"
            />
          </div>

          <span className={`camp-status-badge ${activeCamp.status === 'Running' ? 'sent' : activeCamp.status === 'Paused' ? 'replied' : 'pending'}`}>
            {activeCamp.status === 'Running' && <span className="camp-pulse-dot" />}
            {activeCamp.status}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {toastMsg && (
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '6px 12px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} /> {toastMsg}
            </span>
          )}

          <button onClick={handleSaveDraft} className="camp-btn camp-btn-ghost">
            <Save size={15} /> Save Draft
          </button>

          <button
            onClick={handleStartPause}
            className="camp-btn camp-btn-primary"
            style={activeCamp.status === 'Running' ? { background: '#f59e0b', boxShadow: 'none' } : {}}
          >
            {activeCamp.status === 'Running' ? (
              <>
                <Pause size={15} /> Pause Campaign
              </>
            ) : (
              <>
                <Play size={15} /> Start Campaign
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2-Column Main Layout */}
      <div className="camp-builder-grid">
        {/* Left Column: Flow Builder */}
        <div className="camp-flow-col">
          <AnimatePresence>
            {activeCamp.steps.map((step, idx) => {
              if (step.type === 'email') {
                const curIndex = emailCounter;
                emailCounter++;
                return (
                  <EmailBlock
                    key={step.id}
                    step={step}
                    stepIndex={curIndex}
                    userEmail={userEmail}
                    recipientEmail={activeCamp.recipientEmail}
                    onUpdate={(s) => handleUpdateStep(idx, s)}
                    onUpdateRecipient={(newEmail) => handleUpdateCamp({ recipientEmail: newEmail })}
                    onDelete={() => handleDeleteStep(idx)}
                  />
                );
              } else {
                return (
                  <DelayBlock
                    key={step.id}
                    step={step}
                    isRunning={activeCamp.status === 'Running'}
                    onUpdate={(s) => handleUpdateStep(idx, s)}
                    onDelete={() => handleDeleteStep(idx)}
                  />
                );
              }
            })}
          </AnimatePresence>

          <div style={{ textAlign: 'center', margin: '16px 0' }}>
            <button
              onClick={handleAddFollowUp}
              className="camp-btn camp-btn-ghost"
              style={{ padding: '10px 24px', border: '1px dashed #94a3b8', color: '#475569', background: '#fff' }}
            >
              <Plus size={16} style={{ color: '#4f46e5' }} /> Add Follow-Up Step
            </button>
          </div>
        </div>

        {/* Right Column: AI Studio Dock */}
        <div>
          <AICampaignStudio onApplySequence={handleApplyAI} recipientEmail={activeCamp.recipientEmail} />
        </div>
      </div>
    </div>
  );
};
