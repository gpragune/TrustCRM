import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ConversationRow } from '../components/ConversationRow';
import { TabScreenProps } from '../navigation/types';
import { apiMock } from '../services/apiMock';
import { useChatStore } from '../store/chatStore';
import { Conversation } from '../types/models';

type Props = TabScreenProps<'Inbox'>;

export const InboxScreen = ({ navigation }: Props) => {
  const { selectedPage, setSelectedPage, isSocketConnected } = useChatStore();
  const {
    data = [],
    refetch,
    isFetching,
    isLoading
  } = useQuery({ queryKey: ['conversations'], queryFn: apiMock.fetchConversations });

  const pages = useMemo(() => ['Main Page', 'Downtown Branch', 'Wholesale'], []);

  const cyclePage = useCallback(() => {
    setSelectedPage(pages[(pages.indexOf(selectedPage) + 1) % pages.length]);
  }, [pages, selectedPage, setSelectedPage]);

  const navigateToChat = useCallback(
    (item: Conversation) => {
      navigation.navigate('Chat', {
        conversationId: item.id,
        customerName: item.customerName,
        seedMessage: item.lastMessage
      });
    },
    [navigation]
  );

  const navigateToNewOrder = useCallback(() => {
    navigation.navigate('CreateOrder', { conversationId: 'c1', customerName: 'Nimal Perera' });
  }, [navigation]);

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-4 py-3 flex-row justify-between items-center border-b border-slate-200 bg-white">
        <Pressable className="px-3 py-2 rounded-lg border border-slate-200" onPress={cyclePage}>
          <Text className="font-medium">{selectedPage} ▼</Text>
        </Pressable>
        <View className="flex-row items-center">
          <View className={`w-2.5 h-2.5 rounded-full mr-2 ${isSocketConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <Text className="text-xs text-slate-600">{isSocketConnected ? 'Connected' : 'Disconnected'}</Text>
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="text-slate-500 mt-3">Loading conversations…</Text>
        </View>
      ) : data.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="chatbubbles-outline" size={48} color="#94a3b8" />
          <Text className="text-slate-500 text-center mt-3">No conversations yet. Messages from customers will appear here.</Text>
        </View>
      ) : (
        <FlashList
          data={data}
          estimatedItemSize={72}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
          renderItem={({ item }) => <ConversationRow item={item} onPress={() => navigateToChat(item)} />}
        />
      )}

      {/* FAB */}
      <Pressable
        className="absolute right-5 bottom-6 bg-blue-600 rounded-full px-5 py-3 flex-row items-center"
        style={{ elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 }}
        onPress={navigateToNewOrder}
      >
        <Ionicons name="add" size={18} color="#ffffff" style={{ marginRight: 4 }} />
        <Text className="text-white font-semibold">New Order</Text>
      </Pressable>
    </View>
  );
};
