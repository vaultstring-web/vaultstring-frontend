'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Globe, Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Input } from '@/src/components/ui/input';
import { SUPPORTED_LANGUAGES } from '@/src/lib/constants/africa';
import { setAppLocale } from '@/src/lib/locale';
import { cn } from '@/lib/utils';

type LanguageSelectorVariant = 'select' | 'list' | 'grid';

type LanguageSelectorProps = {
  variant?: LanguageSelectorVariant;
  className?: string;
  showSearch?: boolean;
  manageLinkHref?: string;
  onChange?: (code: string) => void;
};

export function LanguageSelector({
  variant = 'select',
  className,
  showSearch = variant !== 'select',
  manageLinkHref,
  onChange,
}: LanguageSelectorProps) {
  const t = useTranslations('Language');
  const currentLocale = useLocale();
  const [search, setSearch] = useState('');
  const [value, setValue] = useState(currentLocale);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return SUPPORTED_LANGUAGES;
    return SUPPORTED_LANGUAGES.filter(
      (lang) =>
        lang.name.toLowerCase().includes(q) ||
        lang.region.toLowerCase().includes(q) ||
        lang.code.toLowerCase().includes(q)
    );
  }, [search]);

  const applyLocale = (code: string) => {
    setValue(code);
    onChange?.(code);
    setAppLocale(code);
  };

  if (variant === 'select') {
    return (
      <div className={cn('space-y-2', className)}>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Globe className="h-4 w-4 text-muted-foreground" aria-hidden />
          {t('label')}
        </label>
        <select
          value={value}
          onChange={(e) => applyLocale(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          aria-label={t('label')}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
        {manageLinkHref ? (
          <p className="text-xs text-muted-foreground">
            <Link href={manageLinkHref} className="font-medium text-primary hover:underline">
              {t('manageAll')}
            </Link>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">{t('label')}</p>
          <p className="text-xs text-muted-foreground">{t('hint')}</p>
        </div>
        {showSearch ? (
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="h-9 pl-9"
            />
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          variant === 'grid'
            ? 'grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3'
            : 'space-y-2'
        )}
      >
        {filtered.map((lang) => {
          const active = currentLocale === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => applyLocale(lang.code)}
              className={cn(
                'flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors',
                active
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/50'
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="text-xl" aria-hidden>
                  {lang.flag}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{lang.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{lang.region}</p>
                </div>
              </div>
              {active ? (
                <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              ) : null}
            </button>
          );
        })}
      </div>

      {manageLinkHref ? (
        <p className="text-xs text-muted-foreground">
          <Link href={manageLinkHref} className="font-medium text-primary hover:underline">
            {t('manageAll')}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
