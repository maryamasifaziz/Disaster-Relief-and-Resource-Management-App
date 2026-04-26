import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser } from '@/src/types/api';

const TOKEN_KEY = 'dm_token';
const USER_KEY = 'dm_user';

export const tokenStorage = {
  async save(token: string, user: AuthUser) {
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, token),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
    ]);
  },
  async getToken() {
    return AsyncStorage.getItem(TOKEN_KEY);
  },
  async getUser() {
    const stored = await AsyncStorage.getItem(USER_KEY);
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  },
  async clear() {
    await Promise.all([AsyncStorage.removeItem(TOKEN_KEY), AsyncStorage.removeItem(USER_KEY)]);
  },
};

