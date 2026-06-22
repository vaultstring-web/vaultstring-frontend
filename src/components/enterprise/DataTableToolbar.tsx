'use client';

import { Search } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { cn } from '@/lib/utils';

type DataTableToolbarProps = {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  resultSummary?: string;
  className?: string;
};

export function DataTableToolbar({
  searchPlaceholder = 'Search…',
  searchValue,
  onSearchChange,
  filters,
  actions,
  resultSummary,
  className,
}: DataTableToolbarProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {onSearchChange !== undefined ? (
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue ?? ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 bg-background pl-9"
              />
            </div>
          ) : null}
          {filters ? (
            <div className="flex flex-wrap items-center gap-2">{filters}</div>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {resultSummary ? (
        <p className="text-xs text-muted-foreground">{resultSummary}</p>
      ) : null}
    </div>
  );
}
