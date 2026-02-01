'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getToken, getUser, apiFetch, setUser as setLocalUser } from '@/src/lib/api/api-client';
import type { UserProfile } from '@/src/types/types';

type AuthContextValue = {
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({ user: null, setUser: () => {}, refreshUser: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);

  const mapToProfile = (raw: any): UserProfile => {
    const name = raw?.first_name && raw?.last_name ? `${raw.first_name} ${raw.last_name}` : raw?.name || raw?.email || 'User';
    const rawCountry = String((raw?.country_code ?? raw?.country ?? raw?.countryCode) || '').toUpperCase();
    const type = String(raw?.user_type || '').toLowerCase();
    const country = rawCountry || ((type === 'merchant' || type === 'agent') ? 'CN' : 'MW');
    
    let accountLabel = 'Personal Account';
    if (country === 'MW' && type === 'individual') accountLabel = 'Sender (Malawi)';
    else if (country === 'CN' && (type === 'merchant' || type === 'agent')) accountLabel = 'Receiver (China)';
    else if (type === 'merchant') accountLabel = 'Business Account';
    else if (type === 'agent') accountLabel = 'Agent Account';

    return {
      name,
      email: String(raw?.email || ''),
      phone: String(raw?.phone || ''),
      kycStatus: raw?.kyc_status || 'verified',
      avatarUrl: '/icons/avatar-default.png',
      accountLabel,
      countryCode: country,
      userType: type,
    };
  };

  const loadUser = async () => {
    const token = getToken();
    const rawLocal = getUser();

    if (token) {
      // 1. Load from local storage first for immediate UI
      if (rawLocal) {
        setUserState(mapToProfile(rawLocal));
      }

      // 2. Fetch fresh data from backend
      try {
        const freshUser = await apiFetch('/auth/me');
        if (freshUser) {
          setLocalUser(freshUser);
          setUserState(mapToProfile(freshUser));
        }
      } catch (err) {
        console.error('Failed to refresh user profile:', err);
        // 401s are handled by api-client redirect
      }
    } else {
        setUserState(null);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    setUser: (u) => {
      setUserState(u);
    },
    refreshUser: loadUser
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
