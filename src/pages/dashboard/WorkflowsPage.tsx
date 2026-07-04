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
  } = ctx || {};

  return (
    <>
      {editingWorkflow ? (
                <WorkflowEditor 
                  initialDraft={editingWorkflow} 
                  onSave={handleSaveWorkflow} 
                  onCancel={() => setEditingWorkflow(null)} 
                  eventTypes={eventTypes}
                />
              ) : (
                <div className="crm-fade">
                  {myWorkflows.length === 0 ? (
                    <div className="crm-card" style={{ padding: '64px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: 'none', marginBottom: '32px' }}>
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                        <Zap size={28} />
                      </div>
                      <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: '0 0 12px' }}>Create your first workflow</h2>
                      <p style={{ color: '#6B7280', fontSize: '14px', maxWidth: 400, margin: '0 0 24px', lineHeight: 1.5 }}>
                        Workflows automate notifications and reminders, helping you build processes around your events.
                      </p>
                      <button className="crm-btn" style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: '6px', padding: '0 20px', height: '40px', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => handleCreateWorkflow(null)}>
                        <Plus size={16} /> Create
                      </button>
                    </div>
                  ) : (
                  <div style={{ marginBottom: 32 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: 16 }}>Your Active Workflows</h3>
                    <div className="crm-fade" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0 20px' }}>
                      {myWorkflows.map((w: any) => (
                        <div className="crm-wf" key={w.id} style={{ display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #e2e8f0' }}>
                          <span className="crm-wf-ic" style={{ background: '#EFF6FF', color: '#2563EB', padding: 8, borderRadius: 8, marginRight: 16, display: 'flex', alignItems: 'center' }}>
                            {w.action_type === 'email' ? <Mail size={18} /> : <Phone size={18} />}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div className="nm" style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{w.template_name}</div>
                            <div className="fl" style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Triggers on {w.trigger_event}</div>
                          </div>
                          <span className="runs" style={{ fontSize: 13, color: '#64748b', marginRight: 24 }}>{w.runs} runs</span>
                          <button 
                            className={`crm-switch${w.is_active ? ' on' : ''}`} 
                            onClick={() => {
                              const newActive = !w.is_active;
                              setMyWorkflows(prev => prev.map(old => old.id === w.id ? { ...old, is_active: newActive } : old));
                              fetch(`${API_BASE_URL}/api/workflows/${w.id}`, {
                                method: 'PUT',
                                headers: { 'Authorization': `Bearer ${user?.access_token || ''}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify({ is_active: newActive })
                              }).catch(console.error);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: 40 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: 16 }}>LinksMeet AI templates</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                    {[
                      { title: "Call to confirm booking", desc: "2 hrs before event starts", Icon: Phone, Badge: Clock, badgeColor: "#10B981" },
                      { title: "Follow up with no shows", desc: "30m after event ends", Icon: Mail, Badge: XCircle, badgeColor: "#EF4444" },
                      { title: "Remind attendees to bring ID", desc: "1 day before event starts", Icon: Mail, Badge: AlertCircle, badgeColor: "#F59E0B" }
                    ].map(t => (
                      <div key={t.title} onClick={() => handleCreateWorkflow(t)} style={{ display: 'flex', flexDirection: 'column', padding: '24px', border: '1px solid #E5E7EB', borderRadius: '8px', background: '#FFFFFF', cursor: 'pointer', transition: 'box-shadow 0.2s', minHeight: '200px' }} className="crm-wf-card-new">
                        <div style={{ position: 'relative', width: '40px', height: '40px', marginBottom: '16px' }}>
                          <t.Icon size={40} color="#9CA3AF" strokeWidth={1} />
                          <div style={{ position: 'absolute', top: '0px', right: '0px', background: '#fff', borderRadius: '50%', padding: '2px' }}>
                            <div style={{ background: t.badgeColor, borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <t.Badge size={10} color="#fff" strokeWidth={3} />
                            </div>
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>{t.title}</div>
                          <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.4 }}>{t.desc}</div>
                        </div>
                        <div style={{ alignSelf: 'flex-end', marginTop: '24px' }}>
                          <button className="crm-btn crm-btn-primary" style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 600 }}>Add automation</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: 16 }}>Standard templates</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                    {[
                      { title: "Email reminder to host", desc: "Never miss an event — get automated email reminders", Icon: Mail, Badge: Clock, badgeColor: "#10B981" },
                      { title: "Email reminder to invitee", desc: "Reduce no-shows — send automated email reminders to invitees", Icon: Mail, Badge: Clock, badgeColor: "#10B981" },
                      { title: "Send thank you email", desc: "Build relationships with a quick thanks", Icon: Mail, Badge: Heart, badgeColor: "#F97316" },
                      { title: "Email additional resources", desc: "Send links for additional resources to your invitees", Icon: Mail, Badge: Link2, badgeColor: "#3B82F6" },
                      { title: "Email reminder to someone else", desc: "Prompt non-attendees so they can help prepare for your meeting", Icon: Mail, Badge: AlertCircle, badgeColor: "#F59E0B" },
                      { title: "Request follow-up meeting", desc: "Don't wait to meet again", Icon: Mail, Badge: RefreshCw, badgeColor: "#8B5CF6" },
                      { title: "Email your own feedback survey", desc: "Email a survey link from a third party like Typeform or Google Forms to get feedback from invitees after your event", Icon: Mail, Badge: Pencil, badgeColor: "#EC4899" },
                      { title: "Email no-shows to book a new time", desc: "Follow up with invitees who didn't show up to the meeting", Icon: Mail, Badge: XCircle, badgeColor: "#F97316" },
                      { title: "Text reminder to host", desc: "Never miss an event — set automated text reminders", Icon: Smartphone, Badge: Clock, badgeColor: "#10B981" },
                      { title: "Email follow-up to someone else", desc: "Notify non-attendees so they can support your meeting next steps", Icon: Mail, Badge: AlertCircle, badgeColor: "#F59E0B" },
                      { title: "Text booking confirmation to host", desc: "Keep hosts up-to-date with scheduled events", Icon: Smartphone, Badge: CheckCircle2, badgeColor: "#3B82F6" },
                      { title: "Text cancellation notification to host", desc: "Keep hosts up-to-date with canceled events", Icon: Smartphone, Badge: XCircle, badgeColor: "#EF4444" },
                      { title: "Text reminder to invitee", desc: "Reduce no-shows — send automated text reminders to invitees", Icon: Smartphone, Badge: Clock, badgeColor: "#10B981" },
                      { title: "Text booking confirmation to invitee", desc: "Let invitees know their event is scheduled", Icon: Smartphone, Badge: CheckCircle2, badgeColor: "#3B82F6" },
                      { title: "Text cancellation notification to invitee", desc: "Let invitees know as soon as an event is cancelled", Icon: Smartphone, Badge: XCircle, badgeColor: "#EF4444" },
                      { title: "Email cancellation notification to someone else", desc: "Update non-attendees so they can try to reschedule your meeting", Icon: Mail, Badge: AlertCircle, badgeColor: "#F59E0B" },
                      { title: "Text follow-up to invitee", desc: "Finish up by texting your invitees after an event", Icon: Smartphone, Badge: RefreshCw, badgeColor: "#8B5CF6" },
                      { title: "Email invitee to reconfirm", desc: "Reduce no-shows by asking your invitees to reconfirm they will attend your event", Icon: Mail, Badge: HelpCircle, badgeColor: "#F59E0B" },
                      { title: "Text invitee to reconfirm", desc: "Reduce no-shows by asking your invitees to reconfirm they will attend your event", Icon: Smartphone, Badge: HelpCircle, badgeColor: "#F59E0B" }
                    ].map((t, i) => (
                      <div key={i} onClick={() => handleCreateWorkflow(t)} style={{ display: 'flex', flexDirection: 'column', padding: '24px', border: '1px solid #E5E7EB', borderRadius: '8px', background: '#FFFFFF', cursor: 'pointer', transition: 'box-shadow 0.2s', minHeight: '200px' }} className="crm-wf-card-new">
                        <div style={{ position: 'relative', width: '40px', height: '40px', marginBottom: '16px' }}>
                          <t.Icon size={40} color="#9CA3AF" strokeWidth={1} />
                          <div style={{ position: 'absolute', top: '0px', right: '0px', background: '#fff', borderRadius: '50%', padding: '2px' }}>
                            <div style={{ background: t.badgeColor, borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <t.Badge size={10} color="#fff" strokeWidth={3} />
                            </div>
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>{t.title}</div>
                          <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.4 }}>{t.desc}</div>
                        </div>
                        <div style={{ alignSelf: 'flex-end', marginTop: '24px' }}>
                          <button className="crm-btn crm-btn-primary" style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 600 }}>Add automation</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {showWorkflowTypeModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                  <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                    <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 600, color: '#111827' }}>Create a workflow</h2>
                    <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6B7280' }}>Choose the type of automated action you want to trigger.</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button onClick={() => handleSelectType('email')} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', background: '#fff', cursor: 'pointer', textAlign: 'left' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Mail size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>Email Workflow</div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>Send an automated email</div>
                        </div>
                      </button>

                      <button onClick={() => handleSelectType('sms')} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', background: '#fff', cursor: 'pointer', textAlign: 'left' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Phone size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>SMS Workflow</div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>Send a text message</div>
                        </div>
                      </button>

                      <button onClick={() => handleSelectType('voice')} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', background: '#fff', cursor: 'pointer', textAlign: 'left' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
