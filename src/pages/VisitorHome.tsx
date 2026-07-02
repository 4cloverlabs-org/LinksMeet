import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, ArrowRight, Sparkles, LogIn, Globe, Database,
  Calendar as CalendarIcon, ShieldCheck, Check, ChevronDown, Zap,
  Bell, Video, Star, Users
} from 'lucide-react';
import { fetchEventTypes } from '../lib/db';
import type { EventType } from '../lib/db';

/**
 * Lightweight scroll-reveal hook. Adds `.is-visible` to any element carrying
 * the `.reveal` class once it enters the viewport — pure IntersectionObserver,
 * no animation library required.
 */
function useScrollReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (!('IntersectionObserver' in window) || els.length === 0) {
      els.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  });
}

// Map an event color to the CSS custom properties driving the ticket accent rail/glow.
function ticketAccentVars(color: string): React.CSSProperties {
  switch (color) {
    case 'purple':
      return { ['--ticket-accent' as string]: 'hsl(var(--accent-secondary))', ['--ticket-glow' as string]: 'hsl(var(--accent-secondary) / 0.12)' };
    case 'green':
      return { ['--ticket-accent' as string]: 'hsl(var(--accent-success))', ['--ticket-glow' as string]: 'hsl(var(--accent-success) / 0.12)' };
    case 'blue':
    default:
      return { ['--ticket-accent' as string]: 'hsl(var(--accent-primary))', ['--ticket-glow' as string]: 'hsl(var(--accent-primary) / 0.12)' };
  }
}

export default function VisitorHome() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const navigate = useNavigate();
  const meetingsRef = useRef<HTMLElement | null>(null);

  useScrollReveal();

  useEffect(() => {
    async function loadEvents() {
      try {
        const events = await fetchEventTypes();
        setEventTypes(events.filter(e => e.active));
      } catch (e) {
        console.error('Error loading event types:', e);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const getEventBadgeClass = (color: string) => {
    switch (color) {
      case 'blue': return 'badge-blue';
      case 'purple': return 'badge-purple';
      case 'green': return 'badge-green';
      default: return 'badge-blue';
    }
  };

  const scrollToMeetings = () => {
    document.getElementById('meeting-types')?.scrollIntoView({ behavior: 'smooth' });
  };

  const faqs = [
    {
      q: 'How does the automatic timezone translation work?',
      a: "LinksMeet reads the host's primary operating timezone and translates active slot windows into the visitor's local browser timezone offset dynamically. Guests see available options instantly synced to their local clock without having to calculate offsets manually."
    },
    {
      q: 'Can I use LinksMeet completely offline?',
      a: "Yes! LinksMeet features a built-in local fallback engine. If live connection keys are missing or disabled, the application seeds default configurations and writes reservations locally to your browser's localStorage. Once database configurations are set, you can toggle live synchronization."
    },
    {
      q: 'How do I configure my weekly working hours?',
      a: 'Hosts can navigate to the Admin Dashboard under the Weekly Planner tab to adjust active days, select operating timezones, change standard hours, or block off vacation/holiday dates dynamically.'
    },
    {
      q: 'Are video conference meeting links generated automatically?',
      a: 'Yes, on submission, a virtual meeting link (Google Meet style room identifier) is dynamically calculated and embedded in confirmation replies, calendar additions, and host dashboards.'
    }
  ];

  return (
    <div style={{ backgroundColor: 'hsl(var(--bg-primary))', minHeight: '100vh', fontFamily: '"Geist Sans", "Geist Placeholder", sans-serif', position: 'relative', overflow: 'hidden' }}>

      {/* ---------------------------------------------------- */}
      {/* Premium SaaS Navbar                                  */}
      {/* ---------------------------------------------------- */}
      <header className="container" style={{ position: 'relative', zIndex: 10 }}>
        <nav className="landing-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, hsl(var(--accent-primary)), hsl(var(--accent-secondary)))',
              borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, boxShadow: '0 6px 16px hsl(var(--accent-primary) / 0.35)'
            }}>
              S
            </div>
            <span style={{ fontFamily: '"Geist Sans", "Geist Placeholder", sans-serif', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              LinksMeet
            </span>
          </div>

          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#meeting-types" className="nav-link">Meeting Formats</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#faq" className="nav-link">FAQs</a>
            <button
              onClick={() => navigate('/admin')}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogIn size={14} />
              <span>Admin Console</span>
            </button>
          </div>
        </nav>
      </header>

      {/* ---------------------------------------------------- */}
      {/* Hero Section                                         */}
      {/* ---------------------------------------------------- */}
      <section
        className="container hero-grid"
        style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: '50px', alignItems: 'center', padding: '50px 24px 90px', position: 'relative', zIndex: 1 }}
      >
        {/* Floating gradient orbs */}
        <div className="hero-orb animate-float" style={{ top: '-60px', left: '-80px', width: '320px', height: '320px', background: 'hsl(var(--accent-primary) / 0.28)' }} />
        <div className="hero-orb animate-float-slow" style={{ bottom: '-80px', right: '-60px', width: '360px', height: '360px', background: 'hsl(var(--accent-secondary) / 0.22)' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', position: 'relative', zIndex: 2 }}>
          <div className="animate-stagger-1" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'hsl(var(--accent-primary) / 0.1)', color: 'hsl(var(--accent-primary))',
            padding: '6px 14px', borderRadius: 'var(--border-radius-full)', fontSize: '0.8rem', fontWeight: 650, width: 'fit-content',
            border: '1px solid hsl(var(--accent-primary) / 0.2)'
          }}>
            <Sparkles size={12} />
            <span>Meet LinksMeet Premium</span>
          </div>

          <h1 className="animate-stagger-2" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', lineHeight: 1.08, letterSpacing: '-0.03em', fontWeight: 700 }}>
            Scheduling made <span className="gradient-text">effortless</span> for professionals.
          </h1>

          <p className="animate-stagger-3" style={{ color: 'hsl(var(--text-secondary))', fontSize: '1.15rem', lineHeight: 1.6, fontWeight: 300, maxWidth: '540px' }}>
            Coordinate meetings across timezone boundaries, manage standard work hours, and schedule discovery consultations dynamically using our local-first dashboard.
          </p>

          <div className="animate-stagger-4" style={{ display: 'flex', gap: '14px', marginTop: '6px', flexWrap: 'wrap' }}>
            <button onClick={scrollToMeetings} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Book a Meeting</span>
              <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/admin')} className="btn btn-secondary">
              Configure Availability
            </button>
          </div>

          <div className="animate-stagger-5 hero-stats" style={{ display: 'flex', gap: '28px', marginTop: '22px', borderTop: '1px solid hsl(var(--border-color))', paddingTop: '22px' }}>
            {[
              { value: '0-ms', label: 'Timezone Calculations' },
              { value: '100%', label: 'Offline Capable fallbacks' },
              { value: 'Instant', label: 'Google Meet Links' }
            ].map(stat => (
              <div key={stat.label}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Mockup Illustration with floating chips */}
        <div className="animate-stagger-3" style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ width: '100%', maxWidth: '440px', position: 'relative' }}>
            {/* Pulsing glow halo behind mockup */}
            <div className="animate-float" style={{
              position: 'absolute', inset: '-30px',
              background: 'radial-gradient(circle, hsl(var(--accent-primary) / 0.18) 0%, transparent 70%)',
              filter: 'blur(34px)', zIndex: 0, animation: 'pulseGlow 5s ease-in-out infinite'
            }} />

            {/* Floating chip: New Booking */}
            <div className="hero-chip animate-float" style={{ top: '-22px', left: '-26px' }}>
              <span className="chip-icon" style={{ background: 'hsl(var(--accent-success) / 0.15)', color: 'hsl(var(--accent-success))' }}>
                <Bell size={16} />
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
                <span>New Booking!</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 400, color: 'hsl(var(--text-secondary))' }}>Discovery Call · 9:00 AM</span>
              </div>
            </div>

            {/* Floating chip: Meet link */}
            <div className="hero-chip animate-float-slow" style={{ bottom: '12px', right: '-30px' }}>
              <span className="chip-icon" style={{ background: 'hsl(var(--accent-primary) / 0.15)', color: 'hsl(var(--accent-primary))' }}>
                <Video size={16} />
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
                <span>Meet link ready</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 400, color: 'hsl(var(--text-secondary))' }}>Auto-generated</span>
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <svg viewBox="0 0 400 280" style={{
                width: '100%', height: 'auto', borderRadius: 'var(--border-radius-md)',
                border: '1px solid hsl(var(--border-color))', boxShadow: 'var(--shadow-xl)',
                backgroundColor: 'hsl(var(--bg-secondary))'
              }}>
                {/* Browser Header mockup */}
                <rect x="0" y="0" width="400" height="40" fill="hsl(var(--bg-tertiary))" />
                <circle cx="20" cy="20" r="5" fill="#EF4444" />
                <circle cx="35" cy="20" r="5" fill="#F59E0B" />
                <circle cx="50" cy="20" r="5" fill="#10B981" />
                <text x="200" y="25" fontSize="10" textAnchor="middle" fill="hsl(var(--text-muted))" fontWeight="500">
                  linksmeet.io/book/discovery-call
                </text>

                {/* Calendar grid mockup */}
                <rect x="20" y="60" width="220" height="200" rx="8" fill="hsl(var(--bg-primary))" stroke="hsl(var(--border-color))" />
                <text x="35" y="85" fontSize="10" fontWeight="700" fill="hsl(var(--text-primary))">June 2026</text>

                {/* Simple calendar cells */}
                {Array.from({ length: 5 }).map((_, r) => (
                  Array.from({ length: 7 }).map((_, c) => {
                    const idx = r * 7 + c;
                    const isSelected = idx === 17;
                    const isBlocked = idx % 7 === 0 || idx % 7 === 6;
                    return (
                      <rect
                        key={idx}
                        x={35 + c * 24}
                        y={100 + r * 24}
                        width="18"
                        height="18"
                        rx="9"
                        fill={isSelected ? 'hsl(var(--accent-primary))' : 'transparent'}
                        stroke={isSelected ? 'none' : 'hsl(var(--border-color))'}
                        strokeWidth="0.5"
                        opacity={isBlocked ? 0.3 : 1}
                      />
                    );
                  })
                ))}

                {/* Selected Date slot mockup */}
                <rect x="260" y="60" width="120" height="200" rx="8" fill="hsl(var(--bg-primary))" stroke="hsl(var(--border-color))" />
                <text x="275" y="82" fontSize="9" fontWeight="700" fill="hsl(var(--text-secondary))">Available slots:</text>

                <rect x="275" y="98" width="90" height="25" rx="6" fill="hsl(var(--accent-primary) / 0.1)" stroke="hsl(var(--accent-primary))" strokeWidth="0.5" />
                <text x="320" y="113" fontSize="8" fontWeight="700" fill="hsl(var(--accent-primary))" textAnchor="middle">09:00 AM</text>

                <rect x="275" y="133" width="90" height="25" rx="6" fill="hsl(var(--bg-secondary))" stroke="hsl(var(--border-color))" strokeWidth="0.5" />
                <text x="320" y="148" fontSize="8" fontWeight="600" fill="hsl(var(--text-secondary))" textAnchor="middle">10:30 AM</text>

                <rect x="275" y="168" width="90" height="25" rx="6" fill="hsl(var(--bg-secondary))" stroke="hsl(var(--border-color))" strokeWidth="0.5" />
                <text x="320" y="183" fontSize="8" fontWeight="600" fill="hsl(var(--text-secondary))" textAnchor="middle">01:00 PM</text>

                <rect x="275" y="203" width="90" height="25" rx="6" fill="hsl(var(--bg-secondary))" stroke="hsl(var(--border-color))" strokeWidth="0.5" />
                <text x="320" y="218" fontSize="8" fontWeight="600" fill="hsl(var(--text-secondary))" textAnchor="middle">03:30 PM</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* Trusted-by strip                                     */}
      {/* ---------------------------------------------------- */}
      <section className="container reveal" style={{ padding: '0 24px 30px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', opacity: 0.75 }}>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>
            Trusted by modern teams
          </span>
          {['Northwind', 'Acme Co', 'Lumio', 'Vertex', 'Brightlane'].map(name => (
            <span key={name} style={{ fontFamily: '"Geist Sans", "Geist Placeholder", sans-serif', fontWeight: 700, fontSize: '1.05rem', color: 'hsl(var(--text-secondary))', letterSpacing: '-0.02em' }}>
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* Features Section — Bento grid                        */}
      {/* ---------------------------------------------------- */}
      <section id="features" style={{ padding: '70px 0', position: 'relative', zIndex: 1 }}>
        <div className="container" style={{ padding: '0 24px' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'hsl(var(--accent-primary) / 0.08)', color: 'hsl(var(--accent-primary))', padding: '6px 16px', borderRadius: 'var(--border-radius-full)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '14px' }}>
              <Zap size={12} />
              <span>Why LinksMeet</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.4rem)', marginBottom: '12px', fontWeight: 700 }}>Engineered for seamless meetings.</h2>
            <p style={{ color: 'hsl(var(--text-secondary))', maxWidth: '600px', margin: '0 auto', fontSize: '1rem', fontWeight: 300 }}>
              Say goodbye to double-booking issues and timezone calculation blocks. LinksMeet works smoothly to coordinate schedules.
            </p>
          </div>

          <div className="bento-grid">
            {/* Tall hero feature: Timezone translation */}
            <div className="bento-card bento-tall reveal" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="feature-icon" style={{ backgroundColor: 'hsl(var(--accent-primary) / 0.1)', color: 'hsl(var(--accent-primary))' }}>
                  <Globe size={24} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 650 }}>Timezone Translations</h3>
                <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 300 }}>
                  Converts host availability into each visitor's local time offset instantly. Scheduling logic holds up regardless of distance — no manual math, no missed calls.
                </p>
              </div>
              {/* mini world-clock visual */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                {[
                  { z: 'NYC', t: '09:00' },
                  { z: 'LDN', t: '14:00' },
                  { z: 'IST', t: '18:30' },
                ].map(c => (
                  <div key={c.z} style={{ flex: '1 1 0', minWidth: '70px', textAlign: 'center', padding: '12px 8px', borderRadius: '12px', background: 'hsl(var(--bg-tertiary))', border: '1px solid hsl(var(--border-color))' }}>
                    <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontWeight: 600, letterSpacing: '0.05em' }}>{c.z}</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: '"Geist Sans", "Geist Placeholder", sans-serif' }}>{c.t}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wide feature: Dual-mode sync */}
            <div className="bento-card bento-wide reveal">
              <div className="feature-icon" style={{ backgroundColor: 'hsl(var(--accent-secondary) / 0.1)', color: 'hsl(var(--accent-secondary))' }}>
                <Database size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 650 }}>Dual-Mode Data Sync</h3>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.88rem', lineHeight: 1.6, fontWeight: 300, maxWidth: '520px' }}>
                Persist configuration locally in <code style={{ background: 'hsl(var(--bg-tertiary))', padding: '1px 6px', borderRadius: '5px', fontSize: '0.82em' }}>localStorage</code>, or flip the switch to sync every reservation live to Firebase Firestore.
              </p>
            </div>

            {/* Half feature: Credentials verification */}
            <div className="bento-card bento-half reveal">
              <div className="feature-icon" style={{ backgroundColor: 'hsl(var(--accent-success) / 0.1)', color: 'hsl(var(--accent-success))' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 650 }}>Credentials Verification</h3>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', lineHeight: 1.6, fontWeight: 300 }}>
                Input your database keys and verify live connectivity instantly, with clear status toasts.
              </p>
            </div>

            {/* Half feature: Instant Meet links */}
            <div className="bento-card bento-half reveal">
              <div className="feature-icon" style={{ backgroundColor: 'hsl(var(--accent-warning) / 0.12)', color: 'hsl(var(--accent-warning))' }}>
                <Video size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 650 }}>Auto Meeting Links</h3>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', lineHeight: 1.6, fontWeight: 300 }}>
                Every confirmed booking ships with a Google Meet–style room link embedded in emails and the dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* Meeting Formats Section (Interactive booking feed)   */}
      {/* ---------------------------------------------------- */}
      <section id="meeting-types" ref={meetingsRef} className="container" style={{ padding: '70px 24px', position: 'relative', zIndex: 1 }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'hsl(var(--accent-secondary) / 0.08)', color: 'hsl(var(--accent-secondary))', padding: '6px 16px', borderRadius: 'var(--border-radius-full)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '12px' }}>
            <CalendarIcon size={12} />
            <span>Interactive Scheduler</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.4rem)', marginBottom: '12px', fontWeight: 700 }}>Choose a meeting type.</h2>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1rem', maxWidth: '500px', margin: '0 auto', fontWeight: 300 }}>
            Select one of the host's active calendar templates below to find a suitable date and book your discovery call.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid hsl(var(--border-color))', borderTopColor: 'hsl(var(--accent-primary))', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>Loading calendar layouts...</span>
          </div>
        ) : eventTypes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', border: '1px dashed hsl(var(--border-color))', borderRadius: 'var(--border-radius-md)', backgroundColor: 'hsl(var(--bg-secondary))' }}>
            <p style={{ color: 'hsl(var(--text-secondary))' }}>No active booking formats configured by the host right now.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '820px', margin: '0 auto' }}>
            {eventTypes.map((event, i) => (
              <div
                key={event.id}
                className={`ticket-card reveal animate-stagger-${Math.min(i + 1, 5)}`}
                style={ticketAccentVars(event.color)}
                onClick={() => navigate(`/book/${event.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/book/${event.id}`); } }}
              >
                <div style={{ flex: 1, minWidth: '280px', position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <span className={`badge ${getEventBadgeClass(event.color)}`}>
                      {event.color} Event
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} />
                      {event.duration} Mins
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>{event.title}</h3>
                  <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', lineHeight: 1.55, fontWeight: 300 }}>
                    {event.description}
                  </p>
                </div>

                <div className="ticket-arrow" style={{ position: 'relative', zIndex: 1 }}>
                  <ArrowRight size={18} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---------------------------------------------------- */}
      {/* Pricing Section                                      */}
      {/* ---------------------------------------------------- */}
      <section id="pricing" style={{ padding: '70px 0', position: 'relative', zIndex: 1 }}>
        <div className="container" style={{ padding: '0 24px' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'hsl(var(--accent-primary) / 0.08)', color: 'hsl(var(--accent-primary))', padding: '6px 16px', borderRadius: 'var(--border-radius-full)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '12px' }}>
              <Zap size={12} />
              <span>Simple Flat Rates</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.4rem)', marginBottom: '12px', fontWeight: 700 }}>Choose a plan that fits you.</h2>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1rem', maxWidth: '500px', margin: '0 auto', fontWeight: 300 }}>
              Deploy LinksMeet and upgrade to unlock advanced cloud operations and database tools.
            </p>
          </div>

          <div className="pricing-grid reveal" style={{ maxWidth: '900px' }}>
            {/* Plan 1 */}
            <div className="pricing-card">
              <div>
                <h4 style={{ fontSize: '1.15rem', color: 'hsl(var(--text-secondary))', fontWeight: 500, marginBottom: '8px' }}>Free Starter</h4>
                <div style={{ fontSize: '2.4rem', fontWeight: 700, color: 'hsl(var(--text-primary))', marginBottom: '12px', fontFamily: '"Geist Sans", "Geist Placeholder", sans-serif' }}>
                  $0 <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'hsl(var(--text-secondary))' }}>/ month</span>
                </div>
                <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.82rem', lineHeight: 1.45, marginBottom: '24px', fontWeight: 300 }}>
                  Perfect for basic scheduling or testing out. Includes full localStorage fallback functionality.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                  {['Standard Weekly Availability', '3 Active Event Templates', 'Local Storage cache', 'Simulated EmailJS dispatches'].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                      <Check size={14} style={{ color: 'hsl(var(--accent-success))', flexShrink: 0 }} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={scrollToMeetings} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>Get Started</button>
            </div>

            {/* Plan 2 */}
            <div className="pricing-card pricing-featured">
              <span className="pricing-badge">Popular</span>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h4 style={{ fontSize: '1.15rem', color: 'hsl(var(--accent-primary))', fontWeight: 650, marginBottom: '8px' }}>Pro Synced</h4>
                <div style={{ fontSize: '2.4rem', fontWeight: 700, color: 'hsl(var(--text-primary))', marginBottom: '12px', fontFamily: '"Geist Sans", "Geist Placeholder", sans-serif' }}>
                  $12 <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'hsl(var(--text-secondary))' }}>/ month</span>
                </div>
                <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.82rem', lineHeight: 1.45, marginBottom: '24px', fontWeight: 300 }}>
                  For consultants and professionals who require live calendar syncing and customer alerts.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                  {['Unlimited Active Templates', 'Firebase Firestore live sync', 'Verify credentials status panel', 'Live EmailJS dispatches', 'Google Meet integrations'].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                      <Check size={14} style={{ color: 'hsl(var(--accent-primary))', flexShrink: 0 }} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={scrollToMeetings} className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem', position: 'relative', zIndex: 1 }}>Go Pro</button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* FAQ Accordion Section                                */}
      {/* ---------------------------------------------------- */}
      <section id="faq" className="container reveal" style={{ padding: '70px 24px', maxWidth: '820px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <h2 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.4rem)', fontWeight: 700, marginBottom: '12px' }}>Frequently Asked Questions</h2>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1rem', fontWeight: 300 }}>
            Everything you need to know about the LinksMeet workflow.
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div key={index} className={`faq-item${isOpen ? ' faq-open' : ''}`}>
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="faq-question"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    style={{ flexShrink: 0, transition: 'transform var(--transition-normal)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: isOpen ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-muted))' }}
                  />
                </button>
                {isOpen && (
                  <div className="faq-answer animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* Final CTA band                                       */}
      {/* ---------------------------------------------------- */}
      <section className="container reveal" style={{ padding: '20px 24px 90px', position: 'relative', zIndex: 1 }}>
        <div className="cta-band">
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.16)', padding: '6px 14px', borderRadius: 'var(--border-radius-full)', fontSize: '0.8rem', fontWeight: 600 }}>
              <Star size={13} fill="currentColor" />
              <span>Loved by busy professionals</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 700, color: '#fff', maxWidth: '640px' }}>
              Ready to stop playing timezone tag?
            </h2>
            <p style={{ fontSize: '1.05rem', maxWidth: '520px', color: 'rgba(255,255,255,0.9)', fontWeight: 300 }}>
              Spin up your booking page in minutes — no credit card, no setup friction. Just pick a slot and go.
            </p>
            <div style={{ display: 'flex', gap: '14px', marginTop: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={scrollToMeetings}
                className="btn"
                style={{ background: '#fff', color: 'hsl(var(--accent-primary))', fontWeight: 650, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span>Book a Meeting</span>
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="btn"
                style={{ background: 'rgba(255,255,255,0.14)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Users size={16} />
                <span>Open Admin Console</span>
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
