'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface SendMoneyStepperProps {
  step: 1 | 2 | 3;
  className?: string;
}

export default function SendMoneyStepper({ step, className }: SendMoneyStepperProps) {
  const t = useTranslations('SendMoney.stepper');
  const labels = [t('details'), t('review'), t('success')] as const;

  return (
    <div className={cn('mb-6', className)}>
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 top-4 -z-10 h-0.5 w-full bg-border" aria-hidden />
        {([1, 2, 3] as const).map((s) => (
          <div key={s} className="flex flex-col items-center gap-1.5 bg-background px-1">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors',
                step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              {s}
            </div>
            <span
              className={cn(
                'text-xs font-medium',
                step >= s ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {labels[s - 1]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
