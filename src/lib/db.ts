// @ts-nocheck
// Expantra DB (Legacy)
export interface EventType {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  color: string;    // CSS class or hex
  active: boolean;
}


export interface Booking {
  id: string;
  eventTypeId: string;
  eventTitle: string;
  eventDuration: number;
  name: string;
  email: string;
  message?: string;
  date: string;     // YYYY-MM-DD
  time: string;     // e.g. "09:00 AM - 09:30 AM"
  timezone: string; // guest timezone
  meetLink: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Availability {
  timezone: string;
  workingDays: {
    [key: string]: {
      active: boolean;
      slots: { start: string; end: string }[]; // e.g. [{start: "09:00", end: "17:00"}]
    }
  };
  blockedDates: string[]; // YYYY-MM-DD
}

export interface IntegrationSettings {
  isLiveMode: boolean;
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  emailJsConfig: {
    serviceId: string;
    publicKey: string;
    templateCompanyId: string;
    templateClientId: string;
  };
}

// ----------------------------------------------------
// DEFAULT SEED DATA
// ----------------------------------------------------
const DEFAULT_EVENT_TYPES: EventType[] = [
  {
    id: 'discovery-call',
    title: '30-Min Discovery Call',
    description: 'A friendly introductory chat to explore your project requirements, goals, timeline, and how we can support your business.',
    duration: 30,
    color: 'blue',
    active: true,
  },
  {
    id: 'tech-consultation',
    title: '60-Min Deep Dive Sync',
    description: 'A comprehensive technical session to review system architecture, codebase design patterns, or troubleshooting complex engineering blocks.',
    duration: 60,
    color: 'purple',
    active: true,
  },
  {
    id: 'quick-alignment',
    title: '15-Min Quick Sync',
    description: 'A rapid catch-up, status check-in, or alignment session for existing projects or urgent queries.',
    duration: 15,
    color: 'green',
    active: true,
  }
];

const DEFAULT_AVAILABILITY: Availability = {
  timezone: 'Asia/Kolkata',
  workingDays: {
    monday: { active: true, slots: [{ start: '09:00', end: '18:00' }] },
    tuesday: { active: true, slots: [{ start: '09:00', end: '18:00' }] },
    wednesday: { active: true, slots: [{ start: '09:00', end: '18:00' }] },
    thursday: { active: true, slots: [{ start: '09:00', end: '18:00' }] },
    friday: { active: true, slots: [{ start: '09:00', end: '18:00' }] },
    saturday: { active: false, slots: [{ start: '09:00', end: '13:00' }] },
    sunday: { active: false, slots: [{ start: '09:00', end: '13:00' }] },
  },
  blockedDates: [],
};

const DEFAULT_INTEGRATION_SETTINGS: IntegrationSettings = {
  isLiveMode: false,
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  },
  emailJsConfig: {
    serviceId: '',
    publicKey: '',
    templateCompanyId: '',
    templateClientId: '',
  }
};

// ----------------------------------------------------
// DYNAMIC FIREBASE INITIALIZER
// ----------------------------------------------------
let firebaseDb: any = null;

function getFirebaseDb(settings: IntegrationSettings) {
  return null;
}

// Reset cached database instance (called when settings are saved)
export function resetFirebaseDbCache() {
  firebaseDb = null;
}

// ----------------------------------------------------
// SETTINGS OPERATIONS
// ----------------------------------------------------
export function fetchIntegrationSettings(): IntegrationSettings {
  try {
    const raw = localStorage.getItem('linksmeet_settings');
    if (!raw) {
      // Check environment variables as fallback
      const envSettings: IntegrationSettings = {
        isLiveMode: import.meta.env.VITE_LIVE_MODE === 'true',
        firebaseConfig: {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
          appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
        },
        emailJsConfig: {
          serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
          publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
          templateCompanyId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID_COMPANY || '',
          templateClientId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CLIENT || '',
        }
      };
      
      // If we have some env configuration, default to that
      if (envSettings.firebaseConfig.apiKey) {
        return envSettings;
      }
      return DEFAULT_INTEGRATION_SETTINGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_INTEGRATION_SETTINGS;
  }
}

export function saveIntegrationSettings(settings: IntegrationSettings): void {
  localStorage.setItem('linksmeet_settings', JSON.stringify(settings));
  resetFirebaseDbCache();
}

export async function testIntegrationSettings(settings: IntegrationSettings): Promise<{ success: boolean; message: string }> {
  const config = settings.firebaseConfig;
  const isConfigured = !!(config.apiKey && config.projectId && config.appId);
  
  if (!isConfigured) {
    return { success: false, message: 'Firebase configuration is incomplete. Please fill API Key, Project ID, and App ID.' };
  }
  
  try {
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    const db = getFirestore(app);
    const col = collection(db, 'event_types');
    await getDocs(col);
    return { success: true, message: 'Connected successfully! Firebase Firestore credentials verified.' };
  } catch (error: any) {
    console.error('Firebase connection verification failed:', error);
    return { success: false, message: `Verification failed: ${error?.message || 'Check configuration details.'}` };
  }
}

// ----------------------------------------------------
// EVENT TYPES OPERATIONS
// ----------------------------------------------------
export async function fetchEventTypes(): Promise<EventType[]> {
  const settings = fetchIntegrationSettings();
  const db = getFirebaseDb(settings);

  if (db) {
    try {
      const col = collection(db, 'event_types');
      const snapshot = await getDocs(col);
      const events: EventType[] = [];
      snapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() } as EventType);
      });
      
      if (events.length > 0) return events;
      // If Firestore collection is empty, seed it with defaults
      for (const ev of DEFAULT_EVENT_TYPES) {
        await setDoc(doc(col, ev.id), {
          title: ev.title,
          description: ev.description,
          duration: ev.duration,
          color: ev.color,
          active: ev.active
        });
      }
      return DEFAULT_EVENT_TYPES;
    } catch (e) {
      console.warn('[Firebase] Failed to fetch event types. Falling back to local storage:', e);
    }
  }

  // Local Storage Fallback
  const raw = localStorage.getItem('linksmeet_event_types');
  if (!raw) {
    localStorage.setItem('linksmeet_event_types', JSON.stringify(DEFAULT_EVENT_TYPES));
    return DEFAULT_EVENT_TYPES;
  }
  return JSON.parse(raw);
}

export async function saveEventType(event: EventType): Promise<void> {
  const settings = fetchIntegrationSettings();
  const db = getFirebaseDb(settings);

  if (db) {
    try {
      const col = collection(db, 'event_types');
      await setDoc(doc(col, event.id), {
        title: event.title,
        description: event.description,
        duration: event.duration,
        color: event.color,
        active: event.active
      });
      return;
    } catch (e) {
      console.warn('[Firebase] Save event failed. Saving to local storage:', e);
    }
  }

  // Local Storage
  const events = await fetchEventTypes();
  const existingIndex = events.findIndex(e => e.id === event.id);
  if (existingIndex > -1) {
    events[existingIndex] = event;
  } else {
    events.push(event);
  }
  localStorage.setItem('linksmeet_event_types', JSON.stringify(events));
}

export async function deleteEventType(id: string): Promise<void> {
  const settings = fetchIntegrationSettings();
  const db = getFirebaseDb(settings);

  if (db) {
    try {
      const col = collection(db, 'event_types');
      await deleteDoc(doc(col, id));
      return;
    } catch (e) {
      console.warn('[Firebase] Delete event failed. Deleting from local storage:', e);
    }
  }

  // Local Storage
  const events = await fetchEventTypes();
  const filtered = events.filter(e => e.id !== id);
  localStorage.setItem('linksmeet_event_types', JSON.stringify(filtered));
}

// ----------------------------------------------------
// AVAILABILITY OPERATIONS
// ----------------------------------------------------
export async function fetchAvailability(): Promise<Availability> {
  const settings = fetchIntegrationSettings();
  const db = getFirebaseDb(settings);

  if (db) {
    try {
      const docRef = doc(db, 'settings', 'availability');
      const snapshot = await getDocs(query(collection(db, 'settings')));
      let data: any = null;
      snapshot.forEach(d => {
        if (d.id === 'availability') data = d.data();
      });
      
      if (data) return data as Availability;
      
      // Seed if missing
      await setDoc(docRef, DEFAULT_AVAILABILITY);
      return DEFAULT_AVAILABILITY;
    } catch (e) {
      console.warn('[Firebase] Fetch availability failed. Falling back to local storage:', e);
    }
  }

  // Local Storage
  const raw = localStorage.getItem('linksmeet_availability');
  if (!raw) {
    localStorage.setItem('linksmeet_availability', JSON.stringify(DEFAULT_AVAILABILITY));
    return DEFAULT_AVAILABILITY;
  }
  return JSON.parse(raw);
}

export async function saveAvailability(availability: Availability): Promise<void> {
  const settings = fetchIntegrationSettings();
  const db = getFirebaseDb(settings);

  if (db) {
    try {
      const docRef = doc(db, 'settings', 'availability');
      await setDoc(docRef, availability);
      return;
    } catch (e) {
      console.warn('[Firebase] Save availability failed. Saving to local storage:', e);
    }
  }

  // Local Storage
  localStorage.setItem('linksmeet_availability', JSON.stringify(availability));
}

// ----------------------------------------------------
// BOOKINGS OPERATIONS
// ----------------------------------------------------
export async function fetchBookings(): Promise<Booking[]> {
  const settings = fetchIntegrationSettings();
  const db = getFirebaseDb(settings);

  if (db) {
    try {
      const col = collection(db, 'bookings');
      const snapshot = await getDocs(col);
      const bookings: Booking[] = [];
      snapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() } as Booking);
      });
      // Sort bookings by date and time
      return bookings.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      });
    } catch (e) {
      console.warn('[Firebase] Fetch bookings failed. Falling back to local storage:', e);
    }
  }

  // Local Storage
  const raw = localStorage.getItem('linksmeet_bookings');
  const bookings: Booking[] = raw ? JSON.parse(raw) : [];
  return bookings.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });
}

export async function fetchBookedSlotsForDate(dateString: string): Promise<string[]> {
  const bookings = await fetchBookings();
  return bookings
    .filter(b => b.date === dateString && b.status !== 'cancelled')
    .map(b => b.time);
}

export async function saveBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<Booking> {
  const settings = fetchIntegrationSettings();
  const db = getFirebaseDb(settings);
  
  const newId = Math.random().toString(36).substring(2, 11);
  const newBooking: Booking = {
    ...booking,
    id: newId,
    status: 'upcoming',
    createdAt: new Date().toISOString()
  };

  // Check double-booking
  const bookedSlots = await fetchBookedSlotsForDate(booking.date);
  if (bookedSlots.includes(booking.time)) {
    throw new Error('This time slot is already booked. Please select another time slot.');
  }

  if (db) {
    try {
      const col = collection(db, 'bookings');
      await setDoc(doc(col, newId), newBooking);
      return newBooking;
    } catch (e) {
      console.warn('[Firebase] Save booking failed. Falling back to local storage:', e);
    }
  }

  // Local Storage
  const raw = localStorage.getItem('linksmeet_bookings');
  const bookings: Booking[] = raw ? JSON.parse(raw) : [];
  bookings.push(newBooking);
  localStorage.setItem('linksmeet_bookings', JSON.stringify(bookings));
  return newBooking;
}

export async function cancelBooking(id: string): Promise<void> {
  const settings = fetchIntegrationSettings();
  const db = getFirebaseDb(settings);

  if (db) {
    try {
      const docRef = doc(db, 'bookings', id);
      await updateDoc(docRef, { status: 'cancelled' });
      return;
    } catch (e) {
      console.warn('[Firebase] Cancel booking failed. Cancelling locally:', e);
    }
  }

  // Local Storage
  const raw = localStorage.getItem('linksmeet_bookings');
  const bookings: Booking[] = raw ? JSON.parse(raw) : [];
  const existing = bookings.find(b => b.id === id);
  if (existing) {
    existing.status = 'cancelled';
    localStorage.setItem('linksmeet_bookings', JSON.stringify(bookings));
  }
}
