"use client";

import React, { useState } from "react";
import BalanceToggle from "@/src/components/wallet/BalanceToggle";
import CurrencyCard from "@/src/components/wallet/CurrencyCard";
import ConversionWidget from "@/src/components/wallet/ConversionWidget";
import TransactionHistory from "@/src/components/wallet/TransactionHistory";
import DepositModal from "@/src/components/wallet/DepositModal";
import WithdrawModal from "@/src/components/wallet/WithdrawModal";
import { useBalanceVisibility } from "@/src/hooks/useBalanceVisibility";
import { TrendingUp } from "lucide-react";

export default function WalletPage() {
  const { visible } = useBalanceVisibility();
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<{
    code: string;
    name: string;
    color: string;
  } | null>(null);

  const currencies = [
    {
      code: "ZMW",
      name: "Kwacha",
      balance: 12500.5,
      held: 200,
      rate: 1,
      color: "#16a34a",
    },
    {
      code: "CNY",
      name: "Yuan",
      balance: 4300.25,
      held: 0,
      rate: 0.25,
      color: "#0ea5e9",
    },
  ];

  const totalPrimary = currencies.reduce(
    (acc, c) => acc + c.balance * c.rate,
    0
  );

  const handleDeposit = (currency: any) => {
    setSelectedCurrency(currency);
    setDepositOpen(true);
  };

  const handleWithdraw = (currency: any) => {
    setSelectedCurrency(currency);
    setWithdrawOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Wallet</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your multi-currency funds securely
              </p>
            </div>
            <div className="flex items-center gap-3">
              <BalanceToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 rounded-xl border border-border bg-gradient-to-br from-primary/10 to-primary/5 p-8 backdrop-blur-sm">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Total Balance
              </div>
              <div className="text-3xl md:text-4xl font-bold text-foreground">
                {visible
                  ? new Intl.NumberFormat(undefined, {
                      style: "currency",
                      currency: "ZMW",
                    }).format(totalPrimary)
                  : "•••••••"}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Monthly Growth
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-green-600">+8.5%</span>
                <TrendingUp className="text-green-600" size={18} />
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Currencies
              </div>
              <div className="text-2xl font-bold text-foreground">
                {currencies.length}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Status
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <span className="h-2 w-2 bg-green-600 rounded-full" />
                Active
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Your Wallets
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {currencies.map((c) => (
              <CurrencyCard
                key={c.code}
                code={c.code}
                name={c.name}
                balance={c.balance}
                held={c.held}
                rateToPrimary={c.rate}
                color={c.color}
                visible={visible}
                onDeposit={() =>
                  handleDeposit({
                    code: c.code,
                    name: c.name,
                    color: c.color,
                  })
                }
                onWithdraw={() =>
                  handleWithdraw({
                    code: c.code,
                    name: c.name,
                    color: c.color,
                  })
                }
              />
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ConversionWidget />
          </div>
          <div className="lg:col-span-2">
            <TransactionHistory />
          </div>
        </div>
      </div>

      {selectedCurrency && (
        <>
          <DepositModal
            isOpen={depositOpen}
            onClose={() => {
              setDepositOpen(false);
              setSelectedCurrency(null);
            }}
            currency={selectedCurrency}
          />
          <WithdrawModal
            isOpen={withdrawOpen}
            onClose={() => {
              setWithdrawOpen(false);
              setSelectedCurrency(null);
            }}
            currency={selectedCurrency}
            balance={
              currencies.find((c) => c.code === selectedCurrency.code)
                ?.balance || 0
            }
          />
        </>
      )}
    </div>
  );
}
