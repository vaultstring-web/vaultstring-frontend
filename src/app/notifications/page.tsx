'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Bell,
  CheckCircle2,
  Shield,
  Filter,
  Loader2,
  Inbox,
  Check,
  AlertTriangle,
  Info,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { apiFetch } from '@/src/lib/api/api-client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { CustomerPageShell } from '@/src/components/enterprise/CustomerPageShell';
import { PageHeader } from '@/src/components/enterprise/PageHeader';
import { EmptyState } from '@/src/components/enterprise/EmptyState';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const t = useTranslations('Notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/notifications');
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch {
      // Fallback to real activity feed instead of static demo rows.
      try {
        const payments = await apiFetch('/payments?limit=5&offset=0');
        const rows = Array.isArray((payments as any)?.transactions)
          ? (payments as any).transactions
          : Array.isArray(payments)
            ? payments
            : [];
        const derived = rows.map((row: any, index: number) => ({
          id: String(row.id || row.reference || `payment-${index}`),
          title: t('activity.paymentTitle'),
          message: t('activity.paymentBody', {
            amount: String(row.amount ?? '0'),
            currency: String(row.currency ?? ''),
            status: String(row.status ?? 'pending'),
          }),
          type: String(row.status || '').toLowerCase() === 'failed' ? 'error' : 'info',
          is_read: false,
          created_at: String(row.created_at || new Date().toISOString()),
        }));
        setNotifications(derived);
      } catch {
        setNotifications([]);
      }
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {
      // Local fallback for UI demo
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success(t('actions.deleteSuccess'));
    } catch {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const archiveNotification = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success(t('actions.deleteSuccess'));
    } catch {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const markAllRead = async () => {
    try {
      await apiFetch('/notifications/read-all', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success(t('actions.markAllReadSuccess'));
    } catch {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }
  };

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' ? true : !n.is_read
  );

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 dark:bg-green-500/10 text-green-600 border-green-100 dark:border-green-500/20';
      case 'warning': return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-100 dark:border-amber-500/20';
      case 'error': return 'bg-red-50 dark:bg-red-500/10 text-red-600 border-red-100 dark:border-red-500/20';
      default: return 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 border-indigo-100 dark:border-indigo-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={20} />;
      case 'warning': return <AlertTriangle size={20} />;
      case 'error': return <Shield size={20} />;
      default: return <Info size={20} />;
    }
  };

  return (
    <CustomerPageShell width="narrow" compact className="pb-8">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        actions={
          <>
            <Button onClick={markAllRead} variant="outline" size="sm" className="h-10 gap-2">
              <Check size={16} />
              {t('actions.markAllRead')}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Filter size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setFilter('all')}>{t('filters.all')}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('unread')}>{t('filters.unread')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">{t('loading')}</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={t('empty.title')}
            description={t('empty.subtitle')}
            action={
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft size={14} className="mr-2" />
                  {t('backToDashboard')}
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3">
            <AnimatePresence initial={false}>
              {filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group relative rounded-xl border p-4 transition-all ${
                    notification.is_read 
                    ? 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 grayscale-[0.3]' 
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:bg-muted/30'
                  }`}
                >
                  <div className="flex gap-6">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform group-hover:scale-105 ${getTypeStyles(notification.type)}`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold uppercase tracking-tight ${notification.is_read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className={`text-sm font-medium leading-relaxed ${notification.is_read ? 'text-slate-500' : 'text-slate-600 dark:text-slate-400'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.is_read && (
                          <button 
                            onClick={() => markAsRead(notification.id)}
                            className="text-[10px] font-semibold text-indigo-600 uppercase tracking-widest hover:underline"
                          >
                            {t('actions.markRead')}
                          </button>
                        )}
                        <button 
                          onClick={() => deleteNotification(notification.id)}
                          className="text-[10px] font-semibold text-red-500 uppercase tracking-widest hover:underline"
                        >
                          {t('actions.delete')}
                        </button>
                        <button
                          type="button"
                          onClick={() => archiveNotification(notification.id)}
                          className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest hover:underline"
                        >
                          {t('actions.archive')}
                        </button>
                      </div>
                    </div>
                  </div>
                  {!notification.is_read && (
                    <div className="absolute top-6 right-6 h-2 w-2 bg-indigo-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </CustomerPageShell>
  );
}
