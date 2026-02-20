import dayjs from 'dayjs';
import { memo } from 'react';
import { Text, View } from 'react-native';
import { Message } from '../types/models';

interface Props {
  item: Message;
}

export const MessageBubble = memo(({ item }: Props) => {
  const isBusiness = item.senderType === 'business';
  return (
    <View className={`px-3 py-2 my-1 max-w-[82%] rounded-2xl ${isBusiness ? 'self-end bg-blue-600' : 'self-start bg-slate-200'}`}>
      <Text className={isBusiness ? 'text-white' : 'text-slate-900'}>{item.text}</Text>
      <Text className={`text-[10px] mt-1 ${isBusiness ? 'text-blue-100' : 'text-slate-500'}`}>
        {dayjs(item.timestamp).format('h:mm A')}
      </Text>
    </View>
  );
});
