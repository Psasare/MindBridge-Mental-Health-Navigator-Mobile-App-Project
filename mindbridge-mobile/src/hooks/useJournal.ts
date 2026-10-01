import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const useJournal = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

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
      setEntries(response.data.data);
      setNextCursor(response.data.nextCursor);
      setHasMore(!!response.data.nextCursor);
    } catch (error: any) {
      console.warn('Network timeout when fetching journal entries.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNextPage = useCallback(async () => {
    if (!hasMore || loadingMore || !nextCursor) return;
    
    setLoadingMore(true);
    try {
      const response = await api.get(`/journal?cursor=${nextCursor}`);
      setEntries(prev => [...prev, ...response.data.data]);
      setNextCursor(response.data.nextCursor);
      setHasMore(!!response.data.nextCursor);
    } catch (error) {
      console.warn('Error fetching more journal entries:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, nextCursor]);

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

  return { entries, loading, loadingMore, hasMore, saveEntry, deleteEntry, fetchNextPage };
};
