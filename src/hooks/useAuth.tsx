
import { useState, useEffect, createContext, useContext } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data && !error) {
        setUser({
          id: data.id,
          email: data.email || '',
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role as 'user' | 'admin'
        });
      } else {
        console.log('Profile fetch error, using fallback:', error);
        // Always create a fallback user to avoid being stuck in loading
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            first_name: session.user.user_metadata?.first_name,
            last_name: session.user.user_metadata?.last_name,
            role: 'user'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile, using fallback:', error);
      // Always create a fallback user to avoid being stuck in loading
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          first_name: session.user.user_metadata?.first_name,
          last_name: session.user.user_metadata?.last_name,
          role: 'user'
        });
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('Initial session:', session?.user?.id);
      setSession(session);
      
      if (session?.user) {
        // Use setTimeout to avoid blocking and prevent deadlocks
        setTimeout(() => {
          if (mounted) {
            fetchProfile(session.user.id).finally(() => {
              if (mounted) setLoading(false);
            });
          }
        }, 0);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          // Use setTimeout to defer Supabase calls and prevent deadlocks
          setTimeout(() => {
            if (mounted) {
              fetchProfile(session.user.id).finally(() => {
                if (mounted) setLoading(false);
              });
            }
          }, 0);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
