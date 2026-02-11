import { useState } from 'react';
import { apiFetch } from '@/src/lib/api/api-client';
import { ApiTransaction } from '@/src/types/api';
import { formatWalletNumber, formatCurrency } from '@/src/lib/utils/formatters';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical,
  Calendar,
  Hash,
  User,
  Wallet
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/src/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

interface TransactionGridProps {
  transactions: ApiTransaction[];
  userId: string | null;
}

export default function TransactionGrid({ transactions, userId }: TransactionGridProps) {
  const [receipt, setReceipt] = useState<any | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleViewReceipt = async (txId: string) => {
    setLoadingId(txId);
    try {
      const res = await apiFetch(`/payments/${txId}/receipt`);
      setReceipt(res);
    } catch (e) {
      alert('Failed to load receipt');
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return { color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-800', icon: CheckCircle2 };
      case 'pending':
      case 'processing':
        return { color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-800', icon: Clock };
      case 'failed':
      case 'cancelled':
        return { color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30', border: 'border-red-200 dark:border-red-800', icon: XCircle };
      default:
        return { color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700', border: 'border-slate-200 dark:border-slate-700', icon: AlertCircle };
    }
  };

  return (
    <>
      {/* Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl max-w-md w-full overflow-hidden scale-100 transition-all border border-transparent dark:border-slate-800">
            <div className="bg-slate-900 dark:bg-slate-950 p-8 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              <button 
                onClick={() => setReceipt(null)}
                className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <XCircle size={24} />
              </button>
              <div className="flex justify-center mb-4 relative z-10">
                <div className="h-16 w-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                  <CreditCard className="text-white" size={32} />
                </div>
              </div>
              <div className="text-3xl font-black tracking-tight relative z-10">Transaction Receipt</div>
              <div className="text-sm text-slate-400 mt-2 font-medium relative z-10 flex items-center justify-center gap-2">
                <Calendar size={14} />
                {new Date(receipt.date).toLocaleString()}
              </div>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="text-center">
                <div className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-[0.2em] mb-2">Total Amount</div>
                <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {formatCurrency(receipt.total_debited || receipt.amount, receipt.currency)}
                </div>
                <Badge variant="outline" className={`mt-4 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${getStatusConfig(receipt.status).color}`}>
                  {String(receipt.status)}
                </Badge>
              </div>

              <div className="space-y-4 pt-8 border-t border-dashed border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center group p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => navigator.clipboard.writeText(receipt.reference)}>
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400"><Hash size={16} /></div>
                     <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Reference ID</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {receipt.reference}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400"><User size={16} /></div>
                     <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Sender</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-right">{receipt.sender_name}</span>
                </div>

                <div className="flex justify-between items-center p-3">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400"><User size={16} /></div>
                     <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Receiver</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-right">{receipt.receiver_name}</span>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl space-y-3 mt-4 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-500 dark:text-slate-400">Subtotal</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(receipt.amount, receipt.currency)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-500 dark:text-slate-400">Processing Fee</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(receipt.fee, receipt.currency)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-6 text-center border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <CheckCircle2 size={14} className="text-green-500" />
                Verified by VaultString Security
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {transactions.map((t, index) => {
           // Determine direction and participants
           const sid = String(t.sender_id || t.senderId || '');
           const direction = t.direction || (sid === userId ? 'sent' : 'received');
           
           const amount = parseFloat(String(t.net_amount ?? t.amount ?? 0));
           const currency = String(t.currency).toUpperCase();
           const date = new Date(t.created_at || t.initiated_at || Date.now());
           
           // Robust name resolution
           let counterpartyName = direction === 'sent' 
              ? (t.receiver_name || t.ReceiverName) 
              : (t.sender_name || t.SenderName);

           // Fallback to wallet/ID if name is missing
           if (!counterpartyName || counterpartyName === 'Unknown Receiver' || counterpartyName === 'Unknown Sender') {
              const wallet = direction === 'sent' ? (t.receiver_wallet || t.receiver_wallet_number) : (t.sender_wallet || t.sender_wallet_number);
              counterpartyName = wallet ? `Wallet ${formatWalletNumber(wallet)}` : (direction === 'sent' ? 'Recipient' : 'Sender');
           }

           const status = String(t.status || 'pending');
           const statusConfig = getStatusConfig(status);
           const isUnread = t.is_read !== undefined ? !t.is_read : (index === 0 && status === 'pending');
           
           // Avatar Initials
           const initials = counterpartyName
             .split(' ')
             .map((n: string) => n[0])
             .join('')
             .toUpperCase()
             .slice(0, 2);

           return (
             <Card 
               key={t.id || t.reference} 
               className={cn(
                 "border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group relative bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800",
                 isUnread ? "ring-indigo-100 dark:ring-indigo-900 bg-indigo-50/10 dark:bg-indigo-900/10" : ""
               )}
             >
               {isUnread && <div className="absolute top-4 right-4 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />}
               
               <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-slate-50 dark:border-slate-800">
                 <div className="relative">
                   <Avatar className="h-14 w-14 border-[3px] border-white dark:border-slate-800 shadow-md ring-1 ring-slate-100 dark:ring-slate-800">
                     <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(counterpartyName)}&background=random`} />
                     <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black">{initials}</AvatarFallback>
                   </Avatar>
                   <div className={cn(
                     "absolute -bottom-1 -right-1 rounded-lg p-1.5 shadow-sm ring-2 ring-white dark:ring-slate-900",
                     direction === 'sent' ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                   )}>
                     {direction === 'sent' ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownLeft size={14} strokeWidth={3} />}
                   </div>
                 </div>
                 
                 <div className="flex-1 min-w-0">
                   <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                     {direction === 'sent' ? 'To' : 'From'}
                   </p>
                   <h3 className="font-black text-slate-900 dark:text-white truncate text-lg leading-tight">
                     {counterpartyName}
                   </h3>
                 </div>
               </CardHeader>

               <CardContent className="pt-6 space-y-6">
                 <div className="flex items-baseline justify-between">
                   <span className="text-sm font-bold text-slate-400 dark:text-slate-500">Amount</span>
                   <div className={cn(
                     "text-2xl font-black tracking-tight",
                     direction === 'sent' ? "text-slate-900 dark:text-white" : "text-green-600 dark:text-green-400"
                   )}>
                     {direction === 'sent' ? '-' : '+'}{formatCurrency(amount, currency)}
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Calendar size={10} /> Date
                      </span>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {date.toLocaleDateString()}
                      </p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={10} /> Time
                      </span>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                   </div>
                 </div>
                 
                 <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                       <div className={cn("w-2 h-2 rounded-full", statusConfig.color.split(' ')[0].replace('bg-', 'bg-').replace('-100', '-500'))} />
                       {status}
                    </span>
                    <Badge variant="outline" className={cn("text-[10px] font-black uppercase tracking-widest border-transparent", statusConfig.color)}>
                      {t.type || 'Transfer'}
                    </Badge>
                 </div>
               </CardContent>

               <CardFooter className="pt-0 pb-6 px-6">
                  <Button 
                    variant="ghost" 
                    className="w-full h-12 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-slate-100 dark:border-slate-800"
                    onClick={() => handleViewReceipt(t.id || t.reference)}
                  >
                    View Receipt
                  </Button>
               </CardFooter>
             </Card>
           );
        })}
      </div>
    </>
  );
}
