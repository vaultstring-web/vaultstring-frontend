'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/src/lib/api/api-client';
import { QRCodeSVG } from 'qrcode.react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
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

  const handleSave = () => {
    localStorage.setItem('vs_settings_email', JSON.stringify(emailNotifications));
    localStorage.setItem('vs_settings_push', JSON.stringify(pushNotifications));
    localStorage.setItem('vs_settings_marketing', JSON.stringify(marketingEmails));
    toast.success('Settings saved successfully');
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
        toast.error('Failed to initiate 2FA setup');
      } finally {
        setIs2FALoading(false);
      }
    } else {
      // Disable 2FA
      setIs2FALoading(true);
      try {
        await apiFetch('/auth/totp/disable', { method: 'POST' });
        setTwoFactor(false);
        toast.success('Two-factor authentication disabled');
      } catch (error) {
        console.error('Failed to disable 2FA:', error);
        toast.error('Failed to disable 2FA');
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
      toast.success('Two-factor authentication enabled successfully');
    } catch (error) {
      console.error('Failed to verify TOTP:', error);
      toast.error('Invalid verification code');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <Settings size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your application preferences.</p>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Appearance</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Customize how VaultString looks on your device.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {['light', 'dark', 'system'].map((mode) => (
            <button
              key={mode}
              onClick={() => setTheme(mode)}
              className={`p-4 rounded-2xl border-2 transition-all ${
                theme === mode 
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300' 
                  : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="capitalize font-bold mb-1">{mode}</div>
              <div className="text-xs opacity-70">
                {mode === 'light' && 'Light mode'}
                {mode === 'dark' && 'Dark mode'}
                {mode === 'system' && 'Follow system'}
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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Choose what we communicate to you.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-bold text-slate-900 dark:text-white">Email Notifications</Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">Receive emails about your account activity.</p>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-bold text-slate-900 dark:text-white">Push Notifications</Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">Receive push notifications on your device.</p>
            </div>
            <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-bold text-slate-900 dark:text-white">Marketing Emails</Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">Receive emails about new features and offers.</p>
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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Security</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Keep your account secure.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-bold text-slate-900 dark:text-white">Two-Factor Authentication</Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">Add an extra layer of security to your account.</p>
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
              className="w-full sm:w-auto font-bold text-slate-600 dark:text-slate-300"
              onClick={() => router.push('/dashboard/profile')}
            >
              Change Password
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="rounded-xl px-8 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all">
          Save Changes
        </Button>
      </div>

      <Dialog open={show2FASetup} onOpenChange={setShow2FASetup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code below with your authenticator app, then enter the verification code.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6 py-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              {otpUrl && <QRCodeSVG value={otpUrl} size={192} />}
            </div>
            <div className="space-y-2 w-full flex flex-col items-center">
              <Label>Verification Code</Label>
              <InputOTP
                maxLength={6}
                value={verificationCode}
                onChange={setVerificationCode}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button 
              className="w-full" 
              onClick={verifyTOTP}
              disabled={verificationCode.length !== 6 || isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Verify & Enable'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}