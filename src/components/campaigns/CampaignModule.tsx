import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Bell, ChevronDown, Edit2, CheckCircle2, Save, Loader2, Sparkles, AlertCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { campaignEngine, type Campaign } from './campaignEngine';
import { CampaignList } from './CampaignList';
import { CampaignBuilder } from './CampaignBuilder';
import { SentActivityFeed } from './SentActivityFeed';
import { ConversationThreadView } from './ConversationThreadView';
import { CampaignAnalytics } from './CampaignAnalytics';
import { CampaignSettings } from './CampaignSettings';
import { ReplyPopupNotification } from './ReplyPopupNotification';
import { API_BASE_URL } from '../../lib/config';
import './CampaignModule.css';

export interface CampaignModuleProps {
  initLead?: any;
  onInitConsumed?: () => void;
  userProfile?: any;
  canEdit?: boolean;
  changeStatus?: (id: string, status: any) => void;
  contacts?: any[];
}

export const CampaignModule: React.FC<CampaignModuleProps> = ({ initLead, onInitConsumed, userProfile, canEdit = true, changeStatus, contacts }) => {
  const { user } = useAuth();
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [deleteModalCampaign, setDeleteModalCampaign] = useState<Campaign | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>(campaignEngine.getCampaigns());
  const [tab, setTab] = useState<'builder' | 'sent' | 'conversations' | 'analytics' | 'settings'>('builder');
  const [, setUnreadReplies] = useState(0);
  const [brandInfo, setBrandInfo] = useState<{ url: string; desc: string } | null>(
    userProfile ? { url: userProfile.website_url || '', desc: userProfile.brand_description || '' } : null
  );

  useEffect(() => {
    if (userProfile) {
      setBrandInfo({ url: userProfile.website_url || '', desc: userProfile.brand_description || '' });
    }
  }, [userProfile]);

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

  const [autoStartPrompt, setAutoStartPrompt] = useState<string | undefined>();
  const processedLeadId = React.useRef<string | null>(null);

  useEffect(() => {
    if (initLead && processedLeadId.current !== initLead.id) {
      processedLeadId.current = initLead.id;
      const newCamp: Campaign = {
        id: crypto.randomUUID(),
        name: `Campaign for ${initLead.name}`,
        status: 'Draft',
        recipientEmail: initLead.email || '',
        recipientName: initLead.name || '',
        createdAt: Date.now(),
        steps: []
      };
      
      let prompt = '';
      if (brandInfo && (brandInfo.url || brandInfo.desc)) {
        prompt += `You are writing on behalf of our company. Here is our company profile: ${brandInfo.desc} (Website: ${brandInfo.url}).\n`;
      }

      if (initLead.company) {
        prompt += `This is a lead named ${initLead.name || 'Unknown'} (Email: ${initLead.email}). They submitted these notes: "${initLead.company}". Write a highly personalized 3-step sequence reminding them about our company and services based on their notes.`;
      } else if (initLead.source && initLead.source.startsWith('Booking: ')) {
        const eventTitle = initLead.source.replace('Booking: ', '');
        prompt += `This is a lead named ${initLead.name || 'Unknown'} (Email: ${initLead.email}). They just booked a service inquiry for: "${eventTitle}". Write a highly personalized 3-step follow-up sequence reminding them about our company and services in relation to this inquiry.`;
      } else {
        prompt += `This is a lead named ${initLead.name || 'Unknown'} (Email: ${initLead.email}). Write a highly personalized 3-step follow-up sequence to remind them about our company and introduce our services.`;
      }
      setAutoStartPrompt(prompt);
      
      campaignEngine.saveCampaign(newCamp);
      setCampaigns(campaignEngine.getCampaigns());
      setActiveCampaignId(newCamp.id);
      setTab('builder');
      
      if (onInitConsumed) onInitConsumed();
    }
  }, [initLead, brandInfo, onInitConsumed]);

  const handleCreateNew = () => {
    const newCamp: Campaign = {
      id: crypto.randomUUID(),
      name: 'New Outbound Campaign',
      status: 'Draft',
      recipientEmail: '',
      recipientName: '',
      createdAt: Date.now(),
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
      <div className="camp-module-wrap" style={{ padding: 0, flex: 1, overflow: 'hidden' }}>
        <CampaignList 
          campaigns={campaigns} 
          canEdit={canEdit}
          onCreateNew={handleCreateNew}
          onSelect={(id) => {
            setActiveCampaignId(id);
            setTab('builder');
          }}
          onDelete={(id) => {
            const campToDel = campaigns.find(c => c.id === id);
            if (campToDel) setDeleteModalCampaign(campToDel);
          }}
        />
        <ReplyPopupNotification onOpenConversation={() => setTab('conversations')} />
        
        {deleteModalCampaign && createPortal(
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999 }} onClick={() => setDeleteModalCampaign(null)}>
            <div style={{ background: '#ffffff', borderRadius: '16px', width: '90%', maxWidth: '440px', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#ef4444' }}>
                <AlertCircle size={24} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Delete Campaign?</h3>
              </div>
              <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.5, margin: '0 0 24px' }}>
                Are you sure you want to delete the campaign <strong>{deleteModalCampaign.name}</strong>? This action cannot be undone and any running sequences will be permanently stopped.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setDeleteModalCampaign(null)} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => {
                  if (changeStatus && contacts) {
                    const contact = contacts.find((c: any) => c.email === deleteModalCampaign.recipientEmail);
                    if (contact) {
                      changeStatus(contact.id, 'New');
                    }
                  }
                  campaignEngine.deleteCampaign(deleteModalCampaign.id);
                  setCampaigns(campaignEngine.getCampaigns());
                  setDeleteModalCampaign(null);
                }} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#ffffff', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  const activeCamp = campaigns.find(c => c.id === activeCampaignId) || campaigns[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc', overflow: 'hidden', fontFamily: "'Geist', 'Geist Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {tab !== 'builder' && (
        <>
          {/* Top Breadcrumb & User Bar */}
          <div style={{ height: '56px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
              <button
                onClick={() => {
                  setActiveCampaignId(null);
                }}
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
                  <span style={{ position: 'absolute', top: '-4px', right: '-6px', background: '#7d3bec', color: '#fff', fontSize: '0.68rem', fontWeight: 700, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '100px', padding: '4px 12px 4px 4px', cursor: 'pointer' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#7d3bec', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem' }}>
                  {user?.email?.[0]?.toUpperCase() || 'K'}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                  {user?.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}` : 'Sales Professional'}
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
                  <span style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '6px', 
                    background: activeCamp?.status === 'Running' ? '#dcfce7' : '#f1f5f9', 
                    color: activeCamp?.status === 'Running' ? '#15803d' : '#64748b', 
                    padding: '2px 10px', borderRadius: '100px', fontWeight: 700, fontSize: '0.75rem' 
                  }}>
                    <span style={{ 
                      width: 6, height: 6, borderRadius: '50%', 
                      background: activeCamp?.status === 'Running' ? '#16a34a' : '#94a3b8' 
                    }} /> 
                    {activeCamp?.status || 'Draft'}
                  </span>
                  <span>Created on May 24, 2025</span>
                  <span>•</span>
                  <span>Target: {((activeCamp?.recipientEmail || '').split(',').map(e => e.trim()).filter(Boolean)).length || 0} leads</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontWeight: 600, fontSize: '0.88rem', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                  <Save size={15} /> Save Draft
                </button>
              </div>
            </div>

            {/* Sub-Tabs Bar */}
            <div style={{ display: 'flex', gap: '32px', borderTop: 'none' }}>
              <button
                onClick={() => setTab('builder')}
                style={{ padding: '12px 0', background: 'none', border: 'none', borderBottom: (tab as string) === 'builder' ? '2px solid #7d3bec' : '2px solid transparent', color: (tab as string) === 'builder' ? '#7d3bec' : '#64748b', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer' }}
              >
                Builder
              </button>
              <button
                onClick={() => setTab('sent')}
                style={{ padding: '12px 0', background: 'none', border: 'none', borderBottom: tab === 'sent' ? '2px solid #7d3bec' : '2px solid transparent', color: tab === 'sent' ? '#7d3bec' : '#64748b', fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer' }}
              >
                Activity
              </button>
              <button
                onClick={() => setTab('conversations')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0', background: 'none', border: 'none', borderBottom: tab === 'conversations' ? '2px solid #7d3bec' : '2px solid transparent', color: tab === 'conversations' ? '#7d3bec' : '#64748b', fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer' }}
              >
                Inbox & Replies
                <span style={{ background: '#EAF2FF', color: '#7d3bec', padding: '2px 8px', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 700 }}>12</span>
              </button>
              <button
                onClick={() => setTab('analytics')}
                style={{ padding: '12px 0', background: 'none', border: 'none', borderBottom: tab === 'analytics' ? '2px solid #7d3bec' : '2px solid transparent', color: tab === 'analytics' ? '#7d3bec' : '#64748b', fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer' }}
              >
                Analytics
              </button>
              <button
                onClick={() => setTab('settings')}
                style={{ padding: '12px 0', background: 'none', border: 'none', borderBottom: tab === 'settings' ? '2px solid #7d3bec' : '2px solid transparent', color: tab === 'settings' ? '#7d3bec' : '#64748b', fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer' }}
              >
                Settings
              </button>
            </div>
          </div>
        </>
      )}

      {/* Scrollable Main Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: tab === 'builder' ? '0' : '32px' }}>
        {tab === 'builder' && <CampaignBuilder userEmail={user?.email || 'lead@example.com'} campaignId={activeCampaignId} onBack={() => {
          setActiveCampaignId(null);
        }} autoStartAIPrompt={autoStartPrompt} onCampaignStart={() => {
          if (changeStatus && activeCampaignId && contacts) {
            const camp = campaigns.find(c => c.id === activeCampaignId);
            if (camp) {
              const contact = contacts.find((c: any) => c.email === camp.recipientEmail);
              if (contact) {
                changeStatus(contact.id, 'Follow up');
              }
            }
          }
        }} />}
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
