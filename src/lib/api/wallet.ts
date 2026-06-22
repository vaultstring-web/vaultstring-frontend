import { apiFetch } from './api-client';
import { normalizeWallets } from './response';

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
  const normalized = normalizeWallets(data);
  return {
    wallets: normalized.map((w) => ({
      id: w.id,
      user_id: '',
      currency: w.currency,
      available_balance: w.available_balance,
      ledger_balance: w.balance,
      type: w.type,
      status: w.status ?? 'active',
      wallet_address: w.wallet_address,
      created_at: '',
    })),
  };
}

export interface DepositResponse {
  wallet: Wallet;
  money_api?: {
    provider: string;
    provider_ref: string;
    status: string;
    failure_reason?: string;
  };
}

export async function depositToWallet(
  walletId: string,
  amount: number,
  sourceId: string,
  currency: string
): Promise<DepositResponse> {
  const data = await apiFetch(`/wallets/${walletId}/deposit`, {
    method: 'POST',
    body: JSON.stringify({ amount, source_id: sourceId, currency }),
  });
  return data as DepositResponse;
}
