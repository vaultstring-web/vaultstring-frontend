'use client';

import { Button } from '@/src/components/ui/button';
import { Copy, Wifi } from 'lucide-react';

interface WalletGridProps {
  wallets: Array<any>;
}

export default function WalletGrid({ wallets }: WalletGridProps) {
  const getGradient = (currency: string) => {
    switch (String(currency).toUpperCase()) {
      case 'MWK': return 'bg-gradient-to-br from-emerald-600 to-teal-800';
      case 'CNY': return 'bg-gradient-to-br from-rose-500 to-red-800';
      case 'USD': return 'bg-gradient-to-br from-blue-600 to-indigo-900';
      default: return 'bg-gradient-to-br from-slate-700 to-slate-900';
    }
  };

  const generateFallbackWalletNumber = (id: string) => {
    // Deterministic fallback from UUID to ensure a stable 16-digit number
    const map: Record<string, string> = {
      'a': '1', 'b': '2', 'c': '3', 'd': '4', 'e': '5', 'f': '6', '-': ''
    };
    const numStr = id.toLowerCase().split('').map(c => map[c] || c).join('').replace(/\D/g, '');
    return (numStr + '4539102834756192').slice(0, 16);
  };

  const formatWalletNumber = (num: string) => {
    const cleaned = num.replace(/\D/g, '');
    const target = cleaned.padEnd(16, '0').slice(0, 16);
    return target.match(/.{1,4}/g)?.join(' ') || target;
  };

  if (!wallets || wallets.length === 0) {
    return (
        <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500">No wallets found.</p>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {wallets.map((w) => {
        const bal = parseFloat(String(w.available_balance ?? w.balance ?? 0));
        const currency = String(w.currency).toUpperCase();
        
        // Use wallet_address if available and NOT old format (VS-), otherwise deterministic fallback
        let rawWalletNumber = w.wallet_address;
        if (!rawWalletNumber || String(rawWalletNumber).startsWith('VS-')) {
           rawWalletNumber = generateFallbackWalletNumber(String(w.user_id || w.id || ''));
        }
        
        const displayWalletNumber = formatWalletNumber(rawWalletNumber);

        return (
          <div key={String(w.id)} className={`relative group rounded-3xl shadow-2xl p-8 text-white overflow-hidden ${getGradient(currency)} aspect-[1.586/1] transition-transform hover:-translate-y-1 duration-300`}>
            
            {/* Background Noise/Texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
            
            {/* Abstract Shapes */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/20 rounded-full blur-3xl"></div>

            <div className="relative h-full flex flex-col justify-between z-10">
              {/* Top Row: Chip and Contactless */}
              <div className="flex justify-between items-start">
                <div className="w-12 h-9 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-md border border-yellow-500/30 relative overflow-hidden shadow-sm">
                     <div className="absolute inset-0 grid grid-cols-2 gap-[1px] opacity-60">
                        <div className="border-r border-yellow-600/40"></div>
                        <div className="border-r border-yellow-600/40"></div>
                     </div>
                     <div className="absolute w-full h-[1px] bg-yellow-600/40 top-1/2 -translate-y-1/2"></div>
                     <div className="absolute w-full h-[1px] bg-yellow-600/40 top-1/4 -translate-y-1/2"></div>
                     <div className="absolute w-full h-[1px] bg-yellow-600/40 bottom-1/4 -translate-y-1/2"></div>
                </div>
                <Wifi className="w-8 h-8 opacity-80 rotate-90" strokeWidth={1.5} />
              </div>

              {/* Middle: Card Number */}
              <div className="mt-4">
                <div className="font-mono text-xl md:text-2xl tracking-[0.15em] font-medium drop-shadow-sm flex items-center gap-4">
                    {displayWalletNumber}
                    <button 
                        onClick={() => navigator.clipboard.writeText(rawWalletNumber)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded"
                        title="Copy Number"
                    >
                        <Copy size={14} />
                    </button>
                </div>
              </div>

              {/* Bottom: Details */}
              <div className="flex justify-between items-end mt-auto">
                <div>
                    <div className="text-[10px] uppercase tracking-wider opacity-70 font-medium mb-1">Card Holder</div>
                    <div className="font-medium tracking-wide text-sm md:text-base uppercase truncate max-w-[150px]">
                        {w.user_name || 'VaultString User'}
                    </div>
                </div>
                <div className="text-right">
                     <div className="text-[10px] uppercase tracking-wider opacity-70 font-medium mb-1">Balance</div>
                     <div className="font-bold text-lg md:text-xl tracking-tight">
                        {currency} {bal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     </div>
                </div>
              </div>
            </div>
            
            {/* Brand Logo (Mastercard style circles) */}
            <div className="absolute top-6 right-6 flex opacity-80">
                <div className="w-8 h-8 rounded-full bg-red-500/80 mix-blend-hard-light"></div>
                <div className="w-8 h-8 rounded-full bg-orange-500/80 mix-blend-hard-light -ml-4"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
