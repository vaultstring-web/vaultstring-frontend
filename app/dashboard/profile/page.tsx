// app/dashboard/profile/page.tsx
'use client';

import { useAuth } from '@/src/context/AuthContext';
import { setToken, setUser } from '@/src/lib/api/api-client';
import PageHeader from '@/src/components/shared/PageHeader';

export default function ProfilePage() {
  const { user, setUser: setCtxUser } = useAuth();

  const logout = () => {
    setToken(null);
    setUser(null);
    setCtxUser(null);
    window.location.href = '/';
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Profile & Security" subtitle="Manage your personal details and security settings." variant="hero" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden">
                {user?.avatarUrl && <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />}
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-900">{user?.name || '—'}</div>
                <div className="text-xs text-slate-500">Personal Account</div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-500">Email</div>
                <div className="font-medium">{user?.email || '—'}</div>
              </div>
              <div>
                <div className="text-slate-500">Phone</div>
                <div className="font-medium">{user?.phone || '—'}</div>
              </div>
              <div>
                <div className="text-slate-500">KYC Status</div>
                <span className={`px-2 py-1 rounded-md text-xs ${user?.kycStatus === 'verified' ? 'bg-green-100 text-green-700' : user?.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{user?.kycStatus || '—'}</span>
              </div>
              <div>
                <div className="text-slate-500">Country</div>
                <div className="font-medium">{user?.countryCode || '—'}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="text-sm text-slate-600 mb-3">Session</div>
            <button onClick={logout} className="w-full px-3 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800">Logout</button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Current Password</label>
                <input type="password" className="mt-1 w-full border rounded-md px-3 py-2" placeholder="••••••••" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">New Password</label>
                <input type="password" className="mt-1 w-full border rounded-md px-3 py-2" placeholder="••••••••" />
              </div>
              <div className="md:col-span-2">
                <button className="px-3 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800">Update Password</button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Preferences</h3>
            <div className="space-y-3 text-sm">
              <label className="flex items-center justify-between">
                <span className="text-slate-700">Email notifications</span>
                <input type="checkbox" defaultChecked className="accent-slate-900 w-4 h-4" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-slate-700">SMS notifications</span>
                <input type="checkbox" className="accent-slate-900 w-4 h-4" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-slate-700">Two-factor authentication</span>
                <input type="checkbox" className="accent-slate-900 w-4 h-4" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
