'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/src/context/AuthContext';
import { setToken, setUser, apiFetch } from '@/src/lib/api/api-client';
import { 
  User, Mail, Phone, Shield, LogOut, Bell, 
  Globe, CheckCircle2, Edit2, Settings as SettingsIcon,
  Moon, Sun, Languages, Check, Search
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { useRouter } from 'next/navigation';
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

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', region: 'English' },
  { code: 'ny', name: 'Chichewa', flag: '🇲🇼', region: 'Malawi' },
  { code: 'ny', name: 'Nyanja', flag: '🇲🇼', region: 'Malawi / Zambia' },
  { code: 'zh', name: '中文 (Chinese)', flag: '🇨🇳', region: '中国 (China)' },
  { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵', region: '日本 (Japan)' },
];

export default function ProfilePage() {
  const { user, setUser: setCtxUser, refreshUser } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);

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
    const fetchProfile = async () => {
      try {
        const data = await apiFetch('/auth/me');
        if (data) {
          setFormData(prev => ({
            ...prev,
            name: data.first_name && data.last_name ? `${data.first_name} ${data.last_name}` : data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            bio: data.bio || '',
            country: data.country_code || '',
            city: data.city || '',
            taxId: data.tax_id || '',
            postalCode: data.postal_code || ''
          }));
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    
    fetchProfile();
  }, []);

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

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true
  });

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

  const [twoFactor, setTwoFactor] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [otpUrl, setOtpUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [selectedLang, setSelectedLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vs_language') || 'en';
    }
    return 'en';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const logout = () => {
    setToken(null);
    setUser(null);
    setCtxUser(null);
    router.push('/login?logout=true');
  };

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

        const updatedUser = await apiFetch('/auth/me', {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
        
        toast.success('Profile updated successfully');
        await refreshUser(); // Refresh context
    } catch (e) {
        console.error('Profile update error:', e);
        toast.error('Failed to update profile');
    } finally {
        setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
        toast.error('New password and confirm password do not match');
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
        toast.success('Password updated successfully');
        setFormData(prev => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }));
    } catch (error) {
        console.error('Password update failed:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
        setIsLoading(false);
    }
  };

  const handleSettingsSave = () => {
    localStorage.setItem('vs_settings_email', JSON.stringify(emailNotifications));
    localStorage.setItem('vs_settings_push', JSON.stringify(pushNotifications));
    localStorage.setItem('vs_settings_marketing', JSON.stringify(marketingEmails));
    toast.success('Settings saved successfully');
  };

  const handleTwoFactorToggle = async (checked: boolean) => {
    if (checked) {
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

  const handleLanguageChange = (code: string) => {
    setIsTranslating(true);
    setTimeout(() => {
      setSelectedLang(code);
      if (typeof window !== 'undefined') {
        localStorage.setItem('vs_language', code);
        const maxAge = 60 * 60 * 24 * 365;
        document.cookie = `vs_locale=${code}; path=/; max-age=${maxAge}`;
      }
      setIsTranslating(false);
      toast.success('Language updated successfully');
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }, 1000);
  };

  const SidebarItem = ({ id, label, icon: Icon }: any) => (
    <button 
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
            activeTab === id 
            ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' 
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
        }`}
    >
        <Icon size={18} />
        {label}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Account Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-900 rounded-[24px] p-4 shadow-sm border border-slate-100 dark:border-slate-800 space-y-1">
                <SidebarItem id="profile" label="My Profile" icon={User} />
                <SidebarItem id="security" label="Security" icon={Shield} />
                <SidebarItem id="translation" label="Translation" icon={Globe} />
                <SidebarItem id="notifications" label="Notifications" icon={Bell} />
                <SidebarItem id="settings" label="Settings" icon={SettingsIcon} />
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-4" />
                <button 
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                    <LogOut size={18} />
                    Delete Account
                </button>
            </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-8">
            {activeTab === 'profile' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Header Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-4 border-slate-50 dark:border-slate-800 shadow-lg">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                                <AvatarFallback className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-2xl font-black">
                                    {user?.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <button className="absolute bottom-0 right-0 bg-white dark:bg-slate-800 p-2 rounded-full shadow-md border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                                <Edit2 size={14} />
                            </button>
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{user?.name}</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                {user?.accountLabel || 'User'} • {formData.city || 'Location not set'}{formData.country ? `, ${formData.country}` : ''}
                            </p>
                        </div>
                        <Button variant="outline" className="rounded-xl font-bold border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
                            Edit <Edit2 size={14} className="ml-2" />
                        </Button>
                    </div>

                    {/* Personal Information */}
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">Personal Information</h3>
                            <Button variant="outline" className="rounded-xl font-bold text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={handleSave}>
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Full Name</Label>
                                <Input 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="h-12 rounded-xl border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900" 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                                    <Input 
                                        value={formData.email} 
                                        disabled
                                        className="h-12 pl-12 rounded-xl border-slate-200 dark:border-slate-800 font-semibold text-slate-500 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed" 
                                    />
                                    <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 dark:text-green-400" size={16} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Phone</Label>
                                <Input 
                                    value={formData.phone} 
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="h-12 rounded-xl border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900" 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Bio</Label>
                                <Input 
                                    value={formData.bio} 
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                    className="h-12 rounded-xl border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">Address</h3>
                            <Button variant="ghost" className="rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                                <Edit2 size={16} />
                            </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Country</Label>
                                <Input 
                                    value={formData.country} 
                                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                                    className="h-12 rounded-xl border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900" 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">City/State</Label>
                                <Input 
                                    value={formData.city} 
                                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                                    className="h-12 rounded-xl border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900" 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Postal Code</Label>
                                <Input 
                                    value={formData.postalCode} 
                                    onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                                    className="h-12 rounded-xl border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900" 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Tax ID</Label>
                                <Input 
                                    value={formData.taxId} 
                                    onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                                    className="h-12 rounded-xl border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900" 
                                />
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {activeTab === 'security' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Security Settings</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Manage your password and account security.</p>
                            </div>
                        </div>

                        <div className="space-y-6 max-w-md">
                            <div className="space-y-2">
                                <Label className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Current Password</Label>
                                <Input 
                                    type="password"
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                                    className="h-12 rounded-xl border-slate-200 dark:border-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">New Password</Label>
                                <Input 
                                    type="password"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                                    className="h-12 rounded-xl border-slate-200 dark:border-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Confirm New Password</Label>
                                <Input 
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                    className="h-12 rounded-xl border-slate-200 dark:border-slate-800"
                                />
                            </div>
                            <Button className="w-full h-12 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handlePasswordUpdate} disabled={isLoading}>
                                {isLoading ? 'Updating...' : 'Update Password'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'notifications' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <Bell size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notification Preferences</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Choose how you want to be notified.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">Email Notifications</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Receive updates via email</div>
                                </div>
                                <Switch checked={notifications.email} onCheckedChange={(c) => setNotifications({...notifications, email: c})} />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">Push Notifications</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Receive updates on your device</div>
                                </div>
                                <Switch checked={notifications.push} onCheckedChange={(c) => setNotifications({...notifications, push: c})} />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">SMS Notifications</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Receive updates via SMS</div>
                                </div>
                                <Switch checked={notifications.sms} onCheckedChange={(c) => setNotifications({...notifications, sms: c})} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'translation' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Globe size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Translation</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Select your preferred language and region.</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                    <Languages size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">App Language</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Choose the language for the interface.</p>
                                </div>
                            </div>

                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                                <Input 
                                    placeholder="Search languages..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {languages
                              .filter(lang => 
                                lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                lang.region.toLowerCase().includes(searchQuery.toLowerCase())
                              )
                              .map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    disabled={isTranslating}
                                    className={`
                                        relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left
                                        ${selectedLang === lang.code
                                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-500/10'
                                            : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-transparent'
                                        }
                                    `}
                                >
                                    <span className="text-3xl">{lang.flag}</span>
                                    <div>
                                        <div className={`font-bold ${selectedLang === lang.code ? 'text-blue-900 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
                                            {lang.name}
                                        </div>
                                        <div className={`text-xs font-medium ${selectedLang === lang.code ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {lang.region}
                                        </div>
                                    </div>
                                    
                                    {selectedLang === lang.code && (
                                        <div className="absolute top-4 right-4 text-blue-600 dark:text-blue-400">
                                            <Check size={18} strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                <SettingsIcon size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Manage your application preferences.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Appearance</h3>
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

                    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                                <Bell size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h3>
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

                    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Security</h3>
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
                                    onClick={() => setActiveTab('security')}
                                >
                                    Change Password
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleSettingsSave} className="rounded-xl px-8 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all">
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
            )}
        </div>
      </div>
    </div>
  );
}
