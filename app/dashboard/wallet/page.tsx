'use client';

import { useAuth } from '@/src/context/AuthContext';
import { Plus, CreditCard, Sparkles, ShieldCheck, Wallet as WalletIcon } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { useWalletStats } from '@/src/hooks/useWalletStats';
import WalletCard from '@/src/components/dashboard/wallet/WalletCard';
import { CreateWalletModal } from '@/src/components/dashboard/wallet/CreateWalletModal';
import { DepositModal } from '@/src/components/dashboard/wallet/DepositModal';
import { useState } from 'react';
import { Wallet } from '@/src/hooks/useWalletStats';
import { toast } from 'sonner';

export default function WalletPage() {
  const { user } = useAuth();
  const userId = user?.id || (user as any)?.ID || '';
  const isVerified = user?.kycStatus === 'verified';
  
  const { wallets, loading, stats, refetch } = useWalletStats();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [depositWallet, setDepositWallet] = useState<Wallet | null>(null);

  const handleCreateWallet = () => {
    if (!isVerified) {
      toast.error("Identity Verification Required", { 
        description: "Please complete your KYC to unlock multi-currency wallets.",
        className: "rounded-[20px] font-bold" 
      });
      return;
    }
    setIsCreateModalOpen(true);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 py-8">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-[0.3em] mb-2">
            <Sparkles size={14} /> Account Balances
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">My Wallets</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage your cards, digital assets, and liquidity tiers.</p>
        </div>
        
        <Button 
          className={`h-14 rounded-2xl px-8 font-black transition-all shadow-xl shadow-green-100 dark:shadow-none ${
            !isVerified ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500' : 'bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-200 text-white dark:text-slate-900'
          }`}
          onClick={handleCreateWallet}
        >
          <Plus size={20} className="mr-2" /> Add New Card
        </Button>
      </div>

      {/* Verification Shield Notice */}
      {!isVerified && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-5 rounded-[28px] flex items-center gap-4 animate-pulse">
           <ShieldCheck className="text-amber-600 dark:text-amber-400" size={24} />
           <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
             Verify your identity to increase limits and add more currency cards.
           </p>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="aspect-[1.586/1] bg-slate-100 dark:bg-slate-800 rounded-[32px] animate-pulse" />
          ))
        ) : (
          <>
            {wallets.map((wallet) => (
              <div key={wallet.id} className="group transition-transform hover:scale-[1.02] duration-500">
                <WalletCard 
                  wallet={wallet} 
                  userId={userId} 
                  onDeposit={(w) => isVerified ? setDepositWallet(w) : handleCreateWallet()}
                />
              </div>
            ))}
            
            {/* The "Hero" Add Button - Nice and Visible */}
            <button 
              onClick={handleCreateWallet}
              className={`relative aspect-[1.586/1] rounded-[40px] border-2 border-dashed transition-all group overflow-hidden ${
                  !isVerified 
                  ? 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 opacity-60 cursor-not-allowed' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50/10 dark:hover:bg-green-500/5 shadow-sm'
              }`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-green-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 flex flex-col items-center justify-center gap-5 p-10">
                <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center transition-all ${
                    !isVerified 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600' 
                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl group-hover:scale-110'
                }`}>
                  <CreditCard size={32} strokeWidth={2.5} />
                </div>
                <div className="text-center">
                    <span className={`block text-lg font-black tracking-tight ${!isVerified ? 'text-slate-400 dark:text-slate-600' : 'text-slate-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400'}`}>
                        {isVerified ? 'Add Multi-Currency Card' : 'Verification Required'}
                    </span>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-tighter">Unlock global spending</p>
                </div>
              </div>
            </button>
          </>
        )}
      </div>

      {/* Modals */}
      <CreateWalletModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} onSuccess={refetch} />
      <DepositModal 
        wallet={depositWallet}
        open={!!depositWallet}
        onOpenChange={(open) => !open && setDepositWallet(null)}
        onSuccess={refetch}
      />
    </div>
  );
}