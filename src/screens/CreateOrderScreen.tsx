import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { apiMock } from '../services/apiMock';
import { OrderItem } from '../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateOrder'>;

export const CreateOrderScreen = ({ navigation, route }: Props) => {
  const { conversationId, customerName, seedMessage } = route.params;
  const [phone, setPhone] = useState('+94');
  const [address, setAddress] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (seedMessage) {
      setIsExtracting(true);
      apiMock
        .extractOrderDraft(seedMessage)
        .then(setItems)
        .finally(() => setIsExtracting(false));
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
    },
    onError: (error) => {
      Alert.alert('Failed to create order', error instanceof Error ? error.message : 'Unknown error');
    }
  });

  const addItem = useCallback(() => {
    setItems((prev) => [...prev, { name: '', qty: 1, notes: '', price: 0 }]);
  }, []);

  const removeItem = useCallback((idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const updateItem = useCallback((idx: number, field: keyof OrderItem, value: string | number) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  }, []);

  const onAutoExtract = useCallback(async () => {
    setIsExtracting(true);
    try {
      const draft = await apiMock.extractOrderDraft(seedMessage ?? '');
      setItems(draft);
    } catch {
      Alert.alert('Extraction failed', 'Could not extract order items from the message.');
    } finally {
      setIsExtracting(false);
    }
  }, [seedMessage]);

  const onConfirm = useCallback(() => {
    if (items.length === 0) {
      Alert.alert('No items', 'Please add at least one item to the order.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Missing address', 'Please enter a delivery address.');
      return;
    }
    const hasEmptyName = items.some((it) => !it.name.trim());
    if (hasEmptyName) {
      Alert.alert('Invalid items', 'All items must have a name.');
      return;
    }
    createMutation.mutate();
  }, [items, address, createMutation]);

  const isSubmitting = createMutation.isPending;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView className="flex-1 bg-slate-50 px-4 py-4" keyboardShouldPersistTaps="handled">
        {/* Customer Info */}
        <Text className="text-lg font-semibold mb-3">Customer Info</Text>
        <TextInput
          className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 mb-2 text-slate-600"
          value={customerName}
          editable={false}
        />
        <TextInput
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 mb-2"
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone"
          placeholderTextColor="#94a3b8"
          keyboardType="phone-pad"
          editable={!isSubmitting}
        />
        <TextInput
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 mb-4"
          value={address}
          onChangeText={setAddress}
          placeholder="Delivery address"
          placeholderTextColor="#94a3b8"
          editable={!isSubmitting}
        />

        {/* Items header */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold">Items ({items.length})</Text>
          <Pressable
            className="border border-slate-300 rounded-lg px-3 py-2 flex-row items-center"
            onPress={addItem}
            disabled={isSubmitting}
          >
            <Ionicons name="add-outline" size={16} color="#334155" style={{ marginRight: 4 }} />
            <Text className="text-slate-700">Add item</Text>
          </Pressable>
        </View>

        {/* Loading state for AI extraction */}
        {isExtracting && (
          <View className="items-center py-4">
            <ActivityIndicator size="small" color="#2563eb" />
            <Text className="text-slate-500 text-sm mt-2">Extracting items from message…</Text>
          </View>
        )}

        {/* Items list */}
        {items.map((item, idx) => (
          <View key={`item-${idx}`} className="bg-white rounded-xl border border-slate-200 p-3 mb-2">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs text-slate-500 font-medium">ITEM {idx + 1}</Text>
              <Pressable onPress={() => removeItem(idx)} disabled={isSubmitting} hitSlop={8}>
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </Pressable>
            </View>
            <TextInput
              value={item.name}
              onChangeText={(value) => updateItem(idx, 'name', value)}
              placeholder="Item name"
              placeholderTextColor="#94a3b8"
              className="border border-slate-200 rounded-lg px-2 py-1 mb-2"
              editable={!isSubmitting}
            />
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Text className="text-xs text-slate-500 mb-1">Qty</Text>
                <TextInput
                  value={String(item.qty)}
                  keyboardType="number-pad"
                  onChangeText={(value) => updateItem(idx, 'qty', Number(value) || 1)}
                  className="border border-slate-200 rounded-lg px-2 py-1"
                  editable={!isSubmitting}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-slate-500 mb-1">Price (Rs)</Text>
                <TextInput
                  value={String(item.price)}
                  keyboardType="number-pad"
                  onChangeText={(value) => updateItem(idx, 'price', Number(value) || 0)}
                  className="border border-slate-200 rounded-lg px-2 py-1"
                  editable={!isSubmitting}
                />
              </View>
            </View>
            <TextInput
              value={item.notes ?? ''}
              onChangeText={(value) => updateItem(idx, 'notes', value)}
              placeholder="Notes (optional)"
              placeholderTextColor="#94a3b8"
              className="border border-slate-200 rounded-lg px-2 py-1 mt-2"
              editable={!isSubmitting}
            />
          </View>
        ))}

        {/* Empty items state */}
        {items.length === 0 && !isExtracting && (
          <View className="items-center py-6">
            <Ionicons name="cart-outline" size={36} color="#94a3b8" />
            <Text className="text-slate-500 text-center mt-2">No items yet. Add items manually or use AI extract.</Text>
          </View>
        )}

        {/* AI Extract button */}
        <Pressable
          className={`border rounded-xl py-3 items-center mt-2 flex-row justify-center ${isExtracting ? 'border-blue-200' : 'border-blue-300'}`}
          onPress={onAutoExtract}
          disabled={isExtracting || isSubmitting}
        >
          {isExtracting ? (
            <ActivityIndicator size="small" color="#2563eb" />
          ) : (
            <>
              <Ionicons name="sparkles-outline" size={16} color="#2563eb" style={{ marginRight: 6 }} />
              <Text className="text-blue-600 font-medium">Auto AI Extract</Text>
            </>
          )}
        </Pressable>

        {/* Submit */}
        <Pressable
          className={`rounded-xl py-3 items-center mt-3 mb-6 ${isSubmitting ? 'bg-emerald-400' : 'bg-emerald-600'}`}
          onPress={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text className="text-white font-semibold">Confirm Order • Rs {total.toLocaleString()}</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
