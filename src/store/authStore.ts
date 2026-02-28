import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { apiMock, LoginResult } from '../services/apiMock';

const ACCESS_KEY = 'chatorder.access';
const REFRESH_KEY = 'chatorder.refresh';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userEmail: string | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
}

const saveTokens = async (result: LoginResult) => {
  await SecureStore.setItemAsync(ACCESS_KEY, result.accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, result.refreshToken);
};

const applyLoginResult = (result: LoginResult) => ({
  accessToken: result.accessToken,
  refreshToken: result.refreshToken,
  userEmail: result.user.email
});

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  userEmail: null,
  isReady: false,

  login: async (email, password) => {
    const result = await apiMock.login(email, password);
    await saveTokens(result);
    set(applyLoginResult(result));
  },

  demoLogin: async () => {
    const result = await apiMock.demoLogin();
    await saveTokens(result);
    set(applyLoginResult(result));
  },

  hydrate: async () => {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        SecureStore.getItemAsync(ACCESS_KEY),
        SecureStore.getItemAsync(REFRESH_KEY)
      ]);
      set({ accessToken, refreshToken, isReady: true });
    } catch {
      // If secure store fails (e.g. first launch), just mark as ready
      set({ isReady: true });
    }
  },

  logout: async () => {
    await Promise.all([SecureStore.deleteItemAsync(ACCESS_KEY), SecureStore.deleteItemAsync(REFRESH_KEY)]);
    set({ accessToken: null, refreshToken: null, userEmail: null });
  }
}));
