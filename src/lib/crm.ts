import { supabase } from './supabase';
import { createNotification } from './db';

// ---- Types ----
export type ContactStatus = 'New' | 'Contacted' | 'Follow-up' | 'Won' | 'Lost';
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
  createdAt?: number;
}
export async function listEventTypes(uid: string): Promise<EventType[]> {
  const { data, error } = await supabase.from('event_types').select('*').eq('user_id', uid).order('created_at', { ascending: true });
  if (error) throw error;
  return data.map(d => ({ ...d, desc: d.description, createdAt: new Date(d.created_at).getTime() }));
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
export async function addEventType(uid: string, data: Omit<EventType, 'id' | 'createdAt'>): Promise<void> {
  const { desc, ...rest } = data;
  const { error } = await supabase.from('event_types').insert({ ...rest, description: desc, user_id: uid });
  if (error) throw error;
}
export async function updateEventType(uid: string, id: string, data: Partial<Omit<EventType, 'id'>>): Promise<void> {
  const dbData: any = { ...data };
  if (data.desc !== undefined) {
    dbData.description = data.desc;
    delete dbData.desc;
  }
  const { error } = await supabase.from('event_types').update(dbData).eq('id', id).eq('user_id', uid);
  if (error) throw error;
}
export async function deleteEventType(uid: string, id: string): Promise<void> {
  const { error } = await supabase.from('event_types').delete().eq('id', id).eq('user_id', uid);
  if (error) throw error;
}

// ---- Bookings ----
export interface Booking {
  id: string;
  name: string; // db: booker_name
  email: string; // db: booker_email
  slot: string;
  event: string; // db: event_title
  status: 'upcoming' | 'past' | 'cancelled';
  meetLink?: string; // db: meet_link
  createdAt?: number;
}
export async function listBookings(uid: string): Promise<Booking[]> {
  const { data, error } = await supabase.from('bookings').select('*').eq('user_id', uid).order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(d => ({
    id: d.id,
    name: d.booker_name,
    email: d.booker_email,
    slot: d.slot,
    event: d.event_title,
    status: d.status as Booking['status'],
    meetLink: d.meet_link,
    createdAt: new Date(d.created_at).getTime()
  }));
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
  const { error } = await supabase.from('bookings').insert({
    user_id: uid,
    booker_name: data.name,
    booker_email: data.email,
    slot: data.slot,
    event_title: data.event,
    event_slug: data.event.toLowerCase().replace(/ /g, '-'),
    status: data.status,
    meet_link: data.meetLink
  });
  if (error) throw error;
}
export async function updateBooking(uid: string, id: string, data: Partial<Omit<Booking, 'id'>>): Promise<void> {
  const dbData: any = {};
  if (data.name) dbData.booker_name = data.name;
  if (data.email) dbData.booker_email = data.email;
  if (data.event) dbData.event_title = data.event;
  if (data.slot) dbData.slot = data.slot;
  if (data.status) dbData.status = data.status;
  if (data.meetLink) dbData.meet_link = data.meetLink;

  const { error } = await supabase.from('bookings').update(dbData).eq('id', id).eq('user_id', uid);
  if (error) throw error;
}
export async function deleteBooking(uid: string, id: string): Promise<void> {
  const { error } = await supabase.from('bookings').delete().eq('id', id).eq('user_id', uid);
  if (error) throw error;
}
