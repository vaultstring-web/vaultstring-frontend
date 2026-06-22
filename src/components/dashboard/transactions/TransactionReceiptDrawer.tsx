'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/src/lib/api/api-client';
import { formatCurrency } from '@/src/lib/utils/formatters';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/src/components/ui/sheet';
import { Button } from '@/src/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { toast } from 'sonner';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';

type Receipt = {
  transaction_id: string;
  reference: string;
  date: string;
  sender_name: string;
  receiver_name: string;
  amount: string | number;
  currency: string;
  fee: string | number;
  total_debited: string | number;
  status: string;
  description?: string;
};

type TransactionReceiptDrawerProps = {
  transactionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TransactionReceiptDrawer({
  transactionId,
  open,
  onOpenChange,
}: TransactionReceiptDrawerProps) {
  const t = useTranslations('Receipt');
  const td = useTranslations('Disputes');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [disputeStatus, setDisputeStatus] = useState<string | null>(null);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('incorrect_amount');
  const [disputeNotes, setDisputeNotes] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  useEffect(() => {
    if (!open || !transactionId) {
      setReceipt(null);
      setError(null);
      setDisputeStatus(null);
      setShowDisputeForm(false);
      return;
    }

    let mounted = true;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const [r, disputesRes] = await Promise.all([
          apiFetch<Receipt>(`/transactions/${encodeURIComponent(transactionId)}/receipt`),
          apiFetch(`/disputes/mine?limit=50&offset=0`).catch(() => null),
        ]);
        if (mounted) {
          setReceipt(r);
          if (r.status?.toLowerCase() === 'disputed') {
            setDisputeStatus('disputed');
          } else if (disputesRes?.disputes) {
            const found = (disputesRes.disputes as Array<{ transaction?: { id?: string }; id?: string }>).find(
              (d) => d.transaction?.id === transactionId || d.id === transactionId
            );
            if (found) setDisputeStatus('disputed');
          }
        }
      } catch (e: unknown) {
        if (mounted) setError(e instanceof Error ? e.message : t('loadFailed'));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [open, transactionId, t]);

  const handleRaiseDispute = async () => {
    if (!transactionId) return;
    setSubmittingDispute(true);
    try {
      await apiFetch('/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: transactionId,
          reason: disputeNotes.trim() || disputeReason,
        }),
      });
      setDisputeStatus('disputed');
      setShowDisputeForm(false);
      toast.success(td('raisedSuccess', { defaultValue: 'Dispute submitted. We will review within 5 business days.' }));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : td('raisedFailed', { defaultValue: 'Could not submit dispute.' }));
    } finally {
      setSubmittingDispute(false);
    }
  };

  const canDispute =
    receipt &&
    !disputeStatus &&
    !['failed', 'cancelled', 'reversed', 'refunded'].includes(receipt.status?.toLowerCase() || '');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('proofHeading')}</SheetTitle>
          <SheetDescription>{receipt?.reference || transactionId || ''}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 px-1">
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {receipt && !loading && (
            <>
              <div className="rounded-xl border p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('labelStatus')}</span>
                  <span className="font-semibold capitalize">{receipt.status}</span>
                </div>
                {disputeStatus && (
                  <div className="flex items-center gap-2 rounded-md bg-amber-500/10 px-2 py-1 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs font-medium">
                      {td('statusOpen', { defaultValue: 'Dispute under review' })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('labelAmount')}</span>
                  <span className="font-mono font-semibold">
                    {formatCurrency(Number(receipt.amount), receipt.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('labelFee')}</span>
                  <span className="font-mono">{formatCurrency(Number(receipt.fee), receipt.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('labelSender')}</span>
                  <span>{receipt.sender_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('labelReceiver')}</span>
                  <span>{receipt.receiver_name}</span>
                </div>
                {receipt.date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('labelDate')}</span>
                    <span>{new Date(receipt.date).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {canDispute && !showDisputeForm && (
                <Button variant="outline" className="w-full" onClick={() => setShowDisputeForm(true)}>
                  {td('raise', { defaultValue: 'Raise dispute' })}
                </Button>
              )}

              {showDisputeForm && (
                <div className="rounded-xl border p-4 space-y-3">
                  <Label>{td('reasonLabel', { defaultValue: 'Reason' })}</Label>
                  <Select value={disputeReason} onValueChange={setDisputeReason}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incorrect_amount">{td('reasonAmount', { defaultValue: 'Incorrect amount' })}</SelectItem>
                      <SelectItem value="duplicate">{td('reasonDuplicate', { defaultValue: 'Duplicate charge' })}</SelectItem>
                      <SelectItem value="fraud">{td('reasonFraud', { defaultValue: 'Unauthorized / fraud' })}</SelectItem>
                      <SelectItem value="goods_not_received">{td('reasonNotReceived', { defaultValue: 'Not received' })}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Label>{td('notesLabel', { defaultValue: 'Details (optional)' })}</Label>
                  <Textarea
                    value={disputeNotes}
                    onChange={(e) => setDisputeNotes(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setShowDisputeForm(false)}>
                      {td('cancel', { defaultValue: 'Cancel' })}
                    </Button>
                    <Button onClick={() => void handleRaiseDispute()} disabled={submittingDispute}>
                      {submittingDispute ? td('submitting', { defaultValue: 'Submitting…' }) : td('submit', { defaultValue: 'Submit dispute' })}
                    </Button>
                  </div>
                </div>
              )}

              <Button asChild variant="outline" className="w-full">
                <Link href={`/transactions/success?tx=${encodeURIComponent(receipt.transaction_id)}`}>
                  {t('viewHistory')}
                </Link>
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
