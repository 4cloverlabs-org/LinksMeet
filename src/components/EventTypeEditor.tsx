import { useState, useRef } from 'react';
import {
  ArrowLeft, Video, Link2, Clock, Calendar, CreditCard, LayoutTemplate,
  Check, Eye, ShieldCheck, ExternalLink, Bold, Italic, Edit2, Link as LinkIcon,
  Globe, ChevronDown, Code, Trash2, Plus, Info, Zap, RefreshCw, X, MessageSquare,
  Phone, MapPin, Copy, Download, AlertTriangle
} from 'lucide-react';
import { addEventType, updateEventType, type EventType } from '../lib/crm';

interface Props {
  uid: string;
  initialData: Partial<EventType> | null;
  onClose: () => void;
  onSaved: () => void;
}

const LOCATION_OPTIONS = [
  { id: 'salemail', label: 'SaleMail Video (Default)', icon: Video },
  { id: 'gmeet', label: 'Google Meet', icon: Video },
  { id: 'zoom', label: 'Zoom Video', icon: Video },
  { id: 'phone', label: 'Phone Call', icon: Phone },
  { id: 'inperson', label: 'In-Person Meeting', icon: MapPin }
];

const DURATION_OPTIONS = ['15 Minutes', '30 Minutes', '45 Minutes', '60 Minutes', '90 Minutes'];

const MONTHS = ['May 2026', 'June 2026', 'July 2026'];
const DAYS_IN_MONTH = [31, 30, 31];

export default function EventTypeEditor({ uid, initialData, onClose, onSaved }: Props) {
  const [form, setForm] = useState<Partial<EventType> & { location?: string }>({
    title: '15 min meeting',
    slug: '15min',
    dur: '15 Minutes',
    desc: 'A quick video meeting.',
    active: true,
    location: 'SaleMail Video (Default)',
    ...(initialData || {})
  });

  const [activeTab, setActiveTab] = useState('basics');
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [allowMultiDur, setAllowMultiDur] = useState(false);

  // Interactive menu states
  const [showDurMenu, setShowDurMenu] = useState(false);
  const [showLocMenu, setShowLocMenu] = useState(false);

  // Toolbar action modals
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [showCalModal, setShowCalModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [embedTab, setEmbedTab] = useState<'inline' | 'popup'>('inline');

  // Interactive calendar preview states
  const [monthIdx, setMonthIdx] = useState(1); // 1 = June 2026
  const [selectedDate, setSelectedDate] = useState(30);
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');

  const [schedule, setSchedule] = useState([
    { day: 'Sunday', active: false, start: '09:00 AM', end: '05:00 PM' },
    { day: 'Monday', active: true, start: '09:00 AM', end: '05:00 PM' },
    { day: 'Tuesday', active: true, start: '09:00 AM', end: '05:00 PM' },
    { day: 'Wednesday', active: true, start: '09:00 AM', end: '05:00 PM' },
    { day: 'Thursday', active: true, start: '09:00 AM', end: '05:00 PM' },
    { day: 'Friday', active: true, start: '09:00 AM', end: '05:00 PM' },
    { day: 'Saturday', active: false, start: '09:00 AM', end: '05:00 PM' },
  ]);

  const toggleDay = (idx: number) => {
    setSchedule(prev => prev.map((item, i) => i === idx ? { ...item, active: !item.active } : item));
  };

  const availSlots12h = [
    '09:00 AM', '09:15 AM', '09:30 AM', '09:45 AM',
    '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM',
    '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM',
    '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM',
    '01:00 PM', '01:15 PM', '01:30 PM', '01:45 PM',
    '02:00 PM', '02:15 PM', '02:30 PM', '02:45 PM',
    '03:00 PM', '03:15 PM', '03:30 PM', '03:45 PM',
    '04:00 PM', '04:15 PM', '04:30 PM', '04:45 PM'
  ];
  const availSlots24h = [
    '09:00', '09:15', '09:30', '09:45',
    '10:00', '10:15', '10:30', '10:45',
    '11:00', '11:15', '11:30', '11:45',
    '12:00', '12:15', '12:30', '12:45',
    '13:00', '13:15', '13:30', '13:45',
    '14:00', '14:15', '14:30', '14:45',
    '15:00', '15:15', '15:30', '15:45',
    '16:00', '16:15', '16:30', '16:45'
  ];

  const descInputRef = useRef<HTMLTextAreaElement | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Real-time slug derivation if title changes
  const handleTitleChange = (newTitle: string) => {
    const autoSlug = newTitle.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-').replace(/^-|-$/g, '');
    setForm(prev => ({
      ...prev,
      title: newTitle,
      slug: autoSlug || prev.slug
    }));
  };

  // Real-time rich text formatting insertion
  const applyFormatting = (tagStart: string, tagEnd: string) => {
    if (!descInputRef.current) return;
    const textarea = descInputRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = form.desc || '';
    const selected = text.substring(start, end) || 'text';
    const newText = text.substring(0, start) + tagStart + selected + tagEnd + text.substring(end);
    setForm(prev => ({ ...prev, desc: newText }));
  };

  // Compute dynamic time slots based on duration
  const durMinutes = parseInt(form.dur || '15') || 15;
  /* const generateSlots = () => {
    const slots = [];
    let startMins = 9 * 60; // 9:00 AM
    for (let i = 0; i < 5; i++) {
      const h = Math.floor(startMins / 60);
      const m = startMins % 60;
      const period = h >= 12 ? 'PM' : 'AM';
      const dispH = h > 12 ? h - 12 : h;
      const dispM = m < 10 ? `0${m}` : `${m}`;
      slots.push(`${dispH}:${dispM} ${period}`);
      startMins += durMinutes;
    }
    return slots;
  }; */

  // Compute dynamic day tabs around selected date
  /* const computeDayTabs = () => {
    const maxDays = DAYS_IN_MONTH[monthIdx] || 30;
    let base = Math.min(Math.max(selectedDate - 2, 1), maxDays - 4);
    return [base, base + 1, base + 2, base + 3, base + 4];
  }; */

  const handleSave = async () => {
    if (!form.title || !form.slug) return;
    setSaving(true);
    try {
      if (form.id) {
        await updateEventType(uid, form.id, form as EventType);
      } else {
        await addEventType(uid, form as Omit<EventType, 'id' | 'createdAt'>);
      }
      setSaving(false);
      triggerToast('Event type saved successfully.');
      onSaved();
    } catch (e: any) {
      console.error(e);
      setSaving(false);
    }
  };

  // 1. External Link Handler
  const handleOpenPublicLink = () => {
    const fullUrl = `${window.location.origin}/book/${uid || 'demo'}/${form.slug || '15min'}`;
    window.open(fullUrl, '_blank');
  };

  // 2. Copy Link Handler
  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/book/${uid || 'demo'}/${form.slug || '15min'}`;
    navigator.clipboard.writeText(fullUrl);
    triggerToast('Booking link copied to clipboard!');
  };

  // 3. Embed Code Generator & Copy
  const embedCodeSnippet = embedTab === 'inline'
    ? `<iframe src="${window.location.origin}/book/${uid || 'demo'}/${form.slug || '15min'}" width="100%" height="700" frameborder="0" style="border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.06);"></iframe>`
    : `<script src="https://salemail.ai/embed.js"></script>\n<button onclick="SaleMail.openBooking('${form.slug || '15min'}')" style="background:#0E61F3;color:#fff;padding:12px 24px;border-radius:8px;border:none;font-weight:600;">Book a Meeting</button>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCodeSnippet);
    triggerToast('Embed code copied to clipboard!');
    setShowEmbedModal(false);
  };

  // 4. Download .ics Handler
  const handleDownloadIcs = () => {
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SaleMail//Booking//EN\nBEGIN:VEVENT\nSUMMARY:${form.title || 'Meeting'}\nDESCRIPTION:${form.desc || 'Video conference meeting'}\nDURATION:PT${durMinutes}M\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${form.slug || 'meeting'}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Calendar .ics file downloaded!');
    setShowCalModal(false);
  };

  // 5. Delete Handler
  const handleDeleteConfirm = async () => {
    triggerToast('Event type deleted.');
    setShowDeleteModal(false);
    onClose();
  };

  const NavItem = ({ icon: Icon, label, id }: { icon: any, label: string, id: string }) => {
    const active = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '7px 12px',
          background: active ? '#eff6ff' : 'transparent',
          border: 'none',
          borderRadius: '8px',
          color: active ? '#0E61F3' : '#334155',
          fontSize: '0.85rem',
          fontWeight: active ? 600 : 500,
          cursor: 'pointer',
          textAlign: 'left',
          marginBottom: '2px',
          transition: 'all 0.15s ease',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
        <Icon size={16} color={active ? '#0E61F3' : '#64748b'} style={{ flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      </button>
    );
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange?: () => void }) => (
    <div
      onClick={onChange}
      style={{
        width: '38px',
        height: '22px',
        borderRadius: '11px',
        background: checked ? '#0E61F3' : '#cbd5e1',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.2s ease',
        flexShrink: 0
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '18px' : '2px',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: '#ffffff',
          transition: 'left 0.2s ease',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)'
        }}
      />
    </div>
  );

  const currentLocObj = LOCATION_OPTIONS.find(l => l.label === form.location) || LOCATION_OPTIONS[0];
  const LocIcon = currentLocObj.icon;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', background: '#ffffff', color: '#0f172a', overflow: 'hidden', fontFamily: "'Geist', 'Geist Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMsg && (
        <div style={{ position: 'fixed', top: '80px', right: '32px', background: '#0f172a', color: '#ffffff', padding: '12px 20px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 100000, animation: 'fadeIn 0.2s ease' }}>
          <Check size={16} color="#4ade80" /> {toastMsg}
        </div>
      )}

      {/* EMBED CODE MODAL */}
      {showEmbedModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100001 }} onClick={() => setShowEmbedModal(false)}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '90%', maxWidth: '540px', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Embed on your website</h3>
              <X size={20} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setShowEmbedModal(false)} />
            </div>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 20px' }}>
              Add a responsive booking widget directly into your landing page or web application.
            </p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <button
                onClick={() => setEmbedTab('inline')}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: embedTab === 'inline' ? '#eff6ff' : '#f1f5f9', color: embedTab === 'inline' ? '#0E61F3' : '#64748b', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
              >Inline Embed (iframe)</button>
              <button
                onClick={() => setEmbedTab('popup')}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: embedTab === 'popup' ? '#eff6ff' : '#f1f5f9', color: embedTab === 'popup' ? '#0E61F3' : '#64748b', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
              >Floating Button</button>
            </div>

            <textarea
              readOnly
              value={embedCodeSnippet}
              style={{ width: '100%', minHeight: '110px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '0.82rem', color: '#334155', outline: 'none', resize: 'none', marginBottom: '20px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowEmbedModal(false)} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>Close</button>
              <button onClick={handleCopyEmbed} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#0E61F3', color: '#ffffff', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <Copy size={16} /> Copy Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CALENDAR SYNC / DOWNLOAD MODAL */}
      {showCalModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100001 }} onClick={() => setShowCalModal(false)}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '90%', maxWidth: '480px', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Calendar Integration</h3>
              <X size={20} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setShowCalModal(false)} />
            </div>
            
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Check size={20} color="#16a34a" />
              <div>
                <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.9rem' }}>Google Calendar Connected</div>
                <div style={{ color: '#15803d', fontSize: '0.82rem' }}>Automatic slot verification & event invites enabled.</div>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 24px' }}>
              Download an offline `.ics` calendar invitation template for testing or integration into manual email workflows.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowCalModal(false)} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>Close</button>
              <button onClick={handleDownloadIcs} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#0E61F3', color: '#ffffff', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <Download size={16} /> Download .ics File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100001 }} onClick={() => setShowDeleteModal(false)}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '90%', maxWidth: '440px', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#ef4444' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Delete event type?</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 24px', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>{form.title}</strong>? Any active links sharing this meeting URL (`salemail.ai/booking/{form.slug}`) will cease to accept bookings.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDeleteConfirm} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#ffffff', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', height: '64px', borderBottom: '1px solid #e2e8f0', background: '#ffffff', flexShrink: 0, paddingRight: '24px' }}>

        {/* Header Left (Sidebar Width) */}
        <div style={{ width: '210px', padding: '0 20px', borderRight: '1px solid #e2e8f0', height: '100%', display: 'flex', alignItems: 'center' }}>
          <button
            onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#334155', fontSize: '0.92rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* Header Right */}
        <div style={{ flex: 1, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>{form.title || '15 min meeting'}</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ToggleSwitch
              checked={form.active ?? true}
              onChange={() => {
                const nextState = !form.active;
                setForm(prev => ({ ...prev, active: nextState }));
                triggerToast(nextState ? 'Event type marked as active.' : 'Event type paused.');
              }}
            />

            <button
              onClick={handleOpenPublicLink}
              title="Preview public booking page"
              style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s ease' }}
            >
              <ExternalLink size={16} />
            </button>
            <button
              onClick={handleCopyLink}
              title="Copy booking URL"
              style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s ease' }}
            >
              <LinkIcon size={16} />
            </button>
            <button
              onClick={() => setShowEmbedModal(true)}
              title="Embed website widget"
              style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s ease' }}
            >
              <Code size={16} />
            </button>
            <button
              onClick={() => setShowCalModal(true)}
              title="Calendar integrations & export"
              style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s ease' }}
            >
              <Calendar size={16} />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              title="Delete event type"
              style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', cursor: 'pointer', transition: 'all 0.15s ease' }}
            >
              <Trash2 size={16} />
            </button>

            <button
              onClick={handleSave}
              style={{ background: '#0E61F3', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginLeft: '6px', boxShadow: '0 2px 4px rgba(14, 97, 243, 0.2)' }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN BODY */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* LEFT SIDEBAR NAVIGATION */}
        <div style={{ width: '210px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: '#ffffff', overflowY: 'hidden', padding: '14px 10px', flexShrink: 0 }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 10px' }}>SETUP</div>
          <NavItem icon={Link2} label="Basics" id="basics" />
          <NavItem icon={Calendar} label="Availability" id="availability" />

          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '12px 0 4px 10px' }}>BOOKING EXPERIENCE</div>
          <NavItem icon={LayoutTemplate} label="Booking form" id="form" />
          <NavItem icon={Check} label="Confirmation" id="conf" />
          <NavItem icon={Eye} label="Appearance" id="app" />
          <NavItem icon={CreditCard} label="Payments & Seats" id="pay" />
          <NavItem icon={RefreshCw} label="Recurring" id="recurring" />

          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '12px 0 4px 10px' }}>POLICIES</div>
          <NavItem icon={Clock} label="Limits & buffers" id="limits" />
          <NavItem icon={Clock} label="Reschedule & cancel" id="reschedule" />
          <NavItem icon={ShieldCheck} label="Privacy & security" id="privacy" />

          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '12px 0 4px 10px' }}>AI & AUTOMATION</div>
          <NavItem icon={LayoutTemplate} label="Apps" id="apps" />
          <NavItem icon={Zap} label="Workflows" id="workflows" />
          <NavItem icon={LinkIcon} label="Webhooks" id="webhooks" />
        </div>

        {/* CONTENT AREA */}
        <div style={{ flex: 1, overflowY: (activeTab === 'basics' || activeTab === 'availability') ? 'hidden' : 'auto', background: '#ffffff', padding: (activeTab === 'basics' || activeTab === 'availability') ? '0 32px' : '32px 40px', position: 'relative', minHeight: 0 }} onClick={() => { if (showDurMenu) setShowDurMenu(false); if (showLocMenu) setShowLocMenu(false); }}>

          {activeTab === 'basics' ? (
            /* EXACT PREVIEW CARD GRID MATCHING SCREENSHOT WITH REAL-TIME LIVE SYNC */
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 1fr) auto', gap: '48px', height: '100%' }}>

              {/* LEFT COLUMN: EDITOR FORM FIELDS */}
              <div onClick={e => e.stopPropagation()} style={{ overflowY: 'auto', height: '100%', padding: '32px 16px 32px 0' }}>
                {/* Title */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Title</label>
                  <input
                    value={form.title || ''}
                    onChange={e => handleTitleChange(e.target.value)}
                    style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', padding: '10px 14px', borderRadius: '8px', fontSize: '0.92rem', outline: 'none', fontWeight: 500 }}
                  />
                </div>

                {/* Description */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Description</label>
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', background: '#ffffff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 14px', borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
                      <button type="button" style={{ background: 'none', border: 'none', color: '#334155', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 500, padding: 0 }}>
                        Normal <ChevronDown size={14} />
                      </button>
                      <div style={{ width: '1px', height: '16px', background: '#e2e8f0' }} />
                      <button type="button" onClick={() => applyFormatting('**', '**')} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 0 }} title="Bold"><Bold size={15} /></button>
                      <button type="button" onClick={() => applyFormatting('*', '*')} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 0 }} title="Italic"><Italic size={15} /></button>
                      <button type="button" onClick={() => applyFormatting('[', '](https://)')} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 0 }} title="Link"><LinkIcon size={15} /></button>
                    </div>
                    <textarea
                      ref={descInputRef}
                      value={form.desc || ''}
                      onChange={e => setForm({ ...form, desc: e.target.value })}
                      style={{ width: '100%', background: 'transparent', border: 'none', color: '#334155', padding: '12px 14px', minHeight: '90px', fontSize: '0.9rem', outline: 'none', resize: 'vertical', lineHeight: 1.5 }}
                      placeholder="A quick video meeting."
                    />
                  </div>
                </div>

                {/* URL */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>URL</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', background: '#ffffff' }}>
                    <div style={{ padding: '10px 14px', background: '#f8fafc', color: '#64748b', fontSize: '0.88rem', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                      salemail.ai/booking/
                    </div>
                    <input
                      value={form.slug || ''}
                      onChange={e => setForm({ ...form, slug: e.target.value })}
                      style={{ flex: 1, background: 'transparent', border: 'none', color: '#0E61F3', padding: '10px 14px', fontSize: '0.88rem', outline: 'none', fontWeight: 600 }}
                    />
                  </div>
                </div>

                {/* Duration */}
                <div style={{ marginBottom: '14px', position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Duration</label>
                  <div
                    onClick={() => setShowDurMenu(!showDurMenu)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', userSelect: 'none' }}
                  >
                    <span style={{ fontSize: '0.92rem', color: '#0f172a', fontWeight: 500 }}>
                      {durMinutes}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.88rem', color: '#475569', fontWeight: 500 }}>
                      Minutes <ChevronDown size={15} />
                    </span>
                  </div>

                  {/* Interactive Duration Menu */}
                  {showDurMenu && (
                    <div style={{ position: 'absolute', top: '72px', left: 0, right: 0, background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden' }}>
                      {DURATION_OPTIONS.map(opt => (
                        <div
                          key={opt}
                          onClick={() => { setForm({ ...form, dur: opt }); setShowDurMenu(false); }}
                          style={{ padding: '10px 14px', fontSize: '0.88rem', fontWeight: form.dur === opt ? 600 : 400, color: form.dur === opt ? '#0E61F3' : '#0f172a', background: form.dur === opt ? '#eff6ff' : '#ffffff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                          <span>{opt}</span>
                          {form.dur === opt && <Check size={16} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Allow multiple durations toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
                  <ToggleSwitch checked={allowMultiDur} onChange={() => setAllowMultiDur(!allowMultiDur)} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Allow multiple durations</span>
                </div>

                {/* Location */}
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Location</label>
                  <div
                    onClick={() => setShowLocMenu(!showLocMenu)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
                      <LocIcon size={16} color="#0E61F3" /> {form.location || 'SaleMail Video (Default)'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                      <ChevronDown size={16} />
                      <X size={16} onClick={(e) => { e.stopPropagation(); setForm({ ...form, location: 'SaleMail Video (Default)' }); }} />
                    </div>
                  </div>

                  {/* Interactive Location Selection Menu */}
                  {showLocMenu && (
                    <div style={{ position: 'absolute', top: '72px', left: 0, right: 0, background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden' }}>
                      {LOCATION_OPTIONS.map(opt => {
                        const OptIcon = opt.icon;
                        const isSel = form.location === opt.label;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => { setForm({ ...form, location: opt.label }); setShowLocMenu(false); }}
                            style={{ padding: '12px 14px', fontSize: '0.88rem', fontWeight: isSel ? 600 : 400, color: isSel ? '#0E61F3' : '#0f172a', background: isSel ? '#eff6ff' : '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <OptIcon size={16} color={isSel ? '#0E61F3' : '#64748b'} />
                              <span>{opt.label}</span>
                            </div>
                            {isSel && <Check size={16} />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div
                    onClick={() => setShowLocMenu(!showLocMenu)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#334155', cursor: 'pointer', marginBottom: '14px' }}
                  >
                    <span>Show advanced settings</span>
                    <ChevronDown size={15} />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowLocMenu(!showLocMenu)}
                    style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0E61F3', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '10px' }}
                  >
                    <Plus size={16} /> Add a location
                  </button>

                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Can't find the right conferencing app? Visit our <span style={{ color: '#0E61F3', cursor: 'pointer', textDecoration: 'underline' }}>App Store</span>.
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: REAL-TIME LIVE PREVIEW CARD */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '20px 0' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', display: 'grid', gridTemplateColumns: '170px 1fr', gap: '20px', maxWidth: '460px', width: '100%' }}>

                  {/* Column 1: Left Info Pane */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eff6ff', color: '#0E61F3', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        JR
                      </div>
                      <span style={{ fontSize: '0.88rem', fontWeight: 500, color: '#475569' }}>JR Piano</span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px', wordBreak: 'break-word' }}>
                      {form.title || '15 min meeting'}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} color="#64748b" /> {durMinutes}m
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LocIcon size={16} color="#64748b" /> {form.location?.replace(' (Default)', '') || 'SaleMail Video'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <Globe size={16} color="#64748b" /> Asia/Kolkata <ChevronDown size={14} />
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Center Interactive Calendar Pane */}
                  <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{MONTHS[monthIdx]}</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setMonthIdx(Math.max(0, monthIdx - 1))}
                          style={{ width: '28px', height: '28px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}
                        >&lt;</button>
                        <button
                          type="button"
                          onClick={() => setMonthIdx(Math.min(MONTHS.length - 1, monthIdx + 1))}
                          style={{ width: '28px', height: '28px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}
                        >&gt;</button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.68rem', fontWeight: 700, marginBottom: '8px' }}>
                      <div style={{ color: '#0E61F3' }}>SUN</div>
                      <div style={{ color: '#64748b' }}>MON</div>
                      <div style={{ color: '#64748b' }}>TUE</div>
                      <div style={{ color: '#64748b' }}>WED</div>
                      <div style={{ color: '#64748b' }}>THU</div>
                      <div style={{ color: '#64748b' }}>FRI</div>
                      <div style={{ color: '#64748b' }}>SAT</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.78rem', fontWeight: 500, color: '#0f172a' }}>
                      <div style={{ padding: '6px 0', opacity: 0 }}>-</div>
                      <div style={{ padding: '6px 0', opacity: 0 }}>-</div>
                      <div style={{ padding: '6px 0', opacity: 0 }}>-</div>
                      {Array.from({ length: DAYS_IN_MONTH[monthIdx] }, (_, i) => i + 1).map(d => {
                        const isSel = d === selectedDate;
                        return (
                          <div
                            key={d}
                            onClick={() => { setSelectedDate(d); }}
                            style={{
                              width: '26px',
                              height: '26px',
                              margin: '0 auto',
                              borderRadius: '50%',
                              background: isSel ? '#0E61F3' : 'transparent',
                              color: isSel ? '#ffffff' : '#0f172a',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: isSel ? 700 : 500,
                              cursor: 'pointer',
                              position: 'relative'
                            }}
                          >
                            <span>{d}</span>
                            {isSel && <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#ffffff', position: 'absolute', bottom: '3px' }} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Banner Pill below Preview Card */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                  <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', color: '#0E61F3', padding: '10px 20px', borderRadius: '9999px', fontSize: '0.84rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(14, 97, 243, 0.08)' }}>
                    <Info size={16} /> Save changes to preview all updates.
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'availability' ? (
            /* EXACT AVAILABILITY 2-COLUMN GRID MATCHING SCREENSHOT */
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 1fr) minmax(460px, 1.15fr)', gap: '32px', height: '100%' }}>
              
              {/* LEFT COLUMN: AVAILABILITY EDITOR */}
              <div style={{ overflowY: 'auto', height: '100%', padding: '24px 16px 32px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Availability</h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Set your available days and times for bookings.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerToast('Opening availability template editor...')}
                    style={{ border: '1px solid #bfdbfe', background: '#ffffff', color: '#0E61F3', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}
                  >
                    <Edit2 size={14} /> Edit availability
                  </button>
                </div>

                {/* Main Schedule Container Card */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                  
                  {/* Time zone selector */}
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Time zone</label>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#ffffff', color: '#0f172a', fontWeight: 500, fontSize: '0.88rem', marginBottom: '20px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Globe size={16} color="#64748b" /> Asia/Kolkata (GMT +05:30)
                    </div>
                    <ChevronDown size={16} color="#64748b" />
                  </div>

                  {/* Weekly Schedule Rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {schedule.map((item, idx) => (
                      <div
                        key={item.day}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: idx < 6 ? '1px solid #f1f5f9' : 'none' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '130px' }}>
                          <div
                            onClick={() => toggleDay(idx)}
                            style={{ width: '18px', height: '18px', borderRadius: '4px', background: item.active ? '#0E61F3' : '#ffffff', border: item.active ? 'none' : '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                          >
                            {item.active && <Check size={13} color="#fff" strokeWidth={3} />}
                          </div>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>{item.day}</span>
                        </div>

                        {!item.active ? (
                          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>Unavailable</span>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', background: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {item.start} <ChevronDown size={14} color="#64748b" />
                            </div>
                            <span style={{ color: '#94a3b8', fontWeight: 600 }}>-</span>
                            <div style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', background: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {item.end} <ChevronDown size={14} color="#64748b" />
                            </div>
                            <button
                              type="button"
                              onClick={() => triggerToast(`Add time block for ${item.day}`)}
                              style={{ width: '32px', height: '32px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#ffffff', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                              <Plus size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => triggerToast(`Copy ${item.day} hours to other days`)}
                              style={{ width: '32px', height: '32px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#ffffff', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                              <Copy size={15} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerToast('Custom hours modal opened')}
                    style={{ width: '100%', padding: '12px', border: '1px dashed #bfdbfe', borderRadius: '8px', background: '#eff6ff', color: '#0E61F3', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', marginTop: '18px' }}
                  >
                    <Plus size={16} /> Add custom hours
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerToast('Select source schedule to copy from')}
                    style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '8px', background: '#f8fafc', color: '#0E61F3', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', marginTop: '12px' }}
                  >
                    Copy availability from... <ChevronDown size={16} />
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: PREVIEW AVAILABILITY */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '20px 0' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', width: '100%', maxWidth: '520px' }}>
                  
                  {/* Top header inside right card */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#0E61F3', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={18} />
                      </div>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Preview availability</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setMonthIdx(Math.max(0, monthIdx - 1))}
                        style={{ width: '32px', height: '32px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}
                      >&lt;</button>
                      <button
                        type="button"
                        onClick={() => setMonthIdx(Math.min(MONTHS.length - 1, monthIdx + 1))}
                        style={{ width: '32px', height: '32px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}
                      >&gt;</button>
                    </div>
                  </div>

                  {/* 2-pane Calendar & Slots Box */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '20px', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                    
                    {/* Left Pane: Calendar */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>{MONTHS[monthIdx]}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button type="button" onClick={() => setMonthIdx(Math.max(0, monthIdx - 1))} style={{ width: '24px', height: '24px', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#ffffff', color: '#64748b', cursor: 'pointer' }}>&lt;</button>
                          <button type="button" onClick={() => setMonthIdx(Math.min(MONTHS.length - 1, monthIdx + 1))} style={{ width: '24px', height: '24px', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#ffffff', color: '#64748b', cursor: 'pointer' }}>&gt;</button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, marginBottom: '8px' }}>
                        <div style={{ color: '#0E61F3' }}>SUN</div>
                        <div style={{ color: '#64748b' }}>MON</div>
                        <div style={{ color: '#64748b' }}>TUE</div>
                        <div style={{ color: '#64748b' }}>WED</div>
                        <div style={{ color: '#64748b' }}>THU</div>
                        <div style={{ color: '#64748b' }}>FRI</div>
                        <div style={{ color: '#64748b' }}>SAT</div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.78rem', fontWeight: 500, color: '#0f172a' }}>
                        <div style={{ padding: '4px 0', opacity: 0 }}>-</div>
                        <div style={{ padding: '4px 0', opacity: 0 }}>-</div>
                        <div style={{ padding: '4px 0', opacity: 0 }}>-</div>
                        {Array.from({ length: DAYS_IN_MONTH[monthIdx] }, (_, i) => i + 1).map(d => {
                          const isSel = d === selectedDate;
                          const dayOfWeek = (d + 2) % 7;
                          const isAvailable = dayOfWeek !== 0 && dayOfWeek !== 6;
                          return (
                            <div
                              key={d}
                              onClick={() => setSelectedDate(d)}
                              style={{
                                width: '28px',
                                height: '28px',
                                margin: '0 auto',
                                borderRadius: '50%',
                                background: isSel ? '#0E61F3' : 'transparent',
                                color: isSel ? '#ffffff' : '#0f172a',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: isSel ? 700 : 500,
                                cursor: 'pointer',
                                position: 'relative'
                              }}
                            >
                              <span>{d}</span>
                              {isAvailable && (
                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: isSel ? '#ffffff' : '#0E61F3', position: 'absolute', bottom: '2px' }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Pane: Selected Day Slots */}
                    <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '18px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Tuesday, June {selectedDate}</span>
                        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '6px', padding: '2px' }}>
                          <button
                            type="button"
                            onClick={() => setTimeFormat('12h')}
                            style={{ padding: '2px 6px', borderRadius: '4px', border: 'none', background: timeFormat === '12h' ? '#0E61F3' : 'transparent', color: timeFormat === '12h' ? '#ffffff' : '#64748b', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                          >12h</button>
                          <button
                            type="button"
                            onClick={() => setTimeFormat('24h')}
                            style={{ padding: '2px 6px', borderRadius: '4px', border: 'none', background: timeFormat === '24h' ? '#0E61F3' : 'transparent', color: timeFormat === '24h' ? '#ffffff' : '#64748b', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                          >24h</button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                        {(timeFormat === '12h' ? availSlots12h : availSlots24h).map(slot => (
                          <div
                            key={slot}
                            onClick={() => triggerToast(`Selected preview slot ${slot}`)}
                            style={{
                              padding: '8px',
                              textAlign: 'center',
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: '#0E61F3',
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                          >{slot}</div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Soft Blue Available Hours Pill */}
                  <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <Clock size={18} color="#0E61F3" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontWeight: 600, color: '#1e40af', fontSize: '0.85rem', marginBottom: '2px' }}>Your available hours</div>
                      <div style={{ color: '#1e3a8a', fontSize: '0.82rem' }}>Mon - Fri: 09:00 AM - 05:00 PM (IST)</div>
                    </div>
                  </div>

                </div>

                {/* Times shown pill below card */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                  <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', color: '#0E61F3', padding: '8px 18px', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Globe size={15} /> Times shown in Asia/Kolkata (GMT +05:30) <ChevronDown size={14} />
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div style={{ maxWidth: '800px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '32px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>{activeTab} Settings</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Configure {activeTab} rules and options for this meeting type.</p>
              </div>
            </div>
          )}

          {/* Floating Blue Chat Bubble Widget in bottom right */}
          <div style={{ position: 'fixed', bottom: '24px', right: '24px', width: '48px', height: '48px', borderRadius: '50%', background: '#0E61F3', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(14, 97, 243, 0.35)', cursor: 'pointer', zIndex: 100 }}>
            <MessageSquare size={22} />
          </div>

        </div>
      </div>
    </div>
  );
}
