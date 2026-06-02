"use client";

import React, { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Filter,
  Download,
  ChevronRight,
} from "lucide-react";

type Transaction = {
  id: string;
  type: "deposit" | "withdrawal" | "conversion" | "send";
  amount: number;
  currency: string;
  date: string;
  status: "completed" | "pending" | "failed";
  description: string;
};

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "deposit",
    amount: 5000,
    currency: "ZMW",
    date: "2024-12-14",
    status: "completed",
    description: "Bank Transfer from Standard Chartered",
  },
  {
    id: "2",
    type: "conversion",
    amount: 1250,
    currency: "CNY",
    date: "2024-12-12",
    status: "completed",
    description: "Converted from ZMW to CNY",
  },
  {
    id: "3",
    type: "withdrawal",
    amount: 2500,
    currency: "ZMW",
    date: "2024-12-10",
    status: "completed",
    description: "Mobile Money Withdrawal",
  },
  {
    id: "4",
    type: "send",
    amount: 1000,
    currency: "ZMW",
    date: "2024-12-08",
    status: "completed",
    description: "Sent to John Doe",
  },
  {
    id: "5",
    type: "withdrawal",
    amount: 3000,
    currency: "ZMW",
    date: "2024-12-05",
    status: "pending",
    description: "Bank Transfer - Processing",
  },
];

function getTransactionIcon(type: string) {
  switch (type) {
    case "deposit":
      return <ArrowDownLeft className="text-blue-600" size={20} />;
    case "withdrawal":
      return <ArrowUpRight className="text-red-600" size={20} />;
    case "conversion":
      return <ArrowRightLeft className="text-purple-600" size={20} />;
    case "send":
      return <ArrowUpRight className="text-orange-600" size={20} />;
    default:
      return null;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function TransactionHistory() {
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");

  const filteredTransactions =
    filterType === "all"
      ? mockTransactions
      : mockTransactions.filter((t) => t.type === filterType);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Transaction History
          </h3>
          <p className="text-sm text-muted-foreground">
            {filteredTransactions.length} transactions
          </p>
        </div>
        <button className="rounded-lg border border-border p-2 hover:bg-muted transition-colors">
          <Download size={18} className="text-foreground" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-border/50">
        {["all", "deposit", "withdrawal", "conversion", "send"].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              filterType === type
                ? "bg-primary text-primary-foreground"
                : "border border-border text-foreground hover:bg-muted"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx) => (
            <button
              key={tx.id}
              className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors group"
            >
              {/* Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted flex-shrink-0">
                {getTransactionIcon(tx.type)}
              </div>

              {/* Details */}
              <div className="flex-1 text-left">
                <div className="font-medium text-foreground">
                  {tx.description}
                </div>
                <div className="text-sm text-muted-foreground">{tx.date}</div>
              </div>

              {/* Amount & Status */}
              <div className="text-right">
                <div
                  className={`font-semibold ${
                    tx.type === "deposit" ? "text-green-600" : "text-foreground"
                  }`}
                >
                  {tx.type === "deposit" ? "+" : "-"}
                  {tx.amount.toLocaleString()} {tx.currency}
                </div>
                <span
                  className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(
                    tx.status
                  )}`}
                >
                  {tx.status}
                </span>
              </div>

              {/* Arrow */}
              <ChevronRight
                className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                size={18}
              />
            </button>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        )}
      </div>

      {/* View All Button */}
      <button className="mt-6 w-full rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
        View All Transactions
      </button>
    </div>
  );
}
