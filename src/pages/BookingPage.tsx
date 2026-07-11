import React, { useState, useEffect, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../lib/config';
import { Calendar as CalendarIcon, Video, Loader2, Clock, Globe, UserPlus, Check, ExternalLink } from 'lucide-react';
import { type EventType } from '../lib/crm';
import '../pages/CrmDashboard.css';

// Unique Google-Meet-style code generator for mock
// function genMeetCode() {
//   const a = 'abcdefghijklmnopqrstuvwxyz';
//   const pick = (n: number) => Array.from({ length: n }, () => a[Math.floor(Math.random() * a.length)]).join('');
//   return `${pick(3)}-${pick(4)}-${pick(3)}`;
// }

// const TIMES = ['09:00am', '09:30am', '10:00am', '10:30am', '11:00am', '01:00pm', '01:30pm', '02:00pm', '02:30pm', '03:00pm'];


const calcEndTime = (start: string, duration: string) => {
  const isPM = start.toLowerCase().includes('pm');
  let [hStr, mStr] = start.replace(/am|pm/i, '').split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isPM && h !== 12) h += 12;
  if (!isPM && h === 12) h = 0;
  
  const addM = parseInt(duration.replace('m', ''), 10) || 30;
  const date = new Date();
  date.setHours(h, m + addM, 0, 0);
  
  let newH = date.getHours();
  const newM = date.getMinutes();
  const newPM = newH >= 12;
  if (newH > 12) newH -= 12;
  if (newH === 0) newH = 12;
  
  return `${newH}:${newM.toString().padStart(2, '0')}${newPM ? 'pm' : 'am'}`;
};

export default function BookingPage() {
  const { uid, slug } = useParams<{ uid: string; slug: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hostName, setHostName] = useState('');
  const [eventType, setEventType] = useState<EventType | null>(null);
  
  const [step, setStep] = useState<1 | 2>(1);
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<number>(now.getDate());
  const [selectedDayTab, setSelectedDayTab] = useState<number>(now.getDate());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');
  const [currentLayout, setCurrentLayout] = useState<'Month' | 'Weekly' | 'Column'>('Month');
  const [bookings, setBookings] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'booking' | 'success'>('idle');
  const [isEmbedded, setIsEmbedded] = useState(false);
  // const [ownerHasGoogle, setOwnerHasGoogle] = useState(false);
  const [meetLink, setMeetLink] = useState('');

  const searchParams = new URLSearchParams(window.location.search);
  const paramBg = searchParams.get('bg');
  const paramText = searchParams.get('text');
  const paramPrimary = searchParams.get('primary');

  const customStyles = {
    '--w-bg': paramBg || (isEmbedded ? 'transparent' : '#fafafb'),
    '--w-card-bg': paramBg || (isEmbedded ? 'transparent' : '#ffffff'),
    '--w-text': paramText || '#1a1a1a',
    '--w-text-muted': paramText ? `${paramText}cc` : '#666a73',
    '--w-primary': paramPrimary || '#006bff',
    '--w-primary-light': paramPrimary ? (paramPrimary.startsWith('rgb') ? paramPrimary : `${paramPrimary}1a`) : '#f0f4ff',
  } as React.CSSProperties;

  useEffect(() => {
    try {
      const embedded = window.self !== window.top;
      setIsEmbedded(embedded);
      if (embedded) {
        document.body.style.backgroundColor = 'transparent';
        document.documentElement.style.backgroundColor = 'transparent';
      }
    } catch (e) {
      setIsEmbedded(true);
      document.body.style.backgroundColor = 'transparent';
      document.documentElement.style.backgroundColor = 'transparent';
    }
    async function loadEvent() {
      const targetSlug = slug || '15min';
      let fetchedHostName = 'LinksMeet Host';

      if (uid) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/public-profile/${uid}`);
          if (res.ok) {
            const uData = await res.json();
            fetchedHostName = uData.firstName || uData.name || 'LinksMeet Host';
          }
        } catch (e) {
          console.warn("Public profile lookup failed, using fallback host name.");
        }
      }

      setHostName(fetchedHostName);

      if (uid && slug) {
        try {
          const { data: etData } = await supabase.from('event_types')
            .select('*')
            .eq('user_id', uid)
            .eq('slug', slug)
            .limit(1)
            .maybeSingle();

          if (etData) {
            if (!etData.active) return setError('This event type is currently paused.');
            
            const allowed = etData.allowed_layouts ? (typeof etData.allowed_layouts === 'string' ? etData.allowed_layouts.split(',') : etData.allowed_layouts) : ['Month'];
            const defLayout = etData.default_layout || 'Month';
            
            setEventType({ 
              ...etData, 
              desc: etData.description || etData.desc,
              allowedLayouts: allowed,
              defaultLayout: defLayout,
              formSettings: etData.form_settings
            });
            setCurrentLayout(defLayout as any);
            
            // Fetch bookings
            // We fall back to fetching 'slot' if start_time is missing since bookings table didn't have start_time originally
            const { data: bData } = await supabase.from('bookings')
              .select('slot')
              .eq('user_id', uid);
            if (bData) setBookings(bData);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("Supabase event lookup error:", err);
        }
      }

      // Fallback for live preview or unsaved local draft
      const formattedTitle = targetSlug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

      setEventType({
        id: 'preview-id',
        title: formattedTitle.includes('Min') ? formattedTitle : `${formattedTitle} Meeting`,
        slug: targetSlug,
        dur: targetSlug.includes('30') ? '30 Minutes' : targetSlug.includes('45') ? '45 Minutes' : targetSlug.includes('60') ? '60 Minutes' : '15 Minutes',
        desc: 'Schedule a direct video conference session with our team.',
        active: true
      } as any);

      // Try to get logged in user to pre-fill guest details
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '');
        setEmail(session.user.email || '');
      }

      setLoading(false);
    }
    loadEvent();

    const sendHeight = () => {
      // Send the actual widget page height to allow shrinking as well
      const widgetPage = document.querySelector('.bk-widget-page');
      const height = widgetPage ? widgetPage.scrollHeight : document.body.scrollHeight;
      window.parent.postMessage({ type: 'linksmeet-resize', height }, '*');
    };

    // Delay initially to ensure rendering is complete
    setTimeout(sendHeight, 100);
    window.addEventListener('resize', sendHeight);
    
    const observer = new MutationObserver(sendHeight);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    return () => {
      window.removeEventListener('resize', sendHeight);
      observer.disconnect();
    };
  }, [uid, slug]);

  const handleBook = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !eventType || !uid || !selectedDate || !selectedTime) return;
    setBookingStatus('booking');
    try {
      // Create a proper start/end time for the backend
      // selectedDate is a number (e.g., 25), selectedTime is a string (e.g., "09:00am")
      const timePart = selectedTime.substring(0, 5);
      const ampm = selectedTime.substring(5).toLowerCase();
      let [hStr, mStr] = timePart.split(':');
      let hr = parseInt(hStr, 10);
      const min = parseInt(mStr, 10);
      
      if (ampm === 'pm' && hr !== 12) hr += 12;
      if (ampm === 'am' && hr === 12) hr = 0;
      
      // Date constructor: new Date(year, monthIndex (0-11), day, hours, minutes)
      const d = new Date(currentYear, currentMonth, parseInt(selectedDate.toString(), 10), hr, min);
      const startTime = d.toISOString();
      
      // add duration
      const durMinutes = parseInt(eventType.dur) || 30;
      const endTime = new Date(d.getTime() + durMinutes * 60000).toISOString();

      let meetLink = '';
      try {
        const res = await fetch(`${API_BASE_URL}/api/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ownerUid: uid,
            bookerName: name,
            bookerEmail: email,
            bookerPhone: phone,
            bookerNotes: notes,
            startTime,
            endTime,
            eventTitle: eventType.title,
            eventTypeSlug: slug,
            replyToEmail: eventType.replyToEmail
          })
        });

        if (!res.ok) {
          throw new Error('Backend failed to book');
        }
        const data = await res.json();
        meetLink = data.booking?.meet_link || '';
      } catch (backendErr) {
        console.warn("Backend unavailable, using direct Supabase fallback.", backendErr);
        
        // Format slot string
        const startDate = new Date(startTime);
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const formattedDate = `${months[startDate.getMonth()]} ${startDate.getDate()}, ${startDate.getFullYear()}`;
        const formattedTime = startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const slotStr = `${formattedDate} · ${formattedTime}`;

        // 1. Insert Booking directly
        const { error: insertError } = await supabase.from('bookings').insert({
          user_id: uid,
          event_slug: slug,
          event_title: eventType.title,
          booker_name: name,
          booker_email: email,
          slot: slotStr,
          status: 'upcoming'
        });
        
        if (insertError) throw insertError;
        
        // 2. Auto-create Contact directly
        const { error: contactError } = await supabase.from('contacts').insert({
          user_id: uid,
          name: name,
          email: email,
          phone: phone,
          company: notes || '',
          source: `Booking: ${eventType.title}`,
          status: 'New'
        });
        if (contactError) console.error("Fallback contact insert failed:", contactError);
      }
      
      if (eventType.redirectUrl) {
        window.location.href = eventType.redirectUrl;
        return;
      }

      setMeetLink(meetLink);
      setBookingStatus('success');
    } catch (err) {
      console.error(err);
      alert('Failed to complete booking. Please try again.');
      setBookingStatus('idle');
    }
  };

  
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const currentMonthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });

  const generateTimeSlotsForDate = (targetDate: Date) => {
    const slots = [];
    const durMinutes = parseInt(eventType?.dur || '30');
    let startHr = 9;
    let endHr = 17;
    
    const now = new Date();
    const isToday = targetDate.getFullYear() === now.getFullYear() && targetDate.getMonth() === now.getMonth() && targetDate.getDate() === now.getDate();
    
    let currentMin = 0;
    let hr = startHr;
    
    while (hr < endHr) {
      const slotStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), hr, currentMin);
      const slotEnd = new Date(slotStart.getTime() + durMinutes * 60000);
      
      if (!(isToday && slotStart < now)) {
        const hasConflict = bookings.some(b => {
          const bStart = new Date(b.start_time);
          const bEnd = new Date(b.end_time);
          return (slotStart < bEnd && slotEnd > bStart);
        });
        
        if (!hasConflict) {
          const ampm = hr >= 12 ? 'pm' : 'am';
          const h = hr % 12 || 12;
          const m = currentMin === 0 ? '00' : currentMin.toString().padStart(2, '0');
          const time12 = `${h}:${m}${ampm}`;
          const time24 = `${hr.toString().padStart(2, '0')}:${m}`;
          slots.push({ time12, time24, sortKey: slotStart.getTime() });
        }
      }
      
      currentMin += durMinutes;
      if (currentMin >= 60) {
        hr += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
      }
    }
    return slots;
  };

  const availableSlots = generateTimeSlotsForDate(new Date(currentYear, currentMonth, selectedDate));
  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}><Loader2 size={24} className="crm-spin-ic" /></div>;
  if (error) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>{error}</div>;

  if (bookingStatus === 'success') {
    return (
      <div className={`bk-widget-page ${isEmbedded ? 'is-embedded' : ''}`} style={customStyles}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '48px 40px', maxWidth: '680px', margin: '40px auto', boxShadow: '0 12px 36px rgba(0,0,0,0.04)' }}>
          
          {/* Header Checkmark & Titles */}
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Check size={28} strokeWidth={2.5} />
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: '0 0 12px', textAlign: 'center', letterSpacing: '-0.02em' }}>
            This meeting is scheduled
          </h1>

          <p style={{ fontSize: '0.95rem', color: '#64748b', textAlign: 'center', maxWidth: '460px', margin: '0 auto 32px', lineHeight: 1.5 }}>
            We sent an email with a calendar invitation with the details to everyone.
          </p>

          {/* Inner Details Box */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px', background: '#ffffff', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '24px', fontSize: '0.95rem', alignItems: 'start' }}>
              
              <div style={{ fontWeight: 700, color: '#0f172a' }}>What</div>
              <div style={{ color: '#0f172a' }}>{eventType?.dur || '15m'} meeting between {hostName} and {name || hostName}</div>

              <div style={{ fontWeight: 700, color: '#0f172a' }}>When</div>
              <div>
                <div style={{ color: '#0f172a', fontWeight: 500 }}>
                  {new Date(currentYear, currentMonth, selectedDate).toLocaleString('default', { weekday: 'long' })}, {currentMonthName} {selectedDate}, {currentYear}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '2px' }}>
                  {selectedTime || '9:00 AM'} - {calcEndTime(selectedTime || '9:00am', eventType?.dur || '15m')} (India Standard Time)
                </div>
              </div>

              <div style={{ fontWeight: 700, color: '#0f172a' }}>Who</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500, color: '#0f172a' }}>{hostName}</span>
                  <span style={{ background: '#eff6ff', color: '#7d3bec', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, marginLeft: '8px' }}>Host</span>
                </div>
                <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '2px' }}>lead@example.com</div>

                <div style={{ marginTop: '14px', fontWeight: 500, color: '#0f172a' }}>{name || 'Guest'}</div>
                <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '2px' }}>{email || 'guest@example.com'}</div>
              </div>

              <div style={{ fontWeight: 700, color: '#0f172a' }}>Where</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Video size={16} color="#64748b" />
                <span style={{ color: '#0f172a', fontWeight: 500 }}>{eventType?.location || 'Google Meet'}</span>
                <ExternalLink
                  size={16}
                  color="#7d3bec"
                  style={{ marginLeft: '8px', cursor: 'pointer' }}
                  onClick={() => { if (meetLink) window.open(meetLink, '_blank'); }}
                />
              </div>

            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', margin: '28px 0 24px' }} />

            {/* Add to calendar row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>Add to calendar</span>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" title="Google Calendar" style={{ width: '42px', height: '42px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                  <svg viewBox="0 0 256 256" width="24" height="24">
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
                
                <button type="button" title="Outlook" style={{ width: '42px', height: '42px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                  <svg viewBox="0 0 32 32" width="24" height="24">
                    <path fill="#0072c6" d="M19.484 7.937v5.477l1.916 1.205a.5.5 0 0 0 .21 0l8.238-5.554a1.174 1.174 0 0 0-.959-1.128Z"/>
                    <path fill="#0072c6" d="m19.484 15.457l1.747 1.2a.52.52 0 0 0 .543 0c-.3.181 8.073-5.378 8.073-5.378v10.066a1.408 1.408 0 0 1-1.49 1.555h-8.874zm-9.044-2.525a1.61 1.61 0 0 0-1.42.838a4.13 4.13 0 0 0-.526 2.218A4.05 4.05 0 0 0 9.02 18.2a1.6 1.6 0 0 0 2.771.022a4 4 0 0 0 .515-2.2a4.37 4.37 0 0 0-.5-2.281a1.54 1.54 0 0 0-1.366-.809"/>
                    <path fill="#0072c6" d="M2.153 5.155v21.427L18.453 30V2Zm10.908 14.336a3.23 3.23 0 0 1-2.7 1.361a3.19 3.19 0 0 1-2.64-1.318A5.46 5.46 0 0 1 6.706 16.1a5.87 5.87 0 0 1 1.036-3.616a3.27 3.27 0 0 1 2.744-1.384a3.12 3.12 0 0 1 2.61 1.321a5.64 5.64 0 0 1 1 3.484a5.76 5.76 0 0 1-1.035 3.586"/>
                  </svg>
                </button>
                
                <button type="button" title="Office 365" style={{ width: '42px', height: '42px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                  <svg viewBox="0 0 48 48" width="24" height="24">
                    <path fill="#d83b01" d="M22.25 5L8 10v28l14.25 5 17.75-6.5V11.5L22.25 5z"/>
                    <path fill="#f36d21" d="M22.25 5v38l17.75-6.5V11.5L22.25 5z"/>
                    <path fill="#ff8c00" d="M22.25 15.5L13.5 18v12l8.75 2.5 10.75-3.5V19L22.25 15.5z"/>
                    <path fill="#fff" d="M22.25 19.5c-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5-2.02-4.5-4.5-4.5zm0 6.8c-1.27 0-2.3-1.03-2.3-2.3s1.03-2.3 2.3-2.3 2.3 1.03 2.3 2.3-1.03 2.3-2.3 2.3z"/>
                  </svg>
                </button>
                
                <button type="button" title="Yahoo Calendar" style={{ width: '42px', height: '42px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                  <svg viewBox="0 0 512 143" width="34" height="10">
                    <path fill="#5f01d1" d="M0 34.607h30.475l17.69 45.324l17.95-45.324h29.7l-44.68 107.436H21.306l12.268-28.409zm126.676-1.808c-22.856 0-37.318 20.532-37.318 40.934c0 22.985 15.883 41.193 36.931 41.193c15.754 0 21.694-9.556 21.694-9.556v7.49h26.6V34.607h-26.6v7.102c-.13 0-6.715-8.91-21.307-8.91m5.682 25.18c10.589 0 16.012 8.394 16.012 15.883c0 8.135-5.81 16.142-16.012 16.142c-8.393 0-16.012-6.844-16.012-15.754c0-9.04 6.07-16.27 16.012-16.27m51.265 54.88V0h27.763v41.967s6.585-9.168 20.402-9.168c16.916 0 26.86 12.655 26.86 30.604v49.457h-27.635V70.118c0-6.07-2.84-12.01-9.426-12.01c-6.715 0-10.201 5.94-10.201 12.01v42.742zM306.038 32.8c-26.214 0-41.838 19.886-41.838 41.322c0 24.276 18.853 40.934 41.967 40.934c22.34 0 41.838-15.883 41.838-40.547c0-26.988-20.532-41.709-41.967-41.709m.258 25.31c9.297 0 15.625 7.747 15.625 15.882c0 6.973-5.94 15.625-15.625 15.625c-8.91 0-15.495-7.102-15.495-15.754c0-8.135 5.423-15.754 15.495-15.754m87.938-25.31c-26.214 0-41.839 19.886-41.839 41.322c0 24.276 18.853 40.934 41.968 40.934c22.34 0 41.838-15.883 41.838-40.547c0-26.988-20.403-41.709-41.967-41.709m.258 25.31c9.297 0 15.625 7.747 15.625 15.882c0 6.973-5.94 15.625-15.625 15.625c-8.91 0-15.496-7.102-15.496-15.754c0-8.135 5.553-15.754 15.496-15.754m63.66 19.498c10.202 0 18.466 8.264 18.466 18.466c0 10.2-8.264 18.465-18.465 18.465s-18.466-8.264-18.466-18.465s8.265-18.466 18.466-18.466m24.536-6.715H449.5L478.943 0H512z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom pill & reschedule/cancel */}
          <div style={{ width: '32px', height: '5px', borderRadius: '3px', background: '#cbd5e1', margin: '24px auto 20px' }} />
          
          <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
            Need to make a change?{' '}
            <span
              onClick={() => { setBookingStatus('idle'); setStep(1); }}
              style={{ color: '#7d3bec', textDecoration: 'underline', textUnderlineOffset: '4px', textDecorationStyle: 'dotted', cursor: 'pointer', fontWeight: 500 }}
            >
              Reschedule
            </span>
            {' '}or{' '}
            <span
              onClick={() => window.location.reload()}
              style={{ color: '#7d3bec', textDecoration: 'underline', textUnderlineOffset: '4px', textDecorationStyle: 'dotted', cursor: 'pointer', fontWeight: 500 }}
            >
              Cancel
            </span>
          </div>

        </div>
      </div>
    );
  }

  const renderMiniCalendar = () => (
    <div style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{currentMonthName} {currentYear}</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={() => {
              if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
              else { setCurrentMonth(m => m - 1); }
            }}
            style={{ width: '24px', height: '24px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}
          >&lt;</button>
          <button
            type="button"
            onClick={() => {
              if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
              else { setCurrentMonth(m => m + 1); }
            }}
            style={{ width: '24px', height: '24px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}
          >&gt;</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, marginBottom: '8px' }}>
        <div style={{ color: '#0f172a' }}>SUN</div>
        <div style={{ color: '#0f172a' }}>MON</div>
        <div style={{ color: '#0f172a' }}>TUE</div>
        <div style={{ color: '#0f172a' }}>WED</div>
        <div style={{ color: '#0f172a' }}>THU</div>
        <div style={{ color: '#0f172a' }}>FRI</div>
        <div style={{ color: '#0f172a' }}>SAT</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 500, color: '#475569' }}>
        <div style={{ padding: '4px 0', opacity: 0 }}>-</div>
        <div style={{ padding: '4px 0', opacity: 0 }}>-</div>
        <div style={{ padding: '4px 0', opacity: 0 }}>-</div>
        {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map(d => {
          const dateObj = new Date(currentYear, currentMonth, d);
          const isPast = dateObj < new Date(new Date().setHours(0,0,0,0));
          if (isPast) return <div key={d} style={{ padding: '4px 0', opacity: 0.3, textAlign: 'center' }}>{d}</div>;

          const isSel = d === selectedDate;
          return (
            <div
              key={d}
              onClick={() => { setSelectedDate(d); setSelectedDayTab(d); }}
              style={{
                width: '32px',
                height: '32px',
                margin: '0 auto',
                borderRadius: '8px',
                background: isSel ? '#1e293b' : '#f1f5f9',
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
              {isSel && <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#ffffff', position: 'absolute', bottom: '4px' }} />}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={`bk-widget-page ${isEmbedded ? 'is-embedded' : ''}`} style={customStyles}>
      {step === 1 ? (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', maxWidth: '1060px', margin: '40px auto', display: 'grid', gridTemplateColumns: currentLayout === 'Month' ? '1fr 1.45fr 1.15fr' : '1fr 2.6fr', gap: '32px' }}>

          {/* Column 1: Left Info Pane */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eff6ff', color: '#7d3bec', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {hostName.substring(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.92rem', fontWeight: 500, color: '#475569' }}>{hostName}</span>
            </div>

            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px', wordBreak: 'break-word', letterSpacing: '-0.02em' }}>
              {eventType?.title}
            </h1>

            {eventType?.desc && (
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
                {eventType.desc}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                <Clock size={18} color="#64748b" /> {eventType?.dur || '15m'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Video size={18} color="#64748b" /> {eventType?.location || 'Google Meet'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, cursor: 'pointer' }}>
                <Globe size={18} color="#64748b" /> Asia/Kolkata
              </div>
            </div>

            {currentLayout !== 'Month' && renderMiniCalendar()}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', gridColumn: currentLayout === 'Month' ? 'span 2' : 'span 1' }}>
            {eventType?.allowedLayouts && eventType.allowedLayouts.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ display: 'inline-flex', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px' }}>
                  {eventType.allowedLayouts.map(layout => (
                    <button
                      key={layout}
                      type="button"
                      onClick={() => setCurrentLayout(layout as any)}
                      style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: currentLayout === layout ? '#ffffff' : 'transparent', color: currentLayout === layout ? '#0f172a' : '#64748b', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', boxShadow: currentLayout === layout ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
                    >
                      {layout}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentLayout === 'Month' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1.15fr', gap: '32px' }}>
                {/* Column 2: Center Interactive Calendar Pane */}
                <div style={{ borderRight: '1px solid #f1f5f9', paddingRight: '24px', borderLeft: '1px solid #f1f5f9', paddingLeft: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{currentMonthName} {currentYear}</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
                          else { setCurrentMonth(m => m - 1); }
                        }}
                        style={{ width: '30px', height: '30px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}
                      >&lt;</button>
                      <button
                        type="button"
                        onClick={() => {
                          if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
                          else { setCurrentMonth(m => m + 1); }
                        }}
                        style={{ width: '30px', height: '30px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}
                      >&gt;</button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, marginBottom: '10px' }}>
                    <div style={{ color: '#7d3bec' }}>SUN</div>
                    <div style={{ color: '#64748b' }}>MON</div>
                    <div style={{ color: '#64748b' }}>TUE</div>
                    <div style={{ color: '#64748b' }}>WED</div>
                    <div style={{ color: '#64748b' }}>THU</div>
                    <div style={{ color: '#64748b' }}>FRI</div>
                    <div style={{ color: '#64748b' }}>SAT</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 500, color: '#0f172a', marginBottom: '20px' }}>
                    <div style={{ padding: '6px 0', opacity: 0 }}>-</div>
                    <div style={{ padding: '6px 0', opacity: 0 }}>-</div>
                    <div style={{ padding: '6px 0', opacity: 0 }}>-</div>
                    {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map(d => {
                      const dateObj = new Date(currentYear, currentMonth, d);
                      const isPast = dateObj < new Date(new Date().setHours(0,0,0,0));
                      if (isPast) return <div key={d} style={{ padding: '8px 0', opacity: 0.3, textAlign: 'center' }}>{d}</div>;

                      const isSel = d === selectedDate;
                      return (
                        <div
                          key={d}
                          onClick={() => { setSelectedDate(d); setSelectedDayTab(d); }}
                          style={{
                            width: '30px',
                            height: '30px',
                            margin: '0 auto',
                            borderRadius: '50%',
                            background: isSel ? '#7d3bec' : 'transparent',
                            color: isSel ? '#ffffff' : '#0f172a',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: isSel ? 700 : 500,
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>{d}</span>
                          {isSel && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ffffff', position: 'absolute', bottom: '4px' }} />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Dynamic Day Selection Tabs around selected date */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', marginBottom: '14px' }}>
                    {[Math.max(1, selectedDayTab - 1), selectedDayTab, Math.min(30, selectedDayTab + 1), Math.min(30, selectedDayTab + 2), Math.min(30, selectedDayTab + 3), Math.min(30, selectedDayTab + 4)].map(dayNum => {
                      const activeDay = selectedDayTab === dayNum;
                      return (
                        <button
                          key={dayNum}
                          type="button"
                          onClick={() => setSelectedDayTab(dayNum)}
                          style={{
                            padding: '8px 0',
                            background: activeDay ? '#7d3bec' : '#ffffff',
                            color: activeDay ? '#ffffff' : '#7d3bec',
                            border: activeDay ? 'none' : '1px solid #bfdbfe',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          {dayNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Real-time Dynamic Time Slots */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                    {['9:00 AM', '9:15 AM', '9:30 AM', '9:45 AM', '10:00 AM'].map(t => {
                      const activeTime = selectedTime === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSelectedTime(t)}
                          style={{
                            padding: '8px 2px',
                            background: activeTime ? '#7d3bec' : '#eff6ff',
                            color: activeTime ? '#ffffff' : '#7d3bec',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            textAlign: 'center'
                          }}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Column 3: Right Time Slots Pane matching Screenshot */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][selectedDate % 7]} {selectedDate}
                    </span>
                    <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '2px' }}>
                      <button
                        type="button"
                        onClick={() => setTimeFormat('12h')}
                        style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: timeFormat === '12h' ? '#ffffff' : 'transparent', color: timeFormat === '12h' ? '#7d3bec' : '#64748b', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', boxShadow: timeFormat === '12h' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none' }}
                      >12h</button>
                      <button
                        type="button"
                        onClick={() => setTimeFormat('24h')}
                        style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: timeFormat === '24h' ? '#ffffff' : 'transparent', color: timeFormat === '24h' ? '#7d3bec' : '#64748b', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', boxShadow: timeFormat === '24h' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none' }}
                      >24h</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {availableSlots.length === 0 && <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', marginTop: '20px' }}>No available times on this date.</div>}
                    {availableSlots.map(slot => {
                      const timeStr = timeFormat === '12h' ? slot.time12 : slot.time24;
                      return (
                      <div key={slot.time24} style={{ display: 'flex', gap: '8px' }}>
                        <div
                          onClick={() => setSelectedTime(slot.time12)}
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 16px',
                            background: selectedTime === slot.time12 ? '#eff6ff' : '#ffffff',
                            border: selectedTime === slot.time12 ? '1px solid #7d3bec' : '1px solid #e2e8f0',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7d3bec', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0f172a' }}>{timeStr}</span>
                        </div>
                        {selectedTime === slot.time12 && (
                          <button
                            onClick={() => setStep(2)}
                            style={{
                              padding: '0 20px',
                              borderRadius: '10px',
                              border: 'none',
                              background: '#7d3bec',
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '0.92rem',
                              cursor: 'pointer',
                              boxShadow: '0 4px 12px rgba(14, 97, 243, 0.2)'
                            }}
                          >
                            Next
                          </button>
                        )}
                      </div>
                    )})}
                  </div>
                </div>
              </div>
            )}

            {currentLayout === 'Weekly' && (
              <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                      {currentMonthName.substring(0, 3)} {selectedDate}-{Math.min(daysInCurrentMonth, selectedDate + 6)}, {currentYear}
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&lt;</button>
                      <button style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&gt;</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                      <div style={{ width: '36px', height: '20px', background: '#e2e8f0', borderRadius: '10px', position: 'relative' }}>
                         <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} />
                      </div>
                      Overlay my calendar
                    </label>
                    <div style={{ display: 'flex', background: '#f8fafc', borderRadius: '8px', padding: '2px', border: '1px solid #e2e8f0' }}>
                      <button onClick={() => setTimeFormat('12h')} style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: timeFormat === '12h' ? '#ffffff' : 'transparent', color: timeFormat === '12h' ? '#0f172a' : '#64748b', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', boxShadow: timeFormat === '12h' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none' }}>12h</button>
                      <button onClick={() => setTimeFormat('24h')} style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: timeFormat === '24h' ? '#ffffff' : 'transparent', color: timeFormat === '24h' ? '#0f172a' : '#64748b', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', boxShadow: timeFormat === '24h' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none' }}>24h</button>
                    </div>
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', borderTop: '1px solid #e2e8f0', borderLeft: '1px solid #e2e8f0', background: '#f8fafc' }}>
                     {/* Headers */}
                     <div style={{ borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: '#fff', height: '48px' }}></div>
                     {Array.from({ length: 7 }).map((_, i) => {
                        const d = new Date(currentYear, currentMonth, selectedDate);
                        d.setDate(d.getDate() + i);
                        const dayStr = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][d.getDay()];
                        const isSel = i === 0;
                        return (
                           <div key={i} style={{ borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '12px 0', textAlign: 'center', background: '#fff', height: '48px', boxSizing: 'border-box' }}>
                              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', lineHeight: 1 }}>
                                 {dayStr} 
                                 <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: isSel ? '#0f172a' : 'transparent', color: isSel ? '#fff' : '#0f172a', fontSize: '0.8rem' }}>{d.getDate()}</span>
                              </div>
                           </div>
                        );
                     })}
                     
                     {/* Time Rows Background */}
                     {['8:00am', '9:00am', '10:00am', '11:00am', '12:00pm', '1:00pm', '2:00pm', '3:00pm', '4:00pm', '5:00pm', '6:00pm'].map((t) => (
                        <React.Fragment key={t}>
                          <div style={{ borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '12px 8px', fontSize: '0.7rem', color: '#94a3b8', textAlign: 'right', background: '#fff', height: '40px', boxSizing: 'border-box' }}>
                             {t}
                          </div>
                          {Array.from({ length: 7 }).map((_, colIdx) => (
                            <div key={colIdx} style={{ borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', height: '40px', background: 'transparent', boxSizing: 'border-box' }}>
                            </div>
                          ))}
                        </React.Fragment>
                     ))}
                  </div>

                  {/* Absolute positioning overlay for actual slots */}
                  <div style={{ position: 'absolute', top: '48px', left: '60px', right: 0, bottom: 0, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', pointerEvents: 'none' }}>
                     {Array.from({ length: 7 }).map((_, colIdx) => {
                        const d = new Date(currentYear, currentMonth, selectedDate);
                        d.setDate(d.getDate() + colIdx);
                        const daySlots = generateTimeSlotsForDate(d);
                        return (
                          <div key={colIdx} style={{ position: 'relative', height: '100%' }}>
                            {daySlots.map(slot => {
                               let [hStr, mStr] = slot.time24.split(':');
                               let hr = parseInt(hStr, 10);
                               let min = parseInt(mStr, 10);
                               
                               // Convert time to Y offset. Grid starts at 8:00am (row 0), 40px per hour
                               if (hr < 8 || hr > 18) return null; // Outside our grid view
                               const topPx = (hr - 8) * 40 + (min / 60) * 40;
                               const durMins = parseInt(eventType?.dur || '30');
                               const heightPx = (durMins / 60) * 40;
                               
                               const isActive = selectedTime === slot.time12 && selectedDate === d.getDate() && currentMonth === d.getMonth();
                               return (
                                 <div 
                                   key={slot.time12} 
                                   onClick={() => { setCurrentMonth(d.getMonth()); setSelectedDate(d.getDate()); setSelectedTime(slot.time12); setStep(2); }}
                                   style={{ position: 'absolute', top: `${topPx}px`, left: '4px', right: '4px', height: `${heightPx - 2}px`, background: isActive ? '#0f172a' : '#ffffff', border: isActive ? '1px solid #0f172a' : '1px solid #e2e8f0', borderRadius: '4px', pointerEvents: 'auto', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: isActive ? '#ffffff' : '#0f172a', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'all 0.15s', zIndex: isActive ? 10 : 1 }}
                                 >
                                   {timeFormat === '12h' ? slot.time12 : slot.time24}
                                 </div>
                               );
                            })}
                          </div>
                        );
                     })}
                  </div>
                </div>
              </div>
            )}

            {currentLayout === 'Column' && (
              <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                      {currentMonthName.substring(0, 3)} {selectedDate}-{Math.min(daysInCurrentMonth, selectedDate + 6)}, {currentYear}
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&lt;</button>
                      <button style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&gt;</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                      <div style={{ width: '36px', height: '20px', background: '#e2e8f0', borderRadius: '10px', position: 'relative' }}>
                         <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} />
                      </div>
                      Overlay my calendar
                    </label>
                    <div style={{ display: 'flex', background: '#f8fafc', borderRadius: '8px', padding: '2px', border: '1px solid #e2e8f0' }}>
                      <button onClick={() => setTimeFormat('12h')} style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: timeFormat === '12h' ? '#ffffff' : 'transparent', color: timeFormat === '12h' ? '#0f172a' : '#64748b', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', boxShadow: timeFormat === '12h' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none' }}>12h</button>
                      <button onClick={() => setTimeFormat('24h')} style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: timeFormat === '24h' ? '#ffffff' : 'transparent', color: timeFormat === '24h' ? '#0f172a' : '#64748b', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', boxShadow: timeFormat === '24h' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none' }}>24h</button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                  {Array.from({ length: 5 }).map((_, i) => {
                     const d = new Date(currentYear, currentMonth, selectedDate);
                     d.setDate(d.getDate() + i);
                     const dayStr = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][d.getDay()];
                     const isSel = i === 0; // First column is the active date
                     
                     const daySlots = generateTimeSlotsForDate(d);
                     
                     return (
                       <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                         <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            {dayStr} 
                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: isSel ? '#0f172a' : 'transparent', color: isSel ? '#fff' : '#0f172a', fontSize: '0.8rem' }}>{d.getDate()}</span>
                         </div>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                           {daySlots.length === 0 && <div style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', padding: '10px' }}>No times</div>}
                           {daySlots.map(slot => {
                             const t = timeFormat === '12h' ? slot.time12 : slot.time24;
                             const isActive = selectedTime === slot.time12 && selectedDate === d.getDate() && currentMonth === d.getMonth();
                             return (
                               <div key={t} style={{ display: 'flex', gap: '4px' }}>
                                 <button
                                   type="button"
                                   onClick={() => { setCurrentMonth(d.getMonth()); setSelectedDate(d.getDate()); setSelectedTime(slot.time12); }}
                                   style={{ flex: 1, padding: '10px', background: isActive ? '#0f172a' : '#ffffff', border: isActive ? '1px solid #0f172a' : '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.8rem', fontWeight: isActive ? 600 : 500, color: isActive ? '#ffffff' : '#0f172a', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: isActive ? '0 4px 6px rgba(0,0,0,0.1)' : 'none' }}
                                 >
                                   {t}
                                 </button>
                                 {isActive && (
                                   <button
                                     type="button"
                                     onClick={() => setStep(2)}
                                     style={{ padding: '0 12px', background: '#0f172a', border: '1px solid #0f172a', borderRadius: '8px', color: '#ffffff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                                   >
                                     Next
                                   </button>
                                 )}
                               </div>
                             );
                           })}
                         </div>
                       </div>
                     );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '36px 40px', boxShadow: '0 12px 36px rgba(0,0,0,0.05)', maxWidth: '840px', margin: '40px auto', display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) minmax(380px, 1.4fr)', gap: '48px', alignItems: 'start' }}>
          
          {/* Left Column: Meeting Summary */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#1e293b', color: '#ffffff', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {hostName.substring(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>{hostName}</span>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 24px', letterSpacing: '-0.02em' }}>
              {eventType?.title || '15 min meeting'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '0.9rem', color: '#0f172a' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CalendarIcon size={20} color="#7d3bec" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ lineHeight: 1.4, fontWeight: 500 }}>
                  <div>{new Date(currentYear, currentMonth, selectedDate).toLocaleString('default', { weekday: 'long' })}, {currentMonthName} {selectedDate}, {currentYear}</div>
                  <div style={{ color: '#475569', fontSize: '0.85rem' }}>{selectedTime || '4:45 pm'} - {calcEndTime(selectedTime || '4:45pm', eventType?.dur || '15m')}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500 }}>
                <Clock size={20} color="#7d3bec" style={{ flexShrink: 0 }} /> {eventType?.dur || '15m'}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500 }}>
                <Video size={20} color="#7d3bec" style={{ flexShrink: 0 }} /> {eventType?.location || 'Google Meet'}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500 }}>
                <Globe size={20} color="#7d3bec" style={{ flexShrink: 0 }} /> Asia/Calcutta
              </div>
            </div>
          </div>

          {/* Right Column: Enter Details Form */}
          <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '40px' }}>
            <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {(eventType?.formSettings?.questions || [
                { id: 'name', label: 'Your name', type: 'Name', required: true, active: true },
                { id: 'email', label: 'Email address', type: 'Email', required: true, active: true },
                { id: 'notes', label: 'Additional notes', type: 'Long text', required: false, active: true }
              ]).filter((q: any) => q.active && q.id !== 'guests' && q.id !== 'reschedule').map((q: any) => (
                <div key={q.id}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                    {q.label} {q.required ? '*' : ''}
                  </label>
                  {q.type === 'Long text' ? (
                    <textarea
                      required={q.required}
                      rows={3}
                      placeholder={q.id === 'notes' ? "Please share anything that will help prepare for our meeting." : ""}
                      value={q.id === 'notes' ? notes : ''}
                      onChange={e => { if (q.id === 'notes') setNotes(e.target.value); }}
                      style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#0f172a', borderRadius: '10px', outline: 'none', fontSize: '0.92rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                    />
                  ) : (
                    <input
                      required={q.required}
                      type={q.type === 'Email' ? 'email' : q.type === 'Phone' ? 'tel' : 'text'}
                      placeholder={q.id === 'name' ? 'John Doe' : q.id === 'email' ? 'user@example.com' : q.id === 'phone' ? '+1 (555) 123-4567' : ''}
                      value={q.id === 'name' ? name : q.id === 'email' ? email : q.id === 'phone' ? phone : ''}
                      onChange={e => {
                        if (q.id === 'name') setName(e.target.value);
                        else if (q.id === 'email') setEmail(e.target.value);
                        else if (q.id === 'phone') setPhone(e.target.value);
                      }}
                      style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#0f172a', borderRadius: '10px', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }}
                    />
                  )}
                </div>
              ))}
              
              {(eventType?.formSettings?.questions || []).some((q: any) => q.id === 'guests' && q.active) && (
                <div>
                  <button
                    type="button"
                    onClick={() => alert('Add guests feature coming soon')}
                    style={{ background: 'none', border: 'none', color: '#7d3bec', fontWeight: 600, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: 0 }}
                  >
                    <UserPlus size={18} /> Add guests
                  </button>
                </div>
              )}

              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '8px 0 0', lineHeight: 1.5 }}>
                By proceeding, you agree to LinksMeet's <span style={{ color: '#7d3bec', cursor: 'pointer' }}>Terms</span> and <span style={{ color: '#7d3bec', cursor: 'pointer' }}>Privacy Policy</span>.
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '20px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ background: 'none', border: 'none', color: '#475569', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', padding: '10px 16px' }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={bookingStatus === 'booking'}
                  style={{ padding: '12px 32px', background: '#7d3bec', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(14, 97, 243, 0.25)' }}
                >
                  {bookingStatus === 'booking' ? <Loader2 size={18} className="crm-spin-ic" /> : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

