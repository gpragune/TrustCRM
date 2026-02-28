import { FlashList } from '@shopify/flash-list';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useCallback, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
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
  const [isSending, setIsSending] = useState(false);
  const { enqueueMessage, isSocketConnected } = useChatStore();
  const queryClient = useQueryClient();
  const listRef = useRef<FlashList<Message>>(null);

  const { data = [] } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => apiMock.fetchMessages(conversationId)
  });

  const sendMutation = useMutation({
    mutationFn: (payload: { conversationId: string; text: string }) =>
      apiMock.sendMessage(payload.conversationId, payload.text),
    onSuccess: (serverMessage) => {
      // Reconcile optimistic message with server response
      queryClient.setQueryData<Message[]>(['messages', conversationId], (old = []) =>
        old.map((msg) => (msg.id.startsWith('temp-') && msg.text === serverMessage.text ? serverMessage : msg))
      );
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (_error, variables) => {
      // Remove failed optimistic message
      queryClient.setQueryData<Message[]>(['messages', conversationId], (old = []) =>
        old.filter((msg) => !(msg.id.startsWith('temp-') && msg.text === variables.text))
      );
    }
  });

  const onSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderType: 'business',
      text: trimmed,
      timestamp: new Date().toISOString()
    };

    // Optimistic update
    queryClient.setQueryData<Message[]>(['messages', conversationId], (old = []) => [...old, optimistic]);
    setText('');

    if (isSocketConnected) {
      try {
        await sendMutation.mutateAsync({ conversationId, text: trimmed });
      } catch {
        // Error handled in mutation's onError
      }
    } else {
      enqueueMessage({ conversationId, text: trimmed, tempId: optimistic.id });
    }

    setIsSending(false);
  }, [text, isSending, conversationId, isSocketConnected, queryClient, sendMutation, enqueueMessage]);

  const navigateToCreateOrder = useCallback(() => {
    navigation.navigate('CreateOrder', { conversationId, customerName, seedMessage });
  }, [navigation, conversationId, customerName, seedMessage]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View className="flex-1 bg-white">
        {/* Chat header */}
        <View className="px-4 py-3 border-b border-slate-200 flex-row justify-between items-center">
          <View>
            <Text className="text-lg font-semibold">{customerName}</Text>
            <Text className="text-xs text-slate-500">Last active recently</Text>
          </View>
          <Pressable className="bg-emerald-600 rounded-lg px-3 py-2" onPress={navigateToCreateOrder}>
            <Text className="text-white text-xs font-semibold">Create Order</Text>
          </Pressable>
        </View>

        {/* Messages */}
        <FlashList
          ref={listRef}
          data={data}
          keyExtractor={(item) => item.id}
          estimatedItemSize={56}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
          renderItem={({ item }) => <MessageBubble item={item} />}
          onContentSizeChange={() => {
            if (data.length > 0) {
              listRef.current?.scrollToEnd({ animated: true });
            }
          }}
        />

        {/* Input bar */}
        <View className="flex-row items-center px-3 py-3 border-t border-slate-200 bg-white gap-2">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type message"
            placeholderTextColor="#94a3b8"
            className="flex-1 border border-slate-300 rounded-xl px-3 py-2"
            multiline
            maxLength={2000}
            editable={!isSending}
          />
          <Pressable
            className={`rounded-xl px-4 py-2 ${!text.trim() || isSending ? 'bg-blue-400' : 'bg-blue-600'}`}
            onPress={onSend}
            disabled={!text.trim() || isSending}
          >
            <Text className="text-white font-semibold">Send</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
