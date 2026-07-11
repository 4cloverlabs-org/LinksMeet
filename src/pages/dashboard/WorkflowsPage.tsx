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


export default function WorkflowsPage() {
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
  , handleSaveWorkflow, setMyWorkflows, API_BASE_URL, showWorkflowTypeModal, setShowWorkflowTypeModal, handleSelectType, canEdit } = ctx || {};

  const [wfTab, setWfTab] = useState<'create' | 'active' | 'drafts'>(myWorkflows.length > 0 ? 'active' : 'create');

  const localHandleSave = (draft: any) => {
    handleSaveWorkflow(draft);
    setWfTab(draft.is_active ? 'active' : 'drafts');
  };

  return (
    <>
      {editingWorkflow ? (
                <WorkflowEditor 
                  initialDraft={editingWorkflow} 
                  onSave={localHandleSave} 
                  onCancel={() => setEditingWorkflow(null)} 
                  eventTypes={eventTypes}
                />
              ) : (
                <div className="crm-fade">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid #E5E7EB', paddingBottom: 16 }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>Workflows</h2>
                    
                    <div style={{ display: 'flex', gap: '8px', background: '#F3F4F6', padding: '4px', borderRadius: '8px' }}>
                      <button 
                        onClick={() => setWfTab('create')}
                        style={{ padding: '6px 16px', border: 'none', background: wfTab === 'create' ? '#fff' : 'transparent', color: wfTab === 'create' ? '#111827' : '#6B7280', fontWeight: 500, fontSize: '14px', borderRadius: '6px', cursor: 'pointer', boxShadow: wfTab === 'create' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                      >
                        Create
                      </button>
                      <button 
                        onClick={() => setWfTab('active')}
                        style={{ padding: '6px 16px', border: 'none', background: wfTab === 'active' ? '#fff' : 'transparent', color: wfTab === 'active' ? '#111827' : '#6B7280', fontWeight: 500, fontSize: '14px', borderRadius: '6px', cursor: 'pointer', boxShadow: wfTab === 'active' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                      >
                        Active ({myWorkflows.filter((w: any) => w.is_active).length})
                      </button>
                      <button 
                        onClick={() => setWfTab('drafts')}
                        style={{ padding: '6px 16px', border: 'none', background: wfTab === 'drafts' ? '#fff' : 'transparent', color: wfTab === 'drafts' ? '#111827' : '#6B7280', fontWeight: 500, fontSize: '14px', borderRadius: '6px', cursor: 'pointer', boxShadow: wfTab === 'drafts' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                      >
                        Drafts ({myWorkflows.filter((w: any) => !w.is_active).length})
                      </button>
                    </div>
                  </div>

                  {wfTab === 'create' && (
                    <div className="crm-fade">
                      <div style={{ marginBottom: 40 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>Create a workflow</h3>
                          {canEdit && (
                            <button className="crm-btn" style={{ background: '#7d3bec', color: '#fff', border: 'none', borderRadius: '6px', padding: '0 16px', height: '36px', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => handleCreateWorkflow(null)}>
                              <Plus size={16} /> Create Custom
                            </button>
                          )}
                        </div>
                        
                        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: 12 }}>LinksMeet AI templates</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 20, marginBottom: 32 }}>
                          {[
                            { title: "Call to confirm booking", desc: "2 hrs before event starts", Icon: Phone, Badge: Clock, badgeColor: "#10B981" },
                            { title: "Follow up with no shows", desc: "30m after event ends", Icon: Mail, Badge: XCircle, badgeColor: "#EF4444" },
                            { title: "Remind attendees to bring ID", desc: "1 day before event starts", Icon: Mail, Badge: AlertCircle, badgeColor: "#F59E0B" }
                          ].map(t => (
                            <div key={t.title} onClick={() => handleCreateWorkflow(t)} style={{ display: 'flex', flexDirection: 'column', padding: '24px', border: '1px solid #E5E7EB', borderRadius: '8px', background: '#FFFFFF', cursor: 'pointer', transition: 'box-shadow 0.2s', minHeight: '200px' }} className="crm-wf-card-new">
                              <div style={{ position: 'relative', width: '48px', height: '48px', marginBottom: '16px' }}>
                                <div style={{ width: '100%', height: '100%', background: '#F3E8FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <t.Icon size={24} color="#7d3bec" strokeWidth={2} />
                                </div>
                                <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#fff', borderRadius: '50%', padding: '2px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                                  <div style={{ background: t.badgeColor, borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <t.Badge size={10} color="#fff" strokeWidth={3} />
                                  </div>
                                </div>
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>{t.title}</div>
                                <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.4 }}>{t.desc}</div>
                              </div>
                              <div style={{ alignSelf: 'flex-end', marginTop: '24px' }}>
                                <button className="crm-btn crm-btn-primary" style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 600 }}>Add workflow</button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: 12 }}>Standard templates</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 20 }}>
                          {[
                            { title: "Email reminder to host", desc: "Never miss an event — get automated email reminders", Icon: Mail, Badge: Clock, badgeColor: "#10B981" },
                            { title: "Email reminder to invitee", desc: "Reduce no-shows — send automated email reminders to invitees", Icon: Mail, Badge: Clock, badgeColor: "#10B981" },
                            { title: "Send thank you email", desc: "Build relationships with a quick thanks", Icon: Mail, Badge: Heart, badgeColor: "#F97316" },
                            { title: "Email additional resources", desc: "Send links for additional resources to your invitees", Icon: Mail, Badge: Link2, badgeColor: "#7d3bec" },
                            { title: "Email reminder to someone else", desc: "Prompt non-attendees so they can help prepare for your meeting", Icon: Mail, Badge: AlertCircle, badgeColor: "#F59E0B" },
                            { title: "Request follow-up meeting", desc: "Don't wait to meet again", Icon: Mail, Badge: RefreshCw, badgeColor: "#8B5CF6" },
                            { title: "Email your own feedback survey", desc: "Email a survey link from a third party like Typeform or Google Forms to get feedback from invitees after your event", Icon: Mail, Badge: Pencil, badgeColor: "#EC4899" },
                            { title: "Email no-shows to book a new time", desc: "Follow up with invitees who didn't show up to the meeting", Icon: Mail, Badge: XCircle, badgeColor: "#F97316" },
                            { title: "Text reminder to host", desc: "Never miss an event — set automated text reminders", Icon: Smartphone, Badge: Clock, badgeColor: "#10B981" },
                            { title: "Email follow-up to someone else", desc: "Notify non-attendees so they can support your meeting next steps", Icon: Mail, Badge: AlertCircle, badgeColor: "#F59E0B" },
                            { title: "Text booking confirmation to host", desc: "Keep hosts up-to-date with scheduled events", Icon: Smartphone, Badge: CheckCircle2, badgeColor: "#7d3bec" },
                            { title: "Text cancellation notification to host", desc: "Keep hosts up-to-date with canceled events", Icon: Smartphone, Badge: XCircle, badgeColor: "#EF4444" },
                            { title: "Text reminder to invitee", desc: "Reduce no-shows — send automated text reminders to invitees", Icon: Smartphone, Badge: Clock, badgeColor: "#10B981" },
                            { title: "Text booking confirmation to invitee", desc: "Let invitees know their event is scheduled", Icon: Smartphone, Badge: CheckCircle2, badgeColor: "#7d3bec" },
                            { title: "Text cancellation notification to invitee", desc: "Let invitees know as soon as an event is cancelled", Icon: Smartphone, Badge: XCircle, badgeColor: "#EF4444" },
                            { title: "Email cancellation notification to someone else", desc: "Update non-attendees so they can try to reschedule your meeting", Icon: Mail, Badge: AlertCircle, badgeColor: "#F59E0B" },
                            { title: "Text follow-up to invitee", desc: "Finish up by texting your invitees after an event", Icon: Smartphone, Badge: RefreshCw, badgeColor: "#8B5CF6" },
                            { title: "Email invitee to reconfirm", desc: "Reduce no-shows by asking your invitees to reconfirm they will attend your event", Icon: Mail, Badge: HelpCircle, badgeColor: "#F59E0B" },
                            { title: "Text invitee to reconfirm", desc: "Reduce no-shows by asking your invitees to reconfirm they will attend your event", Icon: Smartphone, Badge: HelpCircle, badgeColor: "#F59E0B" }
                          ].map((t, i) => (
                            <div key={i} onClick={() => handleCreateWorkflow(t)} style={{ display: 'flex', flexDirection: 'column', padding: '24px', border: '1px solid #E5E7EB', borderRadius: '8px', background: '#FFFFFF', cursor: 'pointer', transition: 'box-shadow 0.2s', minHeight: '200px' }} className="crm-wf-card-new">
                              <div style={{ position: 'relative', width: '48px', height: '48px', marginBottom: '16px' }}>
                                <div style={{ width: '100%', height: '100%', background: '#F3E8FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <t.Icon size={24} color="#7d3bec" strokeWidth={2} />
                                </div>
                                <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#fff', borderRadius: '50%', padding: '2px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                                  <div style={{ background: t.badgeColor, borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <t.Badge size={10} color="#fff" strokeWidth={3} />
                                  </div>
                                </div>
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>{t.title}</div>
                                <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.4 }}>{t.desc}</div>
                              </div>
                              <div style={{ alignSelf: 'flex-end', marginTop: '24px' }}>
                                <button className="crm-btn crm-btn-primary" style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 600 }}>Add workflow</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {wfTab === 'active' && (
                    <div className="crm-fade">
                      <div style={{ marginBottom: 40 }}>
                        <div className="crm-fade" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0 20px' }}>
                          {myWorkflows.filter((w: any) => w.is_active).length === 0 ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>No active workflows.</div>
                          ) : (
                            myWorkflows.filter((w: any) => w.is_active).map((w: any) => (
                              <div className="crm-wf" key={w.id} style={{ display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #e2e8f0' }}>
                                <span className="crm-wf-ic" style={{ background: '#F3E8FF', color: '#7d3bec', padding: 8, borderRadius: 8, marginRight: 16, display: 'flex', alignItems: 'center' }}>
                                  {w.action_type === 'email' ? <Mail size={18} /> : <Phone size={18} />}
                                </span>
                                <div style={{ flex: 1 }}>
                                  <div className="nm" style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{w.template_name}</div>
                                  <div className="fl" style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Triggers on {w.trigger_event}</div>
                                </div>
                                <span className="runs" style={{ fontSize: 13, color: '#64748b', marginRight: 16 }}>{w.runs} runs</span>
                                <button className="crm-btn crm-btn-ghost" style={{ padding: '6px 10px', marginRight: 8 }} onClick={() => setEditingWorkflow(w)} disabled={!canEdit}>
                                  <Edit2 size={14} />
                                </button>
                                {canEdit && <button className="crm-btn crm-btn-ghost" style={{ padding: '6px 10px', marginRight: 16, color: '#DC2626' }} onClick={() => {
                                  if (window.confirm('Delete this workflow?')) {
                                    setMyWorkflows((prev: any[]) => prev.filter(old => old.id !== w.id));
                                    setToast('Workflow deleted.');
                                    setTimeout(() => setToast(null), 3000);
                                  }
                                }}>
                                  <Trash2 size={14} />
                                </button>}
                                <button 
                                  className={`crm-switch${w.is_active ? ' on' : ''}`} 
                                  disabled={!canEdit}
                                  onClick={() => {
                                    const newActive = !w.is_active;
                                    setMyWorkflows(prev => prev.map(old => old.id === w.id ? { ...old, is_active: newActive } : old));
                                    setWfTab(newActive ? 'active' : 'drafts');
                                    fetch(`${API_BASE_URL}/api/workflows/${w.id}`, {
                                      method: 'PUT',
                                      headers: { 'Authorization': `Bearer ${user?.access_token || ''}`, 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ is_active: newActive })
                                    }).catch(console.error);
                                  }}
                                />
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {wfTab === 'drafts' && (
                    <div className="crm-fade">
                      <div style={{ marginBottom: 40 }}>
                        <div className="crm-fade" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0 20px' }}>
                          {myWorkflows.filter((w: any) => !w.is_active).length === 0 ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>No drafts or inactive workflows.</div>
                          ) : (
                            myWorkflows.filter((w: any) => !w.is_active).map((w: any) => (
                              <div className="crm-wf" key={w.id} style={{ display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #e2e8f0', opacity: 0.75 }}>
                                <span className="crm-wf-ic" style={{ background: '#F3F4F6', color: '#6B7280', padding: 8, borderRadius: 8, marginRight: 16, display: 'flex', alignItems: 'center' }}>
                                  {w.action_type === 'email' ? <Mail size={18} /> : <Phone size={18} />}
                                </span>
                                <div style={{ flex: 1 }}>
                                  <div className="nm" style={{ fontWeight: 600, color: '#4B5563', fontSize: 14 }}>{w.template_name}</div>
                                  <div className="fl" style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Triggers on {w.trigger_event}</div>
                                </div>
                                <button className="crm-btn crm-btn-ghost" style={{ padding: '6px 10px', marginRight: 8 }} onClick={() => setEditingWorkflow(w)} disabled={!canEdit}>
                                  <Edit2 size={14} />
                                </button>
                                {canEdit && <button className="crm-btn crm-btn-ghost" style={{ padding: '6px 10px', marginRight: 16, color: '#DC2626' }} onClick={() => {
                                  if (window.confirm('Delete this draft?')) {
                                    setMyWorkflows((prev: any[]) => prev.filter(old => old.id !== w.id));
                                    setToast('Workflow deleted.');
                                    setTimeout(() => setToast(null), 3000);
                                  }
                                }}>
                                  <Trash2 size={14} />
                                </button>}
                                <button 
                                  className={`crm-switch${w.is_active ? ' on' : ''}`} 
                                  disabled={!canEdit}
                                  onClick={() => {
                                    const newActive = !w.is_active;
                                    setMyWorkflows(prev => prev.map(old => old.id === w.id ? { ...old, is_active: newActive } : old));
                                    setWfTab(newActive ? 'active' : 'drafts');
                                    fetch(`${API_BASE_URL}/api/workflows/${w.id}`, {
                                      method: 'PUT',
                                      headers: { 'Authorization': `Bearer ${user?.access_token || ''}`, 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ is_active: newActive })
                                    }).catch(console.error);
                                  }}
                                />
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            )}

            {showWorkflowTypeModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                  <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                    <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 600, color: '#111827' }}>Create a workflow</h2>
                    <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6B7280' }}>Choose the type of automated action you want to trigger.</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button onClick={() => handleSelectType('email')} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', background: '#fff', cursor: 'pointer', textAlign: 'left' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '8px', background: '#F3E8FF', color: '#7d3bec', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Mail size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>Email Workflow</div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>Send an automated email</div>
                        </div>
                      </button>

                      <button onClick={() => handleSelectType('sms')} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', background: '#fff', cursor: 'pointer', textAlign: 'left' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '8px', background: '#F3E8FF', color: '#7d3bec', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Phone size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>SMS Workflow</div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>Send a text message</div>
                        </div>
                      </button>

                      <button onClick={() => handleSelectType('voice')} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', background: '#fff', cursor: 'pointer', textAlign: 'left' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '8px', background: '#F3E8FF', color: '#7d3bec', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Zap size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>AI Voice Workflow</div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>Have an AI call the attendee</div>
                        </div>
                      </button>
                    </div>

                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={() => setShowWorkflowTypeModal(false)} style={{ background: 'none', border: 'none', padding: '8px 16px', fontSize: '14px', fontWeight: 500, color: '#6B7280', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}


    </>
  );
}
