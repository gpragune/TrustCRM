import dayjs from 'dayjs';
import { Conversation, Message, Order, OrderItem } from '../types/models';

const wait = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

const conversationsSeed: Conversation[] = [
  {
    id: 'c1',
    customerName: 'Nimal Perera',
    avatar: 'https://i.pravatar.cc/100?img=11',
    lastMessage: '2 chicken kottu no spicy and 1 coke deliver today',
    unreadCount: 2,
    lastTimestamp: dayjs().subtract(4, 'minute').toISOString(),
    hasActiveOrder: true
  },
  {
    id: 'c2',
    customerName: 'Sahan Grocery',
    avatar: 'https://i.pravatar.cc/100?img=33',
    lastMessage: 'Do you have 5kg samba rice?',
    unreadCount: 0,
    lastTimestamp: dayjs().subtract(1, 'hour').toISOString()
  }
];

let messagesSeed: Message[] = [
  {
    id: 'm1',
    conversationId: 'c1',
    senderType: 'customer',
    text: '2 chicken kottu no spicy and 1 coke deliver today',
    timestamp: dayjs().subtract(6, 'minute').toISOString()
  },
  {
    id: 'm2',
    conversationId: 'c1',
    senderType: 'business',
    text: 'Sure, can I confirm your address?',
    timestamp: dayjs().subtract(4, 'minute').toISOString()
  }
];

let ordersSeed: Order[] = [
  {
    id: 'o1',
    conversationId: 'c1',
    items: [
      { name: 'Chicken Kottu', qty: 2, notes: 'No spicy', price: 1350 },
      { name: 'Coca Cola', qty: 1, notes: '', price: 350 }
    ],
    status: 'active',
    total: 3050,
    address: '12 Lake Rd, Colombo',
    createdAt: dayjs().subtract(20, 'minute').toISOString(),
    customerName: 'Nimal Perera',
    customerPhone: '+94771234567'
  }
];

export const apiMock = {
  async login(email: string, password: string) {
    await wait();
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }
    return {
      accessToken: `mock_access_${Date.now()}`,
      refreshToken: `mock_refresh_${Date.now()}`,
      user: { id: 'u1', email }
    };
  },

  async demoLogin() {
    await wait(200);
    return {
      accessToken: 'demo_access_token',
      refreshToken: 'demo_refresh_token',
      user: { id: 'demo', email: 'demo@chatorder.app' }
    };
  },

  async fetchConversations() {
    await wait();
    return [...conversationsSeed].sort((a, b) => +new Date(b.lastTimestamp) - +new Date(a.lastTimestamp));
  },

  async fetchMessages(conversationId: string) {
    await wait();
    return messagesSeed
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
  },

  async sendMessage(conversationId: string, text: string) {
    await wait(150);
    const message: Message = {
      id: `m${Date.now()}`,
      conversationId,
      senderType: 'business',
      text,
      timestamp: new Date().toISOString()
    };
    messagesSeed = [...messagesSeed, message];
    conversationsSeed = conversationsSeed.map((conversation) =>
      conversation.id === conversationId
        ? { ...conversation, lastMessage: text, lastTimestamp: message.timestamp }
        : conversation
    );
    return message;
  },

  async extractOrderDraft(messageText: string): Promise<OrderItem[]> {
    await wait(250);
    const items: OrderItem[] = [];
    if (messageText.toLowerCase().includes('kottu')) {
      items.push({ name: 'Chicken Kottu', qty: 2, notes: 'No spicy', price: 1350 });
    }
    if (messageText.toLowerCase().includes('coke')) {
      items.push({ name: 'Coca Cola', qty: 1, notes: '', price: 350 });
    }
    return items.length ? items : [{ name: 'Manual item', qty: 1, notes: '', price: 0 }];
  },

  async createOrder(payload: Omit<Order, 'id' | 'createdAt' | 'total'>) {
    await wait(300);
    const total = payload.items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const order: Order = {
      ...payload,
      id: `o${Date.now()}`,
      total,
      createdAt: new Date().toISOString()
    };
    ordersSeed = [order, ...ordersSeed];
    conversationsSeed = conversationsSeed.map((conversation) =>
      conversation.id === payload.conversationId ? { ...conversation, hasActiveOrder: true } : conversation
    );
    return order;
  },

  async fetchOrders() {
    await wait();
    return ordersSeed;
  },

  async updateOrderStatus(orderId: string, status: Order['status']) {
    await wait(200);
    ordersSeed = ordersSeed.map((order) => (order.id === orderId ? { ...order, status } : order));
    return ordersSeed.find((order) => order.id === orderId)!;
  }
};
