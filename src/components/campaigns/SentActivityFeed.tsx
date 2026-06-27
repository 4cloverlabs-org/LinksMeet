import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, Eye, MousePointerClick, MessageSquare, ShieldCheck, Search, Filter, Paperclip, Clock } from 'lucide-react';
import { campaignEngine, type SentEmailLog } from './campaignEngine';

export const SentActivityFeed: React.FC = () => {
  const [logs, setLogs] = useState<SentEmailLog[]>(campaignEngine.getLogs());
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('All');

  useEffect(() => {
    const unsub = campaignEngine.subscribe((event) => {
      if (['email_sent', 'update', 'new_reply', 'tick'].includes(event)) {
        setLogs(campaignEngine.getLogs());
      }
    });
    return () => unsub();
  }, []);

  const filtered = logs.filter((log) => {
    const q = search.toLowerCase();
    const matchQ = log.recipient.toLowerCase().includes(q) || log.subject.toLowerCase().includes(q) || log.campaignName.toLowerCase().includes(q);
    const matchStage = filterStage === 'All' || log.stage.includes(filterStage);
    return matchQ && matchStage;
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '420px', background: '#fff', border: '1px solid var(--camp-border)', borderRadius: '10px', padding: '8px 14px' }}>
          <Search size={16} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search sent emails by recipient, subject or campaign..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} style={{ color: '#64748b' }} />
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="camp-btn camp-btn-ghost"
            style={{ padding: '8px 14px', background: '#fff' }}
          >
            <option value="All">All Stages</option>
            <option value="Initial Email">Initial Email</option>
            <option value="Follow-up">Follow-up</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="camp-block-card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <Mail size={32} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem' }}>No sent emails found</h3>
          <p style={{ color: 'var(--camp-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Start a campaign or try a different search filter to see live delivery logs.
          </p>
        </div>
      ) : (
        <div className="camp-feed-list">
          <AnimatePresence>
            {filtered.map((log) => (
              <motion.div
                key={log.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="camp-feed-card"
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1 }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--camp-accent-soft)', color: 'var(--camp-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                    {log.recipient.charAt(0).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--camp-text)', fontSize: '0.95rem' }}>{log.recipient}</span>
                      <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                        {log.stage}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--camp-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {log.sentAt}
                      </span>
                    </div>

                    <div style={{ fontWeight: 500, fontSize: '0.9rem', color: '#334155', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.subject}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--camp-text-muted)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span>Campaign: <strong style={{ color: '#475569' }}>{log.campaignName}</strong></span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Paperclip size={12} /> 0 attachments
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, background: '#f0fdf4', color: '#166534', padding: '6px 10px', borderRadius: '8px' }} title="Delivery Status">
                    <CheckCircle2 size={14} /> {log.deliveryStatus}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, background: log.opens > 0 ? '#e0e7ff' : '#f8fafc', color: log.opens > 0 ? '#3730a3' : '#64748b', padding: '6px 10px', borderRadius: '8px' }} title="Opens">
                    <Eye size={14} /> {log.opens} {log.opens === 1 ? 'Open' : 'Opens'}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, background: log.clicks > 0 ? '#f3e8ff' : '#f8fafc', color: log.clicks > 0 ? '#6b21a8' : '#64748b', padding: '6px 10px', borderRadius: '8px' }} title="Clicks">
                    <MousePointerClick size={14} /> {log.clicks}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, background: log.replied ? '#fef9c3' : '#f8fafc', color: log.replied ? '#854d0e' : '#64748b', padding: '6px 10px', borderRadius: '8px' }} title="Reply Status">
                    <MessageSquare size={14} /> {log.replied ? 'Replied!' : 'No reply'}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#059669', background: '#ecfdf5', padding: '6px 8px', borderRadius: '6px', fontWeight: 600 }} title="SPF/DKIM Auth">
                    <ShieldCheck size={14} /> SPF/DKIM ✓
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
