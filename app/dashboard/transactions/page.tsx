'use client';

import TransactionsTable from '@/src/components/dashboard/transactions/TransactionsTable';
import PageHeader from '@/src/components/shared/PageHeader';
import { Card, CardContent, CardHeader } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { 
  Search, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTransactions } from '@/src/hooks/useTransactions';
import { exportTransactionsToCSV } from '@/src/lib/utils/csv-export';
import { useAuth } from '@/src/context/AuthContext';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/src/components/ui/pagination"

export default function TransactionsPage() {
  const { user } = useAuth();
  const userId = user?.id || (user as any)?.ID || null;
  
  const { 
    filteredTransactions, 
    loading, 
    error, 
    page, 
    limit, 
    totalPages, 
    setPage, 
    filters, 
    setFilters, 
    stats 
  } = useTransactions(15);

  const handlePrevious = () => {
    if (page > 1) setPage(p => p - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(p => p + 1);
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(filteredTransactions, 'transactions');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Transactions" subtitle="Track and manage your financial activity." variant="hero" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
             <div>
               <p className="text-sm font-medium text-slate-500">Total Transactions</p>
               <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.total.toLocaleString()}</h3>
             </div>
             <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
               <Activity size={20} />
             </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
             <div>
               <p className="text-sm font-medium text-slate-500">Completed</p>
               <h3 className="text-2xl font-bold text-green-600 mt-1">{stats.completed.toLocaleString()}</h3>
             </div>
             <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
               <CheckCircle2 size={20} />
             </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
             <div>
               <p className="text-sm font-medium text-slate-500">Pending</p>
               <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.pending.toLocaleString()}</h3>
             </div>
             <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
               <Clock size={20} />
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-0">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex overflow-x-auto pb-2 md:pb-0 no-scrollbar gap-1">
                {[
                  { id: 'all', label: 'All Transactions', icon: null },
                  { id: 'sent', label: 'Sent', icon: ArrowUpRight },
                  { id: 'received', label: 'Received', icon: ArrowDownLeft },
                  { id: 'topup', label: 'Top Up', icon: ArrowDownLeft },
                  { id: 'pending_settlement', label: 'Pending', icon: Clock }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFilters(f => ({ ...f, tab: item.id as any }))}
                    className={`whitespace-nowrap flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filters.tab === item.id 
                        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {item.icon && <item.icon size={16} className="mr-2" />}
                    {item.label}
                    {item.id === 'pending_settlement' && stats.pending > 0 && (
                      <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">{stats.pending}</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <Input 
                     placeholder="Search..." 
                     className="pl-9 w-full md:w-[200px] bg-white"
                     value={filters.query}
                     onChange={(e) => setFilters(f => ({ ...f, query: e.target.value }))}
                   />
                 </div>
                 <button 
                   onClick={handleExportCSV}
                   className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                   title="Export CSV"
                 >
                   <Download size={20} />
                 </button>
              </div>
           </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
             <div className="p-12 text-center">
               <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
               <p className="text-slate-500">Loading transactions...</p>
             </div>
          ) : error ? (
             <div className="p-12 text-center text-red-500">
               <p>{error}</p>
             </div>
          ) : filteredTransactions.length === 0 ? (
             <div className="p-12 text-center text-slate-500">
               <p>No transactions found matching your criteria.</p>
             </div>
          ) : (
            <>
              <TransactionsTable transactions={filteredTransactions} userId={userId} />
              
              {/* Pagination Controls */}
              <div className="px-6 py-4 border-t border-slate-100">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePrevious();
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
                          handleNext();
                        }}
                        className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                <div className="text-center text-sm text-slate-500 mt-2">
                  Showing <span className="font-medium">{filteredTransactions.length}</span> results
                  {totalPages > 1 && ` (Page ${page} of ${totalPages})`}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
