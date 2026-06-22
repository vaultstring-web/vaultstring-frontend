'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';
import { depositToWallet, Wallet as WalletType } from '@/src/lib/api/wallet';
import { Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import MoneySourcesProviders from '@/src/components/dashboard/money-sources/MoneySourcesProviders';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface DepositModalProps {
  wallet: WalletType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialSourceId?: string;
}

export function DepositModal({
  wallet,
  open,
  onOpenChange,
  onSuccess,
  initialSourceId = 'airtel_money',
}: DepositModalProps) {
  const t = useTranslations('Wallet.depositModal');
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [sourceId, setSourceId] = useState(initialSourceId);

  useEffect(() => {
    if (open) setSourceId(initialSourceId);
  }, [open, initialSourceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) return;
    setLoading(true);
    try {
      const result = await depositToWallet(wallet.id, parseFloat(amount), sourceId, wallet.currency);
      const ref = result.money_api?.provider_ref;
      toast.success(
        ref
          ? t('successWithRef', { currency: wallet.currency, amount, ref })
          : t('success', { currency: wallet.currency, amount })
      );
      onSuccess();
      onOpenChange(false);
      setAmount('');
    } catch (error: any) {
      toast.error(error.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  if (!wallet) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl shadow-lg p-0 overflow-hidden">
        <div className="bg-slate-900 px-8 py-6 text-white">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
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

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white dark:bg-slate-900">
          <div className="space-y-6">
            <MoneySourcesProviders
              mode="funding"
              currency={String(wallet.currency).toUpperCase()}
              walletBalance={parseFloat(String(wallet.available_balance ?? wallet.balance ?? 0))}
              value={sourceId}
              onChange={setSourceId}
              layout="list"
              title={t('fundingSource')}
            />

            <div className="space-y-3">
              <Label className="ml-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('depositAmount')}</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder={t('amountPlaceholder')}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-14 rounded-lg border-border bg-muted/30 pl-6 pr-16 text-lg font-semibold text-foreground focus:ring-2 focus:ring-primary/20"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">{wallet.currency}</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-6 rounded-[28px] space-y-3">
             <div className="flex justify-between text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-tighter">
               <span>{t('serviceFee')}</span>
               <span>{wallet.currency} 0.00</span>
             </div>
             <div className="h-px bg-slate-100 w-full" />
             <div className="flex justify-between items-center">
               <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase">{t('totalSettlement')}</span>
               <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">{wallet.currency} {amount || '0.00'}</span>
             </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading || !amount} 
            className="h-12 w-full bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold rounded-lg"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><ArrowRight size={20} className="mr-2" /> {t('confirmDeposit')}</>}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
