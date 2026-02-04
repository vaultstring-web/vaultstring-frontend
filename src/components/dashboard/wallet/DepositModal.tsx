'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { depositToWallet, Wallet } from '@/src/lib/api/wallet';
import { Loader2, ArrowDownCircle, Building2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface DepositModalProps {
  wallet: Wallet | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DepositModal({ wallet, open, onOpenChange, onSuccess }: DepositModalProps) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [sourceId, setSourceId] = useState('bank-1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) return;
    
    setLoading(true);

    try {
      await depositToWallet(wallet.id, parseFloat(amount), sourceId, wallet.currency);
      toast.success(`Successfully deposited ${wallet.currency} ${amount}`);
      onSuccess();
      onOpenChange(false);
      setAmount('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to deposit funds');
    } finally {
      setLoading(false);
    }
  };

  if (!wallet) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
              <ArrowDownCircle size={18} />
            </div>
            Deposit Money
          </DialogTitle>
          <DialogDescription>
            Add funds to your {wallet.currency} wallet.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="source">Funding Source</Label>
            <Select value={sourceId} onValueChange={setSourceId} disabled={loading}>
              <SelectTrigger id="source">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank-1">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-slate-500" />
                    <span>Linked Bank (**** 1234)</span>
                  </div>
                </SelectItem>
                <SelectItem value="card-1">
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} className="text-slate-500" />
                    <span>Visa Card (**** 5678)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({wallet.currency})</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
              min="1"
              step="0.01"
              required
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
             <div className="flex justify-between mb-1">
               <span>Fee</span>
               <span>{wallet.currency} 0.00</span>
             </div>
             <div className="flex justify-between font-medium">
               <span>Total Charge</span>
               <span>{wallet.currency} {amount || '0.00'}</span>
             </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !amount} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowDownCircle size={16} />}
              Confirm Deposit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
