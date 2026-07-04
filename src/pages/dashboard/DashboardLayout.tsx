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
  Copy, Rocket, Calendar, Trash2, LogOut, Loader2, EyeOff, ExternalLink, Edit2, Code, Info, ArrowLeft, Globe, Settings, Mail, Phone, ChevronRight,
  Smartphone, Heart, AlertCircle, RefreshCw, Pencil, XCircle
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';
import { API_BASE_URL } from '../../lib/config';
import { 
  listContacts, addContact, updateContact, deleteContact,
  listenEventTypes, addEventType, updateEventType, deleteEventType,
  listenBookings, type Contact, type ContactStatus, type EventType, type Booking 
} from '../../lib/crm';
import './CrmDashboard.css';
import CampaignModule from '../../components/campaigns/CampaignModule';
import WorkflowEditor, { type WorkflowDraft } from '../../components/WorkflowEditor';
import EventTypeEditor from '../../components/EventTypeEditor';

type View =
  | 'dashboard' | 'eventTypes' | 'bookings' | 'people' | 'teams'
  | 'workflows' | 'campaigns' | 'routing'
  | 'apps' | 'payments'
  | 'admin' | 'help';

/* ---------------- mock data ---------------- */
// Indigo palette — avatars use shades of the single accent
const AV_COLORS = ['#0E61F3', '#3B82F6', '#0849C2', '#60A5FA', '#1D4ED8', '#2563EB', '#93C5FD'];
const avColor = (i: number) => AV_COLORS[i % AV_COLORS.length];
// Light → dark indigo ramp for chart segments that need to be distinguished
const RAMP = ['#C9DBFF', '#9BBDFD', '#6A98F9', '#0E61F3', '#0849C2'];
const ACCENT = '#0E61F3';
const ACCENT_SOFT = '#EAF2FF';
const initials = (n?: string) => {
  if (!n) return '?';
  const words = n.trim().split(' ').filter(Boolean);
  if (words.length === 0) return '?';
  return words.map(w => w[0]).join('').slice(0, 2).toUpperCase();
};

// Lead follow-up status → tag class + ramp color for the donut
const STATUS_META: Record<ContactStatus, { tag: string; color: string }> = {
  New: { tag: 'violet', color: RAMP[1] },
  Contacted: { tag: 'amber', color: RAMP[2] },
  'Follow-up': { tag: 'amber', color: RAMP[3] },
  Won: { tag: 'green', color: RAMP[4] },
  Lost: { tag: 'rose', color: RAMP[0] },
};
const CONTACT_STATUSES: ContactStatus[] = ['New', 'Contacted', 'Follow-up', 'Won', 'Lost'];
// Statuses that still need attention from the user
const OPEN_STATUSES: ContactStatus[] = ['New', 'Follow-up', 'Contacted'];

const DEFAULT_EVENT_TYPES = [
  { title: '15 Min Meeting', dur: '15m', slug: '15min', desc: 'A quick intro or sync call.' },
  { title: '30 Min Meeting', dur: '30m', slug: '30min', desc: 'Standard discovery conversation.' },
  { title: 'Product Demo', dur: '45m', slug: 'demo', desc: 'Guided walkthrough of LinksMeet.' },
  { title: 'Strategy Session', dur: '60m', slug: 'strategy', desc: 'Deep-dive planning with the team.' },
  { title: 'Group Webinar', dur: '90m', slug: 'webinar', desc: 'Multi-attendee live session.' },
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
  { nm: 'Zoom', cat: 'Conferencing', ds: 'Host meetings over Zoom.', logo: 'https://cdn.worldvectorlogo.com/logos/zoom-app.svg' },
  { nm: 'Stripe', cat: 'Payments', ds: 'Collect payments at booking.', logo: 'https://cdn.worldvectorlogo.com/logos/stripe-4.svg' },
  { nm: 'Slack', cat: 'Messaging', ds: 'Get notified in your channels.', logo: 'https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg' },
  { nm: 'Zapier', cat: 'Automation', ds: 'Connect 5,000+ apps.', logo: 'https://cdn.worldvectorlogo.com/logos/zapier-1.svg' },
  { nm: 'Salesforce', cat: 'CRM', ds: 'Sync contacts and deals.', logo: 'https://cdn.worldvectorlogo.com/logos/salesforce-2.svg' },
  { nm: 'HubSpot', cat: 'CRM', ds: 'Two-way contact sync.', logo: 'https://cdn.worldvectorlogo.com/logos/hubspot-1.svg' },
  { nm: 'Google Calendar', cat: 'Calendar', ds: 'Check for conflicts in real time.', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg' },
];

const INSTALLED = [
  { nm: 'Google Calendar', cat: 'Calendar', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg' },
  { nm: 'Google Meet', cat: 'Conferencing', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Google_Meet_icon_%282020%29.svg' },
];

const TRANSACTIONS = [
  { name: 'Logan Mitchell', event: 'Product Demo', amt: '$120.00', tag: 'green', tagLabel: 'Paid' },
  { name: 'Maya Coleman', event: 'Strategy Session', amt: '$250.00', tag: 'green', tagLabel: 'Paid' },
  { name: 'Priya Anand', event: '30 Min Meeting', amt: '$60.00', tag: 'amber', tagLabel: 'Pending' },
  { name: 'Daniel Osei', event: '15 Min Meeting', amt: '$30.00', tag: 'rose', tagLabel: 'Refunded' },
];

const PLANS_UP = [
  { name: 'Starter', price: '$19', period: '/mo', featured: false, feats: ['Up to 3 event types', 'Basic workflows', '1 team seat', 'Email support'] },
  { name: 'Growth', price: '$39', period: '/mo', featured: true, feats: ['Unlimited event types', 'Advanced workflows', '5 team seats', 'Priority support', 'Custom branding'] },
  { name: 'Scale', price: '$79', period: '/mo', featured: false, feats: ['Everything in Growth', 'Unlimited seats', 'SSO & SAML', 'Dedicated manager', 'Full API access'] },
];

type Notif = { id: number; icon: typeof Users; title: string; desc: string; time: string; read: boolean; target: View };
const NOTIFS_INIT: Notif[] = [
  { id: 1, icon: CheckCircle2, title: 'Deal won', desc: 'Ramp closed for $40,000', time: '12m', read: false, target: 'dashboard' },
  { id: 2, icon: CalendarCheck, title: 'New booking', desc: 'Product Demo with Logan Mitchell', time: '1h', read: false, target: 'bookings' },
  { id: 3, icon: UserPlus, title: 'New contact added', desc: 'Sienna Brooks joined your list', time: '3h', read: false, target: 'people' },
  { id: 4, icon: CreditCard, title: 'Payment received', desc: '$250.00 from Maya Coleman', time: '5h', read: true, target: 'payments' },
  { id: 5, icon: Zap, title: 'Workflow ran', desc: 'Booking reminder sent to 24 people', time: 'Yesterday', read: true, target: 'workflows' },
];

/* ---------------- chart helpers ---------------- */
function Donut({ stages, total, label }: { stages: { name: string; color: string; value: number }[]; total: number; label: string }) {
  const R = 54, C = 2 * Math.PI * R;
  const sum = stages.reduce((a, s) => a + s.value, 0) || 1;
  let offset = 0;
  return (
    <svg width="148" height="148" viewBox="0 0 148 148">
      <circle cx="74" cy="74" r={R} fill="none" stroke="#f0f0f4" strokeWidth="18" />
      {stages.map((s, i) => {
        const len = (s.value / sum) * C;
        const el = (
          <circle
            key={i} cx="74" cy="74" r={R} fill="none"
            stroke={s.color} strokeWidth="18"
            strokeDasharray={`${len} ${C - len}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 74 74)"
          />
        );
        offset += len;
        return el;
      })}
      <text x="74" y="70" textAnchor="middle" fontSize="22" fontWeight="700" fill="#16161d">{total}</text>
      <text x="74" y="88" textAnchor="middle" fontSize="10" fill="#9b9bab">{label}</text>
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
    { id: 'people', label: 'Leads', icon: Users },
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
  eventTypes: { title: 'Availability', sub: 'Set the hours you’re open for bookings.' },
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
  const { user, logOut } = useAuth();
  const uid = user?.id || 'anon';
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
  const joinMeeting = (e: any) => {};
  const cancelBooking = (e: any) => {};
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apps State
  const [installedApps, setInstalledApps] = useState(INSTALLED);
  const [connectingApps, setConnectingApps] = useState<string[]>([]);

  const handleCreateWorkflow = (template: any) => {
    if (!template) {
      setShowWorkflowTypeModal(true);
      return;
    }
    
    const isVoice = template?.title?.includes('Call');
    const isSms = template?.title?.includes('SMS');
    const actionType = isVoice ? 'voice' : (isSms ? 'sms' : 'email');
    
    setEditingWorkflow({
      template_name: template?.title || 'Untitled',
      trigger_event: 'booking_created',
      delay_ms: 0,
      action_type: actionType,
      action_payload: {}
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

  const handleSaveWorkflow = (draft: WorkflowDraft) => {
    fetch(`${API_BASE_URL}/api/workflows`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${user?.access_token || ''}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(draft)
    })
    .then(res => res.json())
    .then(data => {
      setMyWorkflows(prev => [data, ...prev]);
      setEditingWorkflow(null);
    })
    .catch(console.error);
  };

  const [manageApp, setManageApp] = useState<typeof APPS[0] | null>(null);

  const handleConnectApp = (app: typeof APPS[0]) => {
    if (installedApps.some(a => a.nm === app.nm) || connectingApps.includes(app.nm)) return;
    
    // Connect in real-time via backend OAuth routes
    if (app.nm.includes('Google')) {
      handleConnectGoogle();
      return;
    }
    
    // Use the backend real OAuth endpoint for all other integrations
    const providerId = app.nm.toLowerCase().replace(/\s+/g, '');
    window.location.href = `${API_BASE_URL}/auth/${providerId}?uid=${uid}`;
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
  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: displayName + ' (You)', email: user?.email || 'admin@linksmeet.com', role: 'Owner', status: 'Active' },
    { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Member', status: 'Pending' }
  ]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');

  const handleInviteSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    const newId = Math.random().toString(36).substring(7);
    const newMember = {
      id: newId,
      name: inviteEmail.split('@')[0], // placeholder name
      email: inviteEmail,
      role: inviteRole,
      status: 'Pending'
    };
    setTeamMembers(prev => [...prev, newMember]);
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteRole('Member');
    setToast('Invite sent!');
    setTimeout(() => setToast(null), 2000);
  };

  const removeMember = (id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
    setToast('Member removed');
    setTimeout(() => setToast(null), 2000);
  };

  // Availability State
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
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token || '';
        const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUserProfile(data.user);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();

    fetch(`${API_BASE_URL}/api/workflows`, {
      headers: { 'Authorization': `Bearer ${user?.access_token || ''}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setMyWorkflows(data);
    })
    .catch(console.error);
  }, [uid, user]);
  
  // Google Integration State
  const [googleConnected, setGoogleConnected] = useState(false);

  useEffect(() => {
    async function checkGoogle() {
      if (localStorage.getItem('sm_gmail_token')) {
        setGoogleConnected(true);
        return;
      }
      
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
          if (data?.google_tokens?.access_token || data?.google_tokens?.refresh_token) {
            setGoogleConnected(true);
          }
        } catch(e) {}
      }
    }
    checkGoogle();
  }, [uid]);

  const handleConnectGoogle = () => {
    window.location.href = `${API_BASE_URL}/auth/google?uid=${uid}`;
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
      
      // If we just disconnected a Google app, and no Google apps are left, wipe tokens
      if (manageApp.nm.includes('Google') && !nextApps.some(a => a.nm.includes('Google'))) {
        handleDisconnectGoogle();
      }
      
      return nextApps;
    });

    setToast(`${manageApp.nm} disconnected.`);
    setTimeout(() => setToast(null), 2000);
    setManageApp(null);
  };
  // ----- Live Data (Firestore) -----
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
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

  useEffect(() => {
    if (uid === 'anon') return;
    
    // Listen to real-time Event Types
    const unsubET = listenEventTypes(uid, (data) => {
      if (data.length === 0) {
        // Seed default event types if none exist
        Promise.all(DEFAULT_EVENT_TYPES.map(type => addEventType(uid, { ...type, active: true })))
          .then(() => {
            // Optimistically set the event types so they appear immediately
            setEventTypes(DEFAULT_EVENT_TYPES.map(t => ({ id: t.slug, ...t, active: true, createdAt: Date.now() }) as any));
          })
          .catch(e => console.error("Failed to seed event types:", e));
      } else {
        setEventTypes(data);
      }
    });

    // Listen to real-time Bookings
    const unsubBookings = listenBookings(uid, (data) => {
      setBookings(data);
    });

    return () => {
      unsubET();
      unsubBookings();
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
  const [notifs, setNotifs] = useState<Notif[]>(NOTIFS_INIT);
  const [notifOpen, setNotifOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [plan, setPlan] = useState('Free');
  const [toast, setToast] = useState<string | null>(null);

  const choosePlan = (name: string) => {
    setPlan(name);
    setUpgradeOpen(false);
    setToast(`You're now on the ${name} plan`);
    window.setTimeout(() => setToast(null), 3200);
  };

  const unreadCount = notifs.filter(n => !n.read).length;
  const openNotif = (n: Notif) => {
    setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
    setNotifOpen(false);
    setView(n.target);
  };
  const markAllRead = () => setNotifs(prev => prev.map(x => ({ ...x, read: true })));

  const filteredContacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(c =>
      c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [contacts, search]);

  // Real metrics derived from the user's contacts
  const statusCounts = useMemo(() => {
    const m: Record<ContactStatus, number> = { New: 0, Contacted: 0, 'Follow-up': 0, Won: 0, Lost: 0 };
    contacts.forEach(c => { m[c.status] = (m[c.status] || 0) + 1; });
    return m;
  }, [contacts]);
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const addedThisWeek = contacts.filter(c => (c.createdAt || 0) >= weekAgo).length;
  const statusStages = CONTACT_STATUSES
    .map(s => ({ name: s, color: STATUS_META[s].color, value: statusCounts[s] }))
    .filter(s => s.value > 0);
  const followUps = contacts.filter(c => OPEN_STATUSES.includes(c.status));

  const filteredBookings = bookings.filter(b => b.status === bookingTab);
  const appCats = ['All', ...Array.from(new Set(APPS.map(a => a.cat)))];
  const filteredApps = appCat === 'All' ? APPS : APPS.filter(a => a.cat === appCat);

  return (
    <div className="crm">
      <div className="crm-shell">
        <div className={`crm-scrim${sideOpen ? ' show' : ''}`} onClick={() => setSideOpen(false)} />
        {notifOpen && <div className="crm-notif-backdrop" onClick={() => setNotifOpen(false)} />}

        {/* ============ SIDEBAR ============ */}
        {!editingEvent && (
        <aside className={`crm-side${sideOpen ? ' open' : ''}`}>
          <div className="crm-brand" style={{ color: '#111' }}>
            <img src="/logo.png" alt="LinksMeet" style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: '4px' }} />
            <span>LinksMeet</span>
          </div>

          <div className="crm-nav-scroll">
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
            <div className="crm-upgrade">
              <div className="ut"><Sparkles size={14} /> {plan === 'Free' ? 'Upgrade to Pro' : `${plan} plan`}</div>
              <div className="ud">
                {plan === 'Free'
                  ? 'Unlock unlimited event types, workflows, and team seats.'
                  : 'You have access to premium features. Manage or change your plan anytime.'}
              </div>
              <button onClick={() => setUpgradeOpen(true)}>{plan === 'Free' ? 'Upgrade plan' : 'Manage plan'}</button>
            </div>
            <button className={`crm-nav-item${view === 'admin' ? ' active' : ''}`} onClick={() => { setView('admin'); setSideOpen(false); }}>
              <Shield size={17} /> <span>Admin Center</span>
            </button>
            <button className={`crm-nav-item${view === 'help' ? ' active' : ''}`} onClick={() => { setView('help'); setSideOpen(false); }}>
              <HelpCircle size={17} /> <span>Help</span>
            </button>
            <div className="crm-userbox" style={{ marginTop: 8 }}>
              <span className="av">{userInitials}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="nm">{displayName}</div>
                <div className="rl">{user?.email}</div>
              </div>
              <button className="crm-logout" title="Log out" onClick={logoutAndGo}><LogOut size={16} /></button>
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
            onSaved={() => setEditingEvent(null)}
          />
        </div>
      ) : (
      <div className="crm-main" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          {view !== 'campaigns' && (
          <div className="crm-topbar">
            <button className="crm-icon-btn crm-menu-btn" onClick={() => setSideOpen(true)} aria-label="Menu"><Menu size={18} /></button>
            <div className="crm-search">
              <Search size={15} color="#9b9bab" />
              <input placeholder="Search contacts, deals, companies…" value={search} onChange={e => setSearch(e.target.value)} />
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

                {notifOpen && (
                  <div className="crm-notif-panel">
                    <div className="crm-notif-head">
                      <span className="ttl">Notifications {unreadCount > 0 && <em>{unreadCount} new</em>}</span>
                      {unreadCount > 0 && <button onClick={markAllRead}>Mark all read</button>}
                    </div>
                    <div className="crm-notif-list">
                      {notifs.map(n => {
                        const Icon = n.icon;
                        return (
                          <button
                            key={n.id}
                            className={`crm-notif-item${n.read ? '' : ' unread'}`}
                            onClick={() => openNotif(n)}
                          >
                            <span className="ic"><Icon size={15} /></span>
                            <span className="txt">
                              <span className="tb">{n.title}</span>
                              <span className="tm">{n.time} ago</span>
                            </span>
                            {!n.read && <span className="crm-notif-unread-dot" />}
                          </button>
                        );
                      })}
                    </div>
                    <button className="crm-notif-foot" onClick={() => { setNotifOpen(false); setView('dashboard'); }}>
                      View all activity
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          )}

          
        <div className="crm-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: '#fcfcfd', padding: 0 }}>
          <Outlet context={{
            user, uid, userProfile, displayName, firstName, userInitials,
            toast, setToast, sideOpen, setSideOpen, search, setSearch,
            notif, setNotif, setView,
            contacts, eventTypes, bookings, myWorkflows, installedApps,
            handleCreateWorkflow, logoutAndGo, exportContactsCSV,
            showContactForm, setShowContactForm, cForm, setCForm, blankContact, contactErr, setContactErr, submitContact, savingContact,
            changeStatus, setEditingEvent, editingEvent, etTab, setEtTab, googleConnected, handleConnectGoogle,
            bookingTab, setBookingTab, joinMeeting, cancelBooking, leadsTab, setLeadsTab, peopleTab: 'contacts', setPeopleTab: () => {},
            appCat, setAppCat, appsTab, setAppsTab, handleConnectApp, handleManageApp,
            teamMembers, showInviteModal, setShowInviteModal, inviteEmail, setInviteEmail, inviteRole, setInviteRole, handleInviteSubmit, removeMember,
            editingWorkflow, setEditingWorkflow
          , setAvailIsDefault, availIsDefault, saveAvailability, availSchedule, setAvailSchedule, tzOpen, tzSearch, TIMEZONES, availPrefs, setTzOpen, setTzSearch, setAvailPrefs, followUps, statusCounts, addedThisWeek, ACCENT_SOFT, ACCENT, contactsLoading, STATUS_META, statusStages, filteredContacts, Donut, avColor, initials, removeContact, fileInputRef, handleUploadFile, ContactStatus, CONTACT_STATUSES, setInitCampaignLead, EmptyState, handleSaveWorkflow, setMyWorkflows, API_BASE_URL, showWorkflowTypeModal, setShowWorkflowTypeModal, handleSelectType, appCats, filteredApps, connectingApps, filteredBookings , toggleEventType, etDropdown, setEtDropdown, addEventType, deleteEventType, initCampaignLead, setInitCampaignLead, joinMeeting, cancelBooking }} />
        </div>
      </div>
      )}
      </div>
    </div>
  );
}
