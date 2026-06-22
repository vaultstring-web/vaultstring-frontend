'use client';

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Wallet as WalletType } from '@/src/lib/api/wallet';
import { ArrowUpRight, Building2, Loader2, ShieldCheck, Wallet } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/src/lib/utils/formatters';

interface WithdrawModalProps {
  wallet: WalletType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WithdrawModal({ wallet, open, onOpenChange }: WithdrawModalProps) {
  const t = useTranslations('Wallet.withdrawModal');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState<'wallet' | 'bank'>('wallet');
  const [sourceId, setSourceId] = useState('bank-1');

  const available = wallet ? parseFloat(String(wallet.available_balance ?? 0)) : 0;

  const handleContinue = async () => {
    if (!wallet) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        from: wallet.currency,
        amount: amount || '',
      });
      if (destination === 'bank') {
        params.set('payout', 'bank');
      }
      onOpenChange(false);
      router.push(`/send-money?${params.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  if (!wallet) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-xl border border-border p-0 overflow-hidden">
        <div className="bg-slate-900 px-8 py-6 text-white">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
              <ShieldCheck size={14} /> {t('secureBadge')}
            </div>
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {t('title', { currency: wallet.currency })}
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium leading-relaxed">
              {t('subtitle')}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-6 bg-card p-8">
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('available')}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
              {formatCurrency(available, wallet.currency)}
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('destination')}</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={destination === 'wallet' ? 'default' : 'outline'}
                className="h-11 justify-start gap-2"
                onClick={() => setDestination('wallet')}
              >
                <Wallet className="h-4 w-4" />
                {t('toWallet')}
              </Button>
              <Button
                type="button"
                variant={destination === 'bank' ? 'default' : 'outline'}
                className="h-11 justify-start gap-2"
                onClick={() => setDestination('bank')}
              >
                <Building2 className="h-4 w-4" />
                {t('toBank')}
              </Button>
            </div>
          </div>

          {destination === 'bank' ? (
            <div className="space-y-3">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('payoutAccount')}</Label>
              <Select value={sourceId} onValueChange={setSourceId} disabled={loading}>
                <SelectTrigger className="h-12 rounded-lg border-border bg-muted/30 font-medium">
                  <SelectValue placeholder={t('selectAccount')} />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="bank-1">{t('linkedBank')}</SelectItem>
                  <SelectItem value="card-1">{t('visaCard')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{t('bankNote')}</p>
            </div>
          ) : null}

          <div className="space-y-3">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('amount')}</Label>
            <div className="relative">
              <Input
                type="number"
                placeholder={t('amountPlaceholder')}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-14 rounded-lg border-border bg-muted/30 pr-16 text-lg font-semibold"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                {wallet.currency}
              </div>
            </div>
          </div>

          <Button
            type="button"
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className="h-12 w-full font-semibold"
            onClick={handleContinue}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <ArrowUpRight className="mr-2 h-5 w-5" />
                {t('continueToSend')}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
