import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  // For Android Emulator use: http://10.0.2.2:5000/api
  // For iOS Simulator or Web use: http://localhost:5000/api
  // For Physical Device, use your computer's local IP (e.g., http://192.168.1.X:5000/api)
  baseURL: 'http://172.20.10.3:5000/api', 
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
      // Handle session expiry (e.g., clear token, redirect to login)
      await AsyncStorage.removeItem('userToken');
      // A full implementation would dispatch an event or use a ref to navigate
      console.warn('Session expired. Please log in again.');
    }
    return Promise.reject(error);
  }
);

export default api;
