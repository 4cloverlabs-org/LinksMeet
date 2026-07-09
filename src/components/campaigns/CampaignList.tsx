import React, { useState } from 'react';
import { Plus, PlayCircle, Send, CheckCircle2, Clock, CornerUpLeft, GripVertical, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { campaignEngine, type Campaign } from './campaignEngine';

interface CampaignListProps {
  campaigns: Campaign[];
  canEdit?: boolean;
  onCreateNew: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

type FilterType = 'All' | 'Active' | 'Paused' | 'Completed' | 'Drafts';

export const CampaignList: React.FC<CampaignListProps> = ({ campaigns, canEdit = true, onCreateNew, onSelect, onDelete }) => {
  const [filter, setFilter] = useState<FilterType>('All');
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 7;

  // KPI Calculations
  const totalSequences = campaigns.length;
  const activeSequences = campaigns.filter(c => c.status === 'Running').length;
  
  // Calculate total emails sent and replies based on logs
  const allLogs = campaignEngine.getLogs();
  let totalSent = 0;
  let totalReplies = 0;
  
  campaigns.forEach(c => {
    const campLogs = allLogs.filter(l => l.campaignId === c.id);
    totalSent += campLogs.length;
    totalReplies += campLogs.filter(l => l.replied).length;
  });
  
  const displayTotalSent = totalSent;
  const displayReplyRate = totalSent > 0 ? ((totalReplies / totalSent) * 100).toFixed(1) : '0.0';

  const earliestCampaign = campaigns.reduce((earliest, c) => Math.min(earliest, c.createdAt), Date.now());
  const periodText = campaigns.length > 0 ? `Since ${new Date(earliestCampaign).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'No data yet';

  const filterOptions: { label: FilterType; key: string }[] = [
    { label: 'All', key: 'All Sequences' },
    { label: 'Active', key: 'Active' },
    { label: 'Paused', key: 'Paused' },
    { label: 'Completed', key: 'Completed' },
    { label: 'Drafts', key: 'Drafts' },
  ];

  const filteredCampaigns = campaigns.filter(camp => {
    if (filter === 'All') return true;
    if (filter === 'Active' && camp.status === 'Running') return true;
    if (filter === 'Paused' && camp.status === 'Paused') return true;
    if (filter === 'Completed' && camp.status === 'Completed') return true;
    if (filter === 'Drafts' && camp.status === 'Draft') return true;
    return false;
  });

  return (
    <div style={{ width: '100%', fontFamily: "'Geist', 'Geist Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      
      {/* Top Banner (Header and Tabs) */}
      <div style={{ background: '#fff', padding: '16px 40px 0 40px', borderBottom: '1px solid #e2e8f0' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>Follow-up Mails</h1>
            <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.95rem' }}>
              Automatically send follow-up emails to stay connected and increase response rates.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={{ background: 'none', border: 'none', color: '#7d3bec', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <PlayCircle size={16} /> How it works
            </button>
            {canEdit && (<button
              onClick={onCreateNew}
              style={{
                background: '#7d3bec',
                color: '#fff',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} /> Create Follow-up Sequence
            </button>)}
          </div>
        </div>

        {/* Row 2: Tabs and Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '24px' }}>
            {filterOptions.map(opt => {
              const isActive = filter === opt.label;
              return (
                <button
                  key={opt.label}
                  onClick={() => {
                  setFilter(opt.label);
                  setCurrentPage(1);
                }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0 0 16px 0',
                    fontSize: '0.92rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#7d3bec' : '#64748b',
                    borderBottom: isActive ? '2px solid #7d3bec' : '2px solid transparent',
                    cursor: 'pointer',
                    marginBottom: '-1px'
                  }}
                >
                  {opt.key}
                </button>
              );
            })}
          </div>

          {/* Small KPI Stats */}
          <div style={{ display: 'flex', gap: '24px', paddingBottom: '16px', alignItems: 'center' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={14} color="#7d3bec" />
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{totalSequences}</span> Sequences
              </div>
            </div>

            <div style={{ width: '1px', height: '16px', background: '#e2e8f0' }}></div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={14} color="#22C55E" />
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{activeSequences}</span> Active
              </div>
            </div>

            <div style={{ width: '1px', height: '16px', background: '#e2e8f0' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={14} color="#EAB308" />
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{displayTotalSent}</span> Sent <span style={{ fontSize: '0.75rem', opacity: 0.8, marginLeft: '4px' }}>({periodText})</span>
              </div>
            </div>

            <div style={{ width: '1px', height: '16px', background: '#e2e8f0' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CornerUpLeft size={14} color="#7d3bec" />
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{displayReplyRate}%</span> Replies <span style={{ fontSize: '0.75rem', opacity: 0.8, marginLeft: '4px' }}>({periodText})</span>
              </div>
            </div>

          </div>

          </div>
        </div>
      {/* Main Content Area */}
      <div style={{ padding: '20px 40px' }}>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', borderTopLeftRadius: '12px', padding: '12px 24px', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', width: '30%' }}>SEQUENCE NAME</th>
              <th style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '12px 24px', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CREATED</th>
              <th style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '12px 24px', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>STATUS</th>
              <th style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '12px 24px', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>STEPS</th>
              <th style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '12px 24px', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SENT</th>
              <th style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '12px 24px', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>REPLY RATE</th>
              <th style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', borderTopRightRadius: '12px', padding: '12px 24px', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredCampaigns.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                  No sequences found in this category.
                </td>
              </tr>
            ) : (
              filteredCampaigns.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((camp) => {
                
                // Determine styling for pills based on status
                let pillBg = '#f1f5f9';
                let pillColor = '#475569';
                let displayStatus: string = camp.status;
                
                if (camp.status === 'Running') {
                  pillBg = '#dcfce7';
                  pillColor = '#15803d';
                  displayStatus = 'Active';
                } else if (camp.status === 'Paused') {
                  pillBg = '#EFF6FF';
                  pillColor = '#1d4ed8';
                  displayStatus = 'Paused';
                } else if (camp.status === 'Completed') {
                  pillBg = '#f1f5f9';
                  pillColor = '#475569';
                } else if (camp.status === 'Draft') {
                  pillBg = '#f1f5f9';
                  pillColor = '#475569';
                }

                // Calculate values from actual log data
                const campLogs = allLogs.filter(l => l.campaignId === camp.id);
                let rowSentCount = campLogs.length;
                let rowReplyCount = campLogs.filter(l => l.replied).length;
                
                // If it's a Draft or we have no data, set 0
                if (camp.status === 'Draft') {
                  rowSentCount = 0;
                  rowReplyCount = 0;
                }
                
                const rowReplyRate = rowSentCount > 0 ? ((rowReplyCount / rowSentCount) * 100).toFixed(1) : '0.0';

                // Format creation date and time
                const createdDate = new Date(camp.createdAt);
                const formattedDate = createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const formattedTime = createdDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

                return (
                  <tr 
                    key={camp.id} 
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => onSelect(camp.id)}
                  >
                    <td style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <GripVertical size={16} color="#cbd5e1" style={{ cursor: 'grab' }} />
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{camp.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>For {camp.recipientEmail || 'outreach'}</div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 24px' }}>
                      <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '0.85rem' }}>{formattedDate}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{formattedTime}</div>
                    </td>
                    <td style={{ padding: '12px 24px' }}>
                      <span style={{ 
                        background: pillBg, 
                        color: pillColor, 
                        padding: '4px 10px', 
                        borderRadius: '24px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600 
                      }}>
                        {displayStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px 24px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {camp.steps.map((_s, i) => (
                          <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7d3bec' }} />
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '12px 24px', fontSize: '0.9rem', color: '#0f172a', fontWeight: 500 }}>
                      {camp.status === 'Draft' ? '0' : rowSentCount}
                    </td>
                    <td style={{ padding: '12px 24px' }}>
                      <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600, marginBottom: '6px' }}>
                        {camp.status === 'Draft' ? '-' : `${rowReplyRate}%`}
                      </div>
                      {camp.status !== 'Draft' && (
                        <div style={{ width: '100%', height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${rowReplyRate}%`, height: '100%', background: '#7d3bec', borderRadius: '2px' }} />
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 24px', textAlign: 'center', position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDelete(camp.id); }}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          title="Delete Sequence"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '0 8px', flexShrink: 0 }}>
        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
          Showing {filteredCampaigns.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredCampaigns.length)} of {filteredCampaigns.length} sequences
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            style={{ 
              background: '#7d3bec', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default', fontWeight: 600, fontSize: '0.85rem' 
            }}
          >
            {currentPage}
          </button>
          <button 
            onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE) || 1, p + 1))}
            disabled={currentPage === (Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE) || 1)}
            style={{ opacity: currentPage === (Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE) || 1) ? 0.5 : 1, cursor: currentPage === (Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE) || 1) ? 'not-allowed' : 'pointer', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};
