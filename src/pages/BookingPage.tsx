import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { requireDb } from '../lib/firebase';
import { Calendar as CalendarIcon, Video, Loader2, ChevronLeft, ChevronRight, Clock, Globe } from 'lucide-react';
import { type EventType } from '../lib/crm';
import '../pages/CrmDashboard.css';

// Unique Google-Meet-style code generator for mock
function genMeetCode() {
  const a = 'abcdefghijklmnopqrstuvwxyz';
  const pick = (n: number) => Array.from({ length: n }, () => a[Math.floor(Math.random() * a.length)]).join('');
  return `${pick(3)}-${pick(4)}-${pick(3)}`;
}

const TIMES = ['09:00am', '09:30am', '10:00am', '10:30am', '11:00am', '01:00pm', '01:30pm', '02:00pm', '02:30pm', '03:00pm'];

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
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hostName, setHostName] = useState('');
  const [eventType, setEventType] = useState<EventType | null>(null);
  
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'booking' | 'success'>('idle');
  const [isEmbedded, setIsEmbedded] = useState(false);

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
      if (!uid || !slug) return setError('Invalid booking link.');
      try {
        const userDoc = await getDoc(doc(requireDb(), 'users', uid));
        if (!userDoc.exists()) return setError('User not found.');
        setHostName(userDoc.data().name || 'SaleMail User');

        const etQuery = query(collection(requireDb(), 'users', uid, 'eventTypes'), where('slug', '==', slug));
        const etSnap = await getDocs(etQuery);
        if (etSnap.empty) return setError('Event type not found or is no longer active.');
        
        const etData = etSnap.docs[0].data() as EventType;
        if (!etData.active) return setError('This event type is currently paused.');
        
        setEventType(etData);
      } catch (err) {
        setError('Failed to load booking page.');
      } finally {
        setLoading(false);
      }
    }
    loadEvent();

    const sendHeight = () => {
      // Send the actual widget page height to allow shrinking as well
      const widgetPage = document.querySelector('.bk-widget-page');
      const height = widgetPage ? widgetPage.scrollHeight : document.body.scrollHeight;
      window.parent.postMessage({ type: 'salemail-resize', height }, '*');
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
      const meet = `https://meet.google.com/${genMeetCode()}`;
      const slot = `June ${selectedDate}, 2026 · ${selectedTime}`;
      
      await addDoc(collection(requireDb(), 'users', uid, 'bookings'), {
        name, email, slot,
        event: eventType.title,
        status: 'upcoming', meetLink: meet,
        createdAt: Date.now(), createdAtServer: serverTimestamp()
      });

      await addDoc(collection(requireDb(), 'users', uid, 'contacts'), {
        name, email, company: '', phone: '', status: 'New',
        source: `Booking · ${eventType.title}`,
        createdAt: Date.now(), createdAtServer: serverTimestamp()
      });

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
        <div className="bk-widget-card" style={{ padding: 40, textAlign: 'center', maxWidth: 400, margin: '0 auto', display: 'block', color: 'var(--w-text)' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CalendarIcon size={24} />
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: 12, fontWeight: 600 }}>Booking Confirmed!</h2>
          <p style={{ color: 'var(--w-text-muted)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: 24 }}>
            You're scheduled with {hostName} for a {eventType?.title}. A calendar invite with a Google Meet link has been sent to your email.
          </p>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: 'var(--w-primary-light)', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500, color: 'var(--w-primary)' }}>
            Book another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bk-widget-page ${isEmbedded ? 'is-embedded' : ''}`} style={customStyles}>
      <div className="bk-widget-card">
        
        {/* Left Sidebar */}
        <div className="bk-widget-left" style={{ borderRight: '1px solid var(--w-text-muted)' }}>
          {step === 2 && (
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--w-primary)', padding: 0, marginBottom: 24, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', fontWeight: 500, fontSize: '1rem' }}>
              <div style={{ background: 'var(--w-primary)', color: '#fff', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}><ChevronLeft size={16} /></div>
            </button>
          )}
          <div style={{ color: 'var(--w-text-muted)', fontWeight: 600, fontSize: '0.9rem', marginBottom: 8 }}>{hostName}</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--w-text)', letterSpacing: '-0.02em', marginBottom: 24 }}>{eventType?.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--w-text-muted)', marginBottom: 16, fontWeight: 600, fontSize: '0.95rem' }}>
            <Clock size={20} color="var(--w-text-muted)" /> {eventType?.dur}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, color: 'var(--w-text-muted)', marginBottom: 24, fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.4 }}>
            <Video size={20} color="var(--w-text-muted)" style={{ marginTop: 2 }} /> 
            <div>Web conferencing details provided upon confirmation.</div>
          </div>
          {step === 2 && selectedDate && selectedTime && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, color: 'var(--w-text-muted)', marginBottom: 24, fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.4 }}>
              <CalendarIcon size={20} color="var(--w-text-muted)" style={{ marginTop: 2 }} /> 
              <div>
                {selectedTime} - {calcEndTime(selectedTime, eventType?.dur || '30m')} <br/>
                <span style={{ color: 'var(--w-text-muted)', fontWeight: 500 }}>Wednesday, June {selectedDate}, 2026</span>
              </div>
            </div>
          )}
          <p style={{ color: 'var(--w-text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{eventType?.desc}</p>
        </div>

        {/* Right Content */}
        <div className="bk-widget-right">
          {step === 1 ? (
            <>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--w-text)', marginBottom: 24 }}>Select a Date & Time</h2>
              <div className="bk-calendar-layout">
                {/* Calendar */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, gap: 20 }}>
                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--w-primary)' }}><ChevronLeft size={20} /></button>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--w-text)' }}>June 2026</span>
                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--w-primary)' }}><ChevronRight size={20} /></button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center', marginBottom: 10 }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                      <div key={d} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--w-text)', textTransform: 'uppercase' }}>{d}</div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px 0', textAlign: 'center' }}>
                    {[...Array(30)].map((_, i) => {
                      const day = i + 1;
                      const isPast = day < 15;
                      const isWeekend = (day + 4) % 7 === 5 || (day + 4) % 7 === 6; // Rough math for June 2026
                      const disabled = isPast || isWeekend;
                      const selected = selectedDate === day;
                      return (
                        <div key={day} style={{ display: 'flex', justifyContent: 'center' }}>
                          <button
                            disabled={disabled}
                            onClick={() => { setSelectedDate(day); setSelectedTime(null); }}
                            style={{
                              width: 44, height: 44, borderRadius: '50%',
                              border: 'none', background: selected ? 'var(--w-primary)' : disabled ? 'transparent' : 'var(--w-primary-light)',
                              color: selected ? '#fff' : disabled ? '#b2b2b2' : 'var(--w-primary)',
                              fontWeight: 700, fontSize: '0.95rem',
                              cursor: disabled ? 'default' : 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                          >
                            {day}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 40 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--w-text)', marginBottom: 8 }}>Time zone</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: 'var(--w-text)' }}>
                      <Globe size={16} /> India Standard Time (1:48pm)
                    </div>
                  </div>
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 10, animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ fontSize: '1rem', color: 'var(--w-text)', marginBottom: 12 }}>Wednesday, June {selectedDate}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 400, overflowY: 'auto', paddingRight: 10 }}>
                      {TIMES.map(t => (
                        <div key={t} style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => setSelectedTime(t)}
                            style={{
                              flex: 1, padding: '14px', borderRadius: 4,
                              border: selectedTime === t ? '1px solid var(--w-text-muted)' : '1px solid var(--w-primary)',
                              background: selectedTime === t ? 'var(--w-text-muted)' : 'transparent',
                              color: selectedTime === t ? '#fff' : 'var(--w-primary)',
                              fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', transition: '0.1s'
                            }}
                          >
                            {t}
                          </button>
                          {selectedTime === t && (
                            <button
                              onClick={() => setStep(2)}
                              style={{
                                flex: 1, padding: '14px', borderRadius: 4, border: 'none',
                                background: 'var(--w-primary)', color: '#fff',
                                fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                                animation: 'fadeIn 0.2s ease-out'
                              }}
                            >
                              Next
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--w-text)', marginBottom: 24 }}>Enter Details</h2>
              <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 360 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--w-text)', marginBottom: 8 }}>Name *</label>
                  <input required value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--w-text-muted)', background: 'transparent', color: 'var(--w-text)', borderRadius: 8, outline: 'none', fontSize: '1rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--w-text)', marginBottom: 8 }}>Email *</label>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--w-text-muted)', background: 'transparent', color: 'var(--w-text)', borderRadius: 8, outline: 'none', fontSize: '1rem' }} />
                </div>
                
                <button type="submit" disabled={bookingStatus === 'booking'} style={{ marginTop: 12, padding: '14px', background: 'var(--w-primary)', color: '#fff', border: 'none', borderRadius: 40, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {bookingStatus === 'booking' ? <Loader2 size={16} className="crm-spin-ic" /> : 'Schedule Event'}
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

