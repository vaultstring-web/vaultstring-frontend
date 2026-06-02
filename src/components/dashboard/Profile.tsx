// src/components/dashboard/Profile.tsx
'use client';

import { User, Lock, Smartphone, Shield, History, Edit2 } from 'lucide-react';
import { UserProfile } from '@/src/types/types';

interface ProfileProps {
  user: UserProfile;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  return (
    <div className="max-w-4xl space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Profile & Security</h2>

      {/* Personal Details */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <User size={20} className="text-slate-400" />
                Personal Information
            </h3>
            <button className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                <Edit2 size={14} /> Edit
            </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Full Name</label>
                <div className="text-slate-900 font-medium">{user.name}</div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Email Address</label>
                <div className="text-slate-900 font-medium">{user.email}</div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Phone Number</label>
                <div className="text-slate-900 font-medium">{user.phone}</div>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">KYC Status</label>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 uppercase">
                    {user.kycStatus}
                </div>
            </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Shield size={20} className="text-slate-400" />
                Security Settings
            </h3>
        </div>
        
        <div className="divide-y divide-slate-100">
            {/* Password */}
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h4 className="font-medium text-slate-900">Password</h4>
                        <p className="text-sm text-slate-500">Last changed 3 months ago</p>
                    </div>
                </div>
                <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Change Password
                </button>
            </div>

            {/* 2FA */}
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <Smartphone size={24} />
                    </div>
                    <div>
                        <h4 className="font-medium text-slate-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-slate-500">Add an extra layer of security to your account</p>
                    </div>
                </div>
                <div className="flex items-center">
                   <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        <span className="ml-3 text-sm font-medium text-slate-900">Enabled</span>
                    </label>
                </div>
            </div>
        </div>
      </div>

      {/* Login History */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
             <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <History size={20} className="text-slate-400" />
                Login History
            </h3>
        </div>
        <div className="p-6">
            <table className="min-w-full">
                <thead>
                    <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        <th className="pb-3">Device</th>
                        <th className="pb-3">Location</th>
                        <th className="pb-3 text-right">Date & Time</th>
                    </tr>
                </thead>
                <tbody className="text-sm text-slate-700">
                    <tr>
                        <td className="py-3 font-medium">iPhone 13 Pro</td>
                        <td className="py-3">Lilongwe, MW</td>
                        <td className="py-3 text-right">Just now</td>
                    </tr>
                    <tr>
                        <td className="py-3 font-medium">Windows PC (Chrome)</td>
                        <td className="py-3">Blantyre, MW</td>
                        <td className="py-3 text-right">Oct 25, 2023 - 14:30</td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Profile;