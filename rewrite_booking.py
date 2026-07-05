import re

with open('src/pages/BookingPage.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

# 1. Add new state variables and replace old ones
old_state = """  const [step, setStep] = useState<1 | 2>(1);
  const [selectedDate, setSelectedDate] = useState<number>(30);
  const [selectedDayTab, setSelectedDayTab] = useState<number>(6);
  const [selectedTime, setSelectedTime] = useState<string | null>('9:30 AM');
  const [monthIdx, setMonthIdx] = useState(1);
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');"""

new_state = """  const [step, setStep] = useState<1 | 2>(1);
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<number>(now.getDate());
  const [selectedDayTab, setSelectedDayTab] = useState<number>(now.getDate());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');
  const [bookings, setBookings] = useState<any[]>([]);"""

txt = txt.replace(old_state, new_state)

# 2. Add booking fetch inside loadEvent
old_fetch = """          if (etData) {
            if (!etData.active) return setError('This event type is currently paused.');
            setEventType({ ...etData, desc: etData.description || etData.desc });
            setLoading(false);
            return;
          }"""

new_fetch = """          if (etData) {
            if (!etData.active) return setError('This event type is currently paused.');
            setEventType({ ...etData, desc: etData.description || etData.desc });
            // Fetch bookings
            const { data: bData } = await supabase.from('bookings')
              .select('start_time, end_time')
              .eq('owner_uid', uid)
              .gte('start_time', new Date().toISOString());
            if (bData) setBookings(bData);
            setLoading(false);
            return;
          }"""

txt = txt.replace(old_fetch, new_fetch)

# 3. Handle Book time logic
old_handle_book = """      // Date constructor: new Date(year, monthIndex (0-11), day, hours, minutes)
      // Hardcoding June 2026 for the demo context
      const d = new Date(2026, 5, parseInt(selectedDate.toString(), 10), hr, min);"""

new_handle_book = """      // Date constructor: new Date(year, monthIndex (0-11), day, hours, minutes)
      const d = new Date(currentYear, currentMonth, parseInt(selectedDate.toString(), 10), hr, min);"""

txt = txt.replace(old_handle_book, new_handle_book)

# 4. Remove MONTHS and DAYS_IN_MONTH
txt = txt.replace("const MONTHS = ['May 2026', 'June 2026', 'July 2026'];\nconst DAYS_IN_MONTH = [31, 30, 31];", "")

# 5. Add dynamic date helpers right before return
dynamic_helpers = """
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const currentMonthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });

  const generateTimeSlots = () => {
    const slots = [];
    const durMinutes = parseInt(eventType?.dur || '30');
    let startHr = 9;
    let endHr = 17;
    
    const now = new Date();
    const isToday = currentYear === now.getFullYear() && currentMonth === now.getMonth() && selectedDate === now.getDate();
    
    let currentMin = 0;
    let hr = startHr;
    
    while (hr < endHr) {
      const slotStart = new Date(currentYear, currentMonth, selectedDate, hr, currentMin);
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

  const availableSlots = generateTimeSlots();
  if (loading)"""
txt = txt.replace("if (loading)", dynamic_helpers)

# 6. Replace string renderings of dates
# In summary
txt = txt.replace("{['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDate % 7]}, {MONTHS[monthIdx]?.split(' ')[0] || 'July'} {selectedDate}, 2026", "{new Date(currentYear, currentMonth, selectedDate).toLocaleString('default', { weekday: 'long' })}, {currentMonthName} {selectedDate}, {currentYear}")
txt = txt.replace("{['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDate % 7]}, {MONTHS[monthIdx]?.split(' ')[0] || 'June'} {selectedDate}, 2026", "{new Date(currentYear, currentMonth, selectedDate).toLocaleString('default', { weekday: 'long' })}, {currentMonthName} {selectedDate}, {currentYear}")

# Grid header
txt = txt.replace("<div>{MONTHS[monthIdx] || 'June 2026'}</div>", "<div>{currentMonthName} {currentYear}</div>")

# 7. Replace the calendar grid
old_calendar = """{Array.from({ length: DAYS_IN_MONTH[monthIdx] }, (_, i) => i + 1).map(d => {"""
new_calendar = """{Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map(d => {
                const dateObj = new Date(currentYear, currentMonth, d);
                const isPast = dateObj < new Date(new Date().setHours(0,0,0,0));
                if (isPast) return <div key={d} style={{ padding: '8px 0', opacity: 0.3, textAlign: 'center' }}>{d}</div>;
"""
txt = txt.replace(old_calendar, new_calendar)

# 8. Replace dynamic time slots UI
old_slots_ui = """            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
            </div>"""

new_slots_ui = """            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                      border: selectedTime === slot.time12 ? '1px solid #0E61F3' : '1px solid #e2e8f0',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0E61F3', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0f172a' }}>{timeStr}</span>
                  </div>
                  {selectedTime === slot.time12 && (
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
              )})}
            </div>"""

txt = txt.replace(old_slots_ui, new_slots_ui)

with open('src/pages/BookingPage.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)
