import Link from 'next/link';
import { Clock, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Transaction } from '@/src/types/types';
import { format } from 'date-fns';
import { useState } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/src/components/ui/pagination';

interface RecentActivityListProps {
  recentTransactions: Transaction[];
}

export default function RecentActivityList({ recentTransactions }: RecentActivityListProps) {
  const [page, setPage] = useState(1);
  const limit = 5;
  const total = recentTransactions.length;
  const totalPages = Math.ceil(total / limit);

  const paginatedTransactions = recentTransactions.slice((page - 1) * limit, page * limit);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Clock size={20} className="text-slate-400" />
          Recent Activity
        </h3>
        <Link
          href="/dashboard/transactions"
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          View All
        </Link>
      </div>
      <div className="overflow-y-auto flex-1 p-0">
        <div className="divide-y divide-slate-100">
          {paginatedTransactions.map((txn) => (
            <div key={txn.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  txn.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {txn.type === 'deposit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 truncate">{txn.merchantName}</p>
                  <p className="text-xs text-slate-500">
                    {format(new Date(txn.date), 'MM/dd/yyyy')}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-medium ${txn.type === 'deposit' ? 'text-green-600' : 'text-slate-900'}`}>
                  {txn.type === 'deposit' ? '+' : '-'} {txn.amountMWK.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                {txn.amountCNY > 0 && (
                  <p className="text-xs text-slate-500">¥ {txn.amountCNY.toLocaleString()}</p>
                )}
              </div>
            </div>
          ))}
          {recentTransactions.length === 0 && (
             <div className="p-8 text-center text-slate-500">No recent activity</div>
          )}
        </div>
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
