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


export default function PaymentsPage() {
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
                <div className="crm-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <CreditCard size={32} />
                  </div>
                  <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: 12 }}>Payments are coming soon</h2>
                  <p style={{ fontSize: '15px', color: '#6B7280', maxWidth: 400, margin: '0 auto 32px' }}>
                    We're building a powerful new way to collect and track payments directly from your bookings. Stay tuned!
                  </p>
                  <button className="crm-btn crm-btn-primary" style={{ margin: '0 auto' }} onClick={() => setView('dashboard')}>
                    Back to Dashboard
                  </button>
                </div>
              </div>
            )}

            {/* ---------- ADMIN CENTER ---------- */}
    </>
  );
}
