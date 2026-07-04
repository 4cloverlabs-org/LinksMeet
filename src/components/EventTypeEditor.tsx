import { useState, useRef } from 'react';
import {
  ArrowLeft, Video, Link2, Clock, Calendar, CreditCard, LayoutTemplate,
  Check, Eye, ExternalLink, Bold, Italic, Edit2, Link as LinkIcon,
  Globe, ChevronDown, Code, Trash2, Plus, Info, Zap, X, MessageSquare,
  Phone, MapPin, Copy, Download, AlertTriangle
} from 'lucide-react';
import { addEventType, updateEventType, type EventType } from '../lib/crm';
import { useAuth } from '../lib/AuthContext';

interface Props {
  uid: string;
  initialData: Partial<EventType> | null;
  onClose: () => void;
  onSaved: () => void;
}

const LOCATION_OPTIONS = [
  { id: 'linksmeet', label: 'LinksMeet Video (Default)', icon: Video },
  { id: 'gmeet', label: 'Google Meet', icon: Video },
  { id: 'zoom', label: 'Zoom Video', icon: Video },
  { id: 'phone', label: 'Phone Call', icon: Phone },
  { id: 'inperson', label: 'In-Person Meeting', icon: MapPin }
];

const DURATION_OPTIONS = ['15 Minutes', '30 Minutes', '45 Minutes', '60 Minutes', '90 Minutes'];

const MONTHS = ['May 2026', 'June 2026', 'July 2026'];
const DAYS_IN_MONTH = [31, 30, 31];

export default function EventTypeEditor({ uid, initialData, onClose, onSaved }: Props) {
  const { user } = useAuth();
  const hostName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Host';
  const hostInitials = hostName.substring(0, 2).toUpperCase();

  const [form, setForm] = useState<Partial<EventType> & { location?: string }>({
    title: '15 min meeting',
    slug: '15min',
    dur: '15 Minutes',
    desc: 'A quick video meeting.',
    active: true,
    location: 'LinksMeet Video (Default)',
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

  // Real-time Settings States for UI previews
  const [requirePhone, setRequirePhone] = useState(false);
  const [confRedirect, setConfRedirect] = useState(false);
  const [appLayout, setAppLayout] = useState<'Month' | 'Weekly' | 'Column'>('Month');
  const [showOnlyFirstSlot, setShowOnlyFirstSlot] = useState(false);
  const [disableCancelling, setDisableCancelling] = useState(false);
  const [disableRescheduling, setDisableRescheduling] = useState(false);

  const [eventColor, setEventColor] = useState('#0E61F3');
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [interfaceLang, setInterfaceLang] = useState('English');
  const [lockTimezone, setLockTimezone] = useState(false);

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
    : `<script src="https://linksmeet.ai/embed.js"></script>\n<button onclick="LinksMeet.openBooking('${form.slug || '15min'}')" style="background:#0E61F3;color:#fff;padding:12px 24px;border-radius:8px;border:none;font-weight:600;">Book a Meeting</button>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCodeSnippet);
    triggerToast('Embed code copied to clipboard!');
    setShowEmbedModal(false);
  };

  // 4. Download .ics Handler
  const handleDownloadIcs = () => {
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//LinksMeet//Booking//EN\nBEGIN:VEVENT\nSUMMARY:${form.title || 'Meeting'}\nDESCRIPTION:${form.desc || 'Video conference meeting'}\nDURATION:PT${durMinutes}M\nEND:VEVENT\nEND:VCALENDAR`;
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
              Are you sure you want to delete <strong>{form.title}</strong>? Any active links sharing this meeting URL (`linksmeet.ai/booking/{form.slug}`) will cease to accept bookings.
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

          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '12px 0 4px 10px' }}>POLICIES</div>
          <NavItem icon={Clock} label="Limits & buffers" id="limits" />
          <NavItem icon={Clock} label="Reschedule & cancel" id="reschedule" />

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
                      linksmeet.ai/booking/
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
                      <LocIcon size={16} color="#0E61F3" /> {form.location || 'LinksMeet Video (Default)'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                      <ChevronDown size={16} />
                      <X size={16} onClick={(e) => { e.stopPropagation(); setForm({ ...form, location: 'LinksMeet Video (Default)' }); }} />
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
                        {hostInitials}
                      </div>
                      <span style={{ fontSize: '0.88rem', fontWeight: 500, color: '#475569' }}>{hostName}</span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px', wordBreak: 'break-word' }}>
                      {form.title || '15 min meeting'}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} color="#64748b" /> {durMinutes}m
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LocIcon size={16} color="#64748b" /> {form.location?.replace(' (Default)', '') || 'LinksMeet Video'}
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
          ) : activeTab === 'form' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 1fr) auto', gap: '48px', height: '100%' }}>
              
              {/* LEFT COLUMN: SETUP */}
              <div onClick={e => e.stopPropagation()} style={{ overflowY: 'auto', height: '100%', padding: '32px 16px 32px 0' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  
                  {/* Confirmation Section */}
                  <div style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Confirmation</h3>
                    <p style={{ margin: '0 0 16px', fontSize: '0.88rem', color: '#64748b' }}>What your booker should provide to receive confirmations</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ padding: '6px 16px', borderRadius: '8px', background: '#ffffff', border: '1px solid #0E61F3', color: '#0E61F3', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{width:16,height:16,border:'2px solid #0E61F3',borderRadius:'4px',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:8,height:8,background:'#0E61F3',borderRadius:'2px'}}></div></div> Email</button>
                      <button style={{ padding: '6px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid #cbd5e1', color: '#64748b', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={16} /> Phone</button>
                    </div>
                  </div>

                  <div style={{ height: '1px', background: '#e2e8f0' }} />

                  {/* Booking Questions Header */}
                  <div style={{ padding: '24px 24px 16px' }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Booking questions</h3>
                    <p style={{ margin: '0', fontSize: '0.88rem', color: '#64748b' }}>Customize the questions asked on the booking page. <a href="#" style={{color:'#0E61F3', textDecoration:'none'}}>Learn more</a></p>
                  </div>

                  {/* Questions List */}
                  <div>
                    {/* Your name */}
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>Your name</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>Required</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Name</div>
                      </div>
                      <button style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff', color: '#334155', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                    </div>

                    {/* Email address */}
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>Email address</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>Required</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Email</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ToggleSwitch checked={true} />
                        <button style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff', color: '#334155', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                      </div>
                    </div>

                    {/* Phone number */}
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>Phone number</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, background: requirePhone ? '#f0fdf4' : '#f1f5f9', color: requirePhone ? '#16a34a' : '#475569', padding: '2px 6px', borderRadius: '4px' }}>{requirePhone ? 'Required' : 'Hidden'}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Phone</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ToggleSwitch checked={requirePhone} onChange={() => setRequirePhone(!requirePhone)} />
                        <button style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff', color: '#334155', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                      </div>
                    </div>

                    {/* What is this meeting about? */}
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>What is this meeting about?</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>Hidden</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Short text</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ToggleSwitch checked={false} />
                        <button style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff', color: '#334155', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                      </div>
                    </div>

                    {/* Additional notes */}
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>Additional notes</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>Optional</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Long text</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ToggleSwitch checked={true} />
                        <button style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff', color: '#334155', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                      </div>
                    </div>

                    {/* Add guests */}
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>Add guests</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>Optional</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Multiple Emails</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ToggleSwitch checked={true} />
                        <button style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff', color: '#334155', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                      </div>
                    </div>

                    {/* Reason for reschedule */}
                    <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>Reason for reschedule</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>Optional</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Long text</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ToggleSwitch checked={true} />
                        <button style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff', color: '#334155', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '16px 24px 24px' }}>
                    <button style={{ padding: '8px 16px', borderRadius: '8px', background: 'transparent', border: '1px dashed #cbd5e1', color: '#0E61F3', fontSize: '0.88rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <Plus size={16} /> Add question
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: PREVIEW */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '32px 0' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', width: '100%', maxWidth: '820px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                  
                  {/* Preview Left: Details */}
                  <div style={{ width: '320px', borderRight: '1px solid #e2e8f0', padding: '32px 24px', background: '#ffffff' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#a855f7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>
                      K
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>Kontham sohith</div>
                    <h2 style={{ margin: '0 0 24px', fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>{form.title || '15 min meeting'}</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
                        <Calendar size={18} style={{ marginTop: '2px' }} />
                        <div>
                          <div>Saturday, July 4, 2026</div>
                          <div style={{ color: '#0f172a', fontWeight: 600 }}>10:00 - 10:15 am</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
                        <Clock size={18} />
                        {durMinutes}m
                      </div>
                      <div style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
                        <Video size={18} />
                        On Video
                      </div>
                      <div style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
                        <Globe size={18} />
                        Asia/Calcutta
                      </div>
                    </div>
                  </div>

                  {/* Preview Right: Form */}
                  <div style={{ flex: 1, padding: '32px 40px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Your name *</label>
                      <input type="text" readOnly value="Kontham sohith" style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }} />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Email address *</label>
                      <input type="text" readOnly value="sohithkontham5@gmail.com" style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }} />
                    </div>
                    {requirePhone && (
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Phone number *</label>
                        <input type="text" readOnly value="+91 98765 43210" style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }} />
                      </div>
                    )}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Additional notes</label>
                      <textarea readOnly value="Please share anything that will help prepare for our meeting." style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', minHeight: '80px', resize: 'none', outline: 'none' }} />
                    </div>

                    <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '40px' }}>
                      <Plus size={15} color="#64748b" /> Add guests
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', marginTop: 'auto' }}>
                      <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Back</button>
                      <button style={{ background: '#0E61F3', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem', fontWeight: 600, padding: '10px 24px', cursor: 'pointer' }}>Confirm</button>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '32px' }}>
                  <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0E61F3', padding: '10px 24px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={16} /> Save changes to preview all updates
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'conf' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 1fr) auto', gap: '48px', height: '100%' }}>
              
              {/* LEFT COLUMN: SETUP */}
              <div onClick={e => e.stopPropagation()} style={{ overflowY: 'auto', height: '100%', padding: '32px 16px 32px 0' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  
                  {/* Calendar event name */}
                  <div style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>Calendar event name</h3>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input 
                        type="text" 
                        readOnly 
                        value="15 min meeting between Kontham sohith and {Scheduler}"
                        style={{ flex: 1, padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontSize: '0.9rem', outline: 'none' }}
                      />
                      <button style={{ padding: '0 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                    </div>
                  </div>

                  <div style={{ height: '1px', background: '#e2e8f0' }} />

                  {/* Redirect on booking */}
                  <div style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>Redirect on booking</h3>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Redirect to a custom URL after a successful booking</p>
                    </div>
                    <ToggleSwitch checked={confRedirect} onChange={() => setConfRedirect(!confRedirect)} />
                  </div>

                  <div style={{ height: '1px', background: '#e2e8f0' }} />

                  {/* Custom 'Reply-To' email */}
                  <div style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ paddingRight: '24px' }}>
                      <h3 style={{ margin: '0 0 8px', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>Custom 'Reply-To' email</h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>Use a different email address as the replyTo for confirmation emails instead of the organizer's email</p>
                    </div>
                    <ToggleSwitch checked={false} />
                  </div>

                  <div style={{ height: '1px', background: '#e2e8f0' }} />

                  {/* Send LinksMeet Video transcription emails */}
                  <div style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', opacity: 0.6 }}>
                    <div style={{ paddingRight: '24px' }}>
                      <h3 style={{ margin: '0 0 8px', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>Send LinksMeet Video transcription emails</h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>Send emails with the transcription of the LinksMeet Video after the meeting ends. (Requires a paid plan)</p>
                    </div>
                    <ToggleSwitch checked={true} />
                  </div>

                </div>
              </div>


              {/* RIGHT COLUMN: PREVIEW */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '32px 0' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '560px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                  
                  {/* Top Confirmation Section */}
                  <div style={{ padding: '40px 32px 32px', textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eff6ff', color: '#0E61F3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                      {confRedirect ? <Link2 size={24} strokeWidth={3} /> : <Check size={24} strokeWidth={3} />}
                    </div>
                    <h2 style={{ margin: '0 0 12px', fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>{confRedirect ? 'Redirecting...' : 'This meeting is scheduled'}</h2>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b', lineHeight: 1.5 }}>
                      {confRedirect ? "You are being redirected to the host's external website." : "We sent an email with a calendar invitation with the details to everyone."}
                    </p>
                  </div>

                  <div style={{ height: '1px', background: '#e2e8f0' }} />

                  {/* Meeting Details Table */}
                  <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* What */}
                    <div style={{ display: 'flex' }}>
                      <div style={{ width: '100px', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>What</div>
                      <div style={{ flex: 1, fontSize: '0.9rem', color: '#334155' }}>15 min meeting between {hostName} and {'{Guest Name}'}</div>
                    </div>

                    {/* When */}
                    <div style={{ display: 'flex' }}>
                      <div style={{ width: '100px', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>When</div>
                      <div style={{ flex: 1, fontSize: '0.9rem', color: '#334155' }}>
                        <div style={{ marginBottom: '4px' }}>Sunday, July 5, 2026</div>
                        <div style={{ color: '#64748b' }}>10:00 AM - 10:15 AM (India Standard Time)</div>
                      </div>
                    </div>

                    {/* Who */}
                    <div style={{ display: 'flex' }}>
                      <div style={{ width: '100px', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>Who</div>
                      <div style={{ flex: 1, fontSize: '0.9rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {hostName}
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px' }}>Host</span>
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                            {'{Guest Name}'}
                            <span style={{ fontSize: '0.7rem', fontWeight: 600, background: '#ffedd5', color: '#c2410c', padding: '2px 6px', borderRadius: '4px' }}>Guest</span>
                          </div>
                          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>guest@example.com</div>
                        </div>
                      </div>
                    </div>

                    {/* Where */}
                    <div style={{ display: 'flex' }}>
                      <div style={{ width: '100px', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>Where</div>
                      <div style={{ flex: 1, fontSize: '0.9rem', color: '#334155' }}>LinksMeet Video</div>
                    </div>
                  </div>

                  <div style={{ height: '1px', background: '#e2e8f0', margin: '0 32px' }} />

                  {/* Add to calendar */}
                  <div style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>Add to calendar</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <span style={{ fontWeight: 700, color: '#ea4335' }}>G</span>
                      </div>
                      <div style={{ width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <span style={{ fontWeight: 700, color: '#0078d4' }}>M</span>
                      </div>
                      <div style={{ width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <span style={{ fontWeight: 700, color: '#0078d4' }}>O</span>
                      </div>
                      <div style={{ width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <span style={{ fontWeight: 700, color: '#6001d2' }}>Y!</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ height: '1px', background: '#e2e8f0' }} />

                  {/* Reschedule/Cancel */}
                  <div style={{ padding: '24px 32px', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
                    Need to make a change? <a href="#" style={{ color: '#0E61F3', textDecoration: 'none', fontWeight: 600 }}>Reschedule</a> or <a href="#" style={{ color: '#0E61F3', textDecoration: 'none', fontWeight: 600 }}>Cancel</a>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'app' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 1fr) auto', gap: '48px', height: '100%' }}>
              
              {/* LEFT COLUMN: SETUP */}
              <div onClick={e => e.stopPropagation()} style={{ overflowY: 'auto', height: '100%', padding: '32px 16px 32px 0' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  
                  {/* Layout */}
                  <div style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Layout</h3>
                    <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748b' }}>You can select multiple and your guests can switch views.</p>
                    
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                      {/* Month */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ width: '110px', height: '70px', border: '2px solid #bfdbfe', borderRadius: '8px', background: '#f8fafc', padding: '8px', position: 'relative' }}>
                          <div style={{ width: '20px', height: '4px', background: '#3b82f6', borderRadius: '2px', marginBottom: '8px' }}></div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                             <div style={{ height: '4px', background: '#cbd5e1', borderRadius: '2px' }}></div>
                             <div style={{ height: '4px', background: '#cbd5e1', borderRadius: '2px' }}></div>
                             <div style={{ height: '4px', background: '#cbd5e1', borderRadius: '2px' }}></div>
                             <div style={{ height: '4px', background: '#cbd5e1', borderRadius: '2px' }}></div>
                             <div style={{ height: '4px', background: '#cbd5e1', borderRadius: '2px' }}></div>
                             <div style={{ height: '4px', background: '#cbd5e1', borderRadius: '2px' }}></div>
                             <div style={{ height: '4px', background: '#bfdbfe', borderRadius: '2px' }}></div>
                             <div style={{ height: '4px', background: '#cbd5e1', borderRadius: '2px' }}></div>
                          </div>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                          <input type="checkbox" checked readOnly style={{ accentColor: '#0E61F3', cursor: 'pointer' }} /> Month <span style={{ color: '#64748b', fontWeight: 400 }}>(Default)</span>
                        </label>
                      </div>

                      {/* Weekly */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ width: '110px', height: '70px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#ffffff', padding: '8px', display: 'flex', gap: '6px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #bfdbfe', marginBottom: '8px' }}></div>
                            <div style={{ width: '80%', height: '2px', background: '#cbd5e1', borderRadius: '2px', marginBottom: '2px' }}></div>
                            <div style={{ width: '60%', height: '2px', background: '#cbd5e1', borderRadius: '2px' }}></div>
                          </div>
                          <div style={{ flex: 2, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
                             <div style={{ background: '#f1f5f9', borderRadius: '2px' }}></div>
                             <div style={{ background: '#f1f5f9', borderRadius: '2px' }}></div>
                             <div style={{ background: '#bfdbfe', borderRadius: '2px' }}></div>
                          </div>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                          <input type="checkbox" checked readOnly style={{ accentColor: '#0E61F3', cursor: 'pointer' }} /> Weekly
                        </label>
                      </div>

                      {/* Column */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ width: '110px', height: '70px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#ffffff', padding: '8px', display: 'flex', gap: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #bfdbfe', marginBottom: '8px' }}></div>
                            <div style={{ width: '80%', height: '2px', background: '#cbd5e1', borderRadius: '2px', marginBottom: '2px' }}></div>
                            <div style={{ width: '60%', height: '2px', background: '#cbd5e1', borderRadius: '2px' }}></div>
                          </div>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div style={{ height: '4px', background: '#bfdbfe', borderRadius: '2px' }}></div>
                            <div style={{ height: '4px', background: '#bfdbfe', borderRadius: '2px' }}></div>
                            <div style={{ height: '4px', background: '#bfdbfe', borderRadius: '2px' }}></div>
                          </div>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                          <input type="checkbox" checked readOnly style={{ accentColor: '#0E61F3', cursor: 'pointer' }} /> Column
                        </label>
                      </div>
                    </div>
                  </div>

                  <div style={{ height: '1px', background: '#e2e8f0' }} />

                  {/* Default view */}
                  <div style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Default view</h3>
                    
                    <div style={{ display: 'inline-flex', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px', marginBottom: '16px' }}>
                      <button onClick={() => setAppLayout('Month')} style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: appLayout === 'Month' ? '#eff6ff' : 'transparent', color: appLayout === 'Month' ? '#0E61F3' : '#64748b', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Month</button>
                      <button onClick={() => setAppLayout('Weekly')} style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: appLayout === 'Weekly' ? '#eff6ff' : 'transparent', color: appLayout === 'Weekly' ? '#0E61F3' : '#64748b', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Weekly</button>
                      <button onClick={() => setAppLayout('Column')} style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: appLayout === 'Column' ? '#eff6ff' : 'transparent', color: appLayout === 'Column' ? '#0E61F3' : '#64748b', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Column</button>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                      You can manage this for all your event types in Settings -&gt; Appearance or <a href="#" style={{color:'#0E61F3', textDecoration:'none', fontWeight: 500}}>Override</a> for this event only.
                    </p>
                  </div>

                  <div style={{ height: '1px', background: '#e2e8f0' }} />

                  {/* Event type color */}
                  <div style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ paddingRight: '24px' }}>
                      <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Event type color</h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>This is only used for event type & booking differentiation within the app. It is not displayed to bookers.</p>
                    </div>
                    <input type="color" value={eventColor} onChange={e => setEventColor(e.target.value)} style={{ cursor: 'pointer', border: 'none', background: 'none', width: '36px', height: '36px', padding: 0 }} />
                  </div>

                  <div style={{ height: '1px', background: '#e2e8f0' }} />

                  {/* Auto translate title and description */}
                  <div style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ paddingRight: '24px' }}>
                      <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Auto translate title and description</h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>Automatically translate titles and descriptions to the visitor's browser language using AI.</p>
                    </div>
                    <ToggleSwitch checked={autoTranslate} onChange={() => setAutoTranslate(!autoTranslate)} />
                  </div>

                  <div style={{ height: '1px', background: '#e2e8f0' }} />

                  {/* Interface language */}
                  <div style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ paddingRight: '24px' }}>
                      <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Interface language</h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>Set your preferred language for the booking interface</p>
                    </div>
                    <select value={interfaceLang} onChange={e => setInterfaceLang(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', color: '#0f172a', fontWeight: 500, minWidth: '120px' }}>
                      <option>English</option>
                      <option>French</option>
                      <option>Spanish</option>
                      <option>German</option>
                    </select>
                  </div>

                  <div style={{ height: '1px', background: '#e2e8f0' }} />

                  {/* Lock timezone on booking page */}
                  <div style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ paddingRight: '24px' }}>
                      <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Lock timezone on booking page</h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>To lock the timezone on booking page, useful for in-person events. <a href="#" style={{color:'#0E61F3', textDecoration:'none', fontWeight: 500}}>Learn more</a></p>
                    </div>
                    <ToggleSwitch checked={lockTimezone} onChange={() => setLockTimezone(!lockTimezone)} />
                  </div>

                </div>
              </div>

              {/* RIGHT COLUMN: PREVIEW */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '32px 0' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', width: '100%', maxWidth: '820px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                  
                  {/* Preview Left: Details */}
                  <div style={{ width: '320px', borderRight: '1px solid #e2e8f0', padding: '32px 24px', background: '#ffffff' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0E61F3', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>
                      {hostInitials}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>{hostName}</div>
                    <h2 style={{ margin: '0 0 24px', fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
                      {appLayout === 'Month' ? (form.title || '15 min meeting') : `${form.title || '15 min meeting'} (${appLayout} View)`}
                      {autoTranslate && <span style={{ fontSize: '0.65rem', background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', verticalAlign: 'middle', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Translated</span>}
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
                        <Calendar size={18} style={{ marginTop: '2px' }} />
                        <div>
                          <div>Saturday, July 4, 2026</div>
                          <div style={{ color: '#0f172a', fontWeight: 600 }}>10:00 - 10:15 am</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
                        <Clock size={18} />
                        {durMinutes}m
                      </div>
                      <div style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
                        <Video size={18} />
                        LinksMeet Video
                      </div>
                      <div style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '0.9rem', fontWeight: 500, alignItems: 'center' }}>
                        <Globe size={18} />
                        Asia/Calcutta
                        {!lockTimezone && <ChevronDown size={14} />}
                        {lockTimezone && <span style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: '4px', marginLeft: 'auto' }}>Locked</span>}
                      </div>
                    </div>
                  </div>

                  {/* Preview Right: Form */}
                  <div style={{ flex: 1, padding: '32px 40px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                        {interfaceLang === 'French' ? 'Votre nom *' : interfaceLang === 'Spanish' ? 'Tu nombre *' : interfaceLang === 'German' ? 'Dein Name *' : 'Your name *'}
                      </label>
                      <input type="text" readOnly value={hostName} style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }} />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                        {interfaceLang === 'French' ? 'Adresse e-mail *' : interfaceLang === 'Spanish' ? 'Correo electrónico *' : interfaceLang === 'German' ? 'E-Mail-Adresse *' : 'Email address *'}
                      </label>
                      <input type="text" readOnly value="guest@example.com" style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }} />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Additional notes</label>
                      <textarea readOnly value="Please share anything that will help prepare for our meeting." style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', minHeight: '80px', resize: 'none', outline: 'none' }} />
                    </div>

                    <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '40px' }}>
                      <Plus size={15} color="#64748b" /> Add guests
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', marginTop: 'auto' }}>
                      <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Back</button>
                      <button style={{ background: '#0E61F3', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem', fontWeight: 600, padding: '10px 24px', cursor: 'pointer' }}>Confirm</button>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '32px' }}>
                  <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0E61F3', padding: '10px 24px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={16} /> Save changes to preview all updates
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'limits' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 1fr) auto', gap: '48px', height: '100%' }}>
              
              {/* LEFT COLUMN: SETUP */}
              <div onClick={e => e.stopPropagation()} style={{ overflowY: 'auto', height: '100%', padding: '32px 16px 32px 0' }}>
                
                {/* Buffers & Intervals Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                  
                  {/* Before event */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>
                      Before event <Info size={14} color="#64748b" />
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none', appearance: 'none' }}>
                        <option>No buffer time</option>
                      </select>
                      <ChevronDown size={16} color="#64748b" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                  </div>

                  {/* After event */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>
                      After event <Info size={14} color="#64748b" />
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none', appearance: 'none' }}>
                        <option>No buffer time</option>
                      </select>
                      <ChevronDown size={16} color="#64748b" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                  </div>

                  {/* Minimum notice */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>
                      Minimum notice <Info size={14} color="#64748b" />
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ position: 'relative', width: '80px' }}>
                        <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none', appearance: 'none' }}>
                          <option>2</option>
                        </select>
                        <ChevronDown size={16} color="#64748b" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      </div>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none', appearance: 'none' }}>
                          <option>Hours</option>
                        </select>
                        <ChevronDown size={16} color="#64748b" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      </div>
                    </div>
                  </div>

                  {/* Time-slot intervals */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>
                      Time-slot intervals <Info size={14} color="#64748b" />
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none', appearance: 'none' }}>
                        <option>Use event length (default)</option>
                      </select>
                      <ChevronDown size={16} color="#64748b" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                  </div>

                </div>

                <div style={{ height: '1px', background: '#e2e8f0', marginBottom: '24px' }} />

                {/* Toggles */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Limit booking frequency */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ paddingRight: '24px' }}>
                        <h3 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Limit booking frequency</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>Limit how many times this event can be booked. <a href="#" style={{color:'#0E61F3', textDecoration:'none', fontWeight: 500}}>Learn more</a></p>
                      </div>
                      <ToggleSwitch checked={false} />
                    </div>
                    <div style={{ height: '1px', background: '#f1f5f9', marginTop: '24px' }} />
                  </div>

                  {/* Limit total booking duration */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ paddingRight: '24px' }}>
                        <h3 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Limit total booking duration</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>Limit total amount of time that this event can be booked</p>
                      </div>
                      <ToggleSwitch checked={false} />
                    </div>
                    <div style={{ height: '1px', background: '#f1f5f9', marginTop: '24px' }} />
                  </div>

                  {/* Limit future bookings */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ paddingRight: '24px' }}>
                        <h3 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Limit future bookings</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>Limit how far in the future this event can be booked. <a href="#" style={{color:'#0E61F3', textDecoration:'none', fontWeight: 500}}>Learn more</a></p>
                      </div>
                      <ToggleSwitch checked={false} />
                    </div>
                    <div style={{ height: '1px', background: '#f1f5f9', marginTop: '24px' }} />
                  </div>

                  {/* Limit number of upcoming bookings per booker */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ paddingRight: '24px' }}>
                        <h3 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Limit number of upcoming bookings per booker</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>Limit the number of active bookings a booker can make for this event type. <a href="#" style={{color:'#0E61F3', textDecoration:'none', fontWeight: 500}}>Learn more</a></p>
                      </div>
                      <ToggleSwitch checked={false} />
                    </div>
                    <div style={{ height: '1px', background: '#f1f5f9', marginTop: '24px' }} />
                  </div>

                  {/* Show only the first available slot each day */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ paddingRight: '24px' }}>
                        <h3 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Show only the first available slot each day</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>Limit to one slot per day at the earliest available time.</p>
                      </div>
                      <ToggleSwitch checked={showOnlyFirstSlot} onChange={() => setShowOnlyFirstSlot(!showOnlyFirstSlot)} />
                    </div>
                  </div>

                </div>
              </div>

              {/* RIGHT COLUMN: PREVIEW */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '32px 0' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', width: '100%', maxWidth: '860px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                  
                  {/* Calendar View Left */}
                  <div style={{ flex: 1, padding: '32px', borderRight: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>July 2026</h3>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <ArrowLeft size={18} color="#64748b" style={{ cursor: 'pointer' }} />
                        <span style={{ fontSize: '1.2rem', lineHeight: '18px', color: '#64748b', cursor: 'pointer' }}>&rsaquo;</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '16px' }}>
                      {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                        <div key={day} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>{day}</div>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
                      {/* empty spots */}
                      <div /> <div /> <div />
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>1</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>2</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>3</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>4</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>5</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#ffffff', fontWeight: 700, background: '#0E61F3', borderRadius: '8px', cursor: 'pointer' }}>6</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>7</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>8</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>9</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>10</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>11</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>12</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>13</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>14</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>15</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>16</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>17</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>18</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>19</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>20</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>21</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>22</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>23</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>24</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>25</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>26</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>27</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>28</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>29</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>30</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>31</div>
                    </div>
                  </div>

                  {/* Time Slots Right */}
                  <div style={{ width: '280px', padding: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Mon 06</h3>
                      <div style={{ display: 'flex', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <button style={{ padding: '4px 12px', background: '#eff6ff', color: '#0f172a', border: 'none', borderRight: '1px solid #e2e8f0', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>12h</button>
                        <button style={{ padding: '4px 12px', background: 'transparent', color: '#64748b', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>24h</button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '360px', overflowY: 'auto', paddingRight: '8px' }}>
                      {(showOnlyFirstSlot 
                        ? ['9:00am'] 
                        : ['9:00am', '9:15am', '9:30am', '9:45am', '10:00am', '10:15am', '10:30am', '10:45am', '11:00am', '11:15am']
                      ).map(time => (
                        <button key={time} style={{ padding: '12px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}>
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                <div style={{ marginTop: '32px' }}>
                  <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0E61F3', padding: '10px 24px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={16} /> Save changes to preview all updates
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'pay' ? (
            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '64px 32px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#eff6ff', color: '#0E61F3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <CreditCard size={32} />
                </div>
                <h3 style={{ margin: '0 0 12px', fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>Payments & Seats</h3>
                <p style={{ margin: '0 0 24px', fontSize: '1rem', color: '#64748b' }}>This feature is coming soon! You will be able to collect payments and limit seats for your bookings.</p>
                <div style={{ background: '#f8fafc', color: '#334155', padding: '8px 16px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #e2e8f0' }}>Coming Soon</div>
              </div>
            </div>
          ) : activeTab === 'reschedule' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 1fr) auto', gap: '48px', height: '100%' }}>
              
              {/* LEFT COLUMN: SETUP */}
              <div onClick={e => e.stopPropagation()} style={{ overflowY: 'auto', height: '100%', padding: '32px 16px 32px 0' }}>
                
                {/* Require cancellation reason */}
                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>Require cancellation reason</label>
                  <div style={{ position: 'relative', width: '320px' }}>
                    <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none', appearance: 'none' }}>
                      <option>Mandatory for host only</option>
                    </select>
                    <ChevronDown size={16} color="#64748b" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>

                <div style={{ height: '1px', background: '#e2e8f0', marginBottom: '24px' }} />

                {/* Toggles */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Disable cancelling */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ paddingRight: '24px' }}>
                        <h3 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Disable cancelling</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>Disable event cancellation via calendar invite or email. <a href="#" style={{color:'#0E61F3', textDecoration:'none', fontWeight: 500}}>Learn more</a></p>
                      </div>
                      <ToggleSwitch checked={disableCancelling} onChange={() => setDisableCancelling(!disableCancelling)} />
                    </div>
                    <div style={{ height: '1px', background: '#f1f5f9', marginTop: '24px' }} />
                  </div>

                  {/* Disable rescheduling */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ paddingRight: '24px' }}>
                        <h3 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Disable rescheduling</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>Disable rescheduling via calendar invite or email. <a href="#" style={{color:'#0E61F3', textDecoration:'none', fontWeight: 500}}>Learn more</a></p>
                      </div>
                      <ToggleSwitch checked={disableRescheduling} onChange={() => setDisableRescheduling(!disableRescheduling)} />
                    </div>
                    <div style={{ height: '1px', background: '#f1f5f9', marginTop: '24px' }} />
                  </div>

                  {/* Allow rescheduling past events */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ paddingRight: '24px' }}>
                        <h3 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Allow rescheduling past events</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>Enabling this option allows for past events to be rescheduled. <a href="#" style={{color:'#0E61F3', textDecoration:'none', fontWeight: 500}}>Learn more</a></p>
                      </div>
                      <ToggleSwitch checked={false} />
                    </div>
                    <div style={{ height: '1px', background: '#f1f5f9', marginTop: '24px' }} />
                  </div>

                  {/* Allow booking through reschedule link */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ paddingRight: '24px' }}>
                        <h3 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Allow booking through reschedule link</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>When enabled, users will be able to create a new booking when trying to reschedule a cancelled booking</p>
                      </div>
                      <ToggleSwitch checked={false} />
                    </div>
                  </div>

                </div>
              </div>

              {/* RIGHT COLUMN: PREVIEW */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '32px 0' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', width: '100%', maxWidth: '820px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                  
                  {/* Preview Left: Details */}
                  <div style={{ width: '320px', borderRight: '1px solid #e2e8f0', padding: '32px 24px', background: '#ffffff' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0E61F3', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>
                      K
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>Kontham sohith</div>
                    <h2 style={{ margin: '0 0 16px', fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>{form.title || '15 min meeting'}</h2>
                    
                    {(disableCancelling || disableRescheduling) && (
                      <div style={{ padding: '8px 12px', background: '#fffbeb', color: '#b45309', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '20px', border: '1px solid #fde68a', lineHeight: 1.5 }}>
                        {disableCancelling && <div>&bull; Guests cannot cancel this event</div>}
                        {disableRescheduling && <div>&bull; Guests cannot reschedule this event</div>}
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
                        <Calendar size={18} style={{ marginTop: '2px' }} />
                        <div>
                          <div>Saturday, July 4, 2026</div>
                          <div style={{ color: '#0f172a', fontWeight: 600 }}>10:00 - 10:15 am</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
                        <Clock size={18} />
                        {durMinutes}m
                      </div>
                      <div style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
                        <Video size={18} />
                        LinksMeet Video
                      </div>
                      <div style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
                        <Globe size={18} />
                        Asia/Calcutta
                      </div>
                    </div>
                  </div>

                  {/* Preview Right: Form */}
                  <div style={{ flex: 1, padding: '32px 40px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Your name *</label>
                      <input type="text" readOnly value="Kontham sohith" style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }} />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Email address *</label>
                      <input type="text" readOnly value="sohithkontham5@gmail.com" style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }} />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Additional notes</label>
                      <textarea readOnly value="Please share anything that will help prepare for our meeting." style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', minHeight: '80px', resize: 'none', outline: 'none' }} />
                    </div>

                    <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '40px' }}>
                      <Plus size={15} color="#64748b" /> Add guests
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', marginTop: 'auto' }}>
                      <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Back</button>
                      <button style={{ background: '#0E61F3', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem', fontWeight: 600, padding: '10px 24px', cursor: 'pointer' }}>Confirm</button>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '32px' }}>
                  <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0E61F3', padding: '10px 24px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={16} /> Save changes to preview all updates
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: '800px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '32px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>{activeTab} Settings</h3>
                <p style={{ margin: '0', fontSize: '0.9rem', color: '#64748b' }}>Configure {activeTab} rules and options for this meeting type.</p>
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
