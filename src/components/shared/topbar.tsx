// src/components/dashboard/TopBar.tsx
'use client';

import { useState, useEffect } from 'react';
import { Menu, Bell, ChevronDown, Sun, Moon, Search, LogOut, Settings, User as UserIcon, Shield, CreditCard, Clock, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '@/src/types/types';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { Input } from '@/src/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { apiFetch, setToken, setUser as setGlobalUser } from '@/src/lib/api/api-client';
import { toast } from 'sonner';

interface TopBarProps {
  user: UserProfile | null;
  onMenuClick: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}

const TopBar: React.FC<TopBarProps> = ({ user, onMenuClick }) => {
  const t = useTranslations('TopBar');
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await apiFetch('/notifications');
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (e) {
      // Fail silently for background sync
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = searchQuery.trim().replace(/[<>]/g, ''); // Basic XSS sanitization
    if (cleanQuery) {
      router.push(`/transactions?query=${encodeURIComponent(cleanQuery)}`);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setGlobalUser(null);
    window.location.href = '/login';
  };
  
  // Dynamically get title based on current route
  const getTitle = () => {
    if (pathname === '/') return t('titles.dashboard');
    if (pathname.startsWith('/wallet')) return t('titles.wallet');
    if (pathname.startsWith('/send-money')) return t('titles.sendMoney');
    if (pathname.startsWith('/transactions')) return t('titles.transactions');
    if (pathname.startsWith('/compliance')) return t('titles.compliance');
    if (pathname.startsWith('/profile')) return t('titles.profile');
    if (pathname.startsWith('/translation')) return t('titles.translation');
    if (pathname.startsWith('/onboarding')) return t('titles.onboarding');
    return t('titles.dashboard');
  };

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
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden md:block">
            {t('welcomeBack', { name: user?.name?.split(' ')?.[0] || t('fallbackUser') })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex relative w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
           <Input 
             placeholder={t('search.placeholder')} 
             className="pl-10 h-9 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-green-500/20 text-sm"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </form>

        <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors group">
                  <Bell size={20} className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-white dark:border-slate-900 animate-in zoom-in">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-[24px] p-2 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-2xl">
                <div className="px-4 py-3 flex items-center justify-between border-b border-slate-50 dark:border-slate-800 mb-2">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">{t('notifications.title')}</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded-full">
                      {t('notifications.newCount', { count: unreadCount })}
                    </span>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto space-y-1 scrollbar-hide">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center space-y-2">
                      <div className="h-12 w-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                        <Bell size={20} className="text-slate-300" />
                      </div>
                      <p className="text-xs font-bold text-slate-400">{t('notifications.empty')}</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button 
                        key={n.id} 
                        onClick={() => markAsRead(n.id)}
                        className={`w-full text-left p-3 rounded-2xl transition-all ${n.is_read ? 'opacity-60 grayscale-[0.5]' : 'bg-slate-50 dark:bg-slate-800/50 shadow-sm'} hover:bg-slate-100 dark:hover:bg-slate-800 group relative`}
                      >
                        {!n.is_read && <div className="absolute top-4 right-4 h-2 w-2 bg-indigo-500 rounded-full" />}
                        <div className="flex gap-3">
                          <div className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center ${
                            n.type === 'success' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' :
                            n.type === 'error' ? 'bg-red-50 dark:bg-red-500/10 text-red-600' :
                            'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600'
                          }`}>
                            {n.type === 'success' ? <CheckCircle2 size={14} /> : 
                             n.type === 'error' ? <Shield size={14} /> : <Clock size={14} />}
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">{n.title}</p>
                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 line-clamp-2">{n.message}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Just now</p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <DropdownMenuSeparator className="bg-slate-50 dark:bg-slate-800" />
                <DropdownMenuItem className="justify-center text-xs font-bold text-slate-500 hover:text-indigo-600 cursor-pointer p-3 focus:bg-slate-50 rounded-xl" onClick={() => router.push('/notifications')}>
                  {t('notifications.viewAll')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              aria-label={t('theme.toggleAria')}
              suppressHydrationWarning
              onClick={() => setTheme((resolvedTheme === 'dark') ? 'light' : 'dark')}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            >
              {mounted && (resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />)}
            </button>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
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
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-[32px] p-2 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-2xl animate-in slide-in-from-top-4 duration-300">
            <DropdownMenuLabel className="px-4 py-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{t('account.signedInAs')}</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-50 dark:bg-slate-800 mx-2" />
            <div className="p-1 space-y-1">
              <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 group focus:bg-slate-50" onClick={() => router.push('/profile')}>
                <div className="h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                  <UserIcon size={16} className="text-slate-500 group-hover:text-indigo-600" />
                </div>
                <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{t('account.myProfile')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 group focus:bg-slate-50" onClick={() => router.push('/profile?tab=security')}>
                <div className="h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                  <Shield size={16} className="text-slate-500 group-hover:text-green-600" />
                </div>
                <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{t('account.security')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 group focus:bg-slate-50" onClick={() => router.push('/wallet')}>
                <div className="h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                  <CreditCard size={16} className="text-slate-500 group-hover:text-amber-600" />
                </div>
                <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{t('account.billing')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 group focus:bg-slate-50" onClick={() => router.push('/settings')}>
                <div className="h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                  <Settings size={16} className="text-slate-500 group-hover:text-slate-900" />
                </div>
                <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Settings</span>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="bg-slate-50 dark:bg-slate-800 mx-2" />
            <div className="p-1">
              <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/20 group focus:bg-red-50 transition-colors" onClick={handleLogout}>
                <div className="h-8 w-8 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
                  <LogOut size={16} className="text-red-600" />
                </div>
                <span className="font-bold text-sm text-red-600">Sign Out</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
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
