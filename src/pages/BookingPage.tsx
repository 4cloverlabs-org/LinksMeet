import { useState, useEffect, type FormEvent } from 'react';
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
const MONTHS = ['May 2026', 'June 2026', 'July 2026'];
const DAYS_IN_MONTH = [31, 30, 31];

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
  const [selectedDate, setSelectedDate] = useState<number>(30);
  const [selectedDayTab, setSelectedDayTab] = useState<number>(6);
  const [selectedTime, setSelectedTime] = useState<string | null>('9:30 AM');
  const [monthIdx, setMonthIdx] = useState(1);
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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
            setEventType({ ...etData, desc: etData.description || etData.desc });
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
      // Hardcoding June 2026 for the demo context
      const d = new Date(2026, 5, parseInt(selectedDate.toString(), 10), hr, min);
      const startTime = d.toISOString();
      
      // add duration
      const durMinutes = parseInt(eventType.dur) || 30;
      const endTime = new Date(d.getTime() + durMinutes * 60000).toISOString();

      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerUid: uid,
          bookerName: name,
          bookerEmail: email,
          startTime,
          endTime,
          eventTitle: eventType.title,
          eventTypeSlug: slug
        })
      });

      if (!res.ok) {
        throw new Error('Backend failed to book');
      }
      const data = await res.json();
      
      setMeetLink(data.booking?.meet_link || '');

      setBookingStatus('success');
    } catch (err) {
      alert('Failed to complete booking. Please try again.');
      setBookingStatus('idle');
    }
  };

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
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDate % 7]}, {MONTHS[monthIdx]?.split(' ')[0] || 'July'} {selectedDate}, 2026
                </div>
                <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '2px' }}>
                  {selectedTime || '9:00 AM'} – {calcEndTime(selectedTime || '9:00am', eventType?.dur || '15m')} (India Standard Time)
                </div>
              </div>

              <div style={{ fontWeight: 700, color: '#0f172a' }}>Who</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500, color: '#0f172a' }}>{hostName}</span>
                  <span style={{ background: '#eff6ff', color: '#0E61F3', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, marginLeft: '8px' }}>Host</span>
                </div>
                <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '2px' }}>lead@example.com</div>

                <div style={{ marginTop: '14px', fontWeight: 500, color: '#0f172a' }}>{name || 'Guest'}</div>
                <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '2px' }}>{email || 'guest@example.com'}</div>
              </div>

              <div style={{ fontWeight: 700, color: '#0f172a' }}>Where</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#0f172a', fontWeight: 500 }}>LinksMeet Video</span>
                <ExternalLink
                  size={16}
                  color="#0E61F3"
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
                  <svg width="24" height="24" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                </button>
                
                <button type="button" title="Outlook" style={{ width: '42px', height: '42px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                  <svg width="24" height="24" viewBox="0 0 48 48">
                    <path fill="#1976d2" d="M27.5,6.5h-15C11.12,6.5,10,7.62,10,9v30c0,1.38,1.12,2.5,2.5,2.5h15c1.38,0,2.5-1.12,2.5-2.5V9C30,7.62,28.88,6.5,27.5,6.5z"/>
                    <path fill="#1e88e5" d="M43.344,14.686L30,12.5v23l13.344-2.186C44.301,33.157,45,32.348,45,31.381V16.619C45,15.652,44.301,14.843,43.344,14.686z"/>
                    <path fill="#2196f3" d="M30,12.5v23l8.601,5.529C39.467,41.586,40.5,41.037,40.5,40.019V7.981c0-1.018-1.033-1.567-1.899-1.01L30,12.5z"/>
                    <path fill="#0d47a1" d="M24,19.5v9c0,0.828-0.672,1.5-1.5,1.5h-9c-0.828,0-1.5-0.672-1.5-1.5v-9c0-0.828,0.672-1.5,1.5-1.5h9C23.328,18,24,18.672,24,19.5z"/>
                    <path fill="#fff" d="M17.5,28C15.567,28,14,26.433,14,24.5S15.567,21,17.5,21S21,22.567,21,24.5S19.433,28,17.5,28z M17.5,22.5C16.395,22.5,15.5,23.395,15.5,24.5S16.395,26.5,17.5,26.5S19.5,25.605,19.5,24.5S18.605,22.5,17.5,22.5z"/>
                  </svg>
                </button>
                
                <button type="button" title="Office 365" style={{ width: '42px', height: '42px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                  <svg width="24" height="24" viewBox="0 0 48 48">
                    <path fill="#d83b01" d="M22.25 5L8 10v28l14.25 5 17.75-6.5V11.5L22.25 5z"/>
                    <path fill="#f36d21" d="M22.25 5v38l17.75-6.5V11.5L22.25 5z"/>
                    <path fill="#ff8c00" d="M22.25 15.5L13.5 18v12l8.75 2.5 10.75-3.5V19L22.25 15.5z"/>
                    <path fill="#fff" d="M22.25 19.5c-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5-2.02-4.5-4.5-4.5zm0 6.8c-1.27 0-2.3-1.03-2.3-2.3s1.03-2.3 2.3-2.3 2.3 1.03 2.3 2.3-1.03 2.3-2.3 2.3z"/>
                  </svg>
                </button>
                
                <button type="button" title="Apple Calendar / iCal" style={{ width: '42px', height: '42px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                  <svg width="24" height="24" viewBox="0 0 48 48">
                    <rect width="42" height="42" x="3" y="3" fill="#ffffff" rx="9" ry="9" stroke="#e2e8f0" strokeWidth="2"/>
                    <path fill="#ff3b30" d="M12 3h24c4.97 0 9 4.03 9 9v5H3v-5c0-4.97 4.03-9 9-9z"/>
                    <text x="24" y="14" fill="#ffffff" fontFamily="sans-serif" fontSize="9" fontWeight="800" letterSpacing="0.5" textAnchor="middle">JUL</text>
                    <text x="24" y="36" fill="#0f172a" fontFamily="sans-serif" fontSize="20" fontWeight="700" letterSpacing="-0.5" textAnchor="middle">17</text>
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
              style={{ color: '#0E61F3', textDecoration: 'underline', textUnderlineOffset: '4px', textDecorationStyle: 'dotted', cursor: 'pointer', fontWeight: 500 }}
            >
              Reschedule
            </span>
            {' '}or{' '}
            <span
              onClick={() => window.location.reload()}
              style={{ color: '#0E61F3', textDecoration: 'underline', textUnderlineOffset: '4px', textDecorationStyle: 'dotted', cursor: 'pointer', fontWeight: 500 }}
            >
              Cancel
            </span>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className={`bk-widget-page ${isEmbedded ? 'is-embedded' : ''}`} style={customStyles}>
      {step === 1 ? (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', maxWidth: '1060px', margin: '40px auto', display: 'grid', gridTemplateColumns: '1fr 1.45fr 1.15fr', gap: '32px' }}>

          {/* Column 1: Left Info Pane */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eff6ff', color: '#0E61F3', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                <Video size={18} color="#64748b" /> LinksMeet Video
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, cursor: 'pointer' }}>
                <Globe size={18} color="#64748b" /> Asia/Kolkata
              </div>
            </div>
          </div>

          {/* Column 2: Center Interactive Calendar Pane */}
          <div style={{ borderLeft: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9', padding: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{MONTHS[monthIdx]}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setMonthIdx(Math.max(0, monthIdx - 1))}
                  style={{ width: '30px', height: '30px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}
                >&lt;</button>
                <button
                  type="button"
                  onClick={() => setMonthIdx(Math.min(MONTHS.length - 1, monthIdx + 1))}
                  style={{ width: '30px', height: '30px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}
                >&gt;</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, marginBottom: '10px' }}>
              <div style={{ color: '#0E61F3' }}>SUN</div>
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
              {Array.from({ length: DAYS_IN_MONTH[monthIdx] }, (_, i) => i + 1).map(d => {
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
                      background: isSel ? '#0E61F3' : 'transparent',
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
                      background: activeDay ? '#0E61F3' : '#ffffff',
                      color: activeDay ? '#ffffff' : '#0E61F3',
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
                      background: activeTime ? '#0E61F3' : '#eff6ff',
                      color: activeTime ? '#ffffff' : '#0E61F3',
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
                  style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: timeFormat === '12h' ? '#ffffff' : 'transparent', color: timeFormat === '12h' ? '#0E61F3' : '#64748b', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', boxShadow: timeFormat === '12h' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none' }}
                >12h</button>
                <button
                  type="button"
                  onClick={() => setTimeFormat('24h')}
                  style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: timeFormat === '24h' ? '#ffffff' : 'transparent', color: timeFormat === '24h' ? '#0E61F3' : '#64748b', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', boxShadow: timeFormat === '24h' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none' }}
                >24h</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(timeFormat === '12h' ? ['4:30pm', '4:45pm', '5:00pm', '5:15pm', '5:30pm'] : ['16:30', '16:45', '17:00', '17:15', '17:30']).map(timeStr => (
                <div key={timeStr} style={{ display: 'flex', gap: '8px' }}>
                  <div
                    onClick={() => setSelectedTime(timeStr)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      background: selectedTime === timeStr ? '#eff6ff' : '#ffffff',
                      border: selectedTime === timeStr ? '1px solid #0E61F3' : '1px solid #e2e8f0',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0E61F3', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0f172a' }}>{timeStr}</span>
                  </div>
                  {selectedTime === timeStr && (
                    <button
                      onClick={() => setStep(2)}
                      style={{
                        padding: '0 20px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#0E61F3',
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
              ))}
            </div>
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
                <CalendarIcon size={20} color="#0E61F3" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ lineHeight: 1.4, fontWeight: 500 }}>
                  <div>{['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDate % 7]}, {MONTHS[monthIdx]?.split(' ')[0] || 'June'} {selectedDate}, 2026</div>
                  <div style={{ color: '#475569', fontSize: '0.85rem' }}>{selectedTime || '4:45 pm'} – {calcEndTime(selectedTime || '4:45pm', eventType?.dur || '15m')}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500 }}>
                <Clock size={20} color="#0E61F3" style={{ flexShrink: 0 }} /> {eventType?.dur || '15m'}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500 }}>
                <Video size={20} color="#0E61F3" style={{ flexShrink: 0 }} /> LinksMeet Video
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500 }}>
                <Globe size={20} color="#0E61F3" style={{ flexShrink: 0 }} /> Asia/Calcutta
              </div>
            </div>
          </div>

          {/* Right Column: Enter Details Form */}
          <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '40px' }}>
            <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Your name *</label>
                <input
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#0f172a', borderRadius: '10px', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Email address *</label>
                <input
                  required
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#0f172a', borderRadius: '10px', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Additional notes</label>
                <textarea
                  rows={3}
                  placeholder="Please share anything that will help prepare for our meeting."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#0f172a', borderRadius: '10px', outline: 'none', fontSize: '0.92rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => alert('Add guests feature coming soon')}
                  style={{ background: 'none', border: 'none', color: '#0E61F3', fontWeight: 600, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: 0 }}
                >
                  <UserPlus size={18} /> Add guests
                </button>
              </div>

              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '8px 0 0', lineHeight: 1.5 }}>
                By proceeding, you agree to LinksMeet's <span style={{ color: '#0E61F3', cursor: 'pointer' }}>Terms</span> and <span style={{ color: '#0E61F3', cursor: 'pointer' }}>Privacy Policy</span>.
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
                  style={{ padding: '12px 32px', background: '#0E61F3', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(14, 97, 243, 0.25)' }}
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

