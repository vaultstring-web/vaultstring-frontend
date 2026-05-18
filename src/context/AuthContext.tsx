'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { getToken, getUser, apiFetch, setUser as setLocalUser } from '@/src/lib/api/api-client';
import type { UserProfile } from '@/src/types/types';

type AuthContextValue = {
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({ user: null, setUser: () => {}, refreshUser: async () => {} });

const mapToProfile = (raw: any): UserProfile => {
  const bypassEmailVerification =
    typeof window !== 'undefined' &&
    (process.env.NEXT_PUBLIC_DISABLE_EMAIL_VERIFICATION === 'true' ||
      process.env.NEXT_PUBLIC_BYPASS_EMAIL_VERIFICATION === 'true');

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
    id: raw?.id || raw?.ID || '',
    name,
    email: String(raw?.email || ''),
    phone: String(raw?.phone || ''),
    kycStatus: raw?.kyc_status || 'unverified',
    avatarUrl: String(raw?.profile_picture_url || raw?.profilePictureURL || raw?.avatarUrl || ''),
    accountLabel,
    countryCode: country,
    userType: type,
    isEmailVerified: bypassEmailVerification ? true : !!raw?.email_verified,
    isTOTPEnabled: !!raw?.is_totp_enabled,
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);

  const loadUser = useCallback(async () => {
    const token = getToken();
    const rawLocal = getUser();

    // 1. Load from local storage first for immediate UI
    if (rawLocal) {
      setUserState(mapToProfile(rawLocal));
    }

    // 2. Fetch fresh data from backend (even if no token, gateway might have a cookie)
    try {
      const freshUser = await apiFetch('/auth/me', { skipAuthRedirect: true });
      if (freshUser && freshUser.id) {
        // If we got a user but didn't have a local token, the gateway injected it from a cookie.
        // We should try to get the token if possible, or at least mark as authenticated.
        // Note: HttpOnly cookies can't be read, so we'll rely on apiFetch sending it via credentials: 'include'
        setLocalUser(freshUser);
        setUserState(mapToProfile(freshUser));
      } else if (!token) {
        // No token and no user from backend
        setUserState(null);
      }
    } catch (err) {
      // 401 without token is expected when not logged in; avoid noisy console errors
      const status = (err as { status?: number })?.status;
      const isUnauthWhenNotLoggedIn = !token && status === 401;
      if (!isUnauthWhenNotLoggedIn) {
        console.error('Failed to refresh user profile:', err);
      }
      if (!token) setUserState(null);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    setUser: (u) => {
      setUserState(u);
    },
    refreshUser: loadUser
  }), [user, loadUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
