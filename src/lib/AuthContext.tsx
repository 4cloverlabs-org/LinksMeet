import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { setGmailToken, markGmailConnected, clearGmail } from './gmailToken';
import { API_BASE_URL } from './config';
// import { campaignEngine } from '../components/campaigns/campaignEngine';

export type Workspace = {
  id: string;
  name: string;
  role: string;
};

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string) => void;
  workspaces: Workspace[];
  needsWorkspaceSelection: boolean;
  setNeedsWorkspaceSelection: (val: boolean) => void;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (idToken: string, nonce?: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = !!import.meta.env.VITE_SUPABASE_URL;

  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string | null>(() => localStorage.getItem('sm_active_workspace'));
  const [workspaces, setWorkspacesState] = useState<Workspace[]>(() => {
    const cached = localStorage.getItem('sm_cached_workspaces');
    return cached ? JSON.parse(cached) : [];
  });
  
  const setWorkspaces = (ws: Workspace[]) => {
    setWorkspacesState(ws);
    localStorage.setItem('sm_cached_workspaces', JSON.stringify(ws));
  };
  const [needsWorkspaceSelection, setNeedsWorkspaceSelection] = useState(false);

  const setActiveWorkspaceId = (id: string) => {
    setActiveWorkspaceIdState(id);
    localStorage.setItem('sm_active_workspace', id);
  };

  const fetchWorkspaces = async (currentUser: User, event?: string) => {
    const ownWorkspace: Workspace = {
      id: currentUser.id,
      name: 'Personal Workspace',
      role: 'Owner'
    };
    
    const { data: userData } = await supabase.from('users').select('first_name').eq('id', currentUser.id).single();
    if (userData?.first_name) {
      ownWorkspace.name = `${userData.first_name}'s Workspace`;
    }

    const wsList = [ownWorkspace];

    if (currentUser.email) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        if (token) {
          const res = await fetch(`${API_BASE_URL}/api/team/workspaces`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const result = await res.json();
            if (result.workspaces) {
              result.workspaces.forEach((tm: any) => {
                wsList.push({
                  id: tm.user_id,
                  name: tm.users?.first_name ? `${tm.users.first_name}'s Team` : 'Team Workspace',
                  role: tm.role
                });
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch team workspaces", err);
      }
    }
    
    setWorkspaces(wsList);
    
    const savedWs = localStorage.getItem('sm_active_workspace');
    if (savedWs && wsList.some(w => w.id === savedWs)) {
      setActiveWorkspaceIdState(savedWs);
    } else {
      setActiveWorkspaceIdState(currentUser.id);
      localStorage.setItem('sm_active_workspace', currentUser.id);
    }

    if (event === 'SIGNED_IN' && wsList.length > 1) {
      const justAccepted = localStorage.getItem('sm_just_accepted_invite');
      if (!justAccepted) {
        setNeedsWorkspaceSelection(true);
      } else {
        localStorage.removeItem('sm_just_accepted_invite');
      }
    }
  };

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
        if (session?.user) fetchWorkspaces(session.user);
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
        if (session?.user) fetchWorkspaces(session.user, event);
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

  const signInWithGoogle = async (idToken: string, nonce?: string) => {
    const { error, data } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
      nonce: nonce,
    });
    if (error) {
      if (error.message && error.message.includes('Unacceptable audience in id_token')) {
        throw new Error('Login failed.');
      }
      throw error;
    }
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
      'sm_gmail_email', 'sm_last_uid', 'sm_cached_workspaces', 'sm_active_workspace'
    ];
    keysToClear.forEach(key => localStorage.removeItem(key));
    
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, configured, activeWorkspaceId, setActiveWorkspaceId, workspaces, needsWorkspaceSelection, setNeedsWorkspaceSelection, signUp, logIn, signInWithGoogle, logOut }}>
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
  if (msg.includes('User already registered')) return 'An account with this email already exists. Please log in using the method you originally signed up with (Email or Google).';
  if (msg.includes('Invalid login credentials')) return 'Incorrect email or password. If you signed up with Google, please click "Continue with Google".';
  if (msg.includes('Password should be at least')) return 'Password should be at least 6 characters.';
  return msg || 'Something went wrong. Please try again.';
}
