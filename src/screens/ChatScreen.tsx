import { FlashList } from '@shopify/flash-list';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MessageBubble } from '../components/MessageBubble';
import { RootStackParamList } from '../navigation/types';
import { apiMock } from '../services/apiMock';
import { useChatStore } from '../store/chatStore';
import { Message } from '../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export const ChatScreen = ({ route, navigation }: Props) => {
  const { conversationId, customerName, seedMessage } = route.params;
  const [text, setText] = useState('');
  const { enqueueMessage, isSocketConnected } = useChatStore();
  const queryClient = useQueryClient();

  const { data = [] } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => apiMock.fetchMessages(conversationId)
  });

  const sendMutation = useMutation({
    mutationFn: (payload: { conversationId: string; text: string }) => apiMock.sendMessage(payload.conversationId, payload.text),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] })
  });

  const onSend = async () => {
    if (!text.trim()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderType: 'business',
      text,
      timestamp: new Date().toISOString()
    };

    queryClient.setQueryData<Message[]>(['messages', conversationId], (old = []) => [...old, optimistic]);

    if (isSocketConnected) {
      await sendMutation.mutateAsync({ conversationId, text });
    } else {
      enqueueMessage({ conversationId, text, tempId: optimistic.id });
    }

    setText('');
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 py-3 border-b border-slate-200 flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-semibold">{customerName}</Text>
          <Text className="text-xs text-slate-500">Last active recently</Text>
        </View>
        <Pressable
          className="bg-emerald-600 rounded-lg px-3 py-2"
          onPress={() => navigation.navigate('CreateOrder', { conversationId, customerName, seedMessage })}
        >
          <Text className="text-white text-xs font-semibold">Create Order</Text>
        </Pressable>
      </View>

      <FlashList
        data={data}
        keyExtractor={(item) => item.id}
        estimatedItemSize={56}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
        renderItem={({ item }) => <MessageBubble item={item} />}
      />

      <View className="flex-row items-center px-3 py-3 border-t border-slate-200 bg-white gap-2">
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type message"
          className="flex-1 border border-slate-300 rounded-xl px-3 py-2"
        />
        <Pressable className="bg-blue-600 rounded-xl px-4 py-2" onPress={onSend}>
          <Text className="text-white font-semibold">Send</Text>
        </Pressable>
      </View>
    </View>
  );
};
