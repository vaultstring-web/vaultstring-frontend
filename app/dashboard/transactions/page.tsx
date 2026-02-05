'use client';

import TransactionsTable from '@/src/components/dashboard/transactions/TransactionsTable';
import PageHeader from '@/src/components/shared/PageHeader';
import { Card, CardContent, CardHeader } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
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
    stats 
  } = useTransactions(15);

  const handlePrevious = () => { if (page > 1) setPage(p => p - 1); };
  const handleNext = () => { if (page < totalPages) setPage(p => p + 1); };

  const handleExportCSV = () => {
    exportTransactionsToCSV(filteredTransactions, 'vaultstring_statement');
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 py-8">
      {/* Premium Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-[0.2em] mb-1">
                <Activity size={14} /> Live Activity
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Transactions</h1>
            <p className="text-slate-500 font-medium">Detailed history of your financial movement.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-2xl border-slate-100 h-12 px-6 font-bold text-slate-600 hover:bg-slate-50">
                <Calendar size={18} className="mr-2" /> Select Dates
            </Button>
            <Button 
                onClick={handleExportCSV}
                className="rounded-2xl bg-slate-900 hover:bg-black text-white h-12 px-6 font-bold shadow-xl shadow-slate-200 transition-all hover:scale-105"
            >
                <FileSpreadsheet size={18} className="mr-2" /> Export Statement
            </Button>
        </div>
      </div>

      {/* Modern Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <StatCard label="Inflow Volume" value={stats.received || '0'} icon={<ArrowDownLeft />} color="green" />
        <StatCard label="Outflow Volume" value={stats.sent || '0'} icon={<ArrowUpRight />} color="indigo" />
        <StatCard label="Awaiting Settlement" value={stats.pending || '0'} icon={<Clock />} color="amber" />
      </div>

      {/* Main Ledger Card */}
      <Card className="border-none shadow-[0_32px_64px_rgba(0,0,0,0.04)] rounded-[40px] overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-50 pb-8 pt-10 px-8">
           <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
              
              {/* iOS-Style Segmented Picker */}
              <div className="flex bg-slate-100/80 p-1.5 rounded-[22px] backdrop-blur-md w-fit">
                {[
                  { id: 'all', label: 'Everything' },
                  { id: 'sent', label: 'Out' },
                  { id: 'received', label: 'In' },
                  { id: 'pending_settlement', label: 'Pending' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFilters(f => ({ ...f, tab: item.id as any }))}
                    className={`px-6 py-2.5 rounded-[18px] text-sm font-black transition-all duration-300 ${
                      filters.tab === item.id 
                        ? 'bg-white text-slate-900 shadow-lg shadow-slate-200/50 scale-100' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Advanced Search Bar */}
              <div className="flex items-center gap-3">
                 <div className="relative group flex-1 xl:w-80">
                   <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors" size={18} />
                   <Input 
                     placeholder="Search reference or description..." 
                     className="pl-14 h-14 bg-slate-50/50 border-transparent rounded-[22px] font-medium text-slate-900 focus:bg-white focus:ring-4 focus:ring-green-500/5 transition-all"
                     value={filters.query}
                     onChange={(e) => setFilters(f => ({ ...f, query: e.target.value }))}
                   />
                 </div>
                 <Button variant="outline" className="h-14 w-14 rounded-[22px] border-slate-100 text-slate-400 hover:bg-slate-50 transition-all">
                    <Filter size={20} />
                 </Button>
              </div>
           </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
             <div className="p-32 text-center">
               <div className="animate-spin h-12 w-12 border-[5px] border-green-500 border-t-transparent rounded-full mx-auto mb-6"></div>
               <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Synchronizing Records...</p>
             </div>
          ) : filteredTransactions.length === 0 ? (
             <div className="p-32 text-center">
               <div className="w-24 h-24 bg-slate-50 rounded-[30px] flex items-center justify-center mx-auto mb-6 border border-slate-100">
                  <Search size={32} className="text-slate-200" />
               </div>
               <h4 className="text-xl font-black text-slate-900">No matches found</h4>
               <p className="text-slate-400 font-medium mt-2">Adjust your filters to see more results.</p>
             </div>
          ) : (
            <div className="group/table">
              <TransactionsTable transactions={filteredTransactions} userId={userId} />
              
              {/* Pagination Footer */}
              <div className="px-10 py-10 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50/30">
                <div>
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Database Range</p>
                   <p className="text-sm font-medium text-slate-900 mt-1">
                     Showing <span className="font-black">{filteredTransactions.length}</span> of {stats.total} results
                   </p>
                </div>
                
                <Pagination>
                  <PaginationContent className="gap-3">
                    <PaginationItem>
                      <Button 
                        variant="ghost" 
                        onClick={handlePrevious}
                        disabled={page <= 1}
                        className="rounded-2xl h-12 px-6 font-black text-slate-600 hover:bg-white hover:shadow-md disabled:opacity-20"
                      >
                        Prev
                      </Button>
                    </PaginationItem>
                    
                    <div className="flex items-center px-6 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 text-sm font-black text-slate-900">
                      {page} <span className="text-slate-300 mx-3">/</span> {totalPages}
                    </div>
                    
                    <PaginationItem>
                      <Button 
                        variant="ghost" 
                        onClick={handleNext}
                        disabled={page >= totalPages}
                        className="rounded-2xl h-12 px-6 font-black text-slate-600 hover:bg-white hover:shadow-md disabled:opacity-20"
                      >
                        Next <ChevronRight size={16} className="ml-1" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Internal Stat Card Component
function StatCard({ label, value, icon, color }: any) {
    const config = {
        green: { bg: 'bg-green-500', light: 'bg-green-50', text: 'text-green-600' },
        indigo: { bg: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-600' },
        amber: { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600' },
    };

    const style = config[color as keyof typeof config];

    return (
        <Card className="border-none shadow-[0_20px_40px_rgba(0,0,0,0.03)] rounded-[32px] overflow-hidden group hover:translate-y-[-4px] transition-all duration-500 bg-white">
            <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-6 duration-500 ${style.light} ${style.text}`}>
                        {icon}
                    </div>
                    <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100" />
                        ))}
                    </div>
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-slate-900 leading-none">{value}</h3>
                        <span className="text-xs font-bold text-slate-400">total</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}