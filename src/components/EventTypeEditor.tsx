import { useState, useRef } from 'react';
import {
  ArrowLeft, Video, Link2, Clock, Calendar, CreditCard, LayoutTemplate,
  Check, Eye, ExternalLink, Bold, Italic, Edit2, Link as LinkIcon,
  Globe, ChevronDown, Code, Trash2, Plus, Info, Zap, X, MessageSquare,
  Phone, MapPin, Copy, Download, AlertTriangle
} from 'lucide-react';
import { addEventType, updateEventType, deleteEventType, type EventType } from '../lib/crm';
import { useAuth } from '../lib/AuthContext';

interface Props {
  uid: string;
  initialData: Partial<EventType> | null;
  onClose: () => void;
  onSaved: (id?: string) => void;
}

const LOCATION_OPTIONS = [
  { id: 'linksmeet', label: 'LinksMeet Video (Default)', icon: Video },
  { id: 'gmeet', label: 'Google Meet', icon: Video },
  { id: 'zoom', label: 'Zoom Video', icon: Video },
  { id: 'phone', label: 'Phone Call', icon: Phone },
  { id: 'inperson', label: 'In-Person Meeting', icon: MapPin }
];

const DURATION_OPTIONS = ['15 Minutes', '30 Minutes', '45 Minutes', '60 Minutes', '90 Minutes', 'Custom...'];

const ALL_MONTHS_DATA = (() => {
  const months = [];
  const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  for (let year = 2026; year <= 2027; year++) {
    for (let m = 0; m < 12; m++) {
      const days = new Date(year, m + 1, 0).getDate();
      const startDay = new Date(year, m, 1).getDay();
      months.push({
        name: `${names[m]} ${year}`,
        year,
        monthIndex: m,
        days,
        startDay
      });
    }
  }
  return months;
})();

const MONTHS = ALL_MONTHS_DATA.map(m => m.name);
const DAYS_IN_MONTH = ALL_MONTHS_DATA.map(m => m.days);

export default function EventTypeEditor({ uid, initialData, onClose, onSaved }: Props) {
  const { user } = useAuth();
  const hostName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Host';
  const hostInitials = hostName.substring(0, 2).toUpperCase();
  const userName = user?.user_metadata?.first_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You';
  const userEmail = user?.email || 'you@example.com';

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
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [multiDurOptions, setMultiDurOptions] = useState<string[]>(['15 Minutes', '30 Minutes']);
  const [customDurInput, setCustomDurInput] = useState('20');
  const [showLocAdvanced, setShowLocAdvanced] = useState(false);
  const [locInstructions, setLocInstructions] = useState('');
  const [customMeetingUrl, setCustomMeetingUrl] = useState('');
  const [additionalLocations, setAdditionalLocations] = useState<string[]>([]);
  const [showAddLocMenu, setShowAddLocMenu] = useState(false);

  // Interactive menu states
  const [showDurMenu, setShowDurMenu] = useState(false);
  const [showLocMenu, setShowLocMenu] = useState(false);
  const [showPresetMenu, setShowPresetMenu] = useState(false);

  // Toolbar action modals
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [showCalModal, setShowCalModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [embedTab, setEmbedTab] = useState<'inline' | 'popup'>('inline');

  // Interactive calendar preview states - Dynamic daily update!
  const [monthIdx, setMonthIdx] = useState(() => {
    const now = new Date();
    const idx = ALL_MONTHS_DATA.findIndex(m => m.year === now.getFullYear() && m.monthIndex === now.getMonth());
    return idx !== -1 ? idx : 0;
  });
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(() => {
    const now = new Date();
    const idx = ALL_MONTHS_DATA.findIndex(m => m.year === now.getFullYear() && m.monthIndex === now.getMonth());
    return idx !== -1 ? idx : 0;
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date().getDate());
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');

  // Real-time Settings States for UI previews
  const [requirePhone, setRequirePhone] = useState(false);
  const [confRedirect, setConfRedirect] = useState(!!initialData?.redirectUrl);
  const [redirectUrl, setRedirectUrl] = useState(initialData?.redirectUrl || '');
  const [allowedLayouts, setAllowedLayouts] = useState<string[]>(initialData?.allowedLayouts || ['Month']);
  const [defaultLayout, setDefaultLayout] = useState<string>(initialData?.defaultLayout || 'Month');

  const toggleLayout = (layout: string) => {
    setAllowedLayouts(prev => {
      if (prev.includes(layout)) {
        if (prev.length === 1) {
           triggerToast('At least one layout must be allowed.');
           return prev; // must have at least one
        }
        const next = prev.filter(l => l !== layout);
        if (defaultLayout === layout) {
           setDefaultLayout(next[0]);
        }
        triggerToast(`Removed ${layout} layout`);
        return next;
      } else {
        triggerToast(`Allowed ${layout} layout`);
        return [...prev, layout];
      }
    });
  };
  const [showOnlyFirstSlot, setShowOnlyFirstSlot] = useState(false);
  const [disableCancelling, setDisableCancelling] = useState(false);
  const [disableRescheduling, setDisableRescheduling] = useState(false);

  const [eventColor, setEventColor] = useState('#7d3bec');
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [interfaceLang, setInterfaceLang] = useState('English');
  const [lockTimezone, setLockTimezone] = useState(false);

  // Booking Form questions state
  const [questions, setQuestions] = useState([
    { id: 'name', label: 'Your name', type: 'Name', required: true, active: true },
    { id: 'email', label: 'Email address', type: 'Email', required: true, active: true },
    { id: 'phone', label: 'Phone number', type: 'Phone', required: requirePhone, active: requirePhone },
    { id: 'about', label: 'What is this meeting about?', type: 'Short text', required: false, active: false },
    { id: 'notes', label: 'Additional notes', type: 'Long text', required: false, active: true },
    { id: 'guests', label: 'Add guests', type: 'Multiple Emails', required: false, active: true },
    { id: 'reschedule', label: 'Reason for reschedule', type: 'Long text', required: false, active: true },
  ]);

  // Confirmation state
  const [confChannel, setConfChannel] = useState<'email' | 'phone'>('email');
  const [calEventName, setCalEventName] = useState(`${form.title || '15 min meeting'} between ${userName} and {Scheduler}`);
  const [customReplyTo, setCustomReplyTo] = useState(!!initialData?.replyToEmail);
  const [replyToEmail, setReplyToEmail] = useState(initialData?.replyToEmail || '');
  const [sendTranscription, setSendTranscription] = useState(true);

  // Limits & buffers state
  const [bufferBefore, setBufferBefore] = useState('No buffer time');
  const [bufferAfter, setBufferAfter] = useState('No buffer time');
  const [minNoticeVal, setMinNoticeVal] = useState('2');
  const [minNoticeUnit, setMinNoticeUnit] = useState('Hours');
  const [timeInterval, setTimeInterval] = useState('Use event length (default)');
  const [limitFreq, setLimitFreq] = useState(false);
  const [limitDuration, setLimitDuration] = useState(false);
  const [limitFuture, setLimitFuture] = useState(false);
  const [limitBooker, setLimitBooker] = useState(false);

  // Reschedule & cancel additional state
  const [cancelReasonReq, setCancelReasonReq] = useState('Mandatory for host only');
  const [allowPastReschedule, setAllowPastReschedule] = useState(false);
  const [allowRescheduleBooking, setAllowRescheduleBooking] = useState(false);

  // Payments & Seats state
  const [requirePayment, setRequirePayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('50');
  const [paymentCurrency, setPaymentCurrency] = useState('USD ($)');
  const [maxSeats, setMaxSeats] = useState('1');

  // Apps state
  const [appsConnected, setAppsConnected] = useState<{ [key: string]: boolean }>({
    gcal: true, zoom: false, stripe: false, hubspot: false, slack: false
  });

  // Workflows state
  const [workflows, setWorkflows] = useState([
    { id: 'remind_24', title: 'Email reminder 24 hours before', active: true },
    { id: 'remind_1', title: 'SMS reminder 1 hour before', active: false },
    { id: 'followup', title: 'Thank you email after meeting', active: true },
  ]);

  // Webhooks state
  const [webhooks, setWebhooks] = useState([
    { id: '1', url: 'https://api.mycompany.com/events/salemail', events: 'booking.created, booking.cancelled', active: true }
  ]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');

  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('sm_avail_schedule_' + (initialData?.slug || initialData?.id || 'default'));
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      { day: 'Sunday', active: false, start: '09:00 AM', end: '05:00 PM' },
      { day: 'Monday', active: true, start: '09:00 AM', end: '05:00 PM' },
      { day: 'Tuesday', active: true, start: '09:00 AM', end: '05:00 PM' },
      { day: 'Wednesday', active: true, start: '09:00 AM', end: '05:00 PM' },
      { day: 'Thursday', active: true, start: '09:00 AM', end: '05:00 PM' },
      { day: 'Friday', active: true, start: '09:00 AM', end: '05:00 PM' },
      { day: 'Saturday', active: false, start: '09:00 AM', end: '05:00 PM' },
    ];
  });

  const toggleDay = (idx: number) => {
    setSchedule(prev => prev.map((item, i) => i === idx ? { ...item, active: !item.active } : item));
  };

  const TIME_OPTIONS = [
    '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM'
  ];

  const handleTimeChange = (idx: number, field: 'start' | 'end', val: string) => {
    setSchedule(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
    triggerToast(`Updated ${schedule[idx]?.day} ${field} time to ${val}`);
  };

  const handleCopyDayToAll = (idx: number) => {
    const source = schedule[idx];
    if (!source) return;
    setSchedule(prev => prev.map((item, i) => i === idx ? item : { ...item, active: true, start: source.start, end: source.end }));
    triggerToast(`Copied ${source.day} hours (${source.start} - ${source.end}) to all days!`);
  };

  const handleAddHour = (idx: number) => {
    const source = schedule[idx];
    if (!source) return;
    const currentEndIdx = TIME_OPTIONS.indexOf(source.end);
    const nextEnd = currentEndIdx !== -1 && currentEndIdx < TIME_OPTIONS.length - 1 ? TIME_OPTIONS[currentEndIdx + 1] : '11:00 PM';
    setSchedule(prev => prev.map((item, i) => i === idx ? { ...item, end: nextEnd } : item));
    triggerToast(`Extended ${source.day} until ${nextEnd}`);
  };

  const applyPresetSchedule = (preset: 'business' | 'extended' | 'weekends' | 'all') => {
    if (preset === 'business') {
      setSchedule(prev => prev.map(item => ({ ...item, active: !['Sunday', 'Saturday'].includes(item.day), start: '09:00 AM', end: '05:00 PM' })));
      triggerToast('Applied Standard Business Hours (Mon-Fri, 9am-5pm)');
    } else if (preset === 'extended') {
      setSchedule(prev => prev.map(item => ({ ...item, active: !['Sunday', 'Saturday'].includes(item.day), start: '08:00 AM', end: '08:00 PM' })));
      triggerToast('Applied Extended Work Hours (Mon-Fri, 8am-8pm)');
    } else if (preset === 'weekends') {
      setSchedule(prev => prev.map(item => ({ ...item, active: ['Sunday', 'Saturday'].includes(item.day), start: '10:00 AM', end: '04:00 PM' })));
      triggerToast('Applied Weekends Only (Sat-Sun, 10am-4pm)');
    } else if (preset === 'all') {
      setSchedule(prev => prev.map(item => ({ ...item, active: true, start: '09:00 AM', end: '06:00 PM' })));
      triggerToast('Applied All 7 Days (Sun-Sat, 9am-6pm)');
    }
  };

  const getMonthStartOffset = (mIdx: number) => {
    return ALL_MONTHS_DATA[mIdx]?.startDay || 0;
  };

  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getDayOfWeek = (dateNum: number, mIdx: number) => {
    const mObj = ALL_MONTHS_DATA[mIdx];
    if (!mObj) return 0;
    return new Date(mObj.year, mObj.monthIndex, dateNum).getDay();
  };

  const getDayName = (dateNum: number, mIdx: number) => {
    return DAY_NAMES[getDayOfWeek(dateNum, mIdx)];
  };

  const isDateInPast = (d: number, mIdx: number) => {
    const mObj = ALL_MONTHS_DATA[mIdx];
    if (!mObj) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const targetDate = new Date(mObj.year, mObj.monthIndex, d);
    return targetDate < now;
  };

  const parseTimeToMinutes = (timeStr: string) => {
    const parts = timeStr.trim().split(' ');
    if (!parts[0]) return 540;
    const [hStr, mStr] = parts[0].split(':');
    let h = parseInt(hStr, 10) || 9;
    const m = parseInt(mStr, 10) || 0;
    const period = parts[1]?.toUpperCase();
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  const formatMinutesToTime = (totalMinutes: number, format: '12h' | '24h') => {
    const h24 = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    const mStr = m < 10 ? `0${m}` : `${m}`;
    if (format === '24h') {
      const hStr = h24 < 10 ? `0${h24}` : `${h24}`;
      return `${hStr}:${mStr}`;
    } else {
      const period = h24 >= 12 ? 'PM' : 'AM';
      let h12 = h24 % 12;
      if (h12 === 0) h12 = 12;
      const hStr = h12 < 10 ? `0${h12}` : `${h12}`;
      return `${hStr}:${mStr} ${period}`;
    }
  };

  const generateRealTimeSlots = (dateNum: number, mIdx: number, format: '12h' | '24h', durMins: number) => {
    if (isDateInPast(dateNum, mIdx)) return [];
    const dayName = getDayName(dateNum, mIdx);
    const daySchedule = schedule.find(s => s.day === dayName);
    if (!daySchedule || !daySchedule.active) return [];
    
    const startMins = parseTimeToMinutes(daySchedule.start);
    const endMins = parseTimeToMinutes(daySchedule.end);
    
    const slots = [];
    const step = Math.max(5, durMins || 15);
    for (let m = startMins; m + step <= endMins; m += step) {
      const startTime = formatMinutesToTime(m, format);
      const endTime = formatMinutesToTime(m + step, format);
      slots.push(`${startTime} - ${endTime}`);
    }
    return slots;
  };

  const getAvailabilitySummary = () => {
    const activeDays = schedule.filter(s => s.active);
    if (activeDays.length === 0) return 'No available hours configured';
    const first = activeDays[0];
    const allSameHours = activeDays.every(s => s.start === first.start && s.end === first.end);
    if (allSameHours) {
      if (activeDays.length === 5 && !schedule[0].active && !schedule[6].active) {
        return `Mon - Fri: ${first.start} - ${first.end} (IST)`;
      }
      if (activeDays.length === 7) {
        return `Every day: ${first.start} - ${first.end} (IST)`;
      }
    }
    const dayAbbrs = activeDays.map(s => s.day.substring(0, 3)).join(', ');
    return `${dayAbbrs}: ${first.start} - ${first.end} (IST)`;
  };

  const descInputRef = useRef<HTMLTextAreaElement | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleEditQuestion = (idx: number) => {
    const q = questions[idx];
    const newLabel = window.prompt('Enter new question label:', q.label);
    if (newLabel && newLabel.trim()) {
      setQuestions(prev => prev.map((item, i) => i === idx ? { ...item, label: newLabel.trim() } : item));
      triggerToast(`Updated question label to "${newLabel.trim()}"`);
    }
  };

  const handleAddQuestion = () => {
    const label = window.prompt('Enter new question label (e.g., Company Name, Job Title):');
    if (label && label.trim()) {
      setQuestions(prev => [...prev, { id: 'custom_' + Date.now(), label: label.trim(), type: 'Short text', required: false, active: true }]);
      triggerToast(`Added new question "${label.trim()}"`);
    }
  };

  const toggleQuestionActive = (idx: number) => {
    setQuestions(prev => prev.map((item, i) => {
      if (i === idx) {
        const nextActive = !item.active;
        if (item.id === 'phone') setRequirePhone(nextActive);
        return { ...item, active: nextActive };
      }
      return item;
    }));
  };

  const handleEditCalEventName = () => {
    const val = window.prompt('Customize calendar event name template:', calEventName);
    if (val && val.trim()) {
      setCalEventName(val.trim());
      triggerToast('Updated calendar event name template!');
    }
  };

  const toggleAppConnection = (appId: string, appName: string) => {
    setAppsConnected(prev => {
      const nextState = !prev[appId];
      triggerToast(`${nextState ? 'Connected' : 'Disconnected'} ${appName} integration`);
      return { ...prev, [appId]: nextState };
    });
  };

  const toggleWorkflow = (wId: string, title: string) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id === wId) {
        const nextState = !w.active;
        triggerToast(`${nextState ? 'Activated' : 'Paused'} workflow: "${title}"`);
        return { ...w, active: nextState };
      }
      return w;
    }));
  };

  const handleAddWorkflow = () => {
    const title = window.prompt('Enter new workflow automation rule (e.g., Send SMS 15m before meeting):');
    if (title && title.trim()) {
      setWorkflows(prev => [...prev, { id: 'wf_' + Date.now(), title: title.trim(), active: true }]);
      triggerToast(`Created automation: "${title.trim()}"`);
    }
  };

  const handleAddWebhook = () => {
    if (!newWebhookUrl || !newWebhookUrl.startsWith('http')) {
      triggerToast('Please enter a valid HTTP/HTTPS URL');
      return;
    }
    setWebhooks(prev => [...prev, { id: String(Date.now()), url: newWebhookUrl.trim(), events: 'booking.created, booking.rescheduled', active: true }]);
    setNewWebhookUrl('');
    triggerToast('Webhook endpoint added successfully!');
  };

  const handleDeleteWebhook = (wId: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== wId));
    triggerToast('Webhook endpoint deleted.');
  };

  // Real-time slug derivation if title changes
  const handleTitleChange = (newTitle: string) => {
    setForm(prev => {
      const next = { ...prev, title: newTitle };
      if (!isSlugEdited && !initialData?.id) {
        const autoSlug = newTitle.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-').replace(/^-|-$/g, '');
        next.slug = autoSlug || prev.slug;
      }
      setCalEventName(`${newTitle || 'Meeting'} between ${userName} and {Scheduler}`);
      return next;
    });
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
    setTimeout(() => {
      if (descInputRef.current) {
        descInputRef.current.focus();
        descInputRef.current.setSelectionRange(start + tagStart.length, start + tagStart.length + selected.length);
      }
    }, 0);
  };

  // Compute dynamic time slots based on duration
  const isCustomDur = form.dur === 'Custom...' || form.dur?.includes('Custom');
  const durMinutes = isCustomDur
    ? (parseInt(customDurInput, 10) || 15)
    : (parseInt(form.dur || '15', 10) || 15);

  const handleSave = async () => {
    if (!form.title || !form.slug) return;
    setSaving(true);
    
    const eventId = form.id || Math.random().toString(36).substring(2, 9);
    
    const savePayload = { 
      ...form, 
      id: eventId,
      redirectUrl: confRedirect ? redirectUrl : null,
      replyToEmail: customReplyTo ? replyToEmail : null,
      allowedLayouts,
      defaultLayout
    };

    try {
      localStorage.setItem('sm_avail_schedule_' + (form.slug || eventId || 'default'), JSON.stringify(schedule));
      localStorage.setItem('sm_avail_schedule', JSON.stringify(schedule));
      if (form.id) {
        await updateEventType(uid, form.id, savePayload as any);
      } else {
        await addEventType(uid, savePayload as any);
        setForm(prev => ({...prev, id: eventId}));
      }
      setSaving(false);
      triggerToast('Event type saved successfully.');
      onSaved(eventId);
    } catch (e: any) {
      console.error('Error saving event type:', e);
      setSaving(false);
      triggerToast(`Failed to save: ${e.message || 'Unknown error'}`);
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
    : `<script src="https://linksmeet.ai/embed.js"></script>\n<button onclick="LinksMeet.openBooking('${form.slug || '15min'}')" style="background:#7d3bec;color:#fff;padding:12px 24px;border-radius:8px;border:none;font-weight:600;">Book a Meeting</button>`;

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
    if (form.id) {
      try {
        await deleteEventType(uid, form.id);
      } catch (err: any) {
        console.error('Failed to delete:', err);
        triggerToast(`Failed to delete: ${err.message || 'Error'}`);
        return;
      }
    }
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
          color: active ? '#7d3bec' : '#334155',
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
        <Icon size={16} color={active ? '#7d3bec' : '#64748b'} style={{ flexShrink: 0 }} />
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
        background: checked ? '#7d3bec' : '#cbd5e1',
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
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: embedTab === 'inline' ? '#eff6ff' : '#f1f5f9', color: embedTab === 'inline' ? '#7d3bec' : '#64748b', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
              >Inline Embed (iframe)</button>
              <button
                onClick={() => setEmbedTab('popup')}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: embedTab === 'popup' ? '#eff6ff' : '#f1f5f9', color: embedTab === 'popup' ? '#7d3bec' : '#64748b', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
              >Floating Button</button>
            </div>

            <textarea
              readOnly
              value={embedCodeSnippet}
              style={{ width: '100%', minHeight: '110px', background: '#f8fafc', border: '2px solid #F5F5F5', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '0.82rem', color: '#334155', outline: 'none', resize: 'none', marginBottom: '20px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowEmbedModal(false)} style={{ padding: '10px 18px', borderRadius: '8px', border: '2px solid #F5F5F5', background: '#ffffff', color: '#334155', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>Close</button>
              <button onClick={handleCopyEmbed} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#7d3bec', color: '#ffffff', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
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
              <button onClick={() => setShowCalModal(false)} style={{ padding: '10px 18px', borderRadius: '8px', border: '2px solid #F5F5F5', background: '#ffffff', color: '#334155', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>Close</button>
              <button onClick={handleDownloadIcs} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#7d3bec', color: '#ffffff', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
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
              <button onClick={() => setShowDeleteModal(false)} style={{ padding: '10px 18px', borderRadius: '8px', border: '2px solid #F5F5F5', background: '#ffffff', color: '#334155', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDeleteConfirm} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#ffffff', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', height: '64px', borderBottom: '2px solid #F5F5F5', background: '#ffffff', flexShrink: 0, paddingRight: '24px' }}>

        {/* Header Left (Sidebar Width) */}
        <div style={{ width: '210px', padding: '0 20px', borderRight: '2px solid #F5F5F5', height: '100%', display: 'flex', alignItems: 'center' }}>
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
              style={{ width: '36px', height: '36px', borderRadius: '8px', border: '2px solid #F5F5F5', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s ease' }}
            >
              <ExternalLink size={16} />
            </button>
            <button
              onClick={handleCopyLink}
              title="Copy booking URL"
              style={{ width: '36px', height: '36px', borderRadius: '8px', border: '2px solid #F5F5F5', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s ease' }}
            >
              <LinkIcon size={16} />
            </button>
            <button
              onClick={() => setShowEmbedModal(true)}
              title="Embed website widget"
              style={{ width: '36px', height: '36px', borderRadius: '8px', border: '2px solid #F5F5F5', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s ease' }}
            >
              <Code size={16} />
            </button>
            <button
              onClick={() => setShowCalModal(true)}
              title="Calendar integrations & export"
              style={{ width: '36px', height: '36px', borderRadius: '8px', border: '2px solid #F5F5F5', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s ease' }}
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
              style={{ background: '#7d3bec', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginLeft: '6px', boxShadow: '0 2px 4px rgba(14, 97, 243, 0.2)' }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN BODY */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* LEFT SIDEBAR NAVIGATION */}
        <div style={{ width: '210px', borderRight: '2px solid #F5F5F5', display: 'flex', flexDirection: 'column', background: '#ffffff', overflowY: 'hidden', padding: '14px 10px', flexShrink: 0 }}>
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
          <NavItem icon={Zap} label="Workflows" id="workflows" />
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
                    style={{ width: '100%', background: '#ffffff', border: '2px solid #F5F5F5', color: '#0f172a', padding: '10px 14px', borderRadius: '8px', fontSize: '0.92rem', outline: 'none', fontWeight: 500 }}
                  />
                </div>

                {/* Description */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Description</label>
                  <div style={{ border: '2px solid #F5F5F5', borderRadius: '8px', overflow: 'hidden', background: '#ffffff' }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #F5F5F5', borderRadius: '8px', overflow: 'hidden', background: '#ffffff' }}>
                    <div style={{ padding: '10px 14px', background: '#f8fafc', color: '#64748b', fontSize: '0.88rem', borderRight: '2px solid #F5F5F5', whiteSpace: 'nowrap' }}>
                      linksmeet.ai/booking/
                    </div>
                    <input
                      value={form.slug || ''}
                      onChange={e => {
                        setIsSlugEdited(true);
                        setForm({ ...form, slug: e.target.value });
                      }}
                      style={{ flex: 1, background: 'transparent', border: 'none', color: '#7d3bec', padding: '10px 14px', fontSize: '0.88rem', outline: 'none', fontWeight: 600 }}
                    />
                  </div>
                </div>

                {/* Duration */}
                <div style={{ marginBottom: '14px', position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Duration</label>
                  <div
                    onClick={() => setShowDurMenu(!showDurMenu)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', userSelect: 'none' }}
                  >
                    <span style={{ fontSize: '0.92rem', color: '#0f172a', fontWeight: 500 }}>
                      {isCustomDur ? `${customDurInput} Minutes (Custom)` : durMinutes}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.88rem', color: '#475569', fontWeight: 500 }}>
                      Minutes <ChevronDown size={15} />
                    </span>
                  </div>

                  {/* Interactive Duration Menu */}
                  {showDurMenu && (
                    <div style={{ position: 'absolute', top: '72px', left: 0, right: 0, background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden' }}>
                      {DURATION_OPTIONS.map(opt => (
                        <div
                          key={opt}
                          onClick={() => { setForm({ ...form, dur: opt }); setShowDurMenu(false); }}
                          style={{ padding: '10px 14px', fontSize: '0.88rem', fontWeight: form.dur === opt ? 600 : 400, color: form.dur === opt ? '#7d3bec' : '#0f172a', background: form.dur === opt ? '#eff6ff' : '#ffffff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                          <span>{opt}</span>
                          {form.dur === opt && <Check size={16} />}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {isCustomDur && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        min="1"
                        value={customDurInput}
                        onChange={e => {
                          setCustomDurInput(e.target.value);
                          setForm({ ...form, dur: `${e.target.value || '15'} Minutes (Custom)` });
                        }}
                        style={{ width: '100px', background: '#ffffff', border: '1px solid #7d3bec', borderRadius: '6px', padding: '8px 12px', fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', outline: 'none' }}
                      />
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>minutes custom duration</span>
                    </div>
                  )}
                </div>


                {/* Location */}
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Location</label>
                  <div
                    onClick={() => setShowLocMenu(!showLocMenu)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
                      <LocIcon size={16} color="#7d3bec" /> {form.location || 'Select a location...'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                      <ChevronDown size={16} />
                      <X size={16} onClick={(e) => { e.stopPropagation(); setForm({ ...form, location: 'Select a location...' }); }} />
                    </div>
                  </div>

                  {/* Interactive Location Selection Menu */}
                  {showLocMenu && (
                    <div style={{ position: 'absolute', top: '72px', left: 0, right: 0, background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden' }}>
                      {LOCATION_OPTIONS.map(opt => {
                        const OptIcon = opt.icon;
                        const isSel = form.location === opt.label;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => { setForm({ ...form, location: opt.label }); setShowLocMenu(false); }}
                            style={{ padding: '12px 14px', fontSize: '0.88rem', fontWeight: isSel ? 600 : 400, color: isSel ? '#7d3bec' : '#0f172a', background: isSel ? '#eff6ff' : '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <OptIcon size={16} color={isSel ? '#7d3bec' : '#64748b'} />
                              <span>{opt.label}</span>
                            </div>
                            {isSel && <Check size={16} />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Additional Locations List */}
                  {additionalLocations.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                      {additionalLocations.map((loc, idx) => {
                        const locObj = LOCATION_OPTIONS.find(o => o.label === loc) || LOCATION_OPTIONS[0];
                        const AddIcon = locObj.icon;
                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', border: '2px solid #F5F5F5', borderRadius: '8px', padding: '8px 14px', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <AddIcon size={15} color="#7d3bec" /> <span>{loc} <span style={{ fontWeight: 400, color: '#64748b', fontSize: '0.78rem' }}>(Optional choice)</span></span>
                            </div>
                            <X size={15} style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => setAdditionalLocations(prev => prev.filter((_, i) => i !== idx))} />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div
                    onClick={() => setShowLocAdvanced(!showLocAdvanced)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#7d3bec', cursor: 'pointer', marginBottom: '14px', userSelect: 'none' }}
                  >
                    <span>{showLocAdvanced ? 'Hide advanced settings' : 'Show advanced settings'}</span>
                    <ChevronDown size={15} style={{ transform: showLocAdvanced ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                  </div>

                  {showLocAdvanced && (
                    <div style={{ background: '#f8fafc', border: '2px solid #F5F5F5', borderRadius: '8px', padding: '14px', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeIn 0.15s ease' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Location instructions for guests</label>
                        <input
                          value={locInstructions}
                          onChange={e => setLocInstructions(e.target.value)}
                          placeholder="e.g. Please dial extension 402 or meet at Room 3B"
                          style={{ width: '100%', background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '6px', padding: '8px 10px', fontSize: '0.82rem', color: '#0f172a', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Custom meeting URL (optional)</label>
                        <input
                          value={customMeetingUrl}
                          onChange={e => setCustomMeetingUrl(e.target.value)}
                          placeholder="https://zoom.us/j/123456789"
                          style={{ width: '100%', background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '6px', padding: '8px 10px', fontSize: '0.82rem', color: '#0f172a', outline: 'none' }}
                        />
                      </div>
                    </div>
                  )}

                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setShowAddLocMenu(!showAddLocMenu)}
                      style={{ width: '100%', padding: '10px', background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '8px', color: '#7d3bec', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '10px' }}
                    >
                      <Plus size={16} /> Add a location
                    </button>

                    {showAddLocMenu && (
                      <div style={{ position: 'absolute', top: '44px', left: 0, right: 0, background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden' }}>
                        <div style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>SELECT SECONDARY LOCATION CHOICE</div>
                        {LOCATION_OPTIONS.filter(o => o.label !== form.location && !additionalLocations.includes(o.label)).map(opt => {
                          const OptIcon = opt.icon;
                          return (
                            <div
                              key={opt.id}
                              onClick={() => {
                                setAdditionalLocations(prev => [...prev, opt.label]);
                                setShowAddLocMenu(false);
                              }}
                              style={{ padding: '10px 14px', fontSize: '0.85rem', fontWeight: 500, color: '#0f172a', background: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                            >
                              <OptIcon size={16} color="#7d3bec" />
                              <span>{opt.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Can't find the right conferencing app? Visit our <span style={{ color: '#7d3bec', cursor: 'pointer', textDecoration: 'underline' }}>App Store</span>.
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: REAL-TIME LIVE PREVIEW CARD */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '20px 0' }}>
                <div style={{ background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '16px', padding: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', display: 'grid', gridTemplateColumns: '170px 1fr', gap: '20px', maxWidth: '460px', width: '100%' }}>

                  {/* Column 1: Left Info Pane */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eff6ff', color: '#7d3bec', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                          style={{ width: '28px', height: '28px', background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '6px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}
                        >&lt;</button>
                        <button
                          type="button"
                          onClick={() => setMonthIdx(Math.min(MONTHS.length - 1, monthIdx + 1))}
                          style={{ width: '28px', height: '28px', background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '6px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}
                        >&gt;</button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.68rem', fontWeight: 700, marginBottom: '8px' }}>
                      <div style={{ color: '#7d3bec' }}>SUN</div>
                      <div style={{ color: '#64748b' }}>MON</div>
                      <div style={{ color: '#64748b' }}>TUE</div>
                      <div style={{ color: '#64748b' }}>WED</div>
                      <div style={{ color: '#64748b' }}>THU</div>
                      <div style={{ color: '#64748b' }}>FRI</div>
                      <div style={{ color: '#64748b' }}>SAT</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.78rem', fontWeight: 500, color: '#0f172a' }}>
                      {Array.from({ length: getMonthStartOffset(monthIdx) }, (_, i) => (
                        <div key={`empty-${i}`} style={{ padding: '6px 0', opacity: 0 }}>-</div>
                      ))}
                      {Array.from({ length: DAYS_IN_MONTH[monthIdx] }, (_, i) => i + 1).map(d => {
                        const isSel = d === selectedDate && monthIdx === selectedMonthIdx;
                        const dayName = getDayName(d, monthIdx);
                        const isAvailable = schedule.find(s => s.day === dayName)?.active || false;
                        const isPast = isDateInPast(d, monthIdx);
                        return (
                          <div
                            key={d}
                            onClick={() => { if (!isPast) { setSelectedDate(d); setSelectedMonthIdx(monthIdx); } }}
                            style={{
                              width: '26px',
                              height: '26px',
                              margin: '0 auto',
                              borderRadius: '50%',
                              background: isSel && !isPast ? '#7d3bec' : 'transparent',
                              color: isSel && !isPast ? '#ffffff' : isPast ? '#cbd5e1' : '#0f172a',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: isSel && !isPast ? 700 : 500,
                              cursor: isPast ? 'not-allowed' : 'pointer',
                              opacity: isPast ? 0.4 : 1,
                              textDecoration: isPast ? 'line-through' : 'none',
                              position: 'relative'
                            }}
                          >
                            <span>{d}</span>
                            {isAvailable && !isPast && (
                              <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: isSel ? '#ffffff' : '#7d3bec', position: 'absolute', bottom: '3px' }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Banner Pill below Preview Card */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                  <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', color: '#7d3bec', padding: '10px 20px', borderRadius: '9999px', fontSize: '0.84rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(14, 97, 243, 0.08)' }}>
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
                    onClick={() => applyPresetSchedule('business')}
                    style={{ border: '1px solid #bfdbfe', background: '#ffffff', color: '#7d3bec', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}
                  >
                    <Edit2 size={14} /> Reset to 9am-5pm
                  </button>
                </div>

                {/* Main Schedule Container Card */}
                <div style={{ background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                  
                  {/* Time zone selector */}
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Time zone</label>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', border: '2px solid #F5F5F5', borderRadius: '8px', background: '#ffffff', color: '#0f172a', fontWeight: 500, fontSize: '0.88rem', marginBottom: '20px', cursor: 'pointer' }}>
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
                            style={{ width: '18px', height: '18px', borderRadius: '4px', background: item.active ? '#7d3bec' : '#ffffff', border: item.active ? 'none' : '2px solid #F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                          >
                            {item.active && <Check size={13} color="#fff" strokeWidth={3} />}
                          </div>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>{item.day}</span>
                        </div>

                        {!item.active ? (
                          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>Unavailable</span>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <select
                              value={item.start}
                              onChange={e => handleTimeChange(idx, 'start', e.target.value)}
                              style={{ padding: '6px 10px', border: '2px solid #F5F5F5', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', background: '#ffffff', outline: 'none', cursor: 'pointer' }}
                            >
                              {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <span style={{ color: '#94a3b8', fontWeight: 600 }}>-</span>
                            <select
                              value={item.end}
                              onChange={e => handleTimeChange(idx, 'end', e.target.value)}
                              style={{ padding: '6px 10px', border: '2px solid #F5F5F5', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', background: '#ffffff', outline: 'none', cursor: 'pointer' }}
                            >
                              {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <button
                              type="button"
                              title="Extend end time by 1 hour"
                              onClick={() => handleAddHour(idx)}
                              style={{ width: '32px', height: '32px', border: '2px solid #F5F5F5', borderRadius: '6px', background: '#ffffff', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                              <Plus size={15} />
                            </button>
                            <button
                              type="button"
                              title="Copy these hours to all days"
                              onClick={() => handleCopyDayToAll(idx)}
                              style={{ width: '32px', height: '32px', border: '2px solid #F5F5F5', borderRadius: '6px', background: '#ffffff', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
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
                    onClick={() => applyPresetSchedule('extended')}
                    style={{ width: '100%', padding: '12px', border: '1px dashed #bfdbfe', borderRadius: '8px', background: '#eff6ff', color: '#7d3bec', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', marginTop: '18px' }}
                  >
                    <Plus size={16} /> Apply Extended Hours (8am - 8pm)
                  </button>

                  <div style={{ position: 'relative', marginTop: '12px' }}>
                    <div
                      onClick={() => setShowPresetMenu(!showPresetMenu)}
                      style={{ width: '100%', padding: '12px', border: '2px solid #F5F5F5', borderRadius: '8px', background: '#f8fafc', color: '#7d3bec', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      Copy availability from preset... <ChevronDown size={14} />
                    </div>

                    {showPresetMenu && (
                      <div style={{ position: 'absolute', bottom: '48px', left: 0, right: 0, background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden' }}>
                        {[
                          { val: 'business', label: 'Standard Business Hours (Mon-Fri 9:00 AM - 5:00 PM)' },
                          { val: 'extended', label: 'Extended Work Hours (Mon-Fri 8:00 AM - 8:00 PM)' },
                          { val: 'weekends', label: 'Weekends Only (Sat-Sun 10:00 AM - 4:00 PM)' },
                          { val: 'all', label: 'All 7 Days (Sun-Sat 9:00 AM - 6:00 PM)' }
                        ].map(opt => (
                          <div
                            key={opt.val}
                            onClick={() => {
                              applyPresetSchedule(opt.val as any);
                              setShowPresetMenu(false);
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                            style={{ padding: '10px 14px', fontSize: '0.85rem', fontWeight: 500, color: '#7d3bec', cursor: 'pointer', textAlign: 'center', borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                          >
                            {opt.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: PREVIEW AVAILABILITY */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '20px 0' }}>
                <div style={{ background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', width: '100%', maxWidth: '520px' }}>
                  
                  {/* Top header inside right card */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#7d3bec', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={18} />
                      </div>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Preview availability</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setMonthIdx(Math.max(0, monthIdx - 1))}
                        style={{ width: '32px', height: '32px', background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '8px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}
                      >&lt;</button>
                      <button
                        type="button"
                        onClick={() => setMonthIdx(Math.min(MONTHS.length - 1, monthIdx + 1))}
                        style={{ width: '32px', height: '32px', background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '8px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}
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
                          <button type="button" onClick={() => setMonthIdx(Math.max(0, monthIdx - 1))} style={{ width: '24px', height: '24px', border: '2px solid #F5F5F5', borderRadius: '4px', background: '#ffffff', color: '#64748b', cursor: 'pointer' }}>&lt;</button>
                          <button type="button" onClick={() => setMonthIdx(Math.min(MONTHS.length - 1, monthIdx + 1))} style={{ width: '24px', height: '24px', border: '2px solid #F5F5F5', borderRadius: '4px', background: '#ffffff', color: '#64748b', cursor: 'pointer' }}>&gt;</button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, marginBottom: '8px' }}>
                        <div style={{ color: '#7d3bec' }}>SUN</div>
                        <div style={{ color: '#64748b' }}>MON</div>
                        <div style={{ color: '#64748b' }}>TUE</div>
                        <div style={{ color: '#64748b' }}>WED</div>
                        <div style={{ color: '#64748b' }}>THU</div>
                        <div style={{ color: '#64748b' }}>FRI</div>
                        <div style={{ color: '#64748b' }}>SAT</div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.78rem', fontWeight: 500, color: '#0f172a' }}>
                        {Array.from({ length: getMonthStartOffset(monthIdx) }, (_, i) => (
                          <div key={`empty-${i}`} style={{ padding: '4px 0', opacity: 0 }}>-</div>
                        ))}
                        {Array.from({ length: DAYS_IN_MONTH[monthIdx] }, (_, i) => i + 1).map(d => {
                          const isSel = d === selectedDate && monthIdx === selectedMonthIdx;
                          const dayName = getDayName(d, monthIdx);
                          const isAvailable = schedule.find(s => s.day === dayName)?.active || false;
                          const isPast = isDateInPast(d, monthIdx);
                          return (
                            <div
                              key={d}
                              onClick={() => { if (!isPast) { setSelectedDate(d); setSelectedMonthIdx(monthIdx); } }}
                              style={{
                                width: '28px',
                                height: '28px',
                                margin: '0 auto',
                                borderRadius: '50%',
                                background: isSel && !isPast ? '#7d3bec' : 'transparent',
                                color: isSel && !isPast ? '#ffffff' : isPast ? '#cbd5e1' : '#0f172a',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: isSel && !isPast ? 700 : 500,
                                cursor: isPast ? 'not-allowed' : 'pointer',
                                opacity: isPast ? 0.4 : 1,
                                textDecoration: isPast ? 'line-through' : 'none',
                                position: 'relative'
                              }}
                            >
                              <span>{d}</span>
                              {isAvailable && !isPast && (
                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: isSel ? '#ffffff' : '#7d3bec', position: 'absolute', bottom: '2px' }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Pane: Selected Day Slots */}
                    <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '18px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                          {monthIdx === selectedMonthIdx
                            ? `${getDayName(selectedDate, monthIdx)}, ${MONTHS[monthIdx].split(' ')[0]} ${selectedDate}`
                            : `${MONTHS[monthIdx]}`}
                        </span>
                        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '6px', padding: '2px' }}>
                          <button
                            type="button"
                            onClick={() => setTimeFormat('12h')}
                            style={{ padding: '2px 6px', borderRadius: '4px', border: 'none', background: timeFormat === '12h' ? '#7d3bec' : 'transparent', color: timeFormat === '12h' ? '#ffffff' : '#64748b', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                          >12h</button>
                          <button
                            type="button"
                            onClick={() => setTimeFormat('24h')}
                            style={{ padding: '2px 6px', borderRadius: '4px', border: 'none', background: timeFormat === '24h' ? '#7d3bec' : 'transparent', color: timeFormat === '24h' ? '#ffffff' : '#64748b', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                          >24h</button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                        {(() => {
                          if (monthIdx !== selectedMonthIdx) {
                            return (
                              <div style={{ padding: '20px 10px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 500 }}>
                                Please select a date in {MONTHS[monthIdx]} to view available times.
                              </div>
                            );
                          }
                          if (isDateInPast(selectedDate, monthIdx)) {
                            return (
                              <div style={{ padding: '20px 10px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 500 }}>
                                This date is in the past. No times available.
                              </div>
                            );
                          }
                          const slots = generateRealTimeSlots(selectedDate, monthIdx, timeFormat, durMinutes);
                          if (slots.length === 0) {
                            return (
                              <div style={{ padding: '20px 10px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 500 }}>
                                No times available on {getDayName(selectedDate, monthIdx)}s.
                              </div>
                            );
                          }
                          return slots.map(slot => (
                            <div
                              key={slot}
                              onClick={() => triggerToast(`Selected preview slot ${slot}`)}
                              style={{
                                padding: '8px',
                                textAlign: 'center',
                                background: '#ffffff',
                                border: '2px solid #F5F5F5',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: '#7d3bec',
                                cursor: 'pointer',
                                flexShrink: 0
                              }}
                            >{slot}</div>
                          ));
                        })()}
                      </div>
                    </div>

                  </div>

                  {/* Soft Blue Available Hours Pill */}
                  <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <Clock size={18} color="#7d3bec" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontWeight: 600, color: '#1e40af', fontSize: '0.85rem', marginBottom: '2px' }}>Your available hours</div>
                      <div style={{ color: '#1e3a8a', fontSize: '0.82rem' }}>{getAvailabilitySummary()}</div>
                    </div>
                  </div>

                </div>

                {/* Times shown pill below card */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                  <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', color: '#7d3bec', padding: '8px 18px', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Globe size={15} /> Times shown in Asia/Kolkata (GMT +05:30) <ChevronDown size={14} />
                  </div>
                </div>
              </div>

            </div>
          ) : activeTab === 'form' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 1fr) auto', gap: '48px', height: '100%' }}>
              
              {/* LEFT COLUMN: SETUP */}
              <div onClick={e => e.stopPropagation()} style={{ overflowY: 'auto', height: '100%', padding: '32px 16px 32px 0' }}>
                <div style={{ background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '8px', overflow: 'hidden' }}>
                  


                  {/* Booking Questions Header */}
                  <div style={{ padding: '24px 24px 16px' }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Booking questions</h3>
                    <p style={{ margin: '0', fontSize: '0.88rem', color: '#64748b' }}>Customize the questions asked on the booking page. <a href="#" style={{color:'#7d3bec', textDecoration:'none'}}>Learn more</a></p>
                  </div>

                  {/* Questions List */}
                  <div>
                    {questions.map((q, idx) => (
                      <div key={q.id} style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{q.label}</span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 600, background: q.required ? '#f0fdf4' : '#f1f5f9', color: q.required ? '#16a34a' : '#475569', padding: '2px 6px', borderRadius: '4px' }}>{q.required ? 'Required' : q.active ? 'Optional' : 'Hidden'}</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{q.type}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <ToggleSwitch checked={q.active} onChange={() => toggleQuestionActive(idx)} />
                          <button type="button" onClick={() => handleEditQuestion(idx)} style={{ padding: '6px 12px', border: '2px solid #F5F5F5', borderRadius: '6px', background: '#ffffff', color: '#334155', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '16px 24px 24px' }}>
                    <button type="button" onClick={handleAddQuestion} style={{ padding: '8px 16px', borderRadius: '8px', background: 'transparent', border: '1px dashed #cbd5e1', color: '#7d3bec', fontSize: '0.88rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <Plus size={16} /> Add question
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: PREVIEW */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '32px 0' }}>
                <div style={{ background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '8px', display: 'flex', width: '100%', maxWidth: '820px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                  
                  {/* Preview Left: Details */}
                  <div style={{ width: '320px', borderRight: '2px solid #F5F5F5', padding: '32px 24px', background: '#ffffff' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#a855f7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>
                      {hostInitials}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>{hostName}</div>
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
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Your name *</label>
                      <input type="text" readOnly value={userName} style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '2px solid #F5F5F5', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }} />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Email address *</label>
                      <input type="text" readOnly value={userEmail} style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '2px solid #F5F5F5', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }} />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Additional notes</label>
                      <textarea readOnly value="Please share anything that will help prepare for our meeting." style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '2px solid #F5F5F5', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', minHeight: '80px', resize: 'none', outline: 'none' }} />
                    </div>

                    {questions.some(q => q.id === 'guests' && q.active) && (
                      <button type="button" onClick={() => triggerToast('Opening Add Guests input...')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '30px' }}>
                        <Plus size={15} color="#64748b" /> Add guests
                      </button>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', marginTop: 'auto' }}>
                      <button type="button" onClick={() => triggerToast('Navigating back...')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Back</button>
                      <button type="button" onClick={() => triggerToast('Preview: Confirm booking clicked!')} style={{ background: '#7d3bec', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem', fontWeight: 600, padding: '10px 24px', cursor: 'pointer' }}>Confirm</button>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '32px' }}>
                  <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', color: '#7d3bec', padding: '10px 24px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={16} /> Save changes to preview all updates
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'conf' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 1fr) auto', gap: '48px', height: '100%' }}>
              
              {/* LEFT COLUMN: SETUP */}
              <div onClick={e => e.stopPropagation()} style={{ overflowY: 'auto', height: '100%', padding: '32px 16px 32px 0' }}>
                <div style={{ background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '8px', overflow: 'hidden' }}>
                  
                  {/* Calendar event name */}
                  <div style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>Calendar event name</h3>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input 
                        type="text" 
                        readOnly 
                        value={calEventName}
                        style={{ flex: 1, padding: '10px 14px', borderRadius: '6px', border: '2px solid #F5F5F5', background: '#f8fafc', color: '#334155', fontSize: '0.9rem', outline: 'none' }}
                      />
                      <button type="button" onClick={handleEditCalEventName} style={{ padding: '0 16px', borderRadius: '6px', border: '2px solid #F5F5F5', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                    </div>
                  </div>
                  <div style={{ height: '1px', background: '#e2e8f0' }} />

                  {/* Redirect on booking */}
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>Redirect on booking</h3>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Redirect to a custom URL after a successful booking</p>
                      </div>
                      <ToggleSwitch checked={confRedirect} onChange={() => { setConfRedirect(!confRedirect); triggerToast(!confRedirect ? 'Enabled post-booking redirect' : 'Disabled redirect'); }} />
                    </div>
                    {confRedirect && (
                      <div style={{ marginTop: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Redirect URL</label>
                        <input type="url" placeholder="https://example.com/thank-you" value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '2px solid #F5F5F5', background: '#f8fafc', color: '#334155', fontSize: '0.9rem', outline: 'none' }} />
                      </div>
                    )}
                  </div>

                  {/* Custom 'Reply-To' email */}
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ paddingRight: '24px' }}>
                        <h3 style={{ margin: '0 0 8px', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>Custom 'Reply-To' email</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>Use a different email address as the replyTo for confirmation emails instead of the organizer's email</p>
                      </div>
                      <ToggleSwitch checked={customReplyTo} onChange={() => { setCustomReplyTo(!customReplyTo); triggerToast(!customReplyTo ? 'Enabled Custom Reply-To' : 'Disabled Custom Reply-To'); }} />
                    </div>
                    {customReplyTo && (
                      <div style={{ marginTop: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Reply-To Email</label>
                        <input type="email" placeholder="support@yourcompany.com" value={replyToEmail} onChange={(e) => setReplyToEmail(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '2px solid #F5F5F5', background: '#f8fafc', color: '#334155', fontSize: '0.9rem', outline: 'none' }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>


              {/* RIGHT COLUMN: PREVIEW */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '32px 0' }}>
                <div style={{ background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '8px', display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '560px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                  
                  {/* Top Confirmation Section */}
                  <div style={{ padding: '40px 32px 32px', textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eff6ff', color: '#7d3bec', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
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
                      <div style={{ flex: 1, fontSize: '0.9rem', color: '#334155' }}>{calEventName.replace('{Scheduler}', '{Guest Name}')}</div>
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
                      <button type="button" onClick={() => triggerToast('Downloading Google Calendar invite...')} style={{ width: '36px', height: '36px', borderRadius: '6px', border: '2px solid #F5F5F5', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <svg viewBox="0 0 256 256" width="20" height="20">
                          <path fill="#fff" d="M195.368 60.632H60.632v134.736h134.736z"/>
                          <path fill="#ea4335" d="M195.368 256L256 195.368l-30.316-5.172l-30.316 5.172l-5.533 27.73z"/>
                          <path fill="#188038" d="M0 195.368v40.421C0 246.956 9.044 256 20.21 256h40.422l6.225-30.316l-6.225-30.316l-33.033-5.172z"/>
                          <path fill="#1967d2" d="M256 60.632V20.21C256 9.044 246.956 0 235.79 0h-40.422q-5.532 22.554-5.533 33.196q0 10.641 5.533 27.436q20.115 5.76 30.316 5.76T256 60.631"/>
                          <path fill="#fbbc04" d="M256 60.632h-60.632v134.736H256z"/>
                          <path fill="#34a853" d="M195.368 195.368H60.632V256h134.736z"/>
                          <path fill="#4285f4" d="M195.368 0H20.211C9.044 0 0 9.044 0 20.21v175.158h60.632V60.632h134.736z"/>
                          <path fill="#4285f4" d="M88.27 165.154c-5.036-3.402-8.523-8.37-10.426-14.94l11.689-4.816q1.59 6.063 5.558 9.398c2.627 2.223 5.827 3.318 9.566 3.318q5.734 0 9.852-3.487c2.746-2.324 4.127-5.288 4.127-8.875q0-5.508-4.345-8.994c-2.897-2.324-6.535-3.486-10.88-3.486h-6.754v-11.57h6.063q5.608 0 9.448-3.033c2.56-2.02 3.84-4.783 3.84-8.303c0-3.132-1.145-5.625-3.435-7.494c-2.29-1.87-5.188-2.813-8.708-2.813c-3.436 0-6.164.91-8.185 2.745a16.1 16.1 0 0 0-4.413 6.754l-11.57-4.817c1.532-4.345 4.345-8.185 8.471-11.503s9.398-4.985 15.798-4.985c4.733 0 8.994.91 12.767 2.745c3.772 1.836 6.736 4.379 8.875 7.613c2.14 3.25 3.2 6.888 3.2 10.93c0 4.126-.993 7.613-2.98 10.476s-4.43 5.052-7.327 6.585v.69a22.25 22.25 0 0 1 9.398 7.327c2.442 3.284 3.672 7.208 3.672 11.79c0 4.58-1.163 8.673-3.487 12.26c-2.324 3.588-5.54 6.417-9.617 8.472c-4.092 2.055-8.69 3.1-13.793 3.1c-5.912.016-11.369-1.685-16.405-5.087m71.797-58.005l-12.833 9.28l-6.417-9.734l23.023-16.607h8.825v78.333h-12.598z"/>
                        </svg>
                      </button>
                      <button type="button" onClick={() => triggerToast('Downloading Outlook invite...')} style={{ width: '36px', height: '36px', borderRadius: '6px', border: '2px solid #F5F5F5', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <svg viewBox="0 0 32 32" width="20" height="20">
                          <path fill="#0072c6" d="M19.484 7.937v5.477l1.916 1.205a.5.5 0 0 0 .21 0l8.238-5.554a1.174 1.174 0 0 0-.959-1.128Z"/>
                          <path fill="#0072c6" d="m19.484 15.457l1.747 1.2a.52.52 0 0 0 .543 0c-.3.181 8.073-5.378 8.073-5.378v10.066a1.408 1.408 0 0 1-1.49 1.555h-8.874zm-9.044-2.525a1.61 1.61 0 0 0-1.42.838a4.13 4.13 0 0 0-.526 2.218A4.05 4.05 0 0 0 9.02 18.2a1.6 1.6 0 0 0 2.771.022a4 4 0 0 0 .515-2.2a4.37 4.37 0 0 0-.5-2.281a1.54 1.54 0 0 0-1.366-.809"/>
                          <path fill="#0072c6" d="M2.153 5.155v21.427L18.453 30V2Zm10.908 14.336a3.23 3.23 0 0 1-2.7 1.361a3.19 3.19 0 0 1-2.64-1.318A5.46 5.46 0 0 1 6.706 16.1a5.87 5.87 0 0 1 1.036-3.616a3.27 3.27 0 0 1 2.744-1.384a3.12 3.12 0 0 1 2.61 1.321a5.64 5.64 0 0 1 1 3.484a5.76 5.76 0 0 1-1.035 3.586"/>
                        </svg>
                      </button>
                      <button type="button" onClick={() => triggerToast('Downloading Office 365 invite...')} style={{ width: '36px', height: '36px', borderRadius: '6px', border: '2px solid #F5F5F5', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <svg viewBox="0 0 48 48" width="20" height="20">
                          <path fill="#d83b01" d="M22.25 5L8 10v28l14.25 5 17.75-6.5V11.5L22.25 5z"/>
                          <path fill="#f36d21" d="M22.25 5v38l17.75-6.5V11.5L22.25 5z"/>
                          <path fill="#ff8c00" d="M22.25 15.5L13.5 18v12l8.75 2.5 10.75-3.5V19L22.25 15.5z"/>
                          <path fill="#fff" d="M22.25 19.5c-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5-2.02-4.5-4.5-4.5zm0 6.8c-1.27 0-2.3-1.03-2.3-2.3s1.03-2.3 2.3-2.3 2.3 1.03 2.3 2.3-1.03 2.3-2.3 2.3z"/>
                        </svg>
                      </button>
                      <button type="button" onClick={() => triggerToast('Downloading Yahoo Calendar invite...')} style={{ width: '36px', height: '36px', borderRadius: '6px', border: '2px solid #F5F5F5', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <svg viewBox="0 0 512 143" width="30" height="9">
                          <path fill="#5f01d1" d="M0 34.607h30.475l17.69 45.324l17.95-45.324h29.7l-44.68 107.436H21.306l12.268-28.409zm126.676-1.808c-22.856 0-37.318 20.532-37.318 40.934c0 22.985 15.883 41.193 36.931 41.193c15.754 0 21.694-9.556 21.694-9.556v7.49h26.6V34.607h-26.6v7.102c-.13 0-6.715-8.91-21.307-8.91m5.682 25.18c10.589 0 16.012 8.394 16.012 15.883c0 8.135-5.81 16.142-16.012 16.142c-8.393 0-16.012-6.844-16.012-15.754c0-9.04 6.07-16.27 16.012-16.27m51.265 54.88V0h27.763v41.967s6.585-9.168 20.402-9.168c16.916 0 26.86 12.655 26.86 30.604v49.457h-27.635V70.118c0-6.07-2.84-12.01-9.426-12.01c-6.715 0-10.201 5.94-10.201 12.01v42.742zM306.038 32.8c-26.214 0-41.838 19.886-41.838 41.322c0 24.276 18.853 40.934 41.967 40.934c22.34 0 41.838-15.883 41.838-40.547c0-26.988-20.532-41.709-41.967-41.709m.258 25.31c9.297 0 15.625 7.747 15.625 15.882c0 6.973-5.94 15.625-15.625 15.625c-8.91 0-15.495-7.102-15.495-15.754c0-8.135 5.423-15.754 15.495-15.754m87.938-25.31c-26.214 0-41.839 19.886-41.839 41.322c0 24.276 18.853 40.934 41.968 40.934c22.34 0 41.838-15.883 41.838-40.547c0-26.988-20.403-41.709-41.967-41.709m.258 25.31c9.297 0 15.625 7.747 15.625 15.882c0 6.973-5.94 15.625-15.625 15.625c-8.91 0-15.496-7.102-15.496-15.754c0-8.135 5.553-15.754 15.496-15.754m63.66 19.498c10.202 0 18.466 8.264 18.466 18.466c0 10.2-8.264 18.465-18.465 18.465s-18.466-8.264-18.466-18.465s8.265-18.466 18.466-18.466m24.536-6.715H449.5L478.943 0H512z"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div style={{ height: '1px', background: '#e2e8f0' }} />

                  {/* Reschedule/Cancel */}
                  <div style={{ padding: '24px 32px', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
                    Need to make a change? <button type="button" onClick={() => triggerToast('Previewing Reschedule flow...')} style={{ background: 'none', border: 'none', color: '#7d3bec', textDecoration: 'none', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Reschedule</button> or <button type="button" onClick={() => triggerToast('Previewing Cancel flow...')} style={{ background: 'none', border: 'none', color: '#7d3bec', textDecoration: 'none', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'app' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 1fr) auto', gap: '48px', height: '100%' }}>
              
              {/* LEFT COLUMN: SETUP */}
              <div onClick={e => e.stopPropagation()} style={{ overflowY: 'auto', height: '100%', padding: '32px 16px 32px 0' }}>
                <div style={{ background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '8px', overflow: 'hidden' }}>
                  
                  {/* Layout */}
                  <div style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Layout</h3>
                    <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748b' }}>You can select multiple and your guests can switch views.</p>
                    
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                      {/* Month */}
                      <div onClick={() => toggleLayout('Month')} style={{ display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}>
                        <div style={{ width: '110px', height: '70px', border: allowedLayouts.includes('Month') ? '2px solid #7d3bec' : '2px solid #F5F5F5', borderRadius: '8px', background: allowedLayouts.includes('Month') ? '#f8fafc' : '#ffffff', padding: '8px', position: 'relative' }}>
                          <div style={{ width: '20px', height: '4px', background: '#7d3bec', borderRadius: '2px', marginBottom: '8px' }}></div>
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
                          <input type="checkbox" checked={allowedLayouts.includes('Month')} readOnly style={{ accentColor: '#7d3bec', cursor: 'pointer' }} /> Month {defaultLayout === 'Month' && <span style={{ color: '#64748b', fontWeight: 400 }}>(Default)</span>}
                        </label>
                      </div>

                      {/* Weekly */}
                      <div onClick={() => toggleLayout('Weekly')} style={{ display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}>
                        <div style={{ width: '110px', height: '70px', border: allowedLayouts.includes('Weekly') ? '2px solid #7d3bec' : '2px solid #F5F5F5', borderRadius: '8px', background: allowedLayouts.includes('Weekly') ? '#f8fafc' : '#ffffff', padding: '8px', display: 'flex', gap: '6px' }}>
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
                          <input type="checkbox" checked={allowedLayouts.includes('Weekly')} readOnly style={{ accentColor: '#7d3bec', cursor: 'pointer' }} /> Weekly {defaultLayout === 'Weekly' && <span style={{ color: '#64748b', fontWeight: 400 }}>(Default)</span>}
                        </label>
                      </div>

                      {/* Column */}
                      <div onClick={() => toggleLayout('Column')} style={{ display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}>
                        <div style={{ width: '110px', height: '70px', border: allowedLayouts.includes('Column') ? '2px solid #7d3bec' : '2px solid #F5F5F5', borderRadius: '8px', background: allowedLayouts.includes('Column') ? '#f8fafc' : '#ffffff', padding: '8px', display: 'flex', gap: '8px' }}>
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
                          <input type="checkbox" checked={allowedLayouts.includes('Column')} readOnly style={{ accentColor: '#7d3bec', cursor: 'pointer' }} /> Column {defaultLayout === 'Column' && <span style={{ color: '#64748b', fontWeight: 400 }}>(Default)</span>}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div style={{ height: '1px', background: '#e2e8f0' }} />

                  {/* Default view */}
                  <div style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Default view</h3>
                    
                    <div style={{ display: 'inline-flex', background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '8px', padding: '4px', marginBottom: '16px' }}>
                      {allowedLayouts.includes('Month') && <button type="button" onClick={() => { setDefaultLayout('Month'); triggerToast('Set default view to Month'); }} style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: defaultLayout === 'Month' ? '#eff6ff' : 'transparent', color: defaultLayout === 'Month' ? '#7d3bec' : '#64748b', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Month</button>}
                      {allowedLayouts.includes('Weekly') && <button type="button" onClick={() => { setDefaultLayout('Weekly'); triggerToast('Set default view to Weekly'); }} style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: defaultLayout === 'Weekly' ? '#eff6ff' : 'transparent', color: defaultLayout === 'Weekly' ? '#7d3bec' : '#64748b', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Weekly</button>}
                      {allowedLayouts.includes('Column') && <button type="button" onClick={() => { setDefaultLayout('Column'); triggerToast('Set default view to Column'); }} style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: defaultLayout === 'Column' ? '#eff6ff' : 'transparent', color: defaultLayout === 'Column' ? '#7d3bec' : '#64748b', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Column</button>}
                    </div>

                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                      You can manage this for all your event types in Settings -&gt; Appearance or <button type="button" onClick={() => triggerToast('Opening Override rules modal...')} style={{ background: 'none', border: 'none', color:'#7d3bec', textDecoration:'none', fontWeight: 500, cursor: 'pointer', padding: 0 }}>Override</button> for this event only.
                    </p>
                  </div>

                  <div style={{ height: '1px', background: '#e2e8f0' }} />

                  {/* Event type color */}
                  <div style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ paddingRight: '24px' }}>
                      <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Event type color</h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>This is only used for event type & booking differentiation within the app. It is not displayed to bookers.</p>
                    </div>
                    <input type="color" value={eventColor} onChange={e => { setEventColor(e.target.value); triggerToast(`Updated event accent color`); }} style={{ cursor: 'pointer', border: 'none', background: 'none', width: '36px', height: '36px', padding: 0 }} />
                  </div>

                  <div style={{ height: '1px', background: '#e2e8f0' }} />

                  {/* Auto translate title and description */}
                  <div style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ paddingRight: '24px' }}>
                      <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Auto translate title and description</h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>Automatically translate titles and descriptions to the visitor's browser language using AI.</p>
                    </div>
                    <ToggleSwitch checked={autoTranslate} onChange={() => { setAutoTranslate(!autoTranslate); triggerToast(!autoTranslate ? 'Enabled AI Auto-translate' : 'Disabled Auto-translate'); }} />
                  </div>

                  <div style={{ height: '1px', background: '#e2e8f0' }} />

                  {/* Interface language */}
                  <div style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ paddingRight: '24px' }}>
                      <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Interface language</h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>Set your preferred language for the booking interface</p>
                    </div>
                    <select value={interfaceLang} onChange={e => { setInterfaceLang(e.target.value); triggerToast(`Set interface language to ${e.target.value}`); }} style={{ padding: '8px 12px', borderRadius: '8px', border: '2px solid #F5F5F5', outline: 'none', fontSize: '0.9rem', color: '#0f172a', fontWeight: 500, minWidth: '120px', cursor: 'pointer' }}>
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
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>To lock the timezone on booking page, useful for in-person events. <a href="#" style={{color:'#7d3bec', textDecoration:'none', fontWeight: 500}}>Learn more</a></p>
                    </div>
                    <ToggleSwitch checked={lockTimezone} onChange={() => { setLockTimezone(!lockTimezone); triggerToast(!lockTimezone ? 'Locked timezone on booking page' : 'Unlocked timezone'); }} />
                  </div>

                </div>
              </div>

              {/* RIGHT COLUMN: PREVIEW */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '32px 0' }}>
                <div style={{ background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '8px', display: 'flex', width: '100%', maxWidth: '820px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                  
                  {/* Preview Left: Details */}
                  <div style={{ width: '320px', borderRight: '2px solid #F5F5F5', padding: '32px 24px', background: '#ffffff' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#7d3bec', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>
                      {hostInitials}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>{hostName}</div>
                    <h2 style={{ margin: '0 0 24px', fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
                      {defaultLayout === 'Month' ? (form.title || '15 min meeting') : `${form.title || '15 min meeting'} (${defaultLayout} View)`}
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
                      <input type="text" readOnly value={hostName} style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '2px solid #F5F5F5', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }} />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                        {interfaceLang === 'French' ? 'Adresse e-mail *' : interfaceLang === 'Spanish' ? 'Correo electrónico *' : interfaceLang === 'German' ? 'E-Mail-Adresse *' : 'Email address *'}
                      </label>
                      <input type="text" readOnly value="guest@example.com" style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '2px solid #F5F5F5', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }} />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Additional notes</label>
                      <textarea readOnly value="Please share anything that will help prepare for our meeting." style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '2px solid #F5F5F5', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', minHeight: '80px', resize: 'none', outline: 'none' }} />
                    </div>

                    <button type="button" onClick={() => triggerToast('Opening Add Guests input...')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '40px' }}>
                      <Plus size={15} color="#64748b" /> Add guests
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', marginTop: 'auto' }}>
                      <button type="button" onClick={() => triggerToast('Navigating back...')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Back</button>
                      <button type="button" onClick={() => triggerToast('Preview: Confirm booking clicked!')} style={{ background: '#7d3bec', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem', fontWeight: 600, padding: '10px 24px', cursor: 'pointer' }}>Confirm</button>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '32px' }}>
                  <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', color: '#7d3bec', padding: '10px 24px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
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
                      <select value={bufferBefore} onChange={e => { setBufferBefore(e.target.value); triggerToast(`Set buffer before event to ${e.target.value}`); }} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '2px solid #F5F5F5', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                        <option>No buffer time</option>
                        <option>5 minutes</option>
                        <option>10 minutes</option>
                        <option>15 minutes</option>
                        <option>30 minutes</option>
                        <option>1 hour</option>
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
                      <select value={bufferAfter} onChange={e => { setBufferAfter(e.target.value); triggerToast(`Set buffer after event to ${e.target.value}`); }} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '2px solid #F5F5F5', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                        <option>No buffer time</option>
                        <option>5 minutes</option>
                        <option>10 minutes</option>
                        <option>15 minutes</option>
                        <option>30 minutes</option>
                        <option>1 hour</option>
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
                        <select value={minNoticeVal} onChange={e => { setMinNoticeVal(e.target.value); triggerToast(`Set minimum notice to ${e.target.value} ${minNoticeUnit}`); }} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '2px solid #F5F5F5', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                          <option>1</option>
                          <option>2</option>
                          <option>4</option>
                          <option>12</option>
                          <option>24</option>
                          <option>48</option>
                        </select>
                        <ChevronDown size={16} color="#64748b" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      </div>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <select value={minNoticeUnit} onChange={e => { setMinNoticeUnit(e.target.value); triggerToast(`Set minimum notice unit to ${e.target.value}`); }} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '2px solid #F5F5F5', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                          <option>Hours</option>
                          <option>Days</option>
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
                      <select value={timeInterval} onChange={e => { setTimeInterval(e.target.value); triggerToast(`Set time-slot interval to ${e.target.value}`); }} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '2px solid #F5F5F5', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                        <option>Use event length (default)</option>
                        <option>15 mins</option>
                        <option>30 mins</option>
                        <option>45 mins</option>
                        <option>60 mins</option>
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
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>Limit how many times this event can be booked. <a href="#" style={{color:'#7d3bec', textDecoration:'none', fontWeight: 500}}>Learn more</a></p>
                      </div>
                      <ToggleSwitch checked={limitFreq} onChange={() => { setLimitFreq(!limitFreq); triggerToast(!limitFreq ? 'Enabled booking frequency limit' : 'Disabled frequency limit'); }} />
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
                      <ToggleSwitch checked={limitDuration} onChange={() => { setLimitDuration(!limitDuration); triggerToast(!limitDuration ? 'Enabled duration limit' : 'Disabled duration limit'); }} />
                    </div>
                    <div style={{ height: '1px', background: '#f1f5f9', marginTop: '24px' }} />
                  </div>

                  {/* Limit future bookings */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ paddingRight: '24px' }}>
                        <h3 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Limit future bookings</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>Limit how far in the future this event can be booked. <a href="#" style={{color:'#7d3bec', textDecoration:'none', fontWeight: 500}}>Learn more</a></p>
                      </div>
                      <ToggleSwitch checked={limitFuture} onChange={() => { setLimitFuture(!limitFuture); triggerToast(!limitFuture ? 'Enabled future booking limit' : 'Disabled future limit'); }} />
                    </div>
                    <div style={{ height: '1px', background: '#f1f5f9', marginTop: '24px' }} />
                  </div>

                  {/* Limit number of upcoming bookings per booker */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ paddingRight: '24px' }}>
                        <h3 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Limit number of upcoming bookings per booker</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>Limit the number of active bookings a booker can make for this event type. <a href="#" style={{color:'#7d3bec', textDecoration:'none', fontWeight: 500}}>Learn more</a></p>
                      </div>
                      <ToggleSwitch checked={limitBooker} onChange={() => { setLimitBooker(!limitBooker); triggerToast(!limitBooker ? 'Enabled per-booker limit' : 'Disabled per-booker limit'); }} />
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
                      <ToggleSwitch checked={showOnlyFirstSlot} onChange={() => { setShowOnlyFirstSlot(!showOnlyFirstSlot); triggerToast(!showOnlyFirstSlot ? 'Showing only first slot per day' : 'Showing all available slots'); }} />
                    </div>
                  </div>

                </div>
              </div>

              {/* RIGHT COLUMN: PREVIEW */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '32px 0' }}>
                <div style={{ background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '12px', display: 'flex', width: '100%', maxWidth: '860px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                  
                  {/* Calendar View Left */}
                  <div style={{ flex: 1, padding: '32px', borderRight: '2px solid #F5F5F5' }}>
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
                      <div /> <div /> <div />
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>1</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>2</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>3</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>4</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>5</div>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem', color: '#ffffff', fontWeight: 700, background: '#7d3bec', borderRadius: '8px', cursor: 'pointer' }}>6</div>
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
                      <div style={{ display: 'flex', background: '#f8fafc', borderRadius: '8px', border: '2px solid #F5F5F5', overflow: 'hidden' }}>
                        <button type="button" onClick={() => triggerToast('Switched slot view to 12h format')} style={{ padding: '4px 12px', background: '#eff6ff', color: '#0f172a', border: 'none', borderRight: '2px solid #F5F5F5', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>12h</button>
                        <button type="button" onClick={() => triggerToast('Switched slot view to 24h format')} style={{ padding: '4px 12px', background: 'transparent', color: '#64748b', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>24h</button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '360px', overflowY: 'auto', paddingRight: '8px' }}>
                      {(showOnlyFirstSlot 
                        ? ['9:00am'] 
                        : ['9:00am', '9:15am', '9:30am', '9:45am', '10:00am', '10:15am', '10:30am', '10:45am', '11:00am', '11:15am']
                      ).map(time => (
                        <button key={time} type="button" onClick={() => triggerToast(`Selected slot ${time}`)} style={{ padding: '12px', background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '8px', color: '#0f172a', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}>
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                <div style={{ marginTop: '32px' }}>
                  <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', color: '#7d3bec', padding: '10px 24px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={16} /> Save changes to preview all updates
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'pay' ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '32px' }}>
              <div style={{ textAlign: 'center', color: '#64748b' }}>
                <CreditCard size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Coming Soon</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', maxWidth: '300px' }}>Payments and advanced seating limits are currently under development.</p>
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
                    <select value={cancelReasonReq} onChange={e => { setCancelReasonReq(e.target.value); triggerToast(`Set cancellation reason: ${e.target.value}`); }} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '2px solid #F5F5F5', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                      <option>Mandatory for host only</option>
                      <option>Mandatory for all</option>
                      <option>Optional</option>
                      <option>Disabled</option>
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
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>Disable event cancellation via calendar invite or email. <a href="#" style={{color:'#7d3bec', textDecoration:'none', fontWeight: 500}}>Learn more</a></p>
                      </div>
                      <ToggleSwitch checked={disableCancelling} onChange={() => { setDisableCancelling(!disableCancelling); triggerToast(!disableCancelling ? 'Disabled event cancellation' : 'Enabled event cancellation'); }} />
                    </div>
                    <div style={{ height: '1px', background: '#f1f5f9', marginTop: '24px' }} />
                  </div>

                  {/* Disable rescheduling */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ paddingRight: '24px' }}>
                        <h3 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Disable rescheduling</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>Disable rescheduling via calendar invite or email. <a href="#" style={{color:'#7d3bec', textDecoration:'none', fontWeight: 500}}>Learn more</a></p>
                      </div>
                      <ToggleSwitch checked={disableRescheduling} onChange={() => { setDisableRescheduling(!disableRescheduling); triggerToast(!disableRescheduling ? 'Disabled event rescheduling' : 'Enabled event rescheduling'); }} />
                    </div>
                    <div style={{ height: '1px', background: '#f1f5f9', marginTop: '24px' }} />
                  </div>

                  {/* Allow rescheduling past events */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ paddingRight: '24px' }}>
                        <h3 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Allow rescheduling past events</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>Enabling this option allows for past events to be rescheduled. <a href="#" style={{color:'#7d3bec', textDecoration:'none', fontWeight: 500}}>Learn more</a></p>
                      </div>
                      <ToggleSwitch checked={allowPastReschedule} onChange={() => { setAllowPastReschedule(!allowPastReschedule); triggerToast(!allowPastReschedule ? 'Allowed rescheduling past events' : 'Disabled past event rescheduling'); }} />
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
                      <ToggleSwitch checked={allowRescheduleBooking} onChange={() => { setAllowRescheduleBooking(!allowRescheduleBooking); triggerToast(!allowRescheduleBooking ? 'Allowed new booking via reschedule link' : 'Disabled new booking via reschedule link'); }} />
                    </div>
                  </div>

                </div>
              </div>

              {/* RIGHT COLUMN: PREVIEW */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '32px 0' }}>
                <div style={{ background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '8px', display: 'flex', width: '100%', maxWidth: '820px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                  
                  {/* Preview Left: Details */}
                  <div style={{ width: '320px', borderRight: '2px solid #F5F5F5', padding: '32px 24px', background: '#ffffff' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#7d3bec', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>
                      {hostInitials}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>{hostName}</div>
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
                      <input type="text" readOnly value={userName} style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '2px solid #F5F5F5', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }} />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Email address *</label>
                      <input type="text" readOnly value={userEmail} style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '2px solid #F5F5F5', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }} />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Additional notes</label>
                      <textarea readOnly value="Please share anything that will help prepare for our meeting." style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '2px solid #F5F5F5', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', minHeight: '80px', resize: 'none', outline: 'none' }} />
                    </div>

                    <button type="button" onClick={() => triggerToast('Opening Add Guests input...')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '40px' }}>
                      <Plus size={15} color="#64748b" /> Add guests
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', marginTop: 'auto' }}>
                      <button type="button" onClick={() => triggerToast('Navigating back...')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Back</button>
                      <button type="button" onClick={() => triggerToast('Preview: Confirm booking clicked!')} style={{ background: '#7d3bec', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem', fontWeight: 600, padding: '10px 24px', cursor: 'pointer' }}>Confirm</button>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '32px' }}>
                  <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', color: '#7d3bec', padding: '10px 24px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={16} /> Save changes to preview all updates
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'workflows' ? (
            <div style={{ maxWidth: '800px', padding: '32px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Workflows & Automations</h2>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>Automate notifications, reminders, and follow-ups before and after meetings.</p>
                </div>
                <button type="button" onClick={handleAddWorkflow} style={{ background: '#7d3bec', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <Plus size={16} /> Add Workflow
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {workflows.map(wf => (
                  <div key={wf.id} style={{ background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '12px', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: wf.active ? '#eff6ff' : '#f1f5f9', color: wf.active ? '#7d3bec' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={20} />
                      </div>
                      <div>
                        <h3 style={{ margin: '0 0 4px', fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>{wf.title}</h3>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{wf.active ? 'Trigger active' : 'Paused'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <ToggleSwitch checked={wf.active} onChange={() => toggleWorkflow(wf.id, wf.title)} />
                      <button type="button" onClick={() => triggerToast(`Configuring workflow: "${wf.title}"`)} style={{ padding: '6px 14px', border: '2px solid #F5F5F5', borderRadius: '6px', background: '#ffffff', color: '#334155', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: '800px' }}>
              <div style={{ background: '#ffffff', border: '2px solid #F5F5F5', borderRadius: '12px', padding: '32px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>{activeTab} Settings</h3>
                <p style={{ margin: '0', fontSize: '0.9rem', color: '#64748b' }}>Configure {activeTab} rules and options for this meeting type.</p>
              </div>
            </div>
          )}

          {/* Floating Blue Chat Bubble Widget in bottom right */}
          <div style={{ position: 'fixed', bottom: '24px', right: '24px', width: '48px', height: '48px', borderRadius: '50%', background: '#7d3bec', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(14, 97, 243, 0.35)', cursor: 'pointer', zIndex: 100 }}>
            <MessageSquare size={22} />
          </div>

        </div>
      </div>
    </div>
  );
}
