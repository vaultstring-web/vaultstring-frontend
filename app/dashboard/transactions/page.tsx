'use client';

import MyCards from '@/src/components/dashboard/transactions/MyCards';
import TransactionList from '@/src/components/dashboard/transactions/TransactionList';
import { Input } from '@/src/components/ui/input';
import { 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  Activity,
  Filter,
  FileSpreadsheet,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { useTransactions } from '@/src/hooks/useTransactions';
import { exportTransactionsToCSV } from '@/src/lib/utils/csv-export';
import { useAuth } from '@/src/context/AuthContext';
import { Button } from '@/src/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/src/components/ui/pagination"
import { useState } from 'react';
import { ErrorBoundary } from '@/src/components/ui/error-boundary';

export default function TransactionsPage() {
  const { user } = useAuth();
  const userId = user?.id || (user as any)?.ID || null;
  
  const { 
    filteredTransactions, 
    loading, 
    error, 
    page, 
    totalPages, 
    setPage, 
    filters, 
    setFilters, 
    stats,
    setLimit,
    limit
  } = useTransactions(5); // Start with short table (5 items)

  const handlePrevious = () => { if (page > 1) setPage(p => p - 1); };
  const handleNext = () => { if (page < totalPages) setPage(p => p + 1); };
  const handleViewAll = () => {
    setLimit(50); // Expand to 50 items
    setPage(1); // Reset to first page
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(filteredTransactions, 'vaultstring_statement', userId);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Financial Overview</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your cards and review activity.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl h-10 px-4 font-bold text-slate-600 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800">
                <Calendar size={16} className="mr-2" /> Select Dates
            </Button>
            <Button 
                onClick={handleExportCSV}
                className="rounded-xl bg-slate-900 dark:bg-emerald-600 text-white h-10 px-4 font-bold shadow-lg hover:bg-slate-800 dark:hover:bg-emerald-700"
            >
                <FileSpreadsheet size={16} className="mr-2" /> Export
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cards & Widgets */}
        <div className="xl:col-span-5 space-y-8">
           <ErrorBoundary>
             <MyCards 
                selectedWalletId={filters.walletId}
                onSelectWallet={(id) => setFilters(prev => ({ ...prev, walletId: id }))}
             />
           </ErrorBoundary>
           
           <div className="grid grid-cols-2 gap-4">
              <StatCard label="Inflow" value={stats?.received || '0'} icon={<ArrowDownLeft />} color="green" />
              <StatCard label="Outflow" value={stats?.sent || '0'} icon={<ArrowUpRight />} color="indigo" />
              <div className="col-span-2">
                <StatCard label="Pending Settlement" value={stats?.pending || '0'} icon={<Clock />} color="amber" />
              </div>
           </div>
        </div>

        {/* Right Column: Transactions List */}
        <div className="xl:col-span-7 space-y-6">
            
            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-900 p-2 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-2">
                <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-2xl w-full sm:w-auto">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'sent', label: 'Sent' },
                      { id: 'received', label: 'Received' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setFilters(f => ({ ...f, tab: item.id as any }))}
                        className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                          filters.tab === item.id 
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                </div>

                <div className="relative flex-1 w-full">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                   <Input 
                     placeholder="Search transactions..." 
                     className="pl-10 h-10 bg-transparent border-transparent focus:bg-slate-50 dark:focus:bg-slate-800 rounded-xl font-medium text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                     value={filters.query}
                     onChange={(e) => setFilters(f => ({ ...f, query: e.target.value }))}
                   />
                </div>
            </div>

            {/* List */}
            {loading ? (
                 <div className="p-20 text-center bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800">
                   <div className="animate-spin h-8 w-8 border-[3px] border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                   <p className="text-slate-400 dark:text-slate-500 font-bold text-xs">Loading...</p>
                 </div>
            ) : (
                <ErrorBoundary>
                    <TransactionList 
                        transactions={filteredTransactions} 
                        userId={userId} 
                        onViewAll={handleViewAll}
                        showViewAll={limit < 20} // Only show "View all" if limit is small
                    />

                    {/* Simple Pagination */}
                    <div className="flex items-center justify-between px-4">
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
                            Page {page} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={handlePrevious} disabled={page <= 1} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">Previous</Button>
                            <Button variant="ghost" size="sm" onClick={handleNext} disabled={page >= totalPages} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">Next</Button>
                        </div>
                    </div>
                </ErrorBoundary>
            )}
        </div>
      </div>
    </div>
  );
}

// Internal Stat Card Component
function StatCard({ label, value, icon, color }: any) {
    const config: any = {
        green: { bg: 'bg-emerald-500', light: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
        indigo: { bg: 'bg-indigo-500', light: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400' },
        amber: { bg: 'bg-amber-500', light: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
    };
    
    const theme = config[color] || config.indigo;

    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${theme.light} ${theme.text}`}>
                {icon}
            </div>
            <div>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-wider">{label}</p>
                <p className="text-slate-900 dark:text-white font-black text-lg">{value}</p>
            </div>
        </div>
    );
}
