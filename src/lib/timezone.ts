/**
 * Timezone helpers for the scheduling application.
 */

/**
 * Gets the current visitor timezone.
 */
export function getLocalTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  } catch (e) {
    return 'Asia/Kolkata';
  }
}

/**
 * Popular timezones list for selection in the admin dashboard.
 */
export const POPULAR_TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST - UTC+5:30)' },
  { value: 'America/New_York', label: 'Eastern Standard Time (EST - UTC-5)' },
  { value: 'America/Chicago', label: 'Central Standard Time (CST - UTC-6)' },
  { value: 'America/Denver', label: 'Mountain Standard Time (MST - UTC-7)' },
  { value: 'America/Los_Angeles', label: 'Pacific Standard Time (PST - UTC-8)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT / BST - UTC+0/+1)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET - UTC+1)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST - UTC+9)' },
  { value: 'Asia/Singapore', label: 'Singapore Standard Time (SGT - UTC+8)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AEST - UTC+10)' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
];

/**
 * Checks if a specific time slot on a selected date is in the past,
 * relative to the current time in the host/event timezone.
 * 
 * @param selectedDate YYYY-MM-DD date string
 * @param slotValue e.g. "09:00 AM - 09:30 AM" or "09:00 AM"
 * @param timezone The target timezone string
 */
export function isSlotInPast(selectedDate: string, slotValue: string, timezone: string): boolean {
  if (!selectedDate) return false;

  try {
    const now = new Date();
    
    // Format current time in the target timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const partMap: Record<string, string> = {};
    parts.forEach((p) => {
      partMap[p.type] = p.value;
    });

    // target timezone date string "YYYY-MM-DD"
    const tzTodayStr = `${partMap.year}-${partMap.month}-${partMap.day}`;

    // If selected date is in the past relative to target timezone today
    if (selectedDate < tzTodayStr) {
      return true;
    }

    // If selected date is in the future
    if (selectedDate > tzTodayStr) {
      return false;
    }

    // Selected date is today in target timezone, compare hours and minutes
    const currentHour = parseInt(partMap.hour, 10);
    const currentMinute = parseInt(partMap.minute, 10);

    // Extract start time of slot, e.g. "09:00 AM" from "09:00 AM - 09:30 AM"
    const startTimeStr = slotValue.split(' - ')[0]; // e.g. "09:00 AM"
    
    let startHour = 0;
    let startMinute = 0;

    const match = startTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      let hr = parseInt(match[1], 10);
      const min = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();

      if (ampm === 'PM' && hr !== 12) {
        hr += 12;
      } else if (ampm === 'AM' && hr === 12) {
        hr = 0;
      }
      
      startHour = hr;
      startMinute = min;
    } else {
      return false;
    }

    if (currentHour > startHour) {
      return true;
    }
    if (currentHour === startHour && currentMinute >= startMinute) {
      return true;
    }

    return false;
  } catch (e) {
    console.error('Error in isSlotInPast calculation:', e);
    return false;
  }
}

/**
 * Formats YYYY-MM-DD date into a readable client date
 */
export function formatSelectedDate(dateStr: string): string {
  if (!dateStr) return 'Select preferred date...';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }
  return dateStr;
}

/**
 * Simple helper to format standard time slots
 */
export function generateTimeSlots(intervalMinutes: number = 30): string[] {
  const slots: string[] = [];
  const startHour = 9; // 9:00 AM
  const endHour = 18;  // 6:00 PM (starts at 5:30 PM)

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minutes = 0; minutes < 60; minutes += intervalMinutes) {
      const getHour12 = (h: number) => {
        const h12 = h % 12;
        return h12 === 0 ? 12 : h12;
      };
      
      const getAmPm = (h: number) => (h >= 12 ? 'PM' : 'AM');
      
      const formatTime = (h: number, m: number) => {
        const hStr = String(getHour12(h)).padStart(2, '0');
        const mStr = String(m).padStart(2, '0');
        return `${hStr}:${mStr} ${getAmPm(h)}`;
      };
      
      const slotStart = formatTime(hour, minutes);
      
      // Calculate end time
      let nextHour = hour + Math.floor((minutes + intervalMinutes) / 60);
      let nextMinutes = (minutes + intervalMinutes) % 60;
      const slotEnd = formatTime(nextHour, nextMinutes);
      
      slots.push(`${slotStart} - ${slotEnd}`);
    }
  }

  return slots;
}

/**
 * Converts a slot time (e.g. "09:00 AM") from a host timezone to a visitor timezone on a specific date.
 */
export function convertHostSlotToVisitor(
  dateStr: string,
  slotTime: string,
  hostTz: string,
  visitorTz: string
): string {
  try {
    const match = slotTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return slotTime;
    let hr = parseInt(match[1], 10);
    const min = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hr !== 12) hr += 12;
    if (ampm === 'AM' && hr === 12) hr = 0;

    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    // Create reference local date
    const date = new Date(year, month, day, hr, min, 0);
    
    // Formatter to read calendar representation in Host Timezone
    const hostFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: hostTz,
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      hour12: false
    });
    
    // Formatter to print calendar representation in Visitor Timezone
    const visitorFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: visitorTz,
      hour: 'numeric', minute: 'numeric',
      hour12: true
    });
    
    // Iteratively adjust local date timestamp until formatting yields the target host date-time
    let targetTime = date.getTime();
    let iterations = 0;
    while (iterations < 5) {
      const formatted = hostFormatter.format(new Date(targetTime));
      const [, tPart] = formatted.split(', ');
      const [hStr, minStr] = tPart.split(':');
      
      const currentHr = parseInt(hStr, 10);
      const currentMin = parseInt(minStr, 10);
      
      const hrDiff = hr - currentHr;
      const minDiff = min - currentMin;
      
      if (hrDiff === 0 && minDiff === 0) break;
      
      targetTime += (hrDiff * 3600000) + (minDiff * 60000);
      iterations++;
    }
    
    return visitorFormatter.format(new Date(targetTime));
  } catch (e) {
    return slotTime;
  }
}

