import { cn } from '@/lib/utils';

type PageHeaderProps = {
  title: string;
  description?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  meta,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border pb-3',
        className
      )}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
        <h1 className="text-base font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? (
          <span className="hidden text-sm text-muted-foreground sm:inline">{description}</span>
        ) : null}
        {meta ? <span className="text-xs text-muted-foreground">{meta}</span> : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
      {description ? (
        <p className="w-full text-sm text-muted-foreground sm:hidden">{description}</p>
      ) : null}
    </div>
  );
}
