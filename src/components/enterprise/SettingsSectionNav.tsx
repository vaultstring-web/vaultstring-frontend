'use client';

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export type SettingsNavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

type SettingsSectionNavProps = {
  items: SettingsNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
  ariaLabel?: string;
};

/** Horizontal tab strip for settings sections (Stripe-style). */
export function SettingsSectionNav({
  items,
  activeId,
  onSelect,
  className,
  ariaLabel = 'Settings sections',
}: SettingsSectionNavProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn('w-full border-b border-border', className)}
    >
      <div className="-mb-px flex gap-1 overflow-x-auto pb-px">
        {items.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              activeId === id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="whitespace-nowrap">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
