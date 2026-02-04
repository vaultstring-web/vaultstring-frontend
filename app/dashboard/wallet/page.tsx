'use client';

import { useAuth } from '@/src/context/AuthContext';
import { Plus } from 'lucide-react';
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
      toast.error("Account Verification Required", { description: "Please complete your KYC verification to create a wallet." });
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleDeposit = (wallet: Wallet) => {
    if (!isVerified) {
      toast.error("Account Verification Required", { description: "Please complete your KYC verification to deposit funds." });
      return;
    }
    setDepositWallet(wallet);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Wallets</h1>
          <p className="text-slate-500 mt-1">Manage your cards and balances.</p>
        </div>
        <Button 
          className={`hidden md:flex gap-2 rounded-full px-6 ${!isVerified ? 'opacity-50 cursor-not-allowed bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
          onClick={handleCreateWallet}
        >
          <Plus size={18} /> Add New Card
        </Button>
      </div>

      <CreateWalletModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
        onSuccess={refetch}
      />

      <DepositModal 
        wallet={depositWallet}
        open={!!depositWallet}
        onOpenChange={(open) => !open && setDepositWallet(null)}
        onSuccess={refetch}
      />

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[1.586/1] bg-slate-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wallets.map((wallet) => (
            <WalletCard 
              key={wallet.id} 
              wallet={wallet} 
              userId={userId} 
              onDeposit={handleDeposit}
            />
          ))}
          
          <button 
            onClick={handleCreateWallet}
            className={`aspect-[1.586/1] rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 group ${
                !isVerified 
                ? 'border-slate-200 opacity-60 cursor-not-allowed' 
                : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
            }`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                !isVerified 
                ? 'bg-slate-100 text-slate-300' 
                : 'bg-slate-100 group-hover:bg-indigo-100 text-slate-400 group-hover:text-indigo-600'
            }`}>
              <Plus size={32} />
            </div>
            <span className={`font-medium ${!isVerified ? 'text-slate-400' : 'text-slate-500 group-hover:text-indigo-600'}`}>
                {!isVerified ? 'Verification Required' : 'Add New Wallet'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
