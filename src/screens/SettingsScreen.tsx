import { useCallback, useState } from 'react';
import { Alert, Pressable, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';

export const SettingsScreen = () => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const { logout, userEmail } = useAuthStore();

  const onLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout }
    ]);
  }, [logout]);

  return (
    <View className="flex-1 bg-slate-50 p-4">
      {/* Account */}
      <Text className="text-xs text-slate-500 font-medium mb-2 px-1">ACCOUNT</Text>
      <View className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
            <Ionicons name="person" size={20} color="#2563eb" />
          </View>
          <View>
            <Text className="font-semibold text-slate-900">ChatOrder Demo Store</Text>
            {userEmail && <Text className="text-slate-500 text-sm">{userEmail}</Text>}
          </View>
        </View>
      </View>

      {/* Pages */}
      <Text className="text-xs text-slate-500 font-medium mb-2 px-1">CONNECTED PAGES</Text>
      <View className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
        <View className="flex-row items-center mb-2">
          <Ionicons name="logo-facebook" size={18} color="#1877f2" style={{ marginRight: 8 }} />
          <Text className="text-slate-700">Main Page</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="logo-facebook" size={18} color="#1877f2" style={{ marginRight: 8 }} />
          <Text className="text-slate-700">Downtown Branch</Text>
        </View>
      </View>

      {/* Preferences */}
      <Text className="text-xs text-slate-500 font-medium mb-2 px-1">PREFERENCES</Text>
      <View className="bg-white rounded-xl border border-slate-200 mb-4">
        <View className="p-4 flex-row justify-between items-center border-b border-slate-100">
          <View className="flex-row items-center">
            <Ionicons name="notifications-outline" size={18} color="#334155" style={{ marginRight: 8 }} />
            <Text className="font-medium text-slate-900">Push Notifications</Text>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
            thumbColor={pushEnabled ? '#2563eb' : '#cbd5e1'}
          />
        </View>
        <Pressable className="p-4 flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Ionicons name="language-outline" size={18} color="#334155" style={{ marginRight: 8 }} />
            <Text className="font-medium text-slate-900">Language</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-slate-500 mr-1">English</Text>
            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
          </View>
        </Pressable>
      </View>

      {/* App info */}
      <Text className="text-xs text-slate-500 font-medium mb-2 px-1">ABOUT</Text>
      <View className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-slate-700">Version</Text>
          <Text className="text-slate-500">1.0.0</Text>
        </View>
      </View>

      {/* Logout */}
      <Pressable className="bg-red-600 rounded-xl py-3 items-center flex-row justify-center" onPress={onLogout}>
        <Ionicons name="log-out-outline" size={18} color="#ffffff" style={{ marginRight: 6 }} />
        <Text className="text-white font-semibold">Logout</Text>
      </Pressable>
    </View>
  );
};
