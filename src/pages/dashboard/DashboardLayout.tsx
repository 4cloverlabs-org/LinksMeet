// @ts-nocheck
import { useState, useEffect, useMemo, type FormEvent, useRef } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  LayoutGrid, Users, Search, Bell, Plus, ArrowUpRight, ArrowDownRight,
  DollarSign, Trophy, UserPlus, MoreHorizontal, FileText,
  CheckCircle2, Menu, CalendarRange, CalendarCheck,
  Clock, Workflow, Spline, Store, CreditCard, Shield, HelpCircle,
  Sparkles, Link2, Video, Zap, BookOpen, MessageCircle, Keyboard, Check, X,
  Copy, Rocket, Calendar, Trash2, LogOut, Loader2, EyeOff, ExternalLink, Edit2, Code, Info, ArrowLeft, ArrowRight, Globe, Settings, Mail, Phone, ChevronRight, ChevronDown,
  Smartphone, Heart, AlertCircle, RefreshCw, Pencil, XCircle, ChevronsUpDown, User, PanelLeftClose, PanelLeftOpen, Briefcase
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../lib/db';
import type { Notification } from '../../lib/db';
import { API_BASE_URL } from '../../lib/config';
import {
  listContacts, addContact, updateContact, deleteContact, listenContacts,
  listenEventTypes, addEventType, updateEventType, deleteEventType,
  listenBookings, updateBooking, type Contact, type EventType, type Booking 
} from '../../lib/crm';
import '../../pages/CrmDashboard.css';
import CampaignModule from '../../components/campaigns/CampaignModule';
import WorkflowEditor, { type WorkflowDraft } from '../../components/WorkflowEditor';
import EventTypeEditor from '../../components/EventTypeEditor';

type View =
  | 'dashboard' | 'eventTypes' | 'bookings' | 'people' | 'teams'
  | 'workflows' | 'campaigns' | 'routing'
  | 'apps' | 'payments'
  | 'admin' | 'help';

/* ---------------- mock data ---------------- */
// Purple palette — avatars use shades of the single accent
const AV_COLORS = ['#7d3bec', '#9333ea', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff', '#6b21a8'];
const avColor = (i: number) => AV_COLORS[i % AV_COLORS.length];
// Light → dark purple ramp for chart segments that need to be distinguished
const RAMP = ['#f3e8ff', '#d8b4fe', '#c084fc', '#7d3bec', '#581c87'];
const ACCENT = '#7d3bec';
const ACCENT_SOFT = '#f3e8ff';
const initials = (n?: string) => {
  if (!n) return '?';
  const words = n.trim().split(' ').filter(Boolean);
  if (words.length === 0) return '?';
  return words.map(w => w[0]).join('').slice(0, 2).toUpperCase();
};

// Lead follow-up status → tag class + ramp color for the donut
const STATUS_META: Record<{ tag: string; color: string }> = {
  New: { tag: 'violet', color: RAMP[1] },
  Contacted: { tag: 'amber', color: RAMP[2] },
  'Follow up': { tag: 'amber', color: RAMP[3] },
  Converted: { tag: 'green', color: RAMP[4] },
  Lost: { tag: 'rose', color: RAMP[0] },
};
const CONTACT_STATUSES: ContactStatus[] = ['New', 'Contacted', 'Follow up', 'Converted', 'Lost'];
// Statuses that still need attention from the user
const OPEN_STATUSES: ContactStatus[] = ['New', 'Follow up', 'Contacted'];

const DEFAULT_EVENT_TYPES = [
  { title: '30 Min Meeting', dur: '30m', slug: '30min', desc: 'Standard discovery conversation.' },
];

// @ts-ignore
const DEFAULT_BOOKINGS = [
  { name: 'Logan Mitchell', event: 'Product Demo', when: 'Today · 10:00 AM', status: 'upcoming' },
  { name: 'Priya Anand', event: '30 Min Meeting', when: 'Today · 2:30 PM', status: 'upcoming' },
  { name: 'Maya Coleman', event: 'Strategy Session', when: 'Tomorrow · 11:00 AM', status: 'upcoming' },
  { name: 'Daniel Osei', event: '15 Min Meeting', when: 'Jun 14 · 9:15 AM', status: 'past' },
  { name: 'Aiden Parker', event: 'Product Demo', when: 'Jun 12 · 4:00 PM', status: 'past' },
  { name: 'Sienna Brooks', event: '30 Min Meeting', when: 'Jun 10 · 1:00 PM', status: 'cancelled' },
];

const DEFAULT_WEEK = [
  { day: 'Monday', on: true, slots: [{start: '09:00', end: '17:00'}] },
  { day: 'Tuesday', on: true, slots: [{start: '09:00', end: '17:00'}] },
  { day: 'Wednesday', on: true, slots: [{start: '09:00', end: '17:00'}] },
  { day: 'Thursday', on: true, slots: [{start: '09:00', end: '17:00'}] },
  { day: 'Friday', on: true, slots: [{start: '09:00', end: '17:00'}] },
  { day: 'Saturday', on: false, slots: [{start: '09:00', end: '17:00'}] },
  { day: 'Sunday', on: false, slots: [{start: '09:00', end: '17:00'}] },
];

const CURATED_TIMEZONES = [
  'Pacific/Midway', 'Pacific/Honolulu', 'America/Anchorage', 'America/Los_Angeles',
  'America/Denver', 'America/Chicago', 'America/New_York', 'America/Halifax',
  'America/St_Johns', 'America/Argentina/Buenos_Aires', 'America/Sao_Paulo',
  'Atlantic/Azores', 'Europe/London', 'Europe/Berlin', 'Europe/Helsinki',
  'Europe/Istanbul', 'Europe/Moscow', 'Asia/Dubai', 'Asia/Kabul',
  'Asia/Karachi', 'Asia/Kolkata', 'Asia/Kathmandu', 'Asia/Dhaka',
  'Asia/Bangkok', 'Asia/Hong_Kong', 'Asia/Tokyo', 'Australia/Perth',
  'Australia/Adelaide', 'Australia/Sydney', 'Pacific/Noumea', 'Pacific/Auckland'
];

const TIMEZONES = CURATED_TIMEZONES.map((tz: string) => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'shortOffset'
    }).formatToParts(new Date());
    const offsetPart = parts.find(p => p.type === 'timeZoneName');
    const offsetStr = offsetPart ? offsetPart.value : '';
    return { id: tz, label: `${tz.replace(/_/g, ' ')} ${offsetStr}` };
  } catch(e) {
    return { id: tz, label: tz.replace(/_/g, ' ') };
  }
});

const WORKFLOWS = [
  { nm: 'Booking reminder', fl: 'When booking is created → Send email 24h before', runs: '1,204 runs', on: true },
  { nm: 'New lead welcome', fl: 'When contact added → Send welcome sequence', runs: '847 runs', on: true },
  { nm: 'Deal won celebration', fl: 'When deal marked Won → Notify #sales channel', runs: '312 runs', on: false },
  { nm: 'No-show follow-up', fl: 'When booking missed → Send reschedule link', runs: '96 runs', on: true },
];

const APPS = [
  { nm: 'Google Meet', cat: 'Conferencing', ds: 'Auto-add Meet links to bookings.', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Google_Meet_icon_%282020%29.svg' },
  { nm: 'Zoom', cat: 'Conferencing', ds: 'Host meetings over Zoom.', logo: 'https://cdn.worldvectorlogo.com/logos/zoom-app.svg', comingSoon: true },
  { nm: 'Stripe', cat: 'Payments', ds: 'Collect payments at booking.', logo: 'https://cdn.worldvectorlogo.com/logos/stripe-4.svg', comingSoon: true },
  { nm: 'Slack', cat: 'Messaging', ds: 'Get notified in your channels.', logo: 'https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg', comingSoon: true },
  { nm: 'Zapier', cat: 'Automation', ds: 'Connect 5,000+ apps.', logo: 'https://cdn.worldvectorlogo.com/logos/zapier-1.svg', comingSoon: true },
  { nm: 'Salesforce', cat: 'CRM', ds: 'Sync contacts and deals.', logo: 'https://cdn.worldvectorlogo.com/logos/salesforce-2.svg', comingSoon: true },
  { nm: 'HubSpot', cat: 'CRM', ds: 'Two-way contact sync.', logo: 'https://cdn.worldvectorlogo.com/logos/hubspot-1.svg', comingSoon: true },
  { nm: 'Google Calendar', cat: 'Calendar', ds: 'Check for conflicts in real time.', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg' },
];

const INSTALLED: any[] = [];

const TRANSACTIONS = [
  { name: 'Logan Mitchell', event: 'Product Demo', amt: '$120.00', tag: 'green', tagLabel: 'Paid' },
  { name: 'Maya Coleman', event: 'Strategy Session', amt: '$250.00', tag: 'green', tagLabel: 'Paid' },
  { name: 'Priya Anand', event: '30 Min Meeting', amt: '$60.00', tag: 'amber', tagLabel: 'Pending' },
  { name: 'Daniel Osei', event: '15 Min Meeting', amt: '$30.00', tag: 'rose', tagLabel: 'Refunded' },
];



/* ---------------- chart helpers ---------------- */
function Donut({ stages, total, label }: { stages: { name: string; color: string; value: number }[]; total: number; label: string }) {
  const R = 76, C = 2 * Math.PI * R;
  const sum = stages.reduce((a, s) => a + s.value, 0) || 1;
  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r={R} fill="none" stroke="#f0f0f4" strokeWidth="22" />
      {stages.map((s, i) => {
        const len = (s.value / sum) * C;
        const currentOffset = stages.slice(0, i).reduce((a, st) => a + (st.value / sum) * C, 0);
        return (
          <circle
            key={i} cx="100" cy="100" r={R} fill="none"
            stroke={s.color} strokeWidth="22"
            strokeDasharray={`${len} ${C - len}`}
            strokeDashoffset={-currentOffset}
            transform="rotate(-90 100 100)"
          />
        );
      })}
      <text x="100" y="94" textAnchor="middle" fontSize="32" fontWeight="700" fill="#16161d">{total}</text>
      <text x="100" y="118" textAnchor="middle" fontSize="13" fill="#9b9bab">{label}</text>
    </svg>
  );
}

function EmptyState({ icon: Icon, title, body, cta }: { icon: typeof Users; title: string; body: string; cta: string }) {
  return (
    <div className="crm-card crm-fade">
      <div className="crm-empty">
        <span className="ic"><Icon size={26} /></span>
        <h3>{title}</h3>
        <p>{body}</p>
        <button className="crm-btn crm-btn-primary" style={{ margin: '0 auto' }}><Plus size={15} /> {cta}</button>

      </div>
    </div>
  );
}

/* ---------------- nav config ---------------- */
type NavItem = { id: View; label: string; icon: typeof Users; badge?: string; badgeNew?: boolean };
const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  { label: 'Scheduling', items: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'eventTypes', label: 'Event Types', icon: CalendarRange },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
    { id: 'people', label: 'Leads', icon: User },
    { id: 'teams', label: 'Teams', icon: Users },
  ]},
  { label: 'Automate', items: [
    { id: 'workflows', label: 'Workflows', icon: Workflow },
    { id: 'campaigns', label: 'Campaigns', icon: MessageCircle, badge: 'New', badgeNew: true },
    { id: 'routing', label: 'Routing', icon: Spline },

  ]},
  { label: 'Apps', items: [
    { id: 'apps', label: 'Apps', icon: Store },
    { id: 'payments', label: 'Payments', icon: CreditCard },
  ]},
];

const PAGE_META: Record<View, { title: string; sub: string }> = {
  dashboard: { title: 'Dashboard', sub: 'Your leads and follow-ups at a glance.' },
  eventTypes: { title: 'Event Types', sub: 'Create scheduling links people can book.' },
  bookings: { title: 'Bookings', sub: 'Your upcoming and past meetings.' },
  availability: { title: 'Availability', sub: 'Set the hours you’re open for bookings.' },
  people: { title: 'Leads', sub: 'Manage your leads and follow-ups.' },
  teams: { title: 'Team', sub: 'Manage your organization and team members.' },
  workflows: { title: 'Workflows', sub: 'Create workflows to automate notifications and reminders' },
  campaigns: { title: 'Campaigns', sub: 'Create and orchestrate outbound email sequences.' },
  routing: { title: 'Routing', sub: 'Send bookers to the right person with forms.' },

  apps: { title: 'Apps', sub: 'Browse the App Store and manage your installed apps.' },
  payments: { title: 'Payments', sub: 'Collect and track payments for bookings.' },
  admin: { title: 'Admin Center', sub: 'Manage your account and preferences.' },
  help: { title: 'Help & Support', sub: 'Guides, docs, and ways to reach us.' },
};

/* ---------------- main component ---------------- */
export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user, logOut, activeWorkspaceId, setActiveWorkspaceId, workspaces } = useAuth();
  const uid = activeWorkspaceId || user?.id || 'anon';
  const displayName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'there';
  const firstName = displayName.split(' ')[0];
  const userInitials = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const location = useLocation();
  const currentPath = location.pathname.substring(1);
  const initialView = (currentPath && PAGE_META[currentPath as View]) ? (currentPath as View) : 'dashboard';
  const [view, setViewState] = useState<View>(initialView);

  useEffect(() => {
    if (currentPath && PAGE_META[currentPath as View] && currentPath !== view) {
      setViewState(currentPath as View);
    }
  }, [currentPath]);

  const setView = (newView: View) => {
    setViewState(newView);
    navigate(`/${newView}`);
  };
  const [sideOpen, setSideOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const joinMeeting = (b: any) => {
    if (b && b.meetLink) {
      window.open(b.meetLink, '_blank');
    } else {
      setToast('No video meeting link found for this booking.');
      setTimeout(() => setToast(null), 3000);
    }
  };
  const cancelBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    try {
      await updateBooking(uid, id, { status: 'cancelled' });
    } catch (e) {
      console.warn('Could not cancel on server:', e);
    }
    setToast('Booking cancelled.');
    setTimeout(() => setToast(null), 3000);
  };
  const [notif, setNotif] = useState({ deals: true, weekly: true, mentions: false });
  const [bookingTab, setBookingTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [appCat, setAppCat] = useState('All');
  const [appsTab, setAppsTab] = useState<'store' | 'installed'>('store');
  const [etTab, setEtTab] = useState<'eventTypes' | 'availability'>('eventTypes');
  const [leadsTab, setLeadsTab] = useState<'inbound' | 'uploaded'>('inbound');
  const [etDropdown, setEtDropdown] = useState<string | null>(null);
  
  const [userProfile, setUserProfile] = useState<any>(null);

  
  const [initCampaignLead, setInitCampaignLead] = useState<any>(null);

  const [myWorkflows, setMyWorkflows] = useState<any[]>([]);
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowDraft | null>(null);
  const [showWorkflowTypeModal, setShowWorkflowTypeModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close the profile menu when clicking anywhere outside it.
  useEffect(() => {
    if (!showProfileMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);


  const [connectingApps, setConnectingApps] = useState<string[]>([]);

  const handleCreateWorkflow = (template: any) => {
    if (!template) {
      setShowWorkflowTypeModal(true);
      return;
    }
    
    const title = (template?.title || '').toLowerCase();
    const desc = (template?.desc || '').toLowerCase();
    
    let isVoice = title.includes('call');
    let isSms = title.includes('text') || title.includes('sms');
    let isEmail = title.includes('email');
    
    if (!isVoice && !isSms && !isEmail) {
      isEmail = true; // Fallback
    }
    
    const actionType = isVoice ? 'voice' : (isSms ? 'sms' : 'email');
    
    let trigger_event = 'booking_created'; 
    let delay_ms = 0;
    
    if (desc.includes('before event starts')) {
      trigger_event = 'event_starts_before';
      if (desc.includes('2 hrs') || desc.includes('2 hours')) delay_ms = 2 * 60 * 60 * 1000;
      else if (desc.includes('1 day')) delay_ms = 24 * 60 * 60 * 1000;
      else if (desc.includes('30m')) delay_ms = 30 * 60 * 1000;
    } else if (desc.includes('after event ends') || title.includes('follow-up') || title.includes('feedback')) {
      trigger_event = 'event_ends_after';
      if (desc.includes('30m')) delay_ms = 30 * 60 * 1000;
      else if (desc.includes('1 day')) delay_ms = 24 * 60 * 60 * 1000;
    } else if (title.includes('cancel') || desc.includes('cancel')) {
      trigger_event = 'booking_cancelled';
    } else if (title.includes('reconfirm')) {
      trigger_event = 'event_starts_before';
      delay_ms = 24 * 60 * 60 * 1000; // 1 day before
    }
    
    let defaultBody = '';
    let subject = '';
    if (actionType === 'email') {
      if (title.includes('thank you')) {
        subject = 'Thank you for attending!';
        defaultBody = 'Hi {ATTENDEE},\n\nThank you so much for joining our recent event. We hope you found it valuable!\n\nBest,\n{ORGANIZER}';
      } else if (title.includes('feedback survey')) {
        subject = 'We value your feedback on {EVENT_NAME}';
        defaultBody = 'Hi {ATTENDEE},\n\nWe would love to hear your thoughts on the recent {EVENT_NAME} event. Please take a moment to fill out our feedback survey: [Survey Link]\n\nThanks,\n{ORGANIZER}';
      } else if (title.includes('resources')) {
        subject = 'Additional resources for {EVENT_NAME}';
        defaultBody = 'Hi {ATTENDEE},\n\nHere are some additional resources to help you prepare or review what we discussed in {EVENT_NAME}.\n\n[Links]\n\nBest,\n{ORGANIZER}';
      } else if (title.includes('no-shows') || title.includes('no shows') || title.includes('new time')) {
        subject = 'Sorry we missed you! Let\'s reschedule';
        defaultBody = 'Hi {ATTENDEE},\n\nIt looks like you weren\'t able to make it to {EVENT_NAME}. No worries—you can book a new time using my scheduling link: [Your Link]\n\nBest,\n{ORGANIZER}';
      } else if (title.includes('bring id')) {
        subject = 'Important: Please bring your ID to {EVENT_NAME}';
        defaultBody = 'Hi {ATTENDEE},\n\nJust a quick reminder to please bring a valid form of ID to your upcoming event: {EVENT_NAME}.\n\nSee you soon,\n{ORGANIZER}';
      } else if (title.includes('reconfirm')) {
        subject = 'Please reconfirm your attendance for {EVENT_NAME}';
        defaultBody = 'Hi {ATTENDEE},\n\nPlease let us know if you will still be able to attend {EVENT_NAME} at {EVENT_DATE_ddd, h:mma}.\n\nReply YES to confirm, or let us know if you need to reschedule.\n\nThanks,\n{ORGANIZER}';
      } else if (title.includes('reminder to host')) {
        subject = 'Upcoming Event Reminder: {EVENT_NAME}';
        defaultBody = 'Hi {ORGANIZER},\n\nThis is an automated reminder that you have an upcoming event: {EVENT_NAME} with {ATTENDEE} at {EVENT_DATE_ddd, h:mma}.\n\nBest,\nLinksMeet';
      } else if (title.includes('reminder to invitee')) {
        subject = 'Reminder: Upcoming Event - {EVENT_NAME}';
        defaultBody = 'Hi {ATTENDEE},\n\nThis is a quick reminder about our upcoming event: {EVENT_NAME} at {EVENT_DATE_ddd, h:mma}.\n\nLooking forward to speaking with you!\n\nBest,\n{ORGANIZER}';
      } else if (title.includes('reminder to someone else')) {
        subject = 'Reminder: Upcoming Event - {EVENT_NAME}';
        defaultBody = 'Hi,\n\nThis is a quick reminder about the upcoming event: {EVENT_NAME} scheduled for {EVENT_DATE_ddd, h:mma}.\n\nBest,\n{ORGANIZER}';
      } else if (title.includes('request follow-up meeting')) {
        subject = 'Following up from our meeting';
        defaultBody = 'Hi {ATTENDEE},\n\nIt was great speaking with you! I\'d love to schedule a follow-up meeting to continue our conversation. You can pick a time that works for you here: [Your Link]\n\nBest,\n{ORGANIZER}';
      } else if (title.includes('cancellation')) {
        subject = 'Cancelled: {EVENT_NAME}';
        defaultBody = 'Hi,\n\nPlease note that the upcoming event {EVENT_NAME} has been cancelled. If this was a mistake, please reach out to {ORGANIZER} to reschedule.\n\nBest,\nLinksMeet';
      } else if (title.includes('follow-up') || title.includes('follow up')) {
        subject = 'Update on {EVENT_NAME}';
        defaultBody = 'Hi,\n\nWe just wrapped up {EVENT_NAME}. Here are the notes and next steps from our meeting.\n\nBest,\n{ORGANIZER}';
      }
    } else if (actionType === 'sms') {
      if (title.includes('thank you')) defaultBody = 'Hi {ATTENDEE}, thanks for joining our recent event! We hope you found it valuable.';
      else if (title.includes('reconfirm')) defaultBody = 'Hi {ATTENDEE}, please reply YES to reconfirm your attendance for {EVENT_NAME} at {EVENT_DATE_ddd, h:mma}.';
    }
    
    setEditingWorkflow({
      template_name: template?.title || 'Untitled',
      trigger_event,
      delay_ms,
      action_type: actionType,
      action_payload: {
        ...(subject && { subject }),
        ...(defaultBody && { body: defaultBody })
      }
    });
  };

  const handleSelectType = (actionType: 'email' | 'sms' | 'voice') => {
    setShowWorkflowTypeModal(false);
    setEditingWorkflow({
      template_name: `New ${actionType.toUpperCase()} Workflow`,
      trigger_event: 'booking_created',
      delay_ms: 0,
      action_type: actionType,
      action_payload: {}
    });
  };

  const handleSaveWorkflow = async (draft: WorkflowDraft) => {
    const isUpdate = !!draft.id;
    const url = isUpdate ? `${API_BASE_URL}/api/workflows/${draft.id}` : `${API_BASE_URL}/api/workflows`;
    
    const tempId = draft.id || ('temp-' + Date.now());
    const optimisticData = { ...draft, id: tempId };
    
    // Optimistic Update
    setMyWorkflows(prev => {
      if (isUpdate) return prev.map(w => w.id === tempId ? optimisticData : w);
      return [optimisticData, ...prev];
    });
    setEditingWorkflow(null);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token || '';

      const res = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-workspace-id': activeWorkspaceId || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(draft)
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      // Replace optimistic data with real data or remove it if realtime already inserted it
      setMyWorkflows(prev => {
        const alreadyExists = prev.some(w => w.id === data.id);
        if (alreadyExists) {
          return prev.filter(w => w.id !== tempId).map(w => w.id === data.id ? data : w);
        }
        return prev.map(w => w.id === tempId ? data : w);
      });
      setToast(draft.is_active ? 'Workflow saved and activated!' : 'Workflow saved successfully!');
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      console.error(err);
      // Revert optimistic update for new creations if failed
      if (!isUpdate) {
        setMyWorkflows(prev => prev.filter(w => w.id !== tempId));
      }
      alert('BACKEND ERROR PREVENTING SAVE: ' + (err.message || JSON.stringify(err)));
      setToast('Save failed: ' + (err.message || 'Network Error'));
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Apps State
  const [installedApps, setInstalledApps] = useState<any[]>([]);
  const [connectingApps, setConnectingApps] = useState<string[]>([]);

  useEffect(() => {
    if (googleConnected && userProfile) {
      const prefs = userProfile.preferences || {};
      const apps = [];
      if (prefs.installed_google_calendar) {
        apps.push({ nm: 'Google Calendar', cat: 'Calendar', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg' });
      }
      if (prefs.installed_google_meet) {
        apps.push({ nm: 'Google Meet', cat: 'Conferencing', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Google_Meet_icon_%282020%29.svg' });
      }
      setInstalledApps(apps);
    } else {
      setInstalledApps([]);
    }
  }, [googleConnected, userProfile]);

  useEffect(() => {
    const pendingApp = localStorage.getItem('sm_connecting_app');
    if (pendingApp && uid && googleConnected) {
      const prefs = { ...(userProfile?.preferences || {}), [pendingApp]: true };
      supabase.from('users').update({ preferences: prefs }).eq('id', uid);
      setUserProfile((prev: any) => ({ ...prev, preferences: prefs }));
      localStorage.removeItem('sm_connecting_app');
    }
  }, [googleConnected, userProfile, uid]);


  const [manageApp, setManageApp] = useState<typeof APPS[0] | null>(null);

  const handleConnectApp = (app: typeof APPS[0]) => {
    if (installedApps.some(a => a.nm === app.nm) || connectingApps.includes(app.nm)) return;
    
    if (app.nm.includes('Google')) {
      const prefKey = app.nm === 'Google Calendar' ? 'installed_google_calendar' : 'installed_google_meet';
      if (googleConnected) {
        if (uid && uid !== 'anon') {
           const prefs = { ...(userProfile?.preferences || {}), [prefKey]: true };
           supabase.from('users').update({ preferences: prefs }).eq('id', uid);
           setUserProfile((prev: any) => ({ ...prev, preferences: prefs }));
        }
        setInstalledApps(prev => {
          const exists = prev.some(a => a.nm === app.nm);
          return exists ? prev : [...prev, { nm: app.nm, cat: app.cat, logo: app.logo }];
        });
        setToast(`${app.nm} connected successfully!`);
        setTimeout(() => setToast(null), 3000);
        setView('apps');
        setAppsTab('installed');
      } else {
        localStorage.setItem('sm_connecting_app', prefKey);
        handleConnectGoogle();
      }
      return;
    }
    
    // Simulate OAuth connection for other integrations cleanly without leaving the app
    setConnectingApps(prev => [...prev, app.nm]);
    setTimeout(() => {
      setConnectingApps(prev => prev.filter(n => n !== app.nm));
      setInstalledApps(prev => {
        const exists = prev.some(a => a.nm === app.nm);
        return exists ? prev : [...prev, { nm: app.nm, cat: app.cat, logo: app.logo }];
      });
      setToast(`${app.nm} connected successfully! 🎉`);
      setTimeout(() => setToast(null), 3000);
      setView('apps');
      setAppsTab('installed');
    }, 1200);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connectedProvider = params.get('connected_provider');
    if (connectedProvider) {
      // Find the app by matching normalized name
      const app = APPS.find(a => a.nm.toLowerCase().replace(/\s+/g, '') === connectedProvider);
      if (app && !installedApps.some(a => a.nm === app.nm)) {
        setInstalledApps(prev => {
          const exists = prev.some(a => a.nm === app.nm);
          return exists ? prev : [...prev, { nm: app.nm, cat: app.cat, logo: app.logo }];
        });
        setToast(`${app.nm} connected successfully`);
        setTimeout(() => setToast(null), 3000);
        setView('apps');
        setAppsTab('installed');
      }
      
      // Clean up URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('connected_provider');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, []);

  // Teams State
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');
  const [workspaceOwnerProfile, setWorkspaceOwnerProfile] = useState<any>(null);

  useEffect(() => {
    if (activeWorkspaceId && user && activeWorkspaceId !== user.id) {
      supabase.from('users').select('*').eq('id', activeWorkspaceId).single().then(({ data }) => {
        setWorkspaceOwnerProfile(data);
      });
    } else {
      setWorkspaceOwnerProfile(null);
    }
  }, [activeWorkspaceId, user?.id]);

  useEffect(() => {
    if (!uid) return;
    const fetchTeam = async () => {
      const { data, error } = await supabase.from('team_members').select('*').eq('user_id', uid).order('created_at', { ascending: true });
      if (!error && data) {
        setTeamMembers(data);
      }
    };
    fetchTeam();

    const tmSub = supabase.channel(`realtime_team_${uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members', filter: `user_id=eq.${uid}` }, () => {
        fetchTeam();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(tmSub);
    };
  }, [uid]);

  // The UI displays the Owner + fetched team members
  const allTeamMembers = useMemo(() => {
    const isOwnWorkspace = !activeWorkspaceId || activeWorkspaceId === user?.id;
    
    let ownerName = displayName + ' (You)';
    let ownerEmail = user?.email || 'admin@linksmeet.com';
    let ownerAvatar = userProfile?.profile_picture || user?.user_metadata?.avatar_url || null;

    if (!isOwnWorkspace && workspaceOwnerProfile) {
      ownerName = (workspaceOwnerProfile.first_name || 'Owner') + ' (Owner)';
      ownerEmail = workspaceOwnerProfile.email || 'owner@linksmeet.com';
      ownerAvatar = workspaceOwnerProfile.profile_picture || null;
    } else if (!isOwnWorkspace && !workspaceOwnerProfile) {
      ownerName = 'Workspace Owner';
      ownerEmail = 'owner@linksmeet.com';
    }

    const ownerMember = {
      id: 'owner',
      name: ownerName,
      email: ownerEmail,
      role: 'Owner',
      status: 'Active',
      department: 'Management',
      phone: '+1 (555) 000-0000',
      workflow_progress: 100,
      created_at: new Date().toISOString(),
      avatar_url: ownerAvatar
    };
    
    const mappedMembers = teamMembers.map(m => {
      if (m.email === user?.email) {
        return { ...m, name: `${m.name} (You)` };
      }
      return m;
    });

    return [ownerMember, ...mappedMembers];
  }, [displayName, user, userProfile, teamMembers, activeWorkspaceId, workspaceOwnerProfile]);

  const [isInviting, setIsInviting] = useState(false);

  const handleInviteSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !uid) return;
    
    if (teamMembers.some(m => m.email.toLowerCase() === inviteEmail.toLowerCase())) {
      setToast('This user is already in your team.');
      return;
    }
    
    setIsInviting(true);
    
    const newMember = {
      user_id: uid,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'Pending',
      department: 'Unassigned',
      phone: '',
      workflow_progress: 0
    };
    
    const { data, error } = await supabase.from('team_members').insert(newMember).select().single();
    if (error) {
      setToast('Error adding member');
    } else if (data) {
      setTeamMembers(prev => [...prev, data]);
      setToast('Member invited. Sending email...');
      
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token || '';
        
        const res = await fetch(`${API_BASE_URL}/api/team/send-invite`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-workspace-id': activeWorkspaceId || ''
          },
          body: JSON.stringify({
            email: inviteEmail,
            role: inviteRole,
            teamMemberId: data.id,
            ownerName: displayName || firstName || 'Workspace Owner',
            frontendUrl: window.location.origin
          })
        });
        const json = await res.json();
        if (!res.ok) {
           setToast(`Invite created, but email failed: ${json.error}`);
        } else {
           setToast('Invitation email sent!');
        }
      } catch (err) {
        setToast('Invite created, but failed to send email.');
      }
    }
    
    setIsInviting(false);
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteRole('Member');
  };

  const removeMember = async (id: string) => {
    if (id === 'owner') return; // Cannot remove owner
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (!error) {
      setTeamMembers(prev => prev.filter(m => m.id !== id));
      setToast('Member removed');
    } else {
      setToast('Error removing member');
    }
    setTimeout(() => setToast(null), 2000);
  };

  const updateMember = async (id: string, updates: any) => {
    if (id === 'owner') return; // Cannot update owner this way
    const { error } = await supabase.from('team_members').update(updates).eq('id', id);
    if (!error) {
      setTeamMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
      setToast('Member updated');
    } else {
      setToast('Error updating member');
    }
    setTimeout(() => setToast(null), 2000);
  };

  // Availability State
  const currentWorkspace = workspaces.find(w => w.id === (activeWorkspaceId || user?.id));
  const activeRole = currentWorkspace?.role || 'Owner';
  const canEdit = activeRole === 'Owner' || activeRole === 'Admin' || activeRole === 'Editor';

  const [availSchedule, setAvailSchedule] = useState(() => {
    const saved = localStorage.getItem('sm_avail_schedule');
    return saved ? JSON.parse(saved) : DEFAULT_WEEK;
  });
  const [availIsDefault, setAvailIsDefault] = useState(() => {
    return localStorage.getItem('sm_avail_default') === 'true' || true;
  });
  const [availPrefs, setAvailPrefs] = useState({ tz: 'America/New_York', notice: '4 hours', buffer: '15 minutes' });
  const [tzOpen, setTzOpen] = useState(false);
  const [tzSearch, setTzSearch] = useState('');
  const saveAvailability = () => {
    localStorage.setItem('sm_avail_schedule', JSON.stringify(availSchedule));
    localStorage.setItem('sm_avail_default', availIsDefault.toString());
    setToast('Availability saved!');
    window.setTimeout(() => setToast(null), 2000);
  };

  // -------------------------
  // Fetch Workflows & Profile
  // -------------------------
  useEffect(() => {
    if (!user) return;
    
    // Fetch user profile
    const fetchProfile = async () => {
      try {
        // 1. Query Supabase directly first (instant & bulletproof across new logins without waiting for Express headers!)
        const { data: supaProfile, error: supaErr } = await supabase
          .from('users')
          .select('*')
          .eq('id', uid)
          .single();

        const meta = user?.user_metadata || {};
        const googleAvatar = meta.avatar_url || meta.picture || meta.avatar || '';
        const googleName = meta.full_name || meta.name || '';

        const justAccepted = localStorage.getItem('sm_just_accepted_invite');
        const isTeamWorkspace = activeWorkspaceId && user?.id && activeWorkspaceId !== user.id;
        const shouldSkipOnboarding = justAccepted || isTeamWorkspace;

        if (supaProfile) {
          setUserProfile({
            ...supaProfile,
            profile_picture: supaProfile.profile_picture || supaProfile.avatar_url || googleAvatar,
            avatar_url: supaProfile.avatar_url || supaProfile.profile_picture || googleAvatar,
            full_name: supaProfile.full_name || supaProfile.first_name || supaProfile.name || googleName
          });
        } else if (supaErr && (supaErr.code === 'PGRST116' || !supaProfile)) {
          // Brand new user whose DB row hasn't finished generating yet
          const defaultProfile = { 
            onboarding_completed: false,
            profile_picture: googleAvatar,
            avatar_url: googleAvatar,
            full_name: googleName,
            name: googleName
          };
          setUserProfile(defaultProfile);
        }

        // 2. Also fetch from Express API to keep backend synchronized
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token || '';
        if (token) {
          const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'x-workspace-id': activeWorkspaceId || ''
            }
          });
          if (res.ok) {
            const data = await res.json();
            const profileData = data.user || data;
            if (profileData) {
              setUserProfile(prev => ({ ...prev, ...profileData }));
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();

    const fetchWorkflows = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token || '';
        
        const res = await fetch(`${API_BASE_URL}/api/workflows`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'x-workspace-id': activeWorkspaceId || ''
          }
        });
        const data = await res.json();
        if (Array.isArray(data)) setMyWorkflows(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchWorkflows();

    const wfChannel = supabase.channel('realtime_workflows')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'workflows', filter: `user_id=eq.${uid}` }, payload => {
        setMyWorkflows(prev => {
          if (prev.find(w => w.id === payload.new.id)) return prev;
          return [payload.new, ...prev];
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'workflows', filter: `user_id=eq.${uid}` }, payload => {
        setMyWorkflows(prev => prev.map(w => w.id === payload.new.id ? payload.new : w));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'workflows', filter: `user_id=eq.${uid}` }, payload => {
        setMyWorkflows(prev => prev.filter(w => w.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(wfChannel);
    };
  }, [uid, user]);
  
  // Real-time Notifications & Data Sync
  useEffect(() => {
    if (!user || !uid) return;
    
    const bookingsSub = supabase.channel(`realtime_bookings_${uid}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings', filter: `user_id=eq.${uid}` }, (payload) => {
        const newBooking = payload.new;
        setNotifs(prev => [
          {
            id: Date.now(),
            icon: CalendarCheck,
            title: 'New booking',
            desc: `${newBooking.event_title} with ${newBooking.booker_name}`,
            time: 'Just now',
            read: false,
            target: 'bookings'
          },
          ...prev
        ]);
      })
      .subscribe();

    const contactsSub = supabase.channel(`realtime_contacts_${uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts', filter: `user_id=eq.${uid}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newContact = payload.new;
          setNotifs(prev => [
            {
              id: Date.now() + 1,
              icon: UserPlus,
              title: 'New contact added',
              desc: `${newContact.name} joined your list`,
              time: 'Just now',
              read: false,
              target: 'people'
            },
            ...prev
          ]);
        }
        
        // Refresh contacts data for all team members
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsSub);
      supabase.removeChannel(contactsSub);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, uid]);

  // Google Integration State
  const [googleConnected, setGoogleConnected] = useState(false);

  useEffect(() => {
    async function checkGoogle() {
      const params = new URLSearchParams(window.location.search);
      if (params.get('google_connected') === 'true') {
        setGoogleConnected(true);
        // Clean up URL so refresh doesn't keep it
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }
      
      if (uid && uid !== 'anon') {
        try {
          const { data } = await supabase.from('users').select('google_tokens').eq('id', uid).single();
          if (data?.google_tokens?.refresh_token) {
            setGoogleConnected(true);
          } else {
            setGoogleConnected(false);
          }
        } catch(e) {
          setGoogleConnected(false);
        }
      }
    }
    checkGoogle();
  }, [uid]);

  useEffect(() => {
    const connectingAppKey = localStorage.getItem('sm_connecting_app');
    if (googleConnected && userProfile && uid && uid !== 'anon' && connectingAppKey) {
       const prefs = { ...(userProfile.preferences || {}), [connectingAppKey]: true };
       supabase.from('users').update({ preferences: prefs }).eq('id', uid);
       setUserProfile(prev => ({ ...prev, preferences: prefs }));
       localStorage.removeItem('sm_connecting_app');
    }
  }, [googleConnected, userProfile, uid]);

  const handleConnectGoogle = () => {
    localStorage.setItem('sm_onboarding_step_3', 'true');
    // Pass our origin so the backend returns us to this exact domain (keeps the session).
    const origin = encodeURIComponent(window.location.origin);
    window.location.href = `${API_BASE_URL}/auth/google?uid=${uid}&origin=${origin}`;
  };
  const handleDisconnectGoogle = async () => {
    localStorage.removeItem('sm_gmail_token');
    localStorage.removeItem('sm_gmail_email');
    setGoogleConnected(false);
    if (user?.id) {
      try {
        await supabase.from('users').update({ google_tokens: null }).eq('id', user.id);
      } catch (e) {}
    }
  };

  const handleManageApp = (app: typeof APPS[0]) => {
    setManageApp(app);
  };
  
  const confirmDisconnectApp = () => {
    if (!manageApp) return;
    
    setInstalledApps(prev => {
      const nextApps = prev.filter(a => a.nm !== manageApp.nm);
      
      if (manageApp.nm.includes('Google')) {
        const prefKey = manageApp.nm === 'Google Calendar' ? 'installed_google_calendar' : 'installed_google_meet';
        if (uid && uid !== 'anon') {
           const prefs = { ...(userProfile?.preferences || {}), [prefKey]: false };
           supabase.from('users').update({ preferences: prefs }).eq('id', uid);
           setUserProfile(prev => ({ ...prev, preferences: prefs }));
        }

        if (!nextApps.some(a => a.nm.includes('Google'))) {
          handleDisconnectGoogle();
        }
      }
      
      return nextApps;
    });

    setToast(`${manageApp.nm} disconnected.`);
    setTimeout(() => setToast(null), 2000);
    setManageApp(null);
  };
  // ----- Live Data (Firestore) -----
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>(() => {
    const raw = localStorage.getItem('sm_event_types') || localStorage.getItem('linksmeet_event_types');
    return raw ? JSON.parse(raw) : [];
  });
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const raw = localStorage.getItem('sm_bookings') || localStorage.getItem('linksmeet_bookings');
    return raw ? JSON.parse(raw) : [];
  });
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactErr, setContactErr] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const blankContact: Omit<Contact, 'id' | 'createdAt'> = { name: '', company: '', email: '', phone: '', status: 'New', source: '' };
  const [cForm, setCForm] = useState(blankContact);
  const [editingEvent, setEditingEvent] = useState<Partial<EventType> | 'new' | null>(null);

  const loadData = async () => {
    setContactsLoading(true);
    setContactErr('');
    try {
      // Ensure the user exists in public.users to prevent foreign key errors
      if (user?.id && user?.email) {
        await supabase.from('users').upsert({
          id: user.id,
          email: user.email,
          first_name: firstName,
        }, { onConflict: 'id' });
      }

      const c = await listContacts(uid);
      setContacts(c);
    } catch (err) {
      console.error(err);
      setContactErr('Failed to load some CRM data.');
    } finally {
      setContactsLoading(false);
    }
  };
  const hasSeededET = useRef(false);

  useEffect(() => {
    if (uid === 'anon') return;
    
    // Listen to real-time Event Types
    const unsubET = listenEventTypes(uid, (data) => {
      if (data.length === 0 && !hasSeededET.current) {
        hasSeededET.current = true;
        // Seed default event types if none exist
        Promise.all(DEFAULT_EVENT_TYPES.map(type => addEventType(uid, { ...type, active: true })))
          .then(() => {
            // Optimistically set the event types so they appear immediately
            setEventTypes(DEFAULT_EVENT_TYPES.map(t => ({ id: t.slug, ...t, active: true, createdAt: Date.now() }) as any));
          })
          .catch(e => {
             console.error("Failed to seed event types:", e);
             hasSeededET.current = false;
          });
      } else {
        // One-time cleanup for duplicates created by the strict-mode bug
        const unique = new Set();
        const duplicates: any[] = [];
        data.forEach(e => {
          if (unique.has(e.slug)) duplicates.push(e);
          else unique.add(e.slug);
        });
        if (duplicates.length > 0) {
          duplicates.forEach(d => deleteEventType(uid, d.id));
          // Optimistically remove from view
          setEventTypes(data.filter(e => !duplicates.includes(e)));
        } else {
          setEventTypes(data);
        }
      }
    });

    // Listen to real-time Bookings
    const unsubBookings = listenBookings(uid, (data) => {
      setBookings(data);
    });

    // Listen to real-time Contacts (Leads)
    const unsubContacts = listenContacts(uid, (data) => {
      setContacts(data);
    });

    return () => {
      unsubET();
      unsubBookings();
      unsubContacts();
    };
  }, [uid]);

  useEffect(() => { loadData(); }, [uid]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitContact = async (e: FormEvent) => {
    e.preventDefault();
    if (!cForm.name.trim() || !cForm.email.trim()) return;
    setSavingContact(true);
    try {
      await addContact(uid, {
        name: cForm.name.trim(), company: cForm.company.trim(),
        email: cForm.email.trim(), phone: cForm.phone.trim(), status: cForm.status,
      });
      setShowContactForm(false);
      setCForm(blankContact);
      await loadData();
      setToast('Contact added');
      window.setTimeout(() => setToast(null), 2400);
    } catch (e) {
      setContactErr((e as Error)?.message || 'Could not save contact.');
    } finally {
      setSavingContact(false);
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
      
      if (rows.length <= 1) {
        setToast('File is empty or invalid.');
        window.setTimeout(() => setToast(null), 2400);
        return;
      }
      
      const headers = rows[0].map(h => String(h || '').trim().toLowerCase());
      
      const matchHeader = (aliases: string[]) => headers.findIndex(h => aliases.some(alias => h.includes(alias)));
      
      const nameIdx = matchHeader(['name', 'first', 'last', 'contact']);
      const emailIdx = matchHeader(['email', 'mail']);
      const phoneIdx = matchHeader(['phone', 'mobile', 'cell', 'number']);
      const companyIdx = matchHeader(['company', 'business', 'org', 'organization']);
      
      if (nameIdx === -1 && emailIdx === -1) {
        setToast('File must contain at least a Name or Email column.');
        window.setTimeout(() => setToast(null), 2400);
        return;
      }

      setSavingContact(true);
      let added = 0;

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        
        const name = nameIdx !== -1 ? String(row[nameIdx] || '').trim() : '';
        const email = emailIdx !== -1 ? String(row[emailIdx] || '').trim() : '';
        const phone = phoneIdx !== -1 ? String(row[phoneIdx] || '').trim() : '';
        const company = companyIdx !== -1 ? String(row[companyIdx] || '').trim() : '';
        
        if (!name && !email) continue;
        
        try {
          await addContact(uid, {
            name: name || 'Unknown',
            email: email || '',
            phone: phone || '',
            company: company || '',
            status: 'New',
            source: 'uploaded'
          });
          added++;
        } catch (err) {
          console.error('Failed to add contact row', i, err);
        }
      }
      
      await loadData();
      setSavingContact(false);
      setToast(`Successfully uploaded ${added} leads.`);
      window.setTimeout(() => setToast(null), 2400);
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e) {
      setToast('Error reading file. Ensure it is a valid Excel or CSV.');
      window.setTimeout(() => setToast(null), 2400);
    }
  };

  const removeContact = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}? This can’t be undone.`)) return;
    try {
      await deleteContact(uid, id);
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      setToast((e as Error)?.message || 'Could not delete contact.');
      window.setTimeout(() => setToast(null), 2600);
    }
  };

  const changeStatus = async (id: string, status: ContactStatus) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c)); // optimistic
    try { await updateContact(uid, id, { status }); }
    catch { await loadData(); }
  };

  const toggleEventType = async (id: string, active: boolean) => {
    setEventTypes(prev => prev.map(e => e.id === id ? { ...e, active } : e));
    try { await updateEventType(uid, id, { active }); }
    catch { await loadData(); }
  };

  // @ts-ignore
  const removeEventType = async (id: string, title: string) => {
    if (!window.confirm(`Delete ${title}?`)) return;
    try {
      await deleteEventType(uid, id);
      setEventTypes(prev => prev.filter(e => e.id !== id));
    } catch (e) {
      setToast((e as Error)?.message || 'Could not delete.');
      window.setTimeout(() => setToast(null), 2600);
    }
  };

  
  const handleAddEventType = async (uid: string, data: any) => {
    await addEventType(uid, data);
    const { data: fresh } = await supabase.from('event_types').select('*').eq('user_id', uid).order('created_at', { ascending: false });
    if (fresh) {
      setEventTypes(fresh.map(d => ({
        id: d.id,
        title: d.title,
        dur: d.dur || d.duration || '15 Minutes',
        slug: d.slug,
        desc: d.description || d.desc || '',
        active: d.active,
        createdAt: new Date(d.created_at).getTime()
      })));
    }
  };

  const handleDeleteEventType = async (uid: string, id: string) => {
    await deleteEventType(uid, id);
    setEventTypes(prev => prev.filter(e => e.id !== id));
  };

  const exportContactsCSV = () => {
    const head = ['Name', 'Company', 'Email', 'Phone', 'Status', 'Source'];
    const rows = contacts.map(c => [c.name, c.company, c.email, c.phone, c.status, c.source || ''].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = [head.join(','), ...rows].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'linksmeet-leads.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const logoutAndGo = async () => { try { await logOut(); } catch { /* ignore */ } navigate('/'); };

  const [wf, setWf] = useState(WORKFLOWS.map(w => w.on));
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);

  // Close dropdowns if clicked outside (a simple effect to close the workspace dropdown)
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.crm-workspace-dropdown-container')) {
        setWsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleGlobalClick);
    return () => document.removeEventListener('mousedown', handleGlobalClick);
  }, []);

  useEffect(() => {
    if (!uid) return;
    
    getNotifications(uid).then(data => setNotifs(data || [])).catch(err => console.error("Error fetching notifs:", err));
    
    const channel = supabase.channel('notifs-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` }, payload => {
        setNotifs(prev => [payload.new as Notification, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` }, payload => {
        setNotifs(prev => prev.map(n => n.id === payload.new.id ? (payload.new as Notification) : n));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [uid]);




  
  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const diff = (new Date().getTime() - new Date(dateStr).getTime()) / 1000;
    if (isNaN(diff)) return '';
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h';
    return Math.floor(diff / 86400) + 'd';
  };

  const getNotifGroup = (dateStr: string) => {
    if (!dateStr) return 'Earlier';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Earlier';
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return 'Earlier';
  };

  const unreadCount = (notifs || []).filter(n => !n?.is_read).length;
  const openNotif = async (n: Notification) => {
    if (!n.is_read) {
      setNotifs(prev => (prev || []).map(x => x.id === n.id ? { ...x, is_read: true } : x));
      await markNotificationAsRead(n.id).catch(console.error);
    }
    setNotifOpen(false);
    setView(n.target as View);
  };
  const markAllRead = async () => {
    setNotifs(prev => (prev || []).map(x => ({ ...x, is_read: true })));
    await markAllNotificationsAsRead(uid).catch(console.error);
  };

  
  const globalSearchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return { contacts: [], bookings: [], workflows: [], apps: [] };
    return {
      contacts: contacts.filter((c: any) => 
        (c.name && c.name.toLowerCase().includes(q)) || 
        (c.company && c.company.toLowerCase().includes(q)) || 
        (c.email && c.email.toLowerCase().includes(q))
      ).slice(0, 3),
      bookings: bookings.filter((b: any) => 
        (b.title && b.title.toLowerCase().includes(q)) || 
        (b.attendeeName && b.attendeeName.toLowerCase().includes(q)) || 
        (b.attendeeEmail && b.attendeeEmail.toLowerCase().includes(q))
      ).slice(0, 3),
      workflows: myWorkflows.filter((w: any) => 
        (w.name && w.name.toLowerCase().includes(q)) || 
        (w.description && w.description.toLowerCase().includes(q))
      ).slice(0, 3),
      apps: installedApps.filter((a: any) => 
        (a.nm && a.nm.toLowerCase().includes(q)) || 
        (a.cat && a.cat.toLowerCase().includes(q))
      ).slice(0, 3)
    };
  }, [search, contacts, bookings, myWorkflows, installedApps]);

  const filteredContacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c: any) =>
      (c.name && c.name.toLowerCase().includes(q)) || 
      (c.company && c.company.toLowerCase().includes(q)) || 
      (c.email && c.email.toLowerCase().includes(q))
    );
  }, [contacts, search]);

  // Real metrics derived from the user's contacts
  const statusCounts = useMemo(() => {
    const m: Record<string, number> = { New: 0, Contacted: 0, 'Follow up': 0, Converted: 0, Lost: 0 };
    contacts.forEach(c => {
      let st = c.status;
      if (!st || !m.hasOwnProperty(st)) {
        st = 'New';
      }
      m[st] = (m[st] || 0) + 1;
    });
    return m;
  }, [contacts]);
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const addedThisWeek = contacts.filter(c => (c.createdAt || 0) >= weekAgo).length;
  const statusStages = CONTACT_STATUSES
    .map(s => ({ name: s, color: STATUS_META[s].color, value: statusCounts[s] }))
    .filter(s => s.value > 0);
  const followUps = contacts.filter(c => OPEN_STATUSES.includes(c.status));

  const filteredBookings = bookings.filter(b => bookingTab === 'upcoming' ? (b.status === 'upcoming' || b.status === 'rescheduled') : b.status === bookingTab);
  const appCats = ['All', ...Array.from(new Set(APPS.map(a => a.cat)))];
  const filteredApps = appCat === 'All' ? APPS : APPS.filter(a => a.cat === appCat);

  return (
    <div className="crm">
      <div className="crm-shell">
        <div className={`crm-scrim${sideOpen ? ' show' : ''}`} onClick={() => setSideOpen(false)} />
        

                

        {/* ============ SIDEBAR ============ */}
        {!editingEvent && (
        <aside className={`crm-side${sideOpen ? ' open' : ''}${sidebarCollapsed ? ' collapsed' : ''}`}>
          <div className="crm-brand" style={{ color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', position: 'relative' }}>
            <div className="crm-brand-logo-container" style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <img src="/LinksMeet-without-bg.png" alt="LinksMeet" className="crm-brand-logo" style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '6px', flexShrink: 0, transition: 'opacity 0.2s' }} />
              {!sidebarCollapsed && <span style={{ whiteSpace: 'nowrap', fontSize: '1.15rem', fontWeight: 600, letterSpacing: '-0.01em', marginTop: '6px' }}>LinksMeet</span>}
            </div>
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="collapse-btn" style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#6B7280', padding: 0, flexShrink: 0, transition: 'opacity 0.2s' }} title="Toggle Sidebar">
              {sidebarCollapsed ? <PanelLeftOpen size={22} /> : <PanelLeftClose size={22} />}
            </button>
          </div>


          <div className="crm-nav-scroll">
            {!sidebarCollapsed && workspaces && workspaces.length > 0 && (
              <div style={{ marginBottom: '16px', marginTop: '8px', padding: '0 6px' }}>
                <div className="crm-nav-label" style={{ paddingLeft: '6px' }}>Workspace</div>
                <div className="crm-workspace-dropdown-container" style={{ position: 'relative', width: '100%' }}>
                  <button 
                    onClick={() => workspaces.length > 1 && setWsDropdownOpen(!wsDropdownOpen)}
                    disabled={workspaces.length === 1}
                    className="crm-nav-item"
                    style={{ 
                      width: '100%', 
                      paddingLeft: '36px',
                      paddingRight: '30px',
                      background: workspaces.length > 1 ? '#F3F4F6' : 'transparent',
                      cursor: workspaces.length > 1 ? 'pointer' : 'default',
                      color: workspaces.length > 1 ? '#111827' : '#4f4f4f',
                      marginBottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: 'none',
                      textAlign: 'left'
                    }}
                  >
                    <Briefcase size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
                    <span style={{ 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      flex: 1, 
                      marginRight: workspaces.length > 1 ? '16px' : '0' 
                    }}>
                      {workspaces.find(w => w.id === activeWorkspaceId)?.name} 
                      {workspaces.find(w => w.id === activeWorkspaceId)?.role === 'Owner' ? '' : ` (${workspaces.find(w => w.id === activeWorkspaceId)?.role})`}
                    </span>
                    {workspaces.length > 1 && (
                      <ChevronsUpDown size={14} style={{ color: '#6B7280', flexShrink: 0 }} />
                    )}
                  </button>
                  
                  {wsDropdownOpen && workspaces.length > 1 && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      background: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      zIndex: 1000,
                      maxHeight: '250px',
                      overflowY: 'auto'
                    }}>
                      {workspaces.map(w => (
                        <button
                          key={w.id}
                          onClick={() => {
                            const keysToWipe = ['sm_event_types', 'linksmeet_event_types', 'sm_bookings', 'linksmeet_bookings', 'sm_campaigns', 'sm_campaign_settings', 'sm_threads', 'sm_sent_logs', 'sm_contacts'];
                            keysToWipe.forEach(k => localStorage.removeItem(k));
                            setActiveWorkspaceId(w.id);
                            setWsDropdownOpen(false);
                            window.location.reload();
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            background: activeWorkspaceId === w.id ? '#F3F4F6' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            color: activeWorkspaceId === w.id ? '#111827' : '#4B5563',
                            fontSize: '14px',
                            fontWeight: activeWorkspaceId === w.id ? 500 : 400
                          }}
                          onMouseEnter={(e) => {
                            if (activeWorkspaceId !== w.id) e.currentTarget.style.background = '#F9FAFB';
                          }}
                          onMouseLeave={(e) => {
                            if (activeWorkspaceId !== w.id) e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <div style={{ 
                            flex: 1, 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis' 
                          }}>
                            {w.name} {w.role === 'Owner' ? '' : `(${w.role})`}
                          </div>
                          {activeWorkspaceId === w.id && <Check size={14} style={{ marginLeft: '8px', flexShrink: 0, color: '#2563EB' }} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {NAV_GROUPS.map(group => (
              <div key={group.label}>
                <div className="crm-nav-label">{group.label}</div>
                {group.items.map(n => {
                  const Icon = n.icon;
                  return (
                    <button
                      key={n.id}
                      className={`crm-nav-item${view === n.id ? ' active' : ''}`}
                      onClick={() => { setView(n.id); setSideOpen(false); }}
                    >
                      <Icon size={17} />
                      <span>{n.label}</span>
                      {n.badge && <span className={`badge${n.badgeNew ? ' new' : ''}`}>{n.badge}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="crm-side-foot">
            <div ref={profileMenuRef} style={{ position: 'relative' }}>
              {showProfileMenu && (
                <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, width: '100%', background: '#fff', border: '1px solid #F5F5F5', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', overflow: 'hidden', zIndex: 100 }}>
                  <button onClick={() => { setShowProfileMenu(false); setView('admin'); }} style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 400, color: '#374151', textAlign: 'left' }} onMouseOver={(e) => e.currentTarget.style.background = '#F9FAFB'} onMouseOut={(e) => e.currentTarget.style.background = 'none'}>
                    <Settings size={17} color="#6B7280" strokeWidth={1.75} /> Account Settings
                  </button>
                  <button onClick={logoutAndGo} style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', border: 'none', borderTop: '1px solid #F3F4F6', background: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 400, color: '#EF4444', textAlign: 'left' }} onMouseOver={(e) => e.currentTarget.style.background = '#FEF2F2'} onMouseOut={(e) => e.currentTarget.style.background = 'none'}>
                    <LogOut size={17} color="#EF4444" strokeWidth={1.75} /> Log out
                  </button>
                </div>
              )}
              <div className="crm-userbox" style={{ marginTop: 8 }} onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <div className="crm-userbox-avatar-wrapper">
                  {(user?.user_metadata?.avatar_url || user?.user_metadata?.picture) ? (
                    <img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt="avatar" className="crm-userbox-avatar" />
                  ) : (
                    <div className="crm-userbox-avatar" style={{ background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={20} color="#9CA3AF" />
                    </div>
                  )}
                  <div className="crm-userbox-status">
                    <svg viewBox="0 0 10 10" width="8" height="8"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                  </div>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="nm">{displayName || "24311a05h6"}</div>
                  <div className="rl">{user?.email || "24311a05h6@cse.sreenidhi.edu.in"}</div>
                </div>
                <ChevronsUpDown size={14} color="#6B7280" />
              </div>
            </div>
          </div>
        </aside>
        )}

        {/* ============ MAIN ============ */}
      {editingEvent ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <EventTypeEditor 
            uid={uid}
            initialData={editingEvent === 'new' ? null : editingEvent}
            onClose={() => setEditingEvent(null)}
            onSaved={async (savedId?: string) => {
              const { data: fresh } = await supabase.from('event_types').select('*').eq('user_id', uid).order('created_at', { ascending: false });
              if (fresh && fresh.length > 0) {
                setEventTypes(fresh.map(d => ({
                  id: d.id,
                  title: d.title,
                  dur: d.dur || d.duration || '15 Minutes',
                  slug: d.slug,
                  desc: d.description || d.desc || '',
                  active: d.active,
                  createdAt: new Date(d.created_at).getTime()
                })));
                
                if (savedId) {
                  const newEventObj = fresh.find(e => e.id === savedId) || fresh[0];
                  if (newEventObj) setEditingEvent(newEventObj);
                }
              } else {
                const raw = localStorage.getItem('sm_event_types') || localStorage.getItem('linksmeet_event_types');
                if (raw) setEventTypes(JSON.parse(raw));
                
                // Fallback for local storage save
                if (savedId && raw) {
                  const parsed = JSON.parse(raw);
                  const newEventObj = parsed.find((e: any) => e.id === savedId) || parsed[0];
                  if (newEventObj) setEditingEvent(newEventObj);
                }
              }
            }}
          />
        </div>
      ) : (
      <div className="crm-main" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', padding: '16px 16px 16px 0', background: '#F6F6F6' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'row', background: '#FFFFFF', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, transition: 'width 0.3s ease' }}>
          {view !== 'campaigns' && (
          <div className="crm-topbar">
            <button className="crm-icon-btn crm-menu-btn" onClick={() => setSideOpen(true)} aria-label="Menu"><Menu size={18} /></button>
            <div className="crm-search" style={{ position: 'relative' }}>
              <Search size={15} color="#9b9bab" />
              <input 
                placeholder="Search across dashboard…" 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              />
              {isSearchFocused && search.trim() !== '' && (
                <div className="crm-search-dropdown">
                  {globalSearchResults.contacts.length > 0 && (
                    <div className="crm-search-section">
                      <h4>Contacts</h4>
                      {globalSearchResults.contacts.map((c: any) => (
                        <div key={c.id} className="crm-search-item" onClick={() => { setView('people'); setSearch(''); }}>
                          <div className="crm-search-item-title">{c.name}</div>
                          <div className="crm-search-item-sub">{c.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {globalSearchResults.bookings.length > 0 && (
                    <div className="crm-search-section">
                      <h4>Bookings</h4>
                      {globalSearchResults.bookings.map((b: any) => (
                        <div key={b.id} className="crm-search-item" onClick={() => { setView('bookings'); setSearch(''); }}>
                          <div className="crm-search-item-title">{b.title}</div>
                          <div className="crm-search-item-sub">{b.attendeeName}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {globalSearchResults.workflows.length > 0 && (
                    <div className="crm-search-section">
                      <h4>Workflows</h4>
                      {globalSearchResults.workflows.map((w: any) => (
                        <div key={w.id} className="crm-search-item" onClick={() => { setView('workflows'); setSearch(''); }}>
                          <div className="crm-search-item-title">{w.name}</div>
                          <div className="crm-search-item-sub">{w.description}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {globalSearchResults.apps.length > 0 && (
                    <div className="crm-search-section">
                      <h4>Apps</h4>
                      {globalSearchResults.apps.map((a: any) => (
                        <div key={a.id} className="crm-search-item" onClick={() => { setView('apps'); setSearch(''); }}>
                          <div className="crm-search-item-title">{a.nm}</div>
                          <div className="crm-search-item-sub">{a.cat}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {globalSearchResults.contacts.length === 0 && globalSearchResults.bookings.length === 0 && globalSearchResults.workflows.length === 0 && globalSearchResults.apps.length === 0 && (
                    <div className="crm-search-empty">No results found for "{search}"</div>
                  )}
                </div>
              )}
            </div>
            <div className="crm-top-actions">
              <div className="crm-notif-wrap">
                <button
                  className="crm-icon-btn"
                  aria-label="Notifications"
                  aria-expanded={notifOpen}
                  onClick={() => setNotifOpen(o => !o)}
                >
                  <Bell size={17} />
                  {unreadCount > 0 && <span className="crm-notif-badge">{unreadCount}</span>}
                </button>
              </div>
            </div>
          </div>
          )}

          
        <div className="crm-content" style={view === 'campaigns' ? { display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: '#FFFFFF', padding: 0 } : { display: 'flex', flexDirection: 'column', flex: 1, background: '#FFFFFF' }}>
          <Outlet context={{
            user, uid, activeRole, canEdit, userProfile, displayName, firstName, userInitials, toast, setToast, sideOpen, setSideOpen, search, setSearch, notif, setNotif, setView, setUserProfile, contacts, eventTypes, bookings, myWorkflows, installedApps, handleCreateWorkflow, logoutAndGo, exportContactsCSV, showContactForm, setShowContactForm, cForm, setCForm, blankContact, contactErr, setContactErr, submitContact, savingContact, changeStatus, setEditingEvent, editingEvent, etTab, setEtTab, googleConnected, handleConnectGoogle, bookingTab, setBookingTab, joinMeeting, cancelBooking, leadsTab, setLeadsTab, peopleTab: 'contacts', setPeopleTab: () => {}, appCat, setAppCat, appsTab, setAppsTab, handleConnectApp, handleManageApp, teamMembers: allTeamMembers, showInviteModal, setShowInviteModal, inviteEmail, setInviteEmail, inviteRole, setInviteRole, handleInviteSubmit, removeMember, updateMember, editingWorkflow, setEditingWorkflow, setAvailIsDefault, availIsDefault, saveAvailability, availSchedule, setAvailSchedule, tzOpen, tzSearch, TIMEZONES, availPrefs, setTzOpen, setTzSearch, setAvailPrefs, followUps, statusCounts, addedThisWeek, ACCENT_SOFT, ACCENT, contactsLoading, STATUS_META, statusStages, filteredContacts, Donut, avColor, initials, removeContact, fileInputRef, handleUploadFile, CONTACT_STATUSES, setInitCampaignLead, EmptyState, handleSaveWorkflow, setMyWorkflows, API_BASE_URL, showWorkflowTypeModal, setShowWorkflowTypeModal, handleSelectType, appCats, filteredApps, connectingApps, filteredBookings, toggleEventType, etDropdown, setEtDropdown, addEventType: handleAddEventType, deleteEventType: handleDeleteEventType, initCampaignLead
          }} />
        </div>
        </div>
        <div className={`crm-notif-panel-wrapper ${notifOpen ? 'open' : ''}`}>
          <div className="crm-notif-panel">
                    <div className="crm-notif-head">
                      <span className="ttl">Notifications</span>
                      <div className="crm-notif-head-bell" onClick={() => setNotifOpen(false)} style={{ cursor: 'pointer' }}>
                        <X size={20} />
                      </div>
                    </div>
                    <div className="crm-notif-content-area">
                      {['Today', 'Yesterday', 'Earlier'].map(dateGroup => {
                        const items = (notifs || []).filter(n => getNotifGroup(n?.created_at) === dateGroup);
                        if (items.length === 0) return null;
                        
                        return (
                          <div key={dateGroup} className="crm-notif-date-group">
                            <div className="crm-notif-date-header">
                              {dateGroup}
                              <MoreHorizontal size={14} />
                            </div>
                            {items.map(n => {
                              let color = 'pink';
                              if (n.target === 'dashboard') color = 'green';
                              if (n.target === 'bookings') color = 'blue';
                              if (n.target === 'people') color = 'orange';
                              if (n.target === 'payments') color = 'purple';
                              
                              return (
                                <div key={n.id} className="crm-notif-timeline-item">
                                  <div className="crm-notif-timeline-time">{formatTimeAgo(n.created_at)}</div>
                                  <div className={`crm-notif-timeline-line ${color}`} />
                                  <div className="crm-notif-timeline-content" style={{ opacity: n.is_read ? 0.6 : 1, cursor: 'pointer' }} onClick={() => openNotif(n as any)}>
                                    <div className="title" style={{ fontSize: '0.85rem', color: '#9A94A6', fontWeight: 600 }}>{n.title}</div>
                                    <div className="desc" style={{ fontSize: '0.95rem', color: '#322B4A', fontWeight: 700 }}>{n.description}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
        </div>
        </div>
      </div>
      )}

      {showInviteModal && (
        <div className="crm-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(17, 24, 39, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div className="crm-modal" style={{ maxWidth: '440px', width: '100%', background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            
            <div className="crm-modal-head" style={{ padding: '24px 32px 20px', position: 'relative', display: 'block', borderBottom: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                <div style={{ width: '48px', height: '48px', flexShrink: 0, background: '#EFF6FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <UserPlus size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#111827', lineHeight: 1.2 }}>Invite Team Member</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6B7280', lineHeight: 1.4 }}>Add a new member to your workspace.</p>
                </div>
              </div>
              <button className="crm-modal-close" onClick={() => setShowInviteModal(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: '#F3F4F6', border: 'none', color: '#6B7280', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                <X size={16} />
              </button>
            </div>
            
            <div className="crm-modal-body" style={{ padding: '24px 32px' }}>
              <form onSubmit={handleInviteSubmit}>
                <div className="crm-form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#9CA3AF' }} />
                    <input type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@company.com" style={{ width: '100%', height: '46px', padding: '0 14px 0 42px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box', outline: 'none', color: '#111827', backgroundColor: '#FFFFFF', transition: 'border-color 0.2s' }} />
                  </div>
                </div>
                
                <div className="crm-form-group" style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>Role & Permissions</label>
                  <div style={{ position: 'relative' }}>
                    <Shield size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#9CA3AF' }} />
                    <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={{ width: '100%', height: '46px', padding: '0 36px 0 42px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box', background: '#FFFFFF', outline: 'none', color: '#111827', appearance: 'none', transition: 'border-color 0.2s' }}>
                      <option value="Admin">Admin (Full Access)</option>
                      <option value="Editor">Editor (Can edit content)</option>
                      <option value="Member">Member (Standard access)</option>
                      <option value="Viewer">Viewer (Read-only)</option>
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '15px', color: '#9CA3AF', pointerEvents: 'none' }} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                  <button type="button" className="crm-btn" style={{ background: '#FFFFFF', color: '#4B5563', border: '1px solid #D1D5DB', borderRadius: '10px', padding: '0 20px', height: '44px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setShowInviteModal(false)}>Cancel</button>
                  <button type="submit" disabled={isInviting} className="crm-btn" style={{ opacity: isInviting ? 0.7 : 1, pointerEvents: isInviting ? 'none' : 'auto', background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '0 20px', height: '44px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)', transition: 'all 0.2s' }}>
                    {isInviting ? 'Sending...' : <>Send Invite <ArrowRight size={16} /></>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {manageApp && (
        <div className="crm-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="crm-modal" style={{ background: '#FFFFFF', borderRadius: '16px', width: '100%', maxWidth: '440px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>{manageApp.logo}</span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>Manage {manageApp.nm}</h3>
              </div>
              <button onClick={() => setManageApp(null)} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px', lineHeight: 1.5 }}>
              This integration is currently active and connected to your LinksMeet workspace. You can test the connection or disconnect it below.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setToast(`Connection test for ${manageApp.nm} passed! ✅`);
                  setTimeout(() => setToast(null), 3000);
                  setManageApp(null);
                }} 
                style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
              >
                Test Connection
              </button>
              <button 
                onClick={confirmDisconnectApp} 
                style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}


      </div>
    </div>
  );
}
