import React, { useState, useEffect } from 'react';
import { MessageSquare, Sparkles, Send, Paperclip, Globe } from 'lucide-react';
import { campaignEngine, type ConversationThread } from './campaignEngine';

export const ConversationThreadView: React.FC = () => {
  const [threads, setThreads] = useState<ConversationThread[]>(campaignEngine.getThreads());
  const [activeId, setActiveId] = useState<string>(threads[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [isAiWorking, setIsAiWorking] = useState(false);

  useEffect(() => {
    const unsub = campaignEngine.subscribe((event) => {
      if (['new_reply', 'update'].includes(event)) {
        const list = campaignEngine.getThreads();
        setThreads(list);
        if (!activeId && list.length > 0) setActiveId(list[0].id);
      }
    });
    return () => unsub();
  }, [activeId]);

  const activeThread = threads.find(t => t.id === activeId) || threads[0];

  const handleSendReply = () => {
    if (!replyText.trim() || !activeThread) return;
    campaignEngine.sendReplyMessage(activeThread.id, `<p>${replyText.replace(/\n/g, '<br>')}</p>`);
    setReplyText('');
  };

  const handleAiAction = async (action: string) => {
    if (!activeThread) return;
    setIsAiWorking(true);
    const newText = await campaignEngine.generateAIReply(action, activeThread, replyText);
    setReplyText(newText);
    setIsAiWorking(false);
  };

  const simulateIncoming = () => {
    campaignEngine.simulateIncomingReply(
      'alex.rivas@cloudscale.io',
      'alex.rivas@cloudscale.io',
      '<p>Hello Sales Professional,</p><p>We received your note regarding autonomous outbound sequence workflows. 🚀 We are actively scaling our sales operations and could benefit from AI automation. 💼</p><p>What does your onboarding schedule and enterprise infrastructure setup look like?</p><p>Best,<br>Sales Professional</p>',
      'SaaS Founders Outbound Q3'
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Inbox & Conversations</h3>
          <p style={{ margin: '4px 0 0', color: 'var(--camp-text-muted)', fontSize: '0.88rem' }}>
            Live thread view with automated campaign pausing and AI-powered reply rewriting.
          </p>
        </div>
        <button onClick={simulateIncoming} className="camp-btn camp-btn-ghost" style={{ fontSize: '0.82rem', borderColor: '#60A5FA', color: '#0E61F3' }}>
          💬 Simulate Incoming Lead Reply
        </button>
      </div>

      {!activeThread ? (
        <div className="camp-block-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <MessageSquare size={36} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 6px' }}>No conversations yet</h3>
          <p style={{ color: 'var(--camp-text-muted)', fontSize: '0.9rem' }}>
            When leads reply to your campaign emails, their thread will appear here automatically. Click the simulate button above to test!
          </p>
        </div>
      ) : (
        <div className="camp-thread-layout">
          {/* Thread List Sidebar */}
          <div className="camp-thread-sidebar">
            <div style={{ padding: '14px 16px', fontWeight: 700, fontSize: '0.88rem', borderBottom: '1px solid var(--camp-border)', background: '#f1f5f9', color: '#475569' }}>
              Active Threads ({threads.length})
            </div>
            {threads.map(t => (
              <div
                key={t.id}
                onClick={() => { setActiveId(t.id); t.unread = false; }}
                className={`camp-thread-item ${t.id === activeThread.id ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--camp-text)' }}>{t.leadName}</span>
                  {t.unread && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0E61F3' }} />}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>
                  {t.subject}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--camp-text-muted)' }}>
                  Campaign: {t.campaignName}
                </div>
              </div>
            ))}
          </div>

          {/* Main Thread View */}
          <div className="camp-thread-main">
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--camp-border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{activeThread.subject}</h4>
                <div style={{ fontSize: '0.82rem', color: 'var(--camp-text-muted)', marginTop: '4px' }}>
                  With <strong style={{ color: '#334155' }}>{activeThread.leadName}</strong> ({activeThread.leadEmail}) · <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#475569', fontWeight: 600 }}>{activeThread.campaignName}</span>
                </div>
              </div>
              <div style={{ background: '#fef9c3', color: '#854d0e', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                Campaign Paused on Reply ✓
              </div>
            </div>

            {/* AI Summary Banner */}
            <div style={{ background: '#f8fafc', padding: '12px 20px', borderBottom: '1px solid #e0e7ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={16} style={{ color: '#0E61F3', flexShrink: 0 }} />
              <div style={{ fontSize: '0.82rem', color: '#3730a3', lineHeight: 1.4 }}>
                <strong>AI Conversation Summary:</strong> {activeThread.summary}
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column' }}>
              {activeThread.messages.map((m) => (
                <div
                  key={m.id}
                  className={`camp-msg-bubble ${m.isLead ? 'camp-msg-lead' : 'camp-msg-you'}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.78rem', opacity: 0.85 }}>
                    <span style={{ fontWeight: 700 }}>{m.senderName} ({m.sender})</span>
                    <span>{m.timestamp}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: m.content }} />
                  {m.isLead && (
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', gap: '12px', fontSize: '0.75rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Paperclip size={12} /> 0 Attachments</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* AI Reply Assistant Box */}
            <div style={{ padding: '16px 20px', background: '#f8fafc', borderTop: '1px solid var(--camp-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0E61F3', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '6px' }}>
                  <Sparkles size={14} /> AI Reply Assistant:
                </span>
                <button disabled={isAiWorking} onClick={() => handleAiAction('suggest')} className="camp-rte-btn" style={{ background: '#EAF2FF', color: '#0E61F3', fontWeight: 600 }}>
                  ✨ Suggest Reply
                </button>
                <button disabled={isAiWorking} onClick={() => handleAiAction('professional')} className="camp-rte-btn">
                  Professional
                </button>
                <button disabled={isAiWorking} onClick={() => handleAiAction('friendly')} className="camp-rte-btn">
                  Friendly
                </button>
                <button disabled={isAiWorking} onClick={() => handleAiAction('shorter')} className="camp-rte-btn">
                  Shorter
                </button>
                <button disabled={isAiWorking} onClick={() => handleAiAction('longer')} className="camp-rte-btn">
                  Longer
                </button>
                <button disabled={isAiWorking} onClick={() => handleAiAction('translate')} className="camp-rte-btn" title="Translate Spanish">
                  <Globe size={12} style={{ display: 'inline', marginRight: '3px' }} /> Translate
                </button>
                {isAiWorking && <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Thinking...</span>}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply or click 'Suggest Reply' above..."
                  className="camp-textarea"
                  style={{ minHeight: '80px', background: '#fff' }}
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="camp-btn camp-btn-primary"
                  style={{ padding: '0 24px', alignSelf: 'stretch', display: 'flex', flexDirection: 'column', gap: '6px' }}
                >
                  <Send size={16} />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
