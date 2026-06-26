import {
  collection, doc, addDoc, getDocs, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, setDoc
} from 'firebase/firestore';
import { requireDb } from './firebase';

// ---- Types ----
// A "lead" is a person who booked through the embedded widget (or was added
// manually). The status tracks the follow-up lifecycle.
export type ContactStatus = 'New' | 'Contacted' | 'Follow-up' | 'Won' | 'Lost';
export interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: ContactStatus;
  source?: string;        // e.g. "Booking · Discovery Call" or "Manual"
  nextFollowUp?: string;  // YYYY-MM-DD
  createdAt?: number;
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

// All data is namespaced per user: users/{uid}/{collection}/{docId}
const userCol = (uid: string, name: string) => collection(requireDb(), 'users', uid, name);
const userDoc = (uid: string, name: string, id: string) => doc(requireDb(), 'users', uid, name, id);

// ---- Contacts ----
export async function listContacts(uid: string): Promise<Contact[]> {
  const snap = await getDocs(query(userCol(uid, 'contacts'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Contact, 'id'>) }));
}
export async function addContact(uid: string, data: Omit<Contact, 'id' | 'createdAt'>): Promise<void> {
  await addDoc(userCol(uid, 'contacts'), { ...data, createdAt: Date.now(), createdAtServer: serverTimestamp() });
}
export async function updateContact(uid: string, id: string, data: Partial<Omit<Contact, 'id'>>): Promise<void> {
  await updateDoc(userDoc(uid, 'contacts', id), data);
}
export async function deleteContact(uid: string, id: string): Promise<void> {
  await deleteDoc(userDoc(uid, 'contacts', id));
}

// ---- Deals ----
export async function listDeals(uid: string): Promise<Deal[]> {
  const snap = await getDocs(query(userCol(uid, 'deals'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Deal, 'id'>) }));
}
export async function addDeal(uid: string, data: Omit<Deal, 'id' | 'createdAt'>): Promise<void> {
  await addDoc(userCol(uid, 'deals'), { ...data, createdAt: Date.now(), createdAtServer: serverTimestamp() });
}
export async function updateDeal(uid: string, id: string, data: Partial<Omit<Deal, 'id'>>): Promise<void> {
  await updateDoc(userDoc(uid, 'deals', id), data);
}
export async function deleteDeal(uid: string, id: string): Promise<void> {
  await deleteDoc(userDoc(uid, 'deals', id));
}

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
  const snap = await getDocs(query(userCol(uid, 'eventTypes'), orderBy('createdAt', 'asc')));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<EventType, 'id'>) }));
}
export async function addEventType(uid: string, data: Omit<EventType, 'id' | 'createdAt'>): Promise<void> {
  await setDoc(userDoc(uid, 'eventTypes', data.slug), { ...data, createdAt: Date.now(), createdAtServer: serverTimestamp() });
}
export async function updateEventType(uid: string, id: string, data: Partial<Omit<EventType, 'id'>>): Promise<void> {
  await updateDoc(userDoc(uid, 'eventTypes', id), data);
}
export async function deleteEventType(uid: string, id: string): Promise<void> {
  await deleteDoc(userDoc(uid, 'eventTypes', id));
}

// ---- Bookings ----
export interface Booking {
  id: string;
  name: string;
  email: string;
  slot: string;
  event: string;
  status: 'upcoming' | 'past' | 'cancelled';
  meetLink?: string;
  createdAt?: number;
}
export async function listBookings(uid: string): Promise<Booking[]> {
  const snap = await getDocs(query(userCol(uid, 'bookings'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Booking, 'id'>) }));
}
export async function addBooking(uid: string, data: Omit<Booking, 'id' | 'createdAt'>): Promise<void> {
  await addDoc(userCol(uid, 'bookings'), { ...data, createdAt: Date.now(), createdAtServer: serverTimestamp() });
}
export async function updateBooking(uid: string, id: string, data: Partial<Omit<Booking, 'id'>>): Promise<void> {
  await updateDoc(userDoc(uid, 'bookings', id), data);
}
export async function deleteBooking(uid: string, id: string): Promise<void> {
  await deleteDoc(userDoc(uid, 'bookings', id));
}
