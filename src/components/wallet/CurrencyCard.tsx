"use client";

import React, { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  MoreHorizontal,
  TrendingUp,
} from "lucide-react";

type Props = {
  code: string;
  name: string;
  balance: number;
  held?: number;
  rateToPrimary?: number;
  color?: string;
  visible?: boolean;
  onDeposit?: () => void;
  onWithdraw?: () => void;
  onSend?: () => void;
};

function formatCurrency(amount: number, code = "ZMW") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (e) {
    return amount.toFixed(2);
  }
}

export default function CurrencyCard({
  code,
  name,
  balance,
  held = 0,
  rateToPrimary = 1,
  color = "#4ade80",
  visible = true,
  onDeposit,
  onWithdraw,
  onSend,
}: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const available = balance - held;
  const display = visible ? formatCurrency(balance, code) : "•••••••";

  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card to-card/80 p-6 shadow-sm transition-all hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient background effect */}
      <div
        className="absolute inset-0 opacity-10 blur-2xl"
        style={{
          background: `radial-gradient(circle at top right, ${color}, transparent)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: color }}
            >
              {code.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                {name}
              </div>
              <div className="text-xs text-muted-foreground">
                {code} • Rate: {rateToPrimary}x
              </div>
            </div>
          </div>
          <button
            aria-label="more options"
            className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted rounded-md p-2"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>

        {/* Balance Display */}
        <div className="mb-6">
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Balance
          </div>
          <div className="text-3xl font-bold text-foreground">{display}</div>
        </div>

        {/* Available & Held */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-muted/40 rounded-lg">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Available</div>
            <div className="text-sm font-semibold text-foreground">
              {visible ? formatCurrency(available, code) : "•••••"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Held</div>
            <div className="text-sm font-semibold text-foreground">
              {visible ? formatCurrency(held, code) : "•••••"}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onDeposit}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium transition-all hover:opacity-90 active:scale-95"
          >
            <ArrowDownLeft size={16} />
            <span className="hidden sm:inline">Deposit</span>
          </button>
          <button
            onClick={onWithdraw}
            className="flex items-center justify-center gap-2 rounded-lg border border-border text-foreground px-4 py-2 text-sm font-medium transition-all hover:bg-muted active:scale-95"
          >
            <ArrowUpRight size={16} />
            <span className="hidden sm:inline">Withdraw</span>
          </button>
          <button
            onClick={onSend}
            className="flex items-center justify-center gap-2 rounded-lg border border-border text-foreground px-4 py-2 text-sm font-medium transition-all hover:bg-muted active:scale-95"
          >
            <TrendingUp size={16} />
            <span className="hidden sm:inline">Send</span>
          </button>
          <button className="flex items-center justify-center gap-2 rounded-lg border border-border text-foreground px-4 py-2 text-sm font-medium transition-all hover:bg-muted active:scale-95">
            <span>₹</span>
            <span className="hidden sm:inline">Convert</span>
          </button>
        </div>

        {/* Recent Activity Indicator */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            Recent: No transactions
          </div>
        </div>
      </div>
    </div>
  );
}
