import { supabase } from './supabase';
import { createNotification } from './db';

// ---- Types ----
export type ContactStatus = 'New' | 'Contacted' | 'Follow up' | 'Converted' | 'Lost';
export interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: ContactStatus;
  source?: string;
  nextFollowUp?: string;
  createdAt?: number; // mapped from created_at in Supabase for frontend compat
}

export type DealStage = 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won';
export interface Deal {
  id: string;
  company: string;
  amount: number;
  stage: DealStage;
  contact?: string;
  createdAt?: number;
}

// ---- Contacts ----
export async function listContacts(uid: string): Promise<Contact[]> {
  const { data, error } = await supabase.from('contacts').select('*').eq('user_id', uid).order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(d => ({ ...d, createdAt: new Date(d.created_at).getTime() }));
}
export function listenContacts(uid: string, cb: (data: Contact[]) => void) {
  listContacts(uid).then(cb).catch(console.error);

  const channel = supabase.channel(`contacts_${uid}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts', filter: `user_id=eq.${uid}` }, () => {
      listContacts(uid).then(cb).catch(console.error);
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
export async function addContact(uid: string, data: Omit<Contact, 'id' | 'createdAt'>): Promise<void> {
  const { error } = await supabase.from('contacts').insert({ ...data, user_id: uid });
  if (error) throw error;
  
  await createNotification({
    user_id: uid,
    title: 'New contact added',
    description: `${data.name} joined your list`,
    target: 'people',
    type: 'user-plus'
  }).catch(console.error);
}
export async function updateContact(uid: string, id: string, data: Partial<Omit<Contact, 'id'>>): Promise<void> {
  const { error } = await supabase.from('contacts').update(data).eq('id', id).eq('user_id', uid);
  if (error) throw error;
}
export async function deleteContact(uid: string, id: string): Promise<void> {
  const { error } = await supabase.from('contacts').delete().eq('id', id).eq('user_id', uid);
  if (error) throw error;
}

// ---- Deals ----
// (Not added to SQL schema yet, using local dummy for now or we can map to a new table. 
//  Since Deals wasn't in the schema, we'll return empty array to prevent crashing until they add it)
export async function listDeals(_uid: string): Promise<Deal[]> {
  return [];
}
export async function addDeal(_uid: string, _data: Omit<Deal, 'id' | 'createdAt'>): Promise<void> {}
export async function updateDeal(_uid: string, _id: string, _data: Partial<Omit<Deal, 'id'>>): Promise<void> {}
export async function deleteDeal(_uid: string, _id: string): Promise<void> {}

// ---- Event Types ----
export interface EventType {
  id: string;
  title: string;
  dur: string;
  slug: string;
  desc: string;
  active: boolean;
  redirectUrl?: string;
  replyToEmail?: string;
  allowedLayouts?: string[];
  defaultLayout?: string;
  formSettings?: any;
  location?: string;
  eventColor?: string;
  interfaceLang?: string;
  interface_lang?: string;
  event_color?: string;
  createdAt?: number;
}
export async function listEventTypes(uid: string): Promise<EventType[]> {
  try {
    const { data, error } = await supabase.from('event_types').select('*').eq('user_id', uid).order('created_at', { ascending: true });
    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(d => ({
        ...d,
        dur: d.duration || d.dur || '15 Minutes',
        desc: d.description || d.desc || '',
        redirectUrl: d.redirect_url,
        replyToEmail: d.reply_to_email,
        allowedLayouts: d.allowed_layouts ? (typeof d.allowed_layouts === 'string' ? d.allowed_layouts.split(',') : d.allowed_layouts) : ['Month'],
        defaultLayout: d.default_layout || 'Month',
        formSettings: d.form_settings,
        createdAt: new Date(d.created_at || Date.now()).getTime()
      }));
    }
  } catch (err) {
    console.warn('Supabase listEventTypes error, falling back to localStorage:', err);
  }
  const raw = localStorage.getItem('sm_event_types') || localStorage.getItem('linksmeet_event_types');
  return raw ? JSON.parse(raw) : [];
}
export function listenEventTypes(uid: string, cb: (data: EventType[]) => void) {
  // Initial fetch
  listEventTypes(uid).then(cb).catch(console.error);

  const channel = supabase.channel(`event_types_${uid}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'event_types', filter: `user_id=eq.${uid}` }, () => {
      listEventTypes(uid).then(cb).catch(console.error);
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
export async function addEventType(uid: string, data: any): Promise<void> {
  const newEv = {
    id: data.id || Math.random().toString(36).substring(2, 9),
    title: data.title || 'Untitled Meeting',
    slug: data.slug || `meeting-${Date.now()}`,
    dur: data.dur || data.duration || '15 Minutes',
    desc: data.desc !== undefined ? data.desc : (data.description || ''),
    active: data.active ?? true,
    location: data.location,
    createdAt: Date.now()
  };

  try {
    const raw = localStorage.getItem('sm_event_types') || localStorage.getItem('linksmeet_event_types');
    const list = raw ? JSON.parse(raw) : [];
    const next = [newEv, ...list];
    localStorage.setItem('sm_event_types', JSON.stringify(next));
    localStorage.setItem('linksmeet_event_types', JSON.stringify(next));
  } catch (e) {
    console.error('Local storage save error:', e);
  }

  if (!uid || uid === 'anon') return;

  const dbRecord: any = {
    user_id: uid,
    title: newEv.title,
    slug: newEv.slug,
    dur: newEv.dur,
    description: newEv.desc,
    active: newEv.active,
    reply_to_email: data.replyToEmail,
    allowed_layouts: data.allowedLayouts ? data.allowedLayouts.join(',') : undefined,
    default_layout: data.defaultLayout,
    form_settings: data.formSettings
  };
  if (data.redirectUrl !== undefined) dbRecord.redirect_url = data.redirectUrl;
  if (newEv.location !== undefined) {
    dbRecord.location = newEv.location;
  }
  try {
    const { error } = await supabase.from('event_types').insert(dbRecord);
    if (error) {
      if (error.message?.includes('location') || error.message?.includes('column')) {
        delete dbRecord.location;
        await supabase.from('event_types').insert(dbRecord);
      }
    }
  } catch (err) {
    console.warn('Supabase addEventType error:', err);
  }
}
export async function updateEventType(uid: string, id: string, data: any): Promise<void> {
  try {
    const raw = localStorage.getItem('sm_event_types') || localStorage.getItem('linksmeet_event_types');
    const list: any[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(e => e.id === id || e.slug === id);
    if (idx > -1) {
      list[idx] = { ...list[idx], ...data, dur: data.dur || data.duration || list[idx].dur, desc: data.desc !== undefined ? data.desc : (data.description !== undefined ? data.description : list[idx].desc) };
      localStorage.setItem('sm_event_types', JSON.stringify(list));
      localStorage.setItem('linksmeet_event_types', JSON.stringify(list));
    }
  } catch (e) {
    console.error('Local storage update error:', e);
  }

  if (!uid || uid === 'anon') return;
  const dbData: any = {};
  if (data.title !== undefined) dbData.title = data.title;
  if (data.slug !== undefined) dbData.slug = data.slug;
  if (data.dur !== undefined || data.duration !== undefined) dbData.dur = data.dur || data.duration;
  if (data.desc !== undefined || data.description !== undefined) dbData.description = data.desc !== undefined ? data.desc : data.description;
  if (data.active !== undefined) dbData.active = data.active;
  if (data.location !== undefined) dbData.location = data.location;
  if (data.redirectUrl !== undefined) dbData.redirect_url = data.redirectUrl;
  if (data.replyToEmail !== undefined) dbData.reply_to_email = data.replyToEmail;
  if (data.allowedLayouts !== undefined) dbData.allowed_layouts = Array.isArray(data.allowedLayouts) ? data.allowedLayouts.join(',') : data.allowedLayouts;
  if (data.defaultLayout !== undefined) dbData.default_layout = data.defaultLayout;
  if (data.formSettings !== undefined) dbData.form_settings = data.formSettings;

  try {
    const { error } = await supabase.from('event_types').update(dbData).eq('id', id).eq('user_id', uid);
    if (error) {
      if (error.message?.includes('location') || error.message?.includes('column')) {
        delete dbData.location;
        await supabase.from('event_types').update(dbData).eq('id', id).eq('user_id', uid);
      }
    }
  } catch (err) {
    console.warn('Supabase updateEventType error:', err);
  }
}
export async function deleteEventType(uid: string, id: string): Promise<void> {
  try {
    const raw = localStorage.getItem('sm_event_types') || localStorage.getItem('linksmeet_event_types');
    const list: any[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(e => e.id !== id && e.slug !== id);
    localStorage.setItem('sm_event_types', JSON.stringify(filtered));
    localStorage.setItem('linksmeet_event_types', JSON.stringify(filtered));
  } catch (e) {
    console.error('Local storage delete error:', e);
  }

  if (!uid || uid === 'anon') return;
  try {
    await supabase.from('event_types').delete().eq('id', id).eq('user_id', uid);
  } catch (err) {
    console.warn('Supabase deleteEventType error:', err);
  }
}

// ---- Bookings ----
export interface Booking {
  id: string;
  name: string; // db: booker_name
  email: string; // db: booker_email
  slot: string;
  event: string; // db: event_title
  status: 'upcoming' | 'past' | 'cancelled' | 'rescheduled';
  meetLink?: string; // db: meet_link
  createdAt?: number;
}
export async function listBookings(uid: string): Promise<Booking[]> {
  try {
    const { data, error } = await supabase.from('bookings').select('*').eq('user_id', uid).order('created_at', { ascending: false });
    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(d => {
        let realStatus = d.status as Booking['status'];
        if (realStatus === 'upcoming' && d.slot) {
          try {
            const dateStr = d.slot.split('-')[0].replace('·', '').trim();
            const parsedTime = new Date(dateStr).getTime();
            if (!isNaN(parsedTime) && parsedTime < Date.now()) {
              realStatus = 'past';
            }
          } catch(e) {}
        }
        return {
          id: d.id,
          name: d.booker_name,
          email: d.booker_email,
          slot: d.slot,
          event: d.event_title,
          status: realStatus,
          meetLink: d.meet_link,
          createdAt: new Date(d.created_at).getTime()
        };
      });
    }
  } catch (err) {
    console.warn('Supabase listBookings error, falling back to localStorage:', err);
  }
  const raw = localStorage.getItem('sm_bookings') || localStorage.getItem('linksmeet_bookings');
  const localList = raw ? JSON.parse(raw) : [];
  return localList.map((b: any) => {
    let realStatus = b.status;
    if (realStatus === 'upcoming' && b.slot) {
      try {
        const dateStr = b.slot.split('-')[0].replace('·', '').trim();
        const parsedTime = new Date(dateStr).getTime();
        if (!isNaN(parsedTime) && parsedTime < Date.now()) {
          realStatus = 'past';
        }
      } catch(e) {}
    }
    return { ...b, status: realStatus };
  });
}
export function listenBookings(uid: string, cb: (data: Booking[]) => void) {
  // Initial fetch
  listBookings(uid).then(cb).catch(console.error);

  const channel = supabase.channel(`bookings_${uid}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `user_id=eq.${uid}` }, () => {
      listBookings(uid).then(cb).catch(console.error);
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
export async function addBooking(uid: string, data: Omit<Booking, 'id' | 'createdAt'>): Promise<void> {
  const newB: Booking = { ...data, id: Math.random().toString(36).substring(2, 11), createdAt: Date.now() };
  try {
    const raw = localStorage.getItem('sm_bookings') || localStorage.getItem('linksmeet_bookings');
    const list = raw ? JSON.parse(raw) : [];
    const next = [newB, ...list];
    localStorage.setItem('sm_bookings', JSON.stringify(next));
    localStorage.setItem('linksmeet_bookings', JSON.stringify(next));
  } catch (e) {
    console.error('Local storage save booking error:', e);
  }

  if (!uid || uid === 'anon') return;
  try {
    await supabase.from('bookings').insert({
      user_id: uid,
      booker_name: data.name,
      booker_email: data.email,
      slot: data.slot,
      event_title: data.event,
      event_slug: data.event.toLowerCase().replace(/ /g, '-'),
      status: data.status,
      meet_link: data.meetLink
    });
  } catch (err) {
    console.warn('Supabase addBooking error:', err);
  }
}
export async function updateBooking(uid: string, id: string, data: Partial<Omit<Booking, 'id'>>): Promise<void> {
  try {
    const raw = localStorage.getItem('sm_bookings') || localStorage.getItem('linksmeet_bookings');
    const list: Booking[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(b => b.id === id || (b as any).name === id);
    if (idx > -1) {
      list[idx] = { ...list[idx], ...data };
      localStorage.setItem('sm_bookings', JSON.stringify(list));
      localStorage.setItem('linksmeet_bookings', JSON.stringify(list));
    }
  } catch (e) {
    console.error('Local storage update booking error:', e);
  }

  if (!uid || uid === 'anon') return;
  const dbData: any = {};
  if (data.name) dbData.booker_name = data.name;
  if (data.email) dbData.booker_email = data.email;
  if (data.event) dbData.event_title = data.event;
  if (data.slot) dbData.slot = data.slot;
  if (data.status) dbData.status = data.status;
  if (data.meetLink) dbData.meet_link = data.meetLink;

  try {
    await supabase.from('bookings').update(dbData).eq('id', id).eq('user_id', uid);
  } catch (err) {
    console.warn('Supabase updateBooking error:', err);
  }
}
export async function deleteBooking(uid: string, id: string): Promise<void> {
  try {
    const raw = localStorage.getItem('sm_bookings') || localStorage.getItem('linksmeet_bookings');
    const list: Booking[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(b => b.id !== id && (b as any).name !== id);
    localStorage.setItem('sm_bookings', JSON.stringify(filtered));
    localStorage.setItem('linksmeet_bookings', JSON.stringify(filtered));
  } catch (e) {
    console.error('Local storage delete booking error:', e);
  }

  if (!uid || uid === 'anon') return;
  try {
    await supabase.from('bookings').delete().eq('id', id).eq('user_id', uid);
  } catch (err) {
    console.warn('Supabase deleteBooking error:', err);
  }
}
