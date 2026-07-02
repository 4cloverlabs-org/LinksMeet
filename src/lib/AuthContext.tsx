import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { setGmailToken, markGmailConnected, clearGmail } from './gmailToken';
// import { campaignEngine } from '../components/campaigns/campaignEngine';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = !!import.meta.env.VITE_SUPABASE_URL;

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const checkAndClearData = (currentUser: User | null) => {
      if (!currentUser) return;
      const lastUid = localStorage.getItem('sm_last_uid');
      if (lastUid && lastUid !== currentUser.id) {
        const keysToClear = [
          'sm_campaigns', 'sm_sent_logs', 'sm_threads', 'sm_campaign_settings',
          'linksmeet_settings', 'linksmeet_event_types', 'linksmeet_availability', 'linksmeet_bookings',
          'sm_gmail_email', 'sm_last_uid'
        ];
        keysToClear.forEach(key => localStorage.removeItem(key));
        localStorage.setItem('sm_last_uid', currentUser.id);
        window.location.reload();
      } else if (!lastUid) {
        localStorage.setItem('sm_last_uid', currentUser.id);
      }
    };

    // Get initial session which parses the URL hash if returning from Google
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        checkAndClearData(session?.user ?? null);
        setUser(session?.user ?? null);
        if (session?.provider_token) {
          // Keep the live token in memory only (never localStorage).
          setGmailToken(session.provider_token);
          markGmailConnected(session.user?.email ?? undefined);
        }
        setLoading(false);
      }
    });

    // Listen for auth changes, but don't stop loading if we haven't finished the initial getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        checkAndClearData(session?.user ?? null);
        setUser(session?.user ?? null);
        if (session?.provider_token) {
          // Keep the live token in memory only (never localStorage).
          setGmailToken(session.provider_token);
          markGmailConnected(session.user?.email ?? undefined);
        }
        // Only turn off loading for actual sign in/out events, not the initial mount
        if (event !== 'INITIAL_SESSION') {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [configured]);

  const signUp = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: name,
        }
      }
    });
    if (error) throw error;
    
    // Note: The Postgres Trigger will automatically create the row in public.users
    // But we can update the first_name here if needed.
    if (data.user) {
      await supabase.from('users').update({ first_name: name }).eq('id', data.user.id);
      setUser(data.user);
    }
  };

  const logIn = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    if (data.user) setUser(data.user);
  };

  const signInWithGoogle = async (idToken: string) => {
    const { error, data } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    if (error) throw error;
    if (data.user) setUser(data.user);
  };

  const logOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Drop the in-memory token and clear connection flags on sign out.
    clearGmail();
    
    // Wipe all local storage on explicit logout
    const keysToClear = [
      'sm_campaigns', 'sm_sent_logs', 'sm_threads', 'sm_campaign_settings',
      'linksmeet_settings', 'linksmeet_event_types', 'linksmeet_availability', 'linksmeet_bookings',
      'sm_gmail_email', 'sm_last_uid'
    ];
    keysToClear.forEach(key => localStorage.removeItem(key));
    
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, configured, signUp, logIn, signInWithGoogle, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Map Supabase auth error codes to friendly messages.
export function authErrorMessage(e: unknown): string {
  const msg = (e as { message?: string })?.message || '';
  if (msg.includes('User already registered')) return 'That email is already registered. Try logging in.';
  if (msg.includes('Invalid login credentials')) return 'Incorrect email or password.';
  if (msg.includes('Password should be at least')) return 'Password should be at least 6 characters.';
  return msg || 'Something went wrong. Please try again.';
}
