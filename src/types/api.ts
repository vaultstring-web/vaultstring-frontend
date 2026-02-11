export interface ApiTransaction {
  id: string;
  reference?: string;
  sender_id: string;
  senderId?: string; // Legacy/Compat
  receiver_id: string;
  receiverId?: string; // Legacy/Compat
  sender_wallet_id?: string;
  receiver_wallet_id?: string;
  amount: number | string;
  net_amount?: number | string;
  currency: string;
  description?: string;
  category?: string;
  status: string;
  created_at?: string;
  initiated_at?: string;
  sender_name?: string;
  SenderName?: string;
  receiver_name?: string;
  ReceiverName?: string;
  sender_wallet_number?: string;
  receiver_wallet_number?: string;
  sender_wallet?: string;
  receiver_wallet?: string;
  transaction_type?: string;
  type?: string;
  direction?: 'sent' | 'received'; // Enriched field
  is_read?: boolean;
  is_archived?: boolean;
}

export interface PaginatedResponse<T> {
  transactions: T[];
  total: number;
  limit: number;
  offset: number;
}
