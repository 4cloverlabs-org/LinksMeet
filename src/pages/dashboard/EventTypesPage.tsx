import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import {
  LayoutGrid, Users, Search, Bell, Plus, ArrowUpRight, ArrowDownRight,
  DollarSign, Trophy, UserPlus, MoreHorizontal, FileText,
  CheckCircle2, Menu, CalendarRange, CalendarCheck,
  Clock, Workflow, Spline, Store, CreditCard, Shield, HelpCircle,
  Sparkles, Link2, Video, Zap, BookOpen, MessageCircle, Keyboard, Check, X,
  Copy, Rocket, Calendar, Trash2, LogOut, Loader2, EyeOff, ExternalLink, Edit2, Code, Info, ArrowLeft, Globe, Settings, Mail, Phone, ChevronRight,
  Smartphone, Heart, AlertCircle, RefreshCw, Pencil, XCircle
} from 'lucide-react';
import CampaignModule from '../../components/campaigns/CampaignModule';
import WorkflowEditor from '../../components/WorkflowEditor';
import EventTypeEditor from '../../components/EventTypeEditor';


export default function EventTypesPage() {
  const ctx = useOutletContext<any>();
  const [deleteModalEvent, setDeleteModalEvent] = useState<any>(null);
  const [embedModalEvent, setEmbedModalEvent] = useState<any>(null);
  const [copiedType, setCopiedType] = useState<'inline' | 'floating' | null>(null);
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
  , setAvailIsDefault, availIsDefault, saveAvailability, availSchedule, setAvailSchedule, tzOpen, tzSearch, TIMEZONES, availPrefs, setTzOpen, setTzSearch, setAvailPrefs , toggleEventType, etDropdown, setEtDropdown, addEventType, deleteEventType, canEdit } = ctx || {};

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!(e.target as Element).closest('.et-more-options-wrapper')) {
        setEtDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setEtDropdown]);

  return (
    <>
      <div className="crm-fade">
        <div className="crm-card-head">
          <div>
            <h2 className="ttl">Event Types</h2>
            <p className="sub">Create scheduling links people can book.</p>
          </div>
          {canEdit && (
            <button className="crm-btn crm-btn-primary" onClick={() => setEditingEvent('new')}>
              <Plus size={15} /> New Event Type
            </button>
          )}
        </div>
        <div className="crm-card">
                <div style={{
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {eventTypes.map((e, index) => (
                    <div key={e.slug} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      borderBottom: index < eventTypes.length - 1 ? '1px solid #e2e8f0' : 'none',
                    }}>
                      {/* Left */}
                      <div 
                        style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, cursor: 'pointer' }}
                        onClick={() => setEditingEvent(e)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ 
                            fontFamily: 'Geist, "Geist Sans", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            fontStyle: 'normal',
                            fontWeight: 600,
                            color: 'rgb(15, 23, 42)',
                            fontSize: '15px',
                            lineHeight: '26px'
                          }}>{e.title}</span>
                          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/{uid}/{e.slug}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            display: 'flex', alignItems: 'center', gap: '4px',
                            fontSize: '0.75rem', color: '#475569',
                            background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px'
                          }}>
                            <Clock size={12} /> {e.dur}
                          </span>
                          {!e.active && (
                            <span style={{
                              display: 'flex', alignItems: 'center', gap: '4px',
                              fontSize: '0.75rem', color: '#b45309',
                              background: '#fef3c7', padding: '2px 6px', borderRadius: '4px',
                              fontWeight: 600
                            }}>
                              <EyeOff size={12} /> Hidden
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Right */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button 
                          className={`crm-switch${e.active ? ' on' : ''}`} 
                          aria-label="Active" 
                          onClick={() => toggleEventType(e.id, !e.active)}
                          style={{ transform: 'scale(0.85)', transformOrigin: 'center' }}
                        />
                        <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 4px' }} />
                        <button 
                          className="et-icon-btn"
                          onClick={() => window.open(`/book/${uid}/${e.slug}`, '_blank')}
                          title="Preview"
                        >
                          <ExternalLink size={16} />
                        </button>
                        <button 
                          className="et-icon-btn"
                          onClick={() => {
                            navigator.clipboard?.writeText(`${window.location.origin}/book/${uid}/${e.slug}`);
                            setToast('Link copied');
                            window.setTimeout(() => setToast(null), 1800);
                          }}
                          title="Copy Link"
                        >
                          <Link2 size={16} />
                        </button>
                        
                        {/* Dropdown Wrapper */}
                        <div style={{ position: 'relative' }} className="et-more-options-wrapper">
                          <button 
                            className="et-icon-btn"
                            onClick={() => setEtDropdown(etDropdown === e.id ? null : e.id)}
                            title="More Options"
                          >
                            <MoreHorizontal size={16} />
                          </button>

                          {etDropdown === e.id && (
                            <>
                              <div style={{
                                position: 'absolute', right: 0, top: '40px',
                                background: '#fff', border: '1px solid #e2e8f0',
                                borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                minWidth: '160px', zIndex: 50, padding: '4px'
                              }}>
                                <button className="et-dd-btn" onClick={() => { 
                                  setEtDropdown(null); 
                                  setEditingEvent(e);
                                }} disabled={!canEdit}>
                                  <Edit2 size={14} /> Edit
                                </button>
                                <button className="et-dd-btn" disabled={!canEdit} onClick={async () => { 
                                  setEtDropdown(null); 
                                  try {
                                    const { id, createdAt, ...rest } = e as any;
                                    await addEventType(uid, { ...rest, slug: e.slug + '-copy', title: e.title + ' (Copy)' });
                                    setToast('Event type duplicated');
                                  } catch (err: any) {
                                    setToast('Failed to duplicate');
                                  }
                                }}>
                                  <Copy size={14} /> Duplicate
                                </button>
                                <button className="et-dd-btn" onClick={() => { 
                                  setEtDropdown(null); 
                                  setCopiedType(null);
                                  setEmbedModalEvent(e);
                                }}>
                                  <Code size={14} /> Embed
                                </button>
                                <button className="et-dd-btn" onClick={() => { setEtDropdown(null); setToast('Troubleshooting'); }}>
                                  <CalendarCheck size={14} /> Troubleshoot
                                </button>
                                <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
                                <button className="et-dd-btn" style={{ color: '#ef4444' }} disabled={!canEdit} onClick={async () => {
                                  setEtDropdown(null);
                                  setDeleteModalEvent(e);
                                  /*
                                    try {
                                      await deleteEventType(uid, e.id);
                                      setToast('Event type deleted');
                                    } catch(err) {
                                      setToast('Failed to delete');
                                    }
                                  }
                                  */
                                }}>
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
        </div>

      {deleteModalEvent && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999 }} onClick={() => setDeleteModalEvent(null)}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '90%', maxWidth: '440px', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#ef4444' }}>
              <AlertCircle size={24} />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Delete Event Type?</h3>
            </div>
            <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.5, margin: '0 0 24px' }}>
              Are you sure you want to delete the <strong>{deleteModalEvent.title}</strong> event type? This action cannot be undone and any existing bookings for this type might lose their context.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setDeleteModalEvent(null)} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>Cancel</button>
              <button onClick={async () => {
                try {
                  await deleteEventType(uid, deleteModalEvent.id);
                  setToast('Event type deleted');
                } catch (err) {
                  setToast('Failed to delete');
                }
                setDeleteModalEvent(null);
              }} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#ffffff', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {embedModalEvent && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999, animation: 'fadeIn 0.2s ease' }} onClick={() => setEmbedModalEvent(null)}>
          <div style={{ background: '#ffffff', borderRadius: '24px', width: '90%', maxWidth: '520px', padding: '32px', boxShadow: '0 24px 48px -12px rgba(0,0,0,0.18)' }} onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Code size={24} color="#7d3bec" />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Embed Event Type</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
                    Choose how you want to embed <strong>{embedModalEvent.title}</strong> on your website.
                  </p>
                </div>
              </div>
              <button onClick={() => setEmbedModalEvent(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'} onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}><X size={16} /></button>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Option 1 */}
              <button 
                onClick={() => {
                  const code = `<!-- LinksMeet inline widget begin -->\n<div class="linksmeet-inline-widget" data-url="${window.location.origin}/book/${uid}/${embedModalEvent.slug}" data-primary-color="${embedModalEvent.eventColor || '#7d3bec'}" data-auto-sync="false" style="min-width:320px;height:700px;"></div>\n<script type="text/javascript" src="${window.location.origin}/widget.js" async></script>\n<!-- LinksMeet inline widget end -->`;
                  navigator.clipboard?.writeText(code).catch(() => {});
                  setCopiedType('inline');
                  window.setTimeout(() => {
                    setEmbedModalEvent(null);
                  }, 1500);
                }}
                style={{ position: 'relative', padding: '20px', borderRadius: '16px', border: '2px solid #f1f5f9', background: copiedType === 'inline' ? '#f0fdf4' : '#ffffff', color: copiedType === 'inline' ? '#16a34a' : '#0f172a', fontWeight: 600, fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                onMouseOver={e => { if(copiedType !== 'inline') { e.currentTarget.style.borderColor = '#7d3bec'; e.currentTarget.style.background = '#faf5ff'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(125,59,236,0.12)'; } }}
                onMouseOut={e => { if(copiedType !== 'inline') { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; } }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                  {copiedType === 'inline' ? <CheckCircle2 size={20} color="#16a34a" /> : <LayoutGrid size={20} color="#7d3bec" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{copiedType === 'inline' ? 'Copied to clipboard!' : 'Inline Embed'}</span>
                    {copiedType !== 'inline' && <ArrowUpRight size={16} color="#94a3b8" />}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: copiedType === 'inline' ? '#16a34a' : '#64748b', fontWeight: 400 }}>
                    {copiedType === 'inline' ? 'You can now paste it into your website.' : 'Embed the calendar directly into your page layout.'}
                  </div>
                </div>
              </button>

              {/* Option 2 */}
              <button 
                onClick={() => {
                  const code = `<!-- LinksMeet popup widget begin -->\n<div class="linksmeet-popup-widget" data-url="${window.location.origin}/book/${uid}/${embedModalEvent.slug}" data-text="Book a meeting" data-color="${embedModalEvent.eventColor || '#7d3bec'}" data-text-color="#ffffff"></div>\n<script type="text/javascript" src="${window.location.origin}/widget.js" async></script>\n<!-- LinksMeet popup widget end -->`;
                  navigator.clipboard?.writeText(code).catch(() => {});
                  setCopiedType('floating');
                  window.setTimeout(() => {
                    setEmbedModalEvent(null);
                  }, 1500);
                }}
                style={{ position: 'relative', padding: '20px', borderRadius: '16px', border: '2px solid #f1f5f9', background: copiedType === 'floating' ? '#f0fdf4' : '#ffffff', color: copiedType === 'floating' ? '#16a34a' : '#0f172a', fontWeight: 600, fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                onMouseOver={e => { if(copiedType !== 'floating') { e.currentTarget.style.borderColor = '#7d3bec'; e.currentTarget.style.background = '#faf5ff'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(125,59,236,0.12)'; } }}
                onMouseOut={e => { if(copiedType !== 'floating') { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; } }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                  {copiedType === 'floating' ? <CheckCircle2 size={20} color="#16a34a" /> : <MessageCircle size={20} color="#7d3bec" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{copiedType === 'floating' ? 'Copied to clipboard!' : 'Floating Button'}</span>
                    {copiedType !== 'floating' && <ArrowUpRight size={16} color="#94a3b8" />}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: copiedType === 'floating' ? '#16a34a' : '#64748b', fontWeight: 400 }}>
                    {copiedType === 'floating' ? 'You can now paste it into your website.' : 'Add a bottom-corner button that opens a popup.'}
                  </div>
                </div>
              </button>
            </div>
            
          </div>
        </div>,
        document.body
      )}
      </div>
    </>
  );
}

