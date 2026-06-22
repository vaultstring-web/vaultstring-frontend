'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiTransaction } from '@/src/types/api';
import { formatWalletNumber, formatCurrency } from '@/src/lib/utils/formatters';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical,
  Calendar,
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
import { TransactionReceiptDrawer } from '@/src/components/dashboard/transactions/TransactionReceiptDrawer';

interface TransactionGridProps {
  transactions: ApiTransaction[];
  userId: string | null;
}

export default function TransactionGrid({ transactions, userId }: TransactionGridProps) {
  const t = useTranslations('Transactions.grid');
  const [receiptTxId, setReceiptTxId] = useState<string | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const parseNum = (v: unknown) => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  };

  const upper = (v: unknown) => String(v || '').toUpperCase();

  const handleViewReceipt = (txId: string) => {
    setReceiptTxId(txId);
    setReceiptOpen(true);
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
      <TransactionReceiptDrawer
        transactionId={receiptTxId}
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
      />

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {transactions.map((t, index) => {
           const sid = String(t.sender_id || t.senderId || '');
           const direction = t.direction || (sid === userId ? 'sent' : 'received');
           
           const fee = parseNum((t as any).fee_amount ?? 0);
           const totalDebited = parseNum((t as any).total_debited ?? 0) || (parseNum(t.amount) + fee);
           const isReceived = direction !== 'sent';
           const amount = isReceived ? parseNum((t as any).converted_amount ?? t.net_amount ?? t.amount) : (totalDebited > 0 ? totalDebited : parseNum(t.amount));
           const currency = isReceived ? upper((t as any).converted_currency || t.currency) : upper(t.currency);
           const date = new Date(t.created_at || t.initiated_at || Date.now());
           
           let counterpartyName = direction === 'sent' 
              ? (t.receiver_name || t.ReceiverName) 
              : (t.sender_name || t.SenderName);

           if (!counterpartyName || counterpartyName === 'Unknown Receiver' || counterpartyName === 'Unknown Sender') {
              const wallet = direction === 'sent' ? (t.receiver_wallet || t.receiver_wallet_number) : (t.sender_wallet || t.sender_wallet_number);
              counterpartyName = wallet ? `Wallet ${formatWalletNumber(wallet)}` : (direction === 'sent' ? 'Recipient' : 'Sender');
           }

           const status = String(t.status || 'pending');
           const statusConfig = getStatusConfig(status);
           const isUnread = t.is_read !== undefined ? !t.is_read : (index === 0 && status === 'pending');
           
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
                 "border-none shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group relative bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800",
                 isUnread ? "ring-indigo-100 dark:ring-indigo-900 bg-indigo-50/10 dark:bg-indigo-900/10" : ""
               )}
             >
               {isUnread && <div className="absolute top-4 right-4 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />}
               
               <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-slate-50 dark:border-slate-800">
                 <div className="relative">
                   <Avatar className="h-14 w-14 border-[3px] border-white dark:border-slate-800 shadow-md ring-1 ring-slate-100 dark:ring-slate-800">
                     <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(counterpartyName)}&background=random`} />
                     <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">{initials}</AvatarFallback>
                   </Avatar>
                   <div className={cn(
                     "absolute -bottom-1 -right-1 rounded-lg p-1.5 shadow-sm ring-2 ring-white dark:ring-slate-900",
                     direction === 'sent' ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                   )}>
                     {direction === 'sent' ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownLeft size={14} strokeWidth={3} />}
                   </div>
                 </div>
                 
                 <div className="flex-1 min-w-0">
                   <p className="text-xs font-medium text-muted-foreground mb-0.5">
                     {direction === 'sent' ? t('to') : t('from')}
                   </p>
                   <h3 className="font-semibold text-slate-900 dark:text-white truncate text-lg leading-tight">
                     {counterpartyName}
                   </h3>
                 </div>
               </CardHeader>

               <CardContent className="pt-6 space-y-6">
                 <div className="flex items-baseline justify-between">
                   <span className="text-sm font-medium text-muted-foreground">{t('amount')}</span>
                   <div className={cn(
                     "text-2xl font-semibold tracking-tight tabular-nums",
                     direction === 'sent' ? "text-slate-900 dark:text-white" : "text-green-600 dark:text-green-400"
                   )}>
                     {direction === 'sent' ? '-' : '+'}{formatCurrency(amount, currency)}
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5">
                        <Calendar size={10} /> {t('date')}
                      </span>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {date.toLocaleDateString()}
                      </p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5">
                        <Clock size={10} /> {t('time')}
                      </span>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                   </div>
                 </div>
                 
                 <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-2 capitalize">
                       {status}
                    </span>
                    <Badge variant="outline" className={cn("text-xs font-medium text-muted-foreground border-transparent", statusConfig.color)}>
                      {t.type || 'Transfer'}
                    </Badge>
                 </div>
               </CardContent>

               <CardFooter className="pt-0 pb-6 px-6">
                  <Button 
                    variant="outline" 
                    className="w-full h-11 rounded-lg font-medium"
                    onClick={() => handleViewReceipt(String(t.id || t.reference))}
                  >
                    View receipt
                  </Button>
               </CardFooter>
             </Card>
           );
        })}
      </div>
    </>
  );
}
