export type SenderType = 'customer' | 'business' | 'system';
export type OrderStatus = 'active' | 'completed' | 'cancelled';

export interface Conversation {
  id: string;
  customerName: string;
  avatar: string;
  lastMessage: string;
  unreadCount: number;
  lastTimestamp: string;
  hasActiveOrder?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderType: SenderType;
  text: string;
  attachments?: string[];
  timestamp: string;
}

export interface OrderItem {
  name: string;
  qty: number;
  notes?: string;
  price: number;
}

export interface Order {
  id: string;
  conversationId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  address: string;
  createdAt: string;
  customerName: string;
  customerPhone?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
