'use client';

import { useAuth } from '@/src/context/AuthContext';
import { Plus, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { useWalletStats } from '@/src/hooks/useWalletStats';
import WalletCard from '@/src/components/dashboard/wallet/WalletCard';
import { CreateWalletModal } from '@/src/components/dashboard/wallet/CreateWalletModal';
import { DepositModal } from '@/src/components/dashboard/wallet/DepositModal';
import { WithdrawModal } from '@/src/components/dashboard/wallet/WithdrawModal';
import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Wallet } from '@/src/hooks/useWalletStats';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/src/components/enterprise/PageHeader';
import { CustomerPageShell } from '@/src/components/enterprise/CustomerPageShell';
import { WalletRecentActivity } from '@/src/components/dashboard/wallet/WalletRecentActivity';
import WalletOverviewStrip from '@/src/components/dashboard/wallet/WalletOverviewStrip';
import WalletBalanceHeader from '@/src/components/dashboard/wallet/WalletBalanceHeader';
import WalletDataEmptyState from '@/src/components/dashboard/home/WalletDataEmptyState';
import MoneySourcesProviders from '@/src/components/dashboard/money-sources/MoneySourcesProviders';
import BalanceToggle from '@/src/components/dashboard/wallet/BalanceToggle';

export default function WalletPage() {
  const t = useTranslations('Wallet');
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = user?.id || (user as { ID?: string })?.ID || '';
  const isVerified = user?.kycStatus === 'verified';

  const { wallets, loading, fetchError, refetch } = useWalletStats();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [depositWallet, setDepositWallet] = useState<Wallet | null>(null);
  const [withdrawWallet, setWithdrawWallet] = useState<Wallet | null>(null);
  const [depositSourceId, setDepositSourceId] = useState('wallet_balance');

  const primaryWallet = wallets[0] ?? null;
  const primaryCurrency = String(primaryWallet?.currency ?? 'MWK').toUpperCase();
  const primaryBalance = useMemo(
    () => parseFloat(String(primaryWallet?.available_balance ?? primaryWallet?.balance ?? 0)),
    [primaryWallet]
  );

  useEffect(() => {
    if (searchParams.get('deposit') !== '1' || loading || wallets.length === 0) return;
    const primary = wallets[0];
    if (primary && isVerified) {
      setDepositWallet(primary);
      router.replace('/wallet', { scroll: false });
    }
  }, [searchParams, loading, wallets, isVerified, router]);

  const handleCreateWallet = () => {
    if (!isVerified) {
      toast.error(t('errors.identityRequiredTitle'), {
        description: t('errors.identityRequiredSubtitle'),
        action: {
          label: t('verifyNow'),
          onClick: () => router.push('/onboarding'),
        },
      });
      return;
    }
    setIsCreateModalOpen(true);
  };

  const openDeposit = (wallet?: Wallet) => {
    const target = wallet ?? primaryWallet;
    if (!target) return;
    if (!isVerified) {
      handleCreateWallet();
      return;
    }
    setDepositWallet(target);
  };

  return (
    <CustomerPageShell compact>
      <PageHeader
        title={t('title')}
        description={t('subtitleCompact')}
        actions={
          <>
            <BalanceToggle />
            <Button onClick={handleCreateWallet} disabled={!isVerified} size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              {t('addNewCard')}
            </Button>
          </>
        }
      />

      {!isVerified && (
        <button
          type="button"
          onClick={() => router.push('/onboarding')}
          className="vs-card-shell flex w-full items-center justify-between gap-4 border-amber-500/30 bg-amber-500/5 p-3 text-left transition-colors hover:bg-amber-500/10"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-amber-600" />
            <p className="text-sm font-medium text-foreground">{t('verificationNotice')}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </button>
      )}

      {!loading && wallets.length > 0 ? (
        <>
          <WalletBalanceHeader wallets={wallets} primaryCurrency={primaryCurrency} />
          <WalletOverviewStrip
            wallets={wallets}
            onAddWallet={handleCreateWallet}
            onDeposit={() => openDeposit()}
            onWithdraw={() => {
              const primary = wallets[0];
              if (primary && isVerified) setWithdrawWallet(primary);
              else if (!isVerified) handleCreateWallet();
            }}
          />
          <section className="vs-card-shell space-y-3 p-4">
            <MoneySourcesProviders
              mode="funding"
              currency={primaryCurrency}
              walletBalance={primaryBalance}
              value={depositSourceId}
              onChange={(id) => {
                setDepositSourceId(id);
                openDeposit();
              }}
              title={t('moneySources.title')}
              subtitle={t('moneySources.subtitle')}
              layout="grid"
            />
          </section>
        </>
      ) : null}

      {!loading && wallets.length === 0 ? (
        <WalletDataEmptyState fetchError={fetchError} />
      ) : null}

      {!loading && wallets.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {wallets.map((wallet) => (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              userId={userId}
              onDeposit={(w) => openDeposit(w)}
            />
          ))}
          <button
            type="button"
            onClick={handleCreateWallet}
            disabled={!isVerified}
            className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 p-6 transition-colors hover:border-primary/40 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {isVerified ? t('addMultiCurrencyCard') : t('verificationRequiredTitle')}
            </span>
          </button>
        </div>
      ) : null}

      <WalletRecentActivity />

      <CreateWalletModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} onSuccess={refetch} />
      <DepositModal
        wallet={depositWallet}
        open={!!depositWallet}
        onOpenChange={(open) => !open && setDepositWallet(null)}
        onSuccess={refetch}
        initialSourceId={depositSourceId}
      />
      <WithdrawModal
        wallet={withdrawWallet}
        open={!!withdrawWallet}
        onOpenChange={(open) => !open && setWithdrawWallet(null)}
      />
    </CustomerPageShell>
  );
}
