import type { LucideIcon } from 'lucide-react';

/** Channel metadata for deposit / funding UI (my-wallet style hints). */
export const MONEY_SOURCE_CHANNEL_META: Record<
  string,
  { processingTimeKey?: string; emoji?: string }
> = {
  wallet: { processingTimeKey: 'instant', emoji: '💼' },
  mobile_money: { processingTimeKey: 'minutes', emoji: '📱' },
  bank: { processingTimeKey: 'days', emoji: '🏦' },
  card: { processingTimeKey: 'card', emoji: '💳' },
  api: { processingTimeKey: 'api', emoji: '🔌' },
  web: { processingTimeKey: 'instant', emoji: '🌐' },
};

export type MoneySourceDisplay = {
  value: string;
  label: string;
  channel: string;
  icon: LucideIcon;
  processingTimeKey?: string;
  emoji?: string;
};
