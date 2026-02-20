import dayjs from 'dayjs';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Conversation } from '../types/models';

interface Props {
  item: Conversation;
  onPress: () => void;
}

export const ConversationRow = memo(({ item, onPress }: Props) => (
  <Pressable onPress={onPress} className="flex-row items-center px-4 py-3 border-b border-slate-100 bg-white">
    <Image source={item.avatar} style={{ width: 48, height: 48, borderRadius: 24 }} />
    <View className="ml-3 flex-1">
      <View className="flex-row justify-between items-center">
        <Text className="font-semibold text-slate-900">{item.customerName}</Text>
        <Text className="text-xs text-slate-500">{dayjs(item.lastTimestamp).format('h:mm A')}</Text>
      </View>
      <Text className="text-slate-600" numberOfLines={1}>
        {item.lastMessage}
      </Text>
    </View>
    <View className="items-end ml-2">
      {item.unreadCount > 0 && (
        <View className="bg-blue-600 rounded-full px-2 py-1 mb-1">
          <Text className="text-white text-xs">{item.unreadCount}</Text>
        </View>
      )}
      {item.hasActiveOrder && <Text className="text-[10px] text-emerald-600 font-medium">ACTIVE ORDER</Text>}
    </View>
  </Pressable>
));
