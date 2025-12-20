'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getToken, getUser } from '@/src/lib/api/api-client';
import type { UserProfile } from '@/src/types/types';

type AuthContextValue = {
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
};

const AuthContext = createContext<AuthContextValue>({ user: null, setUser: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = getToken();
    const raw = getUser();
    if (token && raw) {
      const name = raw?.first_name && raw?.last_name ? `${raw.first_name} ${raw.last_name}` : raw?.name || raw?.email || 'User';
      const country = String(raw?.country_code || '').toUpperCase();
      const type = String(raw?.user_type || '').toLowerCase();
      let accountLabel = 'Personal Account';
      if (country === 'MW' && type === 'individual') accountLabel = 'Sender (Malawi)';
      else if (country === 'CN' && (type === 'merchant' || type === 'agent')) accountLabel = 'Receiver (China)';
      else if (type === 'merchant') accountLabel = 'Business Account';
      else if (type === 'agent') accountLabel = 'Agent Account';

      const profile: UserProfile = {
        name,
        email: String(raw?.email || ''),
        phone: String(raw?.phone || ''),
        kycStatus: 'verified',
        avatarUrl: '/icons/avatar-default.png',
        accountLabel,
        countryCode: country,
        userType: type,
      };
      setUserState(profile);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    setUser: (u) => {
      setUserState(u);
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}