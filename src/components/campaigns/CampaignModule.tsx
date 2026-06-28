import React, { useState, useEffect } from 'react';
import { MessageCircle, Mail, MessageSquare, BarChart3, Settings, ArrowLeft } from 'lucide-react';
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
    setActiveCampaignId(newId);
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

  // Removed strict activeCamp check that might cause state bounce


  return (
    <div className="camp-module-wrap">
      {/* Module Header & Sub-Nav Tabs */}
      <div className="camp-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <button
            onClick={() => setActiveCampaignId(null)}
            style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '7px 14px 7px 11px', display: 'inline-flex', alignItems: 'center', gap: '7px', color: '#475569', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', marginBottom: '16px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', transition: 'all 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
          >
            <ArrowLeft size={15} /> Back to Campaigns
          </button>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.04em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>Outbound Campaigns</span>
            <span style={{ fontSize: '0.72rem', background: '#eef0fe', color: '#4f46e5', padding: '3px 10px', borderRadius: '9999px', fontWeight: 600, letterSpacing: '0.02em' }}>
              AI STUDIO 3.1
            </span>
          </h2>
          <p style={{ margin: '6px 0 0', color: 'var(--camp-text-muted)', fontSize: '0.88rem' }}>
            Design autonomous sequences, scrape target company intel, and engage prospects in real time.
          </p>
        </div>

        <div className="camp-tabs" style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setTab('builder')}
            className={`camp-tab-btn ${tab === 'builder' ? 'active' : ''}`}
          >
            <MessageCircle size={16} /> Campaign Builder
          </button>

          <button
            onClick={() => setTab('sent')}
            className={`camp-tab-btn ${tab === 'sent' ? 'active' : ''}`}
          >
            <Mail size={16} /> Sent Activity Feed
          </button>

          <button
            onClick={() => { setTab('conversations'); }}
            className={`camp-tab-btn ${tab === 'conversations' ? 'active' : ''}`}
          >
            <MessageSquare size={16} /> Inbox & Replies
            {unreadReplies > 0 && <span className="camp-badge">{unreadReplies}</span>}
          </button>

          <button
            onClick={() => setTab('analytics')}
            className={`camp-tab-btn ${tab === 'analytics' ? 'active' : ''}`}
          >
            <BarChart3 size={16} /> Analytics
          </button>

          <button
            onClick={() => setTab('settings')}
            className={`camp-tab-btn ${tab === 'settings' ? 'active' : ''}`}
          >
            <Settings size={16} /> Settings
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div style={{ marginTop: '20px' }}>
        {tab === 'builder' && <CampaignBuilder userEmail={user?.email || 'owner@salemail.io'} campaignId={activeCampaignId} />}
        {tab === 'sent' && <SentActivityFeed />}
        {tab === 'conversations' && <ConversationThreadView />}
        {tab === 'analytics' && <CampaignAnalytics />}
        {tab === 'settings' && <CampaignSettings />}
      </div>

      {/* Global Floating Reply Notification */}
      <ReplyPopupNotification onOpenConversation={() => setTab('conversations')} />
    </div>
  );
};

export default CampaignModule;
