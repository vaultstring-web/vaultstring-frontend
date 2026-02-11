import React from 'react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Plus, CreditCard, ArrowUpRight, Loader2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { useWalletStats } from '@/src/hooks/useWalletStats';
import { formatCurrency, formatWalletNumber, getWalletGradient } from '@/src/lib/utils/formatters';

export interface MyCardsProps {
  selectedWalletId?: string | null;
  onSelectWallet?: (id: string | null) => void;
}

export default function MyCards({ selectedWalletId, onSelectWallet }: MyCardsProps) {
  const { stats, wallets, loading } = useWalletStats();
  
  // Find primary wallet to display on big card
  const primaryWallet = wallets.find(w => w.currency === stats.primaryCurrency) || wallets[0];
  
  // Other wallets for mini cards
  const otherWallets = wallets.filter(w => w.id !== primaryWallet?.id); // Show all other wallets

  const handleCardClick = (walletId: string) => {
    if (onSelectWallet) {
        // Toggle: if already selected, deselect
        onSelectWallet(selectedWalletId === walletId ? null : walletId);
    }
  };

  if (loading && wallets.length === 0) {
      return <div className="h-[220px] bg-slate-100 dark:bg-slate-800 rounded-[24px] animate-pulse flex items-center justify-center">
          <Loader2 className="animate-spin text-slate-400" />
      </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          My Cards <ArrowUpRight size={18} className="text-slate-400" />
        </h2>
        <Button variant="ghost" size="sm" className="text-indigo-600 font-bold hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
            Manage
        </Button>
      </div>

      <div className="relative group">
        {/* Decorative Cards Stacked Behind */}
        <div className="absolute top-2 right-2 w-full h-full bg-slate-800 dark:bg-slate-700 rounded-[24px] rotate-3 opacity-10 scale-95 transition-transform group-hover:rotate-6 duration-500"></div>
        <div className="absolute top-1 right-1 w-full h-full bg-slate-900 dark:bg-slate-600 rounded-[24px] rotate-1 opacity-10 scale-[0.98] transition-transform group-hover:rotate-3 duration-500"></div>

        {/* Main Card */}
        <div 
            onClick={() => primaryWallet && handleCardClick(primaryWallet.id)}
            className={`relative ${getWalletGradient(primaryWallet?.currency || 'MWK')} p-6 rounded-[24px] shadow-xl overflow-hidden min-h-[220px] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 cursor-pointer ${selectedWalletId === primaryWallet?.id ? 'ring-4 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''}`}
        >
          {/* Noise Texture */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-white/80 font-bold text-sm mb-1">Total Balance</p>
              <h3 className="text-3xl font-black text-white">
                {formatCurrency(primaryWallet?.available_balance || 0, primaryWallet?.currency || 'MWK')}
              </h3>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                <ArrowUpRight className="text-white" />
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-white/60 font-bold text-xs uppercase tracking-wider mb-1">Wallet ID</p>
                    <p className="font-mono text-white font-bold text-lg tracking-wider">
                        {primaryWallet ? formatWalletNumber(primaryWallet.id) : '•••• •••• •••• ••••'}
                    </p>
                </div>
                <div className="h-8 px-3 flex items-center bg-white/20 backdrop-blur-sm rounded-lg border border-white/10">
                    <span className="text-white font-bold text-xs">{primaryWallet?.currency || 'MWK'}</span>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
         <div className="bg-slate-100 dark:bg-slate-800 rounded-[24px] p-4 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer group">
            <div className="h-10 w-10 bg-white dark:bg-slate-700 rounded-full shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Plus className="text-slate-400 group-hover:text-indigo-600 dark:text-slate-400 dark:group-hover:text-indigo-400" />
            </div>
            <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-600 dark:text-slate-400 dark:group-hover:text-indigo-400">Add New Card</span>
         </div>
         
         {otherWallets.map(wallet => (
             <div 
                key={wallet.id} 
                onClick={() => handleCardClick(wallet.id)}
                className={`bg-slate-900 dark:bg-slate-950 rounded-[24px] p-5 relative overflow-hidden group cursor-pointer border border-slate-800 dark:border-slate-800 transition-all ${selectedWalletId === wallet.id ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''}`}
             >
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500 rounded-full blur-2xl -mr-10 -mt-10 opacity-20"></div>
                <div className="relative z-10">
                    <div className="flex justify-between mb-4">
                        <div className="text-white/60 font-mono text-xs">
                            {formatWalletNumber(wallet.id).slice(-4).padStart(8, '• ')}
                        </div>
                        <CreditCard className="text-white/80" size={16} />
                    </div>
                    <div className="text-white font-black text-sm truncate">
                        {formatCurrency(wallet.available_balance, wallet.currency)}
                    </div>
                    <div className="text-indigo-300 text-[10px] font-bold mt-1">{wallet.currency}</div>
                </div>
             </div>
         ))}
      </div>
    </div>
  );
}
