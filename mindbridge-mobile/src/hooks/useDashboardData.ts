import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { Pedometer } from 'expo-sensors';

export const useDashboardData = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState(0);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // 1. Try Cache First for Instant UI Loading
      const cached = await AsyncStorage.getItem('dashboard_cache');
      if (cached) {
        setData(JSON.parse(cached));
        setLoading(false); 
      }
      
      // 2. Fetch Fresh Data
      const response = await api.get('/dashboard');
      setData(response.data);
      
      // 3. Update Cache
      await AsyncStorage.setItem('dashboard_cache', JSON.stringify(response.data));
    } catch (err: any) {
      setError(err.message);
      console.warn('Network timeout when fetching dashboard data, using cache if available.');
    } finally {
      setLoading(false);
    }
  }, []);

  const initPedometer = useCallback(async () => {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (isAvailable) {
        const end = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const result = await Pedometer.getStepCountAsync(start, end);
        if (result) {
          setSteps(result.steps);
        }
      }
    } catch (err) {
      console.log('Pedometer not available or permission denied', err);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    initPedometer();
  }, [fetchDashboardData, initPedometer]);

  return { data, loading, error, steps, refetch: fetchDashboardData };
};
