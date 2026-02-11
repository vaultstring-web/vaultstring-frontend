import React from 'react';
import { ApiTransaction } from '@/src/types/api';
import { formatCurrency } from '@/src/lib/utils/formatters';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { ArrowDownLeft, ArrowUpRight, Coffee, Monitor, ShoppingBag, Zap, MoreHorizontal } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

interface TransactionListProps {
  transactions: ApiTransaction[];
  userId: string | null;
  onViewReceipt?: (id: string) => void;
  onViewAll?: () => void;
  showViewAll?: boolean;
}

export default function TransactionList({ transactions, userId, onViewReceipt, onViewAll, showViewAll = true }: TransactionListProps) {
  
  // Helper to guess icon based on description/category
  const getIcon = (tx: ApiTransaction) => {
    const text = (tx.description || tx.category || '').toLowerCase();
    if (text.includes('coffee') || text.includes('starbucks')) return <Coffee size={16} />;
    if (text.includes('netflix') || text.includes('subscription')) return <Monitor size={16} />;
    if (text.includes('shop') || text.includes('store')) return <ShoppingBag size={16} />;
    return <Zap size={16} />;
  };

  const getColor = (tx: ApiTransaction) => {
     const text = (tx.description || tx.category || '').toLowerCase();
     if (text.includes('coffee')) return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400';
     if (text.includes('netflix')) return 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400';
     if (text.includes('shop')) return 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400';
     return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 h-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Transactions</h2>
        {showViewAll && (
            <Button 
                variant="ghost" 
                size="sm" 
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                onClick={onViewAll}
            >
                View all
            </Button>
        )}
      </div>

      <div className="space-y-6">
        {transactions.length === 0 ? (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500 font-medium">No transactions yet</div>
        ) : (
            transactions.map((tx) => {
                if (!tx) return null;
                const isReceived = tx.receiver_id === userId;
                const isSent = tx.sender_id === userId;
                // Use formatCurrency for proper currency display
                const formattedAmount = formatCurrency(isReceived ? tx.amount : (tx.total_debited || tx.amount), tx.currency);
                const amountSign = isReceived ? '+' : '-';
                const amountDisplay = `${amountSign}${formattedAmount}`;
                
                const colorClass = isReceived ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white';

                return (
                    <div key={tx.id} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 -mx-4 p-4 rounded-2xl transition-colors" onClick={() => onViewReceipt?.(tx.id)}>
                        <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${getColor(tx)}`}>
                                {getIcon(tx)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-slate-900 dark:text-white mb-0.5">
                                    {isReceived ? (tx.sender_name || tx.SenderName || tx.sender?.name || 'Unknown Sender') : (tx.receiver_name || tx.ReceiverName || tx.receiver?.name || tx.description || 'Unknown Receiver')}
                                </div>
                                <div className="text-xs text-slate-400 dark:text-slate-500 font-medium" suppressHydrationWarning>
                                    {(() => {
                                        try {
                                            return tx.created_at ? new Date(tx.created_at).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Date Pending';
                                        } catch {
                                            return 'Invalid Date';
                                        }
                                    })()}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`font-black text-sm ${colorClass}`}>{amountDisplay}</div>
                            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full inline-block mt-1 uppercase tracking-wide">
                                {tx.status}
                            </div>
                        </div>
                    </div>
                );
            })
        )}
      </div>

      {/* Removed static Load More button as we use external pagination or View All */}
    </div>
  );
}
