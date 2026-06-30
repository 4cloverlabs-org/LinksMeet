import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, ChevronDown, Edit2, CheckCircle2, Save, Play } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { campaignEngine, type Campaign } from './campaignEngine';
import { CampaignList } from './CampaignList';
import { CampaignBuilder } from './CampaignBuilder';
import { SentActivityFeed } from './SentActivityFeed';
import { ConversationThreadView } from './ConversationThreadView';
import { CampaignAnalytics } from './CampaignAnalytics';
import { CampaignSettings } from './CampaignSettings';
import { ReplyPopupNotification } from './ReplyPopupNotification';
import './CampaignModule.css';

export const CampaignModule: React.FC = () => {
  const { user } = useAuth();
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>(campaignEngine.getCampaigns());
  const [tab, setTab] = useState<'builder' | 'sent' | 'conversations' | 'analytics' | 'settings'>('builder');
  const [unreadReplies, setUnreadReplies] = useState(0);

  useEffect(() => {
    const checkUnread = () => {
      const threads = campaignEngine.getThreads();
      setUnreadReplies(threads.filter(t => t.unread).length);
      setCampaigns(campaignEngine.getCampaigns());
    };
    checkUnread();
    const unsub = campaignEngine.subscribe(() => checkUnread());
    return () => unsub();
  }, []);

  const handleCreateNew = () => {
    const newCamp: Campaign = {
      id: 'camp_' + Date.now(),
      name: 'New Outbound Campaign',
      status: 'Draft',
      recipientEmail: '',
      recipientName: '',
      createdAt: Date.now(),
      activeStepIndex: 0,
      steps: [
        {
          id: 's_' + Date.now() + '_1',
          type: 'email',
          title: 'Initial Email',
          subject: '',
          body: '',
          status: 'Pending',
          opens: 0,
          replies: 0,
          clicks: 0,
        }
      ]
    };
    campaignEngine.saveCampaign(newCamp);
    setCampaigns(campaignEngine.getCampaigns());
    setActiveCampaignId(newCamp.id);
    setTab('builder');
  };

  if (!activeCampaignId) {
    return (
      <div className="camp-module-wrap">
        <CampaignList 
          campaigns={campaigns} 
          onCreateNew={handleCreateNew}
          onSelect={(id) => {
            setActiveCampaignId(id);
            setTab('builder');
          }}
          onDelete={(id) => {
            campaignEngine.deleteCampaign(id);
            setCampaigns(campaignEngine.getCampaigns());
          }}
        />
        <ReplyPopupNotification onOpenConversation={() => setTab('conversations')} />
      </div>
    );
  }

  const activeCamp = campaigns.find(c => c.id === activeCampaignId) || campaigns[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc', overflow: 'hidden', fontFamily: "'Geist', 'Geist Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Top Breadcrumb & User Bar */}
      <div style={{ height: '56px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
          <button
            onClick={() => setActiveCampaignId(null)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#334155', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            <ArrowLeft size={16} /> Back to Campaigns
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
            <CheckCircle2 size={16} color="#16a34a" /> All changes saved
          </span>

          <div style={{ position: 'relative' }}>
            <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Bell size={18} />
              <span style={{ position: 'absolute', top: '-4px', right: '-6px', background: '#0E61F3', color: '#fff', fontSize: '0.68rem', fontWeight: 700, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '100px', padding: '4px 12px 4px 4px', cursor: 'pointer' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#0E61F3', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem' }}>
              {user?.email?.[0]?.toUpperCase() || 'K'}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
              {user?.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}` : 'Kushal Joshi'}
            </span>
            <ChevronDown size={14} color="#64748b" />
          </div>
        </div>
      </div>

      {/* Campaign Header Bar */}
      <div style={{ background: '#ffffff', padding: '24px 32px 0', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              {activeCamp?.name || 'SaaS Founders Outreach Q3'}
              <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'inline-flex' }}>
                <Edit2 size={16} />
              </button>
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dcfce7', color: '#15803d', padding: '2px 10px', borderRadius: '100px', fontWeight: 700, fontSize: '0.75rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} /> Running
              </span>
              <span>Created on May 24, 2025</span>
              <span>•</span>
              <span>Target: 250 leads</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontWeight: 600, fontSize: '0.88rem', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
              <Save size={15} /> Save Draft
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0E61F3', border: 'none', color: '#ffffff', fontWeight: 600, fontSize: '0.88rem', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(14, 97, 243, 0.2)' }}>
              <Play size={15} fill="currentColor" /> Start Campaign
            </button>
          </div>
        </div>

        {/* Sub-Tabs Bar */}
        <div style={{ display: 'flex', gap: '32px', borderTop: 'none' }}>
          <button
            onClick={() => setTab('builder')}
            style={{ padding: '12px 0', background: 'none', border: 'none', borderBottom: tab === 'builder' ? '2px solid #0E61F3' : '2px solid transparent', color: tab === 'builder' ? '#0E61F3' : '#64748b', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer' }}
          >
            Builder
          </button>
          <button
            onClick={() => setTab('sent')}
            style={{ padding: '12px 0', background: 'none', border: 'none', borderBottom: tab === 'sent' ? '2px solid #0E61F3' : '2px solid transparent', color: tab === 'sent' ? '#0E61F3' : '#64748b', fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer' }}
          >
            Activity
          </button>
          <button
            onClick={() => setTab('conversations')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0', background: 'none', border: 'none', borderBottom: tab === 'conversations' ? '2px solid #0E61F3' : '2px solid transparent', color: tab === 'conversations' ? '#0E61F3' : '#64748b', fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer' }}
          >
            Inbox & Replies
            <span style={{ background: '#EAF2FF', color: '#0E61F3', padding: '2px 8px', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 700 }}>12</span>
          </button>
          <button
            onClick={() => setTab('analytics')}
            style={{ padding: '12px 0', background: 'none', border: 'none', borderBottom: tab === 'analytics' ? '2px solid #0E61F3' : '2px solid transparent', color: tab === 'analytics' ? '#0E61F3' : '#64748b', fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer' }}
          >
            Analytics
          </button>
          <button
            onClick={() => setTab('settings')}
            style={{ padding: '12px 0', background: 'none', border: 'none', borderBottom: tab === 'settings' ? '2px solid #0E61F3' : '2px solid transparent', color: tab === 'settings' ? '#0E61F3' : '#64748b', fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer' }}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Scrollable Main Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
        {tab === 'builder' && <CampaignBuilder userEmail={user?.email || 'kushaljoshi2786@gmail.com'} campaignId={activeCampaignId} />}
        {tab === 'sent' && <SentActivityFeed />}
        {tab === 'conversations' && <ConversationThreadView />}
        {tab === 'analytics' && <CampaignAnalytics />}
        {tab === 'settings' && <CampaignSettings />}
      </div>

      <ReplyPopupNotification onOpenConversation={() => setTab('conversations')} />
    </div>
  );
};

export default CampaignModule;
