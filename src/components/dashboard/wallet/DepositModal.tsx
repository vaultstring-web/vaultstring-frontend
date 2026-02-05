'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { depositToWallet, Wallet as WalletType } from '@/src/lib/api/wallet';
import { Loader2, ArrowDownCircle, Building2, CreditCard, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface DepositModalProps {
  wallet: WalletType | null;
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
      <DialogContent className="sm:max-w-[480px] border-none bg-white rounded-[40px] shadow-[0_50px_100px_rgba(0,0,0,0.1)] p-0 overflow-hidden">
        <div className="bg-slate-900 p-10 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl rounded-full" />
          <DialogHeader className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 text-green-400 font-black text-[10px] uppercase tracking-[0.3em]">
              <ShieldCheck size={14} /> Secure Funding
            </div>
            <DialogTitle className="text-3xl font-black tracking-tighter">
              Deposit {wallet.currency}
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium leading-relaxed">
              Instantly fund your wallet from your linked bank or card.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-white">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Funding Source</Label>
              <Select value={sourceId} onValueChange={setSourceId} disabled={loading}>
                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-900">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                  <SelectItem value="bank-1" className="font-bold py-3">Linked Bank (**** 1234)</SelectItem>
                  <SelectItem value="card-1" className="font-bold py-3">Visa Card (**** 5678)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Deposit Amount</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-16 pl-6 pr-16 rounded-2xl bg-slate-50 border-none font-black text-xl text-slate-900 focus:ring-2 focus:ring-green-500/20"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-300">{wallet.currency}</div>
              </div>
            </div>
          </div>

          {/* Receipt-style summary box */}
          <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-[28px] space-y-3">
             <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-tighter">
               <span>Service Fee</span>
               <span>{wallet.currency} 0.00</span>
             </div>
             <div className="h-px bg-slate-100 w-full" />
             <div className="flex justify-between items-center">
               <span className="text-xs font-black text-slate-900 uppercase">Total Settlement</span>
               <span className="text-lg font-black text-slate-900">{wallet.currency} {amount || '0.00'}</span>
             </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading || !amount} 
            className="h-16 w-full bg-slate-900 hover:bg-black text-white font-black text-lg rounded-[24px] shadow-2xl shadow-slate-200 transition-all hover:scale-[1.01]"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><ArrowRight size={20} className="mr-2" /> Confirm Deposit</>}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}