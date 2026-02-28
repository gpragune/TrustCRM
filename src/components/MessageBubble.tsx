import dayjs from 'dayjs';
import { memo } from 'react';
import { Text, View } from 'react-native';
import { Message } from '../types/models';

interface Props {
  item: Message;
}

const MessageBubbleComponent = ({ item }: Props) => {
  const isBusiness = item.senderType === 'business';
  const isOptimistic = item.id.startsWith('temp-');

  return (
    <View
      className={`px-3 py-2 my-1 max-w-[82%] rounded-2xl ${isBusiness ? 'self-end bg-blue-600' : 'self-start bg-slate-200'
        }`}
      style={isOptimistic ? { opacity: 0.7 } : undefined}
    >
      <Text className={isBusiness ? 'text-white' : 'text-slate-900'}>{item.text}</Text>
      <View className="flex-row items-center justify-end mt-1">
        <Text className={`text-[10px] ${isBusiness ? 'text-blue-100' : 'text-slate-500'}`}>
          {dayjs(item.timestamp).format('h:mm A')}
        </Text>
        {isOptimistic && (
          <Text className="text-[10px] text-blue-200 ml-1">• Sending</Text>
        )}
      </View>
    </View>
  );
};

export const MessageBubble = memo(MessageBubbleComponent);
MessageBubble.displayName = 'MessageBubble';
