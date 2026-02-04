import React from 'react';
import { User, Edit2 } from 'lucide-react';
import { UserProfile } from '@/src/types/types';

interface PersonalDetailsProps {
  user: UserProfile;
}

const PersonalDetails: React.FC<PersonalDetailsProps> = ({ user }) => {
  return (
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
  );
};

export default PersonalDetails;
