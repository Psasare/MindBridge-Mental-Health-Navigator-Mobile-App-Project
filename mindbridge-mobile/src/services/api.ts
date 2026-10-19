import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import Constants from 'expo-constants';

let API_URL = process.env.EXPO_PUBLIC_API_URL;

// If not explicitly configured in .env, dynamically derive from Metro hostUri
if (!API_URL) {
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (__DEV__ && debuggerHost) {
    const localIp = debuggerHost.split(':')[0];
    API_URL = `http://${localIp}:5000/api`;
  } else {
    API_URL = 'http://localhost:5000/api';
  }
}

console.log('[API] Resolved baseURL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30s timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      const token = await AsyncStorage.getItem('userToken');
      if (token && token.startsWith('guest')) {
        // Guest users are expected to fail auth routes, don't sign them out
        return Promise.reject(error);
      }

      // Handle session expiry (e.g., clear token, redirect to login)
      await AsyncStorage.removeItem('userToken');
      // Dispatch an event so AuthContext can cleanly sign out
      console.warn('Session expired. Please log in again.');
      DeviceEventEmitter.emit('session_expired');
    }
    return Promise.reject(error);
  }
);

export default api;
