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


export default function BookingsPage() {
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
      <div className="crm-fade crm-card">
                <div className="crm-card-head">
                  <div className="crm-seg">
                    {(['upcoming', 'past', 'cancelled'] as const).map(t => (
                      <button key={t} className={bookingTab === t ? 'on' : ''} onClick={() => setBookingTab(t)}>
                        {t[0].toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                {filteredBookings.length === 0 ? (
                  <div className="crm-empty"><span className="ic"><CalendarCheck size={26} /></span><h3>No {bookingTab} bookings</h3><p>When you have {bookingTab} meetings, they’ll show up here.</p></div>
                ) : filteredBookings.map((b, i) => (
                  <div className="crm-task" key={i} style={{ padding: '14px 0' }}>
                    <span className="crm-av" style={{ background: avColor(i) }}>{initials(b.name)}</span>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{b.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#9b9bab' }}>{b.event} · {b.slot}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                      {b.status === 'upcoming' && <button className="crm-btn crm-btn-ghost"><Video size={14} /> Join</button>}
                      <span className={`crm-tag ${b.status === 'upcoming' ? 'violet' : b.status === 'cancelled' ? 'rose' : 'green'}`}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ---------- PEOPLE (Leads) ---------- */}
    </>
  );
}
