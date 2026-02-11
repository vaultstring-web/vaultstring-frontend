'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { setToken, setUser, apiFetch } from '@/src/lib/api/api-client';
import { 
  User, Mail, Phone, Shield, LogOut, Lock, Bell, ChevronRight, 
  CreditCard, Globe, HelpCircle, FileText, CheckCircle2, Edit2
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { useRouter } from 'next/navigation';
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { toast } from 'sonner';
import { Switch } from "@/src/components/ui/switch";
import { Badge } from "@/src/components/ui/badge";

export default function ProfilePage() {
  const { user, setUser: setCtxUser, refreshUser } = useAuth();
  const router = useRouter();
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

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true
  });

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
                <SidebarItem id="teams" label="Teams" icon={User} />
                <SidebarItem id="notifications" label="Notifications" icon={Bell} />
                <SidebarItem id="billing" label="Billing" icon={CreditCard} />
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

            {activeTab === 'billing' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <CreditCard size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Payment Methods</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Manage your saved cards.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-14 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
                                        <div className="h-6 w-6 rounded-full bg-red-500/20" />
                                        <div className="h-6 w-6 rounded-full bg-amber-500/20 -ml-3" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">Mastercard ending in 4242</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Expires 12/25</div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">Remove</Button>
                            </div>
                            <Button variant="outline" className="w-full h-12 border-dashed border-2 rounded-xl font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
                                + Add New Card
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'teams' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <User size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Team Members</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Manage your team.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                                        <AvatarFallback>ME</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">{user?.name} (You)</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Owner</div>
                                    </div>
                                </div>
                                <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-400">Owner</Badge>
                            </div>
                             <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah`} />
                                        <AvatarFallback>SJ</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">Sarah Jenkins</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">sarah@vaultstring.com</div>
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-slate-500">Member</Badge>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
