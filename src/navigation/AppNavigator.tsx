import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList } from './types';
import { LoginScreen } from '../screens/LoginScreen';
import { InboxScreen } from '../screens/InboxScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { OrdersListScreen } from '../screens/OrdersListScreen';
import { OrderDetailsScreen } from '../screens/OrderDetailsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { CreateOrderScreen } from '../screens/CreateOrderScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen
      name="Inbox"
      component={InboxScreen}
      options={{ tabBarIcon: ({ color }) => <Ionicons name="chatbubbles-outline" size={18} color={color} /> }}
    />
    <Tab.Screen
      name="Orders"
      component={OrdersListScreen}
      options={{ tabBarIcon: ({ color }) => <Ionicons name="receipt-outline" size={18} color={color} /> }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={18} color={color} /> }}
    />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const { accessToken } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!accessToken ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="CreateOrder" component={CreateOrderScreen} options={{ title: 'Create Order' }} />
            <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ title: 'Order Details' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
