import React, { useState, useRef } from 'react';
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
  } = ctx || {};

  return (
    <>
      <div className="crm-fade">
                <div className="crm-seg" style={{ width: 'fit-content', marginBottom: 22 }}>
                  <button className={etTab === 'eventTypes' ? 'on' : ''} onClick={() => setEtTab('eventTypes')}>Event Types</button>
                  <button className={etTab === 'availability' ? 'on' : ''} onClick={() => setEtTab('availability')}>Availability</button>
                </div>

                {etTab === 'eventTypes' ? (
                  <div style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
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
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{e.title}</span>
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
                        <div style={{ position: 'relative' }}>
                          <button 
                            className="et-icon-btn"
                            onClick={() => setEtDropdown(etDropdown === e.id ? null : e.id)}
                            title="More Options"
                          >
                            <MoreHorizontal size={16} />
                          </button>

                          {etDropdown === e.id && (
                            <>
                              {/* Invisible backdrop to close dropdown */}
                              <div 
                                style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                                onClick={() => setEtDropdown(null)}
                              />
                              <div style={{
                                position: 'absolute', right: 0, top: '40px',
                                background: '#fff', border: '1px solid #e2e8f0',
                                borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                minWidth: '160px', zIndex: 50, padding: '4px'
                              }}>
                                <button className="et-dd-btn" onClick={() => { 
                                  setEtDropdown(null); 
                                  setEditingEvent(e);
                                }}>
                                  <Edit2 size={14} /> Edit
                                </button>
                                <button className="et-dd-btn" onClick={async () => { 
                                  setEtDropdown(null); 
                                  try {
                                    await addEventType(uid, { ...e, slug: e.slug + '-copy', title: e.title + ' (Copy)' });
                                    setToast('Event type duplicated');
                                  } catch (err: any) {
                                    setToast('Failed to duplicate');
                                  }
                                }}>
                                  <Copy size={14} /> Duplicate
                                </button>
                                <button className="et-dd-btn" onClick={() => { 
                                  setEtDropdown(null); 
                                  const code = `<!-- LinksMeet inline widget begin -->\n<div class="linksmeet-inline-widget" data-url="${window.location.origin}/book/${uid}/${e.slug}" style="min-width:320px;height:700px;"></div>\n<script type="text/javascript" src="${window.location.origin}/widget.js" async></script>\n<!-- LinksMeet inline widget end -->`;
                                  navigator.clipboard?.writeText(code).catch(() => {});
                                  setToast('Embed code copied'); window.setTimeout(() => setToast(null), 1800);
                                }}>
                                  <Code size={14} /> Embed
                                </button>
                                <button className="et-dd-btn" onClick={() => { setEtDropdown(null); setToast('Troubleshooting'); }}>
                                  <CalendarCheck size={14} /> Troubleshoot
                                </button>
                                <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
                                <button className="et-dd-btn" style={{ color: '#ef4444' }} onClick={async () => {
                                  setEtDropdown(null);
                                  if (confirm(`Delete ${e.title}?`)) {
                                    try {
                                      await deleteEventType(uid, e.id);
                                      setToast('Event type deleted');
                                    } catch(err) {
                                      setToast('Failed to delete');
                                    }
                                  }
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
                ) : (
                  <div className="cal-layout">
                    {/* Header */}
                    <div className="cal-header">
                      <div className="cal-header-left">
                        <button className="cal-back-btn" onClick={() => setEtTab('eventTypes')}>
                          <ArrowLeft size={18} />
                        </button>
                        <div className="cal-title-group">
                          <h2>Working hours <Edit2 size={16} /></h2>
                          <p>Mon - Fri, 9:00 AM - 5:00 PM</p>
                        </div>
                      </div>
                      <div className="cal-header-right">
                        <label className="cal-default-toggle" style={{ cursor: 'pointer' }} onClick={() => setAvailIsDefault(!availIsDefault)}>
                          Set as default
                          <button className={`cal-switch ${availIsDefault ? 'on' : ''}`} aria-label="Default toggle" />
                        </label>
                        <button className="cal-btn-icon" aria-label="Delete schedule">
                          <Trash2 size={16} />
                        </button>
                        <button className="cal-btn-save" onClick={saveAvailability}>
                          Save
                        </button>
                      </div>
                    </div>

                    {/* Content Grid */}
                    <div className="cal-grid">
                      {/* Left Column */}
                      <div>
                        {/* Weekly Schedule Card */}
                        <div className="cal-card">
                          {availSchedule.map((d, index) => (
                            <div key={d.day} className={`cal-row${d.on ? '' : ' off'}`}>
                              <div className="cal-row-left">
                                <button 
                                  className={`cal-switch${d.on ? ' on' : ''}`} 
                                  aria-label={d.day}
                                  onClick={() => {
                                    const newSched = [...availSchedule];
                                    newSched[index].on = !newSched[index].on;
                                    setAvailSchedule(newSched);
                                  }}
                                />
                                <span className="cal-row-day">{d.day}</span>
                              </div>
                              
                              <div className="cal-row-times" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                {d.on ? (
                                  d.slots && d.slots.length > 0 ? d.slots.map((slot: any, sIndex: number) => (
                                    <div key={sIndex} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                      <input 
                                        type="time" 
                                        className="cal-time-input"
                                        value={slot.start} 
                                        onChange={(e) => {
                                          const newSched = [...availSchedule];
                                          newSched[index].slots[sIndex].start = e.target.value;
                                          setAvailSchedule(newSched);
                                        }}
                                      />
                                      <span style={{ color: '#94A3B8', fontWeight: 500 }}>-</span>
                                      <input 
                                        type="time" 
                                        className="cal-time-input"
                                        value={slot.end} 
                                        onChange={(e) => {
                                          const newSched = [...availSchedule];
                                          newSched[index].slots[sIndex].end = e.target.value;
                                          setAvailSchedule(newSched);
                                        }}
                                      />
                                      <div className="cal-row-actions" style={{ marginLeft: 0 }}>
                                        <Trash2 size={16} onClick={() => {
                                          const newSched = [...availSchedule];
                                          newSched[index].slots.splice(sIndex, 1);
                                          if (newSched[index].slots.length === 0) newSched[index].on = false;
                                          setAvailSchedule(newSched);
                                        }} />
                                      </div>
                                    </div>
                                  )) : <div style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Unavailable</div>
                                ) : (
                                  <div style={{ color: '#94A3B8', fontSize: '0.9rem', opacity: 0 }}>Unavailable</div>
                                )}
                              </div>
                              
                              <div className="cal-row-actions" style={{ marginLeft: 'auto', alignSelf: 'flex-start', marginTop: '6px' }}>
                                {d.on && <Plus size={16} onClick={() => {
                                  const newSched = [...availSchedule];
                                  newSched[index].slots.push({start: '09:00', end: '17:00'});
                                  setAvailSchedule(newSched);
                                }} />}
                                <Copy size={16} onClick={() => {
                                  const newSched = [...availSchedule];
                                  const slotsToCopy = JSON.parse(JSON.stringify(d.slots));
                                  newSched.forEach(day => {
                                    if (day.day !== 'Saturday' && day.day !== 'Sunday') {
                                      day.on = d.on;
                                      day.slots = JSON.parse(JSON.stringify(slotsToCopy));
                                    }
                                  });
                                  setAvailSchedule(newSched);
                                  setToast('Copied to all weekdays');
                                  setTimeout(() => setToast(null), 2000);
                                }} />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Date Overrides Card */}
                        <div className="cal-card cal-overrides-card">
                          <h3>Date overrides <Info size={14} style={{ color: '#94A3B8' }} /></h3>
                          <p>Add dates when your availability changes from your daily hours.</p>
                          <button className="cal-btn-outline">
                            <Plus size={14} /> Add an override
                          </button>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div>
                        <div className="cal-side-section">
                          <label className="cal-side-label">Timezone</label>
                          <div style={{ position: 'relative' }}>
                            <input 
                              type="text"
                              className="cal-select" 
                              style={{ paddingLeft: '36px', width: '100%' }}
                              value={tzOpen ? tzSearch : TIMEZONES.find((t: any) => t.id === availPrefs.tz)?.label || availPrefs.tz}
                              onClick={() => { setTzOpen(true); setTzSearch(''); }}
                              onChange={(e) => {
                                setTzSearch(e.target.value);
                                if (!tzOpen) setTzOpen(true);
                              }}
                              onBlur={() => setTimeout(() => setTzOpen(false), 200)}
                            />
                            <Globe size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }} />
                            
                            {tzOpen && (
                              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', marginTop: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', zIndex: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                                  {TIMEZONES.filter((tz: any) => tz.label.toLowerCase().includes(tzSearch.toLowerCase())).map((tz: any) => (
                                    <div 
                                      key={tz.id} 
                                      style={{ padding: '8px 12px', fontSize: '0.85rem', color: '#0F172A', cursor: 'pointer', background: availPrefs.tz === tz.id ? '#F8FAFC' : 'transparent', fontWeight: availPrefs.tz === tz.id ? 600 : 400 }}
                                      onClick={() => {
                                        setAvailPrefs({ ...availPrefs, tz: tz.id });
                                        setTzOpen(false);
                                        setTzSearch('');
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
                                      onMouseLeave={(e) => e.currentTarget.style.background = availPrefs.tz === tz.id ? '#F8FAFC' : 'transparent'}
                                    >
                                      {tz.label}
                                    </div>
                                  ))}
                                  {TIMEZONES.filter((tz: any) => tz.label.toLowerCase().includes(tzSearch.toLowerCase())).length === 0 && (
                                    <div style={{ padding: '12px', fontSize: '0.85rem', color: '#64748B', textAlign: 'center' }}>No timezones found</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---------- BOOKINGS ---------- */}
    </>
  );
}
