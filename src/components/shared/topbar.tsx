// src/components/dashboard/TopBar.tsx
'use client';

import { Menu, Bell, ChevronDown } from 'lucide-react';
import { UserProfile } from '@/src/types/types';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface TopBarProps {
  user: UserProfile;
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ user, onMenuClick }) => {
  const pathname = usePathname();
  
  // Dynamically get title based on current route
  const getTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.startsWith('/dashboard/wallet')) return 'My Wallet';
    if (pathname.startsWith('/dashboard/send-money')) return 'Send Money';
    if (pathname.startsWith('/dashboard/transactions')) return 'Transaction History';
    if (pathname.startsWith('/dashboard/compliance')) return 'Compliance & KYC';
    if (pathname.startsWith('/dashboard/profile')) return 'Profile & Security';
    return 'Dashboard';
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-slate-800">{getTitle()}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer hover:opacity-80">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900 leading-none">{user.name}</p>
            <p className="text-xs text-slate-500 mt-1">Personal Account</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-slate-200 overflow-hidden border border-slate-300 relative">
            <Image 
              src={user.avatarUrl} 
              alt={user.name} 
              fill
              className="object-cover"
              sizes="36px"
            />
          </div>
          <ChevronDown size={16} className="text-slate-400" />
        </div>
        
        {/* Mobile Avatar Only */}
        <div className="md:hidden h-8 w-8 rounded-full bg-slate-200 overflow-hidden relative">
          <Image 
            src={user.avatarUrl} 
            alt={user.name} 
            fill
            className="object-cover"
            sizes="32px"
          />
        </div>
      </div>
    </header>
  );
};

export default TopBar;