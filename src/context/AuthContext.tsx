import { createContext, useContext, useEffect, useState } from 'react';
import type {
  User,
  AuthResponse,
  AuthTokenResponse,
} from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// TypeScript: Definiere was der Context enthält
interface AuthContextType {
  user: User | null; // Supabase User-Typ
  loading: boolean; // Wird gerade geladen?
  signUp: (email: string, password: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthTokenResponse>;
  signOut: () => Promise<{ error: Error | null }>;
}

// Erstelle den Context (anfangs leer)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Komponente: Verwaltet den Auth-Status
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Beim App-Start: Prüfe ob User bereits eingeloggt ist
  useEffect(() => {
    // Hole aktuellen User-Status von Supabase
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false); // Laden beendet
    });

    // Höre auf Auth-Änderungen (Login/Logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // _ prefix zeigt: Parameter wird ignoriert
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup: Stoppe das Hören wenn Komponente zerstört wird
    return () => subscription.unsubscribe();
  }, []);

  // Auth-Funktionen definieren
  const signUp = async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password });
  };

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    return await supabase.auth.signOut();
  };

  // Stelle alles für andere Komponenten zur Verfügung
  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom Hook: Einfacher Zugriff auf Auth-Context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
