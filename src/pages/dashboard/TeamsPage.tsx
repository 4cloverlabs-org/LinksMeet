import React, { useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  LayoutGrid, Users, Search, Bell, Plus, ArrowUpRight, ArrowDownRight,
  DollarSign, Trophy, UserPlus, MoreHorizontal, FileText,
  CheckCircle2, Menu, CalendarRange, CalendarCheck,
  Clock, Workflow, Spline, Store, CreditCard, Shield, HelpCircle,
  Sparkles, Link2, Video, Zap, BookOpen, MessageCircle, Keyboard, Check, X,
  Copy, Rocket, Calendar, Trash2, MoreVertical, ChevronLeft, Download, LogOut, Loader2, EyeOff, ExternalLink, Edit2, Code, Info, ArrowLeft, Globe, Settings, Mail, Phone, ChevronRight,
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
    teamMembers, showInviteModal, setShowInviteModal, inviteEmail, setInviteEmail, inviteRole, setInviteRole, handleInviteSubmit, removeMember, updateMember,
    editingWorkflow, setEditingWorkflow
  } = ctx || {};

  const [activeTab, setActiveTab] = useState('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [deptFilter, setDeptFilter] = useState('All Depts');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('Member');
  const [editDept, setEditDept] = useState('Unassigned');
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, right: 0 });
  const [deletingMember, setDeletingMember] = useState<any>(null);
  const itemsPerPage = 10;

  // Derive filtered members
  const filteredMembers = (teamMembers || []).filter((m: any) => {
    const matchesSearch = (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (m.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All Roles' || m.role === roleFilter;
    const matchesDept = deptFilter === 'All Depts' || (m.department || 'Unassigned') === deptFilter;
    const matchesStatus = statusFilter === 'All Status' || m.status === statusFilter;
    return matchesSearch && matchesRole && matchesDept && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / itemsPerPage));
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const activeCount = (teamMembers || []).filter((m: any) => m.status === 'Active').length;
  const pendingCount = (teamMembers || []).filter((m: any) => m.status === 'Pending').length;

  return (
    <>
      <div className="crm-fade">
        <div style={{ background: '#FFFFFF', minHeight: '100%', width: '100%', padding: '24px' }}>
          
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h3 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 600, color: '#111827' }}>Team Members</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>Manage who has access to your workspace.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="crm-btn" style={{ background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '0 16px', height: '40px', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setShowInviteModal(true)}>
                <Plus size={16} /> Invite Member
              </button>
            </div>
          </div>

          {/* Nav Tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
             <div style={{ display: 'flex', gap: '4px', background: '#FFFFFF', padding: '4px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <button 
                  onClick={() => setActiveTab('members')}
                  style={{ padding: '8px 16px', background: activeTab === 'members' ? '#F3F4F6' : 'transparent', color: activeTab === 'members' ? '#111827' : '#6B7280', border: activeTab === 'members' ? '1px solid #E5E7EB' : 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
                >
                  Team Members
                </button>
                <button 
                  onClick={() => setActiveTab('details')}
                  style={{ padding: '8px 16px', background: activeTab === 'details' ? '#F3F4F6' : 'transparent', color: activeTab === 'details' ? '#111827' : '#6B7280', border: activeTab === 'details' ? '1px solid #E5E7EB' : 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
                >
                  Team Details
                </button>
             </div>
          </div>

          {activeTab === 'members' ? (
            <>
              {/* Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
             {[
               { icon: <Users size={16} />, label: 'Total Member', value: (teamMembers?.length || 0).toString() },
               { icon: <Users size={16} />, label: 'Active Now', value: activeCount.toString() },
               { icon: <Users size={16} />, label: 'Pending Invites', value: pendingCount.toString().padStart(2, '0') },
               { icon: <Users size={16} />, label: 'Seats Used', value: `${teamMembers?.length || 0} / 50` }
             ].map((card, i) => (
                <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ width: 24, height: 24, background: '#F3F4F6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111827' }}>
                      {card.icon}
                    </div>
                    <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: 500 }}>{card.label}</span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 600, color: '#111827' }}>{card.value}</div>
                </div>
             ))}
          </div>

          {/* Filters Row */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#9CA3AF' }} />
              <input type="text" placeholder="Search Team.." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} style={{ width: '100%', height: '40px', paddingLeft: '36px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px' }} />
            </div>
            <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }} style={{ height: '40px', padding: '0 32px 0 16px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', color: '#4B5563', appearance: 'none', background: '#FFFFFF url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236B7280\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E") no-repeat right 12px center' }}>
              <option>All Roles</option>
              <option>Owner</option>
              <option>Admin</option>
              <option>Editor</option>
              <option>Viewer</option>
              <option>Member</option>
            </select>
            <select value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setCurrentPage(1); }} style={{ height: '40px', padding: '0 32px 0 16px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', color: '#4B5563', appearance: 'none', background: '#FFFFFF url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236B7280\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E") no-repeat right 12px center' }}>
              <option>All Depts</option>
              <option>Management</option>
              <option>Marketing</option>
              <option>Engineering</option>
              <option>Design</option>
              <option>Finance</option>
              <option>Sales</option>
              <option>Unassigned</option>
            </select>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} style={{ height: '40px', padding: '0 32px 0 16px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', color: '#4B5563', appearance: 'none', background: '#FFFFFF url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236B7280\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E") no-repeat right 12px center' }}>
              <option>All Status</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Offline</option>
            </select>
            
            <div style={{ flex: 1 }}></div>
            
            <button className="crm-btn" style={{ background: '#FFFFFF', color: '#4B5563', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '0 16px', height: '40px', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <LayoutGrid size={16} /> Filter
            </button>
          </div>
          
          {/* Table Container */}
          <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 3fr 1.5fr 1.5fr 1.5fr 1.5fr 80px', padding: '16px 24px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>
                <span style={{ textAlign: 'center' }}>ID</span>
                <span style={{ textAlign: 'center' }}>Members Name</span>
                <span style={{ textAlign: 'center' }}>Role</span>
                <span style={{ textAlign: 'center' }}>Department</span>
                <span style={{ textAlign: 'center' }}>Status</span>
                <span style={{ textAlign: 'center' }}>Joined Date</span>
                <span style={{ textAlign: 'center' }}>Action</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {paginatedMembers.length === 0 && (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>No team members match your filters.</div>
                )}
                {paginatedMembers.map((member: any, i: number) => {
                  
                  // Use real details from DB if available
                  const displayId = `MBR-00${((currentPage - 1) * itemsPerPage) + i + 1}`;
                  const dept = member.department || 'Unassigned';
                  const phone = member.phone || '--';
                  const joinedDate = new Date(member.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

                  let statusBg = '#EFF8FF';
                  let statusColor = '#2563EB';
                  let dotColor = '#3B82F6';
                  if (member.status === 'Pending') {
                    statusBg = '#FEF9C3';
                    statusColor = '#CA8A04';
                    dotColor = '#EAB308';
                  } else if (member.status === 'Offline') {
                    statusBg = '#F3F4F6';
                    statusColor = '#4B5563';
                    dotColor = '#6B7280';
                  }
                  
                  const statusText = member.status || 'Active';

                  return (
                    <div key={member.id} style={{ display: 'grid', gridTemplateColumns: '80px 3fr 1.5fr 1.5fr 1.5fr 1.5fr 80px', padding: '16px 24px', borderBottom: '1px solid #E5E7EB', alignItems: 'center', fontSize: '13px', color: '#4B5563' }}>
                      {/* ID */}
                      {/* ID */}
                      <span style={{ color: '#6B7280', textAlign: 'center' }}>{displayId}</span>
                      
                      {/* Name */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          <img src={member.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${member.email}&backgroundColor=f8fafc`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={member.name} />
                        </div>
                        <span style={{ fontWeight: 500, color: '#111827' }}>{member.name}</span>
                      </div>
                      
                      {/* Role */}
                      <span style={{ textAlign: 'center' }}>{member.role}</span>
                      
                      {/* Department */}
                      <span style={{ textAlign: 'center' }}>{dept}</span>
                      
                      {/* Status */}
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 8px', borderRadius: '16px', fontSize: '12px', fontWeight: 500, background: statusBg, color: statusColor }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor }} />
                          {statusText}
                        </span>
                      </div>
                      
                      {/* Joined Date */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <Calendar size={14} style={{ color: '#9CA3AF' }} />
                        <span>{joinedDate}</span>
                      </div>
                      
                      {/* Action */}
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', color: '#6B7280' }}>
                        {member.id !== 'owner' && (
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#9CA3AF', display: 'flex', alignItems: 'center', borderRadius: '4px', transition: 'background 0.2s' }} onClick={(e) => {
                            if (dropdownOpenId === member.id) {
                              setDropdownOpenId(null);
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setDropdownCoords({ top: rect.bottom, right: window.innerWidth - rect.right });
                              setDropdownOpenId(member.id);
                            }
                          }} onMouseOver={e => e.currentTarget.style.background = '#F3F4F6'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                            <MoreVertical size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Pagination Footer */}
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E5E7EB' }}>
              <span style={{ fontSize: '14px', color: '#6B7280' }}>
                Showing {filteredMembers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredMembers.length)} of {filteredMembers.length}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', color: currentPage === 1 ? '#D1D5DB' : '#4B5563', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>
                  <ChevronLeft size={16} />
                </button>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: currentPage === i + 1 ? '#111827' : '#FFFFFF', border: currentPage === i + 1 ? 'none' : '1px solid #E5E7EB', borderRadius: '8px', color: currentPage === i + 1 ? '#FFFFFF' : '#4B5563', fontWeight: currentPage === i + 1 ? 500 : 400, cursor: 'pointer' }}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', color: currentPage === totalPages ? '#D1D5DB' : '#4B5563', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
            </>
          ) : (
            <div style={{ padding: '64px 40px', textAlign: 'center', background: '#F9FAFB', border: '1px dashed #E5E7EB', borderRadius: '12px' }}>
              <div style={{ width: 48, height: 48, background: '#EFF6FF', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#2563EB' }}>
                <Settings size={24} />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600, color: '#111827' }}>Team Details Settings</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>Configure workspace name, billing, and global permissions here.</p>
              <button className="crm-btn" style={{ marginTop: '24px', background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '0 16px', height: '36px', fontSize: '14px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                Save Settings
              </button>
            </div>
          )}
          
        </div>
      </div>

      {editingMember && (
        <div className="crm-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(17, 24, 39, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div className="crm-modal" style={{ maxWidth: '440px', width: '100%', background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="crm-modal-head" style={{ padding: '24px 32px 20px', position: 'relative', display: 'block', borderBottom: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                <div style={{ width: '48px', height: '48px', flexShrink: 0, background: '#EFF6FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <Edit2 size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#111827', lineHeight: 1.2 }}>Edit Team Member</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6B7280', lineHeight: 1.4 }}>Update {editingMember.name}'s details.</p>
                </div>
              </div>
              <button className="crm-modal-close" onClick={() => setEditingMember(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: '#F3F4F6', border: 'none', color: '#6B7280', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                <X size={16} />
              </button>
            </div>
            
            <div className="crm-modal-body" style={{ padding: '24px 32px' }}>
              <form onSubmit={async (e) => {
                e.preventDefault();
                await updateMember(editingMember.id, { name: editName, role: editRole, department: editDept });
                setEditingMember(null);
              }}>
                <div className="crm-form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>Full Name</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required style={{ width: '100%', height: '46px', padding: '0 14px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box', background: '#FFFFFF', outline: 'none', color: '#111827' }} />
                </div>
                
                <div className="crm-form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>Role & Permissions</label>
                  <select value={editRole} onChange={e => setEditRole(e.target.value)} style={{ width: '100%', height: '46px', padding: '0 14px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box', background: '#FFFFFF', outline: 'none', color: '#111827' }}>
                    <option value="Admin">Admin (Full Access)</option>
                    <option value="Editor">Editor (Can edit content)</option>
                    <option value="Member">Member (Standard access)</option>
                    <option value="Viewer">Viewer (Read-only)</option>
                  </select>
                </div>
                
                <div className="crm-form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>Department</label>
                  <select value={editDept} onChange={e => setEditDept(e.target.value)} style={{ width: '100%', height: '46px', padding: '0 14px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box', background: '#FFFFFF', outline: 'none', color: '#111827' }}>
                    <option>Management</option>
                    <option>Marketing</option>
                    <option>Engineering</option>
                    <option>Design</option>
                    <option>Finance</option>
                    <option>Sales</option>
                    <option>Unassigned</option>
                  </select>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                  <button type="button" className="crm-btn" style={{ background: '#FFFFFF', color: '#4B5563', border: '1px solid #D1D5DB', borderRadius: '10px', padding: '0 20px', height: '44px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }} onClick={() => setEditingMember(null)}>Cancel</button>
                  <button type="submit" className="crm-btn" style={{ background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '0 20px', height: '44px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {deletingMember && (
        <div className="crm-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(17, 24, 39, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div className="crm-modal" style={{ maxWidth: '400px', width: '100%', background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', background: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', margin: '0 auto 16px' }}>
              <Trash2 size={28} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 600, color: '#111827' }}>Remove Member?</h3>
            <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6B7280', lineHeight: 1.5 }}>
              Are you sure you want to remove <strong>{deletingMember.name}</strong> from the team? They will lose access to this workspace.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="crm-btn" style={{ flex: 1, background: '#FFFFFF', color: '#4B5563', border: '1px solid #D1D5DB', borderRadius: '10px', padding: '0 16px', height: '44px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }} onClick={() => setDeletingMember(null)}>Cancel</button>
              <button className="crm-btn" style={{ flex: 1, background: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '0 16px', height: '44px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }} onClick={() => {
                removeMember(deletingMember.id);
                setDeletingMember(null);
              }}>Yes, Remove</button>
            </div>
          </div>
        </div>
      )}

      {dropdownOpenId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 }} onClick={() => setDropdownOpenId(null)}>
          <div style={{ position: 'fixed', top: dropdownCoords.top + 4, right: dropdownCoords.right, background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', zIndex: 9999, width: '180px', padding: '4px 0', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <button style={{ width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', color: '#4B5563', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#F9FAFB'} onMouseOut={e => e.currentTarget.style.background = 'none'} onClick={() => {
              const member = (teamMembers || []).find((m: any) => m.id === dropdownOpenId);
              if (member) {
                setEditingMember(member);
                setEditName(member.name || '');
                setEditRole(member.role || 'Member');
                setEditDept(member.department || 'Unassigned');
              }
              setDropdownOpenId(null);
            }}>
              <Edit2 size={14} /> Edit Member
            </button>
            <button style={{ width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', color: '#DC2626', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#FEF2F2'} onMouseOut={e => e.currentTarget.style.background = 'none'} onClick={() => { 
              const member = (teamMembers || []).find((m: any) => m.id === dropdownOpenId);
              if (member) setDeletingMember(member);
              setDropdownOpenId(null); 
            }}>
              <Trash2 size={14} /> Remove Member
            </button>
          </div>
        </div>
      )}
    </>
  );
}
