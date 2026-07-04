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


export default function OverviewPage() {
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
  , followUps, statusCounts, addedThisWeek, ACCENT_SOFT, ACCENT, contactsLoading, STATUS_META, statusStages, filteredContacts, Donut, avColor, initials, removeContact } = ctx || {};

  return (
    <>
      <div className="crm-fade">
                <div className="crm-kpis">
                  {[
                    { icon: Users, val: contacts.length, lab: 'Total leads' },
                    { icon: CalendarCheck, val: followUps.length, lab: 'Needs follow-up' },
                    { icon: Trophy, val: statusCounts.Won, lab: 'Won' },
                    { icon: UserPlus, val: addedThisWeek, lab: 'New this week', up: true },
                  ].map(k => {
                    const Icon = k.icon;
                    return (
                      <div className="crm-kpi" key={k.lab}>
                        <div className="crm-kpi-top">
                          <span className="crm-kpi-ic" style={{ background: ACCENT_SOFT, color: ACCENT }}><Icon size={19} /></span>
                          {k.up && k.val > 0 && <span className="crm-kpi-delta up"><ArrowUpRight size={12} />+{k.val}</span>}
                        </div>
                        <div className="crm-kpi-val">{contactsLoading ? '—' : k.val}</div>
                        <div className="crm-kpi-lab">{k.lab}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="crm-grid-2">
                  {/* Follow-ups queue */}
                  <div className="crm-card">
                    <div className="crm-card-head">
                      <div><h3>Follow-ups</h3><span className="sub">Leads that need attention</span></div>
                      <button className="crm-btn crm-btn-ghost" onClick={() => { setPeopleTab('contacts'); setView('people'); }}>View all</button>
                    </div>
                    {contactsLoading ? (
                      <div style={{ padding: 28, textAlign: 'center', color: 'var(--muted)' }}><Loader2 size={20} className="crm-spin-ic" /></div>
                    ) : followUps.length === 0 ? (
                      <div className="crm-empty" style={{ padding: '28px 10px' }}>
                        <span className="ic"><CheckCircle2 size={22} /></span>
                        <h3>You’re all caught up</h3>
                        <p>New leads from your booking page will appear here to follow up.</p>
                      </div>
                    ) : (
                      followUps.slice(0, 5).map(c => (
                        <div className="crm-task" key={c.id} style={{ padding: '13px 0' }}>
                          <span className="crm-av" style={{ background: ACCENT }}>{initials(c.name)}</span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.86rem', fontWeight: 500 }}>{c.name}</div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>{c.source || c.email}</div>
                          </div>
                          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span className={`crm-tag ${STATUS_META[c.status].tag}`}>{c.status}</span>
                            <button className="crm-btn crm-btn-ghost" onClick={() => changeStatus(c.id, 'Won')}>Mark won</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* By status donut */}
                  <div className="crm-card">
                    <div className="crm-card-head"><h3>Leads by status</h3></div>
                    {contacts.length === 0 ? (
                      <div className="crm-empty" style={{ padding: '28px 10px' }}>
                        <span className="ic"><Users size={22} /></span>
                        <h3>No leads yet</h3>
                        <p>Add one manually or get them automatically from your booking widget.</p>
                        <button className="crm-btn crm-btn-primary" style={{ margin: '0 auto' }} onClick={() => { setCForm(blankContact); setShowContactForm(true); }}><Plus size={15} /> Add lead</button>
                      </div>
                    ) : (
                      <div className="crm-donut-wrap">
                        <Donut stages={statusStages} total={contacts.length} label="leads" />
                        <div className="crm-legend">
                          {statusStages.map(s => (
                            <div className="crm-legend-row" key={s.name}>
                              <span className="sw" style={{ background: s.color }} />
                              <span>{s.name}</span><span className="val">{s.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent leads */}
                <div className="crm-card">
                  <div className="crm-card-head">
                    <h3>Recent leads</h3>
                    <button className="crm-btn crm-btn-ghost" onClick={() => { setPeopleTab('contacts'); setView('people'); }}>View all</button>
                  </div>
                  {contacts.length === 0 && !contactsLoading ? (
                    <div className="crm-empty" style={{ padding: '34px 10px' }}>
                      <span className="ic"><Users size={24} /></span>
                      <h3>Your leads will show here</h3>
                      <p>Every booking from your embedded widget becomes a lead you can follow up.</p>
                      <button className="crm-btn crm-btn-primary" style={{ margin: '0 auto' }} onClick={() => setView('eventTypes')}><Rocket size={15} /> Set up your booking widget</button>
                    </div>
                  ) : (
                    <div className="crm-table">
                      <div className="crm-tr contacts head">
                        <span>Name</span><span className="crm-hide">Source</span><span>Email</span><span className="crm-hide">Phone</span><span>Status</span><span />
                      </div>
                      {filteredContacts.slice(0, 6).map((c, i) => (
                        <div className="crm-tr contacts" key={c.id}>
                          <span className="crm-nm"><span className="crm-av" style={{ background: avColor(i) }}>{initials(c.name)}</span>{c.name}</span>
                          <span className="crm-muted crm-hide">{c.source || 'Manual'}</span>
                          <span className="crm-muted">{c.email}</span>
                          <span className="crm-muted crm-hide">{c.phone || '—'}</span>
                          <span className={`crm-tag ${STATUS_META[c.status].tag}`}>{c.status}</span>
                          <button className="crm-row-act" title="Delete" onClick={() => removeContact(c.id, c.name)}><Trash2 size={15} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
    </>
  );
}
