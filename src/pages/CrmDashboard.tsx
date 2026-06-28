import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Users, BarChart3, Search, Bell, Plus, ArrowUpRight, ArrowDownRight,
  DollarSign, Trophy, Target, UserPlus, MoreHorizontal, FileText,
  CheckCircle2, Menu, TrendingUp, CalendarRange, CalendarCheck,
  Clock, Workflow, Spline, Store, CreditCard, Shield, HelpCircle,
  Sparkles, Link2, Video, Zap, BookOpen, MessageCircle, Keyboard, Check, X,
  Copy, Rocket, Calendar, Trash2, LogOut, Loader2, Play, EyeOff, ExternalLink, Edit2, Code, Info, ArrowLeft, Globe
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../lib/config';
import { 
  listContacts, addContact, updateContact, deleteContact,
  listenEventTypes, addEventType, updateEventType, deleteEventType,
  listenBookings, addBooking, deleteBooking, type Contact, type ContactStatus, type EventType, type Booking 
} from '../lib/crm';
import './CrmDashboard.css';
import CampaignModule from '../components/campaigns/CampaignModule';
import EventTypeEditor from '../components/EventTypeEditor';

type View =
  | 'dashboard' | 'eventTypes' | 'bookings' | 'availability' | 'people'
  | 'workflows' | 'campaigns' | 'routing' | 'insights' | 'apps' | 'payments'
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


const REVENUE = [
  { m: 'Jan', v: 42 }, { m: 'Feb', v: 55 }, { m: 'Mar', v: 48 }, { m: 'Apr', v: 67 },
  { m: 'May', v: 72 }, { m: 'Jun', v: 64 }, { m: 'Jul', v: 81 }, { m: 'Aug', v: 88 },
  { m: 'Sep', v: 76 }, { m: 'Oct', v: 95 }, { m: 'Nov', v: 102 }, { m: 'Dec', v: 118 },
];

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
  { title: 'Product Demo', dur: '45m', slug: 'demo', desc: 'Guided walkthrough of SaleMail.' },
  { title: 'Strategy Session', dur: '60m', slug: 'strategy', desc: 'Deep-dive planning with the team.' },
  { title: 'Group Webinar', dur: '90m', slug: 'webinar', desc: 'Multi-attendee live session.' },
];

const DEFAULT_BOOKINGS = [
  { name: 'Logan Mitchell', event: 'Product Demo', when: 'Today · 10:00 AM', status: 'upcoming' },
  { name: 'Priya Anand', event: '30 Min Meeting', when: 'Today · 2:30 PM', status: 'upcoming' },
  { name: 'Maya Coleman', event: 'Strategy Session', when: 'Tomorrow · 11:00 AM', status: 'upcoming' },
  { name: 'Daniel Osei', event: '15 Min Meeting', when: 'Jun 14 · 9:15 AM', status: 'past' },
  { name: 'Aiden Parker', event: 'Product Demo', when: 'Jun 12 · 4:00 PM', status: 'past' },
  { name: 'Sienna Brooks', event: '30 Min Meeting', when: 'Jun 10 · 1:00 PM', status: 'cancelled' },
];

const DEFAULT_WEEK = [
  { day: 'Monday', on: true, start: '09:00', end: '17:00' },
  { day: 'Tuesday', on: true, start: '09:00', end: '17:00' },
  { day: 'Wednesday', on: true, start: '09:00', end: '17:00' },
  { day: 'Thursday', on: true, start: '09:00', end: '17:00' },
  { day: 'Friday', on: true, start: '09:00', end: '17:00' },
  { day: 'Saturday', on: false, start: '09:00', end: '17:00' },
  { day: 'Sunday', on: false, start: '09:00', end: '17:00' },
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
  { nm: 'Google Meet', cat: 'Conferencing', ds: 'Auto-add Meet links to bookings.', c: ACCENT, ltr: 'G' },
  { nm: 'Zoom', cat: 'Conferencing', ds: 'Host meetings over Zoom.', c: ACCENT, ltr: 'Z' },
  { nm: 'Stripe', cat: 'Payments', ds: 'Collect payments at booking.', c: ACCENT, ltr: 'S' },
  { nm: 'Slack', cat: 'Messaging', ds: 'Get notified in your channels.', c: ACCENT, ltr: 'S' },
  { nm: 'Zapier', cat: 'Automation', ds: 'Connect 5,000+ apps.', c: ACCENT, ltr: 'Z' },
  { nm: 'Salesforce', cat: 'CRM', ds: 'Sync contacts and deals.', c: ACCENT, ltr: 'S' },
  { nm: 'HubSpot', cat: 'CRM', ds: 'Two-way contact sync.', c: ACCENT, ltr: 'H' },
  { nm: 'Google Calendar', cat: 'Calendar', ds: 'Check for conflicts in real time.', c: ACCENT, ltr: 'G' },
];

const INSTALLED = [
  { nm: 'Google Calendar', cat: 'Calendar', c: ACCENT, ltr: 'G' },
  { nm: 'Google Meet', cat: 'Conferencing', c: ACCENT, ltr: 'G' },
  { nm: 'Stripe', cat: 'Payments', c: ACCENT, ltr: 'S' },
  { nm: 'Slack', cat: 'Messaging', c: ACCENT, ltr: 'S' },
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
  { id: 1, icon: CheckCircle2, title: 'Deal won', desc: 'Ramp closed for $40,000', time: '12m', read: false, target: 'insights' },
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
  ]},
  { label: 'Automate', items: [
    { id: 'workflows', label: 'Workflows', icon: Workflow },
    { id: 'campaigns', label: 'Campaigns', icon: MessageCircle, badge: 'New', badgeNew: true },
    { id: 'routing', label: 'Routing', icon: Spline },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
  ]},
  { label: 'Apps', items: [
    { id: 'apps', label: 'Apps', icon: Store },
    { id: 'payments', label: 'Payments', icon: CreditCard, badge: 'New', badgeNew: true },
  ]},
];

const PAGE_META: Record<View, { title: string; sub: string }> = {
  dashboard: { title: 'Dashboard', sub: 'Your leads and follow-ups at a glance.' },
  eventTypes: { title: 'Event Types', sub: 'Create scheduling links people can book.' },
  bookings: { title: 'Bookings', sub: 'Your upcoming and past meetings.' },
  availability: { title: 'Availability', sub: 'Set the hours you’re open for bookings.' },
  people: { title: 'Leads', sub: 'Manage your leads and follow-ups.' },
  workflows: { title: 'Workflows', sub: 'Automate reminders and follow-ups.' },
  campaigns: { title: 'Campaigns', sub: 'Create and orchestrate outbound email sequences.' },
  routing: { title: 'Routing', sub: 'Send bookers to the right person with forms.' },
  insights: { title: 'Insights', sub: 'Performance trends and sales analytics.' },
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

  const [view, setView] = useState<View>('dashboard');
  const [sideOpen, setSideOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [notif, setNotif] = useState({ deals: true, weekly: true, mentions: false });
  const [bookingTab, setBookingTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [appCat, setAppCat] = useState('All');
  const [appsTab, setAppsTab] = useState<'store' | 'installed'>('store');
  const [peopleTab, setPeopleTab] = useState<'contacts' | 'teams'>('contacts');
  const [etTab, setEtTab] = useState<'eventTypes' | 'availability'>('eventTypes');
  const [etDropdown, setEtDropdown] = useState<string | null>(null);

  // Availability State
  const [availSchedule, setAvailSchedule] = useState(DEFAULT_WEEK);
  const [availPrefs, setAvailPrefs] = useState({ tz: 'America/New_York', notice: '4 hours', buffer: '15 minutes' });
  const [tzOpen, setTzOpen] = useState(false);
  const [tzSearch, setTzSearch] = useState('');
  const saveAvailability = () => {
    setToast('Availability saved!');
    window.setTimeout(() => setToast(null), 2000);
  };
  
  // Google Calendar Integration Mock State
  const [googleConnected, setGoogleConnected] = useState(localStorage.getItem('googleCalConnected') === 'true');

  const handleConnectGoogle = async () => {
    // Simulate OAuth flow
    setToast('Redirecting to Google...');
    setTimeout(async () => {
      localStorage.setItem('googleCalConnected', 'true');
      setGoogleConnected(true);
      if (user?.id) {
        // We simulate saving a google_token boolean just to mock it
        await supabase.from('users').update({ google_tokens: 'mock_connected' }).eq('id', user.id).catch(() => {});
      }
      setToast('Google Calendar connected successfully!');
      setTimeout(() => setToast(null), 2000);
    }, 1500);
  };
  const handleDisconnectGoogle = async () => {
    localStorage.removeItem('googleCalConnected');
    setGoogleConnected(false);
    if (user?.id) {
      await supabase.from('users').update({ google_tokens: null }).eq('id', user.id).catch(() => {});
    }
    setToast('Google Calendar disconnected.');
    setTimeout(() => setToast(null), 2000);
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
    a.href = url; a.download = 'salemail-leads.csv'; a.click();
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
        <aside className={`crm-side${sideOpen ? ' open' : ''}`}>
          <div className="crm-brand" style={{ color: '#111' }}>
            <div style={{ width: '10px', height: '10px', background: '#111', transform: 'rotate(45deg)', borderRadius: '1px' }} />
            <span>SaleMail</span>
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
                            <span className="crm-notif-ic"><Icon size={15} /></span>
                            <span className="crm-notif-tx">
                              <span className="t">{n.title}</span>
                              <span className="d">{n.desc}</span>
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

          <div className="crm-content" style={view === 'campaigns' ? { padding: 0, background: '#fcfcfd', display: 'flex', flexDirection: 'column' } : {}}>
            {view !== 'campaigns' && (
              <div className="crm-page-head">
                <div>
                  <h1>{view === 'dashboard' ? `Welcome back, ${firstName}` : PAGE_META[view].title}</h1>
                  <p>{PAGE_META[view].sub}</p>
                </div>
                {view === 'dashboard' && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button 
                      className="crm-btn" 
                      style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#0f172a' }}
                      onClick={() => {
                        window.location.href = `${API_BASE_URL}/auth/google?uid=${uid}`;
                      }}
                    >
                      <CalendarCheck size={15} color="#0E61F3" /> Connect Google Calendar
                    </button>
                    <button className="crm-btn crm-btn-ghost" onClick={exportContactsCSV} disabled={contacts.length === 0}><FileText size={15} /> Export</button>
                    <button className="crm-btn crm-btn-primary" onClick={() => { setCForm(blankContact); setContactErr(''); setShowContactForm(true); }}><Plus size={15} /> Add lead</button>
                  </div>
                )}
                {view === 'eventTypes' && etTab === 'eventTypes' && <button className="crm-btn crm-btn-primary" onClick={() => setEditingEvent('new')}><Plus size={15} /> New event type</button>}
                {view === 'workflows' && <button className="crm-btn crm-btn-primary"><Plus size={15} /> New workflow</button>}
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
                                  const code = `<!-- SaleMail inline widget begin -->\n<div class="salemail-inline-widget" data-url="${window.location.origin}/book/${uid}/${e.slug}" style="min-width:320px;height:700px;"></div>\n<script type="text/javascript" src="${window.location.origin}/widget.js" async></script>\n<!-- SaleMail inline widget end -->`;
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
                        <label className="cal-default-toggle">
                          Set as default
                          <button className="cal-switch on" aria-label="Default toggle" />
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
                              
                              <div className="cal-row-times">
                                {d.on && (
                                  <>
                                    <input 
                                      type="time" 
                                      className="cal-time-input"
                                      value={d.start} 
                                      onChange={(e) => {
                                        const newSched = [...availSchedule];
                                        newSched[index].start = e.target.value;
                                        setAvailSchedule(newSched);
                                      }}
                                    />
                                    <span style={{ color: '#94A3B8', fontWeight: 500 }}>-</span>
                                    <input 
                                      type="time" 
                                      className="cal-time-input"
                                      value={d.end} 
                                      onChange={(e) => {
                                        const newSched = [...availSchedule];
                                        newSched[index].end = e.target.value;
                                        setAvailSchedule(newSched);
                                      }}
                                    />
                                  </>
                                )}
                              </div>
                              
                              <div className="cal-row-actions">
                                {d.on && <Plus size={16} />}
                                <Copy size={16} />
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

            {/* ---------- PEOPLE (Leads + Team) ---------- */}
            {view === 'people' && (
              <div className="crm-fade">
                <div className="crm-seg" style={{ width: 'fit-content', marginBottom: 22 }}>
                  <button className={peopleTab === 'contacts' ? 'on' : ''} onClick={() => setPeopleTab('contacts')}>
                    Leads ({contacts.length})
                  </button>
                  <button className={peopleTab === 'teams' ? 'on' : ''} onClick={() => setPeopleTab('teams')}>Team</button>
                </div>

                {peopleTab === 'contacts' ? (
                  <div className="crm-card">
                    <div className="crm-card-head">
                      <h3>Leads <span style={{ color: '#9b9bab', fontWeight: 500 }}>({filteredContacts.length})</span></h3>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button className="crm-btn crm-btn-ghost" onClick={exportContactsCSV} disabled={contacts.length === 0}><FileText size={15} /> Export</button>
                        <button className="crm-btn crm-btn-primary" onClick={() => { setCForm(blankContact); setContactErr(''); setShowContactForm(true); }}><Plus size={15} /> Add lead</button>
                      </div>
                    </div>

                    {contactErr && <div style={{ background: '#fdecec', border: '1px solid #f6c9c9', color: '#b42318', fontSize: '0.82rem', padding: '10px 12px', borderRadius: 9, marginBottom: 12 }}>{contactErr}</div>}

                    {contactsLoading ? (
                      <div style={{ padding: 50, textAlign: 'center', color: 'var(--muted)' }}><Loader2 size={22} className="crm-spin-ic" /></div>
                    ) : filteredContacts.length === 0 ? (
                      <div className="crm-empty">
                        <span className="ic"><Users size={24} /></span>
                        <h3>{contacts.length === 0 ? 'No leads yet' : `No leads match “${search}”`}</h3>
                        <p>{contacts.length === 0 ? 'Add a lead manually, or connect your booking widget so every booking creates one automatically.' : 'Try a different search.'}</p>
                        {contacts.length === 0 && <button className="crm-btn crm-btn-primary" style={{ margin: '0 auto' }} onClick={() => { setCForm(blankContact); setShowContactForm(true); }}><Plus size={15} /> Add lead</button>}
                      </div>
                    ) : (
                      <div className="crm-table">
                        <div className="crm-tr lead head"><span>Name</span><span className="crm-hide">Source</span><span>Email</span><span>Status</span><span /></div>
                        {filteredContacts.map((c, i) => (
                          <div className="crm-tr lead" key={c.id}>
                            <span className="crm-nm"><span className="crm-av" style={{ background: avColor(i) }}>{initials(c.name)}</span>{c.name}</span>
                            <span className="crm-muted crm-hide">{c.source || 'Manual'}</span>
                            <span className="crm-muted">{c.email}</span>
                            <select
                              className="crm-status-select"
                              value={c.status}
                              onChange={e => changeStatus(c.id, e.target.value as ContactStatus)}
                            >
                              {CONTACT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <button className="crm-row-act" title="Delete lead" onClick={() => removeContact(c.id, c.name)}><Trash2 size={15} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="crm-card">
                    <div className="crm-card-head">
                      <h3>Team</h3>
                      <button className="crm-btn crm-btn-primary" onClick={() => { setToast('Team invites are coming soon'); window.setTimeout(() => setToast(null), 2400); }}><UserPlus size={15} /> Invite member</button>
                    </div>
                    <div className="crm-table">
                      <div className="crm-tr contacts head"><span>Name</span><span className="crm-hide">Role</span><span>Email</span><span className="crm-hide">Status</span><span>Access</span><span /></div>
                      <div className="crm-tr contacts">
                        <span className="crm-nm"><span className="crm-av" style={{ background: ACCENT }}>{userInitials}</span>{displayName}</span>
                        <span className="crm-muted crm-hide">Owner</span>
                        <span className="crm-muted">{user?.email}</span>
                        <span className="crm-muted crm-hide"><span className="crm-tag green">Active</span></span>
                        <span className="crm-tag violet">Owner</span>
                        <span />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---------- WORKFLOWS ---------- */}
            {view === 'workflows' && (
              <div className="crm-fade">
                {WORKFLOWS.map((w, i) => (
                  <div className="crm-wf" key={w.nm}>
                    <span className="crm-wf-ic"><Zap size={18} /></span>
                    <div><div className="nm">{w.nm}</div><div className="fl">{w.fl}</div></div>
                    <span className="runs">{w.runs}</span>
                    <button className={`crm-switch${wf[i] ? ' on' : ''}`} onClick={() => setWf(prev => prev.map((v, idx) => idx === i ? !v : v))} aria-label={w.nm} />
                  </div>
                ))}
              </div>
            )}

            {/* ---------- CAMPAIGNS ---------- */}
            {view === 'campaigns' && (
              <CampaignModule />
            )}

            {/* ---------- ROUTING ---------- */}
            {view === 'routing' && (
              <EmptyState icon={Spline} title="Build your first routing form" body="Ask qualifying questions, then automatically send bookers to the right person or event type." cta="Create routing form" />
            )}

            {/* ---------- INSIGHTS ---------- */}
            {view === 'insights' && (
              <div className="crm-fade">
                <div className="crm-grid-2b">
                  <div className="crm-card">
                    <div className="crm-card-head"><h3>Monthly revenue</h3><span className="sub">in $1,000s</span></div>
                    <div className="crm-chart" style={{ height: 200 }}>
                      <svg viewBox="0 0 640 200" preserveAspectRatio="none">
                        {[0, 1, 2, 3].map(i => <line key={i} x1="8" x2="632" y1={20 + i * 44} y2={20 + i * 44} stroke="#eeeef3" />)}
                        {REVENUE.map((d, i) => {
                          const max = Math.max(...REVENUE.map(r => r.v)) * 1.1;
                          const bw = 632 / REVENUE.length;
                          const h = (d.v / max) * 156;
                          return (
                            <g key={d.m}>
                              <rect x={8 + i * bw + bw * 0.2} y={176 - h} width={bw * 0.6} height={h} rx="4" fill={i === REVENUE.length - 1 ? '#0E61F3' : '#dcd9fb'} />
                              <text x={8 + i * bw + bw / 2} y="194" fontSize="9" fill="#9b9bab" textAnchor="middle">{d.m}</text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                  <div className="crm-card">
                    <div className="crm-card-head"><h3>Conversion funnel</h3></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 6 }}>
                      {[
                        { l: 'Leads', n: 1240, w: 100, c: RAMP[0] },
                        { l: 'Qualified', n: 720, w: 72, c: RAMP[1] },
                        { l: 'Proposal', n: 410, w: 52, c: RAMP[2] },
                        { l: 'Negotiation', n: 210, w: 34, c: RAMP[3] },
                        { l: 'Won', n: 124, w: 18, c: RAMP[4] },
                      ].map(f => (
                        <div key={f.l}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 5 }}>
                            <span style={{ color: '#6a6a78' }}>{f.l}</span><span style={{ fontWeight: 500 }}>{f.n.toLocaleString()}</span>
                          </div>
                          <div className="crm-prog"><span style={{ width: `${f.w}%`, background: f.c }} /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="crm-kpis" style={{ marginBottom: 0 }}>
                  {[
                    { icon: TrendingUp, ic: ACCENT, bg: ACCENT_SOFT, val: '$2,140', lab: 'Avg. deal size' },
                    { icon: Target, ic: ACCENT, bg: ACCENT_SOFT, val: '21 days', lab: 'Avg. sales cycle' },
                    { icon: Trophy, ic: ACCENT, bg: ACCENT_SOFT, val: '38%', lab: 'Win rate' },
                    { icon: Users, ic: ACCENT, bg: ACCENT_SOFT, val: '92%', lab: 'Retention' },
                  ].map(k => {
                    const Icon = k.icon;
                    return (
                      <div className="crm-kpi" key={k.lab}>
                        <div className="crm-kpi-top"><span className="crm-kpi-ic" style={{ background: k.bg, color: k.ic }}><Icon size={19} /></span></div>
                        <div className="crm-kpi-val">{k.val}</div><div className="crm-kpi-lab">{k.lab}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ---------- APPS (App Store + Installed) ---------- */}
            {view === 'apps' && (
              <div className="crm-fade">
                <div className="crm-seg" style={{ width: 'fit-content', marginBottom: 22 }}>
                  <button className={appsTab === 'store' ? 'on' : ''} onClick={() => setAppsTab('store')}>App Store</button>
                  <button className={appsTab === 'installed' ? 'on' : ''} onClick={() => setAppsTab('installed')}>
                    Installed Apps ({INSTALLED.length})
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
                      {filteredApps.map(a => (
                        <div className="crm-app-card" key={a.nm}>
                          <span className="crm-app-ic" style={{ background: a.c }}>{a.ltr}</span>
                          <div><h4>{a.nm}</h4><span className="cat">{a.cat}</span></div>
                          <p className="ds">{a.ds}</p>
                          <button className="crm-btn crm-btn-ghost" style={{ width: '100%' }}><Plus size={14} /> Install</button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="crm-card">
                    <div className="crm-card-head"><h3>Connected <span style={{ color: '#9b9bab', fontWeight: 500 }}>({INSTALLED.length})</span></h3></div>
                    {INSTALLED.map(a => (
                      <div className="crm-task" key={a.nm} style={{ padding: '14px 0' }}>
                        <span className="crm-app-ic" style={{ background: a.c, width: 34, height: 34, fontSize: '0.85rem' }}>{a.ltr}</span>
                        <div><div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{a.nm}</div><div style={{ fontSize: '0.76rem', color: '#9b9bab' }}>{a.cat}</div></div>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span className="crm-tag green">Connected</span>
                          <button className="crm-btn crm-btn-ghost">Manage</button>
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
                <div className="crm-kpis">
                  {[
                    { icon: DollarSign, ic: ACCENT, bg: ACCENT_SOFT, val: '$42.8k', lab: 'Collected' },
                    { icon: Clock, ic: ACCENT, bg: ACCENT_SOFT, val: '$6.2k', lab: 'Pending' },
                    { icon: ArrowDownRight, ic: ACCENT, bg: ACCENT_SOFT, val: '$1.1k', lab: 'Refunded' },
                    { icon: CreditCard, ic: ACCENT, bg: ACCENT_SOFT, val: '318', lab: 'Transactions' },
                  ].map(k => {
                    const Icon = k.icon;
                    return (
                      <div className="crm-kpi" key={k.lab}>
                        <div className="crm-kpi-top"><span className="crm-kpi-ic" style={{ background: k.bg, color: k.ic }}><Icon size={19} /></span></div>
                        <div className="crm-kpi-val">{k.val}</div><div className="crm-kpi-lab">{k.lab}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="crm-card">
                  <div className="crm-card-head"><h3>Recent transactions</h3><span className="crm-tag green">Stripe connected</span></div>
                  <div className="crm-table">
                    <div className="crm-tr contacts head" style={{ gridTemplateColumns: '1.6fr 1.6fr 1fr 1fr 40px' }}>
                      <span>Customer</span><span>Event</span><span>Amount</span><span>Status</span><span />
                    </div>
                    {TRANSACTIONS.map((t, i) => (
                      <div className="crm-tr contacts" key={i} style={{ gridTemplateColumns: '1.6fr 1.6fr 1fr 1fr 40px' }}>
                        <span className="crm-nm"><span className="crm-av" style={{ background: avColor(i) }}>{initials(t.name)}</span>{t.name}</span>
                        <span className="crm-muted">{t.event}</span>
                        <span style={{ fontWeight: 500 }}>{t.amt}</span>
                        <span className={`crm-tag ${t.tag}`}>{t.tagLabel}</span>
                        <button className="crm-row-act"><MoreHorizontal size={16} /></button>
                      </div>
                    ))}
                  </div>
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

                <div className="crm-card" style={{ alignSelf: 'start', gridColumn: '1 / -1' }}>
                  <div className="crm-card-head"><h3>Integrations</h3></div>
                  <div className="crm-toggle-row" style={{ borderBottom: 'none' }}>
                    <div>
                      <div className="tt" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Calendar size={16} color="var(--w-primary)" /> Google Calendar
                      </div>
                      <div className="ds">Auto-generate Google Meet links when users schedule a meeting.</div>
                    </div>
                    {googleConnected ? (
                      <button className="crm-btn crm-btn-ghost" onClick={handleDisconnectGoogle} style={{ padding: '6px 12px', fontSize: '0.75rem', height: 'auto', minHeight: 0, color: 'var(--rose)' }}>Disconnect</button>
                    ) : (
                      <button className="crm-btn crm-btn-primary" onClick={handleConnectGoogle} style={{ padding: '6px 12px', fontSize: '0.75rem', height: 'auto', minHeight: 0 }}>Connect Google</button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ---------- HELP ---------- */}
            {view === 'help' && (
              <div className="crm-fade crm-help-grid">
                {[
                  { icon: BookOpen, h: 'Getting started', p: 'Set up your account and book your first meeting.' },
                  { icon: FileText, h: 'Documentation', p: 'Browse guides for every SaleMail feature.' },
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

      {/* ---------- Toast ---------- */}
      {toast && (
        <div className="crm-toast"><Check size={15} /> {toast}</div>
      )}
      </div>
    </div>
  );
}
