import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, Globe, Video, Mail, Home } from 'lucide-react';
import { formatSelectedDate } from '../lib/timezone';
import type { Booking } from '../lib/db';

export default function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract booking from route state
  const state = location.state as { booking: Booking; isDemo: boolean } | null;

  if (!state || !state.booking) {
    // Redirect if direct navigation is attempted without state
    React.useEffect(() => {
      navigate('/');
    }, [navigate]);
    return null;
  }

  const { booking, isDemo } = state;

  // Generates Google Calendar Template URL
  const generateGoogleCalendarUrl = () => {
    try {
      const parts = booking.date.split('-');
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];

      // Parse slot start & end
      const [startRaw, endRaw] = booking.time.split(' - ');
      
      const parseTime = (raw: string) => {
        const match = raw.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return { hr: 9, min: 0 };
        let hr = parseInt(match[1], 10);
        const min = parseInt(match[2], 10);
        const ampm = match[3].toUpperCase();
        if (ampm === 'PM' && hr !== 12) hr += 12;
        if (ampm === 'AM' && hr === 12) hr = 0;
        return { hr, min };
      };

      const start = parseTime(startRaw);
      const end = parseTime(endRaw);

      // Create Dates in local browser timezone
      const startDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), start.hr, start.min);
      const endDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), end.hr, end.min);

      // Helper to format as YYYYMMDDTHHmmssZ (UTC)
      const formatToUtcString = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      const datesParam = `${formatToUtcString(startDate)}/${formatToUtcString(endDate)}`;
      const title = encodeURIComponent(booking.eventTitle);
      const details = encodeURIComponent(`Meeting booked on SaleMail.\n\nVideo Meeting Link: ${booking.meetLink}\n\nClient notes: ${booking.message || 'None'}`);
      const locationVal = encodeURIComponent(booking.meetLink);

      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${details}&location=${locationVal}`;
    } catch (e) {
      // Return a basic google calendar URL if parsing fails
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(booking.eventTitle)}`;
    }
  };

  return (
    <div style={{ padding: '60px 0', display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }} className="animate-fade-in">
      <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
        
        {/* Success Icon */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'rgba(hsl(var(--accent-success)), 0.1)',
          color: 'hsl(var(--accent-success))',
          marginBottom: '24px'
        }}>
          <CheckCircle size={40} />
        </div>

        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          Booking Confirmed!
        </h1>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1rem', fontWeight: 300, marginBottom: '40px' }}>
          A confirmation email has been dispatched to <strong style={{ color: 'hsl(var(--text-primary))' }}>{booking.email}</strong>.
        </p>

        {/* Meeting Information Card */}
        <div 
          className="glass-card"
          style={{
            padding: '30px',
            borderRadius: 'var(--border-radius-md)',
            border: '1px solid hsl(var(--border-color))',
            backgroundColor: 'hsl(var(--bg-secondary))',
            textAlign: 'left',
            marginBottom: '30px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'hsl(var(--text-muted))', letterSpacing: '0.05em', borderBottom: '1px solid hsl(var(--border-color))', paddingBottom: '10px' }}>
            Reservation Details
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={16} style={{ color: 'hsl(var(--accent-primary))' }} />
              <span style={{ fontSize: '0.9rem' }}>Date: <strong>{formatSelectedDate(booking.date)}</strong></span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={16} style={{ color: 'hsl(var(--accent-primary))' }} />
              <span style={{ fontSize: '0.9rem' }}>Time Slot: <strong>{booking.time}</strong></span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Globe size={16} style={{ color: 'hsl(var(--accent-primary))' }} />
              <span style={{ fontSize: '0.9rem' }}>Your Timezone: <strong>{booking.timezone}</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '10px', borderTop: '1px solid hsl(var(--border-color))', paddingTop: '16px' }}>
              <Video size={16} style={{ color: 'hsl(var(--accent-primary))', marginTop: '3px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.9rem' }}>Video Link (Google Meet):</span>
                <a 
                  href={booking.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'hsl(var(--accent-primary))',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    wordBreak: 'break-all',
                    textDecoration: 'underline'
                  }}
                >
                  Join Google Meet
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Email Simulation Note */}
        {isDemo && (
          <div style={{
            backgroundColor: 'rgba(hsl(var(--accent-warning)), 0.08)',
            border: '1px solid rgba(hsl(var(--accent-warning)), 0.2)',
            borderRadius: 'var(--border-radius-md)',
            padding: '16px',
            fontSize: '0.8rem',
            textAlign: 'left',
            color: 'hsl(var(--text-secondary))',
            lineHeight: '1.5',
            marginBottom: '30px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <Mail size={16} style={{ color: 'hsl(var(--accent-warning))', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <strong>Demo Simulation Mode:</strong> A live email has NOT been sent. 
              The platform is currently operating in local mode. 
              Configure your EmailJS details in the Settings tab of the Host Dashboard to enable live transmissions.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href={generateGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ padding: '12px 24px', fontSize: '0.9rem' }}
          >
            <Calendar size={16} />
            <span>Add to Google Calendar</span>
          </a>
          
          <Link
            to="/"
            className="btn btn-secondary"
            style={{ padding: '12px 24px', fontSize: '0.9rem' }}
          >
            <Home size={16} />
            <span>Book another call</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
