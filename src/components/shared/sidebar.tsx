'use client';

import { 
  LayoutDashboard, 
  Wallet, 
  Send, 
  History, 
  UserCircle, 
  LogOut, 
  X,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { setToken, setUser } from '@/src/lib/api/api-client';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { setUser: setCtxUser } = useAuth();
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/wallet', label: 'My Wallet', icon: Wallet },
    { path: '/dashboard/send-money', label: 'Send Money', icon: Send },
    { path: '/dashboard/transactions', label: 'Transactions', icon: History },
    { path: '/dashboard/compliance', label: 'Compliance (KYC)', icon: ShieldCheck },
    { path: '/dashboard/profile', label: 'Profile', icon: UserCircle },
  ];

  const handleSignOut = () => {
    setToken(null);
    setUser(null);
    setCtxUser(null);
    router.replace('/');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-transform duration-300 ease-in-out flex flex-col border-r border-slate-200 dark:border-slate-800
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-screen
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <Link 
            href="/dashboard" 
            className="flex items-center justify-center w-full"
            onClick={() => setIsOpen(false)}
          >
            <img 
              src="/icons/vs1.svg" 
              alt="VaultString Logo" 
              className="h-20 w-auto md:h-25 lg:h-25"
            />
          </Link>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold
                  ${active 
                    ? 'bg-slate-900 dark:bg-green-600 text-white shadow-lg shadow-slate-200 dark:shadow-none' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors font-bold"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
