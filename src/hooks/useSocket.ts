import { useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiMock } from '../services/apiMock';
import { getSocket } from '../services/socket';
import { useChatStore } from '../store/chatStore';
import { Message } from '../types/models';

export const useSocket = () => {
  const queryClient = useQueryClient();
  const { setSocketConnected } = useChatStore();

  /**
   * Keep a stable ref to pending queue so the socket effect doesn't
   * re-run every time the queue changes (which caused infinite loops).
   */
  const pendingQueueRef = useRef(useChatStore.getState().pendingQueue);
  const dequeueRef = useRef(useChatStore.getState().dequeueMessage);

  useEffect(() => {
    const unsubscribe = useChatStore.subscribe((state) => {
      pendingQueueRef.current = state.pendingQueue;
      dequeueRef.current = state.dequeueMessage;
    });
    return unsubscribe;
  }, []);

  const sendMutation = useMutation({
    mutationFn: ({ conversationId, text }: { conversationId: string; text: string }) =>
      apiMock.sendMessage(conversationId, text)
  });

  // Keep a stable ref for the mutation so the effect doesn't re-run
  const sendMutationRef = useRef(sendMutation);
  sendMutationRef.current = sendMutation;

  useEffect(() => {
    const socket = getSocket();

    const onConnect = async () => {
      setSocketConnected(true);
      // Flush any messages queued while offline
      const queue = [...pendingQueueRef.current];
      for (const pending of queue) {
        try {
          await sendMutationRef.current.mutateAsync({
            conversationId: pending.conversationId,
            text: pending.text
          });
          dequeueRef.current(pending.tempId);
        } catch {
          // If sending fails, leave in queue for next retry
          break;
        }
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
  }, [queryClient, setSocketConnected]);
};
