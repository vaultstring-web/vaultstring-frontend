// src/components/dashboard/Wallet.tsx
'use client';

import { Plus, Minus, CreditCard, Banknote } from 'lucide-react';
import { WalletStats, Transaction } from '@/src/types/types';
import Link from 'next/link';

interface WalletProps {
  wallet: WalletStats;
  transactions: Transaction[];
}

const Wallet: React.FC<WalletProps> = ({ wallet, transactions }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">My Wallet</h2>

      {/* Main Wallet Card */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl max-w-3xl mx-auto md:mx-0">
        <div className="flex justify-between items-start mb-8">
            <div>
                <p className="text-slate-400 font-medium mb-1">Total Available Balance</p>
                <h3 className="text-5xl font-bold tracking-tight">MWK {wallet.balanceMWK.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <Banknote className="text-green-400" />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Last Deposit</p>
                <p className="text-lg font-semibold">{new Date(wallet.lastDepositDate).toLocaleDateString()}</p>
            </div>
             <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Monthly Usage</p>
                <p className="text-lg font-semibold">{((wallet.spentThisMonth / wallet.monthlyLimit) * 100).toFixed(1)}%</p>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                <Plus size={20} /> Deposit Funds
            </button>
            <button className="flex-1 bg-white hover:bg-slate-100 text-slate-900 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                <Minus size={20} /> Withdraw
            </button>
        </div>
      </div>

      {/* Deposit Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-slate-500"/>
                Linked Payment Methods
            </h3>
            <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-xs">
                            AIR
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">Airtel Money</p>
                            <p className="text-xs text-slate-500">**** 4567</p>
                        </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Primary</span>
                </div>
                 <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                            NBM
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">National Bank</p>
                            <p className="text-xs text-slate-500">**** 9921</p>
                        </div>
                    </div>
                </div>
                <button className="w-full py-2 border border-dashed border-slate-300 text-slate-500 rounded-lg hover:bg-slate-50 text-sm font-medium">
                    + Add New Method
                </button>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="font-semibold text-slate-900 mb-4">Deposit Limits & Info</h3>
             <ul className="space-y-3 text-sm text-slate-600">
                 <li className="flex justify-between">
                     <span>Daily Limit</span>
                     <span className="font-medium">MWK 1,000,000</span>
                 </li>
                 <li className="flex justify-between">
                     <span>Instant Deposit Fee</span>
                     <span className="font-medium">Free</span>
                 </li>
                 <li className="flex justify-between">
                     <span>Processing Time</span>
                     <span className="font-medium">Instant</span>
                 </li>
             </ul>
             <div className="mt-6 bg-blue-50 p-4 rounded-lg text-xs text-blue-700 leading-relaxed">
                 <Link 
                   href="/dashboard/compliance" 
                   className="text-blue-600 hover:text-blue-800 underline"
                 >
                   To increase your deposit limits
                 </Link>
                 , please ensure your KYC documents are up to date in the Profile section.
             </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;