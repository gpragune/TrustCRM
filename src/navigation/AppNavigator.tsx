import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { MainTabParamList, RootStackParamList } from './types';
import { LoginScreen } from '../screens/LoginScreen';
import { InboxScreen } from '../screens/InboxScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { OrdersListScreen } from '../screens/OrdersListScreen';
import { OrderDetailsScreen } from '../screens/OrderDetailsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { CreateOrderScreen } from '../screens/CreateOrderScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const tabIcons: Record<keyof MainTabParamList, { active: string; inactive: string }> = {
  Inbox: { active: 'chatbubbles', inactive: 'chatbubbles-outline' },
  Orders: { active: 'receipt', inactive: 'receipt-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' }
};

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, focused }) => {
        const icons = tabIcons[route.name];
        return <Ionicons name={(focused ? icons.active : icons.inactive) as any} size={22} color={color} />;
      },
      tabBarActiveTintColor: '#2563eb',
      tabBarInactiveTintColor: '#94a3b8',
      tabBarStyle: {
        borderTopColor: '#e2e8f0',
        backgroundColor: '#ffffff',
        paddingBottom: 4,
        height: 56
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600'
      }
    })}
  >
    <Tab.Screen name="Inbox" component={InboxScreen} />
    <Tab.Screen name="Orders" component={OrdersListScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const { accessToken } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#0f172a',
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
          headerBackTitleVisible: false
        }}
      >
        {!accessToken ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={({ route }) => ({ title: route.params.customerName, headerShown: false })}
            />
            <Stack.Screen name="CreateOrder" component={CreateOrderScreen} options={{ title: 'Create Order' }} />
            <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ title: 'Order Details' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
