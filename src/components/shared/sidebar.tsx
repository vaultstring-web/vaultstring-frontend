'use client';

import {
  LayoutDashboard,
  Wallet,
  Send,
  History,
  UserCircle,
  LogOut,
  X,
  ShieldCheck,
  Bell,
  Settings,
  FileCheck,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { setToken, setUser } from '@/src/lib/api/api-client';
import { useTranslations } from 'next-intl';
import { Logo } from '@/src/components/shared/Logo';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const t = useTranslations('Sidebar');
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser: setCtxUser } = useAuth();
  const isVerified = user?.kycStatus === 'verified';

  const primaryNav = [
    { path: '/', label: t('dashboard'), icon: LayoutDashboard },
    { path: '/wallet', label: t('wallet'), icon: Wallet },
    { path: '/send-money', label: t('sendMoney'), icon: Send },
    { path: '/transactions', label: t('transactions'), icon: History },
  ];

  const accountNav = [
    ...(isVerified
      ? []
      : [{ path: '/onboarding', label: t('verifyIdentity'), icon: ShieldCheck }]),
    { path: '/compliance', label: t('compliance'), icon: FileCheck },
    { path: '/notifications', label: t('notifications'), icon: Bell },
    { path: '/profile', label: t('profile'), icon: UserCircle },
    { path: '/settings', label: t('settings'), icon: Settings },
  ];

  const handleSignOut = () => {
    setToken(null);
    setUser(null);
    setCtxUser(null);
    router.replace('/login');
  };

  const isActive = (path: string) => {
    if (path === '/') return pathname === path;
    return pathname.startsWith(path);
  };

  const NavLink = ({
    path,
    label,
    icon: Icon,
  }: {
    path: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }) => {
    const active = isActive(path);
    return (
      <Link
        href={path}
        onClick={() => setIsOpen(false)}
        className={cn(
          'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          active
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <Icon size={18} className="shrink-0" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden
        />
      ) : null}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 flex h-full w-60 flex-col border-r border-border bg-card transition-transform duration-200 lg:static lg:h-screen lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-20 items-center justify-between border-b border-border px-4">
          <Link href="/" onClick={() => setIsOpen(false)} className="inline-flex min-w-0 flex-1 items-center">
            <Logo size="sidebar" priority />
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted lg:hidden"
            aria-label={t('closeMenu')}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto p-3">
          <div className="space-y-0.5">
            <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t('sectionMoney')}
            </p>
            {primaryNav.map((item) => (
              <NavLink key={item.path} {...item} />
            ))}
          </div>
          <div className="space-y-0.5">
            <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t('sectionAccount')}
            </p>
            {accountNav.map((item) => (
              <NavLink key={item.path} {...item} />
            ))}
          </div>
        </nav>

        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut size={18} />
            <span>{t('signOut')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
