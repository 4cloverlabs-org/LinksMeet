import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Play, Pause, Save, CheckCircle2 } from 'lucide-react';
import { campaignEngine, type Campaign, type CampaignStep } from './campaignEngine';
import { EmailBlock } from './EmailBlock';
import { DelayBlock } from './DelayBlock';
import { AICampaignStudio } from './AICampaignStudio';

interface CampaignBuilderProps {
  userEmail: string;
  campaignId: string;
}

export const CampaignBuilder: React.FC<CampaignBuilderProps> = ({ userEmail, campaignId }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(campaignEngine.getCampaigns());
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
    const seqNum = newSteps.filter(s => s.type === 'email').length;
    newSteps.push({
      id: 's_delay_' + Math.random().toString(36).substring(2, 9),
      type: 'delay',
      title: 'Wait 3 days',
      delayValue: 3,
      delayUnit: 'days',
      status: 'Pending',
    });
    newSteps.push({
      id: 's_fup_' + Math.random().toString(36).substring(2, 9),
      type: 'email',
      title: 'Follow-up ' + seqNum,
      subject: '',
      body: '',
      status: 'Pending',
    });
    handleUpdateCamp({ steps: newSteps });
  };

  const handleApplyAI = (aiSteps: CampaignStep[]) => {
    handleUpdateCamp({ steps: aiSteps });
    showToast('✨ AI Sequence Applied to Workflow!');
  };

  const handleStartPause = () => {
    if (activeCamp.status === 'Running') {
      campaignEngine.pauseCampaign(activeCamp.id);
      showToast('Campaign paused');
    } else {
      campaignEngine.startCampaign(activeCamp.id);
      showToast('Campaign is now active');
    }
  };

  const handleSaveDraft = () => {
    handleUpdateCamp({ status: 'Draft' });
    showToast('Draft saved securely');
  };

  let emailCounter = 0;

  return (
    <div>
      {/* Selector & Actions Bar */}
      <div className="camp-flow-actions" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)', padding: '12px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div
            className="camp-input"
            style={{ fontWeight: 600, width: 'auto', minWidth: '180px', background: '#fff', border: '1px solid rgba(0,0,0,0.08)', padding: '8px 12px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {activeCamp.name}
          </div>

          <input
            type="text"
            value={activeCamp.name}
            onChange={(e) => handleUpdateCamp({ name: e.target.value })}
            className="camp-input"
            style={{ fontWeight: 600, width: '220px', background: '#fff', border: '1px solid rgba(0,0,0,0.08)', padding: '8px 12px' }}
            placeholder="Campaign Name"
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--camp-text-muted)' }}>Target Lead:</span>
            <input
              type="email"
              value={activeCamp.recipientEmail}
              onChange={(e) => handleUpdateCamp({ recipientEmail: e.target.value })}
              className="camp-input"
              style={{ width: '200px', padding: '8px 12px', fontSize: '0.85rem', background: '#fff', border: '1px solid rgba(0,0,0,0.08)' }}
              placeholder="recipient@company.com"
            />
          </div>

          <span className={`camp-status-badge ${activeCamp.status === 'Running' ? 'sent' : activeCamp.status === 'Paused' ? 'replied' : 'pending'}`} style={{ padding: '6px 12px', borderRadius: '100px' }}>
            {activeCamp.status === 'Running' && <span className="camp-pulse-dot" style={{ width: 6, height: 6 }} />}
            {activeCamp.status}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {toastMsg && (
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '6px 12px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} /> {toastMsg}
            </span>
          )}

          <button onClick={handleSaveDraft} className="camp-btn camp-btn-ghost" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', color: '#0f172a', fontWeight: 600, padding: '8px 16px' }}>
            <Save size={15} style={{ color: '#64748b' }} /> Save Draft
          </button>

          <button
            onClick={handleStartPause}
            className="camp-btn camp-btn-primary"
            style={activeCamp.status === 'Running' ? { background: '#4f46e5', color: '#fff', fontWeight: 600, padding: '8px 16px' } : { background: '#4f46e5', color: '#fff', fontWeight: 600, padding: '8px 16px' }}
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
          <div className="camp-timeline-wrapper">
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
          </div>

          <div style={{ margin: '12px 0 48px' }}>
            <button
              onClick={handleAddFollowUp}
              className="camp-btn camp-btn-ghost"
              style={{ padding: '10px 20px', background: '#fff', border: '1px dashed #c7d2fe', color: '#4f46e5', fontWeight: 600, borderRadius: '8px', boxShadow: 'none' }}
            >
              <Plus size={16} /> Add Follow-Up Step
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
