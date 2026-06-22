import { cn } from '@/lib/utils';

type CustomerPageShellProps = {
  children: React.ReactNode;
  className?: string;
  /** default max-w-6xl, wide max-w-7xl, narrow max-w-3xl */
  width?: 'default' | 'wide' | 'narrow';
  /** Tighter vertical rhythm (my-wallet style, less scroll) */
  compact?: boolean;
};

const widthClass = {
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
  narrow: 'max-w-3xl',
} as const;

export function CustomerPageShell({
  children,
  className,
  width = 'default',
  compact = false,
}: CustomerPageShellProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        compact ? 'vs-page-stack-compact' : 'vs-page-stack',
        widthClass[width],
        className
      )}
    >
      {children}
    </div>
  );
}
