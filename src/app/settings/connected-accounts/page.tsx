'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { SettingsPageShell } from '@/src/components/settings/SettingsPageShell';
import { SettingsSection } from '@/src/components/enterprise/SettingsSection';
import MoneySourcesProviders from '@/src/components/dashboard/money-sources/MoneySourcesProviders';
import { useWalletStats } from '@/src/hooks/useWalletStats';
import { apiFetch } from '@/src/lib/api/api-client';

type LinkedAccount = {
  id: string;
  provider: string;
  label: string;
  external_id: string;
  currency: string;
  is_default: boolean;
  status: string;
};

export default function SettingsConnectedAccountsPage() {
  const t = useTranslations('Settings');
  const { stats } = useWalletStats();
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('airtel_money');

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/users/me/linked-accounts');
      setAccounts(Array.isArray(res?.accounts) ? res.accounts : []);
    } catch {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const handleLink = async () => {
    setLinking(true);
    try {
      await apiFetch('/users/me/linked-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          label: selectedProvider.replace(/_/g, ' '),
          is_default: accounts.length === 0,
        }),
      });
      toast.success(t('connectedAccounts.linkedSuccess', { defaultValue: 'Account linked.' }));
      await loadAccounts();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t('error'));
    } finally {
      setLinking(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await apiFetch(`/users/me/linked-accounts/${encodeURIComponent(id)}`, { method: 'DELETE' });
      toast.success(t('connectedAccounts.removed', { defaultValue: 'Account removed.' }));
      await loadAccounts();
    } catch {
      toast.error(t('error'));
    }
  };

  return (
    <SettingsPageShell>
      <SettingsSection
        title={t('connectedAccounts.title')}
        description={t('connectedAccounts.subtitle')}
        icon={<Link2 className="h-5 w-5" />}
        actions={
          accounts.length > 0 ? (
            <Badge variant="secondary" className="text-xs">
              {accounts.length} linked
            </Badge>
          ) : null
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('connectedAccounts.providersHint')}</p>
          <MoneySourcesProviders
            mode="funding"
            currency={String(stats?.primaryCurrency ?? 'MWK')}
            walletBalance={stats?.balanceMWK ?? 0}
            value={selectedProvider}
            onChange={setSelectedProvider}
            excludeWalletBalance
            layout="list"
          />
          <Button size="sm" onClick={() => void handleLink()} disabled={linking}>
            <Plus className="h-4 w-4 mr-1" />
            {linking ? t('saving', { defaultValue: 'Saving…' }) : t('connectedAccounts.linkProvider', { defaultValue: 'Link selected provider' })}
          </Button>

          {loading ? (
            <p className="text-sm text-muted-foreground">{t('loading', { defaultValue: 'Loading…' })}</p>
          ) : accounts.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t('connectedAccounts.noneYet', { defaultValue: 'No linked accounts yet.' })}</p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {accounts.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                  <div>
                    <p className="font-medium capitalize">{a.provider.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground">{a.currency}{a.is_default ? ' · Primary' : ''}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => void handleRemove(a.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SettingsSection>
    </SettingsPageShell>
  );
}
