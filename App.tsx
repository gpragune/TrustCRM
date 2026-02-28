import './global.css';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';
import { useSocket } from './src/hooks/useSocket';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30 seconds before data is considered stale
      retry: 2,
      refetchOnWindowFocus: false
    },
    mutations: {
      retry: 1
    }
  }
});

const AppBody = () => {
  const { hydrate, isReady } = useAuthStore();
  useSocket();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return <AppNavigator />;
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AppBody />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
