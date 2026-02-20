export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  Chat: { conversationId: string; customerName: string; seedMessage?: string };
  CreateOrder: { conversationId: string; customerName: string; seedMessage?: string };
  OrderDetails: { orderId: string };
};

export type MainTabParamList = {
  Inbox: undefined;
  Orders: undefined;
  Settings: undefined;
};
