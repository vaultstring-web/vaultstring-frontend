import { cn } from '@/lib/utils';

const toneMap = {
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-transparent',
  warning: 'bg-amber-50 text-amber-800 dark:bg-amber-300 dark:text-amber-400 border-transparent',
  danger: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-transparent',
  neutral: 'bg-muted text-muted-foreground border-transparent',
  info: 'bg-primary/10 text-primary border-transparent',
} as const;

type StatusChipProps = {
  label: string;
  tone?: keyof typeof toneMap;
  className?: string;
};

export function StatusChip({ label, tone = 'neutral', className }: StatusChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize',
        toneMap[tone],
        className
      )}
    >
      {label}
    </span>
  );
}
