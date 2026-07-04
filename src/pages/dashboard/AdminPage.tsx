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


export default function AdminPage() {
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
      <div className="crm-fade crm-grid-2b">
                <div className="crm-card">
                  <div className="crm-card-head"><h3>Profile</h3></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                    <span className="crm-av" style={{ width: 54, height: 54, fontSize: '1.1rem', background: '#0E61F3' }}>{userInitials}</span>
                    <div><div style={{ fontWeight: 500 }}>{displayName}</div><div style={{ fontSize: '0.78rem', color: '#9b9bab' }}>{user?.email}</div></div>
                  </div>
                  <div className="crm-field"><label>Full name</label><input defaultValue={displayName} /></div>
                  <div className="crm-field"><label>Email</label><input defaultValue={user?.email || ''} disabled /></div>
                  
                  {userProfile && (
                    <>
                      <div className="crm-field"><label>Website URL</label><input defaultValue={userProfile.website_url || ''} disabled /></div>
                      <div className="crm-field"><label>Company Details</label><textarea defaultValue={userProfile.brand_description || ''} style={{ minHeight: 120, resize: 'vertical' }} disabled /></div>
                    </>
                  )}
                  
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="crm-btn crm-btn-primary" style={{ flex: 1 }}>Save changes</button>
                    <button className="crm-btn crm-btn-ghost" onClick={logoutAndGo}><LogOut size={15} /> Log out</button>
                  </div>
                </div>
                <div className="crm-card" style={{ alignSelf: 'start' }}>
                  <div className="crm-card-head"><h3>Notifications</h3></div>
                  {[
                    { key: 'deals' as const, tt: 'Deal alerts', ds: 'Get notified when a deal changes stage.' },
                    { key: 'weekly' as const, tt: 'Weekly summary', ds: 'A digest of your pipeline every Monday.' },
                    { key: 'mentions' as const, tt: 'Mentions', ds: 'When a teammate @mentions you.' },
                  ].map(n => (
                    <div className="crm-toggle-row" key={n.key}>
                      <div><div className="tt">{n.tt}</div><div className="ds">{n.ds}</div></div>
                      <button className={`crm-switch${notif[n.key] ? ' on' : ''}`} onClick={() => setNotif(prev => ({ ...prev, [n.key]: !prev[n.key] }))} aria-label={n.tt} />
                    </div>
                  ))}
                </div>


              </div>
            )}

            {/* ---------- HELP ---------- */}
    </>
  );
}
