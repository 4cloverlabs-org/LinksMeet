import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  CalendarCheck, Video, X, Loader2
} from 'lucide-react';

export default function BookingsPage() {
  const ctx = useOutletContext<any>();
  const { 
    toast, setToast,
    cancelBooking, bookingTab, setBookingTab,
    filteredBookings, avColor, initials 
  } = ctx || {};

  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const handleJoin = (b: any) => {
    if (b && b.meetLink) {
      window.open(b.meetLink, '_blank', 'noopener,noreferrer');
    } else {
      setToast('No video meeting link found for this booking.');
      setTimeout(() => setToast(null), 3000);
    }
  };

  const confirmCancel = () => {
    if (cancelingId) {
      cancelBooking(cancelingId);
      setCancelingId(null);
    }
  };

  return (
    <>
      <div className="crm-fade crm-card">
        <div className="crm-card-head">
          <div className="crm-seg">
            {(['upcoming', 'past', 'cancelled', 'rescheduled'] as const).map(t => (
              <button key={t} className={bookingTab === t ? 'on' : ''} onClick={() => setBookingTab(t)}>
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {filteredBookings.length === 0 ? (
          <div className="crm-empty">
            <span className="ic"><CalendarCheck size={26} /></span>
            <h3>No {bookingTab} bookings</h3>
            <p>When you have {bookingTab} meetings, they’ll show up here.</p>
          </div>
        ) : filteredBookings.map((b: any, i: number) => (
          <div className="crm-task" key={i} style={{ padding: '14px 0' }}>
            <span className="crm-av" style={{ background: avColor(i) }}>{initials(b.name)}</span>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{b.name}</div>
              <div style={{ fontSize: '0.78rem', color: '#9b9bab' }}>{b.event} · {b.slot}</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
              {(b.status === 'upcoming' || b.status === 'rescheduled') && (
                <>
                  {b.meetLink ? (
                    <a href={b.meetLink} target="_blank" rel="noopener noreferrer" className="crm-btn crm-btn-ghost" style={{ textDecoration: 'none' }}>
                      <Video size={14} /> Join
                    </a>
                  ) : (
                    <button className="crm-btn crm-btn-ghost" onClick={() => handleJoin(b)}>
                      <Video size={14} /> Join
                    </button>
                  )}
                  <button className="crm-btn crm-btn-ghost" style={{ color: '#DC2626' }} onClick={() => setCancelingId(b.id)}>
                    <X size={14} /> Cancel
                  </button>
                </>
              )}
              <span className={`crm-tag ${b.status === 'upcoming' ? 'violet' : b.status === 'cancelled' ? 'rose' : b.status === 'rescheduled' ? 'amber' : 'green'}`}>{b.status}</span>
            </div>
          </div>
        ))}
      </div>

      {cancelingId && (
        <div className="crm-modal-overlay" onClick={() => setCancelingId(null)}>
          <div className="crm-modal" onClick={e => e.stopPropagation()}>
            <div className="crm-modal-head">
              <h3>Cancel Booking</h3>
              <div className="crm-modal-close" onClick={() => setCancelingId(null)}><X size={20} /></div>
            </div>
            <div className="crm-modal-body">
              <p>Are you sure you want to cancel this booking? The booker will not be automatically notified unless you have a cancellation workflow configured.</p>
              <div className="crm-form-actions" style={{ marginTop: 24, justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="crm-btn" onClick={() => setCancelingId(null)}>Keep Booking</button>
                <button type="button" className="crm-btn crm-btn-primary" style={{ background: '#DC2626' }} onClick={confirmCancel}>Yes, Cancel it</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
