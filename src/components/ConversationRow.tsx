import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Conversation } from '../types/models';

dayjs.extend(relativeTime);

interface Props {
  item: Conversation;
  onPress: () => void;
}

const ConversationRowComponent = ({ item, onPress }: Props) => (
  <Pressable onPress={onPress} className="flex-row items-center px-4 py-3 border-b border-slate-100 bg-white">
    <Image
      source={item.avatar}
      style={{ width: 48, height: 48, borderRadius: 24 }}
      placeholder={{ uri: 'https://via.placeholder.com/48' }}
      transition={200}
    />
    <View className="ml-3 flex-1">
      <View className="flex-row justify-between items-center">
        <Text className={`font-semibold ${item.unreadCount > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
          {item.customerName}
        </Text>
        <Text className="text-xs text-slate-500">{dayjs(item.lastTimestamp).fromNow()}</Text>
      </View>
      <Text className={`${item.unreadCount > 0 ? 'text-slate-800 font-medium' : 'text-slate-600'}`} numberOfLines={1}>
        {item.lastMessage}
      </Text>
    </View>
    <View className="items-end ml-2">
      {item.unreadCount > 0 && (
        <View className="bg-blue-600 rounded-full min-w-[22px] items-center px-1.5 py-0.5 mb-1">
          <Text className="text-white text-xs font-semibold">{item.unreadCount}</Text>
        </View>
      )}
      {item.hasActiveOrder && (
        <View className="bg-emerald-50 rounded px-1.5 py-0.5">
          <Text className="text-[10px] text-emerald-600 font-medium">ACTIVE ORDER</Text>
        </View>
      )}
    </View>
  </Pressable>
);

export const ConversationRow = memo(ConversationRowComponent);
ConversationRow.displayName = 'ConversationRow';
