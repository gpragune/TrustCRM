import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Pressable, RefreshControl, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ConversationRow } from '../components/ConversationRow';
import { RootStackParamList } from '../navigation/types';
import { apiMock } from '../services/apiMock';
import { useChatStore } from '../store/chatStore';

type Props = NativeStackScreenProps<RootStackParamList, 'MainTabs'>;

export const InboxScreen = ({ navigation }: Props) => {
  const { selectedPage, setSelectedPage, isSocketConnected } = useChatStore();
  const { data = [], refetch, isFetching } = useQuery({ queryKey: ['conversations'], queryFn: apiMock.fetchConversations });

  const pages = useMemo(() => ['Main Page', 'Downtown Branch', 'Wholesale'], []);

  return (
    <View className="flex-1 bg-slate-50">
      <View className="px-4 py-3 flex-row justify-between items-center border-b border-slate-200 bg-white">
        <Pressable
          className="px-3 py-2 rounded-lg border border-slate-200"
          onPress={() => setSelectedPage(pages[(pages.indexOf(selectedPage) + 1) % pages.length])}
        >
          <Text className="font-medium">{selectedPage} ▼</Text>
        </Pressable>
        <View className="flex-row items-center">
          <View className={`w-2.5 h-2.5 rounded-full mr-2 ${isSocketConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <Text className="text-xs text-slate-600">{isSocketConnected ? 'Connected' : 'Disconnected'}</Text>
        </View>
      </View>

      <FlashList
        data={data}
        estimatedItemSize={72}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        renderItem={({ item }) => (
          <ConversationRow
            item={item}
            onPress={() =>
              navigation.navigate('Chat', {
                conversationId: item.id,
                customerName: item.customerName,
                seedMessage: item.lastMessage
              })
            }
          />
        )}
      />

      <Pressable
        className="absolute right-5 bottom-6 bg-blue-600 rounded-full px-5 py-3"
        onPress={() => navigation.navigate('CreateOrder', { conversationId: 'c1', customerName: 'Nimal Perera' })}
      >
        <Text className="text-white font-semibold">New Order</Text>
      </Pressable>
    </View>
  );
};
