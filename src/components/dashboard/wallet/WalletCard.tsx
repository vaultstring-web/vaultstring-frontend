import { Wifi, Copy, PlusCircle } from 'lucide-react';
import { Wallet } from '@/src/hooks/useWalletStats';
import { generateFallbackWalletNumber, formatWalletNumber, getWalletGradient } from '@/src/lib/utils/formatters';
import { Button } from '@/src/components/ui/button';

interface WalletCardProps {
  wallet: Wallet;
  userId: string;
  onDeposit?: (wallet: Wallet) => void;
}

export default function WalletCard({ wallet, userId, onDeposit }: WalletCardProps) {
  const bal = parseFloat(String(wallet.available_balance ?? wallet.balance ?? 0));
  const currency = String(wallet.currency).toUpperCase();
  
  // Use wallet_address if available and NOT old format (VS-), otherwise deterministic fallback
  let rawWalletNumber = (wallet as any).wallet_address;
  if (!rawWalletNumber || String(rawWalletNumber).startsWith('VS-')) {
     rawWalletNumber = generateFallbackWalletNumber(String((wallet as any).user_id || wallet.id || userId || ''));
  }
  
  const displayWalletNumber = formatWalletNumber(rawWalletNumber);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(displayWalletNumber.replace(/\s/g, ''));
    // Ideally show a toast here
  };

  return (
    <div className={`relative group rounded-3xl shadow-2xl p-8 text-white overflow-hidden ${getWalletGradient(currency)} aspect-[1.586/1] transition-transform hover:-translate-y-1 duration-300`}>
      
      {/* Background Noise/Texture */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
      
      {/* Abstract Shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>

      <div className="relative h-full flex flex-col justify-between">
         {/* Header */}
         <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
               <div className="w-10 h-6 rounded border border-white/30 flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/20 to-transparent"></div>
                 <div className="w-6 h-4 border border-white/20 rounded-sm"></div>
               </div>
               <Wifi size={20} className="rotate-90 opacity-80" />
            </div>
            <div className="flex items-center gap-3">
                {onDeposit && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeposit(wallet); }}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm text-white/90"
                    title="Add Money"
                  >
                    <PlusCircle size={20} />
                  </button>
                )}
                <span className="font-mono text-lg font-bold tracking-wider opacity-90">{currency}</span>
            </div>
         </div>

         {/* Number */}
         <div className="flex items-center gap-3 group/num cursor-pointer" onClick={copyToClipboard}>
            <span className="font-mono text-2xl tracking-widest drop-shadow-md">{displayWalletNumber}</span>
            <Copy size={16} className="opacity-0 group-hover/num:opacity-100 transition-opacity" />
         </div>

         {/* Footer */}
         <div className="flex justify-between items-end">
            <div>
               <p className="text-xs text-white/60 font-medium uppercase tracking-wider mb-1">Balance</p>
               <h3 className="text-3xl font-bold tracking-tight">
                 {currency === 'MWK' ? 'MK' : currency === 'CNY' ? '¥' : '$'}
                 {bal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </h3>
            </div>
            <div className="text-right">
               <p className="text-xs text-white/60 font-medium uppercase tracking-wider mb-1">Status</p>
               <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                 <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                 <span className="text-xs font-semibold">Active</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
