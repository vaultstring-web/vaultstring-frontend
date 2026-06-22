import { Coins } from 'lucide-react';
import { EXCHANGE_RATE_MWK_TO_CNY, EXCHANGE_RATE_CNY_TO_MWK } from '@/src/lib/constants';
import { useTranslations } from 'next-intl';

interface RateCardProps {
  rates?: Record<string, number>;
  primaryCurrency?: string;
}

export default function RateCard({ rates, primaryCurrency = 'MWK' }: RateCardProps) {
  const t = useTranslations('Dashboard');

  const displayRates: { from: string; to: string; rate: number }[] = [];

  const getRate = (from: string, to: string) => {
    const key = `${from}-${to}`;
    if (rates?.[key]) return rates[key];
    if (from === 'MWK' && to === 'CNY') return rates?.['mwkToCny'] ?? EXCHANGE_RATE_MWK_TO_CNY;
    if (from === 'CNY' && to === 'MWK') return rates?.['cnyToMwk'] ?? EXCHANGE_RATE_CNY_TO_MWK;
    return null;
  };

  const targets = ['MWK', 'CNY', 'ZMW', 'ZAR', 'USD'];
  targets.forEach((target) => {
    if (target === primaryCurrency) return;
    const rate = getRate(primaryCurrency, target);
    if (rate) displayRates.push({ from: primaryCurrency, to: target, rate });
  });

  if (displayRates.length === 0) {
    displayRates.push({
      from: 'MWK',
      to: 'CNY',
      rate: getRate('MWK', 'CNY') || EXCHANGE_RATE_MWK_TO_CNY,
    });
  }

  return (
    <div className="vs-card-shell flex flex-col justify-between p-6">
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Coins size={18} className="text-muted-foreground" />
          {t('currentRate')}
        </h3>
        <div className="space-y-3">
          {displayRates.slice(0, 4).map((r, i) => (
            <div
              key={`${r.from}-${r.to}`}
              className={`flex items-center justify-between text-sm ${
                i < Math.min(displayRates.length, 4) - 1 ? 'border-b border-border pb-3' : ''
              }`}
            >
              <span className="text-muted-foreground">
                1 {r.from} =
              </span>
              <span className="font-mono font-medium text-foreground">
                {Number(r.rate).toFixed(4)} {r.to}
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
        {t('lastUpdatedJustNow')}
      </p>
    </div>
  );
}
