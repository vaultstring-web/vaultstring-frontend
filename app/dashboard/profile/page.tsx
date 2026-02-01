'use client';

import { useAuth } from '@/src/context/AuthContext';
import { setToken, setUser } from '@/src/lib/api/api-client';
import PageHeader from '@/src/components/shared/PageHeader';
import { User, Mail, Phone, Shield, LogOut, Lock, Bell } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, setUser: setCtxUser } = useAuth();
  const router = useRouter();

  const logout = () => {
    setToken(null);
    setUser(null);
    setCtxUser(null);
    router.push('/login?logout=true');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Profile & Settings" subtitle="Manage your personal information and account security." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: User Card */}
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader className="text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <User size={40} className="text-slate-400" />
            </div>
            <CardTitle>{user?.name || 'User'}</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
            <div className="mt-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user?.kycStatus === 'verified' 
                    ? 'bg-green-100 text-green-700' 
                    : user?.kycStatus === 'pending' 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-slate-100 text-slate-700'
                }`}>
                    {String(user?.kycStatus || 'Unverified').charAt(0).toUpperCase() + String(user?.kycStatus || 'unverified').slice(1)}
                </span>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={logout}>
                <LogOut size={16} className="mr-2" />
                Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Right Column: Details & Settings */}
        <div className="md:col-span-2 space-y-6">
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <User size={20} className="text-slate-500" />
                        Personal Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 uppercase">Full Name</label>
                            <div className="p-3 bg-slate-50 rounded-md border border-slate-100 text-sm font-medium text-slate-900">
                                {user?.name || '—'}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 uppercase">Phone Number</label>
                            <div className="p-3 bg-slate-50 rounded-md border border-slate-100 text-sm font-medium text-slate-900 flex items-center gap-2">
                                <Phone size={14} className="text-slate-400" />
                                {user?.phone || '—'}
                            </div>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-medium text-slate-500 uppercase">Email Address</label>
                            <div className="p-3 bg-slate-50 rounded-md border border-slate-100 text-sm font-medium text-slate-900 flex items-center gap-2">
                                <Mail size={14} className="text-slate-400" />
                                {user?.email || '—'}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Shield size={20} className="text-slate-500" />
                        Security & Privacy
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                                <Lock size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-900">Change Password</h4>
                                <p className="text-xs text-slate-500">Update your account password</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 rounded-full text-purple-600">
                                <Bell size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-900">Notifications</h4>
                                <p className="text-xs text-slate-500">Manage your email and push notifications</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
