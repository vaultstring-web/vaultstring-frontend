// src/components/dashboard/Dashboard.tsx
'use client';

import { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp,
  Clock,
  ArrowRightLeft,
  RefreshCw,
  Coins
} from 'lucide-react';
import { UserProfile, WalletStats, Transaction } from '@/src/types/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EXCHANGE_RATE_MWK_TO_CNY, EXCHANGE_RATE_CNY_TO_MWK } from '@/src/lib/constants';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';


interface DashboardProps {
  user: UserProfile;
  wallet: WalletStats;
  recentTransactions: Transaction[];
  rates?: {
    mwkToCny?: number;
    cnyToMwk?: number;
    mwkToCnyBuy?: number;
    mwkToCnySell?: number;
    cnyToMwkBuy?: number;
    cnyToMwkSell?: number;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ user, wallet, recentTransactions, rates }) => {
  const [convertAmount, setConvertAmount] = useState<number | ''>(1000000);
  const [conversionDirection, setConversionDirection] = useState<'MWK_TO_CNY' | 'CNY_TO_MWK'>('MWK_TO_CNY');
  const router = useRouter();

  // Currency Converter Logic
  const getConversionResult = () => {
    if (!convertAmount) return '0.00';
    if (conversionDirection === 'MWK_TO_CNY') {
      const r = (rates?.mwkToCnySell ?? rates?.mwkToCny) ?? EXCHANGE_RATE_MWK_TO_CNY;
      return (convertAmount * r).toFixed(2);
    } else {
      const r = (rates?.cnyToMwkBuy ?? rates?.cnyToMwk) ?? EXCHANGE_RATE_CNY_TO_MWK;
      return (convertAmount * r).toFixed(2);
    }
  };

  const toggleDirection = () => {
    setConversionDirection(prev => prev === 'MWK_TO_CNY' ? 'CNY_TO_MWK' : 'MWK_TO_CNY');
  };
  
  // Mock data for chart
  const chartData = [
    { name: 'Mon', balance: 650000 },
    { name: 'Tue', balance: 590000 },
    { name: 'Wed', balance: 800000 },
    { name: 'Thu', balance: 750000 },
    { name: 'Fri', balance: 820000 },
    { name: 'Sat', balance: 900000 },
    { name: 'Sun', balance: 854000 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Top Row: Balance & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Balance Card - Takes 2/3 on Desktop */}
        <div className="lg:col-span-2 bg-linear-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <div className="text-9xl font-bold">¥</div>
          </div>
          <div className="relative z-10">
            <h2 className="text-slate-300 text-sm font-medium mb-1">Total Available Balance</h2>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold">
                {(() => {
                  const c = wallet.primaryCurrency || 'MWK';
                  const amt = c === 'CNY' ? (wallet.balanceCNY ?? 0) : c === 'USD' ? (wallet.balanceUSD ?? 0) : (wallet.balanceMWK ?? 0);
                  return `${c} ${Number(amt).toLocaleString()}`;
                })()}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 mb-4">
              {typeof wallet.balanceCNY === 'number' && (
                <span className="bg-white/10 text-white px-3 py-1 rounded-md text-sm">CNY {Number(wallet.balanceCNY).toLocaleString()}</span>
              )}
              {typeof wallet.balanceUSD === 'number' && (
                <span className="bg-white/10 text-white px-3 py-1 rounded-md text-sm">USD {Number(wallet.balanceUSD).toLocaleString()}</span>
              )}
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

        {/* Rate Info Card - Takes 1/3 on Desktop */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
             <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
               <Coins size={20} className="text-green-600" />
               Current Rate
             </h3>
             <div className="space-y-4">
               <div className="pb-3 border-b border-slate-50 space-y-2">
                 <div className="flex justify-between items-center">
                   <span className="text-slate-500">1 MWK (Buy)</span>
                   <span className="font-mono font-medium text-slate-900">{((rates?.mwkToCnyBuy ?? rates?.mwkToCny) ?? EXCHANGE_RATE_MWK_TO_CNY).toFixed(4)} CNY</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-slate-500">1 MWK (Sell)</span>
                   <span className="font-mono font-medium text-slate-900">{((rates?.mwkToCnySell ?? rates?.mwkToCny) ?? EXCHANGE_RATE_MWK_TO_CNY).toFixed(4)} CNY</span>
                 </div>
               </div>
               <div className="space-y-2">
                 <div className="flex justify-between items-center">
                   <span className="text-slate-500">1 CNY (Buy)</span>
                   <span className="font-mono font-medium text-slate-900">{((rates?.cnyToMwkBuy ?? rates?.cnyToMwk) ?? EXCHANGE_RATE_CNY_TO_MWK).toFixed(2)} MWK</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-slate-500">1 CNY (Sell)</span>
                   <span className="font-mono font-medium text-slate-900">{((rates?.cnyToMwkSell ?? rates?.cnyToMwk) ?? EXCHANGE_RATE_CNY_TO_MWK).toFixed(2)} MWK</span>
                 </div>
               </div>
             </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
             <p className="text-xs text-slate-400">Last updated: 2 mins ago</p>
          </div>
        </div>
      </div>

      {/* Currency Converter Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <RefreshCw size={20} className="text-slate-400" />
            Currency Converter
          </h3>
          <div className="flex gap-2">
            <button className="text-sm text-green-600 hover:bg-green-50 px-3 py-1 rounded-md transition-colors">
              Set Alert
            </button>
            <Link
              href="/dashboard/transactions"
              className="text-sm text-slate-500 hover:bg-slate-50 px-3 py-1 rounded-md transition-colors"
            >
              View History
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center bg-slate-50 p-6 rounded-xl border border-slate-100">
          
          {/* FROM Section */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">From</label>
            <div className="flex bg-white border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
              <div className="bg-slate-100 px-3 py-3 border-r border-slate-300 flex items-center font-medium text-slate-700 min-w-16 justify-center">
                {conversionDirection === 'MWK_TO_CNY' ? 'MWK' : 'CNY'}
              </div>
              <input
                type="number"
                value={convertAmount}
                onChange={(e) => setConvertAmount(e.target.value ? parseFloat(e.target.value) : '')}
                className="w-full px-4 py-3 outline-none text-slate-900 font-semibold"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Switcher */}
          <div className="md:col-span-1 flex justify-center py-2 md:py-0">
            <button 
              onClick={toggleDirection}
              className="p-3 bg-white border border-slate-200 rounded-full hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all shadow-sm group"
            >
              <ArrowRightLeft size={20} className="group-hover:rotate-180 transition-transform duration-300" />
            </button>
          </div>

          {/* TO Section */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">To</label>
             <div className="flex bg-slate-200 border border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-slate-300 px-3 py-3 border-r border-slate-300 flex items-center font-medium text-slate-700 min-w-16 justify-center">
                {conversionDirection === 'MWK_TO_CNY' ? 'CNY' : 'MWK'}
              </div>
              <div className="w-full px-4 py-3 text-slate-900 font-bold bg-slate-100 flex items-center">
                 {getConversionResult()}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Chart & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-slate-400" />
              Balance History
            </h3>
            <select className="text-sm border-slate-200 rounded-md text-slate-500 focus:ring-green-500 focus:border-green-500">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`MWK ${value.toLocaleString()}`, 'Balance']}
                />
                <Area type="monotone" dataKey="balance" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Clock size={20} className="text-slate-400" />
              Recent Activity
            </h3>
            <Link
              href="/dashboard/transactions"
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              View All
            </Link>
          </div>
          <div className="overflow-y-auto flex-1 p-0">
            <div className="divide-y divide-slate-100">
              {recentTransactions.slice(0, 5).map((txn) => (
                <div key={txn.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      txn.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {txn.type === 'deposit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{txn.merchantName}</p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(txn.date), 'MM/dd/yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-medium ${txn.type === 'deposit' ? 'text-green-600' : 'text-slate-900'}`}>
                      {txn.type === 'deposit' ? '+' : '-'} {txn.amountMWK.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    {txn.amountCNY > 0 && (
                      <p className="text-xs text-slate-500">¥ {txn.amountCNY.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
