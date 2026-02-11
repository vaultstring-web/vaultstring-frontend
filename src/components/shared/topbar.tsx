// src/components/dashboard/TopBar.tsx
'use client';

import { useState, useEffect } from 'react';
import { Menu, Bell, ChevronDown, Sun, Moon, Search } from 'lucide-react';
import { UserProfile } from '@/src/types/types';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Input } from '@/src/components/ui/input';

interface TopBarProps {
  user: UserProfile | null;
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

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 h-16 transition-all duration-200">
      <div className="h-full flex items-center justify-between px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{getTitle()}</h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden md:block">Welcome back, {user?.name?.split(' ')[0]}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        {/* Search Bar - Desktop */}
        <div className="hidden md:flex relative w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
           <Input 
             placeholder="Search transactions..." 
             className="pl-10 h-9 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-green-500/20 text-sm"
           />
        </div>

        <div className="flex items-center gap-2">
            <button className="relative p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors group">
              <Bell size={20} className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              <span className="absolute top-2 right-2 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-white dark:border-slate-900">
                2
              </span>
            </button>

            <button
              aria-label="Toggle theme"
              suppressHydrationWarning
              onClick={() => setTheme((resolvedTheme === 'dark') ? 'light' : 'dark')}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            >
              {mounted && (resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />)}
            </button>
        </div>
        
        <div className="hidden md:flex items-center gap-3 pl-6 ml-6 border-l border-slate-200 dark:border-slate-800 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{user?.name || 'User'}</p>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">{user?.accountLabel || 'Standard'}</p>
          </div>
          <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm relative group-hover:scale-105 transition-transform bg-slate-100 dark:bg-slate-800">
            <Image 
              src={(user?.avatarUrl && !user.avatarUrl.includes('avatar-default.png')) ? user.avatarUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`}
              alt={user?.name || ''} 
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <ChevronDown size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
        
        {/* Mobile Avatar */}
        <div className="md:hidden h-9 w-9 rounded-xl overflow-hidden relative border border-slate-200 dark:border-slate-700">
          <Image 
            src={user?.avatarUrl || '/icons/avatar-default.png'} 
            alt={user?.name || ''} 
            fill
            className="object-cover"
            sizes="36px"
          />
        </div>
      </div>
      </div>
    </header>
  );
};

export default TopBar;
