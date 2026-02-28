import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

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

/**
 * Composite type for screens inside the tab navigator
 * that also need access to the parent stack navigator.
 */
export type TabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
