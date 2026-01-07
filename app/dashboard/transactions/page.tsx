// app/dashboard/transactions/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiFetch, isAuthenticated, getUser } from '@/src/lib/api/api-client';
import TransactionsTable from '@/src/components/dashboard/TransactionsTable';
import PageHeader from '@/src/components/shared/PageHeader';
import { Input } from '@/src/components/ui/input';

export default function TransactionsPage() {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [tab, setTab] = useState<'all' | 'sent' | 'received' | 'topup' | 'pending_settlement'>('all');
  const user = typeof window !== 'undefined' ? getUser() : null;
  const userId = user?.id || user?.ID || null;

  useEffect(() => {
    if (!isAuthenticated()) return;
    (async () => {
      try {
        const res = await apiFetch('/payments?limit=50&offset=0');
        setTxs(Array.isArray(res?.transactions) ? res.transactions : []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalCount = txs.length;
  const completedCount = txs.filter((t) => String(t.status || '').toLowerCase() === 'completed').length;
  const pendingCount = txs.filter((t) => String(t.status || '').toLowerCase() === 'pending').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Transactions" subtitle="Your recent activity." variant="hero" />

      {loading && <div className="bg-white rounded-xl border p-6">Loading transactions...</div>}
      {error && <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-slate-500">Total Transactions</div>
          <div className="text-2xl font-semibold text-slate-900 mt-1">{totalCount.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-slate-500">Completed</div>
          <div className="text-2xl font-semibold text-green-600 mt-1">{completedCount.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-slate-500">Pending</div>
          <div className="text-2xl font-semibold text-amber-600 mt-1">{pendingCount.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border">
        <div className="p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setTab('all')} className={`px-3 py-2 rounded-md text-sm ${tab === 'all' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>All Transaction</button>
            <button onClick={() => setTab('sent')} className={`px-3 py-2 rounded-md text-sm ${tab === 'sent' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>Money Sent</button>
            <button onClick={() => setTab('received')} className={`px-3 py-2 rounded-md text-sm ${tab === 'received' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>Money Received</button>
            <button onClick={() => setTab('topup')} className={`px-3 py-2 rounded-md text-sm ${tab === 'topup' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>Top Up</button>
            <button onClick={() => setTab('pending_settlement')} className={`px-3 py-2 rounded-md text-sm ${tab === 'pending_settlement' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>Pending Settlement <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-amber-100 text-amber-700">{pendingCount}</span></button>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 rounded-md text-sm text-slate-600 border hover:bg-slate-50">Filter By Month</button>
            <button className="px-3 py-2 rounded-md text-sm text-slate-600 border hover:bg-slate-50">Download Statement</button>
          </div>
        </div>
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-sm text-slate-600 flex items-center justify-between">
          <div>Completed pending transactions will update your balance and history. Details in the Pending Settlement tab.</div>
          <button className="px-3 py-1 rounded-md text-sm bg-amber-100 text-amber-700 hover:bg-amber-200">See Pending Transaction</button>
        </div>
        <div className="p-4 flex flex-wrap gap-4 items-center">
        <div className="w-full md:w-64">
          <Input placeholder="Search reference or amount" value={query} onChange={(e) => setQuery(e.target.value)} className="text-slate-900 placeholder:text-slate-500 bg-white" />
        </div>
        <div>
          <select className="border rounded-md px-3 py-2 text-sm text-slate-900 bg-white" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
          <div className="ml-auto">
            <button className="px-3 py-2 rounded-md text-sm text-slate-600 border hover:bg-slate-50">Export</button>
          </div>
        </div>
      </div>

      <TransactionsTable userId={userId} transactions={txs.filter((t) => {
        const q = query.trim().toLowerCase();
        const matchesQuery = q ? (String(t.reference || '').toLowerCase().includes(q) || String(t.amount || '').toLowerCase().includes(q)) : true;
        const matchesStatus = status === 'all' ? true : String(t.status || '').toLowerCase() === status;
        const matchesTab = (() => {
          const type = String(t.transaction_type || t.type || '').toLowerCase();
          const sid = String(t.sender_id || t.senderId || '').toLowerCase();
          const rid = String(t.receiver_id || t.receiverId || '').toLowerCase();
          const uid = String(userId || '').toLowerCase();
          if (tab === 'all') return true;
          if (tab === 'sent') return uid && sid === uid;
          if (tab === 'received') return uid && rid === uid;
          if (tab === 'topup') return type === 'deposit';
          if (tab === 'pending_settlement') return String(t.status || '').toLowerCase() === 'pending';
          return true;
        })();
        return matchesQuery && matchesStatus && matchesTab;
      })} />
    </div>
  );
}
