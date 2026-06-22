// src/components/shared/topbar.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Menu, Bell, ChevronDown, Sun, Moon, Search, 
  LogOut, User as UserIcon, Shield, History,
  CreditCard, Clock, CheckCircle2, X, Wallet, 
  Users, ArrowRight, Loader2, Sparkles
} from 'lucide-react';
import { UserProfile } from '@/src/types/types';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Logo } from '@/src/components/shared/Logo';
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
import { motion, AnimatePresence } from 'framer-motion';

interface TopBarProps {
  user: UserProfile | null;
  onMenuClick: () => void;
}

function accountLabelKey(user: UserProfile | null): string {
  const type = String(user?.userType || 'individual').toLowerCase();
  const country = String(user?.countryCode || 'MW').toUpperCase();
  if (country === 'MW' && type === 'individual') return 'account.senderMalawi';
  if (country === 'CN' && (type === 'merchant' || type === 'agent')) return 'account.receiverChina';
  if (type === 'merchant') return 'account.business';
  if (type === 'agent') return 'account.agent';
  return 'account.personal';
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
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vs_search_history');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    setMounted(true);
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle outside click for search suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Search Logic
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const q = searchQuery.trim().toLowerCase();
        const results: Array<{ id: string; type: string; title: string; subtitle: string; icon: typeof History }> = [];

        const [paymentsRes, walletsRes, recipientsRes] = await Promise.all([
          apiFetch('/payments?limit=30').catch(() => null),
          apiFetch('/wallets').catch(() => null),
          apiFetch(`/wallets/search?q=${encodeURIComponent(searchQuery.trim())}`).catch(() => []),
        ]);

        const payments = Array.isArray(paymentsRes?.transactions) ? paymentsRes.transactions : [];
        for (const tx of payments) {
          const receiver = String(tx.receiver_name || tx.receiver_wallet_number || '');
          const description = String(tx.description || tx.reference || '');
          const haystack = `${receiver} ${description} ${tx.currency || ''}`.toLowerCase();
          if (!haystack.includes(q)) continue;
          results.push({
            id: String(tx.id),
            type: 'transaction',
            title: receiver ? t('search.paymentTo', { name: receiver }) : t('search.transaction'),
            subtitle: `${tx.amount ?? ''} ${tx.currency ?? ''} · ${tx.status ?? ''}`,
            icon: History,
          });
          if (results.length >= 4) break;
        }

        const wallets = Array.isArray(walletsRes?.wallets) ? walletsRes.wallets : (Array.isArray(walletsRes) ? walletsRes : []);
        for (const w of wallets) {
          const label = `${w.currency || ''} ${w.cardholder_name || ''}`.trim();
          if (!label.toLowerCase().includes(q) && !String(w.wallet_address || '').includes(q)) continue;
          results.push({
            id: String(w.id || w.wallet_id),
            type: 'wallet',
            title: `${w.currency || ''} ${t('search.wallet')}`,
            subtitle: `${w.available_balance ?? ''} ${w.currency ?? ''}`,
            icon: Wallet,
          });
          if (results.length >= 6) break;
        }

        const recipients = Array.isArray(recipientsRes) ? recipientsRes : [];
        for (const r of recipients.slice(0, 3)) {
          results.push({
            id: String(r.wallet_address || r.id || r.user_id),
            type: 'recipient',
            title: String(r.name || r.email || t('search.recipient')),
            subtitle: String(r.email || r.wallet_address || ''),
            icon: Users,
          });
        }

        setSearchSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Search failed', error);
        setSearchSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchNotifications = async () => {
    try {
      const data = await apiFetch('/notifications');
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch {
      // Background fail silent
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      /* ignore */
    }
  };

  const addToHistory = (query: string) => {
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('vs_search_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('vs_search_history');
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      addToHistory(searchQuery.trim());
      router.push(`/transactions?query=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => Math.min(prev + 1, searchSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      const item = searchSuggestions[selectedIndex];
      const routes: Record<string, string> = {
        transaction: '/transactions',
        wallet: '/wallet',
        recipient: '/send-money',
      };
      router.push(routes[item.type] ?? '/transactions');
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setGlobalUser(null);
    window.location.href = '/login';
  };
  
  const getTitle = () => {
    if (pathname === '/') return t('titles.dashboard');
    if (pathname.startsWith('/wallet')) return t('titles.wallet');
    if (pathname.startsWith('/send-money')) return t('titles.sendMoney');
    if (pathname.startsWith('/transactions')) return t('titles.transactions');
    if (pathname.startsWith('/compliance')) return t('titles.compliance');
    if (pathname.startsWith('/profile')) return t('titles.profile');
    if (pathname.startsWith('/translation')) return t('titles.translation');
    if (pathname.startsWith('/settings')) return t('titles.settings');
    if (pathname.startsWith('/onboarding')) return t('titles.onboarding');
    if (pathname.startsWith('/notifications')) return t('Notifications.title');
    return t('titles.dashboard');
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-border bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted lg:hidden"
            aria-label={t('a11y.openMenu')}
          >
            <Menu size={22} />
          </button>
          <div className="sm:hidden">
            <Logo size="topbar" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-semibold tracking-tight text-foreground">{getTitle()}</h1>
            <p className="text-xs text-muted-foreground">
              {t('welcomeBack', { name: user?.name?.split(' ')?.[0] || t('fallbackUser') })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          {/* Enhanced Search Bar */}
          <div className="hidden md:block relative w-96" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 group-focus-within:scale-110">
                {isSearching ? (
                  <Loader2 className="text-indigo-500 animate-spin" size={18} />
                ) : (
                  <Search className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                )}
              </div>
              <Input
                placeholder={t('search.placeholder')}
                className="h-9 rounded-md border border-input bg-background pl-10 pr-10 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => (searchQuery.length >= 2 || searchHistory.length > 0) && setShowSuggestions(true)}
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all"
                >
                  <X size={14} />
                </button>
              )}
            </form>

            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg"
                >
                  <div className="p-3 max-h-[480px] overflow-y-auto scrollbar-hide space-y-4">
                    {/* History Section */}
                    {searchQuery.length < 2 && searchHistory.length > 0 && (
                      <div className="space-y-2">
                        <div className="px-3 flex items-center justify-between">
                          <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            <Clock size={12} /> {t('search.recentSearches')}
                          </span>
                          <button 
                            onClick={clearHistory}
                            className="text-[10px] font-semibold uppercase tracking-wide text-destructive hover:underline"
                          >
                            {t('search.clear')}
                          </button>
                        </div>
                        <div className="grid gap-1">
                          {searchHistory.map((query, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSearchQuery(query);
                                handleSearchSubmit();
                              }}
                              className="w-full text-left p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-3"
                            >
                              <History size={14} className="text-slate-300" />
                              {query}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Results Section */}
                    {searchQuery.length >= 2 && (
                      <div className="space-y-2">
                        <div className="px-3">
                          <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-primary">
                            <Sparkles size={12} /> {t('search.aiSuggestions')}
                          </span>
                        </div>
                        {searchSuggestions.length === 0 && !isSearching ? (
                          <div className="p-8 text-center space-y-2">
                            <div className="h-12 w-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                              <Search size={20} className="text-slate-300" />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('search.noResults')}</p>
                          </div>
                        ) : (
                          <div className="grid gap-1">
                            {searchSuggestions.map((item, idx) => {
                              const Icon = item.icon;
                              return (
                                <button
                                  key={item.id}
                                  onMouseEnter={() => setSelectedIndex(idx)}
                                  onClick={() => {
                                    const routes: Record<string, string> = {
                                      transaction: '/transactions',
                                      wallet: '/wallet',
                                      recipient: '/send-money',
                                    };
                                    router.push(routes[item.type] || '/');
                                    setShowSuggestions(false);
                                  }}
                                  className={`w-full text-left p-3 rounded-2xl transition-all flex items-center gap-4 group ${selectedIndex === idx ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                >
                                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${selectedIndex === idx ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-white group-hover:text-indigo-600'}`}>
                                    <Icon size={18} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`truncate text-sm font-semibold ${selectedIndex === idx ? 'text-primary' : 'text-foreground'}`}>{item.title}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">{item.subtitle}</p>
                                  </div>
                                  <ArrowRight size={14} className={`transition-all ${selectedIndex === idx ? 'opacity-100 translate-x-0 text-indigo-600' : 'opacity-0 -translate-x-2'}`} />
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-destructive text-[10px] font-semibold text-destructive-foreground">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-96 rounded-lg border-border bg-card p-4 shadow-lg">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-sm font-semibold text-foreground">{t('notifications.title')}</h3>
                  <button 
                    onClick={() => router.push('/notifications')}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {t('notifications.viewAll')}
                  </button>
                </div>
                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center space-y-4">
                      <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                        <Bell size={24} className="text-slate-200" />
                      </div>
                      <p className="text-xs font-medium text-muted-foreground">{t('notifications.empty')}</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button 
                        key={n.id} 
                        onClick={() => {
                          markAsRead(n.id);
                          router.push('/notifications');
                        }}
                        className={`w-full text-left p-4 rounded-2xl transition-all flex gap-4 relative group ${n.is_read ? 'opacity-60' : 'bg-slate-50 dark:bg-slate-800/50 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800'}`}
                      >
                        {!n.is_read && <div className="absolute top-5 right-5 h-2 w-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />}
                        <div className={`h-10 w-10 rounded-xl shrink-0 flex items-center justify-center ${
                          n.type === 'success' ? 'bg-green-500 text-white' :
                          n.type === 'error' ? 'bg-red-500 text-white' :
                          'bg-indigo-600 text-white'
                        }`}>
                          {n.type === 'success' ? <CheckCircle2 size={18} /> : 
                           n.type === 'error' ? <Shield size={18} /> : <Clock size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{n.title}</p>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{n.message}</p>
                          <p className="mt-2 text-xs text-muted-foreground">{t('notifications.justNow')}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted"
              aria-label={t('theme.toggleAria')}
            >
              {mounted && (resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />)}
            </button>

            <div className="mx-2 hidden h-8 w-px bg-border md:block" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="flex items-center gap-2 rounded-md p-1 transition-colors hover:bg-muted">
                  <div className="relative h-9 w-9 overflow-hidden rounded-md bg-muted ring-1 ring-border">
                    <Image 
                      src={(user?.avatarUrl && !user.avatarUrl.includes('avatar-default.png')) ? user.avatarUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`}
                      alt={user?.name || t('fallbackUser')}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="hidden text-left md:block">
                    <p className="text-sm font-medium leading-none text-foreground">{user?.name || t('fallbackUser')}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{t(accountLabelKey(user))}</p>
                  </div>
                  <ChevronDown size={16} className="text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="mt-2 w-64 rounded-lg border-border bg-card p-2 shadow-lg">
                <DropdownMenuLabel className="p-4">
                  <p className="text-xs font-medium text-muted-foreground">{t('account.signedInAs')}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate mt-1">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-50 dark:bg-slate-800" />
                <div className="p-1">
                  <DropdownMenuItem 
                    onClick={() => router.push('/profile')}
                    className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-800 group"
                  >
                    <div className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <UserIcon size={18} />
                    </div>
                    <span className="text-sm font-bold">{t('account.myProfile')}</span>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-slate-50 dark:bg-slate-800" />
                <div className="p-1">
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer focus:bg-red-50 dark:focus:bg-red-500/10 group text-red-600"
                  >
                    <div className="h-9 w-9 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
                      <LogOut size={18} />
                    </div>
                    <span className="text-sm font-bold">{t('account.signOut')}</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
