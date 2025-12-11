export type Currency = 'MWK' | 'CNY';

export type TransactionStatus = 'completed' | 'pending' | 'failed';

export interface Transaction {
  id: string;
  date: string; // ISO date string
  merchantName: string;
  merchantId: string;
  amountMWK: number;
  amountCNY: number;
  exchangeRate: number;
  status: TransactionStatus;
  type: 'payment' | 'deposit' | 'withdrawal';
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  kycStatus: 'verified' | 'pending' | 'unverified';
  avatarUrl: string;
}

export interface WalletStats {
  balanceMWK: number;
  lastDepositDate: string;
  monthlyLimit: number;
  spentThisMonth: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  WALLET = 'WALLET',
  SEND_MONEY = 'SEND_MONEY',
  HISTORY = 'HISTORY',
  PROFILE = 'PROFILE',
  COMPLIANCE = 'COMPLIANCE',
}