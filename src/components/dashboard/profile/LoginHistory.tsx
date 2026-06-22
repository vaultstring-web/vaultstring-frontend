'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { History, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/src/lib/api/api-client';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/src/components/ui/pagination';

interface LoginRecord {
  device: string;
  location: string;
  timestamp: string;
}

interface DeviceRow {
  id: string;
  device_name?: string | null;
  country_code?: string | null;
  ip_address?: string | null;
  last_seen_at: string;
}

interface ActivityRow {
  action: string;
  created_at: string;
  ip_address?: string | null;
  user_agent?: string | null;
}

const LoginHistory: React.FC = () => {
  const t = useTranslations('Profile.loginHistory');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<LoginRecord[]>([]);
  const limit = 5;

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const [devRes, actRes] = await Promise.all([
        apiFetch('/users/me/devices?limit=50&offset=0'),
        apiFetch('/users/me/activity?limit=50&offset=0'),
      ]);
      const devices: DeviceRow[] = Array.isArray(devRes?.devices) ? devRes.devices : [];
      const activity: ActivityRow[] = Array.isArray(actRes?.logs) ? actRes.logs : [];

      const loginActions = activity.filter((a) =>
        /login|sign.?in|auth/i.test(a.action || '')
      );

      const merged: LoginRecord[] = devices.map((d, i) => {
        const match = loginActions[i];
        return {
          device: d.device_name || t('unknownDevice', { defaultValue: 'Unknown device' }),
          location: d.country_code || d.ip_address || '—',
          timestamp: match?.created_at
            ? new Date(match.created_at).toLocaleString()
            : new Date(d.last_seen_at).toLocaleString(),
        };
      });

      if (merged.length === 0 && loginActions.length > 0) {
        setHistory(
          loginActions.map((a) => ({
            device: a.user_agent?.slice(0, 40) || t('unknownDevice', { defaultValue: 'Unknown device' }),
            location: a.ip_address || '—',
            timestamp: new Date(a.created_at).toLocaleString(),
          }))
        );
      } else {
        setHistory(merged);
      }
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const total = history.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const paginatedHistory = history.slice((page - 1) * limit, page * limit);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <History size={20} className="text-slate-400" />
          {t('title')}
        </h3>
        <button
          type="button"
          onClick={() => void loadHistory()}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {t('refresh', { defaultValue: 'Refresh' })}
        </button>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">{t('device')}</th>
                  <th className="pb-3">{t('location')}</th>
                  <th className="pb-3 text-right">{t('dateTime')}</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-700 dark:text-slate-300">
                {paginatedHistory.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-muted-foreground">
                      {t('empty', { defaultValue: 'No login history yet.' })}
                    </td>
                  </tr>
                ) : (
                  paginatedHistory.map((record, index) => (
                    <tr key={index}>
                      <td className="py-3 font-medium">{record.device}</td>
                      <td className="py-3">{record.location}</td>
                      <td className="py-3 text-right">{record.timestamp}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
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
          </>
        )}
      </div>
    </div>
  );
};

export default LoginHistory;
