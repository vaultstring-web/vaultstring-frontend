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
  balance: string;
  available_balance: string;
  type: string;
  status: string;
  wallet_address?: string;
  created_at: string;
}

export async function createWallet(data: CreateWalletRequest): Promise<Wallet> {
  const res = await apiFetch('/wallets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Failed to create wallet');
  }

  // Handle case where API returns wrapped response or direct object
  const json = await res.json();
  return json.wallet || json;
}

export async function getWallets(): Promise<{ wallets: Wallet[] }> {
    const res = await apiFetch('/wallets');
    if (!res.ok) {
        throw new Error('Failed to fetch wallets');
    }
    return res.json();
}

export async function depositToWallet(walletId: string, amount: number, sourceId: string, currency: string): Promise<any> {
  // Simulating a deposit endpoint if not yet implemented on backend
  // In a real scenario, this would POST to /wallets/{id}/deposit or /payments/deposit
  const res = await apiFetch(`/wallets/${walletId}/deposit`, {
    method: 'POST',
    body: JSON.stringify({ amount, source_id: sourceId, currency }),
  });

  if (!res.ok) {
     const errorData = await res.json().catch(() => ({}));
     throw new Error(errorData.error || errorData.message || 'Failed to deposit');
  }

  return res.json();
}
