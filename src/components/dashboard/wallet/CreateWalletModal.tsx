'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Label } from '@/src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { createWallet } from '@/src/lib/api/wallet';
import { Loader2, Plus, Wallet, Sparkles, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface CreateWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateWalletModal({ open, onOpenChange, onSuccess }: CreateWalletModalProps) {
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState('MWK');
  const [type, setType] = useState('personal');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createWallet({ currency, type });
      toast.success('Wallet created successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* We force a solid background and high z-index to stop the "ghosting" issue */}
      <DialogContent className="sm:max-w-[480px] border-none bg-white rounded-[40px] shadow-[0_50px_100px_rgba(0,0,0,0.1)] p-0 overflow-hidden">
        <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 blur-3xl rounded-full" />
          <DialogHeader className="relative z-10 space-y-3">
            <div className="flex items-center gap-2 text-green-400 font-black text-[10px] uppercase tracking-[0.3em]">
              <Sparkles size={14} /> New Asset
            </div>
            <DialogTitle className="text-3xl font-black tracking-tighter flex items-center gap-3">
               Add Multi-Currency Wallet
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium">
              Create a new liquidity card to start transacting globally.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-white">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Base Currency</Label>
              <Select value={currency} onValueChange={setCurrency} disabled={loading}>
                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 focus:ring-2 focus:ring-green-500/20">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                  <SelectItem value="MWK" className="font-bold py-3">Malawian Kwacha (MWK)</SelectItem>
                  <SelectItem value="CNY" className="font-bold py-3">Chinese Yuan (CNY)</SelectItem>
                  <SelectItem value="ZMW" className="font-bold py-3">Zambian Kwacha (ZMW)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Account Category</Label>
              <Select value={type} onValueChange={setType} disabled={loading}>
                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 focus:ring-2 focus:ring-green-500/20">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                  <SelectItem value="personal" className="font-bold py-3">Personal Use</SelectItem>
                  <SelectItem value="business" className="font-bold py-3">Business / Merchant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={loading} 
              className="h-16 w-full bg-green-600 hover:bg-green-700 text-white font-black text-lg rounded-[24px] shadow-xl shadow-green-100 transition-all hover:scale-[1.02]"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Plus size={20} className="mr-2" /> Create My Wallet</>}
            </Button>
            <button 
              type="button" 
              onClick={() => onOpenChange(false)} 
              className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              Discard Changes
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}