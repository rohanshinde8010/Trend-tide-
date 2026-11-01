import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AuthResponse,
  UserProfile,
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from '../api';
import { supabase } from '../utils/supabase/client';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapSupabaseUser = (sbUser: any): UserProfile => ({
  id: sbUser.id,
  email: sbUser.email || '',
  fullName: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Trend Strategist',
  role: 'Lead Trend Strategist',
  avatarUrl: sbUser.user_metadata?.avatar_url || null,
  isVerified: true,
  createdAt: sbUser.created_at,
  lastLogin: sbUser.last_sign_in_at || new Date().toISOString(),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // 1. Check Supabase session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
        setIsLoading(false);
      } else {
        // 2. Check local cookie session
        fetchCurrentUser()
          .then((remoteUser) => {
            if (active) setUser(remoteUser);
          })
          .catch(() => {
            if (active) setUser(null);
          })
          .finally(() => {
            if (active) setIsLoading(false);
          });
      }
    }).catch(() => {
      if (active) {
        fetchCurrentUser()
          .then((remoteUser) => {
            if (active) setUser(remoteUser);
          })
          .catch(() => {
            if (active) setUser(null);
          })
          .finally(() => {
            if (active) setIsLoading(false);
          });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim();

      // Attempt Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!error && data.user) {
        const profile = mapSupabaseUser(data.user);
        setUser(profile);
        // Sync local server session in background if available
        loginUser(cleanEmail, password).catch(() => {});
        return { success: true, user: profile };
      }

      // Check for Supabase unconfirmed email message
      if (error && error.message.toLowerCase().includes('email not confirmed')) {
        return {
          success: false,
          error: 'Please verify your email address via the confirmation link sent by Supabase before signing in.',
        };
      }

      // Fallback: try local backend authentication for analyst/mentor accounts
      try {
        const response = await loginUser(cleanEmail, password);
        if (response.success && response.user) {
          setUser(response.user);
          return response;
        }
      } catch {
        // Fall through to show Supabase error
      }

      return {
        success: false,
        error: error?.message || 'Invalid email address or password.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim();
      const cleanName = name.trim();

      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session && data.user) {
        const profile = mapSupabaseUser(data.user);
        setUser(profile);
        registerUser({ name: cleanName, email: cleanEmail, password, confirmPassword }).catch(() => {});
        return {
          success: true,
          user: profile,
          message: 'Account registered and authenticated successfully.',
        };
      }

      if (data.user) {
        registerUser({ name: cleanName, email: cleanEmail, password, confirmPassword }).catch(() => {});
        return {
          success: true,
          message: 'Registration successful! Please check your email to verify your Supabase account, then sign in.',
          email: cleanEmail,
        };
      }

      return { success: false, error: 'Registration failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut().catch(() => {});
      await logoutUser().catch(() => {});
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
