"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

// Sync user to backend (creates user in local DB if not exists)
async function syncUserToBackend(accessToken: string): Promise<void> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
  try {
    // Call /me endpoint which triggers auth middleware to create user
    await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (error) {
    console.error("Failed to sync user to backend:", error);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Sync user to backend if logged in
      if (session?.access_token) {
        syncUserToBackend(session.access_token);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Sync user to backend on auth change
      if (session?.access_token) {
        syncUserToBackend(session.access_token);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
