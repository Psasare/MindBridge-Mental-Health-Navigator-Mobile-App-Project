import { useState, useCallback, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { queryClient } from '../lib/queryClient';
import { Pedometer } from 'expo-sensors';
import { CircleDashed, Flower2, Leaf, Sun } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';

const getGrowthStage = (count: number) => {
  if (count >= 20) return { label: 'Ancient Tree', icon: Flower2, color: '#8B5CF6' };
  if (count >= 14) return { label: 'Full Bloom', icon: Flower2, color: '#7B61FF' };
  if (count >= 8) return { label: 'Healthy Plant', icon: Leaf, color: '#34D399' };
  if (count >= 4) return { label: 'Sprouting', icon: Sun, color: '#FBBF24' };
  if (count >= 1) return { label: 'New Seed', icon: Leaf, color: '#60A5FA' };
  return { label: 'Empty Garden', icon: CircleDashed, color: '#94A3B8' };
};

export const useDashboardData = () => {
  const { userData: authData } = useContext(AuthContext) as any;
  const [stepCount, setStepCount] = useState<number | null>(null);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['dashboard', 'aggregate', authData?.id || 'current'],
    queryFn: async () => {
      const response = await api.get('/dashboard/aggregate');
      return response.data;
    },
    initialData: () => {
      const targetId = authData?.id || 'current';
      const cached = queryClient.getQueryData(['dashboard', 'aggregate', targetId]);
      if (cached) return cached;
      if (authData?.latestReflection || authData?.latestMood || authData?.name) {
        return {
          oracleContext: {
            latestMood: authData?.latestMood || null,
            moodCount: authData?.latestMood ? 1 : 0,
            recentJournal: authData?.latestReflection ? [authData.latestReflection] : [],
            journalCount: authData?.latestReflection ? 1 : 0,
            onboarding: authData?.onboarding || null,
            userName: authData?.name || 'Friend',
            history: [],
            assessments: [],
            latestCommunityPost: null,
            dbStatus: 'online'
          },
          moodHistory: authData?.latestMood ? [authData.latestMood] : [],
          proactiveInsights: {
            dashboardPrompt: "How are you feeling right now?",
            suggestedResources: [{ id: 'res-fallback', title: 'Daily Mindfulness Practice', type: 'audio', category: 'General' }]
          },
          gamification: { totalPoints: authData?.points || 0, currentStreak: authData?.streak || 0 },
          dailyGoals: { goals: [], completedIds: [] }
        };
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 3, // 3 minutes fresh
    gcTime: 1000 * 60 * 60 * 24, // keep in cache for 24 hours
    placeholderData: (previousData) => previousData,
    retry: 1
  });

  const initPedometer = useCallback(async () => {
    try {
      const isAvailable = await Pedometer.isAvailableAsync().catch(() => false);
      if (!isAvailable) return;

      const { status } = await Pedometer.getPermissionsAsync().catch(() => ({ status: 'denied' }));
      if (status === 'granted') {
        const end = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const result = await Pedometer.getStepCountAsync(start, end).catch(() => null);
        if (result) {
          setStepCount(result.steps);
        }
      }
    } catch {
      // Gracefully ignore on environments without pedometer support
    }
  }, []);

  const logs = useMemo(() => {
    if (data?.oracleContext?.recentJournal && data.oracleContext.recentJournal.length > 0) {
      return data.oracleContext.recentJournal;
    }
    if (authData?.latestReflection) {
      return [authData.latestReflection];
    }
    return [];
  }, [data?.oracleContext?.recentJournal, authData?.latestReflection]);
  
  const gardenStats = useMemo(() => {
    const growth = getGrowthStage(logs.length);
    return { count: logs.length, stage: growth.label, icon: growth.icon, color: growth.color };
  }, [logs.length]);
  
  const rituals = useMemo(() => {
    const todayStr = new Date().toDateString();
    const mood = data?.oracleContext?.latestMood || authData?.latestMood;
    return {
      garden: Boolean(mood && new Date(mood.createdAt).toDateString() === todayStr),
      journal: logs.some((log: any) => new Date(log.createdAt).toDateString() === todayStr),
      breathing: false 
    };
  }, [data?.oracleContext?.latestMood, authData?.latestMood, logs]);

  const userData = useMemo(() => ({
    name: data?.oracleContext?.onboarding?.firstName || data?.oracleContext?.userName || authData?.name || 'Friend', 
    language: 'English', 
    streak: data?.gamification?.currentStreak ?? authData?.streak ?? 0 
  }), [data?.oracleContext?.onboarding?.firstName, data?.oracleContext?.userName, authData?.name, authData?.streak, data?.gamification?.currentStreak]);
  
  return {
    rituals,
    moodHistory: data?.moodHistory || (authData?.latestMood ? [authData.latestMood] : []),
    journalHistory: logs,
    chatHistory: data?.oracleContext?.history || [],
    assessments: data?.oracleContext?.assessments || [],
    latestPost: data?.oracleContext?.latestCommunityPost || null,
    suggestedResources: data?.proactiveInsights?.suggestedResources || [],
    gardenStats,
    userData,
    stepCount,
    recentLocation: (data?.oracleContext?.latestMood || authData?.latestMood)?.location || null,
    aiPrompt: data?.proactiveInsights?.dashboardPrompt || null,
    microGoals: data?.proactiveInsights?.microGoals || [],
    actionableCopingMechanisms: data?.proactiveInsights?.actionableCopingMechanisms || [],
    insightSeverity: data?.proactiveInsights?.severity || 'mild',
    isLoading: isLoading && !data && !authData?.name,
    isFetching,
    hasData: Boolean(data) || Boolean(authData?.name),
    dailyGoals: data?.dailyGoals?.goals || [],
    completedGoalIds: data?.dailyGoals?.completedIds || [],
    gamification: data?.gamification || { totalPoints: authData?.points || 0, currentStreak: authData?.streak || 0 },
    checkStatus: refetch,
    initPedometer,
  };
};
