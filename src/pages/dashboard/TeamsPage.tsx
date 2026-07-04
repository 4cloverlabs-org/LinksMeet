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


export default function TeamsPage() {
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
                  <div className="crm-card" style={{ borderRadius: '8px', border: '1px solid #E5E7EB', overflow: 'hidden', background: '#FFFFFF', boxShadow: 'none' }}>
                    <div style={{ padding: '24px 32px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#111827' }}>Team Members</h3>
                          <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>Manage your organization's members, roles, and access.</p>
                        </div>
                        <button className="crm-btn" style={{ background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '0 16px', height: '36px', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setShowInviteModal(true)}>
                          <UserPlus size={16} /> Invite member
                        </button>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {/* Table Header */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 2fr) 1fr 1fr 100px', padding: '12px 32px', background: '#F9FAFB', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                        <span>User</span>
                        <span>Status</span>
                        <span>Role</span>
                        <span style={{ textAlign: 'right' }}>Actions</span>
                      </div>
                      
                      {/* Table Rows */}
                      {teamMembers.map((member, i) => {
                        const memberInitials = member.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                        const isPending = member.status === 'Pending';
                        
                        return (
                          <div key={member.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 2fr) 1fr 1fr 100px', padding: '16px 32px', borderBottom: '1px solid #E5E7EB', alignItems: 'center' }}>
                            {/* User Column */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ width: 40, height: 40, borderRadius: '50%', background: isPending ? '#F3F4F6' : '#2563EB', color: isPending ? '#4B5563' : '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 500, flexShrink: 0 }}>
                                {isPending ? 'JS' : '21'}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>{isPending ? 'Jane Smith' : '2431fa05fbf6 (You)'}</span>
                                <span style={{ color: '#6B7280', fontSize: '14px' }}>{isPending ? 'jane.smith@acmecorp.com' : '2431fa05fbf6@linksmeet.com'}</span>
                              </div>
                            </div>
                            
                            {/* Status Column */}
                            <div>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500, background: isPending ? '#FFFBEB' : '#ECFDF5', color: isPending ? '#D97706' : '#059669' }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: isPending ? '#F59E0B' : '#10B981' }} />
                                {member.status}
                              </span>
                            </div>
                            
                            {/* Role Column */}
                            <div>
                              <span style={{ padding: '2px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, background: '#F3F4F6', color: '#4B5563' }}>
                                {member.role}
                              </span>
                            </div>
                            
                            {/* Actions Column */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', color: '#9CA3AF' }}>
                               {isPending ? (
                                 <>
                                   <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9CA3AF' }} title="Resend Invite" onClick={() => { setToast('Invite resent to ' + member.email); setTimeout(() => setToast(null), 2000); }}><Mail size={18} strokeWidth={1.5} /></button>
                                   <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9CA3AF' }} title="Cancel Invite" onClick={() => removeMember(member.id)}><Trash2 size={18} strokeWidth={1.5} /></button>
                                 </>
                               ) : (
                                 member.role !== 'Owner' ? (
                                   <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9CA3AF' }} title="Remove Member" onClick={() => removeMember(member.id)}><Trash2 size={18} strokeWidth={1.5} /></button>
                                 ) : (
                                   <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9CA3AF' }} title="Settings"><Settings size={18} strokeWidth={1.5} /></button>
                                 )
                               )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
              </div>
            )}

            {/* ---------- WORKFLOWS ---------- */}
    </>
  );
}
