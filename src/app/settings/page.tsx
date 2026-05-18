'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { Button } from '@/src/components/ui/button';
import { Label } from '@/src/components/ui/label';
import { Switch } from '@/src/components/ui/switch';
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
import { 
  Settings, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  Save,
  Loader2,
  CheckCircle2,
  QrCode,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/src/lib/api/api-client';
import { QRCodeSVG } from 'qrcode.react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const t = useTranslations('Settings');
  const tProfile = useTranslations('Profile');
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  
  // Local settings
  const [emailNotifications, setEmailNotifications] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vs_settings_email');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  const [pushNotifications, setPushNotifications] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vs_settings_push');
      return saved !== null ? JSON.parse(saved) : false;
    }
    return false;
  });

  const [marketingEmails, setMarketingEmails] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vs_settings_marketing');
      return saved !== null ? JSON.parse(saved) : false;
    }
    return false;
  });

  // Backend settings
  const [twoFactor, setTwoFactor] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // 2FA Setup State
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [otpUrl, setOtpUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Fetch initial 2FA status
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiFetch('/auth/totp/status');
        if (data) {
          setTwoFactor(data.enabled);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('vs_settings_email', JSON.stringify(emailNotifications));
      localStorage.setItem('vs_settings_push', JSON.stringify(pushNotifications));
      localStorage.setItem('vs_settings_marketing', JSON.stringify(marketingEmails));
      
      // Simulate API call for local settings
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success(t('success'));
    } catch {
      toast.error(t('error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleTwoFactorToggle = async (checked: boolean) => {
    if (checked) {
      // Enable 2FA
      setIs2FALoading(true);
      try {
        const data = await apiFetch('/auth/totp/setup', { method: 'POST' });
        setOtpUrl(data.otp_url);
        setShow2FASetup(true);
      } catch (error) {
        console.error('Failed to setup 2FA:', error);
        toast.error(t('totp.error'));
      } finally {
        setIs2FALoading(false);
      }
    } else {
      // Disable 2FA
      setIs2FALoading(true);
      try {
        await apiFetch('/auth/totp/disable', { method: 'POST' });
        setTwoFactor(false);
        toast.success(t('totp.disabled'));
      } catch (error) {
        console.error('Failed to disable 2FA:', error);
        toast.error(t('totp.error'));
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
      toast.success(t('totp.enabled'));
    } catch (error) {
      console.error('Failed to verify TOTP:', error);
      toast.error(t('totp.invalidCode'));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{t('subtitle')}</p>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 h-12 font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
        >
          {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
          {isSaving ? t('saving') : t('save')}
        </Button>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('appearance.title')}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('appearance.subtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {['light', 'dark', 'system'].map((mode) => (
            <button
              key={mode}
              onClick={() => setTheme(mode)}
              className={`p-4 rounded-2xl border-2 transition-all text-left ${
                theme === mode 
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300' 
                  : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="capitalize font-bold mb-1">{t(`appearance.${mode}`)}</div>
              <div className="text-xs opacity-70">
                {mode === 'light' && t('appearance.lightMode')}
                {mode === 'dark' && t('appearance.darkMode')}
                {mode === 'system' && t('appearance.followSystem')}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
            <Bell size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('notifications.title')}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('notifications.subtitle')}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-bold text-slate-900 dark:text-white">{t('notifications.email.title')}</Label>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('notifications.email.subtitle')}</p>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-bold text-slate-900 dark:text-white">{t('notifications.push.title')}</Label>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('notifications.push.subtitle')}</p>
            </div>
            <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-bold text-slate-900 dark:text-white">{t('notifications.marketing.title')}</Label>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('notifications.marketing.subtitle')}</p>
            </div>
            <Switch checked={marketingEmails} onCheckedChange={setMarketingEmails} />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Shield size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('security.title')}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('security.subtitle')}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-bold text-slate-900 dark:text-white">{t('security.twoFactor.title')}</Label>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('security.twoFactor.subtitle')}</p>
            </div>
            <Switch 
              checked={twoFactor} 
              onCheckedChange={handleTwoFactorToggle}
              disabled={is2FALoading}
            />
          </div>
          
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto font-bold text-slate-600 dark:text-slate-300 rounded-xl"
              onClick={() => router.push('/profile')}
            >
              {tProfile('changePassword')}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={show2FASetup} onOpenChange={setShow2FASetup}>
        <DialogContent className="sm:max-w-md rounded-[32px] p-8 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-2xl">
          <DialogHeader className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <Shield size={24} />
            </div>
            <DialogTitle className="text-2xl font-black text-center text-slate-900 dark:text-white tracking-tight">
              {t('security.twoFactor.setup.title')}
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500 dark:text-slate-400 font-medium">
              {t('security.twoFactor.setup.subtitle')}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-8 py-6">
            <div className="space-y-4 w-full">
              <div className="flex items-center gap-3 text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                <QrCode size={18} className="text-indigo-600" />
                {t('security.twoFactor.setup.step1')}
              </div>
              <div className="p-6 bg-slate-50 dark:bg-white rounded-3xl flex justify-center shadow-inner">
                {otpUrl && <QRCodeSVG value={otpUrl} size={180} />}
              </div>
            </div>

            <div className="space-y-4 w-full">
              <div className="flex items-center gap-3 text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                <Smartphone size={18} className="text-indigo-600" />
                {t('security.twoFactor.setup.step2')}
              </div>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={verificationCode}
                  onChange={setVerificationCode}
                  className="gap-2"
                >
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} className="h-14 w-11 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-black text-lg bg-white dark:bg-slate-950" />
                    <InputOTPSlot index={1} className="h-14 w-11 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-black text-lg bg-white dark:bg-slate-950" />
                    <InputOTPSlot index={2} className="h-14 w-11 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-black text-lg bg-white dark:bg-slate-950" />
                  </InputOTPGroup>
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={3} className="h-14 w-11 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-black text-lg bg-white dark:bg-slate-950" />
                    <InputOTPSlot index={4} className="h-14 w-11 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-black text-lg bg-white dark:bg-slate-950" />
                    <InputOTPSlot index={5} className="h-14 w-11 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-black text-lg bg-white dark:bg-slate-950" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <Button
              onClick={verifyTOTP}
              disabled={verificationCode.length !== 6 || isVerifying}
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
            >
              {isVerifying ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2" />}
              {isVerifying ? t('security.twoFactor.setup.verifying') : t('security.twoFactor.setup.verify')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}