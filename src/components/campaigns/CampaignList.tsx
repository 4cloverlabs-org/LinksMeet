import React, { useState } from 'react';
import { Plus, ChevronRight, Clock, Target, Trash2 } from 'lucide-react';
import { type Campaign } from './campaignEngine';

interface CampaignListProps {
  campaigns: Campaign[];
  onCreateNew: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

type FilterType = 'All' | 'Active' | 'Paused' | 'Cancelled' | 'Draft';

export const CampaignList: React.FC<CampaignListProps> = ({ campaigns, onCreateNew, onSelect, onDelete }) => {
  const [filter, setFilter] = useState<FilterType>('All');

  const filteredCampaigns = campaigns.filter(camp => {
    if (filter === 'All') return true;
    if (filter === 'Active' && camp.status === 'Running') return true;
    if (filter === 'Paused' && camp.status === 'Paused') return true;
    if (filter === 'Cancelled' && camp.status === 'Completed') return true;
    if (filter === 'Draft' && camp.status === 'Draft') return true;
    return false;
  });

  const filterOptions: FilterType[] = ['All', 'Active', 'Paused', 'Cancelled', 'Draft'];

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>All Campaigns</h3>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Manage and monitor your autonomous outbound sequences.</p>
        </div>
        <button
          onClick={onCreateNew}
          className="camp-btn"
          style={{ background: '#0E61F3', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} /> New Campaign
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {filterOptions.map(opt => (
          <button
            key={opt}
            onClick={() => setFilter(opt)}
            style={{
              padding: '6px 14px',
              borderRadius: '100px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              transition: 'all 0.2s',
              background: filter === opt ? '#eef2ff' : '#fff',
              color: filter === opt ? '#0E61F3' : '#64748b',
              borderColor: filter === opt ? '#C9DBFF' : '#e2e8f0',
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Campaign Name</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Lead</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Steps</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCampaigns.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                  No campaigns found in this category.
                </td>
              </tr>
            ) : (
              filteredCampaigns.map((camp) => (
                <tr 
                  key={camp.id} 
                  style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  onClick={() => onSelect(camp.id)}
                >
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{camp.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> Created {new Date(camp.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>
                      <Target size={14} style={{ color: '#0E61F3' }} /> {camp.recipientEmail}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`camp-status-badge ${camp.status === 'Running' ? 'sent' : camp.status === 'Paused' ? 'replied' : camp.status === 'Completed' ? 'failed' : 'pending'}`} style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem' }}>
                        {camp.status === 'Running' && <span className="camp-pulse-dot" style={{ width: 6, height: 6 }} />}
                        {camp.status === 'Running' ? 'Active' : camp.status === 'Completed' ? 'Cancelled' : camp.status}
                      </span>
                      
                      {camp.status === 'Running' && camp.activeStepIndex !== undefined && camp.steps[camp.activeStepIndex]?.type === 'delay' && camp.steps[camp.activeStepIndex]?.status === 'Queued' && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', background: '#fef3c7', padding: '4px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={10} />
                          {Math.floor((camp.steps[camp.activeStepIndex].remainingSeconds || 0) / 3600)}h {Math.floor(((camp.steps[camp.activeStepIndex].remainingSeconds || 0) % 3600) / 60)}m {(camp.steps[camp.activeStepIndex].remainingSeconds || 0) % 60}s
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>
                    {camp.steps.length} Steps
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(camp.id);
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                        title="Delete Campaign"
                      >
                        <Trash2 size={18} />
                      </button>
                      <ChevronRight size={18} style={{ color: '#cbd5e1' }} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
