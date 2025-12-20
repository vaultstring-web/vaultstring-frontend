import { Transaction, UserProfile, WalletStats } from '@/src/types/types';

// Exchange Rate: 1 MWK = 0.0041 CNY (Hypothetical for demo)
export const EXCHANGE_RATE_MWK_TO_CNY = 0.0041;
export const EXCHANGE_RATE_CNY_TO_MWK = 1 / EXCHANGE_RATE_MWK_TO_CNY;
export const MOCK_USER: UserProfile = {
  name: "Chisomo Banda",
  email: "chisomo.b@example.mw",
  phone: "+265 99 123 4567",
  kycStatus: 'verified',
  avatarUrl: "https://picsum.photos/200/200"
};

export const MOCK_WALLET: WalletStats = {
  balanceMWK: 854000.00,
  lastDepositDate: "2025-10-25",
  monthlyLimit: 5000000,
  spentThisMonth: 1250000
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "TXN-882910",
    date: "2023-10-26T14:30:00",
    merchantName: "Guangzhou Electronics Ltd",
    merchantId: "M-CN-9921",
    amountMWK: 150000,
    amountCNY: 615,
    exchangeRate: 0.0041,
    status: 'completed',
    type: 'payment'
  },
  {
    id: "TXN-882909",
    date: "2023-10-25T09:15:00",
    merchantName: "Shanghai Textiles Co",
    merchantId: "M-CN-4432",
    amountMWK: 450000,
    amountCNY: 1845,
    exchangeRate: 0.0041,
    status: 'pending',
    type: 'payment'
  },
  {
    id: "TXN-882855",
    date: "2023-10-20T11:00:00",
    merchantName: "Airtel Money Deposit",
    merchantId: "SELF",
    amountMWK: 1000000,
    amountCNY: 0,
    exchangeRate: 1,
    status: 'completed',
    type: 'deposit'
  },
  {
    id: "TXN-882101",
    date: "2023-10-18T16:45:00",
    merchantName: "Shenzhen Parts Factory",
    merchantId: "M-CN-1102",
    amountMWK: 200000,
    amountCNY: 820,
    exchangeRate: 0.0041,
    status: 'failed',
    type: 'payment'
  },
  {
    id: "TXN-881992",
    date: "2023-10-15T08:20:00",
    merchantName: "Yiwu Market Agent",
    merchantId: "M-CN-5591",
    amountMWK: 75000,
    amountCNY: 307.5,
    exchangeRate: 0.0041,
    status: 'completed',
    type: 'payment'
  },
  {
    id: "TXN-881500",
    date: "2023-10-10T10:00:00",
    merchantName: "Beijing Logistics",
    merchantId: "M-CN-8888",
    amountMWK: 300000,
    amountCNY: 1230,
    exchangeRate: 0.0041,
    status: 'completed',
    type: 'payment'
  }
];
