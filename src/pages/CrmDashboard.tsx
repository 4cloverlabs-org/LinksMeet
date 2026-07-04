import { useState, useEffect, useMemo, type FormEvent, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../lib/config';
import { 
  listContacts, addContact, updateContact, deleteContact,
  listenEventTypes, addEventType, updateEventType, deleteEventType,
  listenBookings, type Contact, type ContactStatus, type EventType, type Booking 
} from '../lib/crm';
import './CrmDashboard.css';
import CampaignModule from '../components/campaigns/CampaignModule';
import WorkflowEditor, { type WorkflowDraft } from '../components/WorkflowEditor';
import EventTypeEditor from '../components/EventTypeEditor';

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
export default function CrmDashboard() {
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

          <div className="crm-content" style={view === 'campaigns' ? { padding: 0, background: '#fcfcfd', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' } : {}}>
            {view !== 'campaigns' && (
              <div className="crm-page-head">
                <div>
                  <h1>{view === 'dashboard' ? `Welcome back, ${firstName}` : PAGE_META[view].title}</h1>
                  <p>{PAGE_META[view].sub}</p>
                </div>
                {view === 'dashboard' && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="crm-btn crm-btn-ghost" onClick={exportContactsCSV} disabled={contacts.length === 0}><FileText size={15} /> Export</button>
                    <button className="crm-btn crm-btn-primary" onClick={() => { setCForm(blankContact); setContactErr(''); setShowContactForm(true); }}><Plus size={15} /> Add lead</button>
                  </div>
                )}
                {view === 'eventTypes' && etTab === 'eventTypes' && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {googleConnected ? (
                       <span style={{ fontSize: '0.85rem', color: '#166534', background: '#dcfce7', padding: '6px 12px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                         <Check size={14}/> Connected to Google
                       </span>
                    ) : (
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                         <span style={{ fontSize: '0.85rem', color: '#991b1b', background: '#fee2e2', padding: '6px 12px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                           <X size={14}/> Not connected
                         </span>
                         <button 
                           className="crm-btn" 
                           style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#0f172a' }}
                           onClick={handleConnectGoogle}
                         >
                           <CalendarCheck size={15} color="#0E61F3" /> Click to connect
                         </button>
                       </div>
                    )}
                    <button className="crm-btn crm-btn-primary" onClick={() => setEditingEvent('new')}><Plus size={15} /> New event type</button>
                  </div>
                )}
                {view === 'workflows' && !editingWorkflow && <button className="crm-btn" style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: '6px', padding: '0 16px', height: '36px', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => handleCreateWorkflow(null)}><Plus size={16} /> New</button>}
              </div>
            )}

            {/* ---------- DASHBOARD (leads + follow-ups) ---------- */}
            {view === 'dashboard' && (
              <div className="crm-fade">
                <div className="crm-kpis">
                  {[
                    { icon: Users, val: contacts.length, lab: 'Total leads' },
                    { icon: CalendarCheck, val: followUps.length, lab: 'Needs follow-up' },
                    { icon: Trophy, val: statusCounts.Won, lab: 'Won' },
                    { icon: UserPlus, val: addedThisWeek, lab: 'New this week', up: true },
                  ].map(k => {
                    const Icon = k.icon;
                    return (
                      <div className="crm-kpi" key={k.lab}>
                        <div className="crm-kpi-top">
                          <span className="crm-kpi-ic" style={{ background: ACCENT_SOFT, color: ACCENT }}><Icon size={19} /></span>
                          {k.up && k.val > 0 && <span className="crm-kpi-delta up"><ArrowUpRight size={12} />+{k.val}</span>}
                        </div>
                        <div className="crm-kpi-val">{contactsLoading ? '—' : k.val}</div>
                        <div className="crm-kpi-lab">{k.lab}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="crm-grid-2">
                  {/* Follow-ups queue */}
                  <div className="crm-card">
                    <div className="crm-card-head">
                      <div><h3>Follow-ups</h3><span className="sub">Leads that need attention</span></div>
                      <button className="crm-btn crm-btn-ghost" onClick={() => { setPeopleTab('contacts'); setView('people'); }}>View all</button>
                    </div>
                    {contactsLoading ? (
                      <div style={{ padding: 28, textAlign: 'center', color: 'var(--muted)' }}><Loader2 size={20} className="crm-spin-ic" /></div>
                    ) : followUps.length === 0 ? (
                      <div className="crm-empty" style={{ padding: '28px 10px' }}>
                        <span className="ic"><CheckCircle2 size={22} /></span>
                        <h3>You’re all caught up</h3>
                        <p>New leads from your booking page will appear here to follow up.</p>
                      </div>
                    ) : (
                      followUps.slice(0, 5).map(c => (
                        <div className="crm-task" key={c.id} style={{ padding: '13px 0' }}>
                          <span className="crm-av" style={{ background: ACCENT }}>{initials(c.name)}</span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.86rem', fontWeight: 500 }}>{c.name}</div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>{c.source || c.email}</div>
                          </div>
                          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span className={`crm-tag ${STATUS_META[c.status].tag}`}>{c.status}</span>
                            <button className="crm-btn crm-btn-ghost" onClick={() => changeStatus(c.id, 'Won')}>Mark won</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* By status donut */}
                  <div className="crm-card">
                    <div className="crm-card-head"><h3>Leads by status</h3></div>
                    {contacts.length === 0 ? (
                      <div className="crm-empty" style={{ padding: '28px 10px' }}>
                        <span className="ic"><Users size={22} /></span>
                        <h3>No leads yet</h3>
                        <p>Add one manually or get them automatically from your booking widget.</p>
                        <button className="crm-btn crm-btn-primary" style={{ margin: '0 auto' }} onClick={() => { setCForm(blankContact); setShowContactForm(true); }}><Plus size={15} /> Add lead</button>
                      </div>
                    ) : (
                      <div className="crm-donut-wrap">
                        <Donut stages={statusStages} total={contacts.length} label="leads" />
                        <div className="crm-legend">
                          {statusStages.map(s => (
                            <div className="crm-legend-row" key={s.name}>
                              <span className="sw" style={{ background: s.color }} />
                              <span>{s.name}</span><span className="val">{s.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent leads */}
                <div className="crm-card">
                  <div className="crm-card-head">
                    <h3>Recent leads</h3>
                    <button className="crm-btn crm-btn-ghost" onClick={() => { setPeopleTab('contacts'); setView('people'); }}>View all</button>
                  </div>
                  {contacts.length === 0 && !contactsLoading ? (
                    <div className="crm-empty" style={{ padding: '34px 10px' }}>
                      <span className="ic"><Users size={24} /></span>
                      <h3>Your leads will show here</h3>
                      <p>Every booking from your embedded widget becomes a lead you can follow up.</p>
                      <button className="crm-btn crm-btn-primary" style={{ margin: '0 auto' }} onClick={() => setView('eventTypes')}><Rocket size={15} /> Set up your booking widget</button>
                    </div>
                  ) : (
                    <div className="crm-table">
                      <div className="crm-tr contacts head">
                        <span>Name</span><span className="crm-hide">Source</span><span>Email</span><span className="crm-hide">Phone</span><span>Status</span><span />
                      </div>
                      {filteredContacts.slice(0, 6).map((c, i) => (
                        <div className="crm-tr contacts" key={c.id}>
                          <span className="crm-nm"><span className="crm-av" style={{ background: avColor(i) }}>{initials(c.name)}</span>{c.name}</span>
                          <span className="crm-muted crm-hide">{c.source || 'Manual'}</span>
                          <span className="crm-muted">{c.email}</span>
                          <span className="crm-muted crm-hide">{c.phone || '—'}</span>
                          <span className={`crm-tag ${STATUS_META[c.status].tag}`}>{c.status}</span>
                          <button className="crm-row-act" title="Delete" onClick={() => removeContact(c.id, c.name)}><Trash2 size={15} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ---------- EVENT TYPES & AVAILABILITY ---------- */}
            {view === 'eventTypes' && (
              <div className="crm-fade">
                <div className="crm-seg" style={{ width: 'fit-content', marginBottom: 22 }}>
                  <button className={etTab === 'eventTypes' ? 'on' : ''} onClick={() => setEtTab('eventTypes')}>Event Types</button>
                  <button className={etTab === 'availability' ? 'on' : ''} onClick={() => setEtTab('availability')}>Availability</button>
                </div>

                {etTab === 'eventTypes' ? (
                  <div style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {eventTypes.map((e, index) => (
                    <div key={e.slug} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      borderBottom: index < eventTypes.length - 1 ? '1px solid #e2e8f0' : 'none',
                    }}>
                      {/* Left */}
                      <div 
                        style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, cursor: 'pointer' }}
                        onClick={() => setEditingEvent(e)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{e.title}</span>
                          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/{uid}/{e.slug}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            display: 'flex', alignItems: 'center', gap: '4px',
                            fontSize: '0.75rem', color: '#475569',
                            background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px'
                          }}>
                            <Clock size={12} /> {e.dur}
                          </span>
                          {!e.active && (
                            <span style={{
                              display: 'flex', alignItems: 'center', gap: '4px',
                              fontSize: '0.75rem', color: '#b45309',
                              background: '#fef3c7', padding: '2px 6px', borderRadius: '4px',
                              fontWeight: 600
                            }}>
                              <EyeOff size={12} /> Hidden
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Right */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button 
                          className={`crm-switch${e.active ? ' on' : ''}`} 
                          aria-label="Active" 
                          onClick={() => toggleEventType(e.id, !e.active)}
                          style={{ transform: 'scale(0.85)', transformOrigin: 'center' }}
                        />
                        <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 4px' }} />
                        <button 
                          className="et-icon-btn"
                          onClick={() => window.open(`/book/${uid}/${e.slug}`, '_blank')}
                          title="Preview"
                        >
                          <ExternalLink size={16} />
                        </button>
                        <button 
                          className="et-icon-btn"
                          onClick={() => {
                            navigator.clipboard?.writeText(`${window.location.origin}/book/${uid}/${e.slug}`);
                            setToast('Link copied');
                            window.setTimeout(() => setToast(null), 1800);
                          }}
                          title="Copy Link"
                        >
                          <Link2 size={16} />
                        </button>
                        
                        {/* Dropdown Wrapper */}
                        <div style={{ position: 'relative' }}>
                          <button 
                            className="et-icon-btn"
                            onClick={() => setEtDropdown(etDropdown === e.id ? null : e.id)}
                            title="More Options"
                          >
                            <MoreHorizontal size={16} />
                          </button>

                          {etDropdown === e.id && (
                            <>
                              {/* Invisible backdrop to close dropdown */}
                              <div 
                                style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                                onClick={() => setEtDropdown(null)}
                              />
                              <div style={{
                                position: 'absolute', right: 0, top: '40px',
                                background: '#fff', border: '1px solid #e2e8f0',
                                borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                minWidth: '160px', zIndex: 50, padding: '4px'
                              }}>
                                <button className="et-dd-btn" onClick={() => { 
                                  setEtDropdown(null); 
                                  setEditingEvent(e);
                                }}>
                                  <Edit2 size={14} /> Edit
                                </button>
                                <button className="et-dd-btn" onClick={async () => { 
                                  setEtDropdown(null); 
                                  try {
                                    await addEventType(uid, { ...e, slug: e.slug + '-copy', title: e.title + ' (Copy)' });
                                    setToast('Event type duplicated');
                                  } catch (err: any) {
                                    setToast('Failed to duplicate');
                                  }
                                }}>
                                  <Copy size={14} /> Duplicate
                                </button>
                                <button className="et-dd-btn" onClick={() => { 
                                  setEtDropdown(null); 
                                  const code = `<!-- LinksMeet inline widget begin -->\n<div class="linksmeet-inline-widget" data-url="${window.location.origin}/book/${uid}/${e.slug}" style="min-width:320px;height:700px;"></div>\n<script type="text/javascript" src="${window.location.origin}/widget.js" async></script>\n<!-- LinksMeet inline widget end -->`;
                                  navigator.clipboard?.writeText(code).catch(() => {});
                                  setToast('Embed code copied'); window.setTimeout(() => setToast(null), 1800);
                                }}>
                                  <Code size={14} /> Embed
                                </button>
                                <button className="et-dd-btn" onClick={() => { setEtDropdown(null); setToast('Troubleshooting'); }}>
                                  <CalendarCheck size={14} /> Troubleshoot
                                </button>
                                <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
                                <button className="et-dd-btn" style={{ color: '#ef4444' }} onClick={async () => {
                                  setEtDropdown(null);
                                  if (confirm(`Delete ${e.title}?`)) {
                                    try {
                                      await deleteEventType(uid, e.id);
                                      setToast('Event type deleted');
                                    } catch(err) {
                                      setToast('Failed to delete');
                                    }
                                  }
                                }}>
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                ) : (
                  <div className="cal-layout">
                    {/* Header */}
                    <div className="cal-header">
                      <div className="cal-header-left">
                        <button className="cal-back-btn" onClick={() => setEtTab('eventTypes')}>
                          <ArrowLeft size={18} />
                        </button>
                        <div className="cal-title-group">
                          <h2>Working hours <Edit2 size={16} /></h2>
                          <p>Mon - Fri, 9:00 AM - 5:00 PM</p>
                        </div>
                      </div>
                      <div className="cal-header-right">
                        <label className="cal-default-toggle" style={{ cursor: 'pointer' }} onClick={() => setAvailIsDefault(!availIsDefault)}>
                          Set as default
                          <button className={`cal-switch ${availIsDefault ? 'on' : ''}`} aria-label="Default toggle" />
                        </label>
                        <button className="cal-btn-icon" aria-label="Delete schedule">
                          <Trash2 size={16} />
                        </button>
                        <button className="cal-btn-save" onClick={saveAvailability}>
                          Save
                        </button>
                      </div>
                    </div>

                    {/* Content Grid */}
                    <div className="cal-grid">
                      {/* Left Column */}
                      <div>
                        {/* Weekly Schedule Card */}
                        <div className="cal-card">
                          {availSchedule.map((d, index) => (
                            <div key={d.day} className={`cal-row${d.on ? '' : ' off'}`}>
                              <div className="cal-row-left">
                                <button 
                                  className={`cal-switch${d.on ? ' on' : ''}`} 
                                  aria-label={d.day}
                                  onClick={() => {
                                    const newSched = [...availSchedule];
                                    newSched[index].on = !newSched[index].on;
                                    setAvailSchedule(newSched);
                                  }}
                                />
                                <span className="cal-row-day">{d.day}</span>
                              </div>
                              
                              <div className="cal-row-times" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                {d.on ? (
                                  d.slots && d.slots.length > 0 ? d.slots.map((slot: any, sIndex: number) => (
                                    <div key={sIndex} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                      <input 
                                        type="time" 
                                        className="cal-time-input"
                                        value={slot.start} 
                                        onChange={(e) => {
                                          const newSched = [...availSchedule];
                                          newSched[index].slots[sIndex].start = e.target.value;
                                          setAvailSchedule(newSched);
                                        }}
                                      />
                                      <span style={{ color: '#94A3B8', fontWeight: 500 }}>-</span>
                                      <input 
                                        type="time" 
                                        className="cal-time-input"
                                        value={slot.end} 
                                        onChange={(e) => {
                                          const newSched = [...availSchedule];
                                          newSched[index].slots[sIndex].end = e.target.value;
                                          setAvailSchedule(newSched);
                                        }}
                                      />
                                      <div className="cal-row-actions" style={{ marginLeft: 0 }}>
                                        <Trash2 size={16} onClick={() => {
                                          const newSched = [...availSchedule];
                                          newSched[index].slots.splice(sIndex, 1);
                                          if (newSched[index].slots.length === 0) newSched[index].on = false;
                                          setAvailSchedule(newSched);
                                        }} />
                                      </div>
                                    </div>
                                  )) : <div style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Unavailable</div>
                                ) : (
                                  <div style={{ color: '#94A3B8', fontSize: '0.9rem', opacity: 0 }}>Unavailable</div>
                                )}
                              </div>
                              
                              <div className="cal-row-actions" style={{ marginLeft: 'auto', alignSelf: 'flex-start', marginTop: '6px' }}>
                                {d.on && <Plus size={16} onClick={() => {
                                  const newSched = [...availSchedule];
                                  newSched[index].slots.push({start: '09:00', end: '17:00'});
                                  setAvailSchedule(newSched);
                                }} />}
                                <Copy size={16} onClick={() => {
                                  const newSched = [...availSchedule];
                                  const slotsToCopy = JSON.parse(JSON.stringify(d.slots));
                                  newSched.forEach(day => {
                                    if (day.day !== 'Saturday' && day.day !== 'Sunday') {
                                      day.on = d.on;
                                      day.slots = JSON.parse(JSON.stringify(slotsToCopy));
                                    }
                                  });
                                  setAvailSchedule(newSched);
                                  setToast('Copied to all weekdays');
                                  setTimeout(() => setToast(null), 2000);
                                }} />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Date Overrides Card */}
                        <div className="cal-card cal-overrides-card">
                          <h3>Date overrides <Info size={14} style={{ color: '#94A3B8' }} /></h3>
                          <p>Add dates when your availability changes from your daily hours.</p>
                          <button className="cal-btn-outline">
                            <Plus size={14} /> Add an override
                          </button>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div>
                        <div className="cal-side-section">
                          <label className="cal-side-label">Timezone</label>
                          <div style={{ position: 'relative' }}>
                            <input 
                              type="text"
                              className="cal-select" 
                              style={{ paddingLeft: '36px', width: '100%' }}
                              value={tzOpen ? tzSearch : TIMEZONES.find((t: any) => t.id === availPrefs.tz)?.label || availPrefs.tz}
                              onClick={() => { setTzOpen(true); setTzSearch(''); }}
                              onChange={(e) => {
                                setTzSearch(e.target.value);
                                if (!tzOpen) setTzOpen(true);
                              }}
                              onBlur={() => setTimeout(() => setTzOpen(false), 200)}
                            />
                            <Globe size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }} />
                            
                            {tzOpen && (
                              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', marginTop: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', zIndex: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                                  {TIMEZONES.filter((tz: any) => tz.label.toLowerCase().includes(tzSearch.toLowerCase())).map((tz: any) => (
                                    <div 
                                      key={tz.id} 
                                      style={{ padding: '8px 12px', fontSize: '0.85rem', color: '#0F172A', cursor: 'pointer', background: availPrefs.tz === tz.id ? '#F8FAFC' : 'transparent', fontWeight: availPrefs.tz === tz.id ? 600 : 400 }}
                                      onClick={() => {
                                        setAvailPrefs({ ...availPrefs, tz: tz.id });
                                        setTzOpen(false);
                                        setTzSearch('');
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
                                      onMouseLeave={(e) => e.currentTarget.style.background = availPrefs.tz === tz.id ? '#F8FAFC' : 'transparent'}
                                    >
                                      {tz.label}
                                    </div>
                                  ))}
                                  {TIMEZONES.filter((tz: any) => tz.label.toLowerCase().includes(tzSearch.toLowerCase())).length === 0 && (
                                    <div style={{ padding: '12px', fontSize: '0.85rem', color: '#64748B', textAlign: 'center' }}>No timezones found</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---------- BOOKINGS ---------- */}
            {view === 'bookings' && (
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
            {view === 'people' && (
              <div className="crm-fade">
                <div className="crm-seg" style={{ width: 'fit-content', marginBottom: 22 }}>
                  <button className={leadsTab === 'inbound' ? 'on' : ''} onClick={() => setLeadsTab('inbound')}>Inbound Enquiries</button>
                  <button className={leadsTab === 'uploaded' ? 'on' : ''} onClick={() => setLeadsTab('uploaded')}>
                    Uploaded Leads
                  </button>
                </div>
                
                <div className="crm-card">
                  <div className="crm-card-head">
                    <h3>{leadsTab === 'inbound' ? 'Inbound Leads' : 'Uploaded Leads'} <span style={{ color: '#9b9bab', fontWeight: 500 }}>({(leadsTab === 'inbound' ? filteredContacts.filter(c => c.source !== 'uploaded') : filteredContacts.filter(c => c.source === 'uploaded')).length})</span></h3>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="crm-btn crm-btn-ghost" onClick={exportContactsCSV} disabled={contacts.length === 0}><FileText size={15} /> Export</button>
                      {leadsTab === 'uploaded' ? (
                        <>
                          <input type="file" accept=".csv, .xlsx, .xls" ref={fileInputRef} style={{ display: 'none' }} onChange={handleUploadFile} />
                          <button className="crm-btn crm-btn-primary" onClick={() => fileInputRef.current?.click()} disabled={savingContact}>
                            {savingContact ? <Loader2 size={15} className="crm-spin-ic" /> : <Plus size={15} />} Upload CSV/Excel
                          </button>
                        </>
                      ) : (
                        <button className="crm-btn crm-btn-primary" onClick={() => { setCForm(blankContact); setContactErr(''); setShowContactForm(true); }}><Plus size={15} /> Add lead</button>
                      )}
                    </div>
                  </div>

                  {contactErr && <div style={{ background: '#fdecec', border: '1px solid #f6c9c9', color: '#b42318', fontSize: '0.82rem', padding: '10px 12px', borderRadius: 9, marginBottom: 12 }}>{contactErr}</div>}

                  {contactsLoading ? (
                    <div style={{ padding: 50, textAlign: 'center', color: 'var(--muted)' }}><Loader2 size={22} className="crm-spin-ic" /></div>
                  ) : (leadsTab === 'inbound' ? filteredContacts.filter(c => c.source !== 'uploaded') : filteredContacts.filter(c => c.source === 'uploaded')).length === 0 ? (
                    <div className="crm-empty">
                      <span className="ic"><Users size={24} /></span>
                      <h3>{contacts.length === 0 ? `No ${leadsTab} leads yet` : `No leads match “${search}”`}</h3>
                      <p>{leadsTab === 'inbound' ? 'Connect your booking widget so every enquiry creates one automatically.' : 'Upload your leads via Excel or CSV.'}</p>
                    </div>
                  ) : (
                    <div className="crm-table">
                      <div className="crm-tr lead head" style={{ gridTemplateColumns: '2fr 1fr 2fr 1fr 120px' }}><span>Name</span><span className="crm-hide">Source</span><span>Email</span><span>Status</span><span /></div>
                      {(leadsTab === 'inbound' ? filteredContacts.filter(c => c.source !== 'uploaded') : filteredContacts.filter(c => c.source === 'uploaded')).map((c, i) => (
                          <div className="crm-tr lead" key={c.id} style={{ gridTemplateColumns: '2fr 1fr 2fr 1fr 120px' }}>
                            <span className="crm-nm"><span className="crm-av" style={{ background: avColor(i) }}>{initials(c.name)}</span>{c.name}</span>
                            <span className="crm-hide">
                              {c.source?.startsWith('Booking') ? (
                                <span style={{ padding: '4px 10px', background: '#eff6ff', color: '#2563eb', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  Booking
                                </span>
                              ) : (
                                <span style={{ padding: '4px 10px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 500 }}>
                                  {c.source || 'Manual'}
                                </span>
                              )}
                            </span>
                            <span className="crm-muted">{c.email}</span>
                            <select
                              className="crm-status-select"
                              value={c.status}
                              onChange={e => changeStatus(c.id, e.target.value as ContactStatus)}
                            >
                              {CONTACT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
                              <button 
                                style={{ background: '#eff6ff', border: 'none', color: '#0E61F3', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Start AI Campaign" 
                                onClick={() => {
                                  setInitCampaignLead(c);
                                  setView('campaigns');
                                }}
                              >
                                <Sparkles size={16} />
                              </button>
                              <button className="crm-row-act" title="Delete lead" onClick={() => removeContact(c.id, c.name)}><Trash2 size={16} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
              </div>
            )}

            {/* ---------- TEAMS ---------- */}
            {view === 'teams' && (
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
            {view === 'workflows' && (
              editingWorkflow ? (
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
              )
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

            {/* ---------- CAMPAIGNS ---------- */}
            {view === 'campaigns' && (
              <CampaignModule initLead={initCampaignLead} onInitConsumed={() => setInitCampaignLead(null)} userProfile={userProfile} />
            )}

            {/* ---------- ROUTING ---------- */}
            {view === 'routing' && (
              <EmptyState icon={Spline} title="Build your first routing form" body="Ask qualifying questions, then automatically send bookers to the right person or event type." cta="Create routing form" />
            )}



            {/* ---------- APPS (App Store + Installed) ---------- */}
            {view === 'apps' && (
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
            )}

            {/* ---------- PAYMENTS ---------- */}
            {view === 'payments' && (
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
            {view === 'admin' && (
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
            {view === 'help' && (
              <div className="crm-fade crm-help-grid">
                {[
                  { icon: BookOpen, h: 'Getting started', p: 'Set up your account and book your first meeting.' },
                  { icon: FileText, h: 'Documentation', p: 'Browse guides for every LinksMeet feature.' },
                  { icon: MessageCircle, h: 'Contact support', p: 'Reach our team — we reply within a few hours.' },
                  { icon: Keyboard, h: 'Keyboard shortcuts', p: 'Move faster with handy shortcuts.' },
                ].map(c => {
                  const Icon = c.icon;
                  return (
                    <div className="crm-help-card" key={c.h}>
                      <span className="ic"><Icon size={18} /></span>
                      <h4>{c.h}</h4><p>{c.p}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------- Upgrade modal ---------- */}
      {upgradeOpen && (
        <div className="crm-modal-overlay" onClick={() => setUpgradeOpen(false)}>
          <div className="crm-modal" onClick={e => e.stopPropagation()}>
            <div className="crm-modal-head">
              <div>
                <h3>Upgrade your plan</h3>
                <p>Pick the plan that fits your team. Cancel or change anytime.</p>
              </div>
              <button className="crm-modal-x" onClick={() => setUpgradeOpen(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="crm-plan-grid">
              {PLANS_UP.map(p => {
                const current = plan === p.name;
                return (
                  <div key={p.name} className={`crm-plan${p.featured ? ' featured' : ''}`}>
                    {p.featured && <span className="crm-plan-badge">Most Popular</span>}
                    <div className="crm-plan-name">{p.name}</div>
                    <div className="crm-plan-price">{p.price}<span>{p.period}</span></div>
                    <ul className="crm-plan-feats">
                      {p.feats.map(f => <li key={f}><Check size={14} strokeWidth={2.5} />{f}</li>)}
                    </ul>
                    <button
                      className={`crm-btn ${p.featured ? 'crm-btn-primary' : 'crm-btn-ghost'}`}
                      style={{ width: '100%' }}
                      disabled={current}
                      onClick={() => choosePlan(p.name)}
                    >
                      {current ? 'Current plan' : `Choose ${p.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {showContactForm && (
        <div className="crm-modal-overlay" onClick={() => setShowContactForm(false)}>
          <form className="crm-modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()} onSubmit={submitContact}>
            <div className="crm-modal-head">
              <div><h3>Add a lead</h3><p>New leads also arrive automatically from your booking widget.</p></div>
              <button type="button" className="crm-modal-x" onClick={() => setShowContactForm(false)} aria-label="Close"><X size={18} /></button>
            </div>
            {contactErr && <div style={{ background: '#fdecec', border: '1px solid #f6c9c9', color: '#b42318', fontSize: '0.82rem', padding: '10px 12px', borderRadius: 9, marginBottom: 14 }}>{contactErr}</div>}
            <div className="crm-field"><label>Full name *</label><input value={cForm.name} onChange={e => setCForm({ ...cForm, name: e.target.value })} placeholder="Jane Cooper" /></div>
            <div className="crm-field"><label>Email *</label><input type="email" value={cForm.email} onChange={e => setCForm({ ...cForm, email: e.target.value })} placeholder="jane@company.com" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="crm-field"><label>Company</label><input value={cForm.company} onChange={e => setCForm({ ...cForm, company: e.target.value })} placeholder="Acme Inc." /></div>
              <div className="crm-field"><label>Phone</label><input value={cForm.phone} onChange={e => setCForm({ ...cForm, phone: e.target.value })} placeholder="+1 (555) 000-0000" /></div>
            </div>
            <div className="crm-field"><label>Status</label>
              <select value={cForm.status} onChange={e => setCForm({ ...cForm, status: e.target.value as ContactStatus })}>
                {CONTACT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button type="submit" className="crm-btn crm-btn-primary" style={{ width: '100%' }} disabled={savingContact}>
              {savingContact ? 'Saving…' : 'Add lead'}
            </button>
          </form>
        </div>
      )}

      {/* Manage App Modal */}
      {manageApp && (
        <div className="crm-modal-overlay" onClick={() => setManageApp(null)}>
          <div className="crm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, textAlign: 'center', position: 'relative' }}>
            <button 
              onClick={() => setManageApp(null)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
            >
              <X size={20} />
            </button>
            <img src={manageApp.logo} alt={manageApp.nm} style={{ width: 64, height: 64, margin: '0 auto 16px', objectFit: 'contain' }} />
            <h2 style={{ marginBottom: 8 }}>{manageApp.nm}</h2>
            <p style={{ color: '#6B7280', marginBottom: 24, fontSize: '0.9rem' }}>
              {manageApp.nm} is currently connected and syncing data.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="crm-btn crm-btn-ghost" onClick={() => setManageApp(null)}>Cancel</button>
              <button className="crm-btn" style={{ background: '#ef4444' }} onClick={confirmDisconnectApp}>
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- INVITE MODAL ---------- */}
      {showInviteModal && (
        <div className="crm-modal-overlay" onClick={() => setShowInviteModal(false)}>
          <form className="crm-modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()} onSubmit={handleInviteSubmit}>
            <div className="crm-modal-head">
              <div>
                <h3>Invite Team Member</h3>
                <p>They will receive an email invitation to join your workspace.</p>
              </div>
              <button type="button" className="crm-modal-x" onClick={() => setShowInviteModal(false)} aria-label="Close"><X size={18} /></button>
            </div>
            
            <div className="crm-field">
              <label>Email Address *</label>
              <input 
                type="email" 
                placeholder="colleague@example.com" 
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="crm-field">
              <label>Role</label>
              <select 
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
              >
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            
            <button type="submit" className="crm-btn crm-btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              Send Invite
            </button>
          </form>
        </div>
      )}

      {/* ---------- Toast ---------- */}
      {toast && (
        <div className="crm-toast"><Check size={15} /> {toast}</div>
      )}
      </div>
    </div>
  );
}
