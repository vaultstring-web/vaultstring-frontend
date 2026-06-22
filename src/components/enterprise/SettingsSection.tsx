import { cn } from '@/lib/utils';

type SettingsSectionProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
};

export function SettingsSection({
  title,
  description,
  icon,
  children,
  className,
  actions,
}: SettingsSectionProps) {
  return (
    <section className={cn('vs-card-shell p-6', className)}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          {icon ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
              {icon}
            </div>
          ) : null}
          <div>
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
