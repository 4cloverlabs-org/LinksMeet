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


export default function PeoplePage() {
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
                  <button className={leadsTab === 'inbound' ? 'on' : ''} onClick={() => setLeadsTab('inbound')}>Inbound Enquiries</button>
                  <button className={leadsTab === 'uploaded' ? 'on' : ''} onClick={() => setLeadsTab('uploaded')}>
                    Uploaded Leads
                  </button>
                </div>
                
                <div className="crm-card">
                  <div className="crm-card-head">
                    <h3>{leadsTab === 'inbound' ? 'Inbound Leads' : 'Uploaded Leads'} <span style={{ color: '#9b9bab', fontWeight: 500 }}>({(leadsTab === 'inbound' ? filteredContacts.filter(c => c.source !== 'uploaded') : filteredContacts.filter(c => c.source === 'uploaded')).length})</span></h3>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="crm-btn crm-btn-ghost" onClick={exportContactsCSV} disabled={contacts.length === 0}><FileText size={15} /> Export</button>
                      {leadsTab === 'uploaded' ? (
                        <>
                          <input type="file" accept=".csv, .xlsx, .xls" ref={fileInputRef} style={{ display: 'none' }} onChange={handleUploadFile} />
                          <button className="crm-btn crm-btn-primary" onClick={() => fileInputRef.current?.click()} disabled={savingContact}>
                            {savingContact ? <Loader2 size={15} className="crm-spin-ic" /> : <Plus size={15} />} Upload CSV/Excel
                          </button>
                        </>
                      ) : (
                        <button className="crm-btn crm-btn-primary" onClick={() => { setCForm(blankContact); setContactErr(''); setShowContactForm(true); }}><Plus size={15} /> Add lead</button>
                      )}
                    </div>
                  </div>

                  {contactErr && <div style={{ background: '#fdecec', border: '1px solid #f6c9c9', color: '#b42318', fontSize: '0.82rem', padding: '10px 12px', borderRadius: 9, marginBottom: 12 }}>{contactErr}</div>}

                  {contactsLoading ? (
                    <div style={{ padding: 50, textAlign: 'center', color: 'var(--muted)' }}><Loader2 size={22} className="crm-spin-ic" /></div>
                  ) : (leadsTab === 'inbound' ? filteredContacts.filter(c => c.source !== 'uploaded') : filteredContacts.filter(c => c.source === 'uploaded')).length === 0 ? (
                    <div className="crm-empty">
                      <span className="ic"><Users size={24} /></span>
                      <h3>{contacts.length === 0 ? `No ${leadsTab} leads yet` : `No leads match “${search}”`}</h3>
                      <p>{leadsTab === 'inbound' ? 'Connect your booking widget so every enquiry creates one automatically.' : 'Upload your leads via Excel or CSV.'}</p>
                    </div>
                  ) : (
                    <div className="crm-table">
                      <div className="crm-tr lead head" style={{ gridTemplateColumns: '2fr 1fr 2fr 1fr 120px' }}><span>Name</span><span className="crm-hide">Source</span><span>Email</span><span>Status</span><span /></div>
                      {(leadsTab === 'inbound' ? filteredContacts.filter(c => c.source !== 'uploaded') : filteredContacts.filter(c => c.source === 'uploaded')).map((c, i) => (
                          <div className="crm-tr lead" key={c.id} style={{ gridTemplateColumns: '2fr 1fr 2fr 1fr 120px' }}>
                            <span className="crm-nm"><span className="crm-av" style={{ background: avColor(i) }}>{initials(c.name)}</span>{c.name}</span>
                            <span className="crm-hide">
                              {c.source?.startsWith('Booking') ? (
                                <span style={{ padding: '4px 10px', background: '#eff6ff', color: '#2563eb', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  Booking
                                </span>
                              ) : (
                                <span style={{ padding: '4px 10px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 500 }}>
                                  {c.source || 'Manual'}
                                </span>
                              )}
                            </span>
                            <span className="crm-muted">{c.email}</span>
                            <select
                              className="crm-status-select"
                              value={c.status}
                              onChange={e => changeStatus(c.id, e.target.value as ContactStatus)}
                            >
                              {CONTACT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
                              <button 
                                style={{ background: '#eff6ff', border: 'none', color: '#0E61F3', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Start AI Campaign" 
                                onClick={() => {
                                  setInitCampaignLead(c);
                                  setView('campaigns');
                                }}
                              >
                                <Sparkles size={16} />
                              </button>
                              <button className="crm-row-act" title="Delete lead" onClick={() => removeContact(c.id, c.name)}><Trash2 size={16} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
              </div>
    </>
  );
}
