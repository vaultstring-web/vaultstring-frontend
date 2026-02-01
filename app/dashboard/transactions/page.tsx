'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/src/lib/api/api-client';
import { useAuth } from '@/src/context/AuthContext';
import TransactionsTable from '@/src/components/dashboard/TransactionsTable';
import PageHeader from '@/src/components/shared/PageHeader';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { 
  Search, 
  Download, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  Activity,
  Calendar,
  MoreHorizontal
} from 'lucide-react';

export default function TransactionsPage() {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [tab, setTab] = useState<'all' | 'sent' | 'received' | 'topup' | 'pending_settlement'>('all');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  
  const { user } = useAuth();
  const userId = user?.id || (user as any)?.ID || null;

  useEffect(() => {
    // if (!isAuthenticated()) return; // Removed to prevent blocking fetch on initial load
    (async () => {
      setLoading(true);
      try {
        const offset = (page - 1) * limit;
        const res = await apiFetch(`/payments?limit=${limit}&offset=${offset}`);
        setTxs(Array.isArray(res?.transactions) ? res.transactions : []);
        setTotal(res?.total || 0);
      } catch (e: any) {
        setError(e?.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    })();
  }, [user, page, limit]);

  const totalPages = Math.ceil(total / limit);

  const handlePrevious = () => {
    if (page > 1) setPage(p => p - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(p => p + 1);
  };

  const totalCount = total || txs.length;
  // Note: These counts might be inaccurate if we only fetch a page. 
  // Ideally backend should return these stats, but for now we rely on the current page or separate stats endpoint.
  // We'll just count from the current page for visual consistency or keep them as is if they are not critical.
  const completedCount = txs.filter((t) => String(t.status || '').toLowerCase() === 'completed').length;
  const pendingCount = txs.filter((t) => String(t.status || '').toLowerCase() === 'pending').length;

  const filtered = txs.filter((t) => {
    const q = query.trim().toLowerCase();
    const sid = String(t.sender_id || t.senderId || '');
    const rid = String(t.receiver_id || t.receiverId || '');
    const currency = String(t.currency || '').toUpperCase();
    const fallbackSenderWallet = sid ? `...${sid.slice(-4)}` : '';
    const fallbackReceiverWallet = rid ? `...${rid.slice(-4)}` : '';
    const senderWallet = String(t.sender_wallet || t.sender_wallet_number || fallbackSenderWallet).toLowerCase();
    const receiverWallet = String(t.receiver_wallet || t.receiver_wallet_number || fallbackReceiverWallet).toLowerCase();
    const senderName = String(t.sender_name || t.SenderName || '').toLowerCase();
    const receiverName = String(t.receiver_name || t.ReceiverName || '').toLowerCase();
    
    const matchesQuery = q ? (
      String(t.reference || '').toLowerCase().includes(q) ||
      String(t.amount || '').toLowerCase().includes(q) ||
      senderWallet.includes(q) || receiverWallet.includes(q) ||
      senderName.includes(q) || receiverName.includes(q)
    ) : true;
    const matchesStatus = status === 'all' ? true : String(t.status || '').toLowerCase() === status;
    const matchesTab = (() => {
      const type = String(t.transaction_type || t.type || '').toLowerCase();
      const sidL = String(t.sender_id || t.senderId || '').toLowerCase();
      const ridL = String(t.receiver_id || t.receiverId || '').toLowerCase();
      const uid = String(userId || '').toLowerCase();
      if (tab === 'all') return true;
      if (tab === 'sent') return uid && sidL === uid;
      if (tab === 'received') return uid && ridL === uid;
      if (tab === 'topup') return type === 'deposit';
      if (tab === 'pending_settlement') return String(t.status || '').toLowerCase() === 'pending';
      return true;
    })();
    return matchesQuery && matchesStatus && matchesTab;
  });

  const handleExportCSV = () => {
    const rows = filtered.map((t) => {
      const ref = String(t.reference || t.id || '');
      const amount = String(t.amount ?? t.net_amount ?? 0);
      const currency = String(t.currency || '');
      const sid = String(t.sender_id || t.senderId || '');
      const rid = String(t.receiver_id || t.receiverId || '');
      const senderWallet = t.sender_wallet_number || (sid ? `...${sid.slice(-4)}` : '');
      const receiverWallet = t.receiver_wallet_number || (rid ? `...${rid.slice(-4)}` : '');
      const senderName = t.sender_name || t.SenderName || senderWallet;
      const receiverName = t.receiver_name || t.ReceiverName || receiverWallet;
      const status = String(t.status || '');
      const date = String(t.created_at || t.initiated_at || '');
      return [ref, date, amount, currency, status, senderName, receiverName].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });
    const header = ['Reference','Date','Amount','Currency','Status','Sender','Receiver'].join(',');
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
               <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalCount.toLocaleString()}</h3>
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
               <h3 className="text-2xl font-bold text-green-600 mt-1">{completedCount.toLocaleString()}</h3>
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
               <h3 className="text-2xl font-bold text-amber-600 mt-1">{pendingCount.toLocaleString()}</h3>
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
                    onClick={() => setTab(item.id as any)}
                    className={`whitespace-nowrap flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      tab === item.id 
                        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {item.icon && <item.icon size={16} className="mr-2" />}
                    {item.label}
                    {item.id === 'pending_settlement' && pendingCount > 0 && (
                      <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">{pendingCount}</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                 <Button variant="outline" size="sm" className="hidden md:flex text-slate-600 border-slate-200 bg-white">
                   <Calendar size={16} className="mr-2" />
                   This Month
                 </Button>
                 <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-slate-600 border-slate-200 bg-white">
                   <Download size={16} className="mr-2" />
                   Export
                 </Button>
              </div>
           </div>
        </CardHeader>

        {/* Filters Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-white">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Search by ID, amount, or wallet..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white transition-colors text-slate-900" 
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative w-full md:w-40">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-md appearance-none bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-100"
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <MoreHorizontal size={14} className="text-slate-400" />
                </div>
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-4"></div>
               <p>Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="bg-red-50 text-red-600 rounded-lg p-4 inline-block max-w-md">
                <p className="font-medium">Error loading data</p>
                <p className="text-sm mt-1 opacity-80">{error}</p>
                <Button variant="link" className="text-red-700 mt-2 h-auto p-0" onClick={() => window.location.reload()}>Retry</Button>
              </div>
            </div>
          ) : (
            <TransactionsTable userId={userId} transactions={filtered} />
          )}
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-between items-center text-xs text-slate-500">
           <span>Showing {(page - 1) * limit + 1}-{Math.min(page * limit, totalCount)} of {totalCount} transactions</span>
           <div className="flex gap-1">
             <Button 
               variant="ghost" 
               size="sm" 
               disabled={page <= 1}
               onClick={handlePrevious}
               className={`h-8 px-2 ${page <= 1 ? 'text-slate-300' : 'text-slate-600 hover:text-slate-900'}`}
             >
               Previous
             </Button>
             <Button 
               variant="ghost" 
               size="sm" 
               disabled={page * limit >= totalCount}
               onClick={handleNext}
               className={`h-8 px-2 ${page * limit >= totalCount ? 'text-slate-300' : 'text-slate-600 hover:text-slate-900'}`}
             >
               Next
             </Button>
           </div>
        </div>
      </Card>
    </div>
  );
}
