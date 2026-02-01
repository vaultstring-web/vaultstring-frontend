// src/components/dashboard/TopBar.tsx
'use client';

import { useState, useEffect } from 'react';
import { Menu, Bell, ChevronDown, Sun, Moon } from 'lucide-react';
import { UserProfile } from '@/src/types/types';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';

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
    <header className="sticky top-0 z-30 w-full bg-card text-card-foreground border-b h-16 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-muted-foreground hover:bg-muted rounded-md"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold">{getTitle()}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border"></span>
        </button>

        <button
          aria-label="Toggle theme"
          suppressHydrationWarning
          onClick={() => setTheme((resolvedTheme === 'dark') ? 'light' : 'dark')}
          className="p-2 rounded-full hover:bg-muted text-muted-foreground"
        >
          {mounted && (resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />)}
        </button>
        
        <div className="hidden md:flex items-center gap-3 pl-4 border-l cursor-pointer hover:opacity-80">
          <div className="text-right">
            <p className="text-sm font-medium leading-none">{user?.name || ''}</p>
            <p className="text-xs text-muted-foreground mt-1">{user?.accountLabel || '—'}</p>
          </div>
          <div className="h-9 w-9 rounded-full overflow-hidden border relative">
            <Image 
              src={user?.avatarUrl || '/icons/avatar-default.png'} 
              alt={user?.name || ''} 
              fill
              className="object-cover"
              sizes="36px"
            />
          </div>
          <ChevronDown size={16} className="text-muted-foreground" />
        </div>
        
        {/* Mobile Avatar Only */}
        <div className="md:hidden h-8 w-8 rounded-full overflow-hidden relative border">
          <Image 
            src={user?.avatarUrl || '/icons/avatar-default.png'} 
            alt={user?.name || ''} 
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