'use client';

import { useEffect, useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WalletStats } from '@/src/types/types';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/src/lib/api/api-client';
import { unwrapPaginatedTransactions } from '@/src/lib/api/response';
import type { ApiTransaction } from '@/src/types/api';

interface BalanceHistoryChartProps {
  wallet: WalletStats;
  walletId?: string;
  compact?: boolean;
  className?: string;
}

type ChartPoint = { name: string; balance: number };

function buildSeriesFromTransactions(
  txs: ApiTransaction[],
  userId: string | undefined,
  current: number
): ChartPoint[] {
  const sorted = [...txs]
    .filter((t) => String(t.status || '').toLowerCase() === 'completed')
    .sort((a, b) => {
      const ta = new Date(String(a.created_at || a.initiated_at || 0)).getTime();
      const tb = new Date(String(b.created_at || b.initiated_at || 0)).getTime();
      return ta - tb;
    });

  if (sorted.length === 0) return [];

  let running = current;
  const points: ChartPoint[] = [];

  for (let i = sorted.length - 1; i >= 0; i--) {
    const t = sorted[i];
    const amt = parseFloat(String(t.net_amount ?? t.amount ?? 0));
    const sid = String(t.sender_id || t.senderId || '');
    const rid = String(t.receiver_id || t.receiverId || '');
    const delta =
      userId && sid === userId ? -amt : userId && rid === userId ? amt : 0;

    points.unshift({
      name: new Date(String(t.created_at || t.initiated_at)).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      }),
      balance: Math.round(Math.max(0, running)),
    });
    running -= delta;
  }

  points.unshift({
    name: 'Start',
    balance: Math.round(Math.max(0, running)),
  });

  return points;
}

export default function BalanceHistoryChart({
  wallet,
  walletId,
  compact = false,
  className,
}: BalanceHistoryChartProps) {
  const t = useTranslations('Dashboard.balanceHistory');
  const [livePoints, setLivePoints] = useState<ChartPoint[] | null>(null);
  const [loaded, setLoaded] = useState(false);

  const current =
    wallet.primaryCurrency === 'CNY' ? (wallet.balanceCNY ?? 0) : (wallet.balanceMWK ?? 0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const url = walletId
          ? `/wallets/${walletId}/transactions?limit=40&offset=0`
          : '/payments?limit=40&offset=0';
        const res = await apiFetch(url);
        const { transactions } = unwrapPaginatedTransactions<ApiTransaction>(res);
        const built = buildSeriesFromTransactions(transactions, undefined, current);
        if (!cancelled) {
          setLivePoints(built.length > 1 ? built : null);
          setLoaded(true);
        }
        return;
      } catch {
        // fall through to empty state
      }
      if (!cancelled) {
        setLivePoints(null);
        setLoaded(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [walletId, current]);

  const chartData = useMemo(() => livePoints ?? [], [livePoints]);
  const hasData = chartData.length > 1;

  const brandStroke = 'rgb(68, 138, 51)';

  return (
    <div
      className={cn(
        'vs-card-shell vs-brand-accent-border flex min-h-0 flex-1 flex-col p-6',
        compact && 'p-4',
        className
      )}
    >
      <div className={cn('mb-4 flex shrink-0 items-center justify-between', compact && 'mb-3')}>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <TrendingUp size={18} className="text-[rgb(var(--brand))]" />
          {t('title')}
        </h3>
      </div>
      <div className={cn('min-h-[160px] w-full flex-1', compact ? 'h-40' : 'h-64 sm:h-72')}>
        {!hasData ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-center">
            <TrendingUp size={28} className="text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              {loaded ? t('emptyTitle') : t('loading')}
            </p>
            {loaded ? (
              <p className="text-xs text-muted-foreground/70">{t('emptyHint')}</p>
            ) : null}
          </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBalanceBrand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={brandStroke} stopOpacity={0.2} />
                <stop offset="95%" stopColor={brandStroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgb(var(--muted-foreground))', fontSize: 11 }}
              dy={8}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgb(var(--muted-foreground))', fontSize: 11 }}
              tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
              width={44}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid rgb(var(--border))',
                background: 'rgb(var(--card))',
              }}
              formatter={(value: number) => [
                `${wallet.primaryCurrency === 'CNY' ? 'CNY' : 'MWK'} ${Number(value).toLocaleString()}`,
                t('balanceLabel'),
              ]}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke={brandStroke}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBalanceBrand)"
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
