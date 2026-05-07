import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      set({ session, user: session.user, initialized: true });
    } else {
      // Auto sign-in anonymously so RLS works without requiring account creation
      const { data, error } = await supabase.auth.signInAnonymously();
      if (!error && data.session) {
        set({ session: data.session, user: data.session.user, initialized: true });
      } else {
        set({ initialized: true });
      }
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
  },

  signUp: async (email, password, name) => {
    set({ loading: true });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    set({ loading: false });
    if (error) throw error;
  },

  signIn: async (email, password) => {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    set({ loading: false });
    if (error) throw error;
  },

  signOut: async () => {
    // Sign out current session and create a fresh anonymous one
    await supabase.auth.signOut();
    const { data } = await supabase.auth.signInAnonymously();
    set({ session: data.session ?? null, user: data.session?.user ?? null });
  },
}));
