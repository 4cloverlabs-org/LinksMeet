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


export default function AppsPage() {
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
                  <button className={appsTab === 'store' ? 'on' : ''} onClick={() => setAppsTab('store')}>App Store</button>
                  <button className={appsTab === 'installed' ? 'on' : ''} onClick={() => setAppsTab('installed')}>
                    Installed Apps ({installedApps.length})
                  </button>
                </div>

                {appsTab === 'store' ? (
                  <>
                    <div className="crm-chips">
                      {appCats.map(c => (
                        <button key={c} className={`crm-chip-btn${appCat === c ? ' on' : ''}`} onClick={() => setAppCat(c)}>{c}</button>
                      ))}
                    </div>
                    <div className="crm-app-grid">
                      {filteredApps.map(a => {
                        const isConnected = installedApps.some(installed => installed.nm === a.nm);
                        const isConnecting = connectingApps.includes(a.nm);
                        return (
                          <div className="crm-app-card" key={a.nm}>
                            <img src={a.logo} alt={a.nm} className="crm-app-ic" style={{ background: 'transparent', objectFit: 'contain' }} />
                            <div><h4>{a.nm}</h4><span className="cat">{a.cat}</span></div>
                            <p className="ds">{a.ds}</p>
                            {isConnected ? (
                              <button className="crm-btn crm-btn-ghost" style={{ width: '100%', color: '#059669', background: '#ecfdf5', cursor: 'default' }} disabled>
                                <Check size={14} /> Connected
                              </button>
                            ) : isConnecting ? (
                              <button className="crm-btn crm-btn-ghost" style={{ width: '100%' }} disabled>
                                <Loader2 size={14} className="crm-spin-ic" /> Connecting...
                              </button>
                            ) : !a.nm.includes('Google') ? (
                              <button className="crm-btn crm-btn-ghost" style={{ width: '100%', color: '#6B7280', background: '#F3F4F6', cursor: 'not-allowed' }} disabled>
                                Coming soon
                              </button>
                            ) : (
                              <button className="crm-btn crm-btn-ghost" style={{ width: '100%' }} onClick={() => handleConnectApp(a)}>
                                <Plus size={14} /> Connect
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="crm-card">
                    <div className="crm-card-head"><h3>Connected <span style={{ color: '#9b9bab', fontWeight: 500 }}>({installedApps.length})</span></h3></div>
                    {installedApps.map(a => (
                      <div className="crm-task" key={a.nm} style={{ padding: '14px 0' }}>
                        <img src={a.logo} alt={a.nm} className="crm-app-ic" style={{ width: 34, height: 34, background: 'transparent', objectFit: 'contain' }} />
                        <div><div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{a.nm}</div><div style={{ fontSize: '0.76rem', color: '#9b9bab' }}>{a.cat}</div></div>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span className="crm-tag green">Connected</span>
                          <button className="crm-btn crm-btn-ghost" onClick={() => handleManageApp(a)}>Manage</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
    </>
  );
}
