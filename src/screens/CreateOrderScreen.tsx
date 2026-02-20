import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { apiMock } from '../services/apiMock';
import { OrderItem } from '../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateOrder'>;

export const CreateOrderScreen = ({ navigation, route }: Props) => {
  const { conversationId, customerName, seedMessage } = route.params;
  const [phone, setPhone] = useState('+94');
  const [address, setAddress] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (seedMessage) {
      apiMock.extractOrderDraft(seedMessage).then(setItems);
    }
  }, [seedMessage]);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.qty * item.price, 0), [items]);

  const createMutation = useMutation({
    mutationFn: () =>
      apiMock.createOrder({
        conversationId,
        customerName,
        customerPhone: phone,
        address,
        status: 'active',
        items
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      Alert.alert('Order created', 'Order is now active.');
      navigation.goBack();
    }
  });

  return (
    <ScrollView className="flex-1 bg-slate-50 px-4 py-4">
      <Text className="text-lg font-semibold mb-3">Customer Info</Text>
      <TextInput className="bg-white border border-slate-200 rounded-xl px-3 py-2 mb-2" value={customerName} editable={false} />
      <TextInput className="bg-white border border-slate-200 rounded-xl px-3 py-2 mb-2" value={phone} onChangeText={setPhone} placeholder="Phone" />
      <TextInput
        className="bg-white border border-slate-200 rounded-xl px-3 py-2 mb-4"
        value={address}
        onChangeText={setAddress}
        placeholder="Address"
      />

      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold">Items</Text>
        <Pressable
          className="border border-slate-300 rounded-lg px-3 py-2"
          onPress={() => setItems((prev) => [...prev, { name: 'New Item', qty: 1, notes: '', price: 0 }])}
        >
          <Text>Add item</Text>
        </Pressable>
      </View>

      {items.map((item, idx) => (
        <View key={`${item.name}-${idx}`} className="bg-white rounded-xl border border-slate-200 p-3 mb-2">
          <TextInput
            value={item.name}
            onChangeText={(value) => setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, name: value } : it)))}
            className="border border-slate-200 rounded-lg px-2 py-1 mb-2"
          />
          <View className="flex-row gap-2">
            <TextInput
              value={String(item.qty)}
              keyboardType="number-pad"
              onChangeText={(value) =>
                setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, qty: Number(value) || 1 } : it)))
              }
              className="flex-1 border border-slate-200 rounded-lg px-2 py-1"
            />
            <TextInput
              value={String(item.price)}
              keyboardType="number-pad"
              onChangeText={(value) =>
                setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, price: Number(value) || 0 } : it)))
              }
              className="flex-1 border border-slate-200 rounded-lg px-2 py-1"
            />
          </View>
        </View>
      ))}

      <Pressable
        className="border border-blue-300 rounded-xl py-3 items-center mt-2"
        onPress={async () => {
          const draft = await apiMock.extractOrderDraft(seedMessage ?? '');
          setItems(draft);
        }}
      >
        <Text className="text-blue-600 font-medium">Auto AI Extract</Text>
      </Pressable>

      <Pressable className="bg-emerald-600 rounded-xl py-3 items-center mt-3" onPress={() => createMutation.mutate()}>
        <Text className="text-white font-semibold">Confirm Order • Rs {total}</Text>
      </Pressable>
    </ScrollView>
  );
};
