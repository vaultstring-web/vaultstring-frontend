'use client';

import React from 'react';
import { UserProfile } from '@/src/types/types';
import PersonalDetails from '@/src/components/dashboard/profile/PersonalDetails';
import SecuritySettings from '@/src/components/dashboard/profile/SecuritySettings';
import LoginHistory from '@/src/components/dashboard/profile/LoginHistory';

interface ProfileProps {
  user: UserProfile;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Profile & Security</h2>

      {/* Personal Details */}
      <PersonalDetails user={user} />

      {/* Security Settings */}
      <SecuritySettings />

      {/* Login History */}
      <LoginHistory />
    </div>
  );
};

export default Profile;
