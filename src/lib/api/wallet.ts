import { apiFetch } from './api-client';

export interface CreateWalletRequest {
  currency: string;
  type: string;
}

export interface DepositRequest {
  wallet_id: string;
  amount: number;
  source_id: string; // ID of the linked account or 'test-source'
  currency: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  currency: string;
  available_balance: string;
  ledger_balance?: string;
  reserved_balance?: string;
  type: string;
  status: string;
  wallet_address?: string;
  created_at: string;
}

export async function createWallet(data: CreateWalletRequest): Promise<Wallet> {
  const wallet = await apiFetch('/wallets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return wallet as Wallet;
}

export async function getWallets(): Promise<{ wallets: Wallet[] }> {
  const data = await apiFetch('/wallets');
  return data as { wallets: Wallet[] };
}

export async function depositToWallet(walletId: string, amount: number, sourceId: string, currency: string): Promise<any> {
  const wallet = await apiFetch(`/wallets/${walletId}/deposit`, {
    method: 'POST',
    body: JSON.stringify({ amount, source_id: sourceId, currency }),
  });
  return wallet;
}
