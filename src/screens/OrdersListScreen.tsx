import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { TabScreenProps } from '../navigation/types';
import { apiMock } from '../services/apiMock';
import { Order, OrderStatus } from '../types/models';

type Props = TabScreenProps<'Orders'>;

const tabs: OrderStatus[] = ['active', 'completed', 'cancelled'];

const statusColors: Record<OrderStatus, string> = {
  active: 'bg-emerald-100',
  completed: 'bg-blue-100',
  cancelled: 'bg-red-100'
};

const statusTextColors: Record<OrderStatus, string> = {
  active: 'text-emerald-700',
  completed: 'text-blue-700',
  cancelled: 'text-red-700'
};

export const OrdersListScreen = ({ navigation }: Props) => {
  const [selected, setSelected] = useState<OrderStatus>('active');
  const {
    data = [],
    refetch,
    isFetching,
    isLoading
  } = useQuery({ queryKey: ['orders'], queryFn: apiMock.fetchOrders });

  const filtered = useMemo(() => data.filter((item) => item.status === selected), [data, selected]);

  const navigateToOrder = useCallback(
    (orderId: string) => {
      navigation.navigate('OrderDetails', { orderId });
    },
    [navigation]
  );

  const renderOrderItem = useCallback(
    ({ item }: { item: Order }) => (
      <Pressable
        className="bg-white mx-4 my-2 rounded-xl border border-slate-200 p-3"
        onPress={() => navigateToOrder(item.id)}
      >
        <View className="flex-row justify-between items-center mb-1">
          <Text className="font-semibold text-slate-900">#{item.id}</Text>
          <View className={`px-2 py-0.5 rounded-full ${statusColors[item.status]}`}>
            <Text className={`text-xs font-medium ${statusTextColors[item.status]}`}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text className="text-slate-700">{item.customerName}</Text>
        <Text className="text-slate-600 text-sm">{item.items.length} items • Rs {item.total.toLocaleString()}</Text>
        {item.address ? <Text className="text-xs text-slate-500 mt-1">📍 {item.address}</Text> : null}
        <Text className="text-xs text-slate-400 mt-1">{dayjs(item.createdAt).format('MMM D, h:mm A')}</Text>
      </Pressable>
    ),
    [navigateToOrder]
  );

  return (
    <View className="flex-1 bg-slate-50">
      {/* Tab bar */}
      <View className="flex-row bg-white px-3 py-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setSelected(tab)}
            className={`mr-2 px-4 py-2 rounded-lg ${selected === tab ? 'bg-blue-600' : 'bg-slate-100'}`}
          >
            <Text className={selected === tab ? 'text-white font-semibold' : 'text-slate-700'}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="text-slate-500 mt-3">Loading orders…</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="receipt-outline" size={48} color="#94a3b8" />
          <Text className="text-slate-500 text-center mt-3">
            No {selected} orders found.
          </Text>
        </View>
      ) : (
        <FlashList
          data={filtered}
          estimatedItemSize={90}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
        />
      )}
    </View>
  );
};
