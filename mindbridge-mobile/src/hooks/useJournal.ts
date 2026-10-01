import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const useJournal = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const cached = await AsyncStorage.getItem('dashboard_cache');
      if (cached) {
        const data = JSON.parse(cached);
        if (data.journalHistory && data.journalHistory.length > 0) {
          setEntries(data.journalHistory);
          setLoading(false);
        }
      }

      const response = await api.get('/journal');
      setEntries(response.data);
    } catch (error: any) {
      console.warn('Network timeout when fetching journal entries.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const saveEntry = async (entryData: any) => {
    try {
      const response = await api.post('/journal', entryData);
      setEntries(prev => [response.data, ...prev]);
      return response.data;
    } catch (error) {
      console.error('Error saving journal entry:', error);
      throw error;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await api.delete(`/journal/${id}`);
      setEntries(prev => prev.filter((e: any) => e.id !== id));
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      throw error;
    }
  };

  return { entries, loading, saveEntry, deleteEntry };
};
