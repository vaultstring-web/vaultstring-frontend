'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { apiFetch } from '@/src/lib/api/api-client';
import {
  Globe,
  CheckCircle2,
  Settings as SettingsIcon,
  ShieldCheck,
  Loader2,
  Key,
  Smartphone,
  History,
  Wallet,
  Grid,
  Lock,
  Plus,
  Link as LinkIcon,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { toast } from 'sonner';
import { Switch } from "@/src/components/ui/switch";
import { Badge } from "@/src/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/src/components/ui/input-otp";
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { SUPPORTED_LANGUAGES } from '@/src/lib/constants/africa';
import { formatCurrency } from '@/src/lib/utils/formatters';

export default function ProfilePage() {
  const t = useTranslations('Profile');
  const tb = useTranslations('TopBar');
  const currentLocale = useLocale();
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'posts');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    country: '',
    city: '',
    taxId: '',
    postalCode: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || t('defaultBioTagline'),
        country: user.countryCode || '',
        city: user.city || '',
        taxId: user.taxId || '',
        postalCode: user.postalCode || ''
      }));
    }
  }, [user, t]);

  const [twoFactor, setTwoFactor] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [otpUrl, setOtpUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [wallets, setWallets] = useState<Array<{ id: string; currency: string; available_balance: string | number }>>([]);
  const [txCount, setTxCount] = useState(0);
  const [devices, setDevices] = useState<Array<{
    id: string;
    device_hash: string;
    device_name?: string | null;
    country_code?: string | null;
    ip_address?: string | null;
    is_trusted: boolean;
    last_seen_at: string;
    created_at: string;
  }>>([]);
  const [activity, setActivity] = useState<Array<{
    id: string;
    action: string;
    created_at: string;
    ip_address?: string | null;
    user_agent?: string | null;
    error_message?: string | null;
  }>>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiFetch('/auth/totp/status');
        if (data) setTwoFactor(data.enabled);
      } catch {
        /* ignore */
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [walletRes, txRes] = await Promise.all([
          apiFetch('/wallets'),
          apiFetch('/payments?limit=1&offset=0'),
        ]);
        const walletItems = Array.isArray(walletRes?.wallets) ? walletRes.wallets : [];
        setWallets(walletItems);
        setTxCount(Number(txRes?.total || 0));
      } catch {
        setWallets([]);
        setTxCount(0);
      }
    };
    fetchProfileData();
  }, []);

  const fetchSecuritySnapshot = useCallback(async () => {
    setActivityLoading(true);
    try {
      const [devRes, actRes] = await Promise.all([
        apiFetch('/users/me/devices?limit=50&offset=0'),
        apiFetch('/users/me/activity?limit=50&offset=0'),
      ]);
      setDevices(Array.isArray(devRes?.devices) ? devRes.devices : []);
      setActivity(Array.isArray(actRes?.logs) ? actRes.logs : []);
    } catch {
      setDevices([]);
      setActivity([]);
    } finally {
      setActivityLoading(false);
    }
  }, []);

  // Ensure Activity & Devices actually loads on first view.
  useEffect(() => {
    if (activeTab !== 'posts') return;
    if (activityLoading) return;
    // Avoid refetch loops, but allow manual refresh.
    if (devices.length === 0 && activity.length === 0) {
      void fetchSecuritySnapshot();
    }
  }, [activeTab, activityLoading, devices.length, activity.length, fetchSecuritySnapshot]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
        const nameParts = formData.name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        const payload = {
            first_name: firstName,
            last_name: lastName,
            phone: formData.phone,
            bio: formData.bio,
            country_code: formData.country,
            city: formData.city,
            tax_id: formData.taxId,
            postal_code: formData.postalCode
        };

        await apiFetch('/auth/me', {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
        
        toast.success(t('toasts.profileUpdated'));
        await refreshUser();
        setIsEditMode(false);
    } catch {
        toast.error(t('toasts.profileFailed'));
    } finally {
        setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
        toast.error(t('toasts.passwordFieldsRequired'));
        return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
        toast.error(t('toasts.passwordMismatch'));
        return;
    }

    setIsLoading(true);
    try {
        await apiFetch('/auth/me/password', {
            method: 'POST',
            body: JSON.stringify({
                current_password: formData.currentPassword,
                new_password: formData.newPassword
            })
        });
        toast.success(t('toasts.passwordUpdated'));
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch {
        toast.error(t('toasts.passwordFailed'));
    } finally {
        setIsLoading(false);
    }
  };

  const handleTwoFactorToggle = async (checked: boolean) => {
    if (checked) {
      setIs2FALoading(true);
      try {
        const data = await apiFetch('/auth/totp/setup', { method: 'POST' });
        setOtpUrl(data.otp_url);
        setShow2FASetup(true);
      } catch {
        toast.error(t('toasts.totpSetupFailed'));
      } finally {
        setIs2FALoading(false);
      }
    } else {
      setIs2FALoading(true);
      try {
        await apiFetch('/auth/totp/disable', { method: 'POST' });
        setTwoFactor(false);
        toast.success(t('toasts.twoFactorDisabled'));
      } catch {
        toast.error(t('toasts.twoFactorDisableFailed'));
      } finally {
        setIs2FALoading(false);
      }
    }
  };

  const verifyTOTP = async () => {
    if (verificationCode.length !== 6) return;
    setIsVerifying(true);
    try {
      await apiFetch('/auth/totp/verify', {
        method: 'POST',
        body: JSON.stringify({ code: verificationCode })
      });
      setTwoFactor(true);
      setShow2FASetup(false);
      setVerificationCode('');
      toast.success(t('toasts.twoFactorEnabled'));
    } catch {
      toast.error(t('toasts.invalidTotpCode'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      toast.info(t('toasts.avatarUploading'));
      setTimeout(() => toast.success(t('toasts.avatarUpdated')), 1500);
    }
  };

  const tabs = [
    { id: 'posts', label: t('tabs.activity'), icon: Grid },
    { id: 'wallets', label: t('tabs.wallets'), icon: Wallet },
    { id: 'security', label: t('tabs.security'), icon: Lock },
    { id: 'translation', label: t('tabs.language'), icon: Globe },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      <header className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-16 mb-12">
        {/* Avatar Section */}
        <div className="relative group mx-auto md:mx-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-linear-to-tr from-yellow-400 via-red-500 to-purple-600">
            <div className="w-full h-full rounded-full border-4 border-white dark:border-slate-950 overflow-hidden bg-slate-100 dark:bg-slate-800">
              <Avatar className="w-full h-full">
                <AvatarImage src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || tb('fallbackUser'))}&background=random`} />
                <AvatarFallback className="text-4xl font-black">{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
          <button 
            onClick={handleAvatarClick}
            className="absolute bottom-2 right-2 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <Plus size={16} />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
        </div>

        {/* Info Section */}
        <div className="flex-1 space-y-6 text-center md:text-left w-full">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <h1 className="text-2xl font-light text-slate-900 dark:text-white tracking-tight lowercase">{user?.email?.split('@')[0] || t('headerUsernameFallback')}</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="font-bold rounded-lg px-6 h-9 bg-slate-100 dark:bg-slate-800 border-none hover:bg-slate-200 dark:hover:bg-slate-700"
                onClick={() => setIsEditMode(true)}
              >
                {t('editProfile')}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="font-bold rounded-lg px-6 h-9 bg-slate-100 dark:bg-slate-800 border-none hover:bg-slate-200 dark:hover:bg-slate-700"
                onClick={() => router.push('/transactions')}
              >
                {t('viewArchive')}
              </Button>
              <button
                onClick={() => router.push('/settings')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <SettingsIcon size={20} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center md:justify-start gap-8 md:gap-12 border-y md:border-none py-4 md:py-0">
            <div className="text-center md:text-left">
              <span className="font-bold text-slate-900 dark:text-white">{txCount}</span>
              <span className="ml-1 text-slate-500 dark:text-slate-400 lowercase">{t('stats.transactions')}</span>
            </div>
            <div className="text-center md:text-left">
              <span className="font-bold text-slate-900 dark:text-white">{wallets.length}</span>
              <span className="ml-1 text-slate-500 dark:text-slate-400 lowercase">{t('stats.wallets')}</span>
            </div>
            <div className="text-center md:text-left">
              <span className="font-bold text-slate-900 dark:text-white">-</span>
              <span className="ml-1 text-slate-500 dark:text-slate-400 lowercase">{t('stats.recipients')}</span>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <h2 className="font-bold text-slate-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap max-w-md">
              {formData.bio}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-1 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <LinkIcon size={14} />
              <a href="#" className="hover:underline">vaultstring.com/p/{user?.email?.split('@')[0]}</a>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-t border-slate-200 dark:border-slate-800">
        <div className="flex justify-center gap-12 -mt-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 border-t-2 transition-all uppercase tracking-widest text-[11px] font-bold ${
                activeTab === tab.id 
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon size={14} strokeWidth={activeTab === tab.id ? 3 : 2} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'posts' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('activityDevices')}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {t('activitySubtitle')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={fetchSecuritySnapshot}
                    disabled={activityLoading}
                    className="rounded-xl h-10 px-4 font-bold gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${activityLoading ? 'animate-spin' : ''}`} />
                    {t('refresh')}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('knownDevices')}</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{devices.length}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('recentEvents')}</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{activity.length}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('lastLogin')}</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white mt-2">
                      {(user as { lastLoginAt?: string })?.lastLoginAt ? new Date((user as { lastLoginAt?: string }).lastLoginAt!).toLocaleString() : t('dash')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-[32px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                        <Smartphone size={14} className="text-indigo-600" />
                        {t('devicesHeading')}
                      </h3>
                      <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest">
                        {activityLoading ? t('badgeLoading') : t('badgeLive')}
                      </Badge>
                    </div>
                    {devices.length === 0 ? (
                      <div className="text-xs text-slate-500 dark:text-slate-400">{t('noDevicesYet')}</div>
                    ) : (
                      <div className="space-y-2">
                        {devices.slice(0, 10).map((d) => (
                          <div key={d.id} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 p-4 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-black text-slate-900 dark:text-white truncate">
                                {d.device_name || t('unknownDevice')}
                              </div>
                              <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                                {d.ip_address || t('ipUnavailable')} {d.country_code ? `• ${d.country_code}` : ''}
                              </div>
                              <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                {t('lastSeen')}: {d.last_seen_at ? new Date(d.last_seen_at).toLocaleString() : t('dash')}
                              </div>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                              d.is_trusted ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300'
                              : 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-500/20 dark:bg-yellow-500/10 dark:text-yellow-200'
                            }`}>
                              {d.is_trusted ? t('trustedBadge') : t('untrustedBadge')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-[32px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                        <History size={14} className="text-indigo-600" />
                        {t('recentActivityHeading')}
                      </h3>
                      <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest">
                        {activityLoading ? t('badgeLoading') : t('badgeLive')}
                      </Badge>
                    </div>
                    {activity.length === 0 ? (
                      <div className="text-xs text-slate-500 dark:text-slate-400">{t('noActivityYet')}</div>
                    ) : (
                      <div className="space-y-2">
                        {activity.slice(0, 12).map((a) => (
                          <div key={a.id} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="text-sm font-black text-slate-900 dark:text-white">{a.action}</div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                {a.created_at ? new Date(a.created_at).toLocaleString() : t('dash')}
                              </div>
                            </div>
                            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              {a.ip_address || t('ipUnavailable')}
                            </div>
                            {a.error_message && (
                              <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">{a.error_message}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'wallets' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wallets.map((wallet, i) => (
                  <div key={wallet.id || i} className="p-6 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                        <Wallet size={24} className="text-slate-500 dark:text-slate-300" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('walletCardTitle', { currency: wallet.currency })}</p>
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                          {formatCurrency(Number(wallet.available_balance || 0), wallet.currency)}
                        </p>
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <ExternalLink size={18} />
                    </div>
                  </div>
                ))}
                {wallets.length === 0 && (
                  <div className="col-span-full p-8 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 font-medium">
                    {t('noWalletsMessage')}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="max-w-xl mx-auto space-y-8">
                {/* 2FA Section */}
                <div className="p-8 rounded-[40px] bg-linear-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 border border-indigo-100 dark:border-indigo-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShieldCheck size={120} />
                  </div>
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-200/50 dark:shadow-none">
                        <Smartphone size={28} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white tracking-tight text-base">{t('twoFactorShortTitle')}</h3>
                        <p className="text-xs font-semibold text-indigo-600/60 dark:text-indigo-400">{t('twoFactorStatus')}: {twoFactor ? t('enabled') : t('disabled')}</p>
                      </div>
                    </div>
                    <Switch checked={twoFactor} onCheckedChange={handleTwoFactorToggle} disabled={is2FALoading} />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-8 relative z-10 leading-relaxed">
                    {t('twoFactorBlurb')}
                  </p>
                  {twoFactor && (
                    <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest bg-green-50 dark:bg-green-500/10 w-fit px-4 py-2 rounded-full border border-green-100 dark:border-green-500/20">
                      <CheckCircle2 size={14} />
                      {t('activeProtection')}
                    </div>
                  )}
                </div>

                {/* Password Section */}
                <div className="space-y-6 bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm flex items-center gap-2">
                    <Key size={18} className="text-indigo-600" />
                    {t('changePassword')}
                  </h3>
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('currentPassword')}</Label>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="rounded-2xl border-slate-100 dark:border-slate-800 h-14 bg-slate-50 dark:bg-slate-800/50 focus:bg-white transition-all"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('newPassword')}</Label>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="rounded-2xl border-slate-100 dark:border-slate-800 h-14 bg-slate-50 dark:bg-slate-800/50 focus:bg-white transition-all"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('confirmPassword')}</Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="rounded-2xl border-slate-100 dark:border-slate-800 h-14 bg-slate-50 dark:bg-slate-800/50 focus:bg-white transition-all"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      />
                    </div>
                    <Button 
                      onClick={handlePasswordUpdate}
                      disabled={isLoading}
                      className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02] transition-transform"
                    >
                      {isLoading ? <Loader2 className="animate-spin" /> : t('updatePassword')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'translation' && (
              <div className="max-w-xl mx-auto space-y-4">
                <div className="grid gap-3">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        document.cookie = `vs_locale=${lang.code}; path=/; max-age=31536000`;
                        window.location.reload();
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all group relative overflow-hidden ${
                        currentLocale === lang.code 
                        ? 'border-indigo-500 shadow-xl shadow-indigo-500/10' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-indigo-500'
                      }`}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                          {lang.flag}
                        </div>
                        <div className="text-left">
                          <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">{lang.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang.region}</p>
                        </div>
                      </div>
                      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors relative z-10 ${
                        currentLocale === lang.code ? 'border-indigo-500' : 'border-slate-100 dark:border-slate-800 group-hover:border-indigo-500'
                      }`}>
                        <div className={`h-3 w-3 rounded-full bg-indigo-500 transition-transform ${
                          currentLocale === lang.code ? 'scale-100' : 'scale-0 group-hover:scale-100'
                        }`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditMode} onOpenChange={setIsEditMode}>
        <DialogContent className="max-w-2xl rounded-[40px] p-10 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2">
              {t('editProfile')}
            </DialogTitle>
            <DialogDescription className="font-bold text-slate-500">
              {t('dialogIdentitySubtitle')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="space-y-2 md:col-span-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('fullName')}</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="rounded-2xl h-14 bg-slate-50/50 dark:bg-slate-800/50 border-none focus:ring-2 focus:ring-indigo-500/20 text-base font-medium"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('bio')}</Label>
              <textarea 
                value={formData.bio} 
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full min-h-[100px] p-5 rounded-2xl border-none bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none text-sm font-medium"
                placeholder={t('bioPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('phone')}</Label>
              <Input 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="rounded-2xl h-14 bg-slate-50/50 dark:bg-slate-800/50 border-none focus:ring-2 focus:ring-indigo-500/20 text-base font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('city')}</Label>
              <Input 
                value={formData.city} 
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="rounded-2xl h-14 bg-slate-50/50 dark:bg-slate-800/50 border-none focus:ring-2 focus:ring-indigo-500/20 text-base font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <Button 
              variant="outline" 
              onClick={() => setIsEditMode(false)} 
              className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {t('cancel')}
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading} 
              className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:translate-y-[-2px] active:translate-y-0 transition-all"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : t('saveChanges')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FASetup} onOpenChange={setShow2FASetup}>
        <DialogContent className="max-w-md rounded-[40px] p-10 text-center border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">{t('secureAccountTitle')}</DialogTitle>
            <DialogDescription className="font-semibold text-slate-500 text-sm">{t('scanQrSubtitle')}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-10 py-8">
            <div className="p-6 bg-white rounded-[32px] shadow-2xl shadow-slate-200 dark:shadow-none border border-slate-100">
              {otpUrl && <QRCodeSVG value={otpUrl} size={220} />}
            </div>
            <div className="space-y-4 w-full">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('enterSixDigitCode')}</Label>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode}>
                  <InputOTPGroup className="gap-3">
                    {[...Array(6)].map((_, i) => (
                      <InputOTPSlot key={i} index={i} className="w-12 h-14 rounded-xl border-2 border-slate-100 bg-slate-50 text-xl font-black" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            <Button 
              onClick={verifyTOTP} 
              disabled={isVerifying || verificationCode.length !== 6}
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none"
            >
              {isVerifying ? <Loader2 className="animate-spin" /> : t('verifyAndEnable')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
