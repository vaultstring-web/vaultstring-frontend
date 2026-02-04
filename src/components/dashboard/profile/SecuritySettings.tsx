import React from 'react';
import { Shield, Lock, Smartphone } from 'lucide-react';

const SecuritySettings: React.FC = () => {
  return (
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
  );
};

export default SecuritySettings;
