import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiMock } from '../services/apiMock';
import { getSocket } from '../services/socket';
import { useChatStore } from '../store/chatStore';
import { Message } from '../types/models';

export const useSocket = () => {
  const queryClient = useQueryClient();
  const { pendingQueue, dequeueMessage, setSocketConnected } = useChatStore();

  const sendMutation = useMutation({
    mutationFn: ({ conversationId, text }: { conversationId: string; text: string }) =>
      apiMock.sendMessage(conversationId, text)
  });

  useEffect(() => {
    const socket = getSocket();

    const onConnect = async () => {
      setSocketConnected(true);
      for (const pending of pendingQueue) {
        await sendMutation.mutateAsync({ conversationId: pending.conversationId, text: pending.text });
        dequeueMessage(pending.tempId);
      }
    };

    const onDisconnect = () => setSocketConnected(false);

    const onNewMessage = (message: Message) => {
      queryClient.setQueryData<Message[]>(['messages', message.conversationId], (old = []) => [...old, message]);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('message:new', onNewMessage);
    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('message:new', onNewMessage);
      socket.disconnect();
    };
  }, [dequeueMessage, pendingQueue, queryClient, sendMutation, setSocketConnected]);
};
