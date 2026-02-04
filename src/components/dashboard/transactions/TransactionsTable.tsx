import { useState } from 'react';
import { apiFetch } from '@/src/lib/api/api-client';
import { ApiTransaction } from '@/src/types/api';
import { formatWalletNumber, formatCurrency } from '@/src/lib/utils/formatters';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  MoreHorizontal, 
  Archive, 
  Eye, 
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/src/components/ui/pagination"

interface TransactionsTableProps {
  transactions: ApiTransaction[];
  userId: string | null;
}

export default function TransactionsTable({ transactions, userId }: TransactionsTableProps) {
  const [receipt, setReceipt] = useState<any | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const total = transactions.length;
  const totalPages = Math.ceil(total / limit);
  const paginatedTransactions = transactions.slice((page - 1) * limit, page * limit);

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
        return { color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200', icon: CheckCircle2 };
      case 'pending':
      case 'processing':
        return { color: 'bg-amber-100 text-amber-700 hover:bg-amber-200', icon: Clock };
      case 'failed':
      case 'cancelled':
        return { color: 'bg-red-100 text-red-700 hover:bg-red-200', icon: XCircle };
      default:
        return { color: 'bg-slate-100 text-slate-700 hover:bg-slate-200', icon: AlertCircle };
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      {/* Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 p-6 text-white text-center relative">
              <button 
                onClick={() => setReceipt(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white text-xl font-bold transition-colors"
              >
                &times;
              </button>
              <div className="flex justify-center mb-3">
                <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center">
                  <CreditCard className="text-white" size={24} />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight">Receipt</div>
              <div className="text-sm text-slate-400 mt-1">{new Date(receipt.date).toLocaleString()}</div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="text-center">
                <div className="text-slate-500 text-sm font-medium uppercase tracking-wide">Total Amount</div>
                <div className="text-4xl font-bold text-slate-900 mt-2 tracking-tight">
                  {formatCurrency(receipt.total_debited || receipt.amount, receipt.currency)}
                </div>
                <Badge variant="outline" className={`mt-3 capitalize ${getStatusConfig(receipt.status).color.split(' ')[1]}`}>
                  {String(receipt.status).toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex justify-between text-sm group">
                  <span className="text-slate-500">Reference ID</span>
                  <span className="font-mono font-medium text-slate-700 group-hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => navigator.clipboard.writeText(receipt.reference)}>
                    {receipt.reference}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Sender</span>
                  <span className="font-medium text-slate-900">{receipt.sender_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Receiver</span>
                  <span className="font-medium text-slate-900">{receipt.receiver_name}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg space-y-2 mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium text-slate-700">{formatCurrency(receipt.amount, receipt.currency)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Service Fee</span>
                    <span className="font-medium text-slate-700">{formatCurrency(receipt.fee, receipt.currency)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-400 font-medium">Verified by VaultString Security</p>
            </div>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="divide-y divide-slate-100">
        {transactions.map((t, index) => {
           // Determine direction and participants
           const sid = String(t.sender_id || t.senderId || '');
           const direction = t.direction || (sid === userId ? 'sent' : 'received');
           
           const amount = parseFloat(String(t.net_amount ?? t.amount ?? 0));
           const currency = String(t.currency).toUpperCase();
           const date = new Date(t.created_at || t.initiated_at || Date.now());
           
           const counterpartyName = direction === 'sent' 
              ? (t.receiver_name || t.ReceiverName || 'Unknown Receiver') 
              : (t.sender_name || t.SenderName || 'Unknown Sender');

           const status = String(t.status || 'pending');
           const statusConfig = getStatusConfig(status);
           
           // Simulate "unread" state for the first item or if status is pending action
           const isUnread = t.is_read !== undefined ? !t.is_read : (index === 0 && status === 'pending');
           const type = String(t.transaction_type || t.type || 'payment').replace(/_/g, ' ');

           // Avatar Initials
           const initials = counterpartyName
             .split(' ')
             .map((n: string) => n[0])
             .join('')
             .toUpperCase()
             .slice(0, 2);

           return (
             <div 
               key={t.id || t.reference} 
               className={cn(
                 "group flex items-start gap-4 p-4 transition-all hover:bg-slate-50",
                 isUnread ? "bg-indigo-50/30" : ""
               )}
             >
               {/* Avatar Section */}
               <div className="relative">
                 <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                   <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(counterpartyName)}&background=random`} />
                   <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">{initials}</AvatarFallback>
                 </Avatar>
                 <div className={cn(
                   "absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-white text-white shadow-sm text-[10px]",
                   direction === 'sent' ? "bg-slate-700" : "bg-emerald-500"
                 )}>
                   {direction === 'sent' ? <ArrowUpRight size={10} strokeWidth={3} /> : <ArrowDownLeft size={10} strokeWidth={3} />}
                 </div>
               </div>

               {/* Content Section */}
               <div className="flex-1 min-w-0 pt-0.5">
                 <div className="flex items-start justify-between gap-2">
                   <div className="space-y-1">
                     <p className={cn("text-sm text-slate-900 leading-snug", isUnread ? "font-semibold" : "font-medium")}>
                       {direction === 'sent' ? (
                         <>
                           You sent <span className="text-slate-900 font-bold">{formatCurrency(amount, currency)}</span> to <span className="text-indigo-600">{counterpartyName}</span>
                         </>
                       ) : (
                         <>
                           <span className="text-indigo-600">{counterpartyName}</span> sent you <span className="text-emerald-600 font-bold">{formatCurrency(amount, currency)}</span>
                         </>
                       )}
                     </p>
                     <div className="flex items-center gap-2 text-xs text-slate-500">
                       <span className="capitalize">{type}</span>
                       <span>•</span>
                       <span>{date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                     </div>
                   </div>
                   
                   {/* Actions */}
                   <div className="flex items-center gap-2">
                     {isUnread && (
                       <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" title="Unread"></span>
                     )}
                     
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                           <MoreHorizontal size={16} />
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="w-40">
                         <DropdownMenuLabel>Actions</DropdownMenuLabel>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem onClick={() => handleViewReceipt(t.id)}>
                           <Eye className="mr-2 h-4 w-4" />
                           View Receipt
                         </DropdownMenuItem>
                         <DropdownMenuItem className="text-slate-500">
                           <Archive className="mr-2 h-4 w-4" />
                           Archive
                         </DropdownMenuItem>
                       </DropdownMenuContent>
                     </DropdownMenu>
                   </div>
                 </div>

                 {/* Status Badge (if not successful, show prominently) */}
                 {status !== 'completed' && status !== 'success' && (
                   <div className="mt-2">
                     <Badge variant="secondary" className={cn("text-[10px] px-2 py-0.5 h-5", statusConfig.color)}>
                       {statusConfig.icon && <statusConfig.icon size={10} className="mr-1" />}
                       {status.toUpperCase()}
                     </Badge>
                   </div>
                 )}
               </div>
             </div>
           );
        })}
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage(page - 1);
                  }}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" onClick={(e) => e.preventDefault()} isActive>
                  {page}
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) setPage(page + 1);
                  }}
                  className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
