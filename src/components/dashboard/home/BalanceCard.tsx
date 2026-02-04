import Link from 'next/link';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { WalletStats } from '@/src/types/types';

interface BalanceCardProps {
  wallet: WalletStats;
}

export default function BalanceCard({ wallet }: BalanceCardProps) {
  return (
    <div className="lg:col-span-2 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <div className="text-9xl font-bold">¥</div>
      </div>
      <div className="relative z-10">
        <h2 className="text-slate-300 text-sm font-medium mb-1">Total Available Balance</h2>
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-4xl font-bold">
            {wallet.primaryCurrency === 'CNY' ? 'CNY' : 'MWK'}{' '}
            {(wallet.primaryCurrency === 'CNY' ? (wallet.balanceCNY ?? 0) : (wallet.balanceMWK ?? 0)).toLocaleString()}
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/send-money"
            className="bg-green-500 hover:bg-green-600 text-slate-900 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            <ArrowUpRight size={18} /> Send Money
          </Link>
          <Link
            href="/dashboard/wallet"
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 backdrop-blur-sm"
          >
            <ArrowDownLeft size={18} /> Add Funds
          </Link>
        </div>
      </div>
    </div>
  );
}
