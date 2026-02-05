'use client';

import { useAuth } from '@/src/context/AuthContext';
import { setToken, setUser } from '@/src/lib/api/api-client';
import { User, Mail, Phone, Shield, LogOut, Lock, Bell, ChevronRight, Fingerprint, Camera, Sparkles } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
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
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Premium Glass Header - Fixes the overlapping issue */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[32px] p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/20 blur-[100px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-green-400 font-bold text-xs uppercase tracking-[0.3em] mb-3">
              <Sparkles size={14} /> Premium Account
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">Profile Settings</h1>
            <p className="text-slate-400 mt-2 font-medium max-w-md">Control your security, personal identity, and global account preferences.</p>
          </div>
          <Button onClick={logout} className="bg-white/10 hover:bg-white/20 backdrop-blur-md border-white/10 rounded-2xl h-14 px-8 font-bold gap-2">
            <LogOut size={18} /> Sign Out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Identity Card */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-[0_30px_60px_rgba(0,0,0,0.04)] rounded-[40px] overflow-hidden bg-white group">
            <div className="h-32 bg-gradient-to-r from-slate-100 to-slate-200" />
            <CardContent className="pt-0 px-8 pb-10 flex flex-col items-center">
              <div className="relative -mt-16 group/avatar">
                <div className="w-32 h-32 rounded-[38px] bg-white p-1.5 shadow-2xl transition-transform group-hover/avatar:scale-105 duration-500">
                  <div className="w-full h-full rounded-[32px] bg-slate-900 flex items-center justify-center text-3xl font-black text-white overflow-hidden">
                    {user?.name?.charAt(0) || <User size={40} />}
                  </div>
                </div>
                <button className="absolute bottom-1 right-1 p-2.5 bg-green-500 rounded-2xl text-white shadow-lg hover:scale-110 transition-transform">
                  <Camera size={16} />
                </button>
              </div>
              
              <h3 className="mt-6 text-2xl font-black text-slate-900">{user?.name}</h3>
              <p className="text-slate-400 font-bold text-sm mb-6">{user?.email}</p>
              
              <div className="flex gap-2 w-full">
                <div className="flex-1 bg-slate-50 p-4 rounded-[24px] text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase">KYC Level</p>
                  <p className="text-lg font-black text-slate-900 mt-1 capitalize">{user?.kycStatus || '1'}</p>
                </div>
                <div className="flex-1 bg-green-50 p-4 rounded-[24px] text-center border border-green-100">
                  <p className="text-[10px] font-black text-green-600 uppercase">Trust Score</p>
                  <p className="text-lg font-black text-green-700 mt-1">98%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Center */}
        <div className="lg:col-span-8 space-y-8">
          <section className="space-y-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Account Metadata</h2>
            <div className="bg-white rounded-[40px] shadow-[0_10px_40px_rgba(0,0,0,0.02)] p-4 border border-slate-50">
              <PremiumRow icon={<User className="text-blue-500" />} label="Display Name" value={user?.name} />
              <PremiumRow icon={<Mail className="text-purple-500" />} label="Login Email" value={user?.email} />
              <PremiumRow icon={<Phone className="text-amber-500" />} label="Mobile Number" value={user?.phone || 'Add phone'} isLast />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Security Infrastructure</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SecurityCard icon={<Fingerprint />} title="Biometric Security" desc="Unlock with Face/Touch ID" active />
              <SecurityCard icon={<Shield />} title="Two-Factor Auth" desc="Protect with Authenticator" />
              <SecurityCard icon={<Lock />} title="Privacy Mode" desc="Mask balances on dashboard" />
              <SecurityCard icon={<Bell />} title="Live Notifications" desc="Real-time transaction alerts" active />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Custom Premium Components for Dribbble look
function PremiumRow({ icon, label, value, isLast }: any) {
  return (
    <div className={`flex items-center justify-between p-6 ${!isLast ? 'border-b border-slate-50' : ''} group hover:bg-slate-50 transition-all rounded-[24px]`}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}</p>
          <p className="text-sm font-black text-slate-900 mt-0.5">{value}</p>
        </div>
      </div>
      <ChevronRight size={18} className="text-slate-200 group-hover:text-slate-900 transition-colors" />
    </div>
  );
}

function SecurityCard({ icon, title, desc, active }: any) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm flex items-center justify-between group hover:border-green-200 transition-all cursor-pointer">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${active ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-900">{title}</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase">{desc}</p>
        </div>
      </div>
      <div className={`w-10 h-5 rounded-full relative ${active ? 'bg-green-500' : 'bg-slate-200'}`}>
        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`} />
      </div>
    </div>
  );
}