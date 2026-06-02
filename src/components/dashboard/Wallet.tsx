// src/components/dashboard/Wallet.tsx
"use client";

import { Plus, Minus, CreditCard, Banknote, Repeat } from "lucide-react";
// Use plain <img> tags for logos (served from /public)
import { WalletStats, Transaction } from "@/src/types/types";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useBalanceVisibility } from "@/src/hooks/useBalanceVisibility";
import {
  EXCHANGE_RATE_MWK_TO_CNY,
  EXCHANGE_RATE_CNY_TO_MWK,
} from "@/src/lib/constants";
import { useState, useEffect } from "react";

interface WalletProps {
  wallet: WalletStats;
  transactions: Transaction[];
}

const Wallet: React.FC<WalletProps> = ({ wallet, transactions }) => {
  const [isMounted, setIsMounted] = useState(false);
  const { visible, toggle } = useBalanceVisibility(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [convertAmount, setConvertAmount] = useState<number | "">("");
  const [fromCurrency, setFromCurrency] = useState<"MWK" | "CNY">("MWK");
  const [toCurrency, setToCurrency] = useState<"CNY" | "MWK">("CNY");
  const convertedResult =
    convertAmount !== ""
      ? fromCurrency === "MWK" && toCurrency === "CNY"
        ? `¥ ${(Number(convertAmount) * EXCHANGE_RATE_MWK_TO_CNY).toFixed(2)}`
        : fromCurrency === "CNY" && toCurrency === "MWK"
        ? `MWK ${(Number(convertAmount) * EXCHANGE_RATE_CNY_TO_MWK).toFixed(2)}`
        : `${Number(convertAmount).toFixed(2)} ${toCurrency}`
      : "";
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">My Wallet</h2>

      {/* Main Wallet Card */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl max-w-3xl mx-auto md:mx-0">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-slate-400 font-medium mb-1">
              Total Available Balance
            </p>
            <h3 className="text-5xl font-bold tracking-tight">
              {isMounted && visible
                ? `MWK ${wallet.balanceMWK.toLocaleString()}`
                : isMounted
                ? "•••••••"
                : `MWK ${wallet.balanceMWK.toLocaleString()}`}
            </h3>
            <button
              onClick={toggle}
              aria-label={visible ? "Hide balances" : "Show balances"}
              className="ml-3 rounded-full p-2 bg-white/10 hover:bg-white/20"
            >
              {isMounted ? (
                visible ? (
                  <Eye size={18} />
                ) : (
                  <EyeOff size={18} />
                )
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
            <Banknote className="text-green-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
              Last Deposit
            </p>
            <p className="text-lg font-semibold">
              {new Date(wallet.lastDepositDate).toISOString().split("T")[0]}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
              Monthly Usage
            </p>
            <p className="text-lg font-semibold">
              {((wallet.spentThisMonth / wallet.monthlyLimit) * 100).toFixed(1)}
              %
            </p>
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

      {/* Wallet Cards - Malawi and China */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 text-slate-900 shadow-sm border border-slate-200">
          <p className="text-xs text-slate-600 font-medium mb-1">
            Malawi Wallet (MWK)
          </p>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">
                {isMounted && visible
                  ? `MWK ${wallet.balanceMWK.toLocaleString()}`
                  : isMounted
                  ? "••••••"
                  : `MWK ${wallet.balanceMWK.toLocaleString()}`}
              </h3>
              <p className="text-sm text-slate-600">Primary Malawi balance</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <Banknote className="text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 text-slate-900 shadow-sm border border-slate-200">
          <p className="text-xs text-slate-600 font-medium mb-1">
            China Wallet (CNY equivalent)
          </p>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">
                {isMounted && visible
                  ? `¥ ${(wallet.balanceMWK * EXCHANGE_RATE_MWK_TO_CNY).toFixed(
                      2
                    )}`
                  : isMounted
                  ? "••••••"
                  : `¥ ${(wallet.balanceMWK * EXCHANGE_RATE_MWK_TO_CNY).toFixed(
                      2
                    )}`}
              </h3>
              <p className="text-sm text-slate-600">
                Equivalent of your MWK balance
              </p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <Banknote className="text-yellow-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Exchange Rate Converter */}
      <div className="bg-white rounded-xl p-6 text-slate-900 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-600 font-medium">Exchange</p>
            <div className="text-lg font-semibold">
              {fromCurrency} → {toCurrency}
            </div>
          </div>
          <div className="text-sm text-slate-600">
            Current rate:
            <span className="ml-2 font-semibold text-slate-800">
              {fromCurrency === "MWK" && toCurrency === "CNY"
                ? `1 MWK = ¥ ${EXCHANGE_RATE_MWK_TO_CNY}`
                : fromCurrency === "CNY" && toCurrency === "MWK"
                ? `1 CNY = MWK ${EXCHANGE_RATE_CNY_TO_MWK}`
                : "1 : 1"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="flex flex-col">
            <label className="text-xs text-slate-600 mb-1">From</label>
            <select
              value={fromCurrency}
              onChange={(e) => {
                const val = e.target.value as "MWK" | "CNY";
                setFromCurrency(val);
                setToCurrency(val === "MWK" ? "CNY" : "MWK");
              }}
              aria-label="From currency"
              className="rounded-lg border px-3 py-2"
            >
              <option value="MWK">MWK (Malawi)</option>
              <option value="CNY">CNY (China)</option>
            </select>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <label className="text-xs text-slate-600 mb-1">Amount</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={convertAmount === "" ? "" : String(convertAmount)}
                onChange={(e) =>
                  setConvertAmount(
                    e.target.value ? parseFloat(e.target.value) : ""
                  )
                }
                placeholder="Enter amount"
                aria-label="Amount to convert"
                className="w-full rounded-lg px-3 py-2 text-slate-900 border border-slate-300"
              />
              <button
                onClick={() => {
                  const prevFrom = fromCurrency;
                  setFromCurrency(toCurrency);
                  setToCurrency(prevFrom);
                }}
                aria-label="Swap currencies"
                className="rounded-lg bg-slate-100 border px-3 py-2"
              >
                <Repeat />
              </button>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-slate-600 mb-1">To</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-sm text-slate-700">
                  {convertedResult ? (
                    convertedResult
                  ) : (
                    <span className="text-slate-400">
                      Enter amount to convert
                    </span>
                  )}
                </div>
              </div>
              <div>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value as any)}
                  aria-label="To currency"
                  className="rounded-lg border px-3 py-2"
                >
                  <option value="CNY">CNY (China)</option>
                  <option value="MWK">MWK (Malawi)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-slate-500" />
            Linked Payment Methods
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-3">
                <img
                  src="/images/airtel-money.png"
                  alt="Airtel Money"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-slate-900">Airtel Money</p>
                  <p className="text-xs text-slate-500">**** 4567</p>
                </div>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Primary
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-3">
                <img
                  src="/images/national-bank.png"
                  alt="National Bank"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-slate-900">National Bank</p>
                  <p className="text-xs text-slate-500">**** 9921</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-3">
                <img
                  src="/images/tnm-mpamba.png"
                  alt="TNM Mpamba"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-slate-900">Tnm Mpamba</p>
                  <p className="text-xs text-slate-500">**** 6789</p>
                </div>
              </div>
            </div>
            <button className="w-full py-2 border border-dashed border-slate-300 text-slate-500 rounded-lg hover:bg-slate-50 text-sm font-medium">
              + Add New Method
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">
            Deposit Limits & Info
          </h3>
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
            , please ensure your KYC documents are up to date in the Profile
            section.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
