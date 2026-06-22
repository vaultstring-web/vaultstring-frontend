'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/src/lib/api/api-client';

function readBoolStorage(key: string, fallback: boolean) {
  if (typeof window === 'undefined') return fallback;
  const saved = localStorage.getItem(key);
  return saved !== null ? JSON.parse(saved) : fallback;
}

type Prefs = {
  email_notifications?: boolean;
  push_notifications?: boolean;
  marketing_emails?: boolean;
  analytics_opt_in?: boolean;
  personalized_offers?: boolean;
  public_profile?: boolean;
};

export function useSettingsPreferences() {
  const [emailNotifications, setEmailNotifications] = useState(() =>
    readBoolStorage('vs_settings_email', true)
  );
  const [pushNotifications, setPushNotifications] = useState(() =>
    readBoolStorage('vs_settings_push', false)
  );
  const [marketingEmails, setMarketingEmails] = useState(() =>
    readBoolStorage('vs_settings_marketing', false)
  );
  const [analyticsOptIn, setAnalyticsOptIn] = useState(() =>
    readBoolStorage('vs_settings_analytics', true)
  );
  const [personalizedOffers, setPersonalizedOffers] = useState(() =>
    readBoolStorage('vs_settings_personalized', false)
  );
  const [publicProfile, setPublicProfile] = useState(() =>
    readBoolStorage('vs_settings_public_profile', false)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const prefs = (await apiFetch('/users/me/preferences')) as Prefs;
        if (typeof prefs.email_notifications === 'boolean') setEmailNotifications(prefs.email_notifications);
        if (typeof prefs.push_notifications === 'boolean') setPushNotifications(prefs.push_notifications);
        if (typeof prefs.marketing_emails === 'boolean') setMarketingEmails(prefs.marketing_emails);
        if (typeof prefs.analytics_opt_in === 'boolean') setAnalyticsOptIn(prefs.analytics_opt_in);
        if (typeof prefs.personalized_offers === 'boolean') setPersonalizedOffers(prefs.personalized_offers);
        if (typeof prefs.public_profile === 'boolean') setPublicProfile(prefs.public_profile);
      } catch {
        /* fall back to localStorage defaults */
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const savePreferences = useCallback(async () => {
    setIsSaving(true);
    try {
      const payload = {
        email_notifications: emailNotifications,
        push_notifications: pushNotifications,
        marketing_emails: marketingEmails,
        analytics_opt_in: analyticsOptIn,
        personalized_offers: personalizedOffers,
        public_profile: publicProfile,
      };
      await apiFetch('/users/me/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      localStorage.setItem('vs_settings_email', JSON.stringify(emailNotifications));
      localStorage.setItem('vs_settings_push', JSON.stringify(pushNotifications));
      localStorage.setItem('vs_settings_marketing', JSON.stringify(marketingEmails));
      localStorage.setItem('vs_settings_analytics', JSON.stringify(analyticsOptIn));
      localStorage.setItem('vs_settings_personalized', JSON.stringify(personalizedOffers));
      localStorage.setItem('vs_settings_public_profile', JSON.stringify(publicProfile));
      return true;
    } catch {
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [
    analyticsOptIn,
    emailNotifications,
    marketingEmails,
    personalizedOffers,
    publicProfile,
    pushNotifications,
  ]);

  return {
    emailNotifications,
    setEmailNotifications,
    pushNotifications,
    setPushNotifications,
    marketingEmails,
    setMarketingEmails,
    analyticsOptIn,
    setAnalyticsOptIn,
    personalizedOffers,
    setPersonalizedOffers,
    publicProfile,
    setPublicProfile,
    isSaving,
    savePreferences,
    loaded,
  };
}
