import { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '@/src/lib/api/api-client';
import { useAuth } from '@/src/context/AuthContext';
import { ApiTransaction, PaginatedResponse } from '@/src/types/api';

export interface TransactionFilters {
  query: string;
  status: string;
  walletId?: string | null;
  tab: 'all' | 'sent' | 'received' | 'topup' | 'pending_settlement';
}

export function useTransactions(initialLimit = 10) {
  const { user } = useAuth();
  const userId = user?.id || (user as any)?.ID || null;

  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);

  // Filters state
  const [filters, setFilters] = useState<TransactionFilters>({
    query: '',
    status: 'all',
    walletId: null,
    tab: 'all',
  });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      let url = `/payments?limit=${limit}&offset=${offset}`;
      
      if (filters.walletId) {
        url += `&wallet_id=${filters.walletId}`;
      }
      
      const res = await apiFetch<PaginatedResponse<ApiTransaction>>(url);
      // Ensure transactions is an array and filter out any null/undefined items immediately
      const safeTransactions = (Array.isArray(res?.transactions) ? res.transactions : []).filter(Boolean);
      setTransactions(safeTransactions);
      setTotal(res?.total || 0);
      setError(null);
    } catch (e: any) {
      console.error('Failed to fetch transactions:', e);
      setError(e?.message || 'Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, page, limit, filters.walletId]);

  // Derived state (Filtered Transactions)
  // Note: This filters only the current page of results, which is a known limitation 
  // until backend supports full search/filtering params.
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (!t) return false;
      const q = filters.query.trim().toLowerCase();
      const sid = String(t.sender_id || t.senderId || '');
      const rid = String(t.receiver_id || t.receiverId || '');
      
      const fallbackSenderWallet = sid ? `...${sid.slice(-4)}` : '';
      const fallbackReceiverWallet = rid ? `...${rid.slice(-4)}` : '';
      const senderWallet = String(t.sender_wallet_number || t.sender_wallet || fallbackSenderWallet).toLowerCase();
      const receiverWallet = String(t.receiver_wallet_number || t.receiver_wallet || fallbackReceiverWallet).toLowerCase();
      const senderName = String(t.sender_name || t.SenderName || '').toLowerCase();
      const receiverName = String(t.receiver_name || t.ReceiverName || '').toLowerCase();
      
      const matchesQuery = q ? (
        String(t.reference || t.id || '').toLowerCase().includes(q) ||
        String(t.amount || '').toLowerCase().includes(q) ||
        senderWallet.includes(q) || receiverWallet.includes(q) ||
        senderName.includes(q) || receiverName.includes(q)
      ) : true;

      const matchesStatus = filters.status === 'all' ? true : String(t.status || '').toLowerCase() === filters.status;

      const matchesWallet = filters.walletId ? (
        String(t.sender_wallet_id || '').toLowerCase() === filters.walletId.toLowerCase() ||
        String(t.receiver_wallet_id || '').toLowerCase() === filters.walletId.toLowerCase()
      ) : true;

      const matchesTab = (() => {
        const type = String(t.transaction_type || t.type || '').toLowerCase();
        const sidL = sid.toLowerCase();
        const ridL = rid.toLowerCase();
        const uid = String(userId || '').toLowerCase();

        if (filters.tab === 'all') return true;
        if (filters.tab === 'sent') return uid && sidL === uid;
        if (filters.tab === 'received') return uid && ridL === uid;
        if (filters.tab === 'topup') return type === 'deposit';
        if (filters.tab === 'pending_settlement') return String(t.status || '').toLowerCase() === 'pending';
        return true;
      })();

      return matchesQuery && matchesStatus && matchesTab && matchesWallet;
    });
  }, [transactions, filters, userId]);

  const stats = useMemo(() => {
    return {
      total: total || transactions.length,
      completed: transactions.filter((t) => t && String(t.status || '').toLowerCase() === 'completed').length,
      pending: transactions.filter((t) => t && String(t.status || '').toLowerCase() === 'pending').length,
      received: transactions.filter((t) => t && String(t.receiver_id || t.receiverId || '') === String(userId || '')).length,
      sent: transactions.filter((t) => t && String(t.sender_id || t.senderId || '') === String(userId || '')).length,
    };
  }, [transactions, total, userId]);

  const totalPages = Math.ceil(total / limit);

  return {
    transactions,
    filteredTransactions,
    loading,
    error,
    total,
    page,
    limit,
    totalPages,
    setPage,
    setLimit,
    filters,
    setFilters,
    stats,
    refresh: fetchTransactions
  };
}
