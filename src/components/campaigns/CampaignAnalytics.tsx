import React, { useState, useEffect } from 'react';
import { TrendingUp, Mail, MousePointerClick, MessageSquare, AlertTriangle, Clock, Target, Globe, Smartphone, Monitor } from 'lucide-react';
import { campaignEngine } from './campaignEngine';

export const CampaignAnalytics: React.FC = () => {
  const [logs, setLogs] = useState(campaignEngine.getLogs());

  useEffect(() => {
    const unsub = campaignEngine.subscribe((event) => {
      if (['update', 'tick', 'campaign_completed', 'email_sent', 'new_reply'].includes(event)) {
        setLogs(campaignEngine.getLogs());
      }
    });
    return () => unsub();
  }, []);

  const emailsSent = logs.filter(l => ['Sent', 'Opened', 'Clicked', 'Replied'].includes(l.status)).length;
  const emailsOpened = logs.filter(l => ['Opened', 'Clicked', 'Replied'].includes(l.status)).length;
  const emailsReplied = logs.filter(l => l.replied || l.status === 'Replied').length;

  const openRate = emailsSent > 0 ? ((emailsOpened / emailsSent) * 100).toFixed(1) + '%' : '0%';
  const replyRate = emailsSent > 0 ? ((emailsReplied / emailsSent) * 100).toFixed(1) + '%' : '0%';

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Campaign Performance & Analytics</h3>
        <p style={{ margin: '4px 0 0', color: 'var(--camp-text-muted)', fontSize: '0.88rem' }}>
          Real-time aggregated metrics across all outbound email sequences.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="camp-analytics-grid">
        <div className="camp-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--camp-text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>Open Rate</span>
            <Mail size={16} style={{ color: '#0E61F3' }} />
          </div>
          <div className="camp-stat-val">{openRate}</div>
          <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={13} /> +14.2% vs industry average
          </div>
        </div>

        <div className="camp-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--camp-text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>Reply Rate</span>
            <MessageSquare size={16} style={{ color: '#8b5cf6' }} />
          </div>
          <div className="camp-stat-val">{replyRate}</div>
          <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={13} /> +6.5% this week
          </div>
        </div>

        <div className="camp-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--camp-text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>Click-Through (CTR)</span>
            <MousePointerClick size={16} style={{ color: '#ec4899' }} />
          </div>
          <div className="camp-stat-val">24.1%</div>
          <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>
            High intent clicks on case study
          </div>
        </div>

        <div className="camp-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--camp-text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>Positive Replies</span>
            <Target size={16} style={{ color: '#10b981' }} />
          </div>
          <div className="camp-stat-val">82%</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            18% negative / not interested
          </div>
        </div>

        <div className="camp-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--camp-text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>Bounce Rate</span>
            <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
          </div>
          <div className="camp-stat-val">0.4%</div>
          <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>
            Pristine mailbox reputation ✓
          </div>
        </div>

        <div className="camp-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--camp-text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>Avg Response Time</span>
            <Clock size={16} style={{ color: '#06b6d4' }} />
          </div>
          <div className="camp-stat-val">3h 14m</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Fast lead qualification
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Hourly Opens Bar Chart */}
        <div className="camp-stat-card">
          <h4 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Hourly Opens Heatmap</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>EST Timezone</span>
          </h4>
          <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingTop: '20px' }}>
            {[
              { h: '8am', v: 12 }, { h: '9am', v: 38 }, { h: '10am', v: 84 }, { h: '11am', v: 65 },
              { h: '12pm', v: 45 }, { h: '1pm', v: 52 }, { h: '2pm', v: 92 }, { h: '3pm', v: 76 },
              { h: '4pm', v: 48 }, { h: '5pm', v: 24 },
            ].map((d) => {
              const height = (d.v / 100) * 140;
              return (
                <div key={d.h} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '100%', background: d.v > 75 ? '#0E61F3' : '#C9DBFF', height: `${height}px`, borderRadius: '6px 6px 0 0', transition: 'all 0.3s ease' }} title={`${d.v}% opens at ${d.h}`} />
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{d.h}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Campaign Comparison Chart */}
        <div className="camp-stat-card">
          <h4 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>Campaign Conversion Comparison</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
            {[
              { name: 'SaaS Founders Outbound Q3', open: 64, reply: 22, color: '#0E61F3' },
              { name: 'Healthcare Agency Outreach', open: 52, reply: 18, color: '#8b5cf6' },
              { name: 'Fintech Series A Intro', open: 48, reply: 14, color: '#ec4899' },
            ].map(c => (
              <div key={c.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  <span>{c.name}</span>
                  <span>{c.open}% Open · <strong style={{ color: c.color }}>{c.reply}% Reply</strong></span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${c.open}%`, background: '#cbd5e1', height: '100%' }} />
                  <div style={{ width: `${c.reply}%`, background: c.color, height: '100%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Device & Geography Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="camp-stat-card">
          <h4 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Monitor size={16} style={{ color: '#0E61F3' }} /> Opens by Device
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Monitor size={14} /> Desktop (Superhuman / Outlook)</span>
              <strong style={{ fontWeight: 700 }}>68%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Smartphone size={14} /> Mobile iOS / Android</span>
              <strong style={{ fontWeight: 700 }}>32%</strong>
            </div>
          </div>
        </div>

        <div className="camp-stat-card">
          <h4 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={16} style={{ color: '#10b981' }} /> Top Geographies
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>🇺🇸 United States</span><strong>62%</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>🇬🇧 United Kingdom</span><strong>18%</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>🇨🇦 Canada</span><strong>12%</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>🇦🇺 Australia</span><strong>8%</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};
