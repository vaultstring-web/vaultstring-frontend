'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  getFundingOptions,
  getPayoutOptions,
  type FundingOption,
} from '@/src/lib/constants/funding';
import { MONEY_SOURCE_CHANNEL_META } from '@/src/lib/constants/money-sources';
import { getProviderImageUrl } from '@/src/lib/constants/provider-images';

const KNOWN_CHANNELS = ['wallet', 'mobile_money', 'bank', 'card', 'api', 'web'] as const;
type KnownChannel = (typeof KNOWN_CHANNELS)[number];

function isKnownChannel(c: string): c is KnownChannel {
  return (KNOWN_CHANNELS as readonly string[]).includes(c);
}

export type MoneySourcesMode = 'funding' | 'payout';

export interface MoneySourcesProvidersProps {
  mode: MoneySourcesMode;
  currency: string;
  value: string;
  onChange: (value: string) => void;
  /** Required for funding mode when showing wallet balance label */
  walletBalance?: number;
  /** Required for payout mode */
  targetCurrency?: string;
  /** list: full-width rows (deposit modal); grid: card grid (send-money, wallet) */
  layout?: 'list' | 'grid';
  /** Cap visible options (e.g. dashboard preview) */
  maxVisible?: number;
  /** Omit internal wallet balance row (linked accounts / settings) */
  excludeWalletBalance?: boolean;
  readOnly?: boolean;
  className?: string;
  title?: string;
  subtitle?: string;
}

function enrichOption(opt: FundingOption) {
  const meta = MONEY_SOURCE_CHANNEL_META[opt.channel] ?? {};
  const imageUrl = opt.imageUrl ?? getProviderImageUrl(opt.value);
  return { ...opt, ...meta, imageUrl };
}

export default function MoneySourcesProviders({
  mode,
  currency,
  value,
  onChange,
  walletBalance = 0,
  targetCurrency,
  layout = 'grid',
  maxVisible,
  excludeWalletBalance = false,
  readOnly = false,
  className,
  title,
  subtitle,
}: MoneySourcesProvidersProps) {
  const t = useTranslations('MoneySources');
  const tSend = useTranslations('SendMoney');

  const { options, hasMoreOptions } = useMemo(() => {
    const raw =
      mode === 'payout'
        ? getPayoutOptions(targetCurrency ?? currency)
        : getFundingOptions(currency, walletBalance);
    const enriched = raw
      .map(enrichOption)
      .filter((opt) => !(excludeWalletBalance && opt.value === 'wallet_balance'));
    const visible = maxVisible ? enriched.slice(0, maxVisible) : enriched;
    return {
      options: visible,
      hasMoreOptions: Boolean(maxVisible && enriched.length > maxVisible),
    };
  }, [mode, currency, targetCurrency, walletBalance, maxVisible, excludeWalletBalance]);

  const channelLabel = (channel: string) => {
    if (isKnownChannel(channel)) {
      return tSend(`channels.${channel}` as Parameters<typeof tSend>[0]);
    }
    return channel.replace(/_/g, ' ');
  };

  const processingLabel = (key?: string) => {
    if (!key) return null;
    return t(`processing.${key}` as Parameters<typeof t>[0]);
  };

  const displayLabel = (opt: FundingOption) => {
    if (mode === 'funding' && opt.value === 'wallet_balance') {
      return tSend('funding.walletWithBalance', {
        balance: walletBalance.toFixed(2),
        currency,
      });
    }
    if (mode === 'payout' && opt.value.startsWith('wallet_topup_')) {
      return tSend('payout.walletTopUp', { currency: targetCurrency ?? currency });
    }
    return opt.label;
  };

  const gridClass =
    layout === 'list'
      ? 'flex flex-col gap-2'
      : 'grid grid-cols-1 gap-2 sm:grid-cols-2';

  return (
    <div className={cn('space-y-3', className)}>
      {(title || subtitle) && (
        <div>
          {title ? <h3 className="text-sm font-semibold text-foreground">{title}</h3> : null}
          {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
      )}
      {!title && (
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {mode === 'payout' ? t('payoutTitle') : t('fundingTitle')}
        </p>
      )}
      <div className={gridClass}>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = value === opt.value;
          const time = processingLabel(opt.processingTimeKey);

          return (
            <button
              key={opt.value}
              type="button"
              disabled={readOnly}
              onClick={() => !readOnly && onChange(opt.value)}
              className={cn(
                'rounded-lg border-2 p-3 text-left transition-all',
                layout === 'list' ? 'flex items-center gap-3' : 'flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3',
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                  : 'border-border hover:border-muted-foreground/40 hover:bg-muted/40',
                readOnly && 'cursor-default opacity-90'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg text-lg',
                  opt.imageUrl
                    ? 'bg-background ring-1 ring-border'
                    : isSelected
                      ? 'bg-primary/15 text-primary'
                      : 'bg-muted text-muted-foreground'
                )}
              >
                {opt.imageUrl ? (
                  <Image
                    src={opt.imageUrl}
                    alt=""
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : opt.emoji ? (
                  <span aria-hidden>{opt.emoji}</span>
                ) : (
                  <Icon size={20} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground">{displayLabel(opt)}</div>
                <div className="text-xs text-muted-foreground capitalize">
                  {channelLabel(opt.channel)}
                  {time ? ` · ${time}` : ''}
                </div>
              </div>
              {isSelected && !readOnly ? (
                <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
              ) : null}
            </button>
          );
        })}
      </div>
      {hasMoreOptions ? (
        <p className="text-xs text-muted-foreground">{t('moreInDeposit')}</p>
      ) : null}
    </div>
  );
}
