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

      {/* Modern Gradient Wallet Card */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-2xl max-w-sm mx-auto md:mx-0 relative overflow-hidden">
        {/* Abstract shapes for decoration */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>

        <div className="relative z-10 flex flex-col h-full justify-between min-h-[220px]">
          {/* Top Row: Chip & Contactless */}
          <div className="flex justify-between items-center mb-8">
            <div className="w-12 h-9 bg-yellow-400 rounded-md bg-opacity-80 border border-yellow-600 flex items-center justify-center">
                 {/* Simple Chip Graphic */}
                 <div className="grid grid-cols-2 gap-1">
                    <div className="w-3 h-4 border border-yellow-700 rounded-sm"></div>
                    <div className="w-3 h-4 border border-yellow-700 rounded-sm"></div>
                 </div>
            </div>
            <div className="transform rotate-90">
                <Banknote className="text-white opacity-80" size={24} />
            </div>
          </div>

          {/* Balance Display */}
          <div className="mb-6">
            <p className="text-xs text-white/80 font-medium tracking-wider mb-1">Current Balance</p>
            <h3 className="text-3xl font-bold tracking-tight">
              {wallet.primaryCurrency === 'CNY' ? '¥' : wallet.primaryCurrency === 'USD' ? '$' : 'MWK'} {wallet.balanceMWK.toLocaleString()}
            </h3>
          </div>

          {/* Card Number */}
          <div className="mb-6">
             <p className="text-xl font-mono tracking-widest text-white drop-shadow-md">
                {wallet.formattedWalletAddress || '•••• •••• •••• ••••'}
             </p>
          </div>

          {/* Bottom Row: Name, Expiry, Logo */}
          <div className="flex justify-between items-end">
             <div>
                <p className="text-[10px] text-white/60 uppercase tracking-widest mb-0.5">Card Holder</p>
                <p className="text-sm font-medium tracking-wide uppercase">{wallet.cardholderName || 'VAULT USER'}</p>
             </div>
             
             <div className="flex flex-col items-center mr-4">
                 <p className="text-[8px] text-white/60 uppercase tracking-widest mb-0.5">Expires</p>
                 <p className="text-sm font-medium">{wallet.expiryDate || '12/28'}</p>
             </div>

             <div className="flex items-center">
                 {/* Mastercard Circles */}
                 <div className="relative flex">
                    <div className="w-8 h-8 rounded-full bg-red-500/90 z-10"></div>
                    <div className="w-8 h-8 rounded-full bg-yellow-500/90 -ml-4 z-0"></div>
                 </div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 max-w-sm">
            <button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg">
                <Plus size={20} /> Deposit
            </button>
            <button className="flex-1 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm">
                <Minus size={20} /> Withdraw
            </button>
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