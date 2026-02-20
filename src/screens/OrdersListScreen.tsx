import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { apiMock } from '../services/apiMock';

const tabs = ['active', 'completed', 'cancelled'] as const;

export const OrdersListScreen = ({ navigation }: any) => {
  const [selected, setSelected] = useState<(typeof tabs)[number]>('active');
  const { data = [], refetch } = useQuery({ queryKey: ['orders'], queryFn: apiMock.fetchOrders });

  const filtered = useMemo(() => data.filter((item) => item.status === selected), [data, selected]);

  return (
    <View className="flex-1 bg-slate-50">
      <View className="flex-row bg-white px-3 py-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setSelected(tab)}
            className={`mr-2 px-3 py-2 rounded-lg ${selected === tab ? 'bg-blue-600' : 'bg-slate-100'}`}
          >
            <Text className={selected === tab ? 'text-white font-semibold' : 'text-slate-700'}>{tab.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      <FlashList
        data={filtered}
        estimatedItemSize={90}
        onRefresh={refetch}
        refreshing={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            className="bg-white mx-4 my-2 rounded-xl border border-slate-200 p-3"
            onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
          >
            <Text className="font-semibold">#{item.id}</Text>
            <Text className="text-slate-700">{item.customerName}</Text>
            <Text className="text-slate-600 text-sm">{item.items.length} items • Rs {item.total}</Text>
            <Text className="text-xs text-slate-500 mt-1">{dayjs(item.createdAt).format('MMM D, h:mm A')}</Text>
          </Pressable>
        )}
      />
    </View>
  );
};
