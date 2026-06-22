/**
 * Normalizes gateway JSON shapes so hooks work whether the backend returns
 * a flat payload or a `{ data: ... }` envelope.
 */

export interface NormalizedWallet {
  id: string;
  currency: string;
  balance: string;
  available_balance: string;
  type: string;
  wallet_address?: string;
  status?: string;
}

export function unwrapPayload<T extends Record<string, unknown>>(raw: unknown): T {
  if (!raw || typeof raw !== 'object') return {} as T;
  const top = raw as Record<string, unknown>;
  if (top.data && typeof top.data === 'object' && !Array.isArray(top.data)) {
    return top.data as T;
  }
  return top as T;
}

export function parseBalanceValue(raw: unknown): string {
  if (raw == null) return '0';
  if (typeof raw === 'number' && Number.isFinite(raw)) return String(raw);
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    return trimmed === '' ? '0' : trimmed;
  }
  if (typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    if ('value' in o) return parseBalanceValue(o.value);
  }
  return '0';
}

export function normalizeWallet(raw: unknown): NormalizedWallet | null {
  if (!raw || typeof raw !== 'object') return null;
  const w = raw as Record<string, unknown>;
  const id = String(w.id ?? w.wallet_id ?? w.WalletID ?? '').trim();
  if (!id) return null;

  const available = parseBalanceValue(
    w.available_balance ?? w.availableBalance ?? w.balance ?? '0'
  );
  const ledger = parseBalanceValue(w.ledger_balance ?? w.ledgerBalance ?? w.balance ?? available);

  return {
    id,
    currency: String(w.currency ?? ''),
    balance: ledger,
    available_balance: available,
    type: String(w.type ?? w.card_type ?? 'standard'),
    wallet_address: w.wallet_address != null ? String(w.wallet_address) : undefined,
    status: w.status != null ? String(w.status) : undefined,
  };
}

export function normalizeWallets(raw: unknown): NormalizedWallet[] {
  const body = unwrapPayload<{ wallets?: unknown[] }>(raw);
  const list = Array.isArray(body.wallets) ? body.wallets : Array.isArray(raw) ? (raw as unknown[]) : [];
  return list.map(normalizeWallet).filter((w): w is NormalizedWallet => w !== null);
}

export function unwrapPaginatedTransactions<T>(raw: unknown): {
  transactions: T[];
  total: number;
  limit?: number;
  offset?: number;
} {
  const body = unwrapPayload<{
    transactions?: T[];
    items?: T[];
    total?: number;
    limit?: number;
    offset?: number;
  }>(raw);

  const transactions = (
    Array.isArray(body.transactions) ? body.transactions : Array.isArray(body.items) ? body.items : []
  ).filter(Boolean) as T[];

  return {
    transactions,
    total: typeof body.total === 'number' ? body.total : transactions.length,
    limit: body.limit,
    offset: body.offset,
  };
}

export type ForexRatesMeta = {
  live_enabled?: boolean;
  data_mode?: 'live' | 'seed' | 'unavailable';
};

export function unwrapForexMeta(raw: unknown): ForexRatesMeta {
  if (!raw || typeof raw !== 'object') return {};
  const top = raw as Record<string, unknown>;
  const body = unwrapPayload<{ meta?: ForexRatesMeta }>(raw);
  const meta = (body.meta ?? top.meta) as ForexRatesMeta | undefined;
  return meta ?? {};
}

export function unwrapForexRates(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const body = unwrapPayload<{ rates?: unknown[]; data?: unknown[] }>(raw);
  if (Array.isArray(body.rates)) return body.rates;
  if (Array.isArray(body.data)) return body.data;
  const top = raw as Record<string, unknown> | null;
  if (top && Array.isArray(top.rates)) return top.rates;
  return [];
}

export function unwrapForexHistory(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const body = unwrapPayload<{ history?: unknown[]; rates?: unknown[]; data?: unknown[] }>(raw);
  if (Array.isArray(body.history)) return body.history;
  if (Array.isArray(body.rates)) return body.rates;
  if (Array.isArray(body.data)) return body.data;
  return [];
}
