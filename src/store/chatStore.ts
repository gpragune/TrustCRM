import { create } from 'zustand';
import { Message } from '../types/models';

interface PendingMessage {
  conversationId: string;
  text: string;
  tempId: string;
}

interface ChatState {
  isSocketConnected: boolean;
  selectedPage: string;
  pendingQueue: PendingMessage[];
  cache: Record<string, Message[]>;
  setSocketConnected: (value: boolean) => void;
  setSelectedPage: (value: string) => void;
  enqueueMessage: (message: PendingMessage) => void;
  dequeueMessage: (tempId: string) => void;
  cacheMessages: (conversationId: string, messages: Message[]) => void;
  appendCachedMessage: (conversationId: string, message: Message) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isSocketConnected: false,
  selectedPage: 'Main Page',
  pendingQueue: [],
  cache: {},
  setSocketConnected: (value) => set({ isSocketConnected: value }),
  setSelectedPage: (value) => set({ selectedPage: value }),
  enqueueMessage: (message) => set((state) => ({ pendingQueue: [...state.pendingQueue, message] })),
  dequeueMessage: (tempId) =>
    set((state) => ({ pendingQueue: state.pendingQueue.filter((message) => message.tempId !== tempId) })),
  cacheMessages: (conversationId, messages) =>
    set((state) => ({ cache: { ...state.cache, [conversationId]: messages } })),
  appendCachedMessage: (conversationId, message) =>
    set((state) => ({
      cache: { ...state.cache, [conversationId]: [...(state.cache[conversationId] ?? []), message] }
    }))
}));
