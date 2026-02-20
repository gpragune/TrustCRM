import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Pressable, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { apiMock } from '../services/apiMock';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetails'>;

const timeline = ['Created', 'Confirmed', 'Preparing', 'Ready', 'Delivered'];

export const OrderDetailsScreen = ({ route }: Props) => {
  const { orderId } = route.params;
  const queryClient = useQueryClient();
  const { data: order } = useQuery({
    queryKey: ['orders'],
    queryFn: apiMock.fetchOrders,
    select: (orders) => orders.find((item) => item.id === orderId)
  });

  const mutation = useMutation({
    mutationFn: (status: 'active' | 'completed' | 'cancelled') => apiMock.updateOrderStatus(orderId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] })
  });

  if (!order) return <View className="flex-1 items-center justify-center"><Text>Order not found</Text></View>;

  return (
    <View className="flex-1 bg-slate-50 p-4">
      <Text className="text-xl font-bold mb-3">Order #{order.id}</Text>
      <View className="bg-white rounded-xl border border-slate-200 p-4 mb-3">
        {timeline.map((item, idx) => (
          <Text key={item} className={`py-1 ${idx < 2 ? 'text-emerald-700' : 'text-slate-500'}`}>
            {idx + 1}. {item}
          </Text>
        ))}
      </View>
      <Pressable className="bg-blue-600 rounded-xl py-3 items-center mb-2" onPress={() => mutation.mutate('completed')}>
        <Text className="text-white">Change status</Text>
      </Pressable>
      <Pressable className="border border-slate-300 rounded-xl py-3 items-center mb-2" onPress={() => Alert.alert('Message customer')}>
        <Text>Message customer</Text>
      </Pressable>
      <Pressable className="border border-slate-300 rounded-xl py-3 items-center" onPress={() => Alert.alert('Call customer')}>
        <Text>Call customer</Text>
      </Pressable>
    </View>
  );
};
