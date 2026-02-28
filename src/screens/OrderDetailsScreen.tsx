import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { RootStackParamList } from '../navigation/types';
import { apiMock } from '../services/apiMock';
import { OrderStatus } from '../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetails'>;

const timeline = ['Created', 'Confirmed', 'Preparing', 'Ready', 'Delivered'];

const statusActions: { label: string; status: OrderStatus; color: string; icon: string }[] = [
  { label: 'Mark Completed', status: 'completed', color: 'bg-emerald-600', icon: 'checkmark-circle-outline' },
  { label: 'Cancel Order', status: 'cancelled', color: 'bg-red-600', icon: 'close-circle-outline' }
];

export const OrderDetailsScreen = ({ route, navigation }: Props) => {
  const { orderId } = route.params;
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: apiMock.fetchOrders,
    select: (orders) => orders.find((item) => item.id === orderId)
  });

  const mutation = useMutation({
    mutationFn: (status: OrderStatus) => apiMock.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      Alert.alert('Status updated', 'Order status has been updated.');
    },
    onError: (error) => {
      Alert.alert('Update failed', error instanceof Error ? error.message : 'Unknown error');
    }
  });

  const onStatusChange = useCallback(
    (label: string, status: OrderStatus) => {
      Alert.alert(`${label}?`, `Are you sure you want to ${label.toLowerCase()} this order?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => mutation.mutate(status) }
      ]);
    },
    [mutation]
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-8">
        <Ionicons name="alert-circle-outline" size={48} color="#94a3b8" />
        <Text className="text-slate-500 text-center mt-3">Order not found</Text>
      </View>
    );
  }

  const isActive = order.status === 'active';

  return (
    <ScrollView className="flex-1 bg-slate-50 p-4">
      {/* Order header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-slate-900">Order #{order.id}</Text>
        <View
          className={`px-3 py-1 rounded-full ${order.status === 'active'
              ? 'bg-emerald-100'
              : order.status === 'completed'
                ? 'bg-blue-100'
                : 'bg-red-100'
            }`}
        >
          <Text
            className={`text-xs font-semibold ${order.status === 'active'
                ? 'text-emerald-700'
                : order.status === 'completed'
                  ? 'text-blue-700'
                  : 'text-red-700'
              }`}
          >
            {order.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Customer info */}
      <View className="bg-white rounded-xl border border-slate-200 p-4 mb-3">
        <Text className="text-xs text-slate-500 font-medium mb-2">CUSTOMER</Text>
        <Text className="font-semibold text-slate-900 mb-1">{order.customerName}</Text>
        {order.customerPhone && (
          <Text className="text-slate-600 text-sm mb-1">📞 {order.customerPhone}</Text>
        )}
        <Text className="text-slate-600 text-sm">📍 {order.address}</Text>
      </View>

      {/* Order items */}
      <View className="bg-white rounded-xl border border-slate-200 p-4 mb-3">
        <Text className="text-xs text-slate-500 font-medium mb-3">ORDER ITEMS</Text>
        {order.items.map((item, idx) => (
          <View
            key={`${item.name}-${idx}`}
            className={`flex-row justify-between items-center py-2 ${idx < order.items.length - 1 ? 'border-b border-slate-100' : ''}`}
          >
            <View className="flex-1">
              <Text className="font-medium text-slate-900">{item.name}</Text>
              {item.notes ? <Text className="text-xs text-slate-500">{item.notes}</Text> : null}
            </View>
            <Text className="text-slate-600 text-sm mx-2">×{item.qty}</Text>
            <Text className="font-medium text-slate-900">Rs {(item.qty * item.price).toLocaleString()}</Text>
          </View>
        ))}
        <View className="border-t border-slate-200 mt-2 pt-2 flex-row justify-between">
          <Text className="font-bold text-slate-900">Total</Text>
          <Text className="font-bold text-slate-900">Rs {order.total.toLocaleString()}</Text>
        </View>
      </View>

      {/* Timeline */}
      <View className="bg-white rounded-xl border border-slate-200 p-4 mb-3">
        <Text className="text-xs text-slate-500 font-medium mb-3">TIMELINE</Text>
        {timeline.map((step, idx) => {
          const isCompleted = idx < 2; // Mock: first 2 steps completed
          return (
            <View key={step} className="flex-row items-center py-1.5">
              <View
                className={`w-5 h-5 rounded-full items-center justify-center mr-3 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                {isCompleted && <Ionicons name="checkmark" size={12} color="#ffffff" />}
              </View>
              <Text className={isCompleted ? 'text-emerald-700 font-medium' : 'text-slate-500'}>{step}</Text>
            </View>
          );
        })}
        <Text className="text-xs text-slate-400 mt-2">
          Created {dayjs(order.createdAt).format('MMM D, YYYY [at] h:mm A')}
        </Text>
      </View>

      {/* Actions */}
      {isActive && (
        <View className="mb-3">
          {statusActions.map((action) => (
            <Pressable
              key={action.status}
              className={`${action.color} rounded-xl py-3 items-center mb-2 flex-row justify-center`}
              onPress={() => onStatusChange(action.label, action.status)}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name={action.icon as any} size={18} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text className="text-white font-semibold">{action.label}</Text>
                </>
              )}
            </Pressable>
          ))}
        </View>
      )}

      {/* Contact actions */}
      <Pressable
        className="border border-slate-300 rounded-xl py-3 items-center mb-2 flex-row justify-center"
        onPress={() =>
          navigation.navigate('Chat', { conversationId: order.conversationId, customerName: order.customerName })
        }
      >
        <Ionicons name="chatbubble-outline" size={16} color="#334155" style={{ marginRight: 6 }} />
        <Text className="text-slate-700 font-medium">Message Customer</Text>
      </Pressable>
      <Pressable
        className="border border-slate-300 rounded-xl py-3 items-center mb-6 flex-row justify-center"
        onPress={() => Alert.alert('Call', `Calling ${order.customerPhone ?? 'customer'}…`)}
      >
        <Ionicons name="call-outline" size={16} color="#334155" style={{ marginRight: 6 }} />
        <Text className="text-slate-700 font-medium">Call Customer</Text>
      </Pressable>
    </ScrollView>
  );
};
