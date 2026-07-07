import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  blockedDates?: string[];
  workingDays?: {
    [key: string]: { active: boolean };
  };
}

export default function Calendar({
  selectedDate,
  onChange,
  blockedDates = [],
  workingDays = {}
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxBookingDate = new Date(today);
  maxBookingDate.setDate(today.getDate() + 730);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Pad initial empty days
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    // Days of month
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      d.setHours(0, 0, 0, 0);
      days.push(d);
    }
    return days;
  };

  const formatDateToYYYYMMDD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const isDateSelectable = (date: Date) => {
    // 1. Must be between today and today + 30 days
    if (date < today || date > maxBookingDate) return false;
    
    const dateStr = formatDateToYYYYMMDD(date);
    
    // 2. Must not be in host's blocked dates
    if (blockedDates.includes(dateStr)) return false;
    
    // 3. Must be an active working day for host
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = weekdays[date.getDay()];
    if (workingDays[dayName] && !workingDays[dayName].active) {
      return false;
    }
    
    return true;
  };

  const canGoPrev = currentMonth.getMonth() !== today.getMonth() || currentMonth.getFullYear() !== today.getFullYear();
  const canGoNext = currentMonth.getFullYear() < maxBookingDate.getFullYear() || 
                    (currentMonth.getFullYear() === maxBookingDate.getFullYear() && currentMonth.getMonth() < maxBookingDate.getMonth());

  const calendarDays = getCalendarDays();

  return (
    <div style={{
      border: '1px solid hsl(var(--border-color))',
      borderRadius: 'var(--border-radius-md)',
      padding: '20px',
      backgroundColor: 'hsl(var(--bg-secondary))',
      boxShadow: 'var(--shadow-sm)',
      maxWidth: '360px',
      width: '100%',
      margin: '0 auto'
    }}>
      {/* Calendar Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button
          type="button"
          disabled={!canGoPrev}
          onClick={handlePrevMonth}
          style={{
            background: 'none',
            border: '1px solid hsl(var(--border-color))',
            borderRadius: 'var(--border-radius-sm)',
            padding: '6px',
            cursor: !canGoPrev ? 'not-allowed' : 'pointer',
            opacity: !canGoPrev ? 0.3 : 1,
            color: 'hsl(var(--text-primary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition-fast)'
          }}
        >
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontFamily: '"Geist Sans", "Geist Placeholder", sans-serif', fontWeight: 600, fontSize: '0.95rem' }}>
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button
          type="button"
          disabled={!canGoNext}
          onClick={handleNextMonth}
          style={{
            background: 'none',
            border: '1px solid hsl(var(--border-color))',
            borderRadius: 'var(--border-radius-sm)',
            padding: '6px',
            cursor: !canGoNext ? 'not-allowed' : 'pointer',
            opacity: !canGoNext ? 0.3 : 1,
            color: 'hsl(var(--text-primary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition-fast)'
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday Labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '8px' }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((w, idx) => (
          <span key={idx} style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: 'hsl(var(--text-muted))',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '4px 0'
          }}>
            {w}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {calendarDays.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} />;
          }

          const dateValue = formatDateToYYYYMMDD(date);
          const isSelected = selectedDate === dateValue;
          const selectable = isDateSelectable(date);

          return (
            <button
              type="button"
              key={dateValue}
              disabled={!selectable}
              onClick={() => onChange(dateValue)}
              style={{
                height: '36px',
                width: '36px',
                margin: '0 auto',
                borderRadius: '50%',
                border: 'none',
                background: isSelected 
                  ? 'hsl(var(--accent-primary))' 
                  : 'none',
                color: isSelected 
                  ? '#ffffff' 
                  : !selectable 
                    ? 'hsl(var(--text-muted))' 
                    : 'hsl(var(--text-primary))',
                cursor: !selectable ? 'not-allowed' : 'pointer',
                opacity: !selectable ? 0.25 : 1,
                textDecoration: !selectable ? 'line-through' : 'none',
                fontSize: '0.8rem',
                fontWeight: isSelected ? 600 : 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--transition-fast)',
                outline: 'none'
              }}
              className={selectable && !isSelected ? 'calendar-day-hover' : ''}
              // Add a hover background in JS/CSS for normal selectable days
              onMouseEnter={(e) => {
                if (selectable && !isSelected) {
                  e.currentTarget.style.backgroundColor = 'hsl(var(--bg-tertiary))';
                }
              }}
              onMouseLeave={(e) => {
                if (selectable && !isSelected) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '16px', fontSize: '0.75rem', justifyContent: 'center', color: 'hsl(var(--text-secondary))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'hsl(var(--accent-primary))' }}></span>
          <span>Selected</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', border: '1px solid hsl(var(--border-color))', backgroundColor: 'transparent' }}></span>
          <span>Available</span>
        </div>
      </div>
    </div>
  );
}
