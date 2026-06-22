import { useState, useMemo, useEffect } from 'react';
import { apiFetch } from '@/src/lib/api/api-client';
import { unwrapForexHistory } from '@/src/lib/api/response';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  TrendingUp, 
  Clock,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/src/components/ui/tabs';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { ExchangeRateDetail } from '@/src/types/types';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface ForexAnalyticsProps {
  rates: Record<string, number>;
  rateDetails?: Record<string, ExchangeRateDetail>;
  primaryCurrency?: string;
  dataMode?: 'live' | 'seed';
  onRefresh?: () => void;
  className?: string;
  compact?: boolean;
}

export default function ForexAnalytics({ 
  rates, 
  rateDetails = {}, 
  primaryCurrency = 'MWK',
  dataMode = 'seed',
  onRefresh,
  className,
  compact = false,
}: ForexAnalyticsProps) {
  const t = useTranslations('Dashboard');
  const [selectedPair, setSelectedPair] = useState<string>('');
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Determine available pairs based on primary currency
  const availablePairs = useMemo(() => {
    const pairs: string[] = [];
    const targets = ['CNY', 'USD', 'ZAR', 'GBP', 'EUR'];
    
    targets.forEach(t => {
      if (t !== primaryCurrency) {
        // Check if rate exists
        if (rates[`${primaryCurrency}-${t}`] || rates[`${t}-${primaryCurrency}`]) {
          pairs.push(t);
        }
      }
    });
    
    // Default to CNY if empty or if primary is CNY default to MWK
    if (pairs.length === 0) {
        return primaryCurrency === 'MWK' ? ['CNY'] : ['MWK'];
    }
    return pairs;
  }, [rates, primaryCurrency]);

  useEffect(() => {
    if (!selectedPair && availablePairs.length > 0) {
      setSelectedPair(availablePairs[0]);
    }
  }, [availablePairs, selectedPair]);

  // Fetch history when pair changes
  useEffect(() => {
    if (selectedPair && primaryCurrency) {
      setLoadingHistory(true);
      apiFetch(`/forex/history?from=${primaryCurrency}&to=${selectedPair}&limit=48`)
        .then((data) => {
          const rows = unwrapForexHistory(data);
          if (rows.length > 0) {
            const formatted = rows
              .map((d: any) => {
                const validFrom = d.valid_from ?? d.validFrom ?? d.created_at;
                const rate = parseFloat(String(d.rate ?? 0));
                if (!validFrom || !rate) return null;
                return {
                  time: new Date(validFrom).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  value: rate,
                  timestamp: new Date(validFrom).getTime(),
                };
              })
              .filter(Boolean)
              .sort((a: any, b: any) => a.timestamp - b.timestamp);
            setHistory(formatted);
          } else {
            setHistory([]);
          }
        })
        .catch(() => {
          setHistory([]);
        })
        .finally(() => setLoadingHistory(false));
    }
  }, [selectedPair, primaryCurrency]);

  // Get current pair data
  const pairKey = `${primaryCurrency}-${selectedPair}`;
  const details = rateDetails[pairKey] || {
    rate: rates[pairKey] || 0,
    change24h: 0,
    changePercent: 0,
    high24h: rates[pairKey] || 0,
    low24h: rates[pairKey] || 0,
    lastUpdated: new Date().toISOString()
  };

  const isPositive = details.changePercent >= 0;
  const isLive = dataMode === 'live';

  // Use real history if available, else synthetic
  const chartData = useMemo(() => {
    if (history.length > 1) {
      return history;
    }

    // Generate synthetic chart data if no history
    const data = [];
    const baseRate = details.rate;
    const volatility = baseRate * 0.005; // 0.5% volatility
    const points = 24;
    
    // Start from yesterday (approx)
    let currentVal = baseRate - details.change24h;
    
    for (let i = 0; i <= points; i++) {
      // Add random noise but trend towards final rate
      const progress = i / points;
      const noise = (Math.random() - 0.5) * volatility;
      
      // Linear interpolation + noise
      const trend = (baseRate - (baseRate - details.change24h)) * progress;
      const val = (baseRate - details.change24h) + trend + noise;
      
      // Ensure final point is exact
      const finalVal = i === points ? baseRate : val;
      
      data.push({
        time: `${i}:00`,
        value: finalVal
      });
    }
    return data;
  }, [history, details]);

  return (
    <Card className={cn('vs-card-shell w-full border-border bg-card shadow-sm', className)}>
      <CardHeader className={cn('pb-4 border-b border-slate-100 dark:border-slate-800', compact && 'pb-3')}>
        <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
                <CardTitle className={cn('flex items-center gap-2', compact ? 'text-base' : 'text-lg')}>
                    <TrendingUp className="w-5 h-5 text-blue-600 shrink-0" />
                    <span className="truncate">{t('market.overviewTitle')}</span>
                </CardTitle>
                {!compact ? (
                  <CardDescription>{t('market.overviewSubtitle')}</CardDescription>
                ) : null}
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className={cn(
                    'flex items-center gap-1',
                    isLive
                      ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                      : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
                  )}
                >
                    {isLive ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    ) : null}
                    {isLive ? t('market.badgeLive') : t('market.badgeSeed')}
                </Badge>
                {onRefresh ? (
                  <Button variant="ghost" size="icon" onClick={onRefresh} className="h-8 w-8">
                      <RefreshCw className="w-4 h-4" />
                  </Button>
                ) : null}
            </div>
        </div>
        
        <Tabs value={selectedPair} onValueChange={setSelectedPair} className={cn('mt-4', compact && 'mt-3')}>
            <TabsList className={cn('grid w-full h-9', compact ? 'grid-cols-3' : 'max-w-md grid-cols-4')}>
                {availablePairs.slice(0, compact ? 3 : 4).map(p => (
                    <TabsTrigger key={p} value={p} className="text-xs">
                        {primaryCurrency}/{p}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className={cn('pt-6', compact && 'pt-4')}>
        <div className={cn('grid gap-8', compact ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-3')}>
            {/* Left: Main Stats + chart */}
            <div className={cn('space-y-6', compact ? '' : 'lg:col-span-2')}>
                <div className="flex items-baseline gap-4">
                    <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {details.rate.toFixed(4)}
                        <span className="text-lg text-slate-400 font-normal ml-2">{selectedPair}</span>
                    </h2>
                    <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium ${isPositive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {isPositive ? '+' : ''}{details.changePercent.toFixed(2)}%
                    </div>
                </div>
                
                <div className={cn('w-full', compact ? 'h-[180px]' : 'h-[250px]')}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                            <XAxis 
                                dataKey="time" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                minTickGap={30}
                            />
                            <YAxis 
                                domain={['auto', 'auto']} 
                                hide={true}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                                    borderRadius: '8px', 
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                                }}
                                labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                                formatter={(value: number) => [value.toFixed(4), t('market.rateLabel')]}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke={isPositive ? "#22c55e" : "#ef4444"} 
                                fillOpacity={1} 
                                fill="url(#colorRate)" 
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Right: Stats & Insights */}
            {!compact ? (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('market.high24h')}</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                            {details.high24h > 0 ? details.high24h.toFixed(4) : '-'}
                        </p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('market.low24h')}</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                            {details.low24h > 0 ? details.low24h.toFixed(4) : '-'}
                        </p>
                    </div>
                </div>

                <div className="p-4 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <h3 className="font-medium text-slate-900 dark:text-white">{t('market.timing.title')}</h3>
                    </div>
                    
                    {details.changePercent < -0.5 ? (
                         <div className="space-y-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{t('market.timing.buyBadge')}</Badge>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {t('market.timing.buyText', { percent: Math.abs(details.changePercent).toFixed(2) })}
                            </p>
                        </div>
                    ) : details.changePercent > 0.5 ? (
                        <div className="space-y-2">
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{t('market.timing.waitBadge')}</Badge>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {t('market.timing.waitText', { percent: details.changePercent.toFixed(2) })}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">{t('market.timing.stableBadge')}</Badge>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {t('market.timing.stableText', { percent: Math.abs(details.changePercent).toFixed(2) })}
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <h3 className="font-medium text-blue-900 dark:text-blue-100">{t('market.source.title')}</h3>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                        {isLive ? t('market.source.bodyLive') : t('market.source.bodySeed')}
                    </p>
                </div>
            </div>
            ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
