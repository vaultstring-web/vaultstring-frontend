import React, { useState } from 'react';
import { User, Edit2, Save, X, Loader2 } from 'lucide-react';
import { UserProfile } from '@/src/types/types';
import { apiFetch } from '@/src/lib/api/api-client';
import { toast } from 'sonner';

interface PersonalDetailsProps {
  user: UserProfile;
}

const PersonalDetails: React.FC<PersonalDetailsProps> = ({ user: initialUser }) => {
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialUser.name,
    email: initialUser.email,
    phone: initialUser.phone || ''
  });

  const handleEdit = () => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || ''
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || ''
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Assuming PATCH /users/me endpoint
      const response = await apiFetch('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(formData),
      });

      // Optimistic update or use response
      setUser({ ...user, ...formData });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <User size={20} className="text-slate-400" />
          Personal Information
        </h3>
        {!isEditing ? (
          <button 
            onClick={handleEdit}
            className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1 transition-colors"
          >
            <Edit2 size={14} /> Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
             <button 
              onClick={handleCancel}
              disabled={isLoading}
              className="text-sm text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors"
            >
              <X size={14} /> Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isLoading}
              className="text-sm bg-green-600 text-white hover:bg-green-700 font-medium flex items-center gap-1 px-3 py-1.5 rounded-md shadow-sm transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
            </button>
          </div>
        )}
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
            />
          ) : (
            <div className="text-slate-900 dark:text-slate-200 font-medium">{user.name}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
           {/* Email is typically read-only or requires separate verification flow */}
           <div className="text-slate-900 dark:text-slate-200 font-medium opacity-70 cursor-not-allowed" title="Email cannot be changed directly">
              {user.email}
              {isEditing && <span className="text-xs text-slate-400 ml-2">(Contact support to change)</span>}
           </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Phone Number</label>
          {isEditing ? (
             <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
            />
          ) : (
            <div className="text-slate-900 dark:text-slate-200 font-medium">{user.phone || 'Not set'}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">KYC Status</label>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 uppercase">
            {user.kycStatus}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetails;
