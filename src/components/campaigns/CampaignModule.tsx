import React, { useState, useEffect } from 'react';
import { MessageCircle, Mail, MessageSquare, BarChart3, Settings } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { campaignEngine } from './campaignEngine';
import { CampaignBuilder } from './CampaignBuilder';
import { SentActivityFeed } from './SentActivityFeed';
import { ConversationThreadView } from './ConversationThreadView';
import { CampaignAnalytics } from './CampaignAnalytics';
import { CampaignSettings } from './CampaignSettings';
import { ReplyPopupNotification } from './ReplyPopupNotification';
import './CampaignModule.css';

export const CampaignModule: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'builder' | 'sent' | 'conversations' | 'analytics' | 'settings'>('builder');
  const [unreadReplies, setUnreadReplies] = useState(0);

  useEffect(() => {
    const checkUnread = () => {
      const threads = campaignEngine.getThreads();
      setUnreadReplies(threads.filter(t => t.unread).length);
    };
    checkUnread();
    const unsub = campaignEngine.subscribe(() => checkUnread());
    return () => unsub();
  }, []);

  return (
    <div className="camp-module-wrap">
      {/* Module Header & Sub-Nav Tabs */}
      <div className="camp-header">
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>Outbound Campaigns</span>
            <span style={{ fontSize: '0.72rem', background: '#eef0fe', color: '#4f46e5', padding: '3px 10px', borderRadius: '9999px', fontWeight: 700, letterSpacing: '0.04em' }}>
              AI STUDIO 3.1
            </span>
          </h2>
          <p style={{ margin: '4px 0 0', color: 'var(--camp-text-muted)', fontSize: '0.88rem' }}>
            Design autonomous sequences, scrape target company intel, and engage prospects in real time.
          </p>
        </div>

        <div className="camp-tabs">
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
        {tab === 'builder' && <CampaignBuilder userEmail={user?.email || 'owner@salemail.io'} />}
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
