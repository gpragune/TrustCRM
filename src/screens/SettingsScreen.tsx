import { useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { useAuthStore } from '../store/authStore';

export const SettingsScreen = () => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const { logout } = useAuthStore();

  return (
    <View className="flex-1 bg-slate-50 p-4">
      <View className="bg-white rounded-xl border border-slate-200 p-4 mb-3">
        <Text className="font-semibold mb-1">Connected Pages</Text>
        <Text className="text-slate-600">Main Page, Downtown Branch</Text>
      </View>
      <View className="bg-white rounded-xl border border-slate-200 p-4 mb-3 flex-row justify-between items-center">
        <Text className="font-semibold">Notifications</Text>
        <Switch value={pushEnabled} onValueChange={setPushEnabled} />
      </View>
      <View className="bg-white rounded-xl border border-slate-200 p-4 mb-3">
        <Text className="font-semibold">Business info</Text>
        <Text className="text-slate-600">ChatOrder Demo Store</Text>
      </View>
      <Pressable className="bg-red-600 rounded-xl py-3 items-center" onPress={logout}>
        <Text className="text-white font-semibold">Logout</Text>
      </Pressable>
    </View>
  );
};
