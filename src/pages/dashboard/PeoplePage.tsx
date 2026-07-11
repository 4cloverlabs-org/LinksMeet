import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  LayoutGrid, Users, Search, Bell, Plus, ArrowUpRight, ArrowDownRight,
  DollarSign, Trophy, UserPlus, MoreHorizontal, FileText,
  CheckCircle2, Menu, CalendarRange, CalendarCheck,
  Clock, Workflow, Spline, Store, CreditCard, Shield, HelpCircle,
  Sparkles, Link2, Video, Zap, BookOpen, MessageCircle, Keyboard, Check, X,
  Copy, Rocket, Calendar, Trash2, LogOut, Loader2, EyeOff, ExternalLink, Edit2, Code, Info, ArrowLeft, Globe, Settings, Mail, Phone, ChevronRight, ChevronLeft,
  Smartphone, Heart, AlertCircle, RefreshCw, Pencil, XCircle, ChevronDown
} from 'lucide-react';

const STATUS_COLORS: Record<string, { bg: string, color: string, border: string }> = {
  'New': { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  'Contacted': { bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
  'Follow up': { bg: '#f3e8ff', color: '#7e22ce', border: '#e9d5ff' },
  'Converted': { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
  'Lost': { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' }
};

function StatusDropdown({ status, onChange, disabled, options }: { status: string, onChange: (val: string) => void, disabled: boolean, options: string[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const clickOut = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', clickOut);
    return () => document.removeEventListener('mousedown', clickOut);
  }, []);

  const currentColors = STATUS_COLORS[status] || { bg: '#f9fafb', color: '#374151', border: '#e5e7eb' };

  const getStatusIcon = (st: string, col: string) => {
    switch(st) {
      case 'New': return <Plus size={12} color={col} />;
      case 'Contacted': return <Phone size={12} color={col} />;
      case 'Follow up': return <Clock size={12} color={col} />;
      case 'Converted': return <Trophy size={12} color={col} />;
      case 'Lost': return <XCircle size={12} color={col} />;
      default: return <Check size={12} color={col} />;
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative', width: 'max-content' }}>
      <button 
        disabled={disabled}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          backgroundColor: currentColors.bg, color: currentColors.color,
          border: 'none',
          padding: '8px 16px', borderRadius: '6px',
          fontSize: '0.82rem', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none', transition: 'all 0.2s',
          opacity: disabled ? 0.7 : 1
        }}
      >
        {getStatusIcon(status, currentColors.color)}
        <span style={{ letterSpacing: '0.01em' }}>{status}</span>
        <ChevronDown size={14} style={{ color: currentColors.color, opacity: 0.8, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: '2px' }} />
      </button>

      {open && !disabled && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0,
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          padding: '6px', zIndex: 50, minWidth: '140px',
          display: 'flex', flexDirection: 'column', gap: '2px'
        }}>
          {options.map(opt => {
            const colors = STATUS_COLORS[opt] || { bg: '#f9fafb', color: '#374151', border: '#e5e7eb' };
            return (
              <button
                key={opt}
                onClick={(e) => { e.stopPropagation(); onChange(opt); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 10px', borderRadius: '8px', border: 'none',
                  background: status === opt ? '#f9fafb' : 'transparent',
                  color: '#374151', fontSize: '0.8rem', fontWeight: 500,
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={e => e.currentTarget.style.background = status === opt ? '#f9fafb' : 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors.color }} />
                  {opt}
                </div>
                {status === opt && <Check size={14} color="#6366f1" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
import CampaignModule from '../../components/campaigns/CampaignModule';
import WorkflowEditor from '../../components/WorkflowEditor';
import EventTypeEditor from '../../components/EventTypeEditor';


export default function PeoplePage() {
  const [leadToDelete, setLeadToDelete] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;
  const ctx = useOutletContext<any>();
  const { 
    user, uid, userProfile, displayName, firstName, userInitials,
    toast, setToast, sideOpen, setSideOpen, search, setSearch,
    notif, setNotif, setView,
    // Context-provided variables that might be needed:
    contacts, eventTypes, bookings, myWorkflows, installedApps,
    handleCreateWorkflow, logoutAndGo, exportContactsCSV,
    showContactForm, setShowContactForm, cForm, setCForm, blankContact, contactErr, setContactErr, submitContact, savingContact,
    changeStatus, setEditingEvent, editingEvent, etTab, setEtTab, googleConnected, handleConnectGoogle,
    bookingTab, setBookingTab, joinMeeting, cancelBooking, leadsTab, setLeadsTab, peopleTab, setPeopleTab,
    appCat, setAppCat, appsTab, setAppsTab, handleConnectApp, handleManageApp,
    teamMembers, showInviteModal, setShowInviteModal, inviteEmail, setInviteEmail, inviteRole, setInviteRole, handleInviteSubmit, removeMember,
    editingWorkflow, setEditingWorkflow
  , filteredContacts, fileInputRef, handleUploadFile, contactsLoading, avColor, initials, CONTACT_STATUSES, setInitCampaignLead, removeContact, canEdit } = ctx || {};

  const leadsList = (filteredContacts || []).filter((c: any) => c.source !== 'uploaded');
  const paginatedLeads = leadsList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <>
      <div className="crm-fade">
                <div className="crm-seg" style={{ width: 'fit-content', marginBottom: 22 }}>
                  <button className={leadsTab === 'inbound' ? 'on' : ''} onClick={() => setLeadsTab('inbound')}>Inbound Enquiries</button>
                  <button className={leadsTab === 'uploaded' ? 'on' : ''} onClick={() => setLeadsTab('uploaded')}>
                    Uploaded Leads
                  </button>
                </div>
                
                <div className="crm-card">
                  <div className="crm-card-head">
                    <h3>{leadsTab === 'inbound' ? 'Inbound Leads' : 'Uploaded Leads'} <span style={{ color: '#9b9bab', fontWeight: 500 }}>({leadsTab === 'inbound' ? filteredContacts.filter(c => c.source !== 'uploaded').length : 0})</span></h3>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="crm-btn crm-btn-ghost" onClick={exportContactsCSV} disabled={contacts.length === 0}><FileText size={15} /> Export</button>
                      {leadsTab === 'inbound' && canEdit && (
                        <button className="crm-btn crm-btn-primary" onClick={() => { setCForm(blankContact); setContactErr(''); setShowContactForm(true); }}><Plus size={15} /> Add lead</button>
                      )}
                    </div>
                  </div>

                  {contactErr && <div style={{ background: '#fdecec', border: '1px solid #f6c9c9', color: '#b42318', fontSize: '0.82rem', padding: '10px 12px', borderRadius: 9, marginBottom: 12 }}>{contactErr}</div>}

                  {leadsTab === 'uploaded' ? (
                    <div className="crm-empty">
                      <span className="ic"><Rocket size={24} /></span>
                      <h3>Coming Soon</h3>
                      <p>Bulk CSV and Excel lead uploads are currently in development. Stay tuned!</p>
                    </div>
                  ) : contactsLoading ? (
                    <div style={{ padding: 50, textAlign: 'center', color: 'var(--muted)' }}><Loader2 size={22} className="crm-spin-ic" /></div>
                  ) : filteredContacts.filter(c => c.source !== 'uploaded').length === 0 ? (
                    <div className="crm-empty">
                      <span className="ic"><Users size={24} /></span>
                      <h3>{contacts.length === 0 ? `No inbound leads yet` : `No leads match “${search}”`}</h3>
                      <p>Connect your booking widget so every enquiry creates one automatically.</p>
                    </div>
                  ) : (
                    <>
                    <div className="crm-table">
                      <div className="crm-tr lead head" style={{ gridTemplateColumns: '1fr 1fr 1.5fr 1fr 240px' }}>
                        <span>Name</span>
                        <span className="crm-hide" style={{ textAlign: 'center' }}>Source</span>
                        <span style={{ textAlign: 'center' }}>Email</span>
                        <span style={{ textAlign: 'center' }}>Status</span>
                        <span />
                      </div>
                      {paginatedLeads.map((c: any, i: number) => (
                          <div className="crm-tr lead" key={c.id} style={{ gridTemplateColumns: '1fr 1fr 1.5fr 1fr 240px' }}>
                            <span className="crm-nm"><span className="crm-av" style={{ background: avColor(i) }}>{initials(c.name)}</span>{c.name}</span>
                            <span className="crm-hide" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              {c.source?.startsWith('Booking') ? (
                                <span style={{ 
                                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                                  background: '#eff6ff', color: '#2563eb', border: 'none',
                                  padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600
                                }}>
                                  <Link2 size={13} color="#2563eb" />
                                  Booking
                                </span>
                              ) : (
                                <span style={{ 
                                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                                  background: '#f1f5f9', color: '#475569', border: 'none',
                                  padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600
                                }}>
                                  <Globe size={13} color="#475569" />
                                  {c.source || 'Booking'}
                                </span>
                              )}
                            </span>
                            <span className="crm-muted" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>{c.email}</span>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <StatusDropdown
                                status={c.status}
                                onChange={(val) => changeStatus(c.id, val as any)}
                                disabled={!canEdit}
                                options={CONTACT_STATUSES as string[]}
                              />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', paddingRight: '12px' }}>
                              {canEdit && (
                                <button 
                                  className="crm-ai-btn"
                                  title="Start AI Campaign" 
                                  onClick={() => {
                                    setInitCampaignLead(c);
                                    setView('campaigns');
                                  }}
                                >
                                  <Sparkles size={14} color="#fff" />
                                  AI Campaign
                                </button>
                              )}
                              {canEdit && <button className="crm-row-act" title="Delete lead" onClick={() => setLeadToDelete(c)}><Trash2 size={16} /></button>}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Pagination */}
                      {leadsList.length > ITEMS_PER_PAGE && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '0 8px', flexShrink: 0 }}>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                            Showing {leadsList.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to {Math.min(currentPage * ITEMS_PER_PAGE, leadsList.length)} of {leadsList.length} leads
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
                                background: '#2563eb', 
                                color: '#fff', 
                                border: 'none', 
                                borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default', fontWeight: 600, fontSize: '0.85rem' 
                              }}
                            >
                              {currentPage}
                            </button>
                            <button 
                              onClick={() => setCurrentPage(p => Math.min(Math.ceil(leadsList.length / ITEMS_PER_PAGE) || 1, p + 1))}
                              disabled={currentPage === (Math.ceil(leadsList.length / ITEMS_PER_PAGE) || 1)}
                              style={{ opacity: currentPage === (Math.ceil(leadsList.length / ITEMS_PER_PAGE) || 1) ? 0.5 : 1, cursor: currentPage === (Math.ceil(leadsList.length / ITEMS_PER_PAGE) || 1) ? 'not-allowed' : 'pointer', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  </div>
              </div>

      {leadToDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', width: '400px', maxWidth: '90vw', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#dc2626' }}>
              <div style={{ background: '#fef2f2', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', flexShrink: 0 }}>
                <AlertCircle size={24} color="#dc2626" />
              </div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>Delete Lead</h2>
            </div>
            <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Are you sure you want to delete <strong>{leadToDelete.name || 'this lead'}</strong>? This action cannot be undone and will permanently remove them from your CRM.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setLeadToDelete(null)}
                style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  removeContact(leadToDelete.id, leadToDelete.name);
                  setLeadToDelete(null);
                }}
                style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)' }}
              >
                Delete Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
