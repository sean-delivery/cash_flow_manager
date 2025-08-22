import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { sb } from '../lib/supabase';
import { QuotaManager } from '../lib/quotas';

export type Role = 'admin' | 'user' | 'guest';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
  consentAccepted: boolean;
  consentAcceptedAt?: Date;
  createdAt: Date;
  trialEndsAt?: Date;
  subscriptionStatus: 'active' | 'trial' | 'inactive';
  isActive: boolean;
  lastLoginAt?: Date;
  searchCount?: number;
  maxSearches?: number;
  status?: 'active' | 'disabled';
}

interface AuthContextType {
  user: User | null;
  email: string;
  role: Role;
  isAuthenticated: boolean;
  isLoading: boolean;
  trialDaysLeft: number;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  loginAsGuest: () => void;
  loginAsAdmin: () => void;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  changePassword: (newPassword: string) => Promise<void>;
  activateSubscription: (paymentCode: string) => Promise<boolean>;
  isAdmin: boolean;
  showLoginModal: boolean;
  authGuardReason: string;
  requireGoogleAuth: (reason?: string) => void;
  clearAuthGuard: () => void;
  isGoogleAuth: boolean;
  saveEmail: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

const ADMIN_EMAIL = (import.meta as any).env?.NEXT_PUBLIC_ADMIN_EMAIL || 'seannon29@gmail.com';

function supabaseUserToLocal(u: any): User {
  const email = u?.email || '';
  const isAdmin = email.toLowerCase() === String(ADMIN_EMAIL).toLowerCase();
  const now = new Date();
  return {
    id: u.id,
    email,
    name: u.user_metadata?.full_name || u.user_metadata?.name || '',
    role: isAdmin ? 'admin' : 'user',
    consentAccepted: true,
    consentAcceptedAt: now,
    createdAt: now,
    trialEndsAt: isAdmin ? now : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    subscriptionStatus: isAdmin ? 'active' : 'trial',
    isActive: true,
    lastLoginAt: now,
    searchCount: 0,
    maxSearches: isAdmin ? 999999 : 100,
    status: 'active'
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authGuardReason, setAuthGuardReason] = useState('');

  // initial load + onAuthStateChange
  useEffect(() => {
    let unsub: any;

    async function bootstrap() {
      try {
        const { data } = await sb.auth.getSession();
        if (data.session?.user) {
          const u = supabaseUserToLocal(data.session.user);
          setUser(u);
          setEmail(u.email);
          try {
            await sb.from('profiles').upsert({
              id: data.session.user.id,
              email: u.email,
              full_name: u.name || null,
              avatar_url: data.session.user.user_metadata?.avatar_url || null,
              updated_at: new Date().toISOString()
            }, { onConflict: 'id' });
          } catch {}
          if (u.subscriptionStatus === 'trial') {
            QuotaManager.createTrialPlan(u.id);
          }
        } else {
          const saved = localStorage.getItem('crm_user');
          if (saved) {
            try { setUser(JSON.parse(saved)); } catch { localStorage.removeItem('crm_user'); }
          }
          const savedEmail = localStorage.getItem('user_email') || '';
          setEmail(savedEmail);
          if (savedEmail && savedEmail.toLowerCase() === String(ADMIN_EMAIL).toLowerCase()) {
            const now = new Date();
            const admin: User = {
              id: 'admin_local',
              email: String(ADMIN_EMAIL),
              role: 'admin',
              consentAccepted: true,
              createdAt: now,
              subscriptionStatus: 'active',
              isActive: true,
              lastLoginAt: now,
              maxSearches: 999999,
              status: 'active'
            };
            setUser(admin);
          }
        }
      } finally {
        setIsLoading(false);
      }

      unsub = sb.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const u = supabaseUserToLocal(session.user);
          setUser(u);
          setEmail(u.email);
          localStorage.setItem('crm_user', JSON.stringify(u));
        } else {
          setUser(null);
          localStorage.removeItem('crm_user');
        }
      });
    }

    bootstrap();
    return () => { try { unsub?.data?.subscription?.unsubscribe?.(); } catch {} };
  }, []);

  const isAuthenticated = !!user?.email;
  const isGoogleAuth = !!user && user.role !== 'guest';
  const isAdmin = !!user && user.role === 'admin';

  const trialDaysLeft = useMemo(() => {
    if (!user?.trialEndsAt) return 0;
    const ms = user.trialEndsAt.getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / (1000*60*60*24)));
  }, [user?.trialEndsAt]);

  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        const u = supabaseUserToLocal(data.user);
        setUser(u);
        setEmail(u.email);
        localStorage.setItem('crm_user', JSON.stringify(u));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await sb.auth.signUp({
        email, password, options: { data: { full_name: name } }
      });
      if (error) throw error;
      if (data.user) {
        const u = supabaseUserToLocal(data.user);
        setUser(u);
        setEmail(u.email);
        localStorage.setItem('crm_user', JSON.stringify(u));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = () => {
    const now = new Date();
    const guest: User = {
      id: `guest_${now.getTime()}`,
      email: 'guest@local',
      role: 'guest',
      consentAccepted: true,
      createdAt: now,
      trialEndsAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      subscriptionStatus: 'trial',
      isActive: true,
      lastLoginAt: now,
      searchCount: 0,
      maxSearches: 25,
      status: 'active'
    };
    setUser(guest);
    localStorage.setItem('crm_user', JSON.stringify(guest));
    QuotaManager.createTrialPlan(guest.id); 
  };

  const loginAsAdmin = () => {
    const now = new Date();
    const admin: User = {
      id: 'admin_local',
      email: String(ADMIN_EMAIL),
      role: 'admin',
      consentAccepted: true,
      createdAt: now,
      subscriptionStatus: 'active',
      isActive: true,
      lastLoginAt: now,
      maxSearches: 999999,
      status: 'active'
    };
    setUser(admin);
    localStorage.setItem('crm_user', JSON.stringify(admin));
  };

  const logout = async () => {
    try { await sb.auth.signOut(); } catch {}
    setUser(null);
    localStorage.removeItem('crm_user');
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => {
      const next = { ...(prev as User), ...updates } as User;
      localStorage.setItem('crm_user', JSON.stringify(next));
      return next;
    });
  };

  const changePassword = async (newPassword: string) => {
    const { error } = await sb.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const activateSubscription = async (_paymentCode: string) => {
    // פיילוט: הפעלה מקומית של מנוי ללא גבייה אמיתית
    updateUser({ subscriptionStatus: 'active', maxSearches: 999999 });
    return true;
  };

  const requireGoogleAuth = (reason?: string) => {
    setAuthGuardReason(reason || '');
    setShowLoginModal(true);
  };
  const clearAuthGuard = () => {
    setAuthGuardReason('');
    setShowLoginModal(false);
  };
  const saveEmail = (e: string) => {
    setEmail(e);
    localStorage.setItem('user_email', e);
  };

  const value: AuthContextType = {
    user, email,
    role: (user?.role || 'guest') as Role,
    isAuthenticated, isLoading,
    trialDaysLeft,
    signInWithEmail, signUpWithEmail,
    loginAsGuest, loginAsAdmin,
    logout,
    updateUser,
    changePassword,
    activateSubscription,
    isAdmin,
    showLoginModal, authGuardReason, requireGoogleAuth, clearAuthGuard,
    isGoogleAuth,
    saveEmail
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
