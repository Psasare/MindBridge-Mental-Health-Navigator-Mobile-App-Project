import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import Constants from 'expo-constants';

const configuredUrl = process.env.EXPO_PUBLIC_API_URL;
let API_URL = configuredUrl || 'http://localhost:5000/api';

// Dynamically pick up the local network IP when running in Expo development on a physical device,
// only if no custom non-localhost URL was explicitly configured
const debuggerHost = Constants.expoConfig?.hostUri;
if (__DEV__ && debuggerHost && (!configuredUrl || configuredUrl.includes('localhost') || configuredUrl.includes('127.0.0.1'))) {
  const localIp = debuggerHost.split(':')[0];
  API_URL = `http://${localIp}:5000/api`;
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15s timeout to prevent indefinite screen hangs
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
